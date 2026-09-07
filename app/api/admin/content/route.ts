import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { conferenceId, slug, sections, footer, faviconUrl } = await request.json();

    let targetConfId = conferenceId;
    if (!targetConfId && slug) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const conf = await prisma.conference.findFirst({
        where: isUUID
          ? { OR: [{ id: slug }, { slug: { equals: slug, mode: "insensitive" } }], deletedAt: null }
          : { slug: { equals: slug, mode: "insensitive" }, deletedAt: null }
      });
      targetConfId = conf?.id;
    }

    if (!targetConfId) {
      return NextResponse.json({ error: "Conference not found in database" }, { status: 404 });
    }



    // Save page_content_home setting (all sections array with visibility and fields)
    if (sections) {
      await prisma.systemSetting.upsert({
        where: {
          conferenceId_key: {
            conferenceId: targetConfId,
            key: "page_content_home"
          }
        },
        update: {
          value: sections
        },
        create: {
          conferenceId: targetConfId,
          key: "page_content_home",
          value: sections
        }
      });
    }

    // Save page_content_footer setting
    if (footer) {
      await prisma.systemSetting.upsert({
        where: {
          conferenceId_key: {
            conferenceId: targetConfId,
            key: "page_content_footer"
          }
        },
        update: {
          value: footer
        },
        create: {
          conferenceId: targetConfId,
          key: "page_content_footer",
          value: footer
        }
      });
    }

    // Save faviconUrl if provided
    if (faviconUrl !== undefined) {
      const existingBranding = await prisma.systemSetting.findFirst({
        where: { conferenceId: targetConfId, key: "branding_assets" }
      });
      const currentBrandingVal = (existingBranding?.value as Record<string, any>) || {};
      
      await prisma.systemSetting.upsert({
        where: {
          conferenceId_key: {
            conferenceId: targetConfId,
            key: "branding_assets"
          }
        },
        update: {
          value: {
            ...currentBrandingVal,
            faviconUrl
          }
        },
        create: {
          conferenceId: targetConfId,
          key: "branding_assets",
          value: {
            ...currentBrandingVal,
            faviconUrl
          }
        }
      });

      // Update active theme tokens
      const activeTheme = await prisma.themeSetting.findFirst({
        where: { conferenceId: targetConfId, isActive: true }
      });
      if (activeTheme) {
        const tokens = (activeTheme.tokens as Record<string, any>) || {};
        await prisma.themeSetting.update({
          where: { id: activeTheme.id },
          data: {
            tokens: {
              ...tokens,
              faviconUrl
            }
          }
        });
      }
    }

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          action: "content.updated",
          entity: "SystemSetting",
          entityId: targetConfId,
          metadata: {
            updatedSections: sections ? sections.map((s: any) => s.id) : [],
            hasFooterUpdate: !!footer,
            hasFaviconUpdate: faviconUrl !== undefined
          }
        }
      });
    } catch (e) {
      console.warn("Audit log creation error:", e);
    }

    // Attempt cache revalidation pings to mainweb
    try {
      const confSlug = slug || "ICGIT";
      await fetch(`http://127.0.0.1:3001/api/revalidate?path=/${confSlug}`, { method: "POST" }).catch(() => {});
      await fetch(`http://127.0.0.1:3001/api/revalidate?path=/`, { method: "POST" }).catch(() => {});
    } catch (_) {}

    return NextResponse.json({ success: true });


  } catch (error: any) {
    console.error("Admin content save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update content" }, { status: 500 });
  }
}

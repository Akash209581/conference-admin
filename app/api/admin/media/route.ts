import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { conferenceId, slug, media } = await request.json();

    let targetConfId = conferenceId;
    if (!targetConfId && slug) {
      const conf = await prisma.conference.findUnique({ where: { slug } });
      targetConfId = conf?.id;
    }

    if (!targetConfId) {
      return NextResponse.json({ error: "Conference not found" }, { status: 404 });
    }

    // Save branding_assets setting
    await prisma.systemSetting.upsert({
      where: {
        conferenceId_key: {
          conferenceId: targetConfId,
          key: "branding_assets"
        }
      },
      update: {
        value: {
          faviconUrl: media.faviconUrl,
          headerLogoUrl: media.headerLogoUrl,
          footerLogoUrl: media.footerLogoUrl,
          heroBannerUrl: media.heroBannerUrl,
          ogImageUrl: media.ogImageUrl
        }
      },
      create: {
        conferenceId: targetConfId,
        key: "branding_assets",
        value: {
          faviconUrl: media.faviconUrl,
          headerLogoUrl: media.headerLogoUrl,
          footerLogoUrl: media.footerLogoUrl,
          heroBannerUrl: media.heroBannerUrl,
          ogImageUrl: media.ogImageUrl
        }
      }
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "media.updated",
          entity: "SystemSetting",
          entityId: targetConfId,
          metadata: {
            faviconUrl: media.faviconUrl,
            headerLogoUrl: media.headerLogoUrl,
            footerLogoUrl: media.footerLogoUrl,
            heroBannerUrl: media.heroBannerUrl,
            ogImageUrl: media.ogImageUrl
          }
        }
      });
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin media save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update media" }, { status: 500 });
  }
}

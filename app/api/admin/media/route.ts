import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { conferenceId, slug, media } = await request.json();

    let targetConfId = conferenceId;
    if (!targetConfId && slug) {
      const conf = await prisma.conference.findFirst({
        where: { slug: { equals: slug, mode: "insensitive" }, deletedAt: null }
      });
      targetConfId = conf?.id;
    }

    if (!targetConfId) {
      return NextResponse.json({ error: "Conference not found" }, { status: 404 });
    }

    const mediaValue = {
      faviconUrl: media.faviconUrl,
      headerLogoUrl: media.headerLogoUrl,
      footerLogoUrl: media.footerLogoUrl,
      heroBannerUrl: media.heroBannerUrl,
      ogImageUrl: media.ogImageUrl
    };

    // Save branding_assets setting
    await prisma.systemSetting.upsert({
      where: {
        conferenceId_key: {
          conferenceId: targetConfId,
          key: "branding_assets"
        }
      },
      update: { value: mediaValue },
      create: {
        conferenceId: targetConfId,
        key: "branding_assets",
        value: mediaValue
      }
    });

    // Also update the active ThemeSetting tokens so the media page reads back
    // the updated values correctly on next load (it reads from themeTokens)
    const activeTheme = await prisma.themeSetting.findFirst({
      where: { conferenceId: targetConfId, isActive: true }
    });
    if (activeTheme) {
      const existing = (activeTheme.tokens as Record<string, any>) || {};
      await prisma.themeSetting.update({
        where: { id: activeTheme.id },
        data: {
          tokens: {
            ...existing,
            faviconUrl: media.faviconUrl,
            headerLogoUrl: media.headerLogoUrl,
            footerLogoUrl: media.footerLogoUrl,
            heroBannerUrl: media.heroBannerUrl,
            ogImageUrl: media.ogImageUrl
          }
        }
      });
    }

    try {
      await prisma.auditLog.create({
        data: {
          action: "media.updated",
          entity: "SystemSetting",
          entityId: targetConfId,
          metadata: mediaValue
        }
      });
    } catch (e) {}

    // Attempt cache revalidation pings to mainweb
    try {
      const confSlug = slug || "";
      if (confSlug) {
        await fetch(`http://127.0.0.1:3001/api/revalidate?path=/${confSlug}`, { method: "POST" }).catch(() => {});
        await fetch(`http://127.0.0.1:3001/api/revalidate?path=/`, { method: "POST" }).catch(() => {});
      }
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin media save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update media" }, { status: 500 });
  }
}

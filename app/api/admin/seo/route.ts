import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { conferenceId, slug, seo } = await request.json();

    let targetConfId = conferenceId;
    if (!targetConfId && slug) {
      const conf = await prisma.conference.findUnique({ where: { slug } });
      targetConfId = conf?.id;
    }

    if (!targetConfId) {
      return NextResponse.json({ error: "Conference not found" }, { status: 404 });
    }

    // Save seo_metadata setting
    await prisma.systemSetting.upsert({
      where: {
        conferenceId_key: {
          conferenceId: targetConfId,
          key: "seo_metadata"
        }
      },
      update: {
        value: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
          canonicalUrl: seo.canonicalUrl,
          googleAnalyticsId: seo.googleAnalyticsId
        }
      },
      create: {
        conferenceId: targetConfId,
        key: "seo_metadata",
        value: {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
          canonicalUrl: seo.canonicalUrl,
          googleAnalyticsId: seo.googleAnalyticsId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin SEO save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update SEO" }, { status: 500 });
  }
}

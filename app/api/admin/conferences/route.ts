import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, fullName, description, startDate, endDate, mode, venueName, venueCity } = body;

    if (!name || !slug || !fullName) {
      return NextResponse.json({ error: "Name, Slug, and Full Title are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await prisma.conference.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Conference with slug "${slug}" already exists.` }, { status: 400 });
    }

    // Create Venue if provided
    let venueId: string | undefined = undefined;
    if (venueName) {
      const venue = await prisma.venue.create({
        data: {
          name: venueName,
          address: venueName,
          city: venueCity || "Dubai"
        }
      });
      venueId = venue.id;
    }

    // Create Conference
    const newConference = await prisma.conference.create({
      data: {
        name,
        slug,
        fullName,
        description: description || fullName,
        startDate: new Date(startDate || "2026-10-15"),
        endDate: new Date(endDate || "2026-10-17"),
        mode: mode || "HYBRID",
        venueId: venueId
      }
    });

    // Initialize Default Settings for this new conference
    await prisma.systemSetting.createMany({
      data: [
        {
          conferenceId: newConference.id,
          key: "page_content_home",
          value: {
            heroTitle: fullName,
            heroSubtitle: description || "Global Innovation & Technology Summit",
            datesText: `${startDate} - ${endDate}`,
            locationText: venueName ? `${venueName}, ${venueCity}` : "Dubai World Trade Centre",
            aboutText: description || "Join global leaders, researchers, and engineers."
          }
        },
        {
          conferenceId: newConference.id,
          key: "page_content_footer",
          value: {
            footerCopyright: `© 2026 ${name}. All rights reserved.`,
            contactEmail: `secretariat@${slug}.org`,
            contactPhone: "+971 4 000 2026",
            contactAddress: venueName ? `${venueName}, ${venueCity}` : "Dubai, United Arab Emirates"
          }
        },
        {
          conferenceId: newConference.id,
          key: "branding_assets",
          value: {
            faviconUrl: "/favicon.ico",
            headerLogoUrl: "",
            footerLogoUrl: "",
            heroBannerUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80",
            ogImageUrl: ""
          }
        },
        {
          conferenceId: newConference.id,
          key: "seo_metadata",
          value: {
            metaTitle: `${name} - ${fullName}`,
            metaDescription: description || fullName,
            metaKeywords: `${name}, Conference, Innovation, Technology, Research`,
            canonicalUrl: `https://${slug}.org`,
            googleAnalyticsId: ""
          }
        }
      ]
    });

    return NextResponse.json({ success: true, conference: newConference });
  } catch (error: any) {
    console.error("Conference creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create conference" }, { status: 500 });
  }
}

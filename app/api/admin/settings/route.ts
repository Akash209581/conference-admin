import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { conferenceId, slug, data } = await request.json();

    let targetConf = await prisma.conference.findFirst({
      where: conferenceId ? { id: conferenceId } : { slug },
      include: { venue: true }
    });

    if (!targetConf) {
      return NextResponse.json({ error: "Conference not found" }, { status: 404 });
    }

    // Update or create venue
    let venueId = targetConf.venueId;
    if (data.venueName) {
      if (venueId) {
        await prisma.venue.update({
          where: { id: venueId },
          data: {
            name: data.venueName,
            address: data.venueAddress || data.venueName,
            city: data.venueCity || "Dubai"
          }
        });
      } else {
        const newVenue = await prisma.venue.create({
          data: {
            name: data.venueName,
            address: data.venueAddress || data.venueName,
            city: data.venueCity || "Dubai"
          }
        });
        venueId = newVenue.id;
      }
    }

    // Update conference
    await prisma.conference.update({
      where: { id: targetConf.id },
      data: {
        name: data.name,
        fullName: data.fullName,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        mode: data.mode,
        venueId: venueId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin settings save error:", error);
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { action, conferenceId, speakerId, data } = await request.json();

    if (action === "create") {
      let fileAssetId = data.fileAssetId || null;
      if (data.imageSrc && !fileAssetId) {
        const fa = await prisma.fileAsset.create({
          data: {
            storageProvider: "local",
            storageKey: data.imageSrc,
            originalName: "speaker_photo.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 1024,
            visibility: "PUBLIC"
          }
        });
        fileAssetId = fa.id;
      }

      const speaker = await prisma.speaker.create({
        data: {
          conferenceId,
          name: data.name,
          role: data.role,
          topic: data.topic,
          bio: data.bio || "",
          imageAssetId: fileAssetId,
          sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0
        }
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "speaker.created",
            entity: "Speaker",
            entityId: speaker.id,
            metadata: { name: speaker.name, role: speaker.role, topic: speaker.topic }
          }
        });
      } catch (e) {}

      return NextResponse.json({ success: true, speaker });
    }

    if (action === "update") {
      let fileAssetId = data.fileAssetId;
      if (data.imageSrc && !fileAssetId) {
        const fa = await prisma.fileAsset.create({
          data: {
            storageProvider: "local",
            storageKey: data.imageSrc,
            originalName: "speaker_photo.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 1024,
            visibility: "PUBLIC"
          }
        });
        fileAssetId = fa.id;
      }

      const updateData: any = {
        name: data.name,
        role: data.role,
        topic: data.topic,
        bio: data.bio || "",
        sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0
      };
      if (fileAssetId) {
        updateData.imageAssetId = fileAssetId;
      }

      const speaker = await prisma.speaker.update({
        where: { id: speakerId },
        data: updateData
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "speaker.updated",
            entity: "Speaker",
            entityId: speaker.id,
            metadata: { name: speaker.name, role: speaker.role, topic: speaker.topic }
          }
        });
      } catch (e) {}

      return NextResponse.json({ success: true, speaker });
    }

    if (action === "delete") {
      await prisma.speaker.update({
        where: { id: speakerId },
        data: { deletedAt: new Date() }
      });

      try {
        await prisma.auditLog.create({
          data: {
            action: "speaker.deleted",
            entity: "Speaker",
            entityId: speakerId,
            metadata: { speakerId }
          }
        });
      } catch (e) {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin speakers error:", error);
    return NextResponse.json({ error: error.message || "Failed to update speaker" }, { status: 500 });
  }
}

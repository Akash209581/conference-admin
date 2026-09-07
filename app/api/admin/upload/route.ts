import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "branding";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${safeName}`;
    const relativeUrl = `/uploads/${folder}/${uniqueFileName}`;

    const targetDirs = [
      path.join(process.cwd(), "public", "uploads", folder),
      path.resolve(process.cwd(), "..", "mainweb", "public", "uploads", folder),
      process.env.UPLOADS_PATH ? path.join(process.env.UPLOADS_PATH, folder) : null,
      path.join("/data/uploads", folder)
    ].filter(Boolean) as string[];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);
        fs.chmodSync(filePath, 0o777);
      } catch (e) {
        // Continue writing to remaining locations
      }
    }




    const fileAsset = await prisma.fileAsset.create({
      data: {
        storageProvider: "local",
        storageKey: relativeUrl,
        originalName: file.name,
        mimeType: file.type || "image/jpeg",
        sizeBytes: buffer.length,
        visibility: "PUBLIC"
      }
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "file.uploaded",
          entity: "FileAsset",
          entityId: fileAsset.id,
          metadata: {
            fileName: file.name,
            url: relativeUrl,
            folder,
            sizeBytes: buffer.length
          }
        }
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileAssetId: fileAsset.id
    });
  } catch (error: any) {
    console.error("Admin file upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}

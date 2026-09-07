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

    const adminUploadDir = path.join(process.cwd(), "public", "uploads", folder);
    const mainwebUploadDir = path.resolve(process.cwd(), "..", "mainweb", "public", "uploads", folder);
    const configuredPath = process.env.UPLOADS_PATH || (fs.existsSync("/data/uploads") ? "/data/uploads" : null);
    const customUploadsDir = configuredPath ? path.join(configuredPath, folder) : null;

    if (!fs.existsSync(adminUploadDir)) fs.mkdirSync(adminUploadDir, { recursive: true });
    if (!fs.existsSync(mainwebUploadDir)) fs.mkdirSync(mainwebUploadDir, { recursive: true });
    if (customUploadsDir && !fs.existsSync(customUploadsDir)) {
      try {
        fs.mkdirSync(customUploadsDir, { recursive: true });
      } catch (e) {}
    }

    const adminFilePath = path.join(adminUploadDir, uniqueFileName);
    const mainwebFilePath = path.join(mainwebUploadDir, uniqueFileName);

    fs.writeFileSync(adminFilePath, buffer);
    try {
      fs.writeFileSync(mainwebFilePath, buffer);
    } catch (e) {}

    if (customUploadsDir) {
      try {
        fs.writeFileSync(path.join(customUploadsDir, uniqueFileName), buffer);
      } catch (e) {}
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

import {adminGuard} from '@/lib/admin-guard';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {const denied=await adminGuard();if(denied)return denied;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "branding";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if(!/^[a-zA-Z0-9_-]{1,40}$/.test(folder))return NextResponse.json({error:'Invalid upload folder'},{status:400});
    if(file.size===0||file.size>10*1024*1024)return NextResponse.json({error:'Select a file up to 10 MB'},{status:400});
    const ext=path.extname(file.name).toLowerCase();
    if(!['.png','.jpg','.jpeg','.webp','.ico','.pdf'].includes(ext))return NextResponse.json({error:'Use PNG, JPEG, WebP, ICO or PDF'},{status:400});
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const signatures:Record<string,boolean>={'.pdf':buffer.subarray(0,5).toString()==='%PDF-','.png':buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'.jpg':buffer[0]===255&&buffer[1]===216,'.jpeg':buffer[0]===255&&buffer[1]===216,'.webp':buffer.subarray(0,4).toString()==='RIFF'&&buffer.subarray(8,12).toString()==='WEBP','.ico':buffer[0]===0&&buffer[1]===0&&buffer[2]===1&&buffer[3]===0};
    if(!signatures[ext])return NextResponse.json({error:'File contents do not match its extension'},{status:400});
    let written=0;
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}_${safeName}`;
    const relativeUrl = `/uploads/${folder}/${uniqueFileName}`;

    const targetDirs = [
      path.join(process.cwd(), "public", "uploads", folder),
      path.resolve(process.cwd(), "..", "mainweb", "public", "uploads", folder),
      process.env.UPLOADS_PATH ? path.join(process.env.UPLOADS_PATH, folder) : null,
      null
    ].filter(Boolean) as string[];

    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const filePath = path.join(dir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);
        fs.chmodSync(filePath, 0o640);written++;
      } catch (e) {
        // Continue writing to remaining locations
      }
    }
    if(!written)throw new Error("Upload storage unavailable");
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

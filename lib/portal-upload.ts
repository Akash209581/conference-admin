import { prisma } from "@/lib/prisma/client";
import { readPortalSettings } from "./portal-settings";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
export async function uploadPortalAsset(slug: string, form: FormData) {
  const kind = String(form.get("kind"));
  if (!["brochure", "sampleAbstract", "committeePhoto"].includes(kind))
    throw new Error("Unsupported upload kind");
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size === 0 ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Select a file up to 10 MB");
  if (kind === "committeePhoto" && file.size > 5 * 1024 * 1024)
    throw new Error("Photo must be under 5 MB");
  const ext = path.extname(file.name).toLowerCase();
  const allowed =
    kind === "committeePhoto"
      ? [".jpg", ".jpeg", ".png", ".webp"]
      : kind === "brochure"
        ? [".pdf"]
        : [".pdf", ".doc", ".docx", ".txt"];
  if (!allowed.includes(ext)) throw new Error("Unsupported file type");
  const bytes = Buffer.from(await file.arrayBuffer());
  const signatures: Record<string, boolean> = {
    ".pdf": bytes.subarray(0, 5).toString() === "%PDF-",
    ".jpg": bytes[0] === 255 && bytes[1] === 216,
    ".jpeg": bytes[0] === 255 && bytes[1] === 216,
    ".png": bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    ".webp":
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WEBP",
    ".doc": bytes
      .subarray(0, 8)
      .equals(Buffer.from([208, 207, 17, 224, 161, 177, 26, 225])),
    ".docx": bytes[0] === 80 && bytes[1] === 75,
    ".txt": !bytes.includes(0),
  };
  if (!signatures[ext])
    throw new Error("File contents do not match its extension");
  const filename = randomUUID() + ext;
  const dir = path.resolve(
    process.env.SHARED_UPLOADS_DIR ||
      path.join(process.cwd(), "..", "mainweb", "public", "uploads"),
    "conference-documents",
  );
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, filename);
  await fs.writeFile(target, bytes, { mode: 0o640 });
  try {
    await prisma.$transaction(
      async (tx) => {
        const current = await readPortalSettings(slug, tx);
        if (current.version !== form.get("version"))
          throw new Error("Settings changed. Reload before uploading.");
        let value: any, key: string;
        if (kind === "committeePhoto") {
          const memberId = form.get("memberId");
          if (!current.settings.committee.some((m: any) => m.id === memberId))
            throw new Error("Member not found");
          key = "organizing_committee";
          value = current.settings.committee.map((m: any) =>
            m.id === memberId
              ? {
                  ...m,
                  photo: {
                    url: "/ICGIT/uploads/conference-documents/" + filename,
                    fileName: file.name,
                  },
                }
              : m,
          );
        } else {
          key = "document_assets";
          value = {
            ...current.settings.assets,
            [kind]: {
              fileName: file.name,
              storageKey: filename,
              url: "/ICGIT/api/assets?kind=" + kind,
            },
          };
        }
        await tx.systemSetting.upsert({
          where: {
            conferenceId_key: { conferenceId: current.conferenceId, key },
          },
          create: { conferenceId: current.conferenceId, key, value },
          update: { value },
        });
        await tx.auditLog.create({
          data: {
            action: "portal.asset.uploaded",
            entity: "Conference",
            entityId: current.conferenceId,
            metadata: { kind, fileName: file.name },
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
  } catch (e) {
    await fs.unlink(target);
    throw e;
  }
  return readPortalSettings(slug);
}

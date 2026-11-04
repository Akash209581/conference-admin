import fs from "fs/promises";
import path from "path";
export async function backupAbstracts(slug: string): Promise<any[]> {
  if (
    slug.toLowerCase() !==
    (process.env.CONTACT_CONFERENCE_SLUG || "icgit-2026").toLowerCase()
  )
    return [];
  const rows = new Map<string, any>();
  for (const file of [
    path.join(process.cwd(), "storage", "abstracts_backup.json"),
    path.resolve(
      process.env.MAINWEB_STORAGE_DIR ||
        path.join(process.cwd(), "..", "mainweb", "storage"),
      "abstracts_backup.json",
    ),
  ]) {
    try {
      const data = JSON.parse(await fs.readFile(file, "utf8"));
      if (Array.isArray(data))
        for (const row of data)
          if (typeof row.id === "string" && !rows.has(row.id))
            rows.set(row.id, row);
    } catch (e: any) {
      if (e.code !== "ENOENT") {
        console.warn("[Backup abstracts] Failed reading:", file, e.message);
      }
    }
  }
  return [...rows.values()];
}

export async function backupRegistrations(slug: string): Promise<any[]> {
  if (
    slug.toLowerCase() !==
    (process.env.CONTACT_CONFERENCE_SLUG || "icgit-2026").toLowerCase()
  )
    return [];
  const rows = new Map<string, any>();
  for (const file of [
    path.join(process.cwd(), "storage", "registrations_backup.json"),
    path.resolve(
      process.env.MAINWEB_STORAGE_DIR ||
        path.join(process.cwd(), "..", "mainweb", "storage"),
      "registrations_backup.json",
    ),
  ]) {
    try {
      const data = JSON.parse(await fs.readFile(file, "utf8"));
      if (Array.isArray(data))
        for (const row of data)
          if (typeof row.id === "string" && !rows.has(row.id))
            rows.set(row.id, row);
    } catch (e: any) {
      if (e.code !== "ENOENT") {
        console.warn("[Backup registrations] Failed reading:", file, e.message);
      }
    }
  }
  return [...rows.values()];
}

import { prisma } from "@/lib/prisma/client";
import { createHash } from "crypto";
import { DEFAULTS } from "./portal-defaults";
import { validateSettings } from "./validate-settings";
export const settingKeys: Record<string, string> = {
  conference: "conference_display",
  registration: "registration_pricing",
  accommodation: "accommodation_pricing",
  abstract: "abstract_settings",
  policies: "policies",
  tracks: "scientific_tracks",
  committee: "organizing_committee",
  assets: "document_assets",
};
export async function resolveConference(slug: string) {
  const conference = await prisma.conference.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" }, deletedAt: null },
    include: { venue: true },
  });
  if (!conference) throw new Error("Conference not found");
  return conference;
}
export async function readPortalSettings(slug: string, db: any = prisma) {
  const conference = await db.conference.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" }, deletedAt: null },
    include: { venue: true },
  });
  if (!conference) throw new Error("Conference not found");
  const rows = await db.systemSetting.findMany({
    where: {
      conferenceId: conference.id,
      key: { in: Object.values(settingKeys) },
    },
  });
  const settings: any = structuredClone(DEFAULTS);
  settings.conference = {
    ...settings.conference,
    title: conference.fullName || conference.name,
    dates:
      conference.startDate.toISOString().slice(0, 10) +
      " – " +
      conference.endDate.toISOString().slice(0, 10),
    venue: conference.venue?.name || settings.conference.venue,
  };
  for (const [field, key] of Object.entries(settingKeys)) {
    const row = rows.find((r: any) => r.key === key);
    if (row)
      settings[field] = Array.isArray(row.value)
        ? row.value
        : { ...settings[field], ...row.value };
  }
  if (settings.registration.accommodation)
    settings.accommodation = settings.registration.accommodation;
  if (settings.abstract.maxFileSizeMb !== undefined)
    settings.abstract.maxFileMB = settings.abstract.maxFileSizeMb;
  for (const key of ["tracks", "committee"])
    settings[key] = settings[key].map((item: any) => ({
      ...item,
      published: item.published !== false,
    }));
  const version = createHash("sha256")
    .update(
      JSON.stringify(
        rows
          .map((r: any) => [r.key, r.value])
          .sort((a: any, b: any) => a[0].localeCompare(b[0])),
      ),
    )
    .digest("hex");
  return { settings, version, conferenceId: conference.id };
}
export async function savePortalSettings(
  slug: string,
  settings: any,
  version: string,
) {
  if (!validateSettings(settings)) throw new Error("Invalid settings");
  return prisma.$transaction(
    async (tx) => {
      const current = await readPortalSettings(slug, tx);
      if (current.version !== version)
        throw new Error("Settings changed. Reload before saving.");
      for (const [field, key] of Object.entries(settingKeys)) {
        let value = settings[field];
        if (field === "assets") value = current.settings.assets; // Asset references are written only by validated uploads.
        if (field === "registration")
          value = { ...value, accommodation: settings.accommodation };
        if (field === "abstract")
          value = { ...value, maxFileSizeMb: value.maxFileMB };
        await tx.systemSetting.upsert({
          where: {
            conferenceId_key: { conferenceId: current.conferenceId, key },
          },
          create: { conferenceId: current.conferenceId, key, value },
          update: { value },
        });
      }
      await tx.auditLog.create({
        data: {
          action: "portal.settings.updated",
          entity: "Conference",
          entityId: current.conferenceId,
        },
      });
      return readPortalSettings(slug, tx);
    },
    { isolationLevel: "Serializable" },
  );
}

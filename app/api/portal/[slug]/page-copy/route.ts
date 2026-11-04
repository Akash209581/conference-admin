import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma/client";
import { resolveConference } from "@/lib/portal-settings";
import catalog from "@/lib/page-copy-catalog.json";
import { createHash } from "crypto";
const hash = (value: any) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Context = { params: Promise<{ slug: string }> };
export async function GET(_: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const c = await resolveConference((await params).slug);
    const row = await prisma.systemSetting.findUnique({
      where: {
        conferenceId_key: { conferenceId: c.id, key: "approved_page_copy" },
      },
    });
    const values = row?.value || {};
    return NextResponse.json({ values, version: hash(values) });
  } catch {
    return NextResponse.json(
      { error: "Unable to load page text." },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const { values, version } = await request.json();
    if (!values || typeof values !== "object" || Array.isArray(values))
      throw Error("Invalid text");
    for (const [page, entries] of Object.entries(values)) {
      const fields = catalog[page as keyof typeof catalog];
      if (
        !fields ||
        !entries ||
        typeof entries !== "object" ||
        Array.isArray(entries)
      )
        throw Error("Invalid page");
      for (const [id, value] of Object.entries(entries)) {
        if (
          !fields.some((f) => f.id === id) ||
          typeof value !== "string" ||
          value.length > 10000
        )
          throw Error("Invalid text field");
      }
    }
    const c = await resolveConference((await params).slug);
    await prisma.$transaction(
      async (tx) => {
        const where = {
          conferenceId_key: { conferenceId: c.id, key: "approved_page_copy" },
        };
        const current = await tx.systemSetting.findUnique({ where });
        if (hash(current?.value || {}) !== version)
          throw Error("Text changed. Reload before saving.");
        await tx.systemSetting.upsert({
          where,
          create: {
            conferenceId: c.id,
            key: "approved_page_copy",
            value: values,
          },
          update: { value: values },
        });
        await tx.auditLog.create({
          data: {
            action: "portal.page-copy.updated",
            entity: "Conference",
            entityId: c.id,
          },
        });
      },
      { isolationLevel: "Serializable" },
    );
    return NextResponse.json({ version: hash(values) });
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to save text or a newer version exists. Reload and retry.",
      },
      { status: 409 },
    );
  }
}

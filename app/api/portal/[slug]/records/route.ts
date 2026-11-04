import { backupAbstracts, backupRegistrations } from "@/lib/backup-abstracts";
import { adminGuard } from "@/lib/admin-guard";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { resolveConference } from "@/lib/portal-settings";
type Context = { params: Promise<{ slug: string }> };
const submissionStatuses: Record<string, string> = {
  SUBMITTED: "New",
  DRAFT: "New",
  UNDER_REVIEW: "Under review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  REVISION_REQUIRED: "Under review",
};
export async function GET(_: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const { slug } = await params;
    const conference = await resolveConference(slug);
    const [registrations, abstracts, messages, workflow] = await Promise.all([
      prisma.registration.findMany({
        where: { conferenceId: conference.id, deletedAt: null },
        include: { registrationPackage: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.abstractSubmission.findMany({
        where: { conferenceId: conference.id, deletedAt: null },
        include: { author: true, track: true },
        orderBy: { createdAt: "desc" },
      }),
      slug.toLowerCase() ===
      (process.env.CONTACT_CONFERENCE_SLUG || "icgit-2026").toLowerCase()
        ? prisma.contactMessage.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
      prisma.systemSetting.findMany({
        where: {
          conferenceId: conference.id,
          key: { startsWith: "record_workflow:" },
        },
      }),
    ]);
    const meta = new Map(
      workflow.map((w) => [w.key.slice(16), w.value as any]),
    );
    const backups = await backupAbstracts(slug);
    const registrationBackups=await backupRegistrations(slug);
    const records = [
      ...registrationBackups.filter(b=>!registrations.some(r=>r.id===b.id||(r.referenceNumber&&r.referenceNumber===b.referenceNumber))).map(b=>({id:'backreg:'+b.id,kind:'registration',name:b.fullName||b.name,email:b.email,organisation:b.organization||b.institution,phone:b.phone||b.number,status:meta.get('backreg:'+b.id)?.status||(b.status==='CONFIRMED'?'Confirmed':'New'),created_at:b.createdAt||b.submittedAt,payload:{...b,storageNotice:'Historical registration saved by the public fallback.'}})),
      ...backups
        .filter((b) => !abstracts.some((a) => a.id === b.id))
        .map((b) => ({
          id: "backup:" + b.id,
          kind: "abstract",
          name:
            b.name ||
            b.presentingAuthor ||
            [b.first, b.last].filter(Boolean).join(" "),
          email: b.email,
          organisation: b.institution,
          phone: b.phone || b.number,
          status:
            meta.get("backup:" + b.id)?.status ||
            submissionStatuses[b.status] ||
            "New",
          created_at: b.submittedAt || b.createdAt,
          payload: {
            ...b,
            attachmentNotice:
              "Only document metadata was saved by the public form.",
          },
        })),
      ...registrations.map((r) => ({
        id: "registration:" + r.id,
        kind: "registration",
        name: r.fullName,
        email: r.email,
        organisation: r.organization,
        phone: r.phone || "",
        status:
          r.status === "CONFIRMED"
            ? "Confirmed"
            : r.status === "CANCELLED"
              ? "Rejected"
              : "New",
        created_at: r.createdAt,
        payload: {
          package: r.registrationPackage?.name,
          registrationStatus: r.status,
          referenceNumber:r.referenceNumber,country:r.countryName,category:r.category,participationRole:r.participationRole,abstractReference:r.abstractReference,currency:r.currency,registrationFeeCents:r.registrationFeeCents,totalAmountCents:r.totalAmountCents,quoteRequired:r.isQuoteRequired,partnerPackage:r.partnerPackage,representatives:r.representativesCount,interests:r.partnerInterests,accommodation:r.hasStay,checkIn:r.checkInDate,checkOut:r.checkOutDate,roomType:r.roomType,rooms:r.roomCount,guestsPerRoom:r.guestsPerRoom,bedPreference:r.bedPreference,accommodationNotes:r.accommodationNotes,accommodationFeeCents:r.accommodationFeeCents,invoiceRequested:r.needsInvoice,billingOrganization:r.billingOrg,billingAddress:r.billingAddress,taxId:r.taxId,purchaseOrder:r.poNumber,
        },
      })),
      ...abstracts.map((r) => ({
        id: "abstract:" + r.id,
        kind: "abstract",
        name:
          [r.author.firstName, r.author.lastName].filter(Boolean).join(" ") ||
          r.author.email,
        email: r.author.email,
        organisation: "",
        phone: "",
        status: submissionStatuses[r.status],
        created_at: r.createdAt,
        payload: {
          title: r.title,
          abstract: r.abstractText,
          keywords: r.keywords,
          track: r.track?.name,
          submissionStatus: r.status,
        },
      })),
      ...messages.map((r) => ({
        id: "contact:" + r.id,
        kind: r.message.startsWith("Brochure Request:") ? "brochure" : "query",
        name: r.name,
        email: r.email,
        organisation: "",
        phone: "",
        status: meta.get("contact:" + r.id)?.status || "New",
        created_at: r.createdAt,
        payload: { message: r.message, category: r.category },
      })),
    ].map((r) => ({ ...r, notes: meta.get(r.id)?.notes || "" }));
    records.sort((a,b)=>Date.parse(String(b.created_at))-Date.parse(String(a.created_at)));
    return NextResponse.json(
      { records },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to load records from the shared database." },
      { status: 503 },
    );
  }
}
export async function PATCH(request: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const { slug } = await params;
    const conference = await resolveConference(slug);
    const { id, status, notes } = await request.json();
    if (
      typeof id !== "string" ||
      typeof notes !== "string" ||
      notes.length > 10000
    )
      return NextResponse.json(
        { error: "Invalid record or notes" },
        { status: 400 },
      );
    const [kind, recordId] = id.split(":");
    const maps: Record<string, Record<string, string>> = {
      backreg: { New:"PENDING", Confirmed:"CONFIRMED", Rejected:"CANCELLED" },
      registration: {
        New: "PENDING",
        Confirmed: "CONFIRMED",
        Rejected: "CANCELLED",
      },
      abstract: {
        New: "SUBMITTED",
        "Under review": "UNDER_REVIEW",
        Accepted: "ACCEPTED",
        Rejected: "REJECTED",
      },
      backup: {
        New: "SUBMITTED",
        "Under review": "UNDER_REVIEW",
        Accepted: "ACCEPTED",
        Rejected: "REJECTED",
      },
      contact: {
        New: "New",
        "Under review": "Under review",
        Contacted: "Contacted",
        Confirmed: "Confirmed",
      },
    };
    if (!maps[kind]?.[status])
      return NextResponse.json(
        { error: "This status is not available for this record type." },
        { status: 400 },
      );
    await prisma.$transaction(async (tx) => {
      if (kind === "registration") {
        const r = await tx.registration.updateMany({
          where: { id: recordId, conferenceId: conference.id, deletedAt: null },
          data: { status: maps[kind][status] as any },
        });
        if (r.count !== 1) throw Error("Record not found");
      } else if (kind === "abstract") {
        const r = await tx.abstractSubmission.updateMany({
          where: { id: recordId, conferenceId: conference.id, deletedAt: null },
          data: { status: maps[kind][status] as any },
        });
        if (r.count !== 1) throw Error("Record not found");
      } else if(kind === "backreg"){if(!(await backupRegistrations(slug)).some(b=>b.id===recordId))throw Error("Record not found");
      } else if (kind === "backup") {
        if (!(await backupAbstracts(slug)).some((b) => b.id === recordId))
          throw Error("Record not found");
      } else {
        if (
          slug.toLowerCase() !==
            (
              process.env.CONTACT_CONFERENCE_SLUG || "icgit-2026"
            ).toLowerCase() ||
          !(await tx.contactMessage.findFirst({
            where: { id: recordId, deletedAt: null },
          }))
        )
          throw Error("Record not found");
      }
      const key = "record_workflow:" + id,
        value = { status, notes };
      await tx.systemSetting.upsert({
        where: { conferenceId_key: { conferenceId: conference.id, key } },
        create: { conferenceId: conference.id, key, value },
        update: { value },
      });
      await tx.auditLog.create({
        data: {
          action: "portal.record.updated",
          entity: kind,
          entityId: recordId,
          metadata: { conferenceId: conference.id, status },
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Record update failed. No changes were committed." },
      { status: 400 },
    );
  }
}

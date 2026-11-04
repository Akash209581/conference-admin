import { prisma } from "@/lib/prisma/client";
import { RegistrationsTable, type FormattedAttendee } from "@/components/admin/registrations-table";
import { Users } from "lucide-react";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let conference: any = null;
  let dbRegistrations: any[] = [];

  try {
    conference = await prisma.conference.findFirst({
      where: { slug, deletedAt: null },
      include: {
        registrations: {
          where: { deletedAt: null },
          include: {
            registrationPackage: true,
            user: {
              include: {
                profile: {
                  include: {
                    country: true,
                    organization: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (conference?.registrations) {
      dbRegistrations = conference.registrations;
    }
  } catch (err) {
    console.warn("DB offline or connection issue in RegistrationsPage:", err);
  }

  // Fallback / backup registrations from disk
  let backupRegistrations: any[] = [];
  const candidatePaths = [
    path.join(process.cwd(), "storage", "registrations_backup.json"),
    "C:\\Users\\banda\\Desktop\\mainweb\\storage\\registrations_backup.json",
    "C:\\Users\\banda\\Desktop\\conference-admin\\storage\\registrations_backup.json"
  ];

  for (const cp of candidatePaths) {
    try {
      if (fs.existsSync(cp)) {
        const raw = fs.readFileSync(cp, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          backupRegistrations = parsed;
          break;
        }
      }
    } catch {}
  }

  const mergedMap = new Map<string, any>();

  // Helper for formatting currency
  const formatAmt = (cents: number, cur: string) => {
    const symbols: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
    const sym = symbols[cur] || cur;
    return `${cur} ${sym}${Math.round(cents / 100)}`;
  };

  // Add DB registrations
  for (const r of dbRegistrations) {
    const prof = r.user?.profile;
    const org = r.organization || prof?.organization?.name || "Independent";
    const country = r.countryName || prof?.country?.name || "N/A";
    const phone = r.phone || prof?.phone || "N/A";
    const currency = (r.referenceNumber ? r.currency : r.registrationPackage?.currency) || r.currency || "EUR";
    const priceCents = r.referenceNumber ? r.registrationFeeCents : r.registrationPackage?.priceCents || 0;
    const regAmount = Math.round(priceCents / 100);
    const currencyAndRegAmount = formatAmt(priceCents, currency);
    const address = (r as any).billingAddress || (r as any).address || "N/A";
    const title =
      r.registrationPackage?.name ||
      prof?.title ||
      prof?.designation ||
      "Academic Delegate";

    mergedMap.set(r.id, {
      id: r.id,
      name: r.fullName || `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || "Participant",
      email: r.email || r.user?.email || "N/A",
      number: phone,
      institution: org,
      country,
      title,
      currencyAndRegAmount,
      currency,
      regAmount,
      address,
      status: r.status || "CONFIRMED",
      attendanceMode: r.registrationPackage?.attendanceMode || "ONSITE",
      createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
    });
  }

  // Add backup registrations
  for (const b of backupRegistrations) {
    const id = b.id || b.referenceNumber || `reg-${Math.random().toString(36).substring(2, 9)}`;
    if (!mergedMap.has(id)) {
      const name = b.name || b.fullName || `${b.first || ""} ${b.last || ""}`.trim() || "Delegate";
      const email = b.email || "N/A";
      const number = b.number || b.phone || "N/A";
      const institution = b.institution || b.organization || "N/A";
      const country = b.country || b.countryName || "N/A";
      const title =
        b.title ||
        b.participationRole ||
        (b.category ? `${b.category.charAt(0).toUpperCase() + b.category.slice(1)} Delegate` : "Academic Delegate");
      const currency = b.currency || "EUR";
      const regAmount = b.regAmount !== undefined ? b.regAmount : Math.round((b.registrationFeeCents || 0) / 100);
      const currencyAndRegAmount =
        b.currencyAndRegAmount ||
        formatAmt(b.registrationFeeCents || (regAmount * 100), currency);
      const address = b.address || b.billingAddress || "N/A";

      mergedMap.set(id, {
        id,
        name,
        email,
        number,
        institution,
        country,
        title,
        currencyAndRegAmount,
        currency,
        regAmount,
        address,
        status: b.status || "CONFIRMED",
        attendanceMode: b.attendanceMode || "ONSITE",
        createdAt: b.createdAt || b.submittedAt || new Date().toISOString()
      });
    }
  }

  // Format with sequential S.No
  const formattedRegistrations: FormattedAttendee[] = Array.from(mergedMap.values()).map(
    (item, index) => ({
      ...item,
      sno: index + 1
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Delegate Attendee Management</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Attendees &amp; Registrations
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track registered delegates, ticket fees, institution affiliations, and download attendee reports for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name || "ICGIT 2026"}</span>.
        </p>
      </div>

      <RegistrationsTable registrations={formattedRegistrations} conferenceSlug={slug} />
    </div>
  );
}

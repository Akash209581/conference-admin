import { prisma } from "@/lib/prisma/client";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      registrations: {
        where: { deletedAt: null },
        include: {
          registrationPackage: true,
          user: { include: { profile: { include: { country: true, organization: true } } } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const formattedRegistrations = (conference?.registrations || []).map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    organization: r.user?.profile?.organization?.name || "Independent",
    packageName: r.registrationPackage?.name || "Standard Pass",
    packagePriceCents: r.registrationPackage?.priceCents || 0,
    packageCurrency: r.registrationPackage?.currency || "USD",
    attendanceMode: r.registrationPackage?.attendanceMode || "ONSITE",
    status: r.status,
    countryName: r.user?.profile?.country?.name || "United Arab Emirates",
    createdAt: r.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          <span>Delegate Attendee Management</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Attendees & Registrations</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track registered delegates, ticket packages, attendance modes, and confirmations for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <RegistrationsTable registrations={formattedRegistrations} conferenceSlug={slug} />
    </div>
  );
}

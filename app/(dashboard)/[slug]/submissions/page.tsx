import { prisma } from "@/lib/prisma/client";
import { SubmissionsTable, type FormattedSubmission } from "@/components/admin/submissions-table";
import { FileCheck2 } from "lucide-react";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let conference: any = null;
  let dbSubmissions: any[] = [];

  try {
    conference = await prisma.conference.findFirst({
      where: { slug, deletedAt: null },
      include: {
        submissions: {
          where: { deletedAt: null },
          include: {
            track: true,
            author: {
              include: {
                profile: {
                  include: {
                    organization: true,
                    country: true
                  }
                }
              }
            },
            files: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (conference?.submissions) {
      dbSubmissions = conference.submissions;
    }
  } catch (err) {
    console.warn("DB offline or connection timeout in SubmissionsPage:", err);
  }

  // Load from local backups if available
  let backupSubmissions: any[] = [];
  const candidateBackupPaths = [
    path.join(process.cwd(), "storage", "abstracts_backup.json"),
    "C:\\Users\\banda\\Desktop\\mainweb\\storage\\abstracts_backup.json",
    "C:\\Users\\banda\\Desktop\\conference-admin\\storage\\abstracts_backup.json"
  ];

  for (const bp of candidateBackupPaths) {
    try {
      if (fs.existsSync(bp)) {
        const raw = fs.readFileSync(bp, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          backupSubmissions = parsed;
          break;
        }
      }
    } catch {}
  }

  // Merge database submissions with backup JSON submissions without duplicate IDs
  const mergedMap = new Map<string, any>();

  // Add DB submissions first
  for (const s of dbSubmissions) {
    const authorProfile = s.author?.profile;
    const authorOrg = authorProfile?.organization?.name || "Independent";
    const authorCountry = authorProfile?.country?.name || "N/A";
    const authorPhone = authorProfile?.phone || "N/A";
    const authorName =
      `${s.author?.firstName || ""} ${s.author?.lastName || ""}`.trim() || "Anonymous Author";
    const authorEmail = s.author?.email || "N/A";
    const fileName =
      s.files?.[0]?.originalName ||
      `${s.title.toLowerCase().slice(0, 30).replace(/[^a-z0-9]+/g, "_")}_abstract.pdf`;

    mergedMap.set(s.id, {
      id: s.id,
      name: authorName,
      email: authorEmail,
      number: authorPhone,
      institution: authorOrg,
      country: authorCountry,
      title: s.title,
      track: s.track?.name || "General Track",
      fileName,
      fileSize: s.files?.[0]?.sizeBytes || 0,
      status: s.status,
      abstractText: s.abstractText || "",
      presentationPreference: "Oral presentation",
      coAuthors: [],
      createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
    });
  }

  // Add backup submissions if not already present
  for (const b of backupSubmissions) {
    const id = b.id || b.referenceNumber || `abs-${Math.random().toString(36).substring(2, 9)}`;
    if (!mergedMap.has(id)) {
      const authorName =
        b.name ||
        b.presentingAuthor ||
        `${b.first || ""} ${b.last || ""}`.trim() ||
        "Author";
      const authorEmail = b.email || "N/A";
      const authorNumber = b.number || b.phone || "N/A";
      const institution = b.institution || "N/A";
      const country = b.country || "N/A";
      const title = b.title || "Untitled Abstract";
      const track = b.track || "General Track";
      const fileName =
        b.fileName ||
        `${title.toLowerCase().slice(0, 30).replace(/[^a-z0-9]+/g, "_")}.pdf`;

      mergedMap.set(id, {
        id,
        name: authorName,
        email: authorEmail,
        number: authorNumber,
        institution,
        country,
        title,
        track,
        fileName,
        fileSize: b.fileSize || 0,
        status: b.status || "SUBMITTED",
        abstractText: b.abstractText || b.abstract || "",
        presentationPreference: b.presentationPreference || b.presentation || "Oral presentation",
        coAuthors: b.coAuthors || [],
        createdAt: b.submittedAt || b.createdAt || new Date().toISOString()
      });
    }
  }

  // Format and assign 1-based sequential S.No
  const formattedSubmissions: FormattedSubmission[] = Array.from(mergedMap.values()).map(
    (item, index) => ({
      ...item,
      sno: index + 1
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>Peer Review &amp; Scientific Submissions</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Abstract Submissions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, evaluate, and download research abstracts submitted to{" "}
          <span className="text-slate-900 font-semibold">{conference?.name || "ICGIT 2026"}</span>.
        </p>
      </div>

      <SubmissionsTable submissions={formattedSubmissions} conferenceSlug={slug} />
    </div>
  );
}

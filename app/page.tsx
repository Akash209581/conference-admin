import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const firstConference = await prisma.conference.findFirst({
    where: { deletedAt: null },
    select: { slug: true },
    orderBy: { createdAt: "desc" }
  });

  const slug = firstConference?.slug || "icgit-2026";
  redirect(`/${slug}`);
}

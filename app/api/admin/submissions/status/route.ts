import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const { submissionId, status } = await request.json();

    if (!submissionId || !status) {
      return NextResponse.json({ error: "Missing submissionId or status" }, { status: 400 });
    }

    const updated = await prisma.abstractSubmission.update({
      where: { id: submissionId },
      data: { status: status as any }
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error("Submission status update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update submission status" }, { status: 500 });
  }
}

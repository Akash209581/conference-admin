import { adminGuard } from "@/lib/admin-guard";
import { NextResponse } from "next/server";
import { readPortalSettings, savePortalSettings } from "@/lib/portal-settings";
import { uploadPortalAsset } from "@/lib/portal-upload";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ slug: string }> };
export async function GET(_: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    return NextResponse.json(await readPortalSettings((await params).slug));
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to load conference settings. Check the database connection.",
      },
      { status: 503 },
    );
  }
}
export async function PUT(request: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const { settings, version } = await request.json();
    return NextResponse.json(
      await savePortalSettings((await params).slug, settings, version),
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.message === "Invalid settings"
            ? e.message
            : "Save failed or settings changed. Reload saved settings and retry.",
      },
      { status: e.message === "Invalid settings" ? 400 : 409 },
    );
  }
}
export async function POST(request: Request, { params }: Context) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    return NextResponse.json(
      await uploadPortalAsset((await params).slug, await request.formData()),
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Upload failed" },
      { status: 400 },
    );
  }
}

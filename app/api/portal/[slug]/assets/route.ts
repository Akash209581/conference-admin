import { adminGuard } from "@/lib/admin-guard";
import { readPortalSettings } from "@/lib/portal-settings";
import fs from "fs/promises";
import path from "path";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const denied = await adminGuard();
  if (denied) return denied;
  try {
    const { settings } = await readPortalSettings((await params).slug);
    const kind = new URL(request.url).searchParams.get("kind") || "";
    if (!["brochure", "sampleAbstract"].includes(kind))
      return new Response("Not found", { status: 404 });
    const asset = settings.assets[kind];
    if (
      !asset?.storageKey ||
      path.basename(asset.storageKey) !== asset.storageKey
    )
      return new Response("Not found", { status: 404 });
    const bytes = await fs.readFile(
      path.resolve(
        process.env.SHARED_UPLOADS_DIR ||
          path.join(process.cwd(), "..", "mainweb", "public", "uploads"),
        "conference-documents",
        asset.storageKey,
      ),
    );
    return new Response(bytes, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition":
          "attachment; filename*=UTF-8''" + encodeURIComponent(asset.fileName),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File unavailable", { status: 404 });
  }
}

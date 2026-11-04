"use client";
export function portalSlug() {
  return decodeURIComponent(
    window.location.pathname.replace(/^\/conference-admin/, "").split("/")[1] ||
      "icgit-2026",
  );
}
export function assetUrl(kind: string) {
  return (
    "/conference-admin/api/portal/" +
    encodeURIComponent(portalSlug()) +
    "/assets?kind=" +
    encodeURIComponent(kind)
  );
}
export function portalFetch(input: string, init?: RequestInit) {
  const url = input.startsWith("/api/auth/")
    ? "/conference-admin" + input
    : "/conference-admin/api/portal/" +
      encodeURIComponent(portalSlug()) +
      "/" +
      input.replace("/api/", "");
  return fetch(url, init);
}

export function publicAssetUrl(value: string) {
  if (/^https?:\/\//.test(value)) return value;
  const base = new URL(
    process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000/ICGIT",
  );
  return new URL(value, base.origin).href;
}

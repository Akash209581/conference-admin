export function isValidOrigin(
  origin: string | null | undefined,
  requestHost: string | null | undefined,
  requestProto: string | null | undefined,
  fallbackOrigin?: string
): boolean {
  if (!origin) return true;

  const cleanOrigin = origin.trim().toLowerCase().replace(/\/$/, "");

  // 1. Check ADMIN_ORIGIN from environment if configured
  if (process.env.ADMIN_ORIGIN) {
    const allowed = process.env.ADMIN_ORIGIN.split(",").map((s) =>
      s.trim().toLowerCase().replace(/\/$/, "")
    );
    if (allowed.includes(cleanOrigin)) return true;
  }

  // 2. Check fallback origin (e.g. request.nextUrl.origin)
  if (
    fallbackOrigin &&
    cleanOrigin === fallbackOrigin.toLowerCase().replace(/\/$/, "")
  ) {
    return true;
  }

  // 3. Compare hostnames to verify same-host request behind reverse proxies
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host.toLowerCase();
    const originHostname = originUrl.hostname.toLowerCase();

    const rawHost = (requestHost || "").split(",")[0].trim().toLowerCase();
    const reqHostname = rawHost.split(":")[0];

    if (originHost === rawHost || originHostname === reqHostname) {
      return true;
    }

    const proto = (requestProto || "https").split(",")[0].trim().toLowerCase();
    if (cleanOrigin === `${proto}://${rawHost}`) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}


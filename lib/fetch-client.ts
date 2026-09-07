/**
 * Safe fetch wrapper that handles non-JSON responses (e.g. 401/500 HTML redirects)
 * and guarantees structured error and data returns without throwing JSON parse syntax errors.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<{ data?: T; error?: string; status: number; ok: boolean }> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";

    let body: any = null;
    if (contentType.includes("application/json")) {
      try {
        body = await res.json();
      } catch {
        body = null;
      }
    } else {
      const text = await res.text();
      body = text ? { error: text } : null;
    }

    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          error: body?.error || "Your admin session has expired. Please log in again.",
          status: res.status
        };
      }
      return {
        ok: false,
        error: body?.error || `Request failed (HTTP ${res.status})`,
        status: res.status
      };
    }

    return { ok: true, data: body as T, status: res.status };
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Network connection error. Please try again.",
      status: 0
    };
  }
}

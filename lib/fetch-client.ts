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
      // If server returned raw HTML error page (e.g., Nginx 413 / 502), do not display HTML markup
      if (text && (text.includes("<html") || text.includes("<!DOCTYPE"))) {
        body = null;
      } else {
        body = text ? { error: text } : null;
      }
    }

    if (!res.ok) {
      if (res.status === 401) {
        return {
          ok: false,
          error: body?.error || "Your admin session has expired. Please log in again.",
          status: res.status
        };
      }
      if (res.status === 413) {
        return {
          ok: false,
          error: "The uploaded file is too large (HTTP 413). Please choose an image under 25MB or increase Nginx client_max_body_size.",
          status: res.status
        };
      }
      if (res.status === 502 || res.status === 503) {
        return {
          ok: false,
          error: `Server is temporarily unavailable (HTTP ${res.status}). Please try again shortly.`,
          status: res.status
        };
      }
      if (res.status === 504) {
        return {
          ok: false,
          error: "Request timed out (HTTP 504). Please try again.",
          status: res.status
        };
      }

      return {
        ok: false,
        error: body?.error || `Request failed with status code ${res.status}.`,
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


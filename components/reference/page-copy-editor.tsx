"use client";
import { useEffect, useState } from "react";
import catalog from "@/lib/page-copy-catalog.json";
import { portalFetch } from "@/lib/portal-fetch";
export default function PageCopyEditor({ fixedPage }: { fixedPage?: keyof typeof catalog } = {}) {
  const [page, setPage] = useState<keyof typeof catalog>(fixedPage || "registration"),
    [values, setValues] = useState<Record<string, Record<string, string>>>({}),
    [version, setVersion] = useState(""),
    [search, setSearch] = useState(""),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  async function load() {
    try {
      const r = await portalFetch("/api/page-copy");
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setValues(d.values);
      setVersion(d.version);
      setDirty(false);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await portalFetch("/api/page-copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, version }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setVersion(d.version);
      setDirty(false);
      setNotice(
        "Page text published. Refresh the public page to see the changes.",
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <div className="pageheading">
        <div>
          <div className="eyebrow">WEBSITE MANAGEMENT</div>
          <h1>{fixedPage ? `${fixedPage.charAt(0).toUpperCase() + fixedPage.slice(1)} page text` : "Public page text"}</h1>
          <p>
            Edit the reference page headings, descriptions, labels and notices.
          </p>
        </div>
        <span className="badge">{dirty ? "Unsaved changes" : "Saved"}</span>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <form className="settingspanel" onSubmit={save}>
        <div className="filters">
          <label>
            Page
            <select
              value={page}
              disabled={Boolean(fixedPage)}
              onChange={(e) => setPage(e.target.value as keyof typeof catalog)}
            >
              {Object.keys(catalog).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            Find text
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search page text"
            />
          </label>
        </div>
        <div className="settingsfields">
          {catalog[page]
            .filter((f) =>
              (f.label + " " + (values[page]?.[f.id] || ""))
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((f) => (
              <label key={page + f.id}>
                {f.label}
                <textarea
                  rows={f.original.length > 150 ? 4 : 2}
                  maxLength={10000}
                  value={values[page]?.[f.id] ?? f.original}
                  onChange={(e) => {
                    setValues((all) => ({
                      ...all,
                      [page]: { ...all[page], [f.id]: e.target.value },
                    }));
                    setDirty(true);
                    setNotice("");
                  }}
                />
              </label>
            ))}
        </div>
        <p className="footnote">
          Conference facts, prices, policies, tracks and committee profiles have
          dedicated editors. Text changes preserve the supplied page layout.
        </p>
        <div className="settingsactions">
          <button className="export" disabled={busy || !dirty || !version}>
            {busy ? "Saving�" : "Save & publish text"}
          </button>
          <button
            className="plainbutton"
            type="button"
            disabled={busy}
            onClick={() => {
              if (!dirty || confirm("Discard unsaved text changes?")) load();
            }}
          >
            Reload saved text
          </button>
        </div>
      </form>
    </main>
  );
}

"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
export function AdminSidebar({ slug }: { slug: string }) {
  const params = useParams();
  const s = String(params?.slug || slug),
    p = usePathname();
  return (
    <aside className="sidebar">
      <Link className="adminbrand" href={"/" + s}>
        HANSCI NOVUM<span>ADMIN PORTAL</span>
      </Link>
      <div className="sidelabel">RECORDS & SUBMISSIONS</div>
      <nav>
        {[
          ["all", "Overview"],
          ["registration", "Registrations"],
          ["abstract", "Abstract submissions"],
          ["brochure", "Brochure requests"],
          ["query", "Queries"],
        ].map(([id, t]) => (
          <Link
            className="portal-extra"
            key={id}
            href={"/" + s + "?section=" + id}
          >
            {t}
          </Link>
        ))}
      </nav>
      <div className="sidelabel contentlabel">CONTENT & SETTINGS</div>
      <nav>
        {[
          ["conference", "Conference details"],
          ["prices", "Registration prices"],
          ["accommodation", "Accommodation prices"],
          ["documents", "Document uploads"],
          ["abstract-settings", "Abstract settings"],
          ["policies", "Privacy & terms"],
          ["tracks", "Scientific tracks"],
          ["committee", "Organizing committee"],
          ["page-copy", "Public page text"],
        ].map(([id, t]) => (
          <Link
            className="portal-extra"
            key={id}
            href={"/" + s + "?section=" + id}
          >
            {t}
          </Link>
        ))}
      </nav>
      <details className="extra-navigation" open>
        <summary className="sidelabel contentlabel">
          WEBSITE & OPERATIONS
        </summary>
        <nav>
          {[
            ["content", "Website content & navigation"],
            ["settings", "Conference configuration"],
            ["abstracts", "Abstracts page"],
            ["speakers", "Speakers page"],
            ["registration", "Registration page"],
            ["committee", "Committee page"],
            ["media", "Media library"],
            ["seo", "SEO & metadata"],
            ["registrations", "Registration management"],
            ["submissions", "Abstract review"],
            ["revenue", "Revenue & payments"],
            ["history", "Activity history"],
            ["analytics", "Conference analytics"],
          ].map(([id, t]) => (
            <Link
              className="portal-extra"
              aria-current={p.endsWith("/" + id) ? "page" : undefined}
              key={id}
              href={"/" + s + "/" + id}
            >
              {t}
            </Link>
          ))}
        </nav>
      </details>
      <div className="sidebottom">
        <span>Private administrator workspace</span>
        <a
          href={
            process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000/ICGIT"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Open conference website ↗
        </a>
      </div>
    </aside>
  );
}

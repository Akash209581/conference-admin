"use client";
import { useState } from "react";
import PageCopyEditor from "./page-copy-editor";
import SettingsEditor from "./settings/settings-editor";
const sections = {
  abstracts: [["Page text", ""], ["Submission settings", "Abstract settings"], ["Sample document", "Documents"], ["Scientific tracks", "Scientific tracks"]],
  registration: [["Page text", ""], ["Registration prices", "Registration prices"], ["Accommodation prices", "Accommodation prices"], ["Privacy & terms", "Policies"]],
  committee: [["Page text", ""], ["Committee profiles", "Organizing committee"]],
} as const;
export default function WebsitePageEditor({ page }: { page: keyof typeof sections }) {
  const [tab, setTab] = useState(0);
  return <div>
    <nav className="settingsactions" aria-label="Page editor sections" style={{flexWrap:"wrap",marginBottom:24}}>
      {sections[page].map(([label], index) => <button key={label} type="button" className={tab === index ? "export" : "plainbutton"} aria-pressed={tab === index} onClick={() => setTab(index)}>{label}</button>)}
      <a className="plainbutton" href={(process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000/ICGIT").replace(/\/$/, "") + "/" + page} target="_blank" rel="noopener noreferrer">Preview public page</a>
    </nav>
    <div hidden={tab !== 0}><PageCopyEditor fixedPage={page}/></div>
    <div hidden={tab === 0}><SettingsEditor activeTab={sections[page][tab || 1][1]}/></div>
  </div>;
}

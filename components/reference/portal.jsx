'use client';
import { portalFetch } from '@/lib/portal-fetch';
import { useEffect, useState } from 'react';
import PageCopyEditor from './page-copy-editor';
import Dashboard from './dashboard';
import SettingsEditor from './settings/settings-editor';
import './style.css';
const RECORDS = [['all', 'Overview'], ['registration', 'Registrations'], ['abstract', 'Abstract submissions'], ['brochure', 'Brochure requests'], ['query', 'Queries']];
const SETTINGS = [['conference', 'Conference details', 'Conference details'], ['prices', 'Registration prices', 'Registration prices'], ['accommodation', 'Accommodation prices', 'Accommodation prices'], ['documents', 'Document uploads', 'Documents'], ['abstract-settings', 'Abstract settings', 'Abstract settings'], ['policies', 'Privacy & terms', 'Policies'], ['tracks', 'Scientific tracks', 'Scientific tracks'], ['committee', 'Organizing committee', 'Organizing committee'], ['page-copy','Public page text','Public page text']];
export default function Portal({ email, slug }) {
    const [active, setActive] = useState('all'), [recordTab, setRecordTab] = useState('all'), [contentTab, setContentTab] = useState('Conference details');
    function navigate(id, updateUrl = true) { const setting = SETTINGS.find(s => s[0] === id); setActive(id); if (setting)
        setContentTab(setting[2]);
    else
        setRecordTab(id); if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('section', id);
        window.history.pushState({}, '', url.pathname + url.search);
    } }
    useEffect(() => { function read() { const id = new URL(window.location.href).searchParams.get('section') || 'all'; if ([...RECORDS, ...SETTINGS].some(s => s[0] === id))
        navigate(id, false); } read(); window.addEventListener('popstate', read); return () => window.removeEventListener('popstate', read); }, []);
    const content = SETTINGS.some(s => s[0] === active), label = content ? SETTINGS.find(s => s[0] === active)?.[1] : RECORDS.find(s => s[0] === active)?.[1];
    return <div className="admin unified-portal"><aside className="sidebar"><a className="adminbrand" href={"/conference-admin/"+encodeURIComponent(slug)}>HANSCI NOVUM<span>ADMIN PORTAL</span></a><div className="sidelabel">RECORDS & SUBMISSIONS</div><nav aria-label="Records & submissions">{RECORDS.map(([id, title]) => <button key={id} className={active === id ? 'selected' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}>{title}</button>)}</nav><div className="sidelabel contentlabel">CONTENT & SETTINGS</div><nav aria-label="Content & settings">{SETTINGS.map(([id, title]) => <button key={id} className={active === id ? 'selected' : ''} aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}>{title}</button>)}</nav><details className="extra-navigation" open><summary className="sidelabel contentlabel">WEBSITE & OPERATIONS</summary><nav aria-label="Website and operations">{[["content","Website content & navigation"],["settings","Conference configuration"],["abstracts","Abstracts page"],["speakers","Speakers page"],["registration","Registration page"],["committee","Committee page"],["media","Media library"],["seo","SEO & metadata"],["registrations","Registration management"],["submissions","Abstract review"],["revenue","Revenue & payments"],["history","Activity history"],["analytics","Conference analytics"]].map(([route,title]) => <a className="portal-extra" key={route} href={"/conference-admin/"+encodeURIComponent(slug)+"/"+route}>{title}</a>)}</nav></details><div className="sidebottom"><span>Private administrator workspace</span><a href={process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000/ICGIT"} target="_blank" rel="noopener noreferrer">Open conference website ↗</a><button onClick={async()=>{await portalFetch("/api/auth/logout",{method:"POST"});window.location.assign("/conference-admin/login")}}>Sign out</button></div></aside><div className="workspace"><header className="adminheader"><div><span>Admin Portal</span><span className="portal-breadcrumb"> / {content ? 'Content & Settings' : 'Records & Submissions'} / {label}</span></div><span className="user">{email}</span></header><div hidden={content}><Dashboard activeTab={recordTab} onTabChange={id => navigate(id)}/></div><div hidden={!content}>{contentTab === "Public page text" ? <PageCopyEditor/> : <SettingsEditor activeTab={contentTab}/>}</div></div></div>;
}

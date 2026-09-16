"use client";

import { useState } from "react";
import { ArrowRight, Bot, Code2, BriefcaseBusiness, Search, Sparkles, Plus, Activity, Settings, Home, PanelLeft, X } from "lucide-react";

const types = [
  ["coding", "Coding Agent", "Build, edit, test and ship code.", Code2],
  ["business", "Business Agent", "Workflows, planning and analysis.", BriefcaseBusiness],
  ["research", "Research Agent", "Investigate and organize findings.", Search],
  ["general", "General Agent", "A flexible AI workspace.", Sparkles],
  ["custom", "Custom Agent", "Your instructions, your tools.", Bot],
] as const;

export default function AgentHome() {
  const [open, setOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("coding");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function createAgent() {
    if (!name.trim()) return;
    setBusy(true); setResult(null);
    try {
      const response = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim(), type }) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) { window.location.assign(`https://try.sparkagent.in.net/login?next=${encodeURIComponent(window.location.href)}`); return; }
        throw new Error(data.error || "Could not create agent");
      }
      window.location.assign(data.url);
    } catch (e) { setResult(e instanceof Error ? e.message : "Could not create agent"); setBusy(false); }
  }

  return <main className="min-h-screen bg-[#050508] text-white selection:bg-indigo-500/30">
    <div className="pointer-events-none fixed inset-0 overflow-hidden"><div className="absolute -left-32 top-0 h-[520px] w-[520px] rounded-full bg-indigo-600/10 blur-[130px]"/><div className="absolute right-0 top-[-120px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[.07] blur-[140px]"/><div className="absolute inset-0 opacity-[.025] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:56px_56px]"/></div>
    <div className="relative flex min-h-screen">
      <aside className="hidden w-[250px] shrink-0 border-r border-white/[.07] bg-black/20 px-4 py-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-lg shadow-indigo-500/20"><Sparkles className="h-4 w-4"/></div><div><div className="text-[16px] font-semibold tracking-tight">Spark<span className="text-indigo-400">Agent</span></div><div className="text-[10px] uppercase tracking-[.18em] text-white/25">AI workspace</div></div></div>
        <nav className="mt-10 space-y-1"><a href="/" className="flex items-center gap-3 rounded-xl bg-white/[.07] px-3 py-2.5 text-sm font-medium"><Bot className="h-4 w-4 text-indigo-300"/>Agents</a><a href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45 hover:bg-white/[.04] hover:text-white"><Home className="h-4 w-4"/>Home</a><a href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45 hover:bg-white/[.04] hover:text-white"><Settings className="h-4 w-4"/>Settings</a><a href="https://tiers.sparkagent.in.net" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45 hover:bg-white/[.04] hover:text-white"><Sparkles className="h-4 w-4"/>Plans</a></nav>
        <div className="mt-auto rounded-2xl border border-indigo-400/10 bg-gradient-to-br from-indigo-500/[.09] to-fuchsia-500/[.04] p-4"><div className="flex items-center gap-2 text-xs font-medium"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.7)]"/>Platform online</div><p className="mt-2 text-xs leading-5 text-white/35">Create an agent and open its dedicated workspace.</p></div>
      </aside>
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-white/[.07] bg-[#050508]/75 px-5 py-4 backdrop-blur-xl sm:px-8"><div className="flex items-center justify-between"><button onClick={() => setMobileNav(true)} className="rounded-lg p-2 text-white/60 lg:hidden"><PanelLeft className="h-5 w-5"/></button><div className="lg:hidden text-[16px] font-semibold">Spark<span className="text-indigo-400">Agent</span></div><div className="hidden text-sm text-white/30 lg:block">Workspace / Agents</div><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/5 hover:bg-white/90"><Plus className="h-4 w-4"/> New agent</button></div></header>
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="max-w-3xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/15 bg-indigo-500/[.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-indigo-300"><span className="h-1.5 w-1.5 rounded-full bg-indigo-300"/>Agent studio</div><h1 className="text-4xl font-semibold tracking-[-.04em] sm:text-6xl">Build agents that <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">actually work.</span></h1><p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/40 sm:text-base">Create specialized AI workspaces for coding, research, business and more. Every agent gets its own persistent workspace.</p></div>
          <div className="mt-12 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white/80">Create from a template</h2><p className="mt-1 text-xs text-white/25">Start with a focused capability.</p></div><div className="hidden items-center gap-2 text-xs text-white/25 sm:flex"><Activity className="h-3.5 w-3.5 text-emerald-400"/> All systems operational</div></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{types.map(([key,title,description,Icon]) => <button key={key} onClick={() => { setType(key); setOpen(true); }} className="group relative overflow-hidden rounded-2xl border border-white/[.08] bg-white/[.025] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/[.045] hover:shadow-2xl hover:shadow-indigo-950/20"><div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/10 blur-2xl opacity-0 transition group-hover:opacity-100"/><div className="relative flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.07] bg-gradient-to-br from-white/[.07] to-white/[.02] text-indigo-300"><Icon className="h-5 w-5"/></div><ArrowRight className="h-4 w-4 text-white/15 transition group-hover:translate-x-1 group-hover:text-white/70"/></div><h3 className="relative mt-6 text-[15px] font-semibold">{title}</h3><p className="relative mt-2 text-sm leading-6 text-white/35">{description}</p></button>)}</div>
          <div className="mt-8 rounded-2xl border border-white/[.07] bg-gradient-to-r from-white/[.035] to-white/[.015] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300"><Activity className="h-4 w-4"/></div><div><p className="text-sm font-medium">Ready for your first agent</p><p className="mt-0.5 text-xs text-white/30">No agents? Create one above to get a unique workspace URL.</p></div></div></div>
        </div>
      </section>
    </div>
    {mobileNav && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/70" onClick={() => setMobileNav(false)}/><aside className="relative h-full w-72 border-r border-white/10 bg-[#09090d] p-5"><button onClick={() => setMobileNav(false)} className="absolute right-4 top-4 text-white/40"><X className="h-5 w-5"/></button><div className="flex items-center gap-3 px-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500"><Sparkles className="h-4 w-4"/></div><b>Spark<span className="text-indigo-400">Agent</span></b></div><nav className="mt-10 space-y-2"><a href="/" className="block rounded-xl bg-white/[.07] px-3 py-3 text-sm">Agents</a><a href="/settings" className="block rounded-xl px-3 py-3 text-sm text-white/50">Settings</a><a href="https://tiers.sparkagent.in.net" className="block rounded-xl px-3 py-3 text-sm text-white/50">Plans</a></nav></aside></div>}
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"><div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0b10] p-7 shadow-2xl shadow-black/50"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-indigo-300">New workspace</p><h2 className="mt-2 text-2xl font-semibold">Create an agent</h2><p className="mt-1 text-sm text-white/35">Give your agent a name and starting capability.</p></div><button onClick={() => setOpen(false)} className="rounded-lg p-1 text-white/30 hover:text-white"><X className="h-5 w-5"/></button></div><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Coding Agent" className="mt-7 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm outline-none placeholder:text-white/20 focus:border-indigo-400/50" autoFocus/><div className="mt-4 grid gap-2 sm:grid-cols-2">{types.map(([key,title,description,Icon]) => <button key={key} type="button" onClick={() => setType(key)} className={`rounded-xl border p-3.5 text-left transition ${type === key ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/[.07] bg-white/[.02] hover:bg-white/[.04]"}`}><div className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-indigo-300"/><span className="text-sm font-medium">{title}</span></div><p className="mt-1.5 text-[11px] text-white/30">{description}</p></button>)}</div>{result && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-300">{result}</p>}<button disabled={busy || !name.trim()} onClick={createAgent} className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-500/10 disabled:opacity-30">{busy ? "Creating…" : "Create workspace"}</button></div></div>}
  </main>;
}

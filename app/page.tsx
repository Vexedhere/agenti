"use client";

import { useState } from "react";
import { ArrowRight, Bot, Code2, BriefcaseBusiness, Search, Sparkles, Plus, Command, Activity, Layers3 } from "lucide-react";

const types = [
  ["coding", "Coding Agent", "Build, edit, test and ship code.", Code2],
  ["business", "Business Agent", "Workflows, planning and analysis.", BriefcaseBusiness],
  ["research", "Research Agent", "Investigate and organize findings.", Search],
  ["general", "General Agent", "A flexible AI workspace.", Sparkles],
  ["custom", "Custom Agent", "Your instructions, your tools.", Bot],
] as const;

export default function AgentHome() {
  const [open, setOpen] = useState(false);
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
        if (response.status === 401) {
          window.location.assign(`https://try.sparkagent.in.net/login?next=${encodeURIComponent(window.location.href)}`);
          return;
        }
        throw new Error(data.error || "Could not create agent");
      }
      window.location.assign(data.url);
    } catch (e) { setResult(e instanceof Error ? e.message : "Could not create agent"); setBusy(false); }
  }

  return <main className="min-h-screen bg-[#050507] text-white">
    <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(99,102,241,.16),transparent_32%),radial-gradient(circle_at_10%_40%,rgba(168,85,247,.08),transparent_28%)]" />
    <div className="relative mx-auto flex min-h-screen max-w-[1500px]">
      <aside className="hidden w-64 shrink-0 border-r border-white/[.07] px-5 py-6 lg:block">
        <div className="flex items-center gap-2.5 px-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-indigo-300"><Sparkles className="h-4 w-4" /></span><span className="text-[17px] font-semibold tracking-tight">Spark<span className="text-indigo-400">Agent</span></span></div>
        <nav className="mt-10 space-y-1 text-sm"><div className="rounded-xl bg-white/[.07] px-3 py-2.5 text-white"><Layers3 className="mr-3 inline h-4 w-4 text-indigo-300" />Agents</div><a href="https://try.sparkagent.in.net/home" className="block rounded-xl px-3 py-2.5 text-white/45 hover:bg-white/[.04] hover:text-white">Home</a><a href="https://tiers.sparkagent.in.net" className="block rounded-xl px-3 py-2.5 text-white/45 hover:bg-white/[.04] hover:text-white">Plans</a></nav>
        <div className="absolute bottom-7 w-52 rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-xs font-medium text-white/70">SparkAgent platform</p><p className="mt-1 text-xs leading-5 text-white/35">Your agents live here. Each gets its own secure workspace.</p></div>
      </aside>
      <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-white/[.07] pb-5"><div className="lg:hidden text-[17px] font-semibold">Spark<span className="text-indigo-400">Agent</span></div><div className="hidden lg:block text-sm text-white/35">Agent workspace</div><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"><Plus className="h-4 w-4" /> New agent</button></header>
        <div className="mx-auto max-w-6xl py-12 sm:py-16">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-indigo-300">Your workspace</p><h1 className="text-4xl font-semibold tracking-[-.03em] sm:text-5xl">Build agents that do work.</h1><p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/40">Create specialized AI agents with dedicated workspaces, tools and execution capabilities.</p></div><div className="hidden items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-xs text-white/35 md:flex"><Command className="h-3.5 w-3.5" /> Agent platform</div></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{types.map(([key,title,description,Icon]) => <button key={key} onClick={() => { setType(key); setOpen(true); }} className="group rounded-2xl border border-white/[.08] bg-white/[.025] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-400/25 hover:bg-white/[.045]"><div className="flex items-start justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.035] text-indigo-300"><Icon className="h-5 w-5" /></div><ArrowRight className="h-4 w-4 text-white/20 transition group-hover:translate-x-1 group-hover:text-white/60" /></div><h2 className="mt-6 text-[16px] font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-white/35">{description}</p></button>)}</div>
          <div className="mt-10 rounded-2xl border border-white/[.07] bg-white/[.02] p-5"><div className="flex items-center gap-3"><Activity className="h-4 w-4 text-emerald-300" /><span className="text-sm font-medium">Platform ready</span><span className="ml-auto text-xs text-white/25">LIVE</span></div></div>
        </div>
      </section>
    </div>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md"><div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0c0c10] p-7 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">New agent</p><h2 className="mt-2 text-2xl font-semibold">Create workspace</h2></div><button onClick={() => setOpen(false)} className="text-white/30 hover:text-white">×</button></div><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Spark Coding Agent" className="mt-7 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm outline-none placeholder:text-white/20 focus:border-indigo-400/50" autoFocus /><div className="mt-4 grid gap-2 sm:grid-cols-2">{types.map(([key,title,description,Icon]) => <button key={key} type="button" onClick={() => setType(key)} className={`rounded-xl border p-3.5 text-left ${type === key ? "border-indigo-400/40 bg-indigo-500/10" : "border-white/[.07] bg-white/[.02] hover:bg-white/[.04]"}`}><div className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-indigo-300" /><span className="text-sm font-medium">{title}</span></div><p className="mt-1.5 text-[11px] text-white/30">{description}</p></button>)}</div>{result && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-300">{result}</p>}<button disabled={busy || !name.trim()} onClick={createAgent} className="mt-5 w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-30">{busy ? "Creating…" : "Create agent"}</button></div></div>}
  </main>;
}

"use client";

import { useState } from "react";
import { Bot, Code2, BriefcaseBusiness, Search, Sparkles, Plus, ArrowRight } from "lucide-react";

const types = [
  ["coding", "Coding Agent", "Build, edit, test and ship code with GitHub.", Code2],
  ["business", "Business Agent", "Handle business research, planning and workflows.", BriefcaseBusiness],
  ["research", "Research Agent", "Investigate topics and organize sourced findings.", Search],
  ["general", "General Agent", "A flexible AI agent for everyday tasks.", Sparkles],
  ["custom", "Custom Agent", "Define your own instructions and capabilities.", Bot],
] as const;

export default function AgentHome() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("coding");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function createAgent() {
    setBusy(true); setResult(null);
    const response = await fetch("/api/agents", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, type }) });
    const data = await response.json();
    if (!response.ok) setResult(data.error || "Could not create agent");
    else setResult(data.url);
    setBusy(false);
  }

  return <main className="grid glow min-h-screen"><div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
    <header className="flex items-center justify-between"><div className="flex items-center gap-2 text-xl font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300"><Sparkles className="h-4 w-4" /></span> Spark<span className="text-indigo-400">Agent</span></div><a href="https://try.sparkagent.in.net/home" className="text-sm text-white/50 hover:text-white">Home</a></header>
    <section className="py-20"><p className="text-sm font-medium text-indigo-300">Agent platform</p><h1 className="mt-3 text-5xl font-semibold tracking-tight">Create your AI workforce.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/50">Build specialized agents for coding, business, research and more. Every agent gets its own unique workspace URL.</p><button onClick={() => setOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-medium transition hover:bg-indigo-400"><Plus className="h-5 w-5" /> Create agent</button></section>
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{types.map(([key,title,description,Icon]) => <button key={key} onClick={() => { setType(key); setOpen(true); }} className="rounded-2xl border border-white/10 bg-white/[.035] p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:bg-white/[.06]"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Icon className="h-5 w-5" /></div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-white/45">{description}</p><span className="mt-5 inline-flex items-center gap-1 text-sm text-white/65">Configure <ArrowRight className="h-4 w-4" /></span></button>)}</section>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"><div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111116] p-7 shadow-2xl"><h2 className="text-xl font-semibold">Create an agent</h2><p className="mt-1 text-sm text-white/45">Give your agent a name and type.</p><input value={name} onChange={e => setName(e.target.value)} placeholder="My Coding Agent" className="mt-6 w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm outline-none focus:border-indigo-400/50" /><select value={type} onChange={e => setType(e.target.value)} className="mt-3 w-full rounded-xl border border-white/10 bg-[#18181e] px-4 py-3 text-sm outline-none">{types.map(([key,title]) => <option key={key} value={key}>{title}</option>)}</select><div className="mt-6 flex gap-3"><button onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60">Cancel</button><button disabled={busy || !name.trim()} onClick={createAgent} className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium disabled:opacity-40">{busy ? "Creating…" : "Create"}</button></div>{result && <p className="mt-4 break-all rounded-lg bg-white/[.04] p-3 text-sm text-indigo-200">{result}</p>}</div></div>}
  </div></main>;
}

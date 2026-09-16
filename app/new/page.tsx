"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bot, BriefcaseBusiness, Code2, Search, Sparkles } from "lucide-react";

const types = [
  ["coding", "Coding Agent", "Build, edit, test and ship code with GitHub.", Code2],
  ["business", "Business Agent", "Handle business research, planning and workflows.", BriefcaseBusiness],
  ["research", "Research Agent", "Investigate topics and organize sourced findings.", Search],
  ["general", "General Agent", "A flexible AI agent for everyday tasks.", Sparkles],
  ["custom", "Custom Agent", "Define your own instructions and capabilities.", Bot],
] as const;

export default function NewAgentPage() {
  const search = useSearchParams();
  const initialType = search.get("type");
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(types.some(([key]) => key === initialType) ? initialType! : "coding");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAgent() {
    if (!name.trim()) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign(`https://try.sparkagent.in.net/?auth=required&next=${encodeURIComponent(window.location.href)}`);
          return;
        }
        throw new Error(data.error || "Could not create agent");
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create agent");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
        <a href="https://try.sparkagent.in.net/home" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to SparkAgent Home</a>
        <section className="mt-14 rounded-3xl border border-white/10 bg-white/[.035] p-7 shadow-2xl md:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Sparkles className="h-6 w-6" /></div>
          <p className="mt-7 text-sm font-medium text-indigo-300">New agent</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Create your AI agent</h1>
          <p className="mt-3 text-white/50">Choose a type, give it a name, and SparkAgent will create a unique workspace.</p>

          <label className="mt-8 block text-sm text-white/65">Agent name</label>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") createAgent(); }} placeholder="My Coding Agent" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-indigo-400/50" autoFocus />

          <label className="mt-6 block text-sm text-white/65">Agent type</label>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {types.map(([key, title, description, Icon]) => (
              <button key={key} type="button" onClick={() => setType(key)} className={`rounded-xl border p-4 text-left transition ${type === key ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/10 bg-black/10 hover:bg-white/[.04]"}`}>
                <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-300" /><span className="font-medium">{title}</span></div>
                <p className="mt-2 text-xs leading-5 text-white/40">{description}</p>
              </button>
            ))}
          </div>

          {error && <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[.06] p-3 text-sm text-red-300">{error}</p>}
          <button disabled={busy || !name.trim()} onClick={createAgent} className="mt-7 w-full rounded-xl bg-indigo-500 px-5 py-3.5 font-medium transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Creating agent…" : "Create agent"}</button>
        </section>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Code2, BriefcaseBusiness, Search, Sparkles, Bot } from "lucide-react";

const labels: Record<string,string> = { coding: "Coding Agent", business: "Business Agent", research: "Research Agent", general: "General Agent", custom: "Custom Agent" };

export default async function AgentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: agent } = await supabase.from("agents").select("id,name,type,code,created_at").eq("code", code).eq("owner_id", user.id).maybeSingle();
  if (!agent) notFound();
  const Icon = agent.type === "coding" ? Code2 : agent.type === "business" ? BriefcaseBusiness : agent.type === "research" ? Search : agent.type === "custom" ? Bot : Sparkles;
  return <main className="min-h-screen bg-[#07070a] text-white"><div className="mx-auto max-w-7xl px-6 py-8 lg:px-10"><header className="flex items-center justify-between border-b border-white/10 pb-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Icon className="h-5 w-5" /></div><div><h1 className="font-semibold">{agent.name}</h1><p className="text-xs text-white/40">{labels[agent.type]} · /{agent.code}</p></div></div></header><section className="grid min-h-[70vh] place-items-center py-16 text-center"><div><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] text-indigo-300"><Icon className="h-7 w-7" /></div><h2 className="mt-6 text-3xl font-semibold">{agent.name}</h2><p className="mx-auto mt-3 max-w-xl text-white/45">Your {labels[agent.type].toLowerCase()} workspace is ready. The execution tools for this agent type can be connected without changing its unique URL.</p></div></section></div></main>;
}

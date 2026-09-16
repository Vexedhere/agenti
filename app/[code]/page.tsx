import { notFound } from "next/navigation";
import { Code2, BriefcaseBusiness, Search, Sparkles, Bot } from "lucide-react";

const labels: Record<string, string> = {
  coding: "Coding Agent",
  business: "Business Agent",
  research: "Research Agent",
  general: "General Agent",
  custom: "Custom Agent",
};

const descriptions: Record<string, string> = {
  coding: "Inspect repositories, edit files, run commands, review diffs and prepare Git operations.",
  business: "Plan business workflows, analyze information and organize actionable work.",
  research: "Research topics, collect evidence and organize findings into useful answers.",
  general: "A flexible workspace for everyday tasks, planning and problem solving.",
  custom: "A configurable agent workspace based on your own instructions and tools.",
};

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  // Resolve the agent by its unique public workspace code. Authentication is
  // intentionally not used as a reason to render Next.js's 404 page: the
  // launcher and agent app are separate subdomains and their browser cookies
  // are not automatically shared. Consequential actions will still be
  // authenticated by their API routes.
  const { data: agent } = await supabase
    .from("agents")
    .select("id,name,type,code,created_at")
    .eq("code", code)
    .maybeSingle();

  if (!agent) notFound();

  const Icon = agent.type === "coding"
    ? Code2
    : agent.type === "business"
      ? BriefcaseBusiness
      : agent.type === "research"
        ? Search
        : agent.type === "custom"
          ? Bot
          : Sparkles;

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">{agent.name}</h1>
              <p className="text-xs text-white/40">{labels[agent.type] ?? "AI Agent"} · /{agent.code}</p>
            </div>
          </div>
          <a href="https://try.sparkagent.in.net/home" className="text-sm text-white/50 transition hover:text-white">
            SparkAgent Home
          </a>
        </header>

        <section className="grid flex-1 place-items-center py-16">
          <div className="w-full max-w-4xl">
            <div className="rounded-3xl border border-white/10 bg-white/[.035] p-8 shadow-2xl shadow-indigo-950/20 md:p-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                <Icon className="h-7 w-7" />
              </div>
              <p className="mt-7 text-sm font-medium text-indigo-300">{labels[agent.type] ?? "AI Agent"}</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight">{agent.name}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
                {descriptions[agent.type] ?? "Your dedicated AI agent workspace."}
              </p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-white/35">Workspace</p>
                  <p className="mt-2 text-sm text-white/75">/{agent.code}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-white/35">Agent type</p>
                  <p className="mt-2 text-sm capitalize text-white/75">{agent.type}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-white/35">Status</p>
                  <p className="mt-2 text-sm text-emerald-300">Ready</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-indigo-400/15 bg-indigo-500/[.06] p-5">
                <p className="font-medium">Agent workspace initialized</p>
                <p className="mt-1 text-sm leading-6 text-white/45">
                  This is the real agent route created from your database record, not a static 404 fallback. Tool execution and consequential operations must authenticate through their server APIs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

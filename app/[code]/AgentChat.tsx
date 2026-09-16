"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  Copy,
  Menu,
  Paperclip,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  User,
  X,
} from "lucide-react";

type Agent = { id: string; name: string; type: string; code: string };
type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: number };

const starters = [
  ["Build something", "Help me build and structure a new project"],
  ["Write code", "Write clean production-ready code for me"],
  ["Explain", "Explain a difficult concept clearly"],
  ["Plan a task", "Turn my goal into an actionable plan"],
];

function renderText(text: string) {
  return text.split(/\n\n+/).map((block, i) => (
    <p key={i} className="whitespace-pre-wrap leading-7">{block}</p>
  ));
}

export default function AgentChat({ agent }: { agent: Agent }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [sidebar, setSidebar] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const greeting = useMemo(() => `Hi! I’m ${agent.name}. Tell me what you want to accomplish and I’ll help you work through it.`, [agent.name]);

  useEffect(() => {
    const raw = localStorage.getItem(`sparkagent-chat-${agent.code}`);
    if (raw) {
      try { setMessages(JSON.parse(raw)); } catch { localStorage.removeItem(`sparkagent-chat-${agent.code}`); }
    }
  }, [agent.code]);

  useEffect(() => {
    localStorage.setItem(`sparkagent-chat-${agent.code}`, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, agent.code]);

  async function send(text = input) {
    const value = text.trim();
    if (!value || busy) return;
    setInput(""); setError(""); setBusy(true);
    const user: Message = { id: crypto.randomUUID(), role: "user", content: value, createdAt: Date.now() };
    const next = [...messages, user];
    setMessages(next);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          agent: { name: agent.name, type: agent.type, code: agent.code },
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "The agent could not complete the request.");
      const answer = String(data.message || "I didn't receive a response from the model.");
      setMessages([...next, { id: crypto.randomUUID(), role: "assistant", content: answer, createdAt: Date.now() }]);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false); abortRef.current = null;
    }
  }

  function submit(e: FormEvent) { e.preventDefault(); void send(); }
  function newChat() { abortRef.current?.abort(); setBusy(false); setError(""); setMessages([]); }
  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id); setTimeout(() => setCopied(null), 1400);
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_70%_0%,rgba(99,102,241,.11),transparent_32%),radial-gradient(circle_at_15%_100%,rgba(168,85,247,.07),transparent_30%)]" />
      {sidebar && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setSidebar(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-white/[.07] bg-[#0a0a0e]/95 px-4 py-4 backdrop-blur-2xl transition-transform lg:relative lg:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2 py-1">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-fuchsia-500 shadow-lg shadow-indigo-500/20"><Sparkles className="h-4 w-4" /></div>
            <div><div className="text-[15px] font-semibold">Spark<span className="text-indigo-400">Agent</span></div><div className="text-[9px] uppercase tracking-[.2em] text-white/25">AI workspace</div></div>
          </a>
          <button className="rounded-lg p-2 text-white/35 hover:bg-white/5 hover:text-white lg:hidden" onClick={() => setSidebar(false)}><X className="h-4 w-4" /></button>
        </div>
        <button onClick={newChat} className="mt-7 flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] px-3.5 py-3 text-sm font-medium transition hover:bg-white/[.07]"><Plus className="h-4 w-4 text-indigo-300" /> New chat <span className="ml-auto text-[10px] text-white/20">⌘ K</span></button>
        <div className="mt-8 px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/25">Current agent</div>
        <div className="mt-3 rounded-2xl border border-indigo-400/10 bg-indigo-500/[.06] p-3.5">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.06] text-indigo-300"><Bot className="h-4 w-4" /></div><div className="min-w-0"><div className="truncate text-sm font-medium">{agent.name}</div><div className="mt-0.5 text-[11px] capitalize text-white/30">{agent.type} agent</div></div></div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-emerald-300/80"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Online</div>
        </div>
        <div className="mt-auto space-y-1 border-t border-white/[.06] pt-4"><a href="/" className="block rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/[.04] hover:text-white">← All agents</a><a href="https://tiers.sparkagent.in.net" className="block rounded-xl px-3 py-2.5 text-sm text-white/40 hover:bg-white/[.04] hover:text-white">Plans</a></div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[.07] bg-[#07070a]/75 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><button onClick={() => setSidebar(true)} className="rounded-lg p-2 text-white/50 hover:bg-white/5 lg:hidden"><Menu className="h-5 w-5" /></button><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Bot className="h-4 w-4" /></div><div className="min-w-0"><div className="truncate text-sm font-semibold">{agent.name}</div><div className="flex items-center gap-1.5 text-[10px] text-white/25"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Ready</div></div></div>
          <div className="flex items-center gap-1"><button onClick={newChat} title="New chat" className="rounded-xl p-2.5 text-white/35 hover:bg-white/5 hover:text-white"><RotateCcw className="h-4 w-4" /></button><button className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs text-white/35 hover:bg-white/5 hover:text-white">Auto <ChevronDown className="h-3 w-3" /></button></div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-4 pb-36 pt-10 sm:px-8 sm:pt-14">
            {messages.length === 0 ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border border-indigo-300/15 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 shadow-2xl shadow-indigo-950/30"><div className="absolute inset-0 rounded-[26px] bg-indigo-400/10 blur-xl" /><Sparkles className="relative h-8 w-8 text-indigo-300" /></div>
                <p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-indigo-300/80">SparkAgent</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{greeting}</h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/35">A focused workspace for getting real work done. Ask a question, describe a task, or paste something you want me to work on.</p>
                <div className="mt-9 grid w-full max-w-2xl gap-2 sm:grid-cols-2">{starters.map(([title, prompt]) => <button key={title} onClick={() => void send(prompt)} className="group rounded-2xl border border-white/[.07] bg-white/[.025] p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/20 hover:bg-white/[.045]"><div className="text-sm font-medium">{title}</div><div className="mt-1 text-xs leading-5 text-white/30">{prompt}</div></button>)}</div>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map(m => <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Sparkles className="h-4 w-4" /></div>}
                  <div className={`max-w-[88%] ${m.role === "user" ? "rounded-2xl rounded-tr-md bg-white/[.08] px-4 py-3 text-sm text-white/90" : "min-w-0 flex-1 pt-1 text-[15px] text-white/75"}`}>
                    {m.role === "assistant" ? renderText(m.content) : <p className="whitespace-pre-wrap leading-6">{m.content}</p>}
                    {m.role === "assistant" && <div className="mt-3 flex items-center gap-1"><button onClick={() => void copy(m.id, m.content)} className="rounded-lg p-1.5 text-white/20 hover:bg-white/5 hover:text-white/60">{copied === m.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button></div>}
                  </div>
                  {m.role === "user" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[.06] text-white/40"><User className="h-4 w-4" /></div>}
                </div>)}
                {busy && <div className="flex gap-4"><div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300"><Sparkles className="h-4 w-4" /></div><div className="flex items-center gap-1 pt-2"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300 [animation-delay:-.2s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300 [animation-delay:-.1s]"/><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-300"/></div></div>}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#07070a] via-[#07070a] to-transparent px-4 pb-4 pt-10 sm:px-8">
          <form onSubmit={submit} className="mx-auto max-w-4xl">
            {error && <div className="mb-2 flex items-center justify-between rounded-xl border border-red-400/15 bg-red-500/[.06] px-3 py-2 text-xs text-red-300"><span>{error}</span><button type="button" onClick={() => setError("")}><X className="h-3.5 w-3.5" /></button></div>}
            <div className="rounded-[22px] border border-white/[.1] bg-[#101015]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl focus-within:border-indigo-400/25">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} disabled={busy} rows={1} placeholder={`Message ${agent.name}…`} className="max-h-40 min-h-12 w-full resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/20 disabled:opacity-50" />
              <div className="flex items-center justify-between px-1 pb-1"><button type="button" className="rounded-xl p-2 text-white/25 hover:bg-white/5 hover:text-white/60"><Paperclip className="h-4 w-4" /></button><div className="flex items-center gap-2"><span className="hidden text-[10px] text-white/20 sm:block">Enter to send · Shift + Enter for newline</span><button type={busy ? "button" : "submit"} onClick={busy ? () => abortRef.current?.abort() : undefined} disabled={!busy && !input.trim()} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-20">{busy ? <Square className="h-3.5 w-3.5 fill-current" /> : <ArrowUp className="h-4 w-4" />}</button></div></div>
            </div>
            <p className="mt-2 text-center text-[10px] text-white/15">SparkAgent can make mistakes. Review important information before acting on it.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

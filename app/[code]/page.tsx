import { notFound } from "next/navigation";
import AgentChat from "./AgentChat";

export const dynamic = "force-dynamic";

export default async function AgentPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: agent } = await supabase
    .from("agents")
    .select("id,name,type,code")
    .eq("code", code)
    .maybeSingle();

  if (!agent) notFound();

  return <AgentChat agent={agent} />;
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

const TYPES = new Set(["coding", "business", "research", "general", "custom"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { name?: string; type?: string } | null;
  const name = body?.name?.trim();
  const type = body?.type?.trim();
  if (!name || name.length > 80 || !type || !TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid agent name or type" }, { status: 400 });
  }

  const code = `${randomBytes(3).toString("hex")}-${randomBytes(2).toString("hex")}`;
  const { data, error } = await supabase.from("agents").insert({ owner_id: user.id, name, type, code }).select("id,name,type,code").single();
  if (error) return NextResponse.json({ error: "Could not create agent", detail: error.message }, { status: 500 });

  return NextResponse.json({ agent: data, url: `https://agent.sparkagent.in.net/${data.code}` }, { status: 201 });
}
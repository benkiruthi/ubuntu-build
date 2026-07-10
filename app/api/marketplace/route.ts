import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const county = searchParams.get("county");
  const userType = searchParams.get("user_type");
  const query = searchParams.get("q");

  const supabase = await createClient();

  let q = supabase
    .from("profiles")
    .select("id, full_name, user_type, county, avatar_url, created_at")
    .eq("listed_on_marketplace", true)
    .eq("onboarding_complete", true)
    .not("full_name", "is", null);

  if (county) q = q.eq("county", county);
  if (userType) q = q.eq("user_type", userType);
  if (query) q = q.ilike("full_name", `%${query}%`);

  const { data, error } = await q
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

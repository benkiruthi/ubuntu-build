import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48)
    + "-" + Math.random().toString(36).slice(2, 6);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return orgs where the user is a member
  const { data } = await supabase
    .from("org_members")
    .select("role, organization:organizations(id, name, slug, plan, logo_url, created_at)")
    .eq("user_id", user.id);

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Organization name required" }, { status: 400 });
  }

  const service = await createServiceClient();

  const { data: org, error } = await service
    .from("organizations")
    .insert({ name: body.name.trim(), slug: slugify(body.name), owner_id: user.id })
    .select("id, name, slug")
    .single();

  if (error || !org) {
    return NextResponse.json({ error: error?.message ?? "Failed to create org" }, { status: 500 });
  }

  // Add creator as admin member
  await service.from("org_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "admin",
  });

  await service.from("audit_logs").insert({
    user_id: user.id,
    action: "create_organization",
    resource_type: "organization",
    resource_id: org.id,
    metadata: { name: org.name },
  });

  return NextResponse.json(org, { status: 201 });
}

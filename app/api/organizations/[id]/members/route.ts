import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is a member of this org
  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .single();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { data } = await supabase
    .from("org_members")
    .select("role, user_id, joined_at, profile:profiles(full_name, email, avatar_url, user_type)")
    .eq("org_id", id);

  return NextResponse.json(data ?? []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admins can invite
  const { data: membership } = await supabase
    .from("org_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const service = await createServiceClient();

  // Find user by email
  const { data: invitee } = await service
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", body.email.toLowerCase().trim())
    .single();

  if (!invitee) {
    return NextResponse.json(
      { error: "No Ebbli Build account found with that email. Ask them to sign up first." },
      { status: 404 }
    );
  }

  // Check not already a member
  const { data: existing } = await supabase
    .from("org_members")
    .select("id")
    .eq("org_id", id)
    .eq("user_id", invitee.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already a member of this organization" }, { status: 409 });
  }

  await service.from("org_members").insert({
    org_id: id,
    user_id: invitee.id,
    role: body.role ?? "member",
  });

  await service.from("notifications").insert({
    user_id: invitee.id,
    type: "system",
    title: "You've been added to an organization",
    body: `You now have access to shared projects in this workspace.`,
    link: "/settings/organization",
  });

  return NextResponse.json({ success: true, member: invitee });
}

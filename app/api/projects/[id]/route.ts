import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../../lib/supabase/server";
import { updateProjectSchema } from "../../../../lib/validations/project";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const result = updateProjectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 422 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: any = { ...result.data };

  const { data, error } = await supabase
    .from("projects")
    .update(updatePayload)
    .eq("id", id)
    .eq("owner_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Soft delete
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const service = await createServiceClient();
  await service.from("audit_logs").insert({
    user_id: user.id,
    action: "delete_project",
    resource_type: "project",
    resource_id: id,
    metadata: {},
  });

  return new NextResponse(null, { status: 204 });
}

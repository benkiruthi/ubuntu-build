import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../../lib/supabase/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const jar = await cookies();
  const adminSession = jar.get("admin_session")?.value;

  if (!process.env.ADMIN_SECRET || adminSession !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({ listed_on_marketplace: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

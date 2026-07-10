import { redirect } from "next/navigation";
import { createServiceClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) redirect("/dashboard");

  // Check payment status
  const supabase = await createServiceClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("status, purpose, metadata")
    .eq("id", paymentId)
    .single();

  if (!payment) redirect("/settings/billing?status=error");

  if (payment.status === "completed") {
    if (payment.purpose === "subscription") {
      redirect("/settings/billing?status=success");
    }
    const meta = payment.metadata as Record<string, string> | null;
    if (meta?.projectId) {
      redirect(`/projects/${meta.projectId}?status=unlocked`);
    }
  }

  // Payment pending or failed — Pesapal webhook will update asynchronously
  redirect("/settings/billing?status=pending");
}

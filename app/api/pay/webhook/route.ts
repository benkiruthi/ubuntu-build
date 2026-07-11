import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { getTransactionStatus } from "../../../../lib/pesapal";
import { sendEmail } from "../../../../lib/email/send";
import { subscriptionConfirmEmail, paymentFailedEmail } from "../../../../lib/email/templates";

// ⚠️  HIGH-RISK: handles real M-Pesa payments.
// Any changes to this file must be reviewed before deployment.

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.OrderTrackingId || !body?.OrderMerchantReference) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { OrderTrackingId, OrderMerchantReference } = body;

  const supabase = await createServiceClient();

  // Look up the payment by Pesapal tracking ID or our internal ID
  const { data: payment } = await supabase
    .from("payments")
    .select("id, user_id, purpose, amount_kes, metadata")
    .or(`pesapal_tracking_id.eq.${OrderTrackingId},id.eq.${OrderMerchantReference}`)
    .single();

  if (!payment) {
    // Not found — may be a replay or wrong env; return 200 to stop Pesapal retries
    return NextResponse.json({ message: "Payment not found" });
  }

  // Verify status with Pesapal
  let statusInfo: { status: string; paymentMethod: string; amount: number };
  try {
    statusInfo = await getTransactionStatus(OrderTrackingId);
  } catch {
    return NextResponse.json({ error: "Status check failed" }, { status: 502 });
  }

  const completed = statusInfo.status === "Completed";
  const failed = statusInfo.status === "Failed";

  // Update payment record
  await supabase
    .from("payments")
    .update({
      status: completed ? "completed" : failed ? "failed" : "pending",
      pesapal_tracking_id: OrderTrackingId,
      pesapal_order_id: OrderMerchantReference,
    })
    .eq("id", payment.id);

  if (!completed) {
    if (failed) {
      const { data: failedProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", payment.user_id)
        .single();
      if (failedProfile?.email) {
        const { subject, html } = paymentFailedEmail(failedProfile.full_name ?? "", payment.amount_kes);
        sendEmail({ to: failedProfile.email, subject, html }).catch(console.error);
      }
    }
    return NextResponse.json({ message: "Payment not completed" });
  }

  // Fulfil based on purpose
  if (payment.purpose === "subscription") {
    const tier = (payment.metadata as Record<string, string>)?.tier ?? "starter";
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await supabase
      .from("profiles")
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq("id", payment.user_id);

    await supabase.from("notifications").insert({
      user_id: payment.user_id,
      type: "payment",
      title: "Subscription activated 🎉",
      body: `Your ${tier} plan is now active. Enjoy your new AI modules!`,
      link: "/dashboard",
    });

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", payment.user_id)
      .single();
    if (profile?.email) {
      const { subject, html } = subscriptionConfirmEmail(
        profile.full_name ?? "",
        tier,
        expiresAt.toISOString()
      );
      sendEmail({ to: profile.email, subject, html }).catch(console.error);
    }
  }

  if (payment.purpose === "phase_unlock") {
    const { projectId, phase } = payment.metadata as { projectId: string; phase: string };
    if (projectId && phase) {
      const { data: proj } = await supabase
        .from("projects")
        .select("phases_unlocked")
        .eq("id", projectId)
        .single();

      if (proj) {
        const updated = Array.from(new Set([...proj.phases_unlocked, phase]));
        await supabase
          .from("projects")
          .update({ phases_unlocked: updated })
          .eq("id", projectId);
      }
    }
  }

  return NextResponse.json({ message: "OK" });
}

export async function GET(request: Request) {
  // Pesapal sometimes sends a GET for IPN verification
  return NextResponse.json({ status: "ok" });
}

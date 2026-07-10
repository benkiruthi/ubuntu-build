import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "../../../lib/supabase/server";
import { submitOrder } from "../../../lib/pesapal";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.purpose || !body?.amount_kes) {
    return NextResponse.json({ error: "Missing purpose or amount_kes" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .single();

  const service = await createServiceClient();

  // Create pending payment record
  const { data: payment, error: payErr } = await service
    .from("payments")
    .insert({
      user_id: user.id,
      amount_kes: body.amount_kes,
      purpose: body.purpose,
      status: "pending",
      metadata: body.metadata ?? {},
    })
    .select("id")
    .single();

  if (payErr || !payment) {
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }

  const [firstName, ...rest] = (profile?.full_name ?? "Ebbli User").split(" ");
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/pay/callback?paymentId=${payment.id}`;

  try {
    const redirectUrl = await submitOrder({
      id: payment.id,
      amount: body.amount_kes,
      description: `Ebbli Build — ${body.purpose}`,
      email: profile?.email ?? user.email ?? "",
      phone: profile?.phone ?? undefined,
      firstName,
      lastName: rest.join(" ") || "User",
      callbackUrl,
    });

    return NextResponse.json({ redirectUrl, paymentId: payment.id });
  } catch (err) {
    console.error("Pesapal order error:", err);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 502 });
  }
}

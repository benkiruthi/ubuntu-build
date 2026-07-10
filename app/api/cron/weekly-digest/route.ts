import { NextResponse } from "next/server";
import { createServiceClient } from "../../../../lib/supabase/server";
import { sendEmail } from "../../../../lib/email/send";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // Get all members with active projects created in the last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: activeProfiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, subscription_tier")
    .eq("onboarding_complete", true)
    .not("email", "is", null);

  if (!activeProfiles?.length) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;

  for (const profile of activeProfiles) {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, status, updated_at")
      .eq("owner_id", profile.id)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(3);

    if (!projects?.length) continue;

    const projectRows = projects
      .map(
        (p) =>
          `<tr>
            <td style="padding:8px 0; border-bottom:1px solid #f3f4f6; font-size:14px">${p.name}</td>
            <td style="padding:8px 0; border-bottom:1px solid #f3f4f6; font-size:14px; color:#6b7280; text-align:right; text-transform:capitalize">${p.status}</td>
          </tr>`
      )
      .join("");

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://build.ebbli.co";

    await sendEmail({
      to: profile.email!,
      subject: "Your Ebbli Build weekly update",
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:0}
        .c{max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
        .h{background:linear-gradient(135deg,#b45309,#78350f);padding:28px 36px}
        .h h1{color:#fff;margin:0;font-size:20px;font-weight:700}
        .b{padding:28px 36px}.b p{font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px}
        .btn{display:inline-block;padding:11px 22px;background:#b45309;color:#fff !important;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
        .f{padding:16px 36px;border-top:1px solid #f3f4f6}.f p{font-size:12px;color:#9ca3af;margin:0}
        table{width:100%;border-collapse:collapse}
      </style></head><body>
      <div class="c">
        <div class="h"><h1>Weekly Project Update</h1></div>
        <div class="b">
          <p>Hello ${profile.full_name?.split(" ")[0] ?? "there"} 👋</p>
          <p>Here's a quick look at your active Ebbli Build projects:</p>
          <table>${projectRows}</table>
          <p style="margin-top:24px"><a href="${baseUrl}/projects" class="btn">View all projects →</a></p>
          ${profile.subscription_tier === "free" ? `<p style="font-size:13px;color:#6b7280;margin-top:16px">💡 Upgrade to Starter to unlock the Quantity Surveyor AI — <a href="${baseUrl}/settings/billing" style="color:#b45309">see plans →</a></p>` : ""}
        </div>
        <div class="f"><p>© ${new Date().getFullYear()} Ebbli Build · <a href="${baseUrl}" style="color:#b45309">build.ebbli.co</a></p></div>
      </div></body></html>`,
    });

    sent++;
  }

  return NextResponse.json({ sent });
}

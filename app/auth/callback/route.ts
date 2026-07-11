import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { sendEmail } from "../../../lib/email/send";
import { welcomeEmail } from "../../../lib/email/templates";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Check if this is a brand-new user (profile just created, onboarding not done)
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete, full_name, email, welcome_email_sent")
        .eq("id", data.user.id)
        .single();

      if (profile && !profile.onboarding_complete && !profile.welcome_email_sent) {
        const email = profile.email ?? data.user.email;
        if (email) {
          const { subject, html } = welcomeEmail(profile.full_name ?? "");
          sendEmail({ to: email, subject, html }).catch(console.error);
          // Mark sent so we don't fire again on subsequent logins
          void supabase
            .from("profiles")
            .update({ welcome_email_sent: true })
            .eq("id", data.user.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

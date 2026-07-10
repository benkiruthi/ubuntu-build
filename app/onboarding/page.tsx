import { OnboardingFlow } from "../../components/onboarding/onboarding-flow";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Welcome — Ebbli Build" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_complete) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--muted)" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4"
            style={{ background: "var(--primary)" }}
          >
            B
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome to Ebbli Build 🏗️</h1>
          <p style={{ color: "var(--muted-foreground)" }} className="text-sm">
            Let&apos;s set up your profile so we can personalise your experience.
          </p>
        </div>
        <OnboardingFlow userId={user.id} />
      </div>
    </div>
  );
}

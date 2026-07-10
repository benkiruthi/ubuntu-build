import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { ProfessionalProfileForm } from "../../../components/settings/professional-profile-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Professional Profile — Ebbli Build" };

export default async function ProfessionalProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, full_name, bio, years_experience, portfolio_url, listed_on_marketplace")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Professional Profile</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          List your services on the Ebbli Build Marketplace to connect with clients.
        </p>
      </div>
      <ProfessionalProfileForm profile={profile} />
    </div>
  );
}

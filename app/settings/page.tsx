import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { ProfileSettingsForm } from "../../components/settings/profile-settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Ebbli Build" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Manage your account and preferences.
        </p>
      </div>
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}

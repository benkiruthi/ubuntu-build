import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";

export const dynamic = "force-dynamic";

const SETTINGS_NAV = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/organization", label: "Organization" },
  { href: "/settings/professional", label: "Marketplace Listing" },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, user_type, subscription_tier, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <AppShell profile={profile}>
      <div className="max-w-5xl mx-auto">
        {/* Settings sub-nav */}
        <nav className="flex gap-1 mb-8 border-b pb-0" style={{ borderColor: "var(--border)" }}>
          {SETTINGS_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors"
              style={{
                borderBottomColor: "transparent",
                color: "var(--muted-foreground)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </AppShell>
  );
}

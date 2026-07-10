import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import { USER_TYPES, KENYAN_COUNTIES } from "../../lib/theme";
import { MarketplaceSearch } from "../../components/marketplace/marketplace-search";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Marketplace — Ebbli Build" };

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ county?: string; user_type?: string; q?: string }>;
}) {
  const { county, user_type, q } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch professionals matching filters
  let query = supabase
    .from("profiles")
    .select("id, full_name, user_type, county, avatar_url, bio, years_experience, portfolio_url")
    .eq("listed_on_marketplace", true)
    .eq("onboarding_complete", true)
    .not("full_name", "is", null);

  if (county) query = query.eq("county", county);
  if (user_type) query = query.eq("user_type", user_type);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: professionals } = await query
    .order("created_at", { ascending: false })
    .limit(50);

  // Check if current user is a professional and could list themselves
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("user_type, listed_on_marketplace, full_name")
    .eq("id", user.id)
    .single();

  const isProfessional = myProfile?.user_type !== "homeowner" && myProfile?.user_type !== "developer";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Connect with verified architects, engineers, contractors, and specialists across Kenya.
          </p>
        </div>
        {isProfessional && !myProfile?.listed_on_marketplace && (
          <a
            href="/settings/professional"
            className="text-sm font-medium whitespace-nowrap py-2 px-4 rounded-lg border"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            List your profile →
          </a>
        )}
      </div>

      <MarketplaceSearch
        initialProfessionals={professionals ?? []}
        initialFilters={{ county, user_type, q }}
        userTypes={USER_TYPES}
        counties={KENYAN_COUNTIES}
      />
    </div>
  );
}

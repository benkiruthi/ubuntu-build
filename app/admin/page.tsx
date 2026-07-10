import { createServiceClient } from "../../lib/supabase/server";
import { formatKES } from "../../lib/utils";
import { Card, CardContent } from "../../components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const supabase = await createServiceClient();

  const [
    { count: totalUsers },
    { count: totalProjects },
    { count: activeProjects },
    { count: totalSessions },
    { data: recentPayments },
    { data: tierBreakdown },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .is("deleted_at", null),
    supabase.from("ai_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("id, amount_kes, purpose, status, created_at")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("subscription_tier"),
  ]);

  // Compute tier breakdown
  const tiers: Record<string, number> = {};
  for (const p of tierBreakdown ?? []) {
    tiers[p.subscription_tier] = (tiers[p.subscription_tier] ?? 0) + 1;
  }

  const totalRevenue = (recentPayments ?? []).reduce((sum, p) => sum + p.amount_kes, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Platform Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers ?? 0, icon: "👥" },
          { label: "Total Projects", value: totalProjects ?? 0, icon: "🏠" },
          { label: "Active Projects", value: activeProjects ?? 0, icon: "✅" },
          { label: "AI Sessions", value: totalSessions ?? 0, icon: "🤖" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                  {s.label}
                </span>
                <span className="text-xl">{s.icon}</span>
              </div>
              <p className="text-3xl font-bold">{s.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tier breakdown */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h2 className="font-semibold mb-4">Subscription Tiers</h2>
            {Object.entries(tiers).map(([tier, count]) => (
              <div
                key={tier}
                className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="capitalize font-medium">{tier}</span>
                <span style={{ color: "var(--muted-foreground)" }}>{count} users</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent completed payments */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <h2 className="font-semibold mb-4">Recent Payments</h2>
            {recentPayments?.length ? (
              recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="capitalize">{p.purpose?.replace(/_/g, " ")}</span>
                  <span className="font-semibold" style={{ color: "var(--primary)" }}>
                    {formatKES(p.amount_kes)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No payments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

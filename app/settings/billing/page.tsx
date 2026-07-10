import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { SUBSCRIPTION_TIERS } from "../../../lib/theme";
import { formatKES, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { UpgradeButton } from "../../../components/billing/upgrade-button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Billing — Ebbli Build" };

const TIER_ORDER = ["free", "starter", "pro", "enterprise"] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: payments }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_tier, subscription_expires_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("payments")
      .select("id, amount_kes, purpose, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const currentTier = (profile?.subscription_tier ?? "free") as keyof typeof SUBSCRIPTION_TIERS;
  const currentTierInfo = SUBSCRIPTION_TIERS[currentTier];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Manage your plan and payment history.
        </p>
      </div>

      {/* Status banners */}
      {status === "success" && (
        <div
          className="rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: "#dcfce7", color: "#166534" }}
        >
          🎉 Payment successful! Your subscription has been upgraded.
        </div>
      )}
      {status === "pending" && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "#fef3c7", color: "#92400e" }}
        >
          ⏳ Payment received. Your plan will activate within a few minutes.
        </div>
      )}
      {status === "error" && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "#fee2e2", color: "#991b1b" }}
        >
          ❌ Payment could not be verified. Please contact support if you were charged.
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg capitalize">{currentTierInfo.label}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {currentTier === "free"
                  ? "Free forever"
                  : currentTier === "enterprise"
                  ? "Custom pricing"
                  : `${formatKES(currentTierInfo.price as number)} / month`}
              </p>
            </div>
            <Badge
              variant={currentTier === "free" ? "default" : currentTier === "pro" ? "warning" : "success"}
              className="capitalize"
            >
              {currentTierInfo.label}
            </Badge>
          </div>
          {profile?.subscription_expires_at && (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Renews {formatDate(profile.subscription_expires_at)}
            </p>
          )}
          <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
            <div>
              <p style={{ color: "var(--muted-foreground)" }} className="text-xs mb-0.5">Projects</p>
              <p className="font-semibold">{currentTierInfo.projects ?? "Unlimited"}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted-foreground)" }} className="text-xs mb-0.5">AI Sessions / mo</p>
              <p className="font-semibold">{currentTierInfo.aiSessions ?? "Unlimited"}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted-foreground)" }} className="text-xs mb-0.5">Team Size</p>
              <p className="font-semibold">{currentTierInfo.teamSize ?? "Unlimited"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing plans */}
      <div>
        <h2 className="font-semibold mb-4">Upgrade Your Plan</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TIER_ORDER.filter((t) => t !== "free" && t !== "enterprise").map((tier) => {
            const info = SUBSCRIPTION_TIERS[tier];
            const isCurrent = tier === currentTier;
            const isUpgrade =
              TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);

            return (
              <Card
                key={tier}
                className={isCurrent ? "ring-2 ring-amber-600" : ""}
              >
                <CardContent className="pt-5 pb-5 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold capitalize">{info.label}</p>
                    {isCurrent && <Badge variant="success">Current</Badge>}
                  </div>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: "var(--primary)" }}
                  >
                    {formatKES(info.price as number)}
                    <span className="text-sm font-normal" style={{ color: "var(--muted-foreground)" }}>
                      /mo
                    </span>
                  </p>
                  <ul className="text-sm space-y-1.5 my-4 flex-1" style={{ color: "var(--muted-foreground)" }}>
                    <li>✓ {info.projects} project{(info.projects ?? 0) > 1 ? "s" : ""}</li>
                    <li>✓ {info.aiSessions} AI sessions/mo</li>
                    <li>✓ {info.teamSize} team member{(info.teamSize ?? 0) > 1 ? "s" : ""}</li>
                    <li>✓ {Array.isArray(info.phases) ? info.phases.length : 0} AI modules</li>
                  </ul>
                  {isUpgrade ? (
                    <UpgradeButton
                      tier={tier}
                      amountKes={info.price as number}
                      label={`Upgrade to ${info.label}`}
                      fullWidth
                    />
                  ) : (
                    <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                      {isCurrent ? "Your current plan" : "Downgrade not available"}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Enterprise */}
          <Card>
            <CardContent className="pt-5 pb-5 flex flex-col">
              <p className="font-bold mb-3">Enterprise</p>
              <p className="text-2xl font-bold mb-1" style={{ color: "var(--primary)" }}>
                Custom
              </p>
              <ul className="text-sm space-y-1.5 my-4 flex-1" style={{ color: "var(--muted-foreground)" }}>
                <li>✓ Unlimited projects</li>
                <li>✓ Unlimited AI sessions</li>
                <li>✓ All AI modules</li>
                <li>✓ Dedicated support</li>
              </ul>
              <a
                href="mailto:hello@ebbli.co?subject=Enterprise Enquiry"
                className="block text-center text-sm py-2 px-4 rounded-lg border font-medium"
                style={{ borderColor: "var(--border)" }}
              >
                Contact us →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment history */}
      {payments && payments.length > 0 && (
        <div>
          <h2 className="font-semibold mb-4">Payment History</h2>
          <Card>
            <CardContent className="pt-4 pb-2">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3 border-b last:border-0 text-sm"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div>
                    <p className="font-medium capitalize">{p.purpose?.replace(/_/g, " ")}</p>
                    <p style={{ color: "var(--muted-foreground)" }} className="text-xs">
                      {formatDate(p.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatKES(p.amount_kes)}</span>
                    <Badge
                      variant={
                        p.status === "completed"
                          ? "success"
                          : p.status === "failed"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

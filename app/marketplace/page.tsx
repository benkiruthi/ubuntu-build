import { Card, CardContent } from "../../components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Marketplace — Ebbli Build" };

export default function MarketplacePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Connect with verified architects, engineers, contractors and suppliers.
        </p>
      </div>
      <Card>
        <CardContent className="py-20 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-lg font-bold mb-2">Coming in Phase 9</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            The marketplace for verified AEC professionals launches after Phase 8.
            You&apos;ll be able to book architects, engineers, QS, contractors and suppliers
            — all vetted and rated.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

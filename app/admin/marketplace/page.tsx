import { createServiceClient } from "../../../lib/supabase/server";
import { formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { AdminMarketplaceActions } from "../../../components/admin/marketplace-actions";

export const dynamic = "force-dynamic";

export default async function AdminMarketplacePage() {
  const supabase = await createServiceClient();

  const { data: listings } = await supabase
    .from("profiles")
    .select("id, email, full_name, user_type, county, bio, years_experience, listed_on_marketplace, created_at")
    .eq("listed_on_marketplace", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketplace Listings ({listings?.length ?? 0})</h1>
      </div>

      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wide"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <th className="text-left py-3 px-4">Professional</th>
                <th className="text-left py-3 px-4">Specialty</th>
                <th className="text-left py-3 px-4">County</th>
                <th className="text-left py-3 px-4">Experience</th>
                <th className="text-left py-3 px-4">Listed</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listings ?? []).map((pro) => (
                <tr
                  key={pro.id}
                  className="border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{pro.full_name ?? "—"}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{pro.email}</p>
                  </td>
                  <td className="py-3 px-4 capitalize" style={{ color: "var(--muted-foreground)" }}>
                    {pro.user_type?.replace(/_/g, " ")}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {pro.county ?? "—"}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {pro.years_experience ? `${pro.years_experience} yrs` : "—"}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(pro.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <AdminMarketplaceActions profileId={pro.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

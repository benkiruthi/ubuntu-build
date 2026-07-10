import { createServiceClient } from "../../../lib/supabase/server";
import { formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; q?: string; page?: string }>;
}) {
  const { tier, q, page } = await searchParams;
  const pageNum = parseInt(page ?? "1", 10);
  const pageSize = 50;
  const offset = (pageNum - 1) * pageSize;

  const supabase = await createServiceClient();

  let query = supabase
    .from("profiles")
    .select("id, email, full_name, user_type, subscription_tier, county, onboarding_complete, listed_on_marketplace, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (tier) query = query.eq("subscription_tier", tier);
  if (q) query = query.ilike("email", `%${q}%`);

  const { data: users, count } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email…"
            className="px-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          />
          <select
            name="tier"
            defaultValue={tier}
            className="px-3 py-1.5 text-sm rounded-lg border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <option value="">All tiers</option>
            {["free", "starter", "pro", "enterprise"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-1.5 text-sm rounded-lg text-white"
            style={{ background: "var(--primary)" }}
          >
            Filter
          </button>
        </form>
      </div>

      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wide"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Plan</th>
                <th className="text-left py-3 px-4">County</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr
                  key={u.id}
                  className="border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{u.full_name ?? "—"}</p>
                    <p style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
                  </td>
                  <td className="py-3 px-4 capitalize" style={{ color: "var(--muted-foreground)" }}>
                    {u.user_type?.replace(/_/g, " ") ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        u.subscription_tier === "pro" ? "warning" :
                        u.subscription_tier === "enterprise" ? "info" :
                        u.subscription_tier === "starter" ? "success" : "default"
                      }
                      className="capitalize"
                    >
                      {u.subscription_tier}
                    </Badge>
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {u.county ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {u.onboarding_complete && (
                        <Badge variant="success" className="text-xs w-fit">Onboarded</Badge>
                      )}
                      {u.listed_on_marketplace && (
                        <Badge variant="info" className="text-xs w-fit">Marketplace</Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(u.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {(users?.length ?? 0) === pageSize && (
        <div className="flex gap-2 justify-center">
          {pageNum > 1 && (
            <a
              href={`/admin/users?page=${pageNum - 1}${tier ? `&tier=${tier}` : ""}${q ? `&q=${q}` : ""}`}
              className="px-4 py-2 text-sm rounded-lg border"
              style={{ borderColor: "var(--border)" }}
            >
              ← Previous
            </a>
          )}
          <a
            href={`/admin/users?page=${pageNum + 1}${tier ? `&tier=${tier}` : ""}${q ? `&q=${q}` : ""}`}
            className="px-4 py-2 text-sm rounded-lg border"
            style={{ borderColor: "var(--border)" }}
          >
            Next →
          </a>
        </div>
      )}
    </div>
  );
}

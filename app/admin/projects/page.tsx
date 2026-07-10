import { createServiceClient } from "../../../lib/supabase/server";
import { formatKES, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const supabase = await createServiceClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, project_type, status, location_county, budget_kes, created_at, owner:profiles!projects_owner_id_fkey(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  type AdminProject = {
    id: string;
    name: string;
    project_type: string;
    status: string;
    location_county: string | null;
    budget_kes: number | null;
    created_at: string;
    owner: { email: string; full_name: string | null } | null;
  };

  const typed = projects as unknown as AdminProject[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">All Projects ({typed?.length ?? 0})</h1>
      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wide"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <th className="text-left py-3 px-4">Project</th>
                <th className="text-left py-3 px-4">Owner</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Budget</th>
                <th className="text-left py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {(typed ?? []).map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {p.location_county ?? "—"}
                    </p>
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    <p>{p.owner?.full_name ?? "—"}</p>
                    <p className="text-xs">{p.owner?.email ?? "—"}</p>
                  </td>
                  <td className="py-3 px-4 capitalize" style={{ color: "var(--muted-foreground)" }}>
                    {p.project_type?.replace(/_/g, " ")}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={p.status === "active" ? "success" : p.status === "archived" ? "default" : "warning"}
                      className="capitalize"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-medium" style={{ color: "var(--primary)" }}>
                    {p.budget_kes ? formatKES(p.budget_kes) : "—"}
                  </td>
                  <td className="py-3 px-4" style={{ color: "var(--muted-foreground)" }}>
                    {formatDate(p.created_at)}
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

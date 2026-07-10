import { createServiceClient } from "../../../lib/supabase/server";
import { formatKES, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const supabase = await createServiceClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount_kes, purpose, status, pesapal_tracking_id, created_at, payer:profiles!payments_user_id_fkey(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  type AdminPayment = {
    id: string;
    amount_kes: number;
    purpose: string;
    status: string;
    pesapal_tracking_id: string | null;
    created_at: string;
    payer: { email: string; full_name: string | null } | null;
  };

  const typed = payments as unknown as AdminPayment[];

  const completed = typed?.filter((p) => p.status === "completed") ?? [];
  const totalRevenue = completed.reduce((sum, p) => sum + p.amount_kes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Total Revenue</p>
          <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {formatKES(totalRevenue)}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-0 pb-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs uppercase tracking-wide"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
              >
                <th className="text-left py-3 px-4">Payer</th>
                <th className="text-left py-3 px-4">Purpose</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Tracking ID</th>
                <th className="text-left py-3 px-4">Date</th>
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
                    <p className="font-medium">{p.payer?.full_name ?? "—"}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.payer?.email ?? "—"}</p>
                  </td>
                  <td className="py-3 px-4 capitalize" style={{ color: "var(--muted-foreground)" }}>
                    {p.purpose?.replace(/_/g, " ")}
                  </td>
                  <td className="py-3 px-4 font-semibold" style={{ color: "var(--primary)" }}>
                    {formatKES(p.amount_kes)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        p.status === "completed" ? "success" :
                        p.status === "failed" ? "danger" : "warning"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td
                    className="py-3 px-4 text-xs font-mono"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {p.pesapal_tracking_id ?? "—"}
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

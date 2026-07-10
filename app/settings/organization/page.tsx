import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { OrgManager } from "../../../components/organization/org-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Organization — Ebbli Build" };

export default async function OrganizationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  type Membership = {
    role: string;
    org_id: string;
    organizations: { id: string; name: string; slug: string; owner_id: string } | null;
  };

  // Load orgs this user belongs to
  const { data: rawMemberships } = await supabase
    .from("org_members")
    .select("role, org_id, organizations(id, name, slug, owner_id)")
    .eq("user_id", user.id);

  const memberships = rawMemberships as Membership[] | null;

  const orgs = (memberships ?? []).map((m) => ({
    role: m.role,
    org: m.organizations,
  })).filter((m) => m.org !== null);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Collaborate with your team on shared projects.
        </p>
      </div>

      <OrgManager userId={user.id} initialOrgs={orgs} />
    </div>
  );
}

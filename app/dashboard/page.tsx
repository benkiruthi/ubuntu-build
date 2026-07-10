import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { formatKES, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PROJECT_PHASES, SUBSCRIPTION_TIERS } from "../../lib/theme";
import type { Database } from "../../types/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const STATUS_BADGE: Record<
  string,
  { variant: "success" | "warning" | "info" | "default"; label: string }
> = {
  active: { variant: "success", label: "Active" },
  draft: { variant: "default", label: "Draft" },
  on_hold: { variant: "warning", label: "On Hold" },
  completed: { variant: "info", label: "Completed" },
  archived: { variant: "default", label: "Archived" },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: projects }, { data: notifications }, { count: aiCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, subscription_tier")
        .eq("id", user.id)
        .single(),
      supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("ai_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const tier = profile?.subscription_tier ?? "free";
  const tierInfo = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hello, {firstName} 👋</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={String(projects?.length ?? 0)} icon="🏠" />
        <StatCard label="AI Sessions" value={String(aiCount ?? 0)} icon="🤖" />
        <StatCard
          label="Plan"
          value={tierInfo.label}
          icon="⭐"
          sub={tier === "free" ? "Upgrade →" : undefined}
          subHref="/settings/billing"
        />
        <StatCard
          label="Phases Available"
          value={tier === "enterprise" ? "All" : String(
            Array.isArray(tierInfo.phases)
              ? tierInfo.phases.filter((p) => p !== "all").length
              : 0
          )}
          icon="🔓"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-sm hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View all →
            </Link>
          </div>

          {!projects?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-3">🏗️</div>
                <p className="font-semibold mb-1">No projects yet</p>
                <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
                  Start by creating your first building project.
                </p>
                <Link href="/projects/new">
                  <Button size="sm">Create your first project</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* AI Phases */}
          <div>
            <h2 className="font-semibold mb-3">Your AI Modules</h2>
            <Card>
              <CardContent className="pt-4 pb-2">
                {PROJECT_PHASES.map((phase) => {
                  const tierPhases: readonly string[] =
                    tier === "enterprise"
                      ? ["all"]
                      : (SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.phases ?? []);
                  const unlocked =
                    tierPhases.includes("all") ||
                    tierPhases.includes(phase.id);
                  return (
                    <div
                      key={phase.id}
                      className="flex items-center gap-3 py-2 border-b last:border-0"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span className="text-lg">{phase.icon}</span>
                      <span
                        className={`flex-1 text-sm font-medium ${
                          unlocked ? "" : "opacity-50"
                        }`}
                      >
                        {phase.label}
                      </span>
                      {unlocked ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          {notifications && notifications.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Notifications</h2>
              <Card>
                <CardContent className="pt-4 pb-2 space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="text-sm">
                      <p className="font-medium">{n.title}</p>
                      <p style={{ color: "var(--muted-foreground)" }}>{n.body}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
  subHref,
}: {
  label: string;
  value: string;
  icon: string;
  sub?: string;
  subHref?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
            {label}
          </span>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        {sub && subHref && (
          <Link
            href={subHref}
            className="text-xs hover:underline"
            style={{ color: "var(--primary)" }}
          >
            {sub}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusInfo = STATUS_BADGE[project.status] ?? STATUS_BADGE.draft;
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold truncate">{project.name}</p>
              <p className="text-xs mt-0.5 capitalize" style={{ color: "var(--muted-foreground)" }}>
                {project.project_type?.replace("_", " ")} ·{" "}
                {project.location_county ?? "Location TBD"}
              </p>
              {project.budget_kes && (
                <p className="text-xs mt-0.5" style={{ color: "var(--primary)" }}>
                  Budget: {formatKES(project.budget_kes)}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {formatDate(project.updated_at)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

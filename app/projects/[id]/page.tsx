import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { createClient } from "../../../lib/supabase/server";
import { formatKES, formatDate } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { PROJECT_PHASES, SUBSCRIPTION_TIERS } from "../../../lib/theme";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: profile }, { data: sessions }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single(),
    supabase
      .from("ai_sessions")
      .select("id, agent_type, status, created_at, updated_at")
      .eq("project_id", id)
      .order("updated_at", { ascending: false }),
  ]);

  if (!project) notFound();

  const tier = profile?.subscription_tier ?? "free";
  const tierPhases: readonly string[] =
    tier === "enterprise"
      ? ["all"]
      : (SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.phases ?? []);

  function isUnlocked(phaseId: string) {
    return (
      tierPhases.includes("all") ||
      tierPhases.includes(phaseId) ||
      project!.phases_unlocked.includes(phaseId)
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <span>{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span className="capitalize">{project.project_type?.replace("_", " ")}</span>
            {project.location_county && <span>· {project.location_county}</span>}
            {project.budget_kes && (
              <span>· Budget: <span style={{ color: "var(--primary)" }}>{formatKES(project.budget_kes)}</span></span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/projects/${id}/files`}>
            <Button variant="outline" size="sm">📁 Files</Button>
          </Link>
          <Link href={`/projects/${id}/export`}>
            <Button variant="outline" size="sm">📄 Export</Button>
          </Link>
        </div>
        <Badge
          variant={project.status === "active" ? "success" : "default"}
          className="capitalize"
        >
          {project.status}
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: "Plot Size", value: project.plot_size_sqm ? `${project.plot_size_sqm} m²` : "—" },
          { label: "Floors", value: project.floors ? String(project.floors) : "—" },
          { label: "Bedrooms", value: project.bedrooms ? String(project.bedrooms) : "—" },
          { label: "Last Updated", value: formatDate(project.updated_at) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--muted-foreground)" }}>
                {s.label}
              </p>
              <p className="font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Modules */}
      <div>
        <h2 className="font-semibold mb-3">AI Modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROJECT_PHASES.map((phase) => {
            const unlocked = isUnlocked(phase.id);
            const sessionForPhase = sessions?.find((s) => s.agent_type === phase.id);
            return (
              <Card
                key={phase.id}
                className={`transition-all ${unlocked ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="text-2xl mb-2">{phase.icon}</div>
                  <p className="font-semibold text-sm mb-1">{phase.label}</p>
                  {unlocked ? (
                    <>
                      {sessionForPhase ? (
                        <Badge variant="success" className="text-xs">
                          {sessionForPhase.status === "complete" ? "Complete" : "In Progress"}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Not started</Badge>
                      )}
                      <Link href={`/projects/${project.id}/${phase.id}`}>
                        <Button size="sm" variant="ghost" className="mt-2 w-full text-xs px-2">
                          {sessionForPhase ? "Continue →" : "Start →"}
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        🔒 Requires{" "}
                        {phase.tier === "starter" ? "Starter" : "Pro"} plan
                      </Badge>
                      <Link href="/settings/billing">
                        <Button size="sm" variant="ghost" className="mt-2 w-full text-xs px-2">
                          Upgrade →
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent AI Sessions */}
      {sessions && sessions.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Recent AI Sessions</h2>
          <Card>
            <CardContent className="pt-4 pb-2">
              {sessions.map((session) => {
                const phase = PROJECT_PHASES.find((p) => p.id === session.agent_type);
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{phase?.icon ?? "🤖"}</span>
                      <div>
                        <p className="text-sm font-medium">{phase?.label ?? session.agent_type}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {formatDate(session.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          session.status === "complete"
                            ? "success"
                            : session.status === "error"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {session.status}
                      </Badge>
                      <Link href={`/projects/${project.id}/${session.agent_type}`}>
                        <Button size="sm" variant="ghost">Open →</Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

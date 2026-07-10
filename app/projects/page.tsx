import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { formatKES, formatDate } from "../../lib/utils";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

const STATUS_BADGE: Record<string, { variant: "success" | "warning" | "info" | "default"; label: string }> = {
  active: { variant: "success", label: "Active" },
  draft: { variant: "default", label: "Draft" },
  on_hold: { variant: "warning", label: "On Hold" },
  completed: { variant: "info", label: "Completed" },
  archived: { variant: "default", label: "Archived" },
};

export const metadata = { title: "My Projects — Ebbli Build" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/projects/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      {!projects?.length ? (
        <Card>
          <CardContent className="py-20 text-center">
            <div className="text-5xl mb-4">🏗️</div>
            <h2 className="text-lg font-bold mb-2">No projects yet</h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              Create your first project and let the AI Architect help you design it.
            </p>
            <Link href="/projects/new">
              <Button size="lg">Create your first project</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const statusInfo = STATUS_BADGE[project.status] ?? STATUS_BADGE.draft;
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  {project.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.cover_image_url}
                      alt={project.name}
                      className="w-full h-36 object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div
                      className="w-full h-36 rounded-t-2xl flex items-center justify-center text-4xl"
                      style={{ background: "var(--primary-light)" }}
                    >
                      🏠
                    </div>
                  )}
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-sm leading-tight">{project.name}</p>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                      {project.project_type?.replace("_", " ")}
                      {project.location_county ? ` · ${project.location_county}` : ""}
                    </p>
                    {project.budget_kes && (
                      <p className="text-xs mt-1 font-medium" style={{ color: "var(--primary)" }}>
                        {formatKES(project.budget_kes)}
                      </p>
                    )}
                    <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                      Updated {formatDate(project.updated_at)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

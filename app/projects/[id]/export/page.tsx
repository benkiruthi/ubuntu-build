import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { formatKES, formatDate } from "../../../../lib/utils";
import { PROJECT_PHASES } from "../../../../lib/theme";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Export — Ebbli Build" };

export default async function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
      .select("full_name, email, county")
      .eq("id", user.id)
      .single(),
    supabase
      .from("ai_sessions")
      .select("agent_type, messages, output_data, updated_at, status")
      .eq("project_id", id)
      .eq("user_id", user.id),
  ]);

  if (!project) notFound();

  const sessionMap = Object.fromEntries(
    (sessions ?? []).map((s) => [s.agent_type, s])
  );

  const exportDate = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>/</span>
          <Link href={`/projects/${id}`} className="hover:underline">{project.name}</Link>
          <span>/</span>
          <span style={{ color: "var(--foreground)" }}>Export</span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--primary)" }}
          id="print-btn"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* Print script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.getElementById('print-btn')?.addEventListener('click', () => window.print());
          `,
        }}
      />

      {/* Printable content */}
      <div className="print-doc max-w-3xl mx-auto space-y-8">
        {/* Cover */}
        <div
          className="rounded-2xl p-8 text-white"
          style={{ background: "linear-gradient(135deg, #b45309, #78350f)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-75 mb-1">Project Report</p>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="mt-2 opacity-90 capitalize">
                {project.project_type?.replace(/_/g, " ")}
                {project.location_county ? ` · ${project.location_county}` : ""}
              </p>
            </div>
            <div className="text-right text-sm opacity-75">
              <p>Ebbli Build</p>
              <p>build.ebbli.co</p>
              <p className="mt-1">{exportDate}</p>
            </div>
          </div>
        </div>

        {/* Project summary */}
        <section>
          <h2 className="text-lg font-bold mb-4 pb-2 border-b" style={{ borderColor: "var(--border)" }}>
            Project Summary
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              { label: "Project Name", value: project.name },
              { label: "Type", value: project.project_type?.replace(/_/g, " ") },
              { label: "County", value: project.location_county ?? "—" },
              { label: "Area", value: project.location_area ?? "—" },
              { label: "Plot Size", value: project.plot_size_sqm ? `${project.plot_size_sqm} m²` : "—" },
              { label: "Floors", value: project.floors ?? "—" },
              { label: "Bedrooms", value: project.bedrooms ?? "—" },
              {
                label: "Budget",
                value: project.budget_kes ? formatKES(project.budget_kes) : "—",
              },
              { label: "Status", value: project.status },
              { label: "Created", value: formatDate(project.created_at) },
              { label: "Client", value: profile?.full_name ?? "—" },
              { label: "Email", value: profile?.email ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex gap-2">
                <span className="font-medium w-32 flex-shrink-0 capitalize" style={{ color: "var(--muted-foreground)" }}>
                  {row.label}
                </span>
                <span className="capitalize">{String(row.value ?? "—")}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AI Sessions output */}
        {PROJECT_PHASES.map((phase) => {
          const session = sessionMap[phase.id];
          if (!session) return null;

          const messages = (session.messages as Array<{ role: string; content: string }> | null) ?? [];
          const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

          return (
            <section key={phase.id} className="page-break-before">
              <h2
                className="text-lg font-bold mb-4 pb-2 border-b flex items-center gap-2"
                style={{ borderColor: "var(--border)" }}
              >
                {phase.icon} {phase.label}
                <span
                  className="ml-auto text-xs font-normal"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {formatDate(session.updated_at)}
                </span>
              </h2>

              {lastAssistant ? (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--foreground)" }}
                >
                  {lastAssistant.content}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Session started but no AI output yet.
                </p>
              )}
            </section>
          );
        })}

        {/* Footer */}
        <div
          className="border-t pt-6 text-xs text-center"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          Generated by Ebbli Build · build.ebbli.co · {exportDate}
          <br />
          This document is confidential and intended for the named client only.
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, aside, header { display: none !important; }
          .print-doc { max-width: 100%; }
          .page-break-before { page-break-before: always; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </>
  );
}

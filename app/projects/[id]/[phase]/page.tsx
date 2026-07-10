import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { PROJECT_PHASES, SUBSCRIPTION_TIERS } from "../../../../lib/theme";
import { AiChat, type ChatMessage } from "../../../../components/ai/chat-interface";

export const dynamic = "force-dynamic";

export default async function PhasePage({
  params,
}: {
  params: Promise<{ id: string; phase: string }>;
}) {
  const { id, phase } = await params;

  const phaseInfo = PROJECT_PHASES.find((p) => p.id === phase);
  if (!phaseInfo) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, project_type, phases_unlocked, status")
      .eq("id", id)
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single(),
  ]);

  if (!project) notFound();
  if (project.status === "archived") redirect(`/projects/${id}`);

  // Access check
  const tier = profile?.subscription_tier ?? "free";
  const tierPhases: readonly string[] =
    tier === "enterprise"
      ? ["all"]
      : (SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]?.phases ?? []);

  const hasAccess =
    tierPhases.includes("all") ||
    tierPhases.includes(phase) ||
    project.phases_unlocked.includes(phase);

  if (!hasAccess) {
    redirect(`/projects/${id}?locked=${phase}`);
  }

  // Load existing session messages
  const { data: session } = await supabase
    .from("ai_sessions")
    .select("messages")
    .eq("project_id", id)
    .eq("agent_type", phase)
    .eq("user_id", user.id)
    .maybeSingle();

  const initialMessages = (session?.messages as ChatMessage[] | null) ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm py-3 px-1 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${id}`} className="hover:underline">{project.name}</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }}>{phaseInfo.label}</span>
      </div>

      {/* Chat fills remaining height */}
      <div
        className="flex-1 rounded-xl border overflow-hidden min-h-0"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <AiChat
          projectId={id}
          phase={phase}
          phaseLabel={phaseInfo.label}
          phaseIcon={phaseInfo.icon}
          initialMessages={initialMessages}
          outputLabel={phaseInfo.label + " Output"}
        />
      </div>
    </div>
  );
}

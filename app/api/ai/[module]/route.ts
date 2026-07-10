import { createClient, createServiceClient } from "../../../../lib/supabase/server";
import { getGroqClient, GROQ_MODEL } from "../../../../lib/ai/groq";
import { getSystemPrompt, type PhaseId } from "../../../../lib/ai/prompts";

export const dynamic = "force-dynamic";

const ALLOWED_PHASES: PhaseId[] = [
  "architect", "qs", "cost_optimizer", "structural",
  "interior", "landscape", "construction", "renders",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> }
) {
  const { module } = await params;

  if (!ALLOWED_PHASES.includes(module as PhaseId)) {
    return new Response("Unknown module", { status: 404 });
  }

  const phase = module as PhaseId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.projectId || !body?.messages) {
    return new Response("Missing projectId or messages", { status: 400 });
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, project_type, plot_size_sqm, budget_kes, location_county, location_area, floors, bedrooms, brief_data")
    .eq("id", body.projectId)
    .eq("owner_id", user.id)
    .single();

  if (!project) return new Response("Project not found", { status: 404 });

  // Upsert ai_session for this project+phase
  const service = await createServiceClient();
  const { data: session } = await service
    .from("ai_sessions")
    .upsert(
      {
        project_id: project.id,
        user_id: user.id,
        agent_type: phase,
        status: "active",
        messages: body.messages,
      },
      { onConflict: "project_id,agent_type", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  const systemPrompt = getSystemPrompt(phase, project);
  const groq = getGroqClient();

  const stream = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ],
    stream: true,
    max_tokens: 1500,
    temperature: 0.7,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

        // Save completed message back to session
        if (session?.id) {
          const updatedMessages = [
            ...body.messages,
            { role: "assistant", content: fullText },
          ];
          await service
            .from("ai_sessions")
            .update({ messages: updatedMessages, updated_at: new Date().toISOString() })
            .eq("id", session.id);
        }
      } catch (err) {
        console.error("Groq stream error:", err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Load existing session messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ module: string }> }
) {
  const { module } = await params;
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) return new Response("Missing projectId", { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: session } = await supabase
    .from("ai_sessions")
    .select("id, messages, status, output_data, updated_at")
    .eq("project_id", projectId)
    .eq("agent_type", module)
    .eq("user_id", user.id)
    .maybeSingle();

  return Response.json(session ?? null);
}

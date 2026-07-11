-- Add unique constraint on ai_sessions(project_id, agent_type)
-- Required for the upsert in /api/ai/[module]/route.ts to work correctly
alter table public.ai_sessions
  add constraint ai_sessions_project_agent_unique unique (project_id, agent_type);

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { FileManager } from "../../../../components/projects/file-manager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Project Files — Ebbli Build" };

export default async function ProjectFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: project }, { data: files }] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name")
      .eq("id", id)
      .eq("owner_id", user.id)
      .is("deleted_at", null)
      .single(),
    supabase
      .from("project_files")
      .select("id, name, file_type, mime_type, size_bytes, storage_path, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!project) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <span>/</span>
        <Link href={`/projects/${id}`} className="hover:underline">{project.name}</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }}>Files</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Project Files</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Upload drawings, BOQs, contracts, photos, and any other project documents.
        </p>
      </div>

      <FileManager projectId={id} initialFiles={files ?? []} />
    </div>
  );
}

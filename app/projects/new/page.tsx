import { NewProjectForm } from "../../../components/projects/new-project-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Project — Ebbli Build" };

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Project</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Tell us about your project and we&apos;ll set up your AI workspace.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}

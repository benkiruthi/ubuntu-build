"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createProjectSchema, type CreateProjectInput } from "../../lib/validations/project";
import { PROJECT_TYPES, KENYAN_COUNTIES, HOUSE_STYLES } from "../../lib/theme";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Card, CardContent } from "../ui/card";

export function NewProjectForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { project_type: "residential" },
  });

  async function onSubmit(data: CreateProjectInput) {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be signed in to create a project");
      setSaving(false);
      return;
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        name: data.name,
        project_type: data.project_type,
        plot_size_sqm: data.plot_size_sqm ?? null,
        budget_kes: data.budget_kes ?? null,
        location_county: data.location_county ?? null,
        location_area: data.location_area ?? null,
        floors: data.floors ?? null,
        bedrooms: data.bedrooms ?? null,
        brief_data: (data.brief_data ?? {}) as import("../../types/database.types").Json,
        phases_unlocked: ["architect"],
        status: "active",
      })
      .select("id")
      .single();

    if (error || !project) {
      toast.error("Failed to create project. Please try again.");
    } else {
      toast.success("Project created!");
      router.push(`/projects/${project.id}`);
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold">Project Details</h2>

          <Input
            label="Project name"
            placeholder="e.g. My Kiambu 4-Bedroom House"
            error={errors.name?.message}
            {...register("name")}
          />

          <Select
            label="Project type"
            options={PROJECT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            error={errors.project_type?.message}
            {...register("project_type")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold">Location</h2>

          <Select
            label="County"
            options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select county"
            error={errors.location_county?.message}
            {...register("location_county")}
          />

          <Input
            label="Area / Estate (optional)"
            placeholder="e.g. Runda, Kitisuru, Lavington"
            error={errors.location_area?.message}
            {...register("location_area")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="font-semibold">Plot & Budget</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plot size (m²)"
              type="number"
              placeholder="e.g. 450"
              error={errors.plot_size_sqm?.message}
              {...register("plot_size_sqm", { valueAsNumber: true })}
            />
            <Input
              label="Budget (KES)"
              type="number"
              placeholder="e.g. 4500000"
              hint="Total construction budget"
              error={errors.budget_kes?.message}
              {...register("budget_kes", { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. of floors"
              type="number"
              placeholder="e.g. 2"
              error={errors.floors?.message}
              {...register("floors", { valueAsNumber: true })}
            />
            <Input
              label="No. of bedrooms"
              type="number"
              placeholder="e.g. 4"
              error={errors.bedrooms?.message}
              {...register("bedrooms", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Create Project →
        </Button>
      </div>
    </form>
  );
}

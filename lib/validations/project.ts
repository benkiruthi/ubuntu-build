import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name is too long"),
  project_type: z.enum([
    "residential",
    "apartment",
    "commercial",
    "mixed_use",
    "renovation",
    "plot_planning",
  ]),
  plot_size_sqm: z
    .number()
    .positive("Plot size must be positive")
    .max(100_000, "Plot size seems too large")
    .optional(),
  budget_kes: z
    .number()
    .positive("Budget must be positive")
    .max(10_000_000_000)
    .optional(),
  location_county: z.string().optional(),
  location_area: z.string().max(100).optional(),
  floors: z.number().int().min(1).max(50).optional(),
  bedrooms: z.number().int().min(0).max(100).optional(),
  brief_data: z.record(z.string(), z.unknown()).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number")
    .optional()
    .or(z.literal("")),
  user_type: z.enum([
    "homeowner",
    "architect",
    "engineer",
    "qs",
    "contractor",
    "interior",
    "landscape",
    "developer",
  ]),
  county: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const onboardingSchema = updateProfileSchema.extend({
  full_name: z.string().min(2).max(80),
  user_type: z.enum([
    "homeowner",
    "architect",
    "engineer",
    "qs",
    "contractor",
    "interior",
    "landscape",
    "developer",
  ]),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { onboardingSchema, type OnboardingInput } from "../../lib/validations/profile";
import { USER_TYPES, KENYAN_COUNTIES } from "../../lib/theme";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Card, CardContent } from "../ui/card";

export function OnboardingFlow({ userId }: { userId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { user_type: "homeowner" },
  });

  const selectedType = watch("user_type");

  async function onSubmit(data: OnboardingInput) {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        user_type: data.user_type,
        county: data.county || null,
        onboarding_complete: true,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save profile. Please try again.");
    } else {
      router.push("/dashboard");
    }

    setSaving(false);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role selection */}
          <div>
            <p className="text-sm font-semibold mb-3">I am a...</p>
            <div className="grid grid-cols-2 gap-2">
              {USER_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue("user_type", type.value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                    selectedType === type.value
                      ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary-deep)]"
                      : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
            {errors.user_type && (
              <p className="text-xs text-[var(--destructive)] mt-1">
                {errors.user_type.message}
              </p>
            )}
          </div>

          <Input
            label="Full name"
            placeholder="e.g. James Mwangi"
            error={errors.full_name?.message}
            {...register("full_name")}
          />

          <Input
            label="Phone number (M-Pesa)"
            placeholder="e.g. 0712345678"
            hint="Used for M-Pesa payments"
            error={errors.phone?.message}
            {...register("phone")}
          />

          <Select
            label="County"
            options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select your county"
            error={errors.county?.message}
            {...register("county")}
          />

          <Button type="submit" className="w-full" size="lg" loading={saving}>
            Get started →
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

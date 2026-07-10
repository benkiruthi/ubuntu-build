"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateProfileSchema, type UpdateProfileInput } from "../../lib/validations/profile";
import { USER_TYPES, KENYAN_COUNTIES } from "../../lib/theme";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { Database } from "../../types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProfileSettingsForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema) as never,
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      user_type: (profile?.user_type ?? "homeowner") as UpdateProfileInput["user_type"],
      county: profile?.county ?? "",
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        user_type: data.user_type,
        county: data.county || null,
      })
      .eq("id", profile?.id ?? "");

    if (error) {
      toast.error("Failed to save. Please try again.");
    } else {
      toast.success("Profile updated.");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Full name"
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
            label="Role"
            options={USER_TYPES.map((t) => ({ value: t.value, label: `${t.icon} ${t.label}` }))}
            error={errors.user_type?.message}
            {...register("user_type")}
          />
          <Select
            label="County"
            options={KENYAN_COUNTIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select county"
            error={errors.county?.message}
            {...register("county")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "var(--border)" }}>
            <div>
              <p className="text-sm font-medium">Subscription</p>
              <p className="text-sm capitalize" style={{ color: "var(--muted-foreground)" }}>
                {profile?.subscription_tier ?? "free"} plan
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Manage billing →
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" loading={saving}>
        Save changes
      </Button>
    </form>
  );
}

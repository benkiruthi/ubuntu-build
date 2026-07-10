"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ProfileData {
  user_type: string;
  full_name: string | null;
  bio: string | null;
  years_experience: number | null;
  portfolio_url: string | null;
  listed_on_marketplace: boolean;
}

export function ProfessionalProfileForm({ profile }: { profile: ProfileData | null }) {
  const router = useRouter();
  const supabase = createClient();

  const [bio, setBio] = useState(profile?.bio ?? "");
  const [years, setYears] = useState(String(profile?.years_experience ?? ""));
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url ?? "");
  const [listed, setListed] = useState(profile?.listed_on_marketplace ?? false);
  const [saving, setSaving] = useState(false);

  const isProfessional =
    profile?.user_type && !["homeowner", "developer"].includes(profile.user_type);

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        bio: bio.trim() || null,
        years_experience: years ? parseInt(years, 10) : null,
        portfolio_url: portfolioUrl.trim() || null,
        listed_on_marketplace: listed,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id ?? "");

    if (error) {
      toast.error("Failed to save. Please try again.");
    } else {
      toast.success(listed ? "You're now listed on the Marketplace!" : "Profile updated.");
      router.refresh();
    }
    setSaving(false);
  }

  if (!isProfessional) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="text-3xl mb-3">🏠</div>
          <p className="font-semibold mb-1">Marketplace is for professionals</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your account is set up as a homeowner or developer. Only architects, engineers,
            QS, contractors, and designers can list on the Marketplace.
            <br />
            Change your role in{" "}
            <a href="/settings" className="underline" style={{ color: "var(--primary)" }}>
              Profile Settings
            </a>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Professional bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your experience, specialities, and what sets you apart…"
              rows={5}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
              style={{
                borderColor: "var(--border)",
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {bio.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Years of experience"
              type="number"
              min={0}
              max={50}
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 8"
            />
            <Input
              label="Portfolio URL"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ borderColor: listed ? "var(--primary)" : "var(--border)" }}
          >
            <div>
              <p className="font-medium text-sm">List me on the Marketplace</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Clients looking for professionals in Kenya will find your profile.
              </p>
            </div>
            <button
              onClick={() => setListed((v) => !v)}
              className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: listed ? "var(--primary)" : "var(--muted)" }}
              role="switch"
              aria-checked={listed}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: listed ? "calc(100% - 20px)" : "4px" }}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving}>
        Save professional profile
      </Button>
    </div>
  );
}

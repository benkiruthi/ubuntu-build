"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface UpgradeButtonProps {
  tier: string;
  amountKes: number;
  label?: string;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function UpgradeButton({
  tier,
  amountKes,
  label,
  variant = "primary",
  size = "md",
  fullWidth,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "subscription",
          amount_kes: amountKes,
          metadata: { tier },
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl;
    } catch (err) {
      console.error(err);
      toast.error("Could not start payment. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      loading={loading}
      variant={variant}
      size={size}
      className={fullWidth ? "w-full" : undefined}
    >
      {label ?? `Upgrade to ${tier}`}
    </Button>
  );
}

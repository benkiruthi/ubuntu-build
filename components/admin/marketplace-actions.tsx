"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function AdminMarketplaceActions({ profileId }: { profileId: string }) {
  const [removing, setRemoving] = useState(false);

  async function removeListing() {
    if (!confirm("Remove this listing from the marketplace?")) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/marketplace/${profileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Listing removed.");
      window.location.reload();
    } catch {
      toast.error("Could not remove listing.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      loading={removing}
      onClick={removeListing}
      className="text-red-500 hover:text-red-600"
    >
      Remove
    </Button>
  );
}

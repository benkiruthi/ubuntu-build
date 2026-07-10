"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { getInitials } from "../../lib/utils";

interface Org {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
}

interface OrgMembership {
  role: string;
  org: Org | null;
}

interface Member {
  user_id: string;
  role: string;
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    user_type: string;
  } | null;
}

export function OrgManager({
  userId,
  initialOrgs,
}: {
  userId: string;
  initialOrgs: OrgMembership[];
}) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    initialOrgs[0]?.org?.id ?? null
  );
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  async function createOrg() {
    if (!newOrgName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newOrgName.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const org = await res.json();
      const newMembership: OrgMembership = { role: "admin", org };
      setOrgs((prev) => [...prev, newMembership]);
      setSelectedOrgId(org.id);
      setNewOrgName("");
      toast.success("Organization created!");
      loadMembers(org.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create organization.");
    } finally {
      setCreating(false);
    }
  }

  async function loadMembers(orgId: string) {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/members`);
      if (!res.ok) throw new Error("Failed to load members");
      setMembers(await res.json());
    } catch {
      toast.error("Could not load members.");
    } finally {
      setLoadingMembers(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !selectedOrgId) return;
    setInviting(true);
    try {
      const res = await fetch(`/api/organizations/${selectedOrgId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: "member" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.member.full_name ?? inviteEmail} added to the organization.`);
      setInviteEmail("");
      loadMembers(selectedOrgId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to invite member.");
    } finally {
      setInviting(false);
    }
  }

  function selectOrg(orgId: string) {
    setSelectedOrgId(orgId);
    setMembers([]);
    loadMembers(orgId);
  }

  const selectedMembership = orgs.find((m) => m.org?.id === selectedOrgId);
  const isAdmin = selectedMembership?.role === "admin";
  const isOwner = selectedMembership?.org?.owner_id === userId;

  if (orgs.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="text-4xl mb-3">🏢</div>
          <p className="font-semibold mb-1">No organization yet</p>
          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
            Create one to collaborate with your team on shared projects.
          </p>
          <div className="flex gap-2 max-w-xs mx-auto">
            <Input
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createOrg()}
            />
            <Button onClick={createOrg} loading={creating}>
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Org selector */}
      {orgs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {orgs.map((m) => (
            <button
              key={m.org?.id}
              onClick={() => m.org && selectOrg(m.org.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: selectedOrgId === m.org?.id ? "var(--primary)" : "var(--border)",
                color: selectedOrgId === m.org?.id ? "var(--primary)" : "var(--foreground)",
                background: selectedOrgId === m.org?.id ? "var(--primary-light, #fef3c7)" : "transparent",
              }}
            >
              {m.org?.name}
            </button>
          ))}
        </div>
      )}

      {/* Org card */}
      {selectedMembership?.org && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedMembership.org.name}</CardTitle>
              <Badge variant={isAdmin ? "warning" : "default"}>{selectedMembership.role}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Members list */}
            <div>
              <p className="text-sm font-semibold mb-3">Members</p>
              {loadingMembers ? (
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading…</p>
              ) : members.length === 0 ? (
                <Button variant="ghost" size="sm" onClick={() => loadMembers(selectedOrgId!)}>
                  Load members
                </Button>
              ) : (
                <div className="space-y-3">
                  {members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                      >
                        {getInitials(m.profile?.full_name ?? m.profile?.email ?? "?")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {m.profile?.full_name ?? m.profile?.email}
                        </p>
                        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                          {m.profile?.email} · {m.profile?.user_type?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <Badge variant={m.role === "admin" ? "warning" : "default"}>
                        {m.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Invite form (admin only) */}
            {(isAdmin || isOwner) && (
              <div>
                <p className="text-sm font-semibold mb-2">Invite a member</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && inviteMember()}
                  />
                  <Button onClick={inviteMember} loading={inviting} disabled={!inviteEmail.trim()}>
                    Invite
                  </Button>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  They must already have an Ebbli Build account.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create another org */}
      <div>
        <p className="text-sm font-semibold mb-2">Create another organization</p>
        <div className="flex gap-2">
          <Input
            placeholder="Organization name"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createOrg()}
          />
          <Button onClick={createOrg} loading={creating} variant="outline">
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

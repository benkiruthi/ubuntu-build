"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { getInitials } from "../../lib/utils";

interface Professional {
  id: string;
  full_name: string | null;
  user_type: string;
  county: string | null;
  avatar_url: string | null;
  bio: string | null;
  years_experience: number | null;
  portfolio_url: string | null;
}

interface Filters {
  county?: string;
  user_type?: string;
  q?: string;
}

interface UserTypeOption {
  value: string;
  label: string;
  icon: string;
}

export function MarketplaceSearch({
  initialProfessionals,
  initialFilters,
  userTypes,
  counties,
}: {
  initialProfessionals: Professional[];
  initialFilters: Filters;
  userTypes: readonly UserTypeOption[];
  counties: readonly string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialFilters.q ?? "");
  const [county, setCounty] = useState(initialFilters.county ?? "");
  const [userType, setUserType] = useState(initialFilters.user_type ?? "");
  const [, startTransition] = useTransition();

  function applyFilters(overrides: Partial<Filters> = {}) {
    const params = new URLSearchParams();
    const f = { q, county, user_type: userType, ...overrides };
    if (f.q) params.set("q", f.q);
    if (f.county) params.set("county", f.county);
    if (f.user_type) params.set("user_type", f.user_type);
    startTransition(() => {
      router.push(`/marketplace?${params.toString()}`);
    });
  }

  function clearFilters() {
    setQ("");
    setCounty("");
    setUserType("");
    startTransition(() => router.push("/marketplace"));
  }

  const hasFilters = q || county || userType;

  return (
    <div className="space-y-5">
      {/* Search & filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Input
          placeholder="Search by name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters({ q })}
        />
        <Select
          options={[
            { value: "", label: "All specialties" },
            ...userTypes
              .filter((t) => !["homeowner", "developer"].includes(t.value))
              .map((t) => ({ value: t.value, label: `${t.icon} ${t.label}` })),
          ]}
          value={userType}
          onChange={(e) => {
            setUserType(e.target.value);
            applyFilters({ user_type: e.target.value });
          }}
        />
        <Select
          options={[
            { value: "", label: "All counties" },
            ...counties.map((c) => ({ value: c, label: c })),
          ]}
          value={county}
          onChange={(e) => {
            setCounty(e.target.value);
            applyFilters({ county: e.target.value });
          }}
        />
      </div>

      {hasFilters && (
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--muted-foreground)" }}>
            {initialProfessionals.length} result{initialProfessionals.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={clearFilters}
            className="underline"
            style={{ color: "var(--primary)" }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results grid */}
      {initialProfessionals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold mb-1">No professionals found</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {hasFilters
                ? "Try adjusting your filters."
                : "Be the first professional to list on the marketplace!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialProfessionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} userTypes={userTypes} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProfessionalCard({
  professional: pro,
  userTypes,
}: {
  professional: Professional;
  userTypes: readonly UserTypeOption[];
}) {
  const typeInfo = userTypes.find((t) => t.value === pro.user_type);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "var(--primary)", color: "white" }}
          >
            {pro.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pro.avatar_url}
                alt={pro.full_name ?? ""}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              getInitials(pro.full_name ?? "?")
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{pro.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {typeInfo && (
                <Badge variant="default" className="text-xs">
                  {typeInfo.icon} {typeInfo.label}
                </Badge>
              )}
              {pro.county && (
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  📍 {pro.county}
                </span>
              )}
            </div>
          </div>
        </div>

        {pro.bio && (
          <p
            className="text-sm line-clamp-3 mb-3"
            style={{ color: "var(--muted-foreground)" }}
          >
            {pro.bio}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          {pro.years_experience && (
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {pro.years_experience} yr{pro.years_experience !== 1 ? "s" : ""} experience
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            {pro.portfolio_url && (
              <a
                href={pro.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium"
                style={{ color: "var(--primary)" }}
              >
                Portfolio →
              </a>
            )}
            <a
              href={`/marketplace/${pro.id}`}
              className="text-xs font-medium"
              style={{ color: "var(--primary)" }}
            >
              View profile →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

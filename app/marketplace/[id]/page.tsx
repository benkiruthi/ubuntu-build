import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { USER_TYPES } from "../../../lib/theme";
import { formatDate, getInitials } from "../../../lib/utils";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: "Professional Profile — Ebbli Build" };
}

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  type Review = {
    id: string;
    rating: number;
    body: string | null;
    created_at: string;
    reviewer: { full_name: string | null } | null;
  };

  const [{ data: pro }, rawReviews] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, user_type, county, avatar_url, bio, years_experience, portfolio_url, created_at")
      .eq("id", id)
      .eq("listed_on_marketplace", true)
      .single(),
    supabase
      .from("marketplace_reviews")
      .select("id, rating, body, created_at, reviewer:profiles!marketplace_reviews_reviewer_id_fkey(full_name)")
      .eq("professional_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const reviews = rawReviews.data as Review[] | null;

  if (!pro) notFound();

  const typeInfo = USER_TYPES.find((t) => t.value === pro.user_type);
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <Link href="/marketplace" className="hover:underline">Marketplace</Link>
        <span>/</span>
        <span style={{ color: "var(--foreground)" }}>{pro.full_name}</span>
      </div>

      {/* Profile header */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {pro.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pro.avatar_url}
                  alt={pro.full_name ?? ""}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                getInitials(pro.full_name ?? "?")
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{pro.full_name}</h1>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {typeInfo && (
                  <Badge>
                    {typeInfo.icon} {typeInfo.label}
                  </Badge>
                )}
                {pro.county && (
                  <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                    📍 {pro.county}
                  </span>
                )}
                {avgRating && (
                  <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                    ⭐ {avgRating} ({reviews?.length} review{reviews?.length !== 1 ? "s" : ""})
                  </span>
                )}
              </div>
              {pro.years_experience && (
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {pro.years_experience} years of experience
                </p>
              )}
            </div>
          </div>

          {pro.bio && (
            <div className="mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm leading-relaxed">{pro.bio}</p>
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            {pro.portfolio_url && (
              <a
                href={pro.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium py-2 px-4 rounded-lg border"
                style={{ borderColor: "var(--border)" }}
              >
                View Portfolio →
              </a>
            )}
            <Link href={`/dashboard`}>
              <Button>Start a Project Together</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <div>
        <h2 className="font-semibold mb-3">
          Reviews {reviews?.length ? `(${reviews.length})` : ""}
        </h2>
        {!reviews?.length ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                No reviews yet. Be the first to work with {pro.full_name?.split(" ")[0]}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const reviewer = r.reviewer;
              return (
                <Card key={r.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-sm">
                          {reviewer?.full_name ?? "Anonymous"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {formatDate(r.created_at)}
                        </p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="text-sm"
                            style={{ color: r.rating >= star ? "#f59e0b" : "var(--muted)" }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.body && (
                      <p className="text-sm mt-2 leading-relaxed">{r.body}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

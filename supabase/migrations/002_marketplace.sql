-- Add marketplace listing fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS portfolio_url text,
  ADD COLUMN IF NOT EXISTS listed_on_marketplace boolean NOT NULL DEFAULT false;

-- RLS: anyone can read marketplace-listed profiles (public directory)
CREATE POLICY "Public can view marketplace profiles"
  ON profiles FOR SELECT
  USING (listed_on_marketplace = true);

-- Reviews table for marketplace professionals
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, professional_id)
);

ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reviews"
  ON marketplace_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != professional_id);

CREATE POLICY "Anyone can read reviews"
  ON marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Reviewers can update their own reviews"
  ON marketplace_reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

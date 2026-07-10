-- Email tracking field on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "1. What We Collect",
    body: "We collect information you provide directly (name, email, professional profile, project data) and information generated through your use of the Platform (AI session history, usage metrics). We do not sell your personal data.",
  },
  {
    title: "2. How We Use Your Data",
    body: "Your data is used to provide and improve the Platform, send transactional emails, process payments, and display your profile on the marketplace if you opt in. AI session data is used to continue conversations across sessions.",
  },
  {
    title: "3. Data Storage",
    body: "Data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure. Project files are stored in Supabase Storage. Payment processing is handled by Pesapal and M-Pesa; we do not store card or mobile money credentials.",
  },
  {
    title: "4. Data Sharing",
    body: "We share data only with service providers necessary to operate the Platform: Supabase (database), Resend (email), Pesapal (payments), Groq (AI inference), and Africa's Talking (SMS). We do not share your data with advertisers.",
  },
  {
    title: "5. Marketplace Listings",
    body: "If you opt in to the professional marketplace, your name, professional type, county, bio, years of experience, and portfolio URL will be visible to other Platform users. You can remove your listing at any time from Settings - Marketplace Listing.",
  },
  {
    title: "6. Your Rights",
    body: "You may access, correct, or delete your account data at any time. To delete your account and all associated data, contact privacy@ebbli.co. We will action deletion requests within 30 days.",
  },
  {
    title: "7. Cookies",
    body: "We use a single httpOnly session cookie for admin authentication. Authentication for regular users is managed by Supabase and uses httpOnly cookies for security.",
  },
  {
    title: "8. Children",
    body: "The Platform is not directed at children under 18. We do not knowingly collect data from minors.",
  },
  {
    title: "9. Updates to This Policy",
    body: "We may update this policy periodically. We will notify users of material changes by email.",
  },
  {
    title: "10. Contact",
    body: "For privacy questions or data requests, contact privacy@ebbli.co.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-sm mb-8 inline-block"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-10" style={{ color: "var(--muted-foreground)" }}>
          Last updated: July 2026
        </p>

        <div>
          {sections.map((section) => (
            <div key={section.title} className="mb-8">
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                {section.title}
              </h2>
              <p style={{ color: "var(--muted-foreground)", lineHeight: "1.7" }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

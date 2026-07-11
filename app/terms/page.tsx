import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Service" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Ebbli Build (the Platform), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.",
  },
  {
    title: "2. Description of Service",
    body: "Ebbli Build provides AI-assisted tools for architecture, engineering, and construction professionals in East Africa. The Platform offers project management, AI consultation, bill of quantities generation, cost estimation, and a marketplace for professionals.",
  },
  {
    title: "3. Accounts and Registration",
    body: "You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.",
  },
  {
    title: "4. Subscriptions and Payments",
    body: "Paid plans are billed monthly in Kenyan Shillings (KES) via Pesapal / M-Pesa. Subscriptions renew automatically. You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are not provided for partial months.",
  },
  {
    title: "5. AI-Generated Content",
    body: "The Platform's AI modules provide guidance and estimates only. They do not constitute professional engineering or architectural advice. You are solely responsible for verifying all AI outputs before applying them in construction or design work.",
  },
  {
    title: "6. Intellectual Property",
    body: "Content you upload to the Platform remains yours. By uploading, you grant Ebbli Build a limited licence to store and process it solely to provide the service. AI outputs generated from your inputs belong to you.",
  },
  {
    title: "7. Prohibited Use",
    body: "You may not use the Platform to violate any laws, infringe on intellectual property, transmit malware, or attempt to reverse-engineer the service.",
  },
  {
    title: "8. Limitation of Liability",
    body: "Ebbli Build is provided as-is. We are not liable for indirect, incidental, or consequential damages arising from your use of the Platform.",
  },
  {
    title: "9. Changes to Terms",
    body: "We may update these terms from time to time. Continued use after notice of changes constitutes acceptance of the revised terms.",
  },
  {
    title: "10. Contact",
    body: "For questions about these terms, contact us at legal@ebbli.co.",
  },
];

export default function TermsPage() {
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
          Terms of Service
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

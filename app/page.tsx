import Link from "next/link";
import { Button } from "../components/ui/button";
import { PROJECT_PHASES } from "../lib/theme";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
            style={{ background: "var(--primary)" }}
          >
            B
          </div>
          <span className="font-bold" style={{ color: "var(--primary)" }}>Ebbli Build</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24"
        style={{ background: "linear-gradient(180deg, var(--card) 0%, var(--muted) 100%)" }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "var(--primary-light)", color: "var(--primary-deep)" }}
        >
          🏗️ East Africa&apos;s AI Building Platform · Built for Kenya
        </div>

        <h1
          className="text-4xl sm:text-6xl font-black leading-tight mb-6 max-w-3xl"
          style={{ color: "var(--foreground)" }}
        >
          Design, Plan & Build{" "}
          <span className="gradient-text">Smarter with AI.</span>
        </h1>

        <p
          className="text-lg sm:text-xl mb-8 max-w-xl leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Generate floor plans, BOQs and cost estimates in minutes.
          All priced in KES, built for East African homes and developers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/signup">
            <Button size="lg">Start your first project — Free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Sign in</Button>
          </Link>
        </div>

        <p className="text-xs mt-4" style={{ color: "var(--muted-foreground)" }}>
          No credit card required · First project free
        </p>
      </div>

      {/* AI Modules strip */}
      <div className="py-16 px-6" style={{ background: "var(--muted)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Everything you need to build in Kenya</h2>
            <p style={{ color: "var(--muted-foreground)" }}>
              Ten AI modules covering every phase of your project.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_PHASES.map((phase) => (
              <div
                key={phase.id}
                className="rounded-2xl p-5 border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="text-2xl mb-2">{phase.icon}</div>
                <p className="font-semibold text-sm">{phase.label}</p>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {PHASE_DESCRIPTIONS[phase.id] ?? ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="py-16 px-6" style={{ background: "var(--card)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Built for real Kenyans</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 border"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
              >
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="py-20 px-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)" }}
      >
        <h2 className="text-3xl font-black mb-3">Ready to build smarter?</h2>
        <p className="text-white/70 mb-8 text-lg">Your first project is completely free.</p>
        <Link href="/signup">
          <Button
            size="lg"
            className="bg-white text-[#78350f] hover:bg-white/90 font-bold"
          >
            Get started — it&apos;s free
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer
        className="py-8 px-6 border-t text-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ color: "var(--primary)" }} className="font-bold">Ebbli Build</span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/pricing" className="hover:underline">Pricing</Link>
          </div>
          <span>© 2026 Ebbli Technologies</span>
        </div>
      </footer>
    </div>
  );
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  architect: "Generate floor plans, space schedules & design reports",
  renders: "Photorealistic exterior & interior renders",
  qs: "Instant BOQ and KES cost estimates",
  cost_optimizer: "Find savings & material alternatives",
  structural: "Foundation, column & beam concepts",
  interior: "Furniture, kitchens & colour schemes",
  landscape: "Gardens, pools & outdoor spaces",
  construction: "Daily reports, materials & site management",
};

const TESTIMONIALS = [
  {
    quote:
      "I got a full floor plan and cost estimate for my 3BR house in under 30 minutes. Worth every shilling.",
    name: "James Mwangi",
    role: "Homeowner · Kiambu",
  },
  {
    quote:
      "As an architect, the AI Architect saves me hours on the initial brief. My clients love seeing options instantly.",
    name: "Grace Achieng",
    role: "Architect · Nairobi",
  },
  {
    quote:
      "The BOQ feature alone is worth it. I used to spend days on quantity surveying. Now it takes minutes.",
    name: "Peter Oduya",
    role: "Quantity Surveyor · Kisumu",
  },
];

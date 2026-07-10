import Link from "next/link";
import { Button } from "../components/ui/button";
import { PROJECT_PHASES, SUBSCRIPTION_TIERS } from "../lib/theme";
import { formatKES } from "../lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-50"
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
        <div className="hidden sm:flex items-center gap-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <a href="#modules" className="hover:underline">AI Modules</a>
          <a href="#pricing" className="hover:underline">Pricing</a>
          <Link href="/marketplace" className="hover:underline">Marketplace</Link>
        </div>
        <div className="flex items-center gap-2">
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
        className="flex flex-col items-center justify-center text-center px-6 py-24 sm:py-32"
        style={{ background: "linear-gradient(180deg, var(--card) 0%, var(--background) 100%)" }}
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "#fef3c7", color: "#78350f" }}
        >
          🏗️ East Africa&apos;s AI Building Platform · Built for Kenya
        </div>

        <h1
          className="text-4xl sm:text-6xl font-black leading-tight mb-6 max-w-4xl"
          style={{ color: "var(--foreground)" }}
        >
          Design, Plan &amp; Build{" "}
          <span className="gradient-text">Smarter with AI.</span>
        </h1>

        <p
          className="text-lg sm:text-xl mb-8 max-w-2xl leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Generate design briefs, Bills of Quantities, structural notes, and construction plans —
          all priced in KES, powered by AI, built for East African homes and developers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Link href="/signup">
            <Button size="lg">Start your first project — Free</Button>
          </Link>
          <Link href="#modules">
            <Button size="lg" variant="outline">See the AI modules →</Button>
          </Link>
        </div>

        <p className="text-xs mt-5" style={{ color: "var(--muted-foreground)" }}>
          No credit card required · First project &amp; AI Architect free forever
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 mt-10 justify-center">
          {["Kenyan market prices", "M-Pesa payments", "KES billing", "Built in Nairobi"].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            >
              ✓ {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="py-10 px-6 border-y"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "8", label: "AI Modules" },
            { value: "47", label: "Counties covered" },
            { value: "< 2 min", label: "Design brief" },
            { value: "KES", label: "All prices in" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: "var(--primary)" }}>
                {s.value}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Modules */}
      <div id="modules" className="py-20 px-6" style={{ background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Eight AI Modules. One Platform.</h2>
            <p className="text-lg" style={{ color: "var(--muted-foreground)" }}>
              From first sketch to final handover — every stage of construction covered by AI.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_PHASES.map((phase) => (
              <div
                key={phase.id}
                className="rounded-2xl p-5 border hover:shadow-md transition-shadow"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="text-2xl mb-3">{phase.icon}</div>
                <p className="font-bold text-sm mb-1.5">{phase.label}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {PHASE_DESCRIPTIONS[phase.id] ?? ""}
                </p>
                <p
                  className="text-xs mt-3 font-medium uppercase tracking-wide"
                  style={{ color: phase.tier === "free" ? "#16a34a" : "var(--primary)" }}
                >
                  {phase.tier === "free" ? "Free" : phase.tier === "starter" ? "Starter+" : "Pro+"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 px-6" style={{ background: "var(--muted)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create your project",
                desc: "Tell us the type, location, plot size and budget. Takes 60 seconds.",
              },
              {
                step: "02",
                title: "Chat with the AI",
                desc: "The AI Architect asks questions and builds a full design brief tailored to Kenya.",
              },
              {
                step: "03",
                title: "Export & share",
                desc: "Download BOQs as PDF, share with contractors, and track every milestone.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4"
                  style={{ background: "var(--primary)" }}
                >
                  {s.step}
                </div>
                <h3 className="font-bold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div id="pricing" className="py-20 px-6" style={{ background: "var(--background)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">Simple, KES pricing</h2>
            <p style={{ color: "var(--muted-foreground)" }}>
              Pay with M-Pesa. Cancel anytime. No hidden fees.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {(["free", "starter", "pro"] as const).map((tier) => {
              const info = SUBSCRIPTION_TIERS[tier];
              const isPro = tier === "pro";
              return (
                <div
                  key={tier}
                  className={`rounded-2xl p-6 border ${isPro ? "ring-2 ring-amber-600" : ""}`}
                  style={{
                    background: isPro ? "linear-gradient(135deg,#78350f,#b45309)" : "var(--card)",
                    borderColor: "var(--border)",
                  }}
                >
                  <p className={`font-bold uppercase text-xs tracking-widest mb-3 ${isPro ? "text-white/70" : ""}`}
                    style={!isPro ? { color: "var(--muted-foreground)" } : undefined}>
                    {info.label} {isPro && "⭐ Most popular"}
                  </p>
                  <p className={`text-3xl font-black mb-1 ${isPro ? "text-white" : ""}`}>
                    {info.price === 0 ? "Free" : formatKES(info.price as number)}
                    {info.price !== 0 && (
                      <span className={`text-base font-normal ${isPro ? "text-white/70" : ""}`}
                        style={!isPro ? { color: "var(--muted-foreground)" } : undefined}> /mo</span>
                    )}
                  </p>
                  <ul className={`mt-5 space-y-2.5 text-sm mb-6 ${isPro ? "text-white/80" : ""}`}
                    style={!isPro ? { color: "var(--muted-foreground)" } : undefined}>
                    <li>✓ {info.projects} project{(info.projects ?? 0) > 1 ? "s" : ""}</li>
                    <li>✓ {info.aiSessions} AI sessions/mo</li>
                    <li>✓ {Array.isArray(info.phases) ? info.phases.length : "All"} AI modules</li>
                    <li>✓ {info.teamSize} team member{(info.teamSize ?? 0) > 1 ? "s" : ""}</li>
                    <li>✓ PDF export</li>
                    <li>✓ File storage</li>
                  </ul>
                  <Link href="/signup">
                    <Button
                      size="md"
                      className={`w-full ${isPro ? "bg-white text-amber-800 hover:bg-white/90 font-bold" : ""}`}
                      variant={isPro ? "secondary" : tier === "free" ? "outline" : "primary"}
                    >
                      {tier === "free" ? "Get started free" : `Start with ${info.label}`}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>
            Need more? <a href="mailto:hello@ebbli.co" className="underline" style={{ color: "var(--primary)" }}>Contact us</a> for Enterprise pricing.
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 px-6" style={{ background: "var(--card)" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Built for real Kenyans</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-6 border"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              >
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ color: "#f59e0b" }}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--foreground)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="py-24 px-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)" }}
      >
        <h2 className="text-3xl sm:text-4xl font-black mb-3">Ready to build smarter?</h2>
        <p className="text-white/70 mb-8 text-lg">
          Your first project &amp; AI Architect are free — no credit card needed.
        </p>
        <Link href="/signup">
          <Button
            size="lg"
            className="bg-white text-amber-800 hover:bg-white/90 font-bold"
          >
            Get started — it&apos;s free
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer
        className="py-10 px-6 border-t"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold mb-3" style={{ color: "var(--primary)" }}>Ebbli Build</p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                AI-powered architecture, engineering &amp; construction platform for East Africa.
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Product</p>
              <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <p><a href="#modules" className="hover:underline">AI Modules</a></p>
                <p><a href="#pricing" className="hover:underline">Pricing</a></p>
                <p><Link href="/marketplace" className="hover:underline">Marketplace</Link></p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Company</p>
              <div className="space-y-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <p><a href="mailto:hello@ebbli.co" className="hover:underline">Contact</a></p>
                <p><Link href="/privacy" className="hover:underline">Privacy Policy</Link></p>
                <p><Link href="/terms" className="hover:underline">Terms of Service</Link></p>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Part of</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                <a href="https://ubuntu-africa.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--primary)" }}>
                  Ubuntu Africa
                </a>
                <br />
                <span className="text-xs">Building East Africa&apos;s digital ecosystem</span>
              </p>
            </div>
          </div>
          <div
            className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <span>© {new Date().getFullYear()} Ebbli Technologies Limited · Nairobi, Kenya</span>
            <span>Pay with M-Pesa · KES pricing · NCA compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  architect: "Conversational AI that builds a complete design brief — rooms, style, utilities, constraints",
  renders: "Detailed render briefs for photorealistic exterior and interior visualisation",
  qs: "Instant Bill of Quantities with Kenyan market rates, materials & labour costs",
  cost_optimizer: "Find savings — alternative materials, deferred phases, local supplier options",
  structural: "Foundation type, structural system & EBK-compliant recommendations by county",
  interior: "Room-by-room design with colour palettes, Kenyan suppliers & furniture layouts",
  landscape: "Water-wise planting, driveways, outdoor living & drainage for your county",
  construction: "Phased programme, contractor schedule, payment milestones & site management",
};

const TESTIMONIALS = [
  {
    quote:
      "I got a full floor plan brief and cost estimate for my 3-bedroom house in under 30 minutes. Worth every shilling.",
    name: "James Mwangi",
    role: "Homeowner · Kiambu County",
  },
  {
    quote:
      "As an architect, the AI Architect saves me hours on the initial brief. My clients love seeing a structured output instantly.",
    name: "Grace Achieng",
    role: "Architect · Nairobi",
  },
  {
    quote:
      "The BOQ feature alone is worth the subscription. What used to take me three days now takes minutes.",
    name: "Peter Oduya",
    role: "Quantity Surveyor · Kisumu",
  },
];

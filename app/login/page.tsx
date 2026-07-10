import { LoginForm } from "../../components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In — Ebbli Build" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string };
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white"
        style={{ background: "linear-gradient(135deg, #78350f 0%, #b45309 60%, #d97706 100%)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl font-black">
              B
            </div>
            <span className="text-xl font-bold">Ebbli Build</span>
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Design. Plan.<br />Build Smarter.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            East Africa&apos;s AI-powered architecture and construction platform.
            Generate floor plans, BOQs, cost estimates and more — all in KES.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: "🏛️", text: "AI Architect generates your floor plan in minutes" },
            { icon: "📐", text: "Instant BOQ and cost estimates in KES" },
            { icon: "🏗️", text: "Manage your construction site with AI" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-white/80">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              style={{ background: "var(--primary)" }}
            >
              B
            </div>
            <span className="font-bold text-lg">Ebbli Build</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Sign in to your account to continue
          </p>
          <LoginForm
            redirectTo={searchParams.redirect ?? "/dashboard"}
            error={searchParams.error}
          />
        </div>
      </div>
    </div>
  );
}

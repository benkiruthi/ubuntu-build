import { SignupForm } from "../../components/auth/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account — Ebbli Build" };

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
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
            Start building<br />smarter today.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Your first project is free. No credit card required.
            Generate your AI floor plan in minutes.
          </p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6">
          <p className="text-white/80 text-sm italic leading-relaxed">
            &ldquo;I got a full floor plan, space schedule and cost estimate for my
            3-bedroom house in under 30 minutes. It would have taken 2 weeks and
            KES 50,000 with a traditional architect.&rdquo;
          </p>
          <p className="text-white/60 text-xs mt-3">— James M., Homeowner · Kiambu</p>
        </div>
      </div>

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
          <h2 className="text-2xl font-bold mb-1">Create your account</h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Free to start. No credit card required.
          </p>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}

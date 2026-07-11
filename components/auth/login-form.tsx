"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface LoginFormProps {
  redirectTo: string;
  error?: string;
}

export function LoginForm({ redirectTo, error }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
    } else {
      router.push(redirectTo);
      router.refresh();
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleFacebookLogin() {
    setFacebookLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
    if (error) {
      toast.error(error.message);
      setFacebookLoading(false);
    }
  }

  async function handlePhoneOTP() {
    setPhoneLoading(true);
    try {
      if (!otpSent) {
        if (!phone.trim()) {
          toast.error("Enter your phone number.");
          setPhoneLoading(false);
          return;
        }
        const normalized = phone.replace(/^0/, "+254").replace(/\D/g, "");
        const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
        if (error) {
          toast.error(error.message || "Failed to send OTP.");
        } else {
          setOtpSent(true);
        }
      } else {
        if (!otp.trim()) {
          toast.error("Enter the OTP.");
          setPhoneLoading(false);
          return;
        }
        const normalized = phone.replace(/^0/, "+254").replace(/\D/g, "");
        const { error } = await supabase.auth.verifyOtp({
          phone: normalized,
          token: otp,
          type: "sms",
        });
        if (error) {
          toast.error(error.message || "Invalid OTP.");
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong.");
    }
    setPhoneLoading(false);
  }

  return (
    <div className="space-y-4">
      {error === "auth_callback_failed" && (
        <div className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 rounded-xl p-3">
          Authentication failed. Please try again.
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        loading={googleLoading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleFacebookLogin}
        loading={facebookLoading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
        Continue with Facebook
      </Button>

      {!showPhone ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowPhone(true)}
        >
          📱 Continue with Phone
        </Button>
      ) : (
        <div className="space-y-3 p-4 bg-[var(--muted)] rounded-xl">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0712345678 or +254712345678"
            disabled={otpSent}
          />
          {otpSent && (
            <Input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              maxLength={6}
            />
          )}
          <Button
            type="button"
            className="w-full"
            onClick={handlePhoneOTP}
            loading={phoneLoading}
          >
            {otpSent ? "Verify OTP" : "Send OTP"}
          </Button>
          <button
            onClick={() => {
              setShowPhone(false);
              setPhone("");
              setOtp("");
              setOtpSent(false);
            }}
            className="text-xs text-[var(--primary)] hover:underline w-full text-center"
          >
            Back
          </button>
        </div>
      )}

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--muted-foreground)]">or</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}

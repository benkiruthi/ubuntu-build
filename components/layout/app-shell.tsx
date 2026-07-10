"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "../../lib/supabase/client";
import { getInitials } from "../../lib/utils";
import type { Database } from "../../types/database.types";

type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "avatar_url" | "user_type" | "subscription_tier"
>;

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/projects", label: "Projects", icon: "🏠" },
  { href: "/marketplace", label: "Marketplace", icon: "🔍" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Profile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = getInitials(profile?.full_name ?? "U");

  return (
    <div className="flex min-h-screen" style={{ background: "var(--muted)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#1c1917", color: "white" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: "var(--primary)", color: "white" }}
          >
            B
          </div>
          <span className="font-bold text-sm">Ebbli Build</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Subscription badge */}
        <div className="px-4 pb-2">
          <div
            className="rounded-xl p-3 text-xs"
            style={{ background: "var(--primary-deep)" }}
          >
            <div className="font-semibold capitalize mb-1">
              {profile?.subscription_tier ?? "free"} plan
            </div>
            {profile?.subscription_tier === "free" && (
              <Link href="/settings/billing" className="text-white/70 hover:text-white underline">
                Upgrade for more AI sessions →
              </Link>
            )}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/10">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--primary)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-xs text-white/50 capitalize">{profile?.user_type}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/40 hover:text-white text-xs transition-colors"
            title="Sign out"
          >
            ↩
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-[var(--muted)]"
          >
            ☰
          </button>
          <span className="font-bold text-sm" style={{ color: "var(--primary)" }}>
            Ebbli Build
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "var(--primary)" }}
          >
            {initials}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

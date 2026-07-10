import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/marketplace", label: "Marketplace" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const adminSession = jar.get("admin_session")?.value;

  if (!process.env.ADMIN_SECRET || adminSession !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div
        className="border-b px-6 py-3 flex items-center gap-6"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <Link href="/admin" className="font-bold text-sm" style={{ color: "var(--primary)" }}>
          🔧 Ebbli Admin
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm hover:underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/dashboard"
          className="ml-auto text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          ← Back to app
        </Link>
      </div>
      <main className="p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Inventory", href: "/admin/inventory", icon: "📦" },
  { label: "Orders", href: "/admin/orders", icon: "🛒" },
  { label: "Invoices", href: "/admin/invoices", icon: "🧾" },
  { label: "Box Tracking", href: "/admin/boxes", icon: "📦" },
  { label: "Clients", href: "/admin/clients", icon: "👥" },
  { label: "Social Media", href: "/admin/social", icon: "📱" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
] as const;

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/store");
  };

  return (
    <div className="flex min-h-screen bg-grey-50">
      {/* Sidebar */}
      <aside className="relative flex w-64 flex-col border-r border-border bg-white">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/admin" className="text-xl font-bold text-primary">
            Admin Panel
          </Link>
        </div>
        {user && (
          <div className="border-b border-border px-6 py-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
              Admin
            </span>
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-soft-blue-50 text-soft-blue-700"
                        : "text-grey-700 hover:bg-grey-50 hover:text-grey-900"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/store"
            className="mb-2 block w-full rounded-lg border border-border px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:bg-grey-50"
          >
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-grey-50 hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}


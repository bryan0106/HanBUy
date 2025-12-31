"use client";

import { useState } from "react";
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
  { label: "Receiving", href: "/admin/fulfillment/receiving", icon: "📬" },
  { label: "Consolidation", href: "/admin/fulfillment/consolidation", icon: "📦" },
  { label: "Courier", href: "/admin/fulfillment/courier", icon: "🚚" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-grey-50">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:relative lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/admin" className="text-xl font-bold text-primary" onClick={handleNavClick}>
            Admin Panel
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden"
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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
                    onClick={handleNavClick}
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
            onClick={handleNavClick}
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
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Link href="/admin" className="text-lg font-bold text-primary">
            Admin Panel
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}


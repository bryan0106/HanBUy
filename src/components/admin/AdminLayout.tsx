"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Toaster } from "react-hot-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  subItems?: Array<{ label: string; href: string; icon: string }>;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { 
    label: "Inventory", 
    href: "/admin/inventory", 
    icon: "📦",
    subItems: [
      { label: "Onhand", href: "/admin/inventory/onhand", icon: "✅" },
      { label: "Preorder", href: "/admin/inventory/preorder", icon: "⏰" },
      { label: "Pasabuy", href: "/admin/inventory/pasabuy", icon: "🛒" },
    ]
  },
  { label: "Orders", href: "/admin/orders", icon: "🛒" },
  { label: "Receiving", href: "/admin/fulfillment/receiving", icon: "📬" },
  { label: "Consolidation", href: "/admin/fulfillment/consolidation", icon: "📦" },
  { label: "Courier", href: "/admin/fulfillment/courier", icon: "🚚" },
  { label: "Invoices", href: "/admin/invoices", icon: "🧾" },
  { label: "Box Tracking", href: "/admin/boxes", icon: "📦" },
  { label: "Clients", href: "/admin/clients", icon: "👥" },
  { label: "Social Media", href: "/admin/social", icon: "📱" },
  { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
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
          <Link href="/admin" onClick={handleNavClick} className="shrink-0">
            <Image
              src="/download.jpg"
              alt="HanBuy Logo"
              width={120}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
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
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isInventoryActive = item.href === "/admin/inventory" && 
                (pathname?.startsWith("/admin/inventory/onhand") || 
                 pathname?.startsWith("/admin/inventory/preorder") || 
                 pathname?.startsWith("/admin/inventory/pasabuy"));
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      (isActive || isInventoryActive)
                        ? "bg-soft-blue-50 text-soft-blue-700"
                        : "text-grey-700 hover:bg-grey-50 hover:text-grey-900"
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                  {hasSubItems && (isActive || isInventoryActive) && (
                    <ul className="ml-4 mt-1 space-y-1 border-l-2 border-soft-blue-200 pl-4">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + "/");
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              onClick={handleNavClick}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                isSubActive
                                  ? "bg-soft-blue-100 text-soft-blue-800 font-semibold"
                                  : "text-grey-600 hover:bg-grey-50 hover:text-grey-900"
                              )}
                            >
                              <span className="text-sm">{subItem.icon}</span>
                              {subItem.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
          <Link href="/admin" className="shrink-0">
            <Image
              src="/download.jpg"
              alt="HanBuy Logo"
              width={100}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}


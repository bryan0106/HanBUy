"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/store", icon: "🏠" },
  { label: "Onhand", href: "/store/products/onhand", icon: "📦" },
  { label: "Pre-Order", href: "/store/products/preorder", icon: "📅" },
  { label: "My Orders", href: "/store/orders", icon: "🛒", requiresAuth: true },
  { label: "Account", href: "/store/account", icon: "👤", requiresAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Show all items, but redirect auth-required items to login if not authenticated
  const displayItems = navItems.map((item) => {
    if (item.requiresAuth && !isAuthenticated) {
      return { ...item, href: "/auth/login" };
    }
    return item;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/95 md:hidden">
      <div className="flex h-16 items-center justify-around">
        {displayItems.map((item) => {
          let active = false;

          // Home - exact match or store routes
          if (item.label === "Home") {
            active = pathname === "/store" || pathname === "/";
          }
          // Onhand - onhand products
          else if (item.label === "Onhand") {
            active = pathname === "/store/products/onhand" || pathname?.startsWith("/store/products/onhand");
          }
          // Pre-Order - preorder products
          else if (item.label === "Pre-Order") {
            active = pathname === "/store/products/preorder" || pathname?.startsWith("/store/products/preorder");
          }
          // My Orders - store orders routes
          else if (item.label === "My Orders") {
            active = pathname?.startsWith("/store/orders");
          }
          // Account - store account page
          else if (item.label === "Account") {
            active = pathname === "/store/account";
          }
          // Default - exact match or starts with
          else {
            active = pathname === item.href || pathname?.startsWith(item.href + "/");
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                active
                  ? "text-soft-blue-600"
                  : "text-grey-600"
              )}
            >
              <span className={cn(
                "text-xl",
                item.label === "Liked" && active && "text-red-500"
              )}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-soft-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


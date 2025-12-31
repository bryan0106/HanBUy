"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { MobileBottomNav } from "./MobileBottomNav";
import { AccountDropdown } from "./AccountDropdown";
import { NotificationButton } from "./NotificationButton";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { label: "Home", href: "/store" },
    { label: "Onhand Items", href: "/store/products/onhand" },
    { label: "Pre-Order", href: "/store/products/preorder" },
    { label: "Price Comparison", href: "/store/products/kr-comparison" },
    { label: "How It Works", href: "/store/how-it-works" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/store/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/store/products");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center gap-3 px-4">
          {/* Logo */}
          <Link href="/store" className="text-xl font-bold text-primary sm:text-2xl shrink-0">
            HanBuy
          </Link>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm transition-colors focus:border-soft-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 hover:text-grey-600"
                aria-label="Search"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "text-soft-blue-600"
                      : "text-grey-600 hover:text-grey-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Account/Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <NotificationButton />
              <AccountDropdown />
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="shrink-0 rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-white md:hidden">
            <nav className="container mx-auto px-4 py-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-soft-blue-50 text-soft-blue-600"
                            : "text-grey-600 hover:bg-grey-50"
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <footer className="border-t border-border bg-white pb-16 md:pb-8">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Mobile: 2-column grid, Desktop: 4-column */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {/* HanBuy Brand - Full width on mobile */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/store" className="inline-block">
                <h3 className="mb-3 text-lg font-bold text-grey-900 sm:mb-4">HanBuy</h3>
              </Link>
              <p className="text-xs leading-relaxed text-grey-600 sm:text-sm">
                Korea-to-Philippines E-commerce and Consolidation Logistics Platform
              </p>
            </div>
            
            {/* Shop Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-grey-900 sm:mb-4">Shop</h4>
              <ul className="space-y-2 text-xs text-grey-600 sm:text-sm">
                <li>
                  <Link href="/store/products" className="block transition-colors hover:text-grey-900">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/store/products/onhand" className="block transition-colors hover:text-grey-900">
                    Onhand Items
                  </Link>
                </li>
                <li>
                  <Link href="/store/products/preorder" className="block transition-colors hover:text-grey-900">
                    Pre-Order
                  </Link>
                </li>
                <li>
                  <Link href="/store/how-it-works" className="block transition-colors hover:text-grey-900">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Account Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-grey-900 sm:mb-4">Account</h4>
              <ul className="space-y-2 text-xs text-grey-600 sm:text-sm">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/store/orders" className="block transition-colors hover:text-grey-900">
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/box" className="block transition-colors hover:text-grey-900">
                        My Box
                      </Link>
                    </li>
                    <li>
                      <Link href="/store/account" className="block transition-colors hover:text-grey-900">
                        Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/invoices"
                        className="block transition-colors hover:text-grey-900"
                      >
                        Invoices
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/auth/login" className="block transition-colors hover:text-grey-900">
                      Login / Sign Up
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Support Section - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block">
              <h4 className="mb-4 text-sm font-semibold text-grey-900">Support</h4>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>
                  <Link href="/store/about" className="block transition-colors hover:text-grey-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="block transition-colors hover:text-grey-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Support Section for Mobile - Below main grid */}
          <div className="mt-6 border-t border-border pt-6 md:hidden">
            <h4 className="mb-3 text-sm font-semibold text-grey-900">Support</h4>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/store/about" className="text-xs text-grey-600 transition-colors hover:text-grey-900 sm:text-sm">
                About Us
              </Link>
              <Link href="/contact" className="text-xs text-grey-600 transition-colors hover:text-grey-900 sm:text-sm">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 border-t border-border pt-6 text-center text-xs text-grey-600 sm:mt-8 sm:pt-8 sm:text-sm">
            <p>&copy; 2024 HanBuy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


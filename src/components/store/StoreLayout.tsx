"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { label: "Home", href: "/store" },
    { label: "Onhand Items", href: "/store/products/onhand" },
    { label: "Pre-Order", href: "/store/products/preorder" },
    { label: "Price Comparison", href: "/store/products/kr-comparison" },
    { label: "How It Works", href: "/store/how-it-works" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/store" className="text-2xl font-bold text-primary">
            HanBuy
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
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

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.name}
                  </span>
                  <button
                    onClick={logout}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-grey-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-semibold text-grey-900">HanBuy</h3>
              <p className="text-sm text-grey-600">
                Korea-to-Philippines E-commerce and Consolidation Logistics
                Platform
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-grey-900">Shop</h4>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>
                  <Link href="/store/products" className="hover:text-grey-900">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/store/categories" className="hover:text-grey-900">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-grey-900">Account</h4>
              <ul className="space-y-2 text-sm text-grey-600">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/dashboard" className="hover:text-grey-900">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/box" className="hover:text-grey-900">
                        My Box
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/invoices"
                        className="hover:text-grey-900"
                      >
                        Invoices
                      </Link>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link href="/auth/login" className="hover:text-grey-900">
                      Login / Sign Up
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-grey-900">Support</h4>
              <ul className="space-y-2 text-sm text-grey-600">
                <li>
                  <Link href="/store/about" className="hover:text-grey-900">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-grey-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-grey-600">
            <p>&copy; {new Date().getFullYear()} HanBuy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


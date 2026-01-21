"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { invoiceService } from "@/services/invoiceService";
import { useCart } from "@/hooks/useCart";
import { MobileBottomNav } from "./MobileBottomNav";
import { AccountDropdown } from "./AccountDropdown";
import { NotificationButton } from "./NotificationButton";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, getItemCount, refetch } = useCart(user?.id || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasInvoices, setHasInvoices] = useState(false);
  const cartItemCount = getItemCount();

  // Listen for cart updates from other pages
  useEffect(() => {
    const handleCartUpdate = () => {
      if (user?.id) {
        refetch();
      }
    };

    // Listen for custom cart update events
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('cartItemAdded', handleCartUpdate);
    window.addEventListener('cartItemRemoved', handleCartUpdate);
    window.addEventListener('cartItemUpdated', handleCartUpdate);
    window.addEventListener('cartCleared', handleCartUpdate);

    // Refresh cart when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (user?.id) {
        refetch();
      }
    };
    window.addEventListener('focus', handleFocus);

    // Periodic refresh every 30 seconds as fallback
    const intervalId = setInterval(() => {
      if (user?.id) {
        refetch();
      }
    }, 30000);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('cartItemAdded', handleCartUpdate);
      window.removeEventListener('cartItemRemoved', handleCartUpdate);
      window.removeEventListener('cartItemUpdated', handleCartUpdate);
      window.removeEventListener('cartCleared', handleCartUpdate);
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, [user?.id, refetch]);

  // Check if user has invoices (drives nav badge visibility)
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        if (!user?.id) {
          setHasInvoices(false);
          return;
        }
        const response = await invoiceService.getInvoices({ page: 1, limit: 1 });
        setHasInvoices((response.data?.length || 0) > 0);
      } catch {
        setHasInvoices(false);
      }
    };
    loadInvoices();
  }, [user?.id]);

  const navItems = [
    { label: "Home", href: "/store" },
    { label: "Onhand Items", href: "/store/products/onhand" },
    { label: "Pre-Order", href: "/store/products/preorder" },
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

  // Check if user has invoices
  useEffect(() => {
    const checkInvoices = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await invoiceService.getInvoices({ page: 1, limit: 1 });
          setHasInvoices((response.data?.length || 0) > 0);
        } catch (error) {
          console.error("Error checking invoices:", error);
          setHasInvoices(false);
        }
      } else {
        setHasInvoices(false);
      }
    };

    checkInvoices();
  }, [isAuthenticated, user?.id]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation Bar - Flat Design */}
      <header className="sticky top-0 z-40 border-b border-[#FCE4EC] bg-[#f8e3ec]">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo - Left */}
          <Link href="/store" className="shrink-0">
            <Image
              src="/download.jpg"
              alt="HanBuy Logo"
              width={120}
              height={40}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </Link>

          {/* Navigation Links - Centered */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    isActive
                      ? "text-[#FF85A2]"
                      : "text-[#2C2C2C] hover:text-[#FF85A2]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Cart Icon and Account */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              href="/store/cart"
              className="relative flex items-center justify-center p-2 text-[#2C2C2C] hover:text-[#FF85A2] transition-colors"
              aria-label="Shopping Cart"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {isAuthenticated && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF85A2] text-xs font-bold text-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Account/Login Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationButton />
                <AccountDropdown />
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="shrink-0 rounded-[4px] bg-[#FF85A2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#FF85A2]/90"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-[#f8e3ec] md:hidden">
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
                          "block rounded-[4px] px-4 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#FFF5F7] text-[#FF85A2]"
                            : "text-[#2C2C2C] hover:bg-[#FFF5F7] hover:text-[#FF85A2]"
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
      <footer className="border-t border-[#FCE4EC] bg-white pb-16 md:pb-8">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Mobile: 2-column grid, Desktop: 4-column */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {/* HanBuy Brand - Full width on mobile */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/store" className="inline-block mb-3 sm:mb-4">
                <Image
                  src="/download.jpg"
                  alt="HanBuy Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto sm:h-10"
                />
              </Link>
              <p className="text-xs leading-relaxed text-grey-700 sm:text-sm">
                Korea-to-Philippines E-commerce and Consolidation Logistics Platform
              </p>
            </div>
            
            {/* Shop Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-grey-900 sm:mb-4">Shop</h4>
              <ul className="space-y-2 text-xs text-grey-700 sm:text-sm">
                <li>
                  <Link href="/store/products" className="block font-medium transition-colors hover:text-[#FF85A2]">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/store/products/onhand" className="block font-medium transition-colors hover:text-[#FF85A2]">
                    Onhand Items
                  </Link>
                </li>
                <li>
                  <Link href="/store/products/preorder" className="block font-medium transition-colors hover:text-[#FF85A2]">
                    Pre-Order
                  </Link>
                </li>
                <li>
                  <Link href="/store/how-it-works" className="block font-medium transition-colors hover:text-[#FF85A2]">
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Account Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-grey-900 sm:mb-4">Account</h4>
              <ul className="space-y-2 text-xs text-grey-700 sm:text-sm">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/store/orders" className="block font-medium transition-colors hover:text-[#FF85A2]">
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard/box" className="block font-medium transition-colors hover:text-[#FF85A2]">
                        My Box
                      </Link>
                    </li>
                    <li>
                      <Link href="/store/account" className="block font-medium transition-colors hover:text-[#FF85A2]">
                        Account
                      </Link>
                    </li>
                    {hasInvoices && (
                      <li>
                        <Link
                          href="/store/invoices"
                          className="block font-medium transition-colors hover:text-[#FF85A2]"
                        >
                          Invoices
                        </Link>
                      </li>
                    )}
                  </>
                ) : (
                  <li>
                    <Link href="/auth/login" className="block font-medium transition-colors hover:text-[#FF85A2]">
                      Login / Sign Up
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Support Section - Hidden on mobile, shown on desktop */}
            <div className="hidden md:block">
              <h4 className="mb-4 text-sm font-semibold text-grey-900">Support</h4>
              <ul className="space-y-2 text-sm text-grey-700">
                <li>
                  <Link href="/store/about" className="block font-medium transition-colors hover:text-[#FF85A2]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/store/contact" className="block font-medium transition-colors hover:text-[#FF85A2]">
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
              <Link href="/store/about" className="text-xs font-medium text-grey-700 transition-colors hover:text-[#FF85A2] sm:text-sm">
                About Us
              </Link>
              <Link href="/store/contact" className="text-xs font-medium text-grey-700 transition-colors hover:text-[#FF85A2] sm:text-sm">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-6 border-t border-border pt-6 text-center text-xs text-grey-700 sm:mt-8 sm:pt-8 sm:text-sm">
            <p className="font-medium">&copy; 2024 HanBuy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Exclude root /admin route from authentication check (it's the login page)
  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (!loading && !isLoginPage) {
      // For other admin routes (not /admin), require authentication
      if (!isAuthenticated) {
        router.push("/admin?redirect=" + encodeURIComponent(pathname || "/admin"));
      } else if (!isAdmin) {
        router.push("/admin?error=admin_access_required");
      }
    }
  }, [isAuthenticated, isAdmin, loading, router, isLoginPage, pathname]);

  // Allow /admin route (login page) to render without authentication
  // The page component itself will handle showing login or dashboard
  // Never show sidebar on login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <AdminLayout>{children}</AdminLayout>;
}


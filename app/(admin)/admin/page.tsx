"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { AdminLayout } from "@/components/admin/AdminLayout";

function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam === "customer_access_required") {
      setError("This is an admin login page. Please use customer login for store access.");
    }
  }, [errorParam]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && user && isAdmin) {
      // Already authenticated as admin, stay on this page (will show dashboard)
      return;
    } else if (isAuthenticated && user && !isAdmin) {
      // Customer trying to access admin login - redirect to customer login
      setError("This is an admin login page. Please use customer login for store access.");
      router.push("/?error=customer_access_required");
    }
  }, [isAuthenticated, user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (!result) {
        throw new Error("Login succeeded but no user data returned");
      }
      
      // Check if user is admin
      if (result.role !== 'admin') {
        setError("Admin access required. Please login with admin credentials.");
        setLoading(false);
        // Clear the login attempt (user will be logged out automatically)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hanbuy_token');
          localStorage.removeItem('hanbuy_user');
        }
        return;
      }
      
      // Force page reload to show dashboard with updated auth state
      window.location.href = '/admin';
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
        ? err 
        : "Invalid email or password. Please check your credentials and try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground">
            Sign in to access admin dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="admin@hanbuy.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-soft-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Spinner size="sm" className="text-white" />}
            {loading ? "Signing in..." : "Sign In as Admin"}
          </button>
        </form>

        <div className="mt-6 space-y-2 rounded-lg bg-grey-50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Test Admin Account:</p>
          <div>
            <p className="mb-1">
              <strong>Admin:</strong> admin@hanbuy.com / admin123
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@hanbuy.com");
                setPassword("admin123");
              }}
              disabled={loading}
              className="text-xs text-soft-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Click to fill admin credentials
            </button>
          </div>
        </div>

        <div className="mt-4 text-center space-y-2">
          <Link
            href="/"
            className="block text-sm text-soft-blue-600 hover:underline"
          >
            Customer Login →
          </Link>
          <Link
            href="/store"
            className="block text-sm text-muted-foreground hover:underline"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalInventory: 0,
    lowStockItems: 0,
    pendingInvoices: 0,
    unpaidInvoices: 0,
    activeBoxes: 0,
    pendingApprovals: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalOrders: 156,
      pendingOrders: 12,
      totalInventory: 1245,
      lowStockItems: 8,
      pendingInvoices: 23,
      unpaidInvoices: 15,
      activeBoxes: 89,
      pendingApprovals: 5,
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Orders</p>
          <p className="text-2xl font-bold sm:text-3xl">{stats.totalOrders}</p>
          <Link
            href="/admin/orders"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Pending Orders</p>
          <p className="text-2xl font-bold text-warning sm:text-3xl">{stats.pendingOrders}</p>
          <Link
            href="/admin/orders?status=pending"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-error sm:text-3xl">{stats.lowStockItems}</p>
          <Link
            href="/admin/inventory?alert=low_stock"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Check →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Unpaid Invoices</p>
          <p className="text-2xl font-bold text-error sm:text-3xl">{stats.unpaidInvoices}</p>
          <Link
            href="/admin/invoices?status=unpaid"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Active Boxes</p>
          <p className="text-2xl font-bold sm:text-3xl">{stats.activeBoxes}</p>
          <Link
            href="/admin/boxes"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Pending Approvals</p>
          <p className="text-2xl font-bold text-warning sm:text-3xl">{stats.pendingApprovals}</p>
          <Link
            href="/admin/clients?status=pending"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Inventory</p>
          <p className="text-2xl font-bold sm:text-3xl">{stats.totalInventory}</p>
          <Link
            href="/admin/inventory"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <p className="text-xs text-muted-foreground sm:text-sm">Pending Invoices</p>
          <p className="text-2xl font-bold text-warning sm:text-3xl">{stats.pendingInvoices}</p>
          <Link
            href="/admin/invoices?status=pending"
            className="mt-2 text-xs text-soft-blue-600 hover:underline sm:text-sm"
          >
            Review →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/admin/inventory/new"
            className="rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-grey-50"
          >
            <p className="font-semibold">Add New Item</p>
            <p className="text-sm text-muted-foreground">Add inventory item</p>
          </Link>
          <Link
            href="/admin/orders/new"
            className="rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-grey-50"
          >
            <p className="font-semibold">Create Order</p>
            <p className="text-sm text-muted-foreground">Manual order entry</p>
          </Link>
          <Link
            href="/admin/social/new"
            className="rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-grey-50 sm:col-span-2 md:col-span-1"
          >
            <p className="font-semibold">Schedule Post</p>
            <p className="text-sm text-muted-foreground">Social media posting</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAuthenticated, user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grey-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated && user && isAdmin) {
    return (
      <AdminLayout>
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center bg-grey-50">
            <Spinner size="lg" />
          </div>
        }>
          <AdminDashboardContent />
        </Suspense>
      </AdminLayout>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-grey-50">
        <Spinner size="lg" />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

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
    if (isAuthenticated && user) {
      if (isAdmin) {
        const redirectTo = redirectParam && redirectParam.startsWith("/admin") && redirectParam.length > 6
          ? redirectParam
          : "/admin";
        router.replace(redirectTo);
      } else {
        // Customer trying to access admin login - redirect to customer login
        setError("This is an admin login page. Please use customer login for store access.");
        router.push("/auth/login?error=customer_access_required");
      }
    }
  }, [isAuthenticated, user, isAdmin, router, redirectParam]);

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
      
      setLoading(false);
      
      // Redirect to admin dashboard
      const redirectTo = redirectParam && redirectParam.startsWith("/admin") && redirectParam.length > 6
        ? redirectParam
        : "/admin";
      router.replace(redirectTo);
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
          <Link href="/admin" className="inline-block mb-4">
            <Image
              src="/download.jpg"
              alt="HanBuy Logo"
              width={140}
              height={46}
              className="h-10 w-auto mx-auto"
              priority
            />
          </Link>
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
            href="/auth/login"
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

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-grey-50">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

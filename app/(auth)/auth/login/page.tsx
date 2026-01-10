"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

function LoginForm() {
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
    if (errorParam === "admin_access_required") {
      setError("Admin access required. Please login with admin credentials.");
    }
  }, [errorParam]);

  // Simple redirect if already authenticated (only customers allowed here)
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        // Admin trying to access customer login - redirect to admin login
        router.push("/admin/login");
      } else {
        const redirectTo = redirectParam && redirectParam.startsWith("/") && redirectParam.length > 1 
          ? redirectParam 
          : "/store";
        router.replace(redirectTo);
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
      
      setLoading(false);
      
      // Check if user is admin - redirect to admin login if admin
      if (result.role === 'admin') {
        setError("Admin accounts must login at /admin/login");
        // Clear the login attempt (user will be logged out automatically)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hanbuy_token');
          localStorage.removeItem('hanbuy_user');
        }
        setTimeout(() => {
          router.push("/admin/login");
        }, 2000);
        return;
      }
      
      // Customer login - redirect to store
      const redirectTo = redirectParam && redirectParam.startsWith("/") && redirectParam.length > 1 
        ? redirectParam 
        : "/store";
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
          <Link href="/store" className="inline-block mb-4">
            <Image
              src="/download.jpg"
              alt="HanBuy Logo"
              width={140}
              height={46}
              className="h-10 w-auto mx-auto"
              priority
            />
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access the store
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
              placeholder="your@email.com"
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2 rounded-lg bg-grey-50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Test Customer Accounts:</p>
          <div className="space-y-3">
            <div>
              <p className="mb-1">
                <strong>Customer 1:</strong> customer1@test.com / test123
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("customer1@test.com");
                  setPassword("test123");
                }}
                disabled={loading}
                className="text-xs text-soft-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Click to fill customer 1 credentials
              </button>
            </div>
            <div>
              <p className="mb-1">
                <strong>Customer 2:</strong> customer2@test.com / test123
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("customer2@test.com");
                  setPassword("test123");
                }}
                disabled={loading}
                className="text-xs text-soft-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Click to fill customer 2 credentials
              </button>
            </div>
            <div>
              <p className="mb-1">
                <strong>Customer 3:</strong> customer3@test.com / test123
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("customer3@test.com");
                  setPassword("test123");
                }}
                disabled={loading}
                className="text-xs text-soft-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Click to fill customer 3 credentials
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center space-y-2">
          <Link
            href="/admin/login"
            className="block text-sm text-soft-blue-600 hover:underline"
          >
            Admin Login →
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-grey-50">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

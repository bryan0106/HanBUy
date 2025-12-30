"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

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

  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        router.push("/admin");
      } else if (redirectParam) {
        // Use redirect parameter if provided
        router.push(redirectParam);
      } else {
        // Default to customer dashboard
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, isAdmin, redirectParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      // Redirect based on user role
      if (loggedInUser.role === "admin") {
        router.push("/admin");
      } else if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-grey-50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your dashboard
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
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
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
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-soft-blue-500"
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
            className="w-full rounded-lg bg-soft-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2 rounded-lg bg-grey-50 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Demo Accounts:</p>
          <div className="space-y-2">
            <div>
              <p>
                <strong>Admin:</strong> admin@hanbuy.com / admin
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@hanbuy.com");
                  setPassword("admin");
                }}
                className="mt-1 text-xs text-soft-blue-600 hover:underline"
              >
                Click to fill admin credentials
              </button>
            </div>
            <p>
              <strong>Customer:</strong> Use any email and password
            </p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/store"
            className="text-sm text-soft-blue-600 hover:underline"
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

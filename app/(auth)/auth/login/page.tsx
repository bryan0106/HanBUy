"use client";

import { useState, useEffect, Suspense } from "react"; // 1. Import Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

// 2. Rename your main component logic to something like LoginContent
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user, isAdmin } = useAuth();
  const router = useRouter();
  
  // useSearchParams is what triggers the need for Suspense
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const errorParam = searchParams.get("error");

  // ... (Keep all your existing useEffects and handleSubmit logic here) ...
  useEffect(() => {
    if (errorParam === "admin_access_required") {
      setError("Admin access required. Please login with admin credentials.");
    }
  }, [errorParam]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        router.push("/admin");
      } else if (redirectParam) {
        router.push(redirectParam);
      } else {
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
       {/* ... existing JSX code ... */}
       <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-lg">
          {/* Your existing form and UI */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... form content ... */}
          </form>
       </div>
    </div>
  );
}

// 3. Export a default function that wraps the content in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
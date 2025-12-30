"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DASHBOARD_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/store");
  };

  return (
    <div className="flex min-h-screen bg-grey-50">
      {/* Sidebar */}
      <aside className="relative flex w-64 flex-col border-r border-border bg-white">
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/" className="text-xl font-bold text-primary">
            HanBuy
          </Link>
        </div>
        {user && (
          <div className="border-b border-border px-6 py-3">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-soft-blue-50 text-soft-blue-700"
                        : "text-grey-700 hover:bg-grey-50 hover:text-grey-900"
                    )}
                  >
                    <span className="text-lg">{getIcon(item.icon)}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-grey-50 hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}

function getIcon(icon: string): string {
  const icons: Record<string, string> = {
    overview: "📊",
    box: "📦",
    tracking: "📍",
    invoices: "🧾",
    calculator: "🧮",
    shipping: "🚢",
    penalty: "⏰",
    documents: "📄",
  };
  return icons[icon] || "•";
}


"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "security">("profile");

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "profile"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "settings"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "security"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Security
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  defaultValue=""
                  placeholder="Not set"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard/orders"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">🛒</span>
                <div>
                  <p className="font-medium">My Orders</p>
                  <p className="text-xs text-muted-foreground">View all orders</p>
                </div>
              </Link>
              <Link
                href="/dashboard/box"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium">My Box</p>
                  <p className="text-xs text-muted-foreground">Track shipments</p>
                </div>
              </Link>
              <Link
                href="/dashboard/invoices"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">🧾</span>
                <div>
                  <p className="font-medium">Invoices</p>
                  <p className="text-xs text-muted-foreground">View invoices</p>
                </div>
              </Link>
              <Link
                href="/store/liked"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="font-medium">Liked Items</p>
                  <p className="text-xs text-muted-foreground">Saved products</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive SMS updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">Receive promotional emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Confirm new password"
                />
              </div>
              <button className="rounded-lg bg-soft-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700">
                Update Password
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-error">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <button className="rounded-lg border border-error px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10">
                  Delete Account
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logout</p>
                  <p className="text-sm text-muted-foreground">Sign out from your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-grey-100 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-grey-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


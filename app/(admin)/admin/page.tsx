"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
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


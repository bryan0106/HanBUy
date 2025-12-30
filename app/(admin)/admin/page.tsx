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
      <h1 className="mb-6 text-3xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <Link
            href="/admin/orders"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            View All →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending Orders</p>
          <p className="text-3xl font-bold text-warning">{stats.pendingOrders}</p>
          <Link
            href="/admin/orders?status=pending"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Low Stock Items</p>
          <p className="text-3xl font-bold text-error">{stats.lowStockItems}</p>
          <Link
            href="/admin/inventory?alert=low_stock"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Check →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
          <p className="text-3xl font-bold text-error">{stats.unpaidInvoices}</p>
          <Link
            href="/admin/invoices?status=unpaid"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Active Boxes</p>
          <p className="text-3xl font-bold">{stats.activeBoxes}</p>
          <Link
            href="/admin/boxes"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending Approvals</p>
          <p className="text-3xl font-bold text-warning">{stats.pendingApprovals}</p>
          <Link
            href="/admin/clients?status=pending"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Review →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Inventory</p>
          <p className="text-3xl font-bold">{stats.totalInventory}</p>
          <Link
            href="/admin/inventory"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pending Invoices</p>
          <p className="text-3xl font-bold text-warning">{stats.pendingInvoices}</p>
          <Link
            href="/admin/invoices?status=pending"
            className="mt-2 text-sm text-soft-blue-600 hover:underline"
          >
            Review →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
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
            className="rounded-lg border border-border bg-background p-4 text-center transition-colors hover:bg-grey-50"
          >
            <p className="font-semibold">Schedule Post</p>
            <p className="text-sm text-muted-foreground">Social media posting</p>
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: "PHP" | "KRW";
  status: "pending" | "paid" | "unpaid" | "overdue";
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const loadInvoices = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Invoice[] = [
      {
        id: "inv-1",
        invoiceNumber: "INV-2024-001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        total: 3285,
        currency: "PHP",
        status: "pending",
        dueDate: new Date("2024-12-20"),
        createdAt: new Date("2024-12-10"),
      },
      {
        id: "inv-2",
        invoiceNumber: "INV-2024-002",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        total: 2425,
        currency: "PHP",
        status: "paid",
        dueDate: new Date("2024-11-30"),
        paidAt: new Date("2024-11-25"),
        createdAt: new Date("2024-11-20"),
      },
      {
        id: "inv-3",
        invoiceNumber: "INV-2024-003",
        customerName: "Mike Johnson",
        customerEmail: "mike@example.com",
        total: 1500,
        currency: "PHP",
        status: "overdue",
        dueDate: new Date("2024-12-15"),
        createdAt: new Date("2024-12-01"),
      },
    ];
    setInvoices(mockData);
    setLoading(false);
  };

  const filteredInvoices =
    statusFilter === "all"
      ? invoices
      : invoices.filter((inv) => inv.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    paid: "bg-success/10 text-success",
    unpaid: "bg-error/10 text-error",
    overdue: "bg-error/10 text-error",
  };

  const totalPending = invoices
    .filter((inv) => inv.status === "pending" || inv.status === "unpaid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border bg-background px-4 py-2 font-semibold transition-colors hover:bg-grey-50">
            Auto Generate
          </button>
          <button className="rounded-lg border border-border bg-background px-4 py-2 font-semibold transition-colors hover:bg-grey-50">
            Send Reminders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending/Unpaid</p>
          <p className="text-2xl font-bold text-warning">
            {invoices.filter((inv) => inv.status === "pending" || inv.status === "unpaid").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold text-error">
            {invoices.filter((inv) => inv.status === "overdue").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Amount</p>
          <p className="text-2xl font-bold text-warning">
            {formatCurrency(totalPending, "PHP")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("unpaid")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "unpaid"
                ? "bg-error text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setStatusFilter("paid")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "paid"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter("overdue")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "overdue"
                ? "bg-error text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Invoice #</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Due Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Paid Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-grey-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/invoices/${invoice.id}`}
                      className="font-semibold text-soft-blue-600 hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{invoice.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[invoice.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {invoice.paidAt ? formatDate(invoice.paidAt) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
                        className="text-soft-blue-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                      <button className="text-soft-blue-600 hover:underline text-sm">
                        Send Reminder
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


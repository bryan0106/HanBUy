"use client";

import { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "@/lib/utils";

interface Notification {
  id: string;
  recipientName: string;
  recipientEmail: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  status: "pending" | "sent" | "failed";
  sentAt?: Date;
  createdAt: Date;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadNotifications();
  }, [statusFilter, typeFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Notification[] = [
      {
        id: "notif-1",
        recipientName: "John Doe",
        recipientEmail: "john@example.com",
        type: "invoice_created",
        title: "New Invoice Created",
        message: "Invoice INV-2024-001 has been created. Amount: ₱3,285.00",
        channels: ["email", "sms"],
        status: "sent",
        sentAt: new Date("2024-12-10T10:30:00"),
        createdAt: new Date("2024-12-10T10:30:00"),
      },
      {
        id: "notif-2",
        recipientName: "Jane Smith",
        recipientEmail: "jane@example.com",
        type: "payment_reminder",
        title: "Payment Reminder",
        message: "Your invoice INV-2024-002 is due in 3 days.",
        channels: ["email", "facebook_messenger"],
        status: "pending",
        createdAt: new Date("2024-12-29T09:00:00"),
      },
      {
        id: "notif-3",
        recipientName: "Mike Johnson",
        recipientEmail: "mike@example.com",
        type: "stock_alert",
        title: "Low Stock Alert",
        message: "Item COSRX-SNAIL-96 is running low (5 units remaining).",
        channels: ["email", "sms"],
        status: "sent",
        sentAt: new Date("2024-12-28T14:00:00"),
        createdAt: new Date("2024-12-28T14:00:00"),
      },
    ];
    setNotifications(mockData);
    setLoading(false);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (statusFilter !== "all" && notif.status !== statusFilter) return false;
    if (typeFilter !== "all" && notif.type !== typeFilter) return false;
    return true;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    sent: "bg-success/10 text-success",
    failed: "bg-error/10 text-error",
  };

  const channelIcons: Record<string, string> = {
    email: "📧",
    sms: "💬",
    facebook_messenger: "💬",
    in_app: "🔔",
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notification Management</h1>
        <button className="rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700">
          Send Notification
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Notifications</p>
          <p className="text-2xl font-bold">{notifications.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">
            {notifications.filter((n) => n.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Sent</p>
          <p className="text-2xl font-bold text-success">
            {notifications.filter((n) => n.status === "sent").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold text-error">
            {notifications.filter((n) => n.status === "failed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2"
          >
            <option value="all">All Types</option>
            <option value="invoice_created">Invoice Created</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="stock_alert">Stock Alert</option>
            <option value="sale_alert">Sale Alert</option>
            <option value="penalty_reminder">Penalty Reminder</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[notif.status] || "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {notif.status.charAt(0).toUpperCase() + notif.status.slice(1)}
                    </span>
                    <span className="rounded-full bg-grey-100 px-2 py-1 text-xs font-medium text-grey-700 capitalize">
                      {notif.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{notif.title}</h3>
                  <p className="mb-2 text-muted-foreground">{notif.message}</p>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      To: {notif.recipientName} ({notif.recipientEmail})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Channels:</span>
                    {notif.channels.map((channel) => (
                      <span
                        key={channel}
                        className="flex items-center gap-1 rounded-full bg-grey-100 px-2 py-1 text-xs"
                      >
                        {channelIcons[channel] || "•"} {channel.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Created: {formatDateTime(notif.createdAt)}
                    {notif.sentAt && ` • Sent: ${formatDateTime(notif.sentAt)}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  {notif.status === "pending" && (
                    <button className="rounded-lg bg-soft-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-soft-blue-700">
                      Send Now
                    </button>
                  )}
                  {notif.status === "failed" && (
                    <button className="rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-warning/90">
                      Retry
                    </button>
                  )}
                  <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-grey-50">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Notification[] = [
      {
        id: "1",
        title: "Order Confirmed",
        message: "Your order ORD-2024-001 has been confirmed",
        read: false,
        createdAt: "2024-12-29T10:00:00Z",
        link: "/dashboard/orders",
      },
      {
        id: "2",
        title: "Payment Received",
        message: "Payment for invoice INV-2024-001 has been received",
        read: false,
        createdAt: "2024-12-29T09:30:00Z",
        link: "/dashboard/invoices",
      },
      {
        id: "3",
        title: "Order Shipped",
        message: "Your order ORD-2024-002 is now in transit",
        read: true,
        createdAt: "2024-12-28T14:00:00Z",
        link: "/dashboard/orders",
      },
      {
        id: "4",
        title: "Box Received at Manila",
        message: "Your box BOX-2024-001 has been received at Manila office",
        read: true,
        createdAt: "2024-12-27T11:00:00Z",
        link: "/dashboard/box",
      },
      {
        id: "5",
        title: "Payment Reminder",
        message: "Your order ORD-2024-003 payment is due in 2 days",
        read: true,
        createdAt: "2024-12-26T16:00:00Z",
        link: "/dashboard/orders",
      },
      {
        id: "6",
        title: "Order Delivered",
        message: "Your order ORD-2024-004 has been delivered successfully",
        read: true,
        createdAt: "2024-12-25T10:00:00Z",
        link: "/dashboard/orders",
      },
    ];
    setNotifications(mockData);
    setLoading(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notifications</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-grey-50"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              filter === "all"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              filter === "unread"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              filter === "read"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mb-4 text-6xl">🔔</div>
          <h2 className="mb-2 text-xl font-semibold">
            {filter === "unread" ? "No unread notifications" : filter === "read" ? "No read notifications" : "No notifications"}
          </h2>
          <p className="text-muted-foreground">
            {filter === "all" && "You're all caught up! Check back later for updates."}
            {filter === "unread" && "You have no unread notifications."}
            {filter === "read" && "You have no read notifications."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link || "/dashboard"}
              onClick={() => markAsRead(notification.id)}
              className={`block rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-lg ${
                !notification.read ? "border-l-4 border-soft-blue-600 bg-soft-blue-50/30" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {!notification.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-soft-blue-600"></span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        !notification.read ? "text-foreground" : "text-foreground"
                      }`}>
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(new Date(notification.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


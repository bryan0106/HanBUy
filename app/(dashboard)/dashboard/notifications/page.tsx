"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { notificationService } from "@/services/notificationService";

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
    // Disabled: Notifications API calls removed for now
    // loadNotifications();
    setLoading(false);
  }, [filter]);

  // Helper function to generate link from notification metadata or message
  const generateNotificationLink = (
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): string => {
    // First, try to use metadata if available
    if (metadata) {
      if (metadata.order_id) {
        if (type === "payment" || title.toLowerCase().includes("payment")) {
          return `/dashboard/invoices`;
        }
        return `/dashboard/orders`;
      }
      if (metadata.invoice_id) {
        return `/dashboard/invoices`;
      }
      if (metadata.box_id) {
        return "/dashboard/box";
      }
    }

    // Fallback to parsing message
    if (message.includes("invoice") || message.includes("INV-")) {
      return "/dashboard/invoices";
    }
    if (message.includes("order") || message.includes("ORD-")) {
      if (type === "payment" || title.toLowerCase().includes("payment")) {
        return "/dashboard/invoices";
      }
      return "/dashboard/orders";
    }
    if (message.includes("box") || message.includes("BOX-")) {
      return "/dashboard/box";
    }
    
    // Default fallback
    return "/dashboard";
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Disabled: Notifications API calls removed for now
      // const params: { read?: boolean; limit?: number } = {};
      
      // if (filter === "unread") {
      //   params.read = false;
      // } else if (filter === "read") {
      //   params.read = true;
      // }
      
      // const response = await notificationService.getNotifications(params);
      
      // Set empty notifications (API calls disabled)
      setNotifications([]);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Disabled: Notifications API calls removed for now
    // Just update UI optimistically
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    // Disabled: Notifications API calls removed for now
    // Just update UI optimistically
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


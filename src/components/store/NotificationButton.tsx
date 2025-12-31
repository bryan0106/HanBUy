"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    // TODO: Fetch from API
    const mockData: Notification[] = [
      {
        id: "1",
        title: "Order Confirmed",
        message: "Your order ORD-2024-001 has been confirmed",
        read: false,
        createdAt: "2024-12-29T00:00:00Z",
      },
      {
        id: "2",
        title: "Payment Received",
        message: "Payment for invoice INV-2024-001 has been received",
        read: false,
        createdAt: "2024-12-29T00:00:00Z",
      },
    ];
    setNotifications(mockData);
    setUnreadCount(mockData.filter(n => !n.read).length);
  };

  return (
    <Link
      href="/dashboard"
      className="relative rounded-lg p-2 text-grey-600 transition-colors hover:bg-grey-50"
      aria-label="Notifications"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {mounted && unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}


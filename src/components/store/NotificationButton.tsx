"use client";

import { useState, useEffect, useRef } from "react";
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

export function NotificationButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    loadNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    // TODO: Fetch from API
    const mockData: Notification[] = [
      {
        id: "1",
        title: "Order Confirmed",
        message: "Your order ORD-2024-001 has been confirmed",
        read: false,
        createdAt: "2024-12-29T00:00:00Z",
        link: "/dashboard/orders",
      },
      {
        id: "2",
        title: "Payment Received",
        message: "Payment for invoice INV-2024-001 has been received",
        read: false,
        createdAt: "2024-12-29T00:00:00Z",
        link: "/dashboard/invoices",
      },
      {
        id: "3",
        title: "Order Shipped",
        message: "Your order ORD-2024-002 is now in transit",
        read: true,
        createdAt: "2024-12-28T00:00:00Z",
        link: "/dashboard/orders",
      },
    ];
    setNotifications(mockData);
    setUnreadCount(mockData.filter(n => !n.read).length);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read).slice(0, 5); // Show only recent 5 read

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
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
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-white shadow-lg z-50">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              <>
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <div className="py-2">
                    {unreadNotifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link || "/dashboard"}
                        onClick={() => {
                          markAsRead(notification.id);
                          setIsOpen(false);
                        }}
                        className="block px-4 py-3 hover:bg-grey-50 border-l-4 border-soft-blue-600 bg-soft-blue-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(new Date(notification.createdAt))}
                            </p>
                          </div>
                          <span className="ml-2 h-2 w-2 rounded-full bg-soft-blue-600 shrink-0 mt-1"></span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Read Notifications */}
                {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                  <div className="border-t border-border"></div>
                )}
                
                {readNotifications.length > 0 && (
                  <div className="py-2">
                    {readNotifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link || "/dashboard"}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 hover:bg-grey-50"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(new Date(notification.createdAt))}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <Link
                href="/dashboard/orders"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-soft-blue-600 hover:text-soft-blue-700 font-medium"
              >
                View All
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


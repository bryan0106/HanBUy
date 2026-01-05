"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "hanbuy_welcome_dismissed";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the welcome modal
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        // Small delay to ensure smooth appearance
        setTimeout(() => setIsOpen(true), 300);
      }
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-soft-blue-600 to-soft-blue-800 px-6 py-8 text-center text-white">
          <div className="mb-4 text-6xl">👋</div>
          <h2 className="mb-2 text-3xl font-bold sm:text-4xl">
            Welcome to HanBuy Store!
          </h2>
          <p className="text-lg text-soft-blue-100">
            Your gateway to authentic Korean products
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-8">
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-xl font-semibold text-grey-900">
                Discover Korean Products
              </h3>
              <p className="text-grey-700">
                Shop authentic Korean skincare, food, fashion, and more. We consolidate
                your purchases and deliver them directly to the Philippines.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-grey-50 p-4">
                <div className="mb-2 text-2xl">📦</div>
                <h4 className="mb-1 font-semibold text-grey-900">Onhand Items</h4>
                <p className="text-sm text-grey-600">
                  Available products ready for immediate shipping
                </p>
              </div>
              <div className="rounded-lg border border-border bg-grey-50 p-4">
                <div className="mb-2 text-2xl">📅</div>
                <h4 className="mb-1 font-semibold text-grey-900">Pre-Order</h4>
                <p className="text-sm text-grey-600">
                  Reserve upcoming items with estimated release dates
                </p>
              </div>
              <div className="rounded-lg border border-border bg-grey-50 p-4">
                <div className="mb-2 text-2xl">💰</div>
                <h4 className="mb-1 font-semibold text-grey-900">Price Comparison</h4>
                <p className="text-sm text-grey-600">
                  Compare prices across Korean websites and save
                </p>
              </div>
              <div className="rounded-lg border border-border bg-grey-50 p-4">
                <div className="mb-2 text-2xl">🚚</div>
                <h4 className="mb-1 font-semibold text-grey-900">Fast Delivery</h4>
                <p className="text-sm text-grey-600">
                  Track your shipments from Korea to your doorstep
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-soft-blue-50 p-4">
              <p className="text-sm text-grey-700">
                <strong className="text-grey-900">New here?</strong> Check out our{" "}
                <Link
                  href="/store/how-it-works"
                  className="font-semibold text-soft-blue-600 hover:underline"
                  onClick={handleClose}
                >
                  How It Works
                </Link>{" "}
                page to learn more about our services.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-border text-soft-blue-600 focus:ring-soft-blue-500"
              />
              <span className="text-sm text-grey-700">
                Don't show this message again
              </span>
            </label>
            <button
              onClick={handleClose}
              className="rounded-lg bg-soft-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:ml-auto"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


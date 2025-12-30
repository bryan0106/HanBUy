"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

interface QRPaymentProps {
  amount: number;
  orderId: string;
  onPaymentComplete?: () => void;
}

const BANKS = [
  { code: "BPI", name: "BPI", color: "bg-red-600" },
  { code: "BDO", name: "BDO", color: "bg-blue-600" },
  { code: "GCASH", name: "GCash", color: "bg-blue-500" },
  { code: "GOTYME", name: "GoTyme", color: "bg-purple-600" },
  { code: "MAYA", name: "Maya", color: "bg-green-600" },
] as const;

export function QRPayment({ amount, orderId, onPaymentComplete }: QRPaymentProps) {
  const [selectedBank, setSelectedBank] = useState<string>("GCASH");
  const [qrCode, setQrCode] = useState<string>("");

  const generateQR = (bank: string) => {
    // TODO: Generate actual QR code from backend
    // For now, create a placeholder
    setQrCode(`data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-size="12">QR Code</text>
        <text x="100" y="120" text-anchor="middle" font-size="10">${bank}</text>
        <text x="100" y="140" text-anchor="middle" font-size="10">${formatCurrency(amount, "PHP")}</text>
      </svg>
    `)}`);
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    generateQR(bank);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-xl font-semibold">Payment via QR Code</h3>
      <p className="mb-4 text-muted-foreground">
        Select your payment method and scan the QR code
      </p>

      {/* Bank Selection */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {BANKS.map((bank) => (
            <button
              key={bank.code}
              onClick={() => handleBankSelect(bank.code)}
              className={`rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                selectedBank === bank.code
                  ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                  : "border-border bg-background hover:bg-grey-50"
              }`}
            >
              {bank.name}
            </button>
          ))}
        </div>
      </div>

      {/* QR Code Display */}
      {qrCode && (
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 inline-block rounded-lg border-4 border-border bg-white p-4">
            <img
              src={qrCode}
              alt={`${selectedBank} QR Code`}
              className="h-48 w-48"
            />
          </div>
          <p className="text-sm font-semibold">
            Amount: {formatCurrency(amount, "PHP")}
          </p>
          <p className="text-xs text-muted-foreground">
            Scan with {selectedBank} app to pay
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-6 rounded-lg bg-grey-50 p-4">
        <h4 className="mb-2 font-semibold">Payment Instructions:</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Open your {selectedBank} mobile app</li>
          <li>Tap "Scan QR" or "Pay QR"</li>
          <li>Scan the QR code above</li>
          <li>Confirm the amount and complete payment</li>
          <li>Upload proof of payment after completing the transaction</li>
        </ol>
      </div>

      {/* Upload Proof */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Upload Proof of Payment
        </label>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-border bg-background px-4 py-2"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Upload screenshot or photo of your payment confirmation
        </p>
      </div>

      <button
        onClick={onPaymentComplete}
        className="mt-6 w-full rounded-lg bg-soft-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-soft-blue-700"
      >
        Confirm Payment
      </button>
    </div>
  );
}


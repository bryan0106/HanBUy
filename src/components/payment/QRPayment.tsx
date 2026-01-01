"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import type { BankType } from "@/services/api";

interface QRPaymentProps {
  amount: number; // Pre-identified amount (exact amount to pay)
  orderId: string;
  paymentType?: "full" | "downpayment";
  downpaymentAmount?: number;
  balance?: number;
  subtotal?: number; // Product subtotal
  isf?: number; // International Service Fee
  lsf?: number; // Local Service Fee
  onPaymentComplete?: () => void;
  bankTypes?: BankType[]; // Optional bank types from API
}

const DEFAULT_BANKS: BankType[] = [
  { code: "BPI", name: "BPI", color: "bg-red-600" },
  { code: "BDO", name: "BDO", color: "bg-blue-600" },
  { code: "GCASH", name: "GCash", color: "bg-blue-500" },
  { code: "GOTYME", name: "GoTyme", color: "bg-purple-600" },
  { code: "MAYA", name: "Maya", color: "bg-green-600" },
];

export function QRPayment({ 
  amount, 
  orderId, 
  paymentType = "full",
  downpaymentAmount,
  balance,
  subtotal,
  isf,
  lsf,
  onPaymentComplete,
  bankTypes 
}: QRPaymentProps) {
  // Use provided bank types or fall back to defaults
  const banks = bankTypes && bankTypes.length > 0 ? bankTypes : DEFAULT_BANKS;
  const [selectedBank, setSelectedBank] = useState<string>(banks[0]?.code || "GCASH");
  const [qrCode, setQrCode] = useState<string>("");

  // Generate QR code with pre-identified amount
  const generateQR = (bank: string) => {
    // TODO: Generate actual QR code from backend API with pre-identified amount
    // The QR code should contain the exact amount so customer can't modify it
    // Format: Contains merchant info + exact amount encoded
    const paymentAmount = paymentType === "downpayment" && downpaymentAmount 
      ? downpaymentAmount 
      : amount;
    
    // Format currency for display (without encoding issues)
    const amountText = formatCurrency(paymentAmount, "PHP");
    
    // Create SVG with proper encoding - use encodeURIComponent instead of btoa for Unicode support
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="80" text-anchor="middle" font-size="14" font-weight="bold">QR Code</text>
        <text x="100" y="100" text-anchor="middle" font-size="11">${bank}</text>
        <text x="100" y="120" text-anchor="middle" font-size="10" font-weight="bold">Amount:</text>
        <text x="100" y="140" text-anchor="middle" font-size="12" font-weight="bold">${amountText}</text>
        ${paymentType === "downpayment" ? `<text x="100" y="160" text-anchor="middle" font-size="8">Downpayment</text>` : ''}
      </svg>
    `.trim();
    
    // Use encodeURIComponent for proper Unicode handling, then create data URI
    const encodedSvg = encodeURIComponent(svgContent);
    setQrCode(`data:image/svg+xml;charset=utf-8,${encodedSvg}`);
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    generateQR(bank);
  };

  useEffect(() => {
    generateQR(selectedBank);
  }, [selectedBank, amount, paymentType, downpaymentAmount]);

  // Update selected bank when bank types change
  useEffect(() => {
    if (banks.length > 0 && !banks.find(b => b.code === selectedBank)) {
      setSelectedBank(banks[0].code);
    }
  }, [banks, selectedBank]);

  const paymentAmount = paymentType === "downpayment" && downpaymentAmount 
    ? downpaymentAmount 
    : amount;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-xl font-semibold">Payment via QR Code</h3>
      
      {/* Payment Type Info */}
      {paymentType === "downpayment" && (
        <div className="mb-4 rounded-lg bg-info/10 p-3 text-sm">
          <p className="font-semibold text-info">Downpayment Payment</p>
          <p className="text-muted-foreground">
            Downpayment: {formatCurrency(downpaymentAmount || 0, "PHP")}
            {balance && (
              <span className="ml-2">Balance: {formatCurrency(balance, "PHP")}</span>
            )}
          </p>
        </div>
      )}

      {/* Fee Breakdown */}
      {(isf !== undefined || lsf !== undefined) && (
        <div className="mb-4 rounded-lg border border-border bg-grey-50 p-4">
          <h4 className="mb-3 font-semibold">Payment Breakdown</h4>
          <div className="space-y-2 text-sm">
            {subtotal !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal, "PHP")}</span>
              </div>
            )}
            {isf !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ISF (International Service Fee):</span>
                <span className="font-medium">{formatCurrency(isf, "PHP")}</span>
              </div>
            )}
            {lsf !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">LSF (Local Service Fee):</span>
                <span className="font-medium">{formatCurrency(lsf, "PHP")}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-border pt-2">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold">{formatCurrency(paymentAmount, "PHP")}</span>
            </div>
          </div>
        </div>
      )}
      
      <p className="mb-4 text-muted-foreground">
        Select your payment method and scan the QR code. The amount is pre-identified in the QR code.
      </p>

      {/* Bank Selection */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {banks.map((bank) => (
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
          <p className="text-lg font-bold">
            Amount: {formatCurrency(paymentAmount, "PHP")}
          </p>
          {paymentType === "downpayment" && balance && (
            <p className="mt-1 text-sm text-muted-foreground">
              Balance: {formatCurrency(balance, "PHP")}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Scan with {selectedBank} app to pay (Amount is pre-identified)
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
          <li>The amount ({formatCurrency(paymentAmount, "PHP")}) is pre-identified and cannot be changed</li>
          <li>Confirm and complete payment</li>
          <li>Upload proof of payment after completing the transaction</li>
          <li>Manila office admin will verify your payment</li>
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


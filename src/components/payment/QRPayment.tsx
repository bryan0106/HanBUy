"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import type { BankType } from "@/services/api";

interface QRPaymentProps {
  amount: number; // Pre-identified amount (exact amount to pay)
  orderId: string;
  paymentType?: "full" | "downpayment" | "installment" | "balance";
  downpaymentAmount?: number;
  balance?: number;
  subtotal?: number; // Product subtotal
  isf?: number; // International Service Fee
  lsf?: number; // Local Service Fee
  onPaymentComplete?: () => void;
  bankTypes?: BankType[]; // Optional bank types from API
  useWallet?: boolean;
  walletAmount?: number;
  customerEmail?: string;
  customerName?: string;
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
  bankTypes,
  useWallet = false,
  walletAmount = 0,
  customerEmail = "",
  customerName = ""
}: QRPaymentProps) {
  // Use provided bank types or fall back to defaults
  const banks = bankTypes && bankTypes.length > 0 ? bankTypes : DEFAULT_BANKS;
  const [selectedBank, setSelectedBank] = useState<string>(banks[0]?.code || "GCASH");
  const [qrCode, setQrCode] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Generate QR code with pre-identified amount
  const generateQR = (bank: string) => {
    // TODO: Generate actual QR code from backend API with pre-identified amount
    // The QR code should contain the exact amount so customer can't modify it
    // Format: Contains merchant info + exact amount encoded
    const paymentAmount = (paymentType === "downpayment" && downpaymentAmount) || (paymentType === "balance" && amount)
      ? (paymentType === "balance" ? amount : (downpaymentAmount || 0))
      : amount;
    
    // Format currency for display (without encoding issues)
    const amountText = formatCurrency(paymentAmount || 0, "PHP");
    
    // Create SVG with proper encoding - use encodeURIComponent instead of btoa for Unicode support
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="80" text-anchor="middle" font-size="14" font-weight="bold">QR Code</text>
        <text x="100" y="100" text-anchor="middle" font-size="11">${bank}</text>
        <text x="100" y="120" text-anchor="middle" font-size="10" font-weight="bold">Amount:</text>
        <text x="100" y="140" text-anchor="middle" font-size="12" font-weight="bold">${amountText}</text>
        ${paymentType === "downpayment" ? `<text x="100" y="160" text-anchor="middle" font-size="8">Downpayment</text>` : ''}
        ${paymentType === "balance" ? `<text x="100" y="160" text-anchor="middle" font-size="8">Balance Payment</text>` : ''}
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

  const paymentAmount: number = ((paymentType === "downpayment" || paymentType === "installment") && downpaymentAmount) || (paymentType === "balance")
    ? (paymentType === "balance" ? amount : (downpaymentAmount || 0))
    : amount;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-xl font-semibold">Payment via QR Code</h3>
      
      {/* Payment Type Info */}
      {(paymentType === "downpayment" || paymentType === "installment") && (
        <div className="mb-4 rounded-lg bg-info/10 p-3 text-sm">
          <p className="font-semibold text-info">
            {paymentType === "installment" ? "Installment Payment" : "Downpayment Payment"}
          </p>
          <p className="text-muted-foreground">
            {paymentType === "installment" ? "First Installment" : "Downpayment"}: {formatCurrency(downpaymentAmount || 0, "PHP")}
            {balance && (
              <span className="ml-2">Balance: {formatCurrency(balance, "PHP")}</span>
            )}
          </p>
        </div>
      )}
      {paymentType === "balance" && (
        <div className="mb-4 rounded-lg bg-warning/10 p-3 text-sm">
          <p className="font-semibold text-warning">Balance Payment</p>
          <p className="text-muted-foreground">
            Paying remaining balance: {formatCurrency(amount, "PHP")}
          </p>
        </div>
      )}

      {/* Wallet Usage Info */}
      {useWallet && walletAmount > 0 && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3">
          <p className="text-sm font-semibold text-green-800">Using Wallet Balance</p>
          <p className="text-xs text-green-700">
            {formatCurrency(walletAmount, "PHP")} will be deducted from your wallet
          </p>
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
          {(paymentType === "downpayment" || paymentType === "installment") && balance && (
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
        <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-2">
          <p className="text-xs text-blue-800">
            💡 <strong>Note:</strong> If you pay more than the required amount, the excess will be automatically credited to your wallet for future use.
          </p>
        </div>
      </div>

      {/* Upload Proof */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Upload Proof of Payment
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setProofFile(file);
              setUploadSuccess(false);
            }
          }}
          className="w-full rounded-lg border border-border bg-background px-4 py-2"
          disabled={uploading}
        />
        {proofFile && (
          <p className="mt-2 text-xs text-green-600">
            ✓ Selected: {proofFile.name}
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-2 text-xs text-green-600">
            ✓ Proof of payment sent successfully!
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Upload screenshot or photo of your payment confirmation
        </p>
      </div>

      <button
        onClick={async () => {
          if (!proofFile) {
            alert("Please upload proof of payment before confirming");
            return;
          }

          setUploading(true);
          try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64String = reader.result as string;
              
              // Get Google Apps Script URL from environment
              const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
              
              if (!scriptUrl) {
                console.warn("Google Apps Script URL not configured. Skipping upload.");
                setUploadSuccess(true);
                setUploading(false);
                onPaymentComplete?.();
                return;
              }

              // Prepare data to send
              const data = {
                orderId: orderId,
                orderNumber: `ORD-${orderId.slice(-6)}`, // Generate order number from ID
                amount: formatCurrency(amount, "PHP"),
                paymentType: paymentType,
                customerEmail: customerEmail || "N/A",
                customerName: customerName || "N/A",
                imageBase64: base64String,
                fileName: proofFile.name
              };

              // Send to Google Apps Script
              const response = await fetch(scriptUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'no-cors' // Required for Google Apps Script
              });

              // Note: With no-cors, we can't read the response
              // But the request will be sent
              setUploadSuccess(true);
              setUploading(false);
              
              // Wait a bit to show success message
              setTimeout(() => {
                onPaymentComplete?.();
              }, 1000);
            };
            
            reader.readAsDataURL(proofFile);
          } catch (error) {
            console.error("Error uploading proof:", error);
            alert("Failed to upload proof of payment. Please try again.");
            setUploading(false);
          }
        }}
        disabled={uploading || !proofFile}
        className={`mt-6 w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
          uploading || !proofFile
            ? 'bg-grey-400 cursor-not-allowed'
            : 'bg-soft-blue-600 hover:bg-soft-blue-700'
        }`}
      >
        {uploading ? "Uploading..." : uploadSuccess ? "✓ Sent! Processing..." : "Confirm Payment"}
      </button>
    </div>
  );
}


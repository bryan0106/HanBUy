"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/currency";
import type { BankType } from "@/services/api";
import { paymentService } from "@/services/paymentService";
import toast from "react-hot-toast";
import { shouldUseMockData } from "@/utils/env";

interface QRPaymentProps {
  amount: number; // Pre-identified amount (exact amount to pay)
  orderId: string;
  paymentType?: "full" | "downpayment" | "installment" | "balance" | "item_only" | "shipping" | "full_payment";
  downpaymentAmount?: number;
  balance?: number;
  subtotal?: number; // Product subtotal
  isf?: number; // International Service Fee
  lsf?: number; // Local Service Fee
  onPaymentComplete?: (paymentId?: string) => void;
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
  const [generatingQR, setGeneratingQR] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrExpiresAt, setQrExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Map frontend payment type to API payment type
  const getApiPaymentType = (): 'item_only' | 'full_payment' | 'shipping' | 'cod' => {
    if (paymentType === 'item_only') return 'item_only';
    if (paymentType === 'full_payment' || paymentType === 'full') return 'full_payment';
    if (paymentType === 'shipping') return 'shipping';
    return 'full_payment'; // Default
  };

  // Normalize order ID: extract UUID from order-<uuid>-<suffix> format
  const normalizeOrderId = (orderId: string): string => {
    const trimmed = orderId.trim();
    
    // If it starts with "order-", extract the UUID part
    if (trimmed.startsWith('order-')) {
      // Match UUID pattern after "order-"
      const uuidMatch = trimmed.match(/^order-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (uuidMatch) {
        return uuidMatch[1]; // Return just the UUID
      }
    }
    
    // If it's already a UUID, return as-is
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(trimmed)) {
      return trimmed;
    }
    
    // Otherwise return trimmed (for mock data)
    return trimmed;
  };

  // Generate QR code with pre-identified amount from API
  const generateQR = async (bank: string) => {
    if (!orderId || amount <= 0 || !bank) {
      console.warn('⏸️ Skipping QR generation - missing required data:', { orderId: !!orderId, amount, bank });
      return;
    }
    
    setGeneratingQR(true);
    try {
      // Normalize order ID to extract UUID if needed
      const cleanOrderId = normalizeOrderId(orderId);
      
      // Validate UUID format only in real API mode
      if (!shouldUseMockData()) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(cleanOrderId)) {
          console.error("Invalid order ID format after normalization:", { original: orderId, normalized: cleanOrderId });
          throw new Error(
            `Invalid order ID format: ${orderId}. Expected UUID format.`
          );
        }
      }
      
      const paymentAmount = (paymentType === "downpayment" && downpaymentAmount) || (paymentType === "balance" && amount)
        ? (paymentType === "balance" ? amount : (downpaymentAmount || 0))
        : amount;

      console.log('🔗 Generating QR code for:', { order_id: cleanOrderId, amount: paymentAmount, bank });
      
      const qrData = await paymentService.generateQRCode({
        order_id: cleanOrderId,
        amount: paymentAmount,
        payment_method: {
          type: 'qr_code',
          bank: bank as 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA',
        },
        payment_type: getApiPaymentType(),
        use_wallet: useWallet,
        wallet_amount: walletAmount || 0,
      });

      console.log('📦 QR Code API Response:', qrData);

      // Validate response has required fields
      if (!qrData || !qrData.qr_code) {
        console.error('❌ QR code data missing in response:', qrData);
        throw new Error('QR code not found in response. Please try again.');
      }

      if (!qrData.payment_id) {
        console.error('❌ Payment ID missing in response:', qrData);
        throw new Error('Payment ID not found in response. Please try again.');
      }

      setQrCode(qrData.qr_code);
      setPaymentId(qrData.payment_id);
      if (qrData.expires_at) {
        setQrExpiresAt(qrData.expires_at);
      }
      
      // Log QR code type detection
      if (qrData.qr_code?.startsWith('data:image/svg+xml')) {
        console.log('✅ TEST MODE: Mock QR code received (SVG data URL)');
        console.log('📦 Payment ID:', qrData.payment_id);
        console.log('💰 Amount:', qrData.amount);
      } else if (qrData.qr_code?.startsWith('http://') || qrData.qr_code?.startsWith('https://')) {
        console.log('✅ QR code received (HTTPS URL)');
        console.log('📦 Payment ID:', qrData.payment_id);
        console.log('💰 Amount:', qrData.amount);
      } else if (qrData.qr_code?.startsWith('data:image/')) {
        console.log('✅ QR code received (base64 data URL)');
        console.log('📦 Payment ID:', qrData.payment_id);
        console.log('💰 Amount:', qrData.amount);
      } else {
        console.log('✅ QR code received (unknown format)');
      }
      
      // Note: QR code can be:
      // - Base64 data URL: data:image/svg+xml;base64,... (MSW mock)
      // - HTTPS URL: https://... (live provider)
      // Both work with <img src={qrCode} />
    } catch (error: any) {
      console.error('❌ Error generating QR code:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      
      // Show user-friendly error
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Failed to generate QR code';
      toast.error(errorMessage);
      
      // Fallback to mock QR code only if API call failed
      const paymentAmount = (paymentType === "downpayment" && downpaymentAmount) || (paymentType === "balance" && amount)
        ? (paymentType === "balance" ? amount : (downpaymentAmount || 0))
        : amount;
      const amountText = formatCurrency(paymentAmount || 0, "PHP");
      const svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="80" text-anchor="middle" font-size="14" font-weight="bold">QR Code</text>
          <text x="100" y="100" text-anchor="middle" font-size="11">${bank}</text>
          <text x="100" y="120" text-anchor="middle" font-size="10" font-weight="bold">Amount:</text>
          <text x="100" y="140" text-anchor="middle" font-size="12" font-weight="bold">${amountText}</text>
          <text x="100" y="160" text-anchor="middle" font-size="9" fill="red">(Fallback - API Error)</text>
        </svg>
      `.trim();
      const encodedSvg = encodeURIComponent(svgContent);
      setQrCode(`data:image/svg+xml;charset=utf-8,${encodedSvg}`);
      console.log('⚠️ Using fallback mock QR code due to API error');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    generateQR(bank);
  };

  // Countdown timer for QR expiration
  useEffect(() => {
    if (!qrExpiresAt) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(qrExpiresAt).getTime();
      const diff = expiry - now;
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("Expired");
        toast.error('QR code expired. Please generate a new one.');
        return;
      }
      
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [qrExpiresAt]);

  // Auto-generate QR when bank is selected (but only if we have valid data)
  useEffect(() => {
    if (orderId && amount > 0 && selectedBank && !generatingQR) {
      generateQR(selectedBank);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBank, amount, paymentType, downpaymentAmount, orderId, useWallet, walletAmount]);

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
      {generatingQR ? (
        <div className="mb-6 text-center py-12">
          <p className="text-muted-foreground">Generating QR code...</p>
        </div>
      ) : qrCode ? (
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
      ) : null}

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

      <div className="mt-6 space-y-3">
        {!proofFile && (
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ <strong>Important:</strong> Please upload proof of payment after completing your transaction. This helps us verify your payment faster.
            </p>
          </div>
        )}
        
        <button
          onClick={async () => {
            if (!paymentId) {
              toast.error('Please wait for QR code to generate');
              return;
            }

            // If proof file is selected, upload it via API
            if (proofFile) {
              setUploading(true);
              try {
                const paymentAmount = (paymentType === "downpayment" && downpaymentAmount) || (paymentType === "balance" && amount)
                  ? (paymentType === "balance" ? amount : (downpaymentAmount || 0))
                  : amount;

                // Ensure orderId is a valid UUID in real API mode.
                // In mock mode, order IDs are not UUIDs, so skip validation.
                const cleanOrderId = orderId.trim();
                if (!shouldUseMockData()) {
                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                  if (!uuidRegex.test(cleanOrderId)) {
                    toast.error(`Invalid order ID format. Please refresh and try again.`);
                    setUploading(false);
                    return;
                  }
                }
                
                const confirmation = await paymentService.confirmPayment({
                  order_id: cleanOrderId,
                  payment_id: paymentId,
                  amount: paymentAmount,
                  payment_method: {
                    type: 'qr_code',
                    bank: selectedBank as 'BPI' | 'BDO' | 'GCASH' | 'GOTYME' | 'MAYA',
                  },
                  payment_proof: proofFile,
                  use_wallet: useWallet,
                  wallet_amount: walletAmount || 0,
                });

                setUploadSuccess(true);
                toast.success('Payment proof uploaded successfully! Awaiting verification.');
                
                if (confirmation.wallet_credit && confirmation.wallet_credit > 0) {
                  toast.success(`Excess payment of ${formatCurrency(confirmation.wallet_credit, "PHP")} credited to your wallet!`);
                }
                
                onPaymentComplete?.(paymentId);
              } catch (error: any) {
                console.error("Error uploading proof:", error);
                toast.error(error?.message || "Failed to upload proof of payment. Please try again.");
                setUploading(false);
              }
            } else {
              // No proof file - require it
              toast.error('Please upload proof of payment before confirming');
            }
          }}
          disabled={uploading || !paymentId || generatingQR}
          className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
            uploading || !paymentId || generatingQR
              ? 'bg-grey-400 cursor-not-allowed'
              : 'bg-soft-blue-600 hover:bg-soft-blue-700'
          }`}
        >
          {generatingQR ? "Generating QR Code..." : uploading ? "Uploading Proof..." : uploadSuccess ? "✓ Proof Sent! Processing..." : proofFile ? "Confirm Payment & Upload Proof" : "Please Upload Proof of Payment"}
        </button>
        
        {qrExpiresAt && timeLeft && (
          <p className="mt-2 text-xs text-center text-muted-foreground">
            QR code expires in: <strong>{timeLeft}</strong>
          </p>
        )}
        
        {!proofFile && (
          <p className="text-xs text-center text-muted-foreground">
            You can upload proof of payment later from your order details page
          </p>
        )}
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { mockOrderService } from "@/lib/mockOrdersData";
import { mockUtilityService, type Courier } from "@/lib/mockUtilityData";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { Order } from "@/services/orderService";
import Link from "next/link";

export default function SelectCourierPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [useCOD, setUseCOD] = useState(false);
  const [codAmount, setCodAmount] = useState<number>(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/store/storage/${orderId}/select-courier`);
      return;
    }
    if (!authLoading && isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, user, orderId]);

  const loadData = async () => {
    if (!user?.id || !orderId) return;

    setLoading(true);
    try {
      // Use mock data directly - no API calls
      const [orderData, couriersData] = await Promise.all([
        mockOrderService.getOrderById(orderId).catch(() => null),
        mockUtilityService.getCouriers(),
      ]);

      setOrder(orderData);
      setCouriers(couriersData);
      if (couriersData.length > 0) {
        setSelectedCourier(couriersData[0].id);
      }

      // Calculate COD amount (LSF - Local Service Fee)
      if (orderData) {
        const lsf = orderData.lsf || 0;
        setCodAmount(lsf);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourier = async () => {
    if (!order || !selectedCourier) {
      alert("Please select a delivery company.");
      return;
    }

    setProcessing(true);
    try {
      // Mock courier selection - no API call
      console.log("Mock courier selection:", { orderId: order.id, courierId: selectedCourier, useCOD });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      if (useCOD) {
        // COD selected - redirect to orders page
        alert("Courier selected! You will pay Cash on Delivery when the package arrives.");
        router.push("/store/orders");
      } else {
        // Prepaid - redirect to payment page for local shipping
        router.push(`/store/payment?orderId=${order.id}&type=local_shipping`);
      }
    } catch (error) {
      console.error("Error selecting courier:", error);
      alert("Failed to select courier. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedCourierData = couriers.find(c => c.id === selectedCourier);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          Select Delivery Company
        </h1>
        <p className="text-muted-foreground">
          Choose a delivery company for local shipping from Manila office to your address
        </p>
      </div>

      {/* Order Info */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="font-semibold">{order.order_number}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Local Shipping Fee</p>
            <p className="text-lg font-bold text-soft-blue-600">
              {formatCurrency(order.lsf || 0, "PHP")}
            </p>
          </div>
        </div>
      </div>

      {/* Courier Selection */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Select Delivery Company</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {couriers.map((courier) => (
            <button
              key={courier.id}
              onClick={() => setSelectedCourier(courier.id)}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                selectedCourier === courier.id
                  ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                  : "border-border bg-background hover:border-soft-blue-300 hover:bg-soft-blue-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-grey-900">{courier.name}</h4>
                {selectedCourier === courier.id && (
                  <svg className="h-5 w-5 text-soft-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {courier.description && (
                <p className="text-xs text-grey-600 mb-2">{courier.description}</p>
              )}
              {courier.estimatedDays && (
                <div className="flex items-center gap-1 text-xs text-grey-500">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Est. {courier.estimatedDays} day{courier.estimatedDays > 1 ? 's' : ''}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Payment Method</h2>
        <div className="space-y-3">
          <button
            onClick={() => setUseCOD(false)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
              !useCOD
                ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                : "border-border bg-background hover:bg-grey-50"
            }`}
          >
            <div className="font-semibold">Prepaid (Pay Now)</div>
            <div className="text-sm text-muted-foreground">
              Pay shipping fee now via QR code
            </div>
            <div className="mt-1 text-sm font-bold">
              {formatCurrency(order.lsf || 0, "PHP")}
            </div>
          </button>
          <button
            onClick={() => setUseCOD(true)}
            className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
              useCOD
                ? "border-soft-blue-600 bg-soft-blue-50 text-soft-blue-700"
                : "border-border bg-background hover:bg-grey-50"
            }`}
          >
            <div className="font-semibold">Cash on Delivery (COD)</div>
            <div className="text-sm text-muted-foreground">
              Pay when the package arrives at your address
            </div>
            <div className="mt-1 text-sm font-bold">
              {formatCurrency(codAmount, "PHP")} (Pay on delivery)
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={processing}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleSelectCourier}
          disabled={processing || !selectedCourier}
          className="flex-1"
        >
          {processing ? "Processing..." : useCOD ? "Confirm COD" : "Continue to Payment"}
        </Button>
      </div>
    </div>
  );
}

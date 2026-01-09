"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { orderService } from "@/services/orderService";
import { boxService, type AvailableSharedBox } from "@/services/boxService";
import { utilityService, type BoxType, type Courier } from "@/services/utilityService";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import type { Order } from "@/services/orderService";
import { calculateShippingFee } from "@/lib/shipping";

interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

export default function RequestShippingPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([]);
  const [boxTypePreference, setBoxTypePreference] = useState<"solo" | "shared">("solo");
  const [selectedBoxSize, setSelectedBoxSize] = useState<"small" | "medium" | "large">("large");
  const [availableSharedBoxes, setAvailableSharedBoxes] = useState<AvailableSharedBox[]>([]);
  const [selectedSharedBoxId, setSelectedSharedBoxId] = useState<string | null>(null);
  const [availableSoloBoxes, setAvailableSoloBoxes] = useState<AvailableSharedBox[]>([]);
  const [selectedSoloBoxId, setSelectedSoloBoxId] = useState<string | null>(null);
  const [showBoxSizeSelection, setShowBoxSizeSelection] = useState(false);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    province: "",
    zipCode: "",
    country: "Philippines",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=/store/storage/${orderId}/request-shipping`);
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
      const [orderData, boxTypesData, couriersData] = await Promise.all([
        orderService.getOrderById(orderId).catch(() => getMockOrder(orderId)),
        utilityService.getBoxTypes().catch(() => []),
        utilityService.getCouriers().catch(() => []),
      ]);

      setOrder(orderData);
      setBoxTypes(boxTypesData);
      setCouriers(couriersData);
      if (couriersData.length > 0) {
        setSelectedCourier(couriersData[0].id);
      }

      // Load user's address if available
      if (user.address) {
        setShippingAddress({
          street: user.address.street || "",
          city: user.address.city || "",
          province: user.address.province || "",
          zipCode: user.address.zipCode || "",
          country: user.address.country || "Philippines",
        });
      } else if (orderData && orderData.shipping_address) {
        // Use default address from order if available
        setShippingAddress({
          street: orderData.shipping_address.street || "",
          city: orderData.shipping_address.city || "",
          province: orderData.shipping_address.province || "",
          zipCode: orderData.shipping_address.zipCode || "",
          country: orderData.shipping_address.country || "Philippines",
        });
      }

      // Load boxes based on preference
      if (boxTypePreference === "shared") {
        await loadAvailableSharedBoxes();
      } else {
        await loadAvailableSoloBoxes();
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Use mock order as fallback
      const mockOrder = getMockOrder(orderId);
      if (mockOrder) {
        setOrder(mockOrder);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock order data for testing
  const getMockOrder = (id: string): Order | null => {
    const mockOrders: Record<string, Order> = {
      "order-001": {
        id: "order-001",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-001",
        subtotal: 2450.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: null,
        shared_shipping_fee: null,
        total: 2450.00,
        currency: "PHP",
        status: "paid_stored",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: { type: "online", bank: "GCASH" },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "solo",
        shipping_address: {
          street: "123 Main Street",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        fulfillment_status: "in_storage",
        storage_status: "in_storage",
        shipping_requested_at: undefined,
        shipping_payment_status: "pending",
        cod_amount: undefined,
        wallet_credit: undefined,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_paid_at: undefined,
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-001",
            product_id: "prod-001",
            product_name: "Samsung Galaxy Watch 6 Classic",
            product_type: "onhand",
            quantity: 1,
            unit_price: 2450.00,
            total: 2450.00,
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            preorder_release_date: undefined,
          },
        ],
      },
      "order-002": {
        id: "order-002",
        user_id: user?.id || "user-001",
        order_number: "ORD-2024-002",
        subtotal: 1890.00,
        isf: 0,
        lsf: 0,
        shipping_fee: 0,
        solo_shipping_fee: null,
        shared_shipping_fee: null,
        total: 1890.00,
        currency: "PHP",
        status: "paid_stored",
        payment_status: "paid",
        payment_type: "item_only",
        payment_method: { type: "bank_transfer", bank: "BDO" },
        downpayment_amount: undefined,
        balance: undefined,
        qr_code: undefined,
        box_type_preference: "shared",
        shipping_address: {
          street: "123 Main Street",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        fulfillment_status: "in_storage",
        storage_status: "in_storage",
        shipping_requested_at: undefined,
        shipping_payment_status: "pending",
        cod_amount: undefined,
        wallet_credit: undefined,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        shipping_paid_at: undefined,
        cod_paid_at: undefined,
        order_items: [
          {
            id: "item-002",
            product_id: "prod-002",
            product_name: "Apple AirPods Pro 2nd Gen",
            product_type: "onhand",
            quantity: 1,
            unit_price: 1200.00,
            total: 1200.00,
            image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
            preorder_release_date: undefined,
          },
          {
            id: "item-003",
            product_id: "prod-003",
            product_name: "Wireless Charging Pad",
            product_type: "onhand",
            quantity: 2,
            unit_price: 345.00,
            total: 690.00,
            image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400",
            preorder_release_date: undefined,
          },
        ],
      },
    };
    return mockOrders[id] || null;
  };

  const loadAvailableSharedBoxes = async () => {
    try {
      const boxes = await boxService.getAvailableSharedBoxes();
      if (boxes.length === 0) {
        try {
          const defaultBox = await boxService.createDefaultSharedBox();
          setAvailableSharedBoxes([defaultBox as AvailableSharedBox]);
          setSelectedSharedBoxId(defaultBox.id);
        } catch (error) {
          // Use mock data if API fails
          console.warn("Using mock shared boxes data");
          setAvailableSharedBoxes(getMockSharedBoxes());
          if (getMockSharedBoxes().length > 0) {
            setSelectedSharedBoxId(getMockSharedBoxes()[0].id);
          }
        }
      } else {
        setAvailableSharedBoxes(boxes);
        if (boxes.length > 0) {
          setSelectedSharedBoxId(boxes[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading shared boxes:", error);
      // Use mock data as fallback
      setAvailableSharedBoxes(getMockSharedBoxes());
      if (getMockSharedBoxes().length > 0) {
        setSelectedSharedBoxId(getMockSharedBoxes()[0].id);
      }
    }
  };

  // Mock shared boxes data
  const getMockSharedBoxes = (): AvailableSharedBox[] => {
    return [
      {
        id: "shared-box-001",
        user_id: "admin",
        box_number: "SHARED-2024-001",
        box_type: "shared",
        status: "in_warehouse",
        items: [],
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        current_weight: 8.5,
        current_volume: 0.12,
        max_weight: 15,
        max_volume: 0.3,
        participant_count: 3,
        max_participants: 10,
        is_full: false,
        available_space: {
          weight: 6.5,
          volume: 0.18,
        },
        tracking_id: "TRK-SHARED-001",
      },
      {
        id: "shared-box-002",
        user_id: "admin",
        box_number: "SHARED-2024-002",
        box_type: "shared",
        status: "in_warehouse",
        items: [],
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        current_weight: 2.3,
        current_volume: 0.05,
        max_weight: 15,
        max_volume: 0.3,
        participant_count: 1,
        max_participants: 10,
        is_full: false,
        available_space: {
          weight: 12.7,
          volume: 0.25,
        },
        tracking_id: "TRK-SHARED-002",
      },
    ];
  };

  const loadAvailableSoloBoxes = async () => {
    if (!user?.id) {
      setShowBoxSizeSelection(true);
      return;
    }

    try {
      const boxes = await boxService.getAvailableSoloBoxes(user.id);
      if (boxes.length === 0) {
        setShowBoxSizeSelection(true);
      } else {
        setShowBoxSizeSelection(false);
        setAvailableSoloBoxes(boxes);
        if (boxes.length > 0) {
          setSelectedSoloBoxId(boxes[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading solo boxes:", error);
      // Use mock data as fallback
      const mockSoloBoxes = getMockSoloBoxes();
      if (mockSoloBoxes.length > 0) {
        setShowBoxSizeSelection(false);
        setAvailableSoloBoxes(mockSoloBoxes);
        setSelectedSoloBoxId(mockSoloBoxes[0].id);
      } else {
        setShowBoxSizeSelection(true);
      }
    }
  };

  // Mock solo boxes data
  const getMockSoloBoxes = (): AvailableSharedBox[] => {
    // Return empty array to show box size selection, or return existing boxes
    // For testing, we can return one existing box
    return [
      {
        id: "solo-box-001",
        user_id: user?.id || "user-001",
        box_number: "SOLO-2024-001",
        box_type: "solo",
        status: "in_warehouse",
        items: [
          {
            id: "box-item-001",
            box_id: "solo-box-001",
            name: "Previous Order Item",
            quantity: 1,
            price: 1500,
            currency: "PHP",
            weight: 0.5,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        current_weight: 0.5,
        current_volume: 0.01,
        max_weight: 30,
        max_volume: 0.6,
        participant_count: 1,
        max_participants: 1,
        is_full: false,
        available_space: {
          weight: 29.5,
          volume: 0.59,
        },
        tracking_id: "TRK-SOLO-001",
      },
    ];
  };

  const handleBoxTypeSelect = async (boxType: "SOLO" | "SHARED") => {
    const newPreference = boxType.toLowerCase() as "solo" | "shared";
    setBoxTypePreference(newPreference);

    if (newPreference === "shared") {
      await loadAvailableSharedBoxes();
    } else {
      await loadAvailableSoloBoxes();
    }
  };

  const calculateShipping = () => {
    if (!order) return 0;

    const totalWeight = order.order_items?.reduce((sum, item) => {
      // Estimate weight (you may need to fetch actual product weight)
      return sum + (item.quantity * 0.5); // Default 0.5kg per item
    }, 0) || 0;

    const totalVolume = order.order_items?.reduce((sum, item) => {
      // Estimate volume
      return sum + (item.quantity * 0.001); // Default 0.001 CBM per item
    }, 0) || 0;

    if (boxTypePreference === "shared") {
      const size = { maxWeight: 15, maxVolume: 0.3 };
      const pricing = { base: 1500, perKg: 50, perCbm: 1200 };
      return Math.round(pricing.base + (totalWeight * pricing.perKg) + (totalVolume * pricing.perCbm));
    } else {
      const size = { maxWeight: 30, maxVolume: 0.6 };
      const pricing = { base: 3500, perKg: 120, perCbm: 3000 };
      return Math.round(pricing.base + (totalWeight * pricing.perKg) + (totalVolume * pricing.perCbm));
    }
  };

  const handleRequestShipping = async () => {
    if (!order || !user?.id) return;

    // Validate courier selection for SOLO boxes only
    if (boxTypePreference === "solo" && !selectedCourier) {
      alert("Please select a delivery company to continue.");
      return;
    }

    setProcessing(true);
    try {
      await orderService.requestShipping(order.id, {
        box_type: boxTypePreference,
        ...(boxTypePreference === "shared" && selectedSharedBoxId && {
          shared_box_id: selectedSharedBoxId,
        }),
        ...(boxTypePreference === "solo" && {
          ...(showBoxSizeSelection ? {
            box_size: selectedBoxSize,
          } : selectedSoloBoxId && {
            solo_box_id: selectedSoloBoxId,
          }),
          ...(selectedCourier && {
            courier_id: selectedCourier, // Courier for SOLO boxes (direct delivery)
          }),
        }),
        shipping_address: shippingAddress,
      });

      // Redirect to payment page for shipping fee
      router.push(`/store/payment?orderId=${order.id}&type=shipping`);
    } catch (error) {
      console.error("Error requesting shipping:", error);
      alert("Failed to request shipping. Please try again.");
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

  const shippingFee = calculateShipping();
  const totalItems = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-grey-900 mb-2">Request Shipping</h1>
        <p className="text-grey-600">
          Choose your shipping option and delivery address for Order {order.order_number}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order Summary */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h2 className="text-xl font-semibold text-grey-900 mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-grey-900">{item.product_name}</p>
                  <p className="text-sm text-grey-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-grey-900">
                  {formatCurrency(item.total, order.currency)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-grey-600">Subtotal:</span>
              <span className="font-semibold">{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Items:</span>
              <span>{formatCurrency(order.subtotal, order.currency)}</span>
            </div>
            <p className="text-xs text-grey-500 mt-2">Items already paid and stored</p>
          </div>
        </div>

        {/* Shipping Options */}
        <div className="space-y-6">
          {/* Box Type Selection */}
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-xl font-semibold text-grey-900 mb-4">Shipping Option</h2>
            
            {/* Info Box - SOLO vs SHARED Comparison */}
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg p-3 ${boxTypePreference === "solo" ? "bg-soft-blue-100 border-2 border-soft-blue-300" : "bg-white border border-blue-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="font-semibold text-grey-900">SOLO Box</h3>
                  </div>
                  <ul className="text-xs text-grey-700 space-y-1">
                    <li>✓ Direct delivery to your address</li>
                    <li>✓ Full shipping cost (you pay all)</li>
                    <li>✓ Faster delivery</li>
                    <li>✓ Your items only</li>
                  </ul>
                </div>
                <div className={`rounded-lg p-3 ${boxTypePreference === "shared" ? "bg-purple-100 border-2 border-purple-300" : "bg-white border border-blue-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="font-semibold text-grey-900">SHARED Box</h3>
                  </div>
                  <ul className="text-xs text-grey-700 space-y-1">
                    <li>✓ Shared shipping cost (cheaper)</li>
                    <li>✓ Consolidated with other customers</li>
                    <li>✓ Delivered to Manila office first</li>
                    <li>✓ COD available for local delivery</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-grey-700">Select Box Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBoxTypeSelect("SOLO")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    boxTypePreference === "solo"
                      ? "border-soft-blue-600 bg-soft-blue-600 text-white shadow-sm"
                      : "border-border bg-white text-grey-700 hover:border-soft-blue-300 hover:bg-soft-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    SOLO BOX
                  </div>
                </button>
                <button
                  onClick={() => handleBoxTypeSelect("SHARED")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    boxTypePreference === "shared"
                      ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                      : "border-border bg-white text-grey-700 hover:border-purple-300 hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    SHARED BOX
                  </div>
                </button>
              </div>
            </div>

            {/* Box Selection UI */}
            {boxTypePreference === "solo" ? (
              showBoxSizeSelection ? (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-grey-700">Choose Box Size</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["small", "medium", "large"] as const).map((size) => {
                      const isDisabled = size !== "large";
                      const isSelected = selectedBoxSize === size;
                      const sizeInfo = {
                        small: { maxWeight: 10, maxVolume: 0.1, price: 2000 },
                        medium: { maxWeight: 20, maxVolume: 0.3, price: 3000 },
                        large: { maxWeight: 30, maxVolume: 0.6, price: 3500 },
                      };
                      const info = sizeInfo[size];
                      
                      return (
                        <button
                          key={size}
                          onClick={() => !isDisabled && setSelectedBoxSize(size)}
                          disabled={isDisabled}
                          className={`rounded-lg border-2 p-4 text-center transition-all ${
                            isSelected
                              ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                              : isDisabled
                              ? "border-grey-200 bg-grey-50 opacity-40 cursor-not-allowed"
                              : "border-border bg-white hover:border-soft-blue-300 hover:bg-soft-blue-50"
                          }`}
                        >
                          <div className="text-sm font-bold uppercase mb-1">{size}</div>
                          {!isDisabled && (
                            <div className="text-xs text-grey-600 mt-1">
                              <div>Max: {info.maxWeight}kg</div>
                              <div>{info.maxVolume} CBM</div>
                            </div>
                          )}
                          {isDisabled && (
                            <div className="text-xs text-grey-400 mt-1">Coming Soon</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-grey-500 mt-2">
                    💡 Solo boxes ship directly to your address. You pay the full shipping cost.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-grey-700">
                    Your Existing Solo Boxes
                  </label>
                  <div className="space-y-3">
                    {availableSoloBoxes.map((box) => {
                      const isSelected = selectedSoloBoxId === box.id;
                      const capacityPercent = box.max_weight 
                        ? Math.round((box.current_weight || 0) / box.max_weight * 100)
                        : 0;
                      
                      return (
                        <button
                          key={box.id}
                          onClick={() => setSelectedSoloBoxId(box.id)}
                          className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                              : "border-border bg-white hover:border-soft-blue-300 hover:bg-soft-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="h-5 w-5 text-soft-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="font-semibold text-grey-900">{box.box_number || box.id}</span>
                            </div>
                            {isSelected && (
                              <span className="rounded-full bg-soft-blue-600 text-white px-2 py-0.5 text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-grey-600">
                            <div className="flex items-center justify-between">
                              <span>Capacity:</span>
                              <span className="font-medium">
                                {box.current_weight?.toFixed(1)}kg / {box.max_weight}kg ({capacityPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-grey-200 rounded-full h-1.5">
                              <div
                                className="bg-soft-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                              />
                            </div>
                            {box.items && box.items.length > 0 && (
                              <div className="text-xs text-grey-500 mt-1">
                                Contains {box.items.length} item{box.items.length > 1 ? 's' : ''} from previous orders
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-grey-500 mt-2">
                    💡 Add items to your existing box or create a new one
                  </p>
                </div>
              )
            ) : (
              <div>
                <label className="mb-3 block text-sm font-semibold text-grey-700">
                  Available Shared Boxes
                </label>
                {availableSharedBoxes.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-grey-300 bg-grey-50 p-4 text-center">
                    <p className="text-sm text-grey-600">No shared boxes available. Creating a new one...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSharedBoxes.map((box) => {
                      const isSelected = selectedSharedBoxId === box.id;
                      const weightPercent = box.max_weight 
                        ? Math.round((box.current_weight || 0) / box.max_weight * 100)
                        : 0;
                      const volumePercent = box.max_volume 
                        ? Math.round((box.current_volume || 0) / box.max_volume * 100)
                        : 0;
                      const participantPercent = box.max_participants 
                        ? Math.round((box.participant_count || 0) / box.max_participants * 100)
                        : 0;
                      
                      return (
                        <button
                          key={box.id}
                          onClick={() => setSelectedSharedBoxId(box.id)}
                          className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                            isSelected
                              ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                              : "border-border bg-white hover:border-soft-blue-300 hover:bg-soft-blue-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="font-semibold text-grey-900">{box.box_number || box.id}</span>
                              {box.tracking_id && (
                                <span className="text-xs text-grey-500">({box.tracking_id})</span>
                              )}
                            </div>
                            {isSelected && (
                              <span className="rounded-full bg-soft-blue-600 text-white px-2 py-0.5 text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </div>
                          <div className="space-y-2 text-xs text-grey-600">
                            <div className="flex items-center justify-between">
                              <span>Participants:</span>
                              <span className="font-medium">
                                {box.participant_count || 0} / {box.max_participants || 10}
                              </span>
                            </div>
                            <div className="w-full bg-grey-200 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(participantPercent, 100)}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span>Weight:</span>
                                  <span className="font-medium text-xs">
                                    {box.current_weight?.toFixed(1)}kg / {box.max_weight}kg
                                  </span>
                                </div>
                                <div className="w-full bg-grey-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-500 h-1 rounded-full"
                                    style={{ width: `${Math.min(weightPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span>Volume:</span>
                                  <span className="font-medium text-xs">
                                    {box.current_volume?.toFixed(2)} / {box.max_volume} CBM
                                  </span>
                                </div>
                                <div className="w-full bg-grey-200 rounded-full h-1">
                                  <div
                                    className="bg-green-500 h-1 rounded-full"
                                    style={{ width: `${Math.min(volumePercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            {box.available_space && (
                              <div className="mt-2 rounded bg-green-50 border border-green-200 p-2">
                                <div className="text-xs font-medium text-green-800">
                                  Available: {box.available_space.weight.toFixed(1)}kg, {box.available_space.volume.toFixed(2)} CBM
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-grey-500 mt-2">
                  💡 Shared boxes consolidate items with other customers. Shipping cost is shared. Items are delivered to Manila office first.
                </p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-xl font-semibold text-grey-900 mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-grey-700">Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-grey-700">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full rounded-lg border border-border px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-grey-700">Province</label>
                  <input
                    type="text"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    className="w-full rounded-lg border border-border px-4 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-grey-700">Zip Code</label>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="w-full rounded-lg border border-border px-4 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Company Selection - Only for SOLO boxes (direct delivery) */}
          {couriers.length > 0 && boxTypePreference === "solo" && (
            <div className="rounded-lg border border-border bg-white p-6">
              <h2 className="text-xl font-semibold text-grey-900 mb-4">Delivery Company</h2>
              <p className="mb-4 text-sm text-grey-600">
                Choose your preferred delivery company for direct delivery to your address.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {couriers.map((courier) => (
                  <button
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier.id)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedCourier === courier.id
                        ? "border-soft-blue-600 bg-soft-blue-50 shadow-md"
                        : "border-border bg-white hover:border-soft-blue-300 hover:bg-soft-blue-50"
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
          )}

          {/* Info for SHARED boxes */}
          {boxTypePreference === "shared" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">Shared Box Shipping Flow</p>
                  <p className="text-xs text-blue-800">
                    Your items will be shipped to Manila office first. After arrival, you'll pay for local shipping and choose your delivery company at that time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Fee Summary */}
          <div className="rounded-lg border-2 border-soft-blue-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-grey-900 mb-4">Shipping Fee</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-grey-600">Shipping ({boxTypePreference}):</span>
                <span className="font-semibold">{formatCurrency(shippingFee, "PHP")}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Shipping:</span>
                <span className="text-soft-blue-600">{formatCurrency(shippingFee, "PHP")}</span>
              </div>
              <p className="text-xs text-grey-500 mt-2">
                {boxTypePreference === "solo"
                  ? "Full shipping cost - direct delivery to your address"
                  : "Shared shipping cost - consolidated and delivered to Manila office first"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleRequestShipping}
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? "Processing..." : "Continue to Payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}


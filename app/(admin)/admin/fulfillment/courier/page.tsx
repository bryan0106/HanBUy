"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { CourierShipment } from "@/types/fulfillment";

export default function CourierManagementPage() {
  const [shipments, setShipments] = useState<CourierShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadShipments();
  }, [statusFilter]);

  const loadShipments = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: CourierShipment[] = [
      {
        id: "ship-1",
        boxId: "box-1",
        boxNumber: "CONS-2024-001",
        boxType: "solo",
        courierName: "J&T Express",
        trackingNumber: "JNT123456789",
        serviceType: "standard",
        recipientAddress: {
          street: "123 Main St",
          city: "Manila",
          province: "Metro Manila",
          zipCode: "1000",
          country: "Philippines",
        },
        recipientName: "John Doe",
        recipientPhone: "+63 912 345 6789",
        status: "picked_up",
        estimatedDelivery: new Date("2025-01-05"),
        createdAt: new Date("2024-12-30"),
        pickedUpAt: new Date("2024-12-30"),
      },
      {
        id: "ship-2",
        boxId: "box-2",
        boxNumber: "CONS-2024-002",
        boxType: "shared",
        courierName: "LBC Express",
        trackingNumber: "LBC987654321",
        serviceType: "express",
        recipientAddress: {
          street: "456 Oak Ave",
          city: "Quezon City",
          province: "Metro Manila",
          zipCode: "1100",
          country: "Philippines",
        },
        recipientName: "Jane Smith",
        recipientPhone: "+63 923 456 7890",
        status: "in_transit",
        estimatedDelivery: new Date("2025-01-03"),
        createdAt: new Date("2024-12-29"),
        pickedUpAt: new Date("2024-12-29"),
      },
    ];
    setShipments(mockData);
    setLoading(false);
  };

  const filteredShipments =
    statusFilter === "all"
      ? shipments
      : shipments.filter((s) => s.status === statusFilter);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    picked_up: "bg-info/10 text-info",
    in_transit: "bg-soft-blue-50 text-soft-blue-700",
    out_for_delivery: "bg-warning/10 text-warning",
    delivered: "bg-success/10 text-success",
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Philippines Courier Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shipments to customers via local couriers
          </p>
        </div>
        <button className="w-full rounded-lg bg-soft-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-soft-blue-700 sm:w-auto">
          + Create Shipment
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Total Shipments</p>
          <p className="text-2xl font-bold">{shipments.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Pending</p>
          <p className="text-2xl font-bold text-warning">
            {shipments.filter((s) => s.status === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">In Transit</p>
          <p className="text-2xl font-bold text-info">
            {shipments.filter((s) => s.status === "in_transit").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Out for Delivery</p>
          <p className="text-2xl font-bold text-soft-blue-600">
            {shipments.filter((s) => s.status === "out_for_delivery").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground sm:text-sm">Delivered</p>
          <p className="text-2xl font-bold text-success">
            {shipments.filter((s) => s.status === "delivered").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("picked_up")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "picked_up"
                ? "bg-info text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Picked Up
          </button>
          <button
            onClick={() => setStatusFilter("in_transit")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "in_transit"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            In Transit
          </button>
          <button
            onClick={() => setStatusFilter("out_for_delivery")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "out_for_delivery"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Out for Delivery
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
              statusFilter === "delivered"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Loading courier shipments...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Box #
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Recipient
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Courier
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Tracking #
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Service
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Status
                </th>
                <th className="px-2 py-3 text-left text-xs font-semibold sm:px-4 sm:text-sm">
                  Est. Delivery
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold sm:px-4 sm:text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-grey-50">
                  <td className="px-2 py-3 sm:px-4">
                    <Link
                      href={`/admin/fulfillment/consolidation/${shipment.boxId}`}
                      className="font-semibold text-soft-blue-600 hover:underline"
                    >
                      {shipment.boxNumber}
                    </Link>
                    <span
                      className={`ml-2 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        shipment.boxType === "solo"
                          ? "bg-info/10 text-info"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {shipment.boxType}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                    <div className="font-medium">{shipment.recipientName}</div>
                    <div className="text-muted-foreground">
                      {shipment.recipientAddress.city}, {shipment.recipientAddress.province}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-xs sm:px-4 sm:text-sm">
                    {shipment.courierName}
                  </td>
                  <td className="px-2 py-3 text-xs font-mono sm:px-4 sm:text-sm">
                    {shipment.trackingNumber}
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        shipment.serviceType === "express"
                          ? "bg-error/10 text-error"
                          : "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {shipment.serviceType === "express" ? "Express" : "Standard"}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-center sm:px-4">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        statusColors[shipment.status] ||
                        "bg-grey-100 text-grey-700"
                      }`}
                    >
                      {shipment.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-xs text-muted-foreground sm:px-4 sm:text-sm">
                    {shipment.estimatedDelivery
                      ? formatDate(shipment.estimatedDelivery)
                      : "-"}
                  </td>
                  <td className="px-2 py-3 sm:px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/fulfillment/courier/${shipment.id}`}
                        className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm"
                      >
                        View
                      </Link>
                      <button className="text-[10px] text-soft-blue-600 hover:underline sm:text-sm">
                        Track
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


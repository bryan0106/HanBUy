"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  level: "solobox" | "box_sharing" | "kr_to_kr" | "international" | null;
  approvalStatus: "pending" | "approved" | "rejected";
  requestedAt: Date;
  approvedAt?: Date;
  totalBoxes: number;
  totalOrders: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadClients();
  }, [statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    // TODO: Fetch from API
    const mockData: Client[] = [
      {
        id: "client-1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+63XXXXXXXXXX",
        level: "solobox",
        approvalStatus: "approved",
        requestedAt: new Date("2024-10-01"),
        approvedAt: new Date("2024-10-02"),
        totalBoxes: 3,
        totalOrders: 5,
      },
      {
        id: "client-2",
        name: "Jane Smith",
        email: "jane@example.com",
        level: "international",
        approvalStatus: "pending",
        requestedAt: new Date("2024-12-25"),
        totalBoxes: 0,
        totalOrders: 0,
      },
      {
        id: "client-3",
        name: "Mike Johnson",
        email: "mike@example.com",
        level: "box_sharing",
        approvalStatus: "approved",
        requestedAt: new Date("2024-11-15"),
        approvedAt: new Date("2024-11-16"),
        totalBoxes: 1,
        totalOrders: 2,
      },
    ];
    setClients(mockData);
    setLoading(false);
  };

  const filteredClients =
    statusFilter === "all"
      ? clients
      : clients.filter((client) => client.approvalStatus === statusFilter);

  const handleApprove = async (clientId: string, level: string) => {
    // TODO: Call API to approve client
    alert(`Approving client ${clientId} with level ${level}`);
  };

  const handleReject = async (clientId: string) => {
    // TODO: Call API to reject client
    alert(`Rejecting client ${clientId}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold">{clients.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending Approval</p>
          <p className="text-2xl font-bold text-warning">
            {clients.filter((c) => c.approvalStatus === "pending").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-success">
            {clients.filter((c) => c.approvalStatus === "approved").length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Solo Box Clients</p>
          <p className="text-2xl font-bold">
            {clients.filter((c) => c.level === "solobox").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-soft-blue-600 text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-warning text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Pending ({clients.filter((c) => c.approvalStatus === "pending").length})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "approved"
                ? "bg-success text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "rejected"
                ? "bg-error text-white"
                : "bg-grey-100 text-grey-700 hover:bg-grey-200"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Boxes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Orders</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Requested</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-grey-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                    {client.phone && (
                      <div className="text-xs text-muted-foreground">{client.phone}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {client.level ? (
                      <span className="rounded-full bg-soft-blue-50 px-2 py-1 text-xs font-medium text-soft-blue-700 capitalize">
                        {client.level.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        client.approvalStatus === "approved"
                          ? "bg-success/10 text-success"
                          : client.approvalStatus === "pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {client.approvalStatus.charAt(0).toUpperCase() +
                        client.approvalStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{client.totalBoxes}</td>
                  <td className="px-4 py-3 text-center">{client.totalOrders}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(client.requestedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {client.approvalStatus === "pending" ? (
                      <div className="flex items-center justify-center gap-2">
                        <select
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleApprove(client.id, e.target.value);
                            }
                          }}
                        >
                          <option value="">Select Level</option>
                          <option value="solobox">Solo Box</option>
                          <option value="box_sharing">Box Sharing</option>
                          <option value="kr_to_kr">KR to KR</option>
                          <option value="international">International</option>
                        </select>
                        <button
                          onClick={() => handleReject(client.id)}
                          className="rounded-lg bg-error/10 px-2 py-1 text-xs font-medium text-error transition-colors hover:bg-error/20"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        {client.approvedAt ? `Approved ${formatDate(client.approvedAt)}` : "-"}
                      </div>
                    )}
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


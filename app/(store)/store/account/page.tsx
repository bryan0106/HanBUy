"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { addressService, type ShippingAddress } from "@/services/addressService";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function StoreAccountPage() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const { balance, transactions, loading: walletLoading, fetchTransactions } = useWallet(user?.id);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "security" | "wallet" | "addresses">("profile");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login?redirect=/store/account");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">My Account</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "profile"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "settings"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "security"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "wallet"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors sm:text-base ${
              activeTab === "addresses"
                ? "border-b-2 border-soft-blue-600 text-soft-blue-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Shipping Addresses
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name || ""}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ""}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  defaultValue=""
                  placeholder="Not set"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/store/orders"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">🛒</span>
                <div>
                  <p className="font-medium">My Orders</p>
                  <p className="text-xs text-muted-foreground">View all orders</p>
                </div>
              </Link>
              <Link
                href="/store/notifications"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">🔔</span>
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">View notifications</p>
                </div>
              </Link>
              <Link
                href="/dashboard/box"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">📦</span>
                <div>
                  <p className="font-medium">My Box</p>
                  <p className="text-xs text-muted-foreground">Track shipments</p>
                </div>
              </Link>
              <Link
                href="/store/liked"
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:bg-grey-50"
              >
                <span className="text-2xl">❤️</span>
                <div>
                  <p className="font-medium">Liked Items</p>
                  <p className="text-xs text-muted-foreground">Saved products</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates about your orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive SMS updates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">Receive promotional emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-grey-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-soft-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2"
                  placeholder="Confirm new password"
                />
              </div>
              <button className="rounded-lg bg-soft-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-soft-blue-700">
                Update Password
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-error">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <button className="rounded-lg border border-error px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10">
                  Delete Account
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logout</p>
                  <p className="text-sm text-muted-foreground">Sign out from your account</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-grey-100 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-grey-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Wallet Balance</h2>
            {walletLoading ? (
              <p className="text-muted-foreground">Loading wallet...</p>
            ) : (
              <div className="rounded-lg bg-green-50 border border-green-200 p-6">
                <p className="text-sm text-green-800 font-medium mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(balance, "PHP")}
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Use your wallet balance when making payments. Excess payments will be automatically credited to your wallet.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Transaction History</h2>
            {walletLoading ? (
              <p className="text-muted-foreground">Loading transactions...</p>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      {transaction.reference_type && (
                        <p className="text-xs text-muted-foreground">
                          {transaction.reference_type === "order" && "Order"}
                          {transaction.reference_type === "payment" && "Payment"}
                          {transaction.reference_type === "refund" && "Refund"}
                          {transaction.reference_type === "adjustment" && "Adjustment"}
                        </p>
                      )}
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shipping Addresses Tab */}
      {activeTab === "addresses" && <AddressesTab />}
    </div>
  );
}

// Shipping Addresses Tab Component
function AddressesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    label: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    province: "",
    postal_code: "",
    country: "Philippines",
    region: "",
    is_default: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.error("Error loading addresses:", error);
      toast.error(error?.message || "Failed to load addresses");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setFormData({
      first_name: user?.name?.split(' ')[0] || "",
      last_name: user?.name?.split(' ').slice(1).join(' ') || "",
      phone: user?.phone || "",
      label: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      province: "",
      postal_code: "",
      country: "Philippines",
      region: "",
      is_default: false,
    });
    setShowAddModal(true);
  };

  const handleEdit = (address: ShippingAddress) => {
    setEditingAddress(address);
    setFormData({
      first_name: address.first_name || "",
      last_name: address.last_name || "",
      phone: address.phone || "",
      label: address.label || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      city: address.city || "",
      province: address.province || "",
      postal_code: address.postal_code || "",
      country: address.country || "Philippines",
      region: address.region || "",
      is_default: address.is_default || false,
    });
    setShowAddModal(true);
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.province || !formData.postal_code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress({
          id: editingAddress.id,
          ...formData,
        });
        toast.success("Address updated successfully");
      } else {
        await addressService.createAddress(formData);
        toast.success("Address added successfully");
      }
      setShowAddModal(false);
      loadAddresses();
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await addressService.deleteAddress(id);
      toast.success("Address deleted successfully");
      loadAddresses();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error(error?.message || "Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id);
      toast.success("Default address updated");
      loadAddresses();
    } catch (error: any) {
      console.error("Error setting default address:", error);
      toast.error(error?.message || "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-muted-foreground">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Shipping Addresses</h2>
        <Button onClick={handleAdd} className="bg-soft-blue-600 text-white hover:bg-soft-blue-700">
          + Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No shipping addresses saved yet</p>
          <Button onClick={handleAdd} className="bg-soft-blue-600 text-white hover:bg-soft-blue-700">
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-lg border p-6 ${
                address.is_default
                  ? "border-soft-blue-600 bg-soft-blue-50"
                  : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  {address.label && (
                    <h3 className="font-semibold text-foreground">{address.label}</h3>
                  )}
                  {address.is_default && (
                    <span className="mt-1 inline-block rounded-full bg-soft-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-sm text-soft-blue-600 hover:text-soft-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-sm text-error hover:text-error/80"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{address.address_line_1}</p>
                {address.address_line_2 && <p>{address.address_line_2}</p>}
                <p>
                  {address.city}, {address.province} {address.postal_code}
                </p>
                <p>{address.country}</p>
              </div>
              {!address.is_default && (
                <Button
                  onClick={() => handleSetDefault(address.id)}
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  Set as Default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    First Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Last Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Label (optional)</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Home, Work, Office"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address Line 1 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Address Line 2 (optional)</label>
                <input
                  type="text"
                  value={formData.address_line_2}
                  onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                  placeholder="Apartment, suite, unit, etc."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    City <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Province <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Postal Code <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Country <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Region (optional)</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Set as default address</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-soft-blue-600 text-white hover:bg-soft-blue-700"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


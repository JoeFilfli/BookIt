"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "@/lib/hooks";
import Link from "next/link";

interface ServiceForm {
  name: string;
  description: string;
  durationMinutes: number;
  price: string;
  currency: string;
}

const emptyForm: ServiceForm = {
  name: "",
  description: "",
  durationMinutes: 60,
  price: "",
  currency: "USD",
};

const durationOptions = [15, 30, 45, 60, 90, 120];

export default function ManageServicesPage() {
  const { status } = useSession();
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { data: businessData } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const businessId = businessData?.id || "";

  const { data: services = [], isLoading } = useServices(businessId);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!businessData) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-gray-600">You need to create a business first.</p>
          <Link
            href="/dashboard/create"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your Business
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const data = {
      name: form.name,
      description: form.description || null,
      durationMinutes: form.durationMinutes,
      price: parseFloat(form.price),
      currency: form.currency,
    };

    if (isNaN(data.price) || data.price < 0) {
      setError("Please enter a valid price");
      return;
    }

    try {
      if (editingId) {
        await updateService.mutateAsync({
          businessId,
          serviceId: editingId,
          data,
        });
        setEditingId(null);
      } else {
        await createService.mutateAsync({ businessId, data });
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleEdit = (service: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: string;
    currency: string;
  }) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      price: String(service.price),
      currency: service.currency,
    });
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Delete this service? Existing bookings for this service will be affected.")) return;
    try {
      await deleteService.mutateAsync({ businessId, serviceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700">
              &larr; Back to Dashboard
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              Manage Services
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? "Edit Service" : "Add Service"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Padel Session, Haircut"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <select
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationMinutes: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d}>
                    {d} min{d >= 60 ? ` (${d / 60}h)` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="25.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="LBP">LBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={createService.isPending || updateService.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Add Service"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Services List */}
        {(services as Array<{
          id: string;
          name: string;
          description: string | null;
          durationMinutes: number;
          price: string;
          currency: string;
        }>).length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No services yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-3">
            {(services as Array<{
              id: string;
              name: string;
              description: string | null;
              durationMinutes: number;
              price: string;
              currency: string;
            }>).map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-500">
                    {service.durationMinutes} min &middot;{" "}
                    {Number(service.price).toFixed(2)} {service.currency}
                    {service.description && ` — ${service.description}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={deleteService.isPending}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

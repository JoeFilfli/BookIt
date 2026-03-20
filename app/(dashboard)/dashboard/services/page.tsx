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
import { toast } from "sonner";
import { Tag, PlusCircle, ArrowLeft, Clock, DollarSign, Pencil, Trash2 } from "lucide-react";

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

function ServiceSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <div className="skeleton h-4 w-36" />
            <div className="skeleton h-3 w-24" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-8 w-14 rounded-lg" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ManageServicesPage() {
  const { status } = useSession();
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: businessData, isLoading: bizLoading } = useQuery({
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

  const { data: services = [], isLoading: servicesLoading } = useServices(businessId);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const isLoading = status === "loading" || bizLoading || servicesLoading;

  if (isLoading) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="skeleton h-6 w-32 mb-2 rounded" />
        <div className="skeleton h-8 w-48 mb-8 rounded" />
        <div className="skeleton h-56 w-full rounded-xl mb-8" />
        <ServiceSkeleton />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="py-20 px-4 flex flex-col items-center text-center">
        <Tag className="w-12 h-12 mb-4" style={{ color: "var(--color-text-secondary)" }} />
        <h2 className="text-lg font-semibold text-text-primary mb-2">No business yet</h2>
        <p className="text-text-secondary text-sm mb-6">Create your business profile before adding services.</p>
        <Link href="/dashboard/create" className="btn-primary text-sm px-5 py-2.5">
          Create Your Business
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: form.name,
      description: form.description || null,
      durationMinutes: form.durationMinutes,
      price: parseFloat(form.price),
      currency: form.currency,
    };

    if (isNaN(data.price) || data.price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      if (editingId) {
        await updateService.mutateAsync({ businessId, serviceId: editingId, data });
        toast.success("Service updated");
        setEditingId(null);
      } else {
        await createService.mutateAsync({ businessId, data });
        toast.success("Service added");
      }
      setForm(emptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  type ServiceItem = {
    id: string; name: string; description: string | null;
    durationMinutes: number; price: string; currency: string;
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || "",
      durationMinutes: service.durationMinutes,
      price: String(service.price),
      currency: service.currency,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Delete this service? Existing bookings for this service will be affected.")) return;
    try {
      await deleteService.mutateAsync({ businessId, serviceId });
      toast.success("Service deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const serviceList = services as ServiceItem[];

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium mb-3 transition-colors"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Manage Services</h1>
        <p className="mt-1 text-sm text-text-secondary">Define the bookable services your business offers.</p>
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-surface-border">
        <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          {editingId ? "Edit Service" : "Add Service"}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field-base"
              placeholder="e.g., Padel Session, Haircut"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Duration</label>
            <select
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })}
              className="field-base"
            >
              {durationOptions.map((d) => (
                <option key={d} value={d}>
                  {d} min{d >= 60 ? ` (${d / 60}h)` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Price</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="field-base"
              placeholder="25.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="field-base"
            >
              <option value="USD">USD</option>
              <option value="LBP">LBP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="field-base"
              placeholder="Optional description"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={createService.isPending || updateService.isPending}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {createService.isPending || updateService.isPending
              ? "Saving…"
              : editingId ? "Update Service" : "Add Service"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(emptyForm); }}
              className="btn-secondary text-sm px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Services List */}
      {serviceList.length === 0 ? (
        <div className="flex flex-col items-center text-center py-14 rounded-xl bg-white border border-dashed border-surface-border">
          <Tag className="w-10 h-10 mb-3" style={{ color: "var(--color-text-secondary)" }} />
          <p className="font-medium text-text-primary mb-1">No services yet</p>
          <p className="text-sm text-text-secondary">Add your first service using the form above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {serviceList.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-surface-border"
            >
              <div>
                <h3 className="font-semibold text-text-primary">{service.name}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <Clock className="w-3.5 h-3.5" /> {service.durationMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-text-primary">
                    <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
                    {Number(service.price).toFixed(2)} {service.currency}
                  </span>
                  {service.description && (
                    <span className="text-sm text-text-secondary hidden sm:inline">— {service.description}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-dim transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deleteService.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ borderColor: "var(--color-error)", color: "var(--color-error)" }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

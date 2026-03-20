"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  useResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  useUploadImage,
} from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { Layers, PlusCircle, ArrowLeft, ImageOff, Pencil, Trash2 } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/categories/config";

type ResourceType = "COURT" | "STAFF" | "ROOM";

interface ResourceForm {
  name: string;
  type: ResourceType;
  description: string;
  imageUrl: string;
}

const emptyForm: ResourceForm = {
  name: "",
  type: "COURT",
  description: "",
  imageUrl: "",
};

function ResourceSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="skeleton h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-20" />
            </div>
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

export default function ManageResourcesPage() {
  const { status } = useSession();
  const [form, setForm] = useState<ResourceForm>(emptyForm);
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
  const businessCategory = businessData?.category || "COURTS_SPORTS";
  const defaultType: ResourceType =
    (CATEGORY_CONFIG as Record<string, { defaultResourceType: string }>)[businessCategory]?.defaultResourceType as ResourceType ?? "STAFF";

  const { data: resources = [], isLoading: resourcesLoading } = useResources(businessId);
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const uploadImage = useUploadImage();

  const isLoading = status === "loading" || bizLoading || resourcesLoading;

  if (isLoading) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="skeleton h-6 w-32 mb-2 rounded" />
        <div className="skeleton h-8 w-48 mb-8 rounded" />
        <div className="skeleton h-48 w-full rounded-xl mb-8" />
        <ResourceSkeleton />
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="py-20 px-4 flex flex-col items-center text-center">
        <Layers className="w-12 h-12 mb-4" style={{ color: "var(--color-text-secondary)" }} />
        <h2 className="text-lg font-semibold text-text-primary mb-2">No business yet</h2>
        <p className="text-text-secondary text-sm mb-6">Create your business profile before adding resources.</p>
        <Link href="/dashboard/create" className="btn-primary text-sm px-5 py-2.5">
          Create Your Business
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateResource.mutateAsync({ businessId, resourceId: editingId, data: { ...form } });
        toast.success("Resource updated");
        setEditingId(null);
      } else {
        await createResource.mutateAsync({ businessId, data: { ...form, type: form.type || defaultType } });
        toast.success("Resource added");
      }
      setForm({ ...emptyForm, type: defaultType });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleEdit = (resource: ResourceForm & { id: string }) => {
    setEditingId(resource.id);
    setForm({
      name: resource.name,
      type: resource.type,
      description: resource.description || "",
      imageUrl: resource.imageUrl || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Delete this resource? All its schedules and bookings will also be deleted.")) return;
    try {
      await deleteResource.mutateAsync({ businessId, resourceId });
      toast.success("Resource deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage.mutateAsync(file);
      setForm((f) => ({ ...f, imageUrl: result.url }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    }
  };

  const resourceList = resources as Array<ResourceForm & { id: string; createdAt: string }>;

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
        <h1 className="text-2xl font-bold text-text-primary">Manage Resources</h1>
        <p className="mt-1 text-sm text-text-secondary">Courts, staff members, or rooms available for booking.</p>
      </div>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-xl bg-white p-6 shadow-sm border border-surface-border">
        <h2 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
          {editingId ? "Edit Resource" : "Add Resource"}
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
              placeholder={businessCategory === "SPORTS" ? "e.g., Court 1" : "e.g., Nadia"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
              className="field-base"
            >
              <option value="COURT">Court</option>
              <option value="STAFF">Staff</option>
              <option value="ROOM">Room</option>
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-text-primary mb-1">Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer"
                style={{ "--file-bg": "var(--color-accent-soft)", "--file-color": "var(--color-accent)" } as React.CSSProperties}
              />
              {uploadImage.isPending && (
                <span className="text-sm text-text-secondary animate-pulse">Uploading…</span>
              )}
              {form.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Preview" className="h-10 w-10 rounded-lg object-cover border border-surface-border" />
              )}
            </div>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={createResource.isPending || updateResource.isPending}
            className="btn-primary text-sm px-5 py-2.5"
          >
            {createResource.isPending || updateResource.isPending
              ? "Saving…"
              : editingId ? "Update Resource" : "Add Resource"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ ...emptyForm, type: defaultType }); }}
              className="btn-secondary text-sm px-5 py-2.5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Resources List */}
      {resourceList.length === 0 ? (
        <div className="flex flex-col items-center text-center py-14 rounded-xl bg-white border border-dashed border-surface-border">
          <Layers className="w-10 h-10 mb-3" style={{ color: "var(--color-text-secondary)" }} />
          <p className="font-medium text-text-primary mb-1">No resources yet</p>
          <p className="text-sm text-text-secondary">Add your first resource using the form above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resourceList.map((resource) => (
            <div
              key={resource.id}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-surface-border"
            >
              <div className="flex items-center gap-4">
                {resource.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resource.imageUrl} alt={resource.name} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-dim text-text-secondary">
                    <ImageOff className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-text-primary">{resource.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {resource.type.charAt(0) + resource.type.slice(1).toLowerCase()}
                    {resource.description && ` — ${resource.description}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(resource)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm font-medium text-text-primary hover:bg-surface-dim transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(resource.id)}
                  disabled={deleteResource.isPending}
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

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

export default function ManageResourcesPage() {
  const { status } = useSession();
  const [form, setForm] = useState<ResourceForm>(emptyForm);
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
  const businessCategory = businessData?.category || "SPORTS";
  const defaultType: ResourceType = businessCategory === "SPORTS" ? "COURT" : "STAFF";

  const { data: resources = [], isLoading } = useResources(businessId);
  const createResource = useCreateResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();
  const uploadImage = useUploadImage();

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

    try {
      if (editingId) {
        await updateResource.mutateAsync({
          businessId,
          resourceId: editingId,
          data: { ...form },
        });
        setEditingId(null);
      } else {
        await createResource.mutateAsync({
          businessId,
          data: { ...form, type: form.type || defaultType },
        });
      }
      setForm({ ...emptyForm, type: defaultType });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Delete this resource? All its schedules and bookings will also be deleted.")) return;
    try {
      await deleteResource.mutateAsync({ businessId, resourceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadImage.mutateAsync(file);
      setForm((f) => ({ ...f, imageUrl: result.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
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
              Manage Resources
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
            {editingId ? "Edit Resource" : "Add Resource"}
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
                placeholder={businessCategory === "SPORTS" ? "e.g., Court 1" : "e.g., Nadia"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as ResourceType })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="COURT">Court</option>
                <option value="STAFF">Staff</option>
                <option value="ROOM">Room</option>
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                />
                {uploadImage.isPending && (
                  <span className="text-sm text-gray-500">Uploading...</span>
                )}
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-10 w-10 rounded object-cover"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={createResource.isPending || updateResource.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? "Update" : "Add Resource"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...emptyForm, type: defaultType });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Resources List */}
        {(resources as Array<ResourceForm & { id: string; createdAt: string }>).length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No resources yet. Add your first one above.
          </p>
        ) : (
          <div className="space-y-3">
            {(resources as Array<ResourceForm & { id: string; createdAt: string }>).map(
              (resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {resource.imageUrl ? (
                      <img
                        src={resource.imageUrl}
                        alt={resource.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-400 text-xs">
                        No img
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {resource.type.charAt(0) +
                          resource.type.slice(1).toLowerCase()}
                        {resource.description && ` — ${resource.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(resource)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      disabled={deleteResource.isPending}
                      className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}

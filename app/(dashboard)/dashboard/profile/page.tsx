"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useUpdateBusiness, useUploadImage } from "@/lib/hooks";
import { toast } from "sonner";
import { Building2, Plus, X, Save } from "lucide-react";
import Link from "next/link";

function ProfileSkeleton() {
  return (
    <div className="py-8 px-4 max-w-3xl mx-auto space-y-6">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="skeleton h-4 w-64 rounded" />
      <div className="rounded-xl bg-white border border-surface-border p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessProfilePage() {
  const { status } = useSession();
  const updateBusiness = useUpdateBusiness();
  const uploadImage = useUploadImage();

  const { data: businessData, isLoading } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (businessData) {
      setName(businessData.name || "");
      setDescription(businessData.description || "");
      setPhone(businessData.phone || "");
      setAddress(businessData.address || "");
      setCity(businessData.city || "");
      setImages(businessData.images || []);
    }
  }, [businessData]);

  if (status === "loading" || isLoading) {
    return <ProfileSkeleton />;
  }

  if (!businessData) {
    return (
      <div className="py-20 px-4 flex flex-col items-center text-center">
        <Building2 className="w-12 h-12 mb-4" style={{ color: "var(--color-text-secondary)" }} />
        <h2 className="text-lg font-semibold text-text-primary mb-2">No business yet</h2>
        <p className="text-text-secondary text-sm mb-6">Create your business profile to get started.</p>
        <Link href="/dashboard/create" className="btn-primary text-sm px-5 py-2.5">
          Create Your Business
        </Link>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      setImages((prev) => [...prev, result.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !city) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await updateBusiness.mutateAsync({
        id: businessData.id,
        data: { name, description, phone, address, city, images },
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Business Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update your public listing details — changes appear immediately on your page.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-surface-border">
          <h2 className="text-base font-semibold text-text-primary mb-5">Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Business Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field-base"
                placeholder="e.g. Beirut Padel Club"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="field-base"
                placeholder="Describe your business to attract customers…"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-surface-border">
          <h2 className="text-base font-semibold text-text-primary mb-5">Contact & Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="field-base"
                placeholder="+961 XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="field-base"
                placeholder="e.g. Beirut"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Address *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="field-base"
                placeholder="Street address"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-surface-border">
          <h2 className="text-base font-semibold text-text-primary mb-1">Photos</h2>
          <p className="text-xs text-text-secondary mb-4">First photo is used as the cover image on your listing.</p>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative h-24 w-24 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "var(--color-error)" }}
                >
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && (
                  <span
                    className="absolute bottom-1 left-1 rounded text-[10px] font-medium px-1.5 py-0.5 text-white"
                    style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                  >
                    Cover
                  </span>
                )}
              </div>
            ))}
            <label
              className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors"
              style={{ borderColor: "var(--color-surface-border)", color: "var(--color-text-secondary)" }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <span className="text-xs animate-pulse">Uploading…</span>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Add photo</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Public profile link */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ backgroundColor: "var(--color-accent-soft)" }}
        >
          <div>
            <p className="text-sm font-medium text-text-primary">Public listing</p>
            <p className="text-xs text-text-secondary mt-0.5">
              /business/{businessData.slug}
            </p>
          </div>
          <Link
            href={`/business/${businessData.slug}`}
            target="_blank"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--color-accent)" }}
          >
            View →
          </Link>
        </div>

        <div className="flex justify-end pb-4">
          <button
            type="submit"
            disabled={updateBusiness.isPending}
            className="btn-primary px-6 py-2.5 inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateBusiness.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

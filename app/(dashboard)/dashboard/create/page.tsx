"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBusiness, useUploadImage } from "@/lib/hooks";
import type { BusinessCategory } from "@/lib/types";

const SPORT_TYPES = [
  "Padel",
  "Tennis",
  "Basketball",
  "Football",
  "Volleyball",
  "Badminton",
  "Squash",
];

const SURFACE_TYPES = [
  "Hard Court",
  "Clay",
  "Grass",
  "Artificial Turf",
  "Wood",
  "Rubber",
];

const SALON_SPECIALTIES = [
  "Haircut",
  "Coloring",
  "Nails",
  "Facial",
  "Waxing",
  "Massage",
  "Makeup",
  "Beard Trim",
];

export default function CreateBusinessPage() {
  const router = useRouter();
  const createBusiness = useCreateBusiness();
  const uploadImage = useUploadImage();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1: Category
  const [category, setCategory] = useState<BusinessCategory | "">("");

  // Step 2: Common fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 3: Category-specific
  // Sports
  const [courtCount, setCourtCount] = useState(1);
  const [sportTypes, setSportTypes] = useState<string[]>([]);
  const [surfaceType, setSurfaceType] = useState("");
  const [indoor, setIndoor] = useState(false);
  // Salon
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [genderFocus, setGenderFocus] = useState<"men" | "women" | "unisex">(
    "unisex"
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      setImages([...images, result.url]);
    } catch {
      setError("Image upload failed. Please try again.");
    }
    setUploading(false);
  };

  const toggleArrayItem = (
    arr: string[],
    setArr: (v: string[]) => void,
    item: string
  ) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const handleSubmit = async () => {
    setError("");

    const extraFields =
      category === "SPORTS"
        ? { courtCount, sportTypes, surfaceType, indoor }
        : { specialties, genderFocus };

    try {
      const business = await createBusiness.mutateAsync({
        name,
        category,
        description,
        phone,
        address,
        city,
        images,
        extraFields,
      });
      router.push(`/dashboard?created=${business.slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create business"
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s <= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 ${
                    s < step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                What type of business?
              </h1>
              <p className="mt-2 text-gray-600">
                Choose the category that best fits your business.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setCategory("SPORTS")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    category === "SPORTS"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl">&#9917;</div>
                  <h3 className="mt-3 text-lg font-semibold">Sports Venue</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Courts, fields, and sports facilities
                  </p>
                </button>
                <button
                  onClick={() => setCategory("SALON")}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    category === "SALON"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl">&#9986;&#65039;</div>
                  <h3 className="mt-3 text-lg font-semibold">Salon</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hair, beauty, and grooming services
                  </p>
                </button>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => category && setStep(2)}
                  disabled={!category}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Common Fields */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Business Details
              </h1>
              <p className="mt-2 text-gray-600">
                Tell us about your business.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Beirut Padel Club"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe your business..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="+961 XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Beirut"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Images
                  </label>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {images.map((url, i) => (
                      <div key={i} className="relative h-20 w-20">
                        <img
                          src={url}
                          alt={`Business image ${i + 1}`}
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <button
                          onClick={() =>
                            setImages(images.filter((_, j) => j !== i))
                          }
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                        >
                          x
                        </button>
                      </div>
                    ))}
                    <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? "..." : "+"}
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!name || !phone || !address || !city) {
                      setError("Please fill in all required fields");
                      return;
                    }
                    setError("");
                    setStep(3);
                  }}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Category-specific */}
          {step === 3 && category === "SPORTS" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sports Venue Details
              </h1>
              <p className="mt-2 text-gray-600">
                Tell us about your courts and facilities.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Courts *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={courtCount}
                    onChange={(e) => setCourtCount(parseInt(e.target.value) || 1)}
                    className="mt-1 block w-32 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Sport Types *
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SPORT_TYPES.map((sport) => (
                      <button
                        key={sport}
                        onClick={() =>
                          toggleArrayItem(sportTypes, setSportTypes, sport)
                        }
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          sportTypes.includes(sport)
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Surface Type *
                  </label>
                  <select
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select surface type</option>
                    {SURFACE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Indoor Facility
                  </label>
                  <button
                    onClick={() => setIndoor(!indoor)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      indoor ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        indoor ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (sportTypes.length === 0 || !surfaceType) {
                      setError(
                        "Please select at least one sport type and a surface type"
                      );
                      return;
                    }
                    setError("");
                    handleSubmit();
                  }}
                  disabled={createBusiness.isPending}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createBusiness.isPending
                    ? "Creating..."
                    : "Create Business"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && category === "SALON" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Salon Details
              </h1>
              <p className="mt-2 text-gray-600">
                Tell us about your salon services.
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Specialties *
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SALON_SPECIALTIES.map((spec) => (
                      <button
                        key={spec}
                        onClick={() =>
                          toggleArrayItem(specialties, setSpecialties, spec)
                        }
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          specialties.includes(spec)
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gender Focus *
                  </label>
                  <div className="mt-2 flex gap-3">
                    {(["men", "women", "unisex"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenderFocus(g)}
                        className={`rounded-lg border px-6 py-2 text-sm capitalize transition-colors ${
                          genderFocus === g
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (specialties.length === 0) {
                      setError("Please select at least one specialty");
                      return;
                    }
                    setError("");
                    handleSubmit();
                  }}
                  disabled={createBusiness.isPending}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createBusiness.isPending
                    ? "Creating..."
                    : "Create Business"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBusiness, useUploadImage } from "@/lib/hooks";
import type { BusinessCategory } from "@/lib/types";
import { CATEGORY_CONFIG } from "@/lib/categories/config";
import { toast } from "sonner";
import { Check, X, Plus } from "lucide-react";
import {
  UtensilsCrossed, Wine, Ticket, Landmark, Compass, Trophy,
  GraduationCap, Scissors, Sparkles, Leaf, Heart,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  UtensilsCrossed, Wine, Ticket, Landmark, Compass, Trophy,
  GraduationCap, Scissors, Sparkles, Leaf, Heart,
};

const STEPS = ["Category", "Details", "Specifics"];

const LEBANESE_CITIES = ["Beirut", "Jounieh", "Byblos", "Tripoli", "Sidon", "Batroun", "Broummana", "Zahle", "Baalbek", "Faraya", "Tyre", "Nabatieh"];

// ─── Reusable form components ──────────────────────────

function MultiSelect({ label, options, value, onChange }: {
  label: string; options: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (item: string) =>
    onChange(value.includes(item) ? value.filter((i) => i !== item) : [...value, item]);
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="rounded-full border px-3 py-1.5 text-sm font-medium transition-all"
            style={value.includes(opt)
              ? { borderColor: "var(--color-accent)", backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }
              : { borderColor: "var(--color-surface-border)", color: "var(--color-text-secondary)" }
            }
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all"
            style={value === opt.value
              ? { borderColor: "var(--color-accent)", backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }
              : { borderColor: "var(--color-surface-border)", color: "var(--color-text-secondary)" }
            }
          >{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{ backgroundColor: value ? "var(--color-accent)" : "var(--color-surface-border)" }}
      >
        <span className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? "translateX(24px)" : "translateX(4px)" }} />
      </button>
    </div>
  );
}

// ─── Category-specific Step 3 forms ───────────────────

function CategorySpecificFields({ category, fields, setFields }: {
  category: BusinessCategory;
  fields: Record<string, unknown>;
  setFields: (f: Record<string, unknown>) => void;
}) {
  const set = (key: string, val: unknown) => setFields({ ...fields, [key]: val });

  switch (category) {
    case "FOOD":
      return (
        <div className="space-y-5">
          <MultiSelect label="Cuisine Types *" value={(fields.cuisineTypes as string[]) || []}
            onChange={(v) => set("cuisineTypes", v)}
            options={["Lebanese", "Italian", "Japanese", "French", "American", "Mexican", "Indian", "Chinese", "Sushi", "Seafood", "Burger", "Pizza", "Mediterranean"]} />
          <RadioGroup label="Dining Style *" value={(fields.diningStyle as string) || ""}
            onChange={(v) => set("diningStyle", v)}
            options={[{ value: "casual", label: "Casual" }, { value: "fine_dining", label: "Fine Dining" }, { value: "fast_casual", label: "Fast Casual" }, { value: "cafe", label: "Café" }]} />
          <RadioGroup label="Price Range *" value={(fields.priceRange as string) || ""}
            onChange={(v) => set("priceRange", v)}
            options={[{ value: "$", label: "$" }, { value: "$$", label: "$$" }, { value: "$$$", label: "$$$" }, { value: "$$$$", label: "$$$$" }]} />
          <Toggle label="Outdoor Seating" value={!!(fields.hasOutdoorSeating)} onChange={(v) => set("hasOutdoorSeating", v)} />
          <Toggle label="Delivery Available" value={!!(fields.hasDelivery)} onChange={(v) => set("hasDelivery", v)} />
        </div>
      );

    case "NIGHTLIFE":
      return (
        <div className="space-y-5">
          <RadioGroup label="Venue Type *" value={(fields.venueType as string) || ""}
            onChange={(v) => set("venueType", v)}
            options={["bar", "club", "lounge", "pub", "rooftop"].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))} />
          <MultiSelect label="Music Genre *" value={(fields.musicGenre as string[]) || []}
            onChange={(v) => set("musicGenre", v)}
            options={["House", "Techno", "Hip-Hop", "R&B", "Arabic", "Latin", "Live Band", "DJ", "Mixed"]} />
          <RadioGroup label="Dress Code *" value={(fields.dressCode as string) || ""}
            onChange={(v) => set("dressCode", v)}
            options={[{ value: "casual", label: "Casual" }, { value: "smart_casual", label: "Smart Casual" }, { value: "formal", label: "Formal" }, { value: "none", label: "None" }]} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Age Restriction *</label>
            <input type="number" min={18} value={(fields.ageRestriction as number) || 21}
              onChange={(e) => set("ageRestriction", parseInt(e.target.value) || 21)}
              className="field-base w-24" />
          </div>
          <Toggle label="VIP Area Available" value={!!(fields.hasVIP)} onChange={(v) => set("hasVIP", v)} />
        </div>
      );

    case "EVENTS":
      return (
        <div className="space-y-5">
          <MultiSelect label="Event Types *" value={(fields.eventTypes as string[]) || []}
            onChange={(v) => set("eventTypes", v)}
            options={["Concert", "Festival", "Exhibition", "Conference", "Party", "Workshop", "Wedding", "Comedy Show"]} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Venue Capacity *</label>
            <input type="number" min={1} value={(fields.venueCapacity as number) || ""}
              onChange={(e) => set("venueCapacity", parseInt(e.target.value) || 0)}
              className="field-base w-32" placeholder="e.g. 200" />
          </div>
          <Toggle label="Indoor" value={!!(fields.isIndoor)} onChange={(v) => set("isIndoor", v)} />
          <Toggle label="Outdoor" value={!!(fields.isOutdoor)} onChange={(v) => set("isOutdoor", v)} />
        </div>
      );

    case "ATTRACTIONS_TOURISM":
      return (
        <div className="space-y-5">
          <MultiSelect label="Attraction Type *" value={(fields.attractionType as string[]) || []}
            onChange={(v) => set("attractionType", v)}
            options={["Historical", "Natural", "Cultural", "Adventure", "Religious", "Architectural"]} />
          <RadioGroup label="Tour Duration *" value={(fields.tourDuration as string) || ""}
            onChange={(v) => set("tourDuration", v)}
            options={["1 hour", "2 hours", "Half day", "Full day", "Multi-day"].map((v) => ({ value: v, label: v }))} />
          <MultiSelect label="Languages *" value={(fields.languages as string[]) || []}
            onChange={(v) => set("languages", v)}
            options={["English", "Arabic", "French", "Spanish", "German"]} />
          <Toggle label="Wheelchair Accessible" value={!!(fields.accessibility)} onChange={(v) => set("accessibility", v)} />
        </div>
      );

    case "ACTIVITIES_EXPERIENCES":
      return (
        <div className="space-y-5">
          <MultiSelect label="Activity Types *" value={(fields.activityTypes as string[]) || []}
            onChange={(v) => set("activityTypes", v)}
            options={["Hiking", "Kayaking", "Paintball", "Escape Room", "Cooking Class", "Wine Tasting", "Paragliding", "Zip-lining", "ATV", "Camping", "Canyoning"]} />
          <RadioGroup label="Difficulty Level *" value={(fields.difficultyLevel as string) || ""}
            onChange={(v) => set("difficultyLevel", v)}
            options={[{ value: "easy", label: "Easy" }, { value: "moderate", label: "Moderate" }, { value: "hard", label: "Hard" }]} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Min Group Size *</label>
              <input type="number" min={1} value={(fields.groupSizeMin as number) || ""}
                onChange={(e) => set("groupSizeMin", parseInt(e.target.value) || 1)}
                className="field-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Max Group Size *</label>
              <input type="number" min={1} value={(fields.groupSizeMax as number) || ""}
                onChange={(e) => set("groupSizeMax", parseInt(e.target.value) || 10)}
                className="field-base" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Minimum Age</label>
            <input type="number" min={0} value={(fields.ageRequirement as number) || 0}
              onChange={(e) => set("ageRequirement", parseInt(e.target.value) || 0)}
              className="field-base w-24" />
          </div>
        </div>
      );

    case "COURTS_SPORTS":
      return (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Number of Courts *</label>
            <input type="number" min={1} value={(fields.courtCount as number) || 1}
              onChange={(e) => set("courtCount", parseInt(e.target.value) || 1)}
              className="field-base w-24" />
          </div>
          <MultiSelect label="Sport Types *" value={(fields.sportTypes as string[]) || []}
            onChange={(v) => set("sportTypes", v)}
            options={["Padel", "Tennis", "Basketball", "Football", "Squash", "Volleyball", "Badminton", "Table Tennis"]} />
          <RadioGroup label="Surface Type *" value={(fields.surfaceType as string) || ""}
            onChange={(v) => set("surfaceType", v)}
            options={["Hard Court", "Clay", "Grass", "Artificial Turf", "Indoor Wood", "Concrete"].map((v) => ({ value: v, label: v }))} />
          <Toggle label="Indoor Facility" value={!!(fields.isIndoor)} onChange={(v) => set("isIndoor", v)} />
        </div>
      );

    case "STUDIOS_CLASSES":
      return (
        <div className="space-y-5">
          <MultiSelect label="Class Types *" value={(fields.classTypes as string[]) || []}
            onChange={(v) => set("classTypes", v)}
            options={["Yoga", "Pilates", "Dance", "Art", "Music", "Cooking", "Pottery", "Photography", "Martial Arts", "CrossFit"]} />
          <RadioGroup label="Skill Level *" value={(fields.skillLevel as string) || ""}
            onChange={(v) => set("skillLevel", v)}
            options={[{ value: "beginner", label: "Beginner" }, { value: "intermediate", label: "Intermediate" }, { value: "advanced", label: "Advanced" }, { value: "all_levels", label: "All Levels" }]} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Max Class Size *</label>
            <input type="number" min={1} value={(fields.maxClassSize as number) || ""}
              onChange={(e) => set("maxClassSize", parseInt(e.target.value) || 10)}
              className="field-base w-24" />
          </div>
          <Toggle label="Equipment Provided" value={!!(fields.providesEquipment)} onChange={(v) => set("providesEquipment", v)} />
        </div>
      );

    case "MEN_CARE":
      return (
        <div className="space-y-5">
          <MultiSelect label="Specialties *" value={(fields.specialties as string[]) || []}
            onChange={(v) => set("specialties", v)}
            options={["Haircut", "Beard Trim", "Shave", "Facial", "Hair Coloring", "Scalp Treatment", "Eyebrow Grooming"]} />
          <Toggle label="Walk-ins Accepted" value={!!(fields.walkInsAccepted)} onChange={(v) => set("walkInsAccepted", v)} />
        </div>
      );

    case "WOMEN_CARE":
      return (
        <div className="space-y-5">
          <MultiSelect label="Specialties *" value={(fields.specialties as string[]) || []}
            onChange={(v) => set("specialties", v)}
            options={["Haircut", "Coloring", "Blowout", "Nails", "Facial", "Waxing", "Lashes", "Brows", "Makeup", "Keratin Treatment"]} />
          <RadioGroup label="Gender Focus *" value={(fields.genderFocus as string) || ""}
            onChange={(v) => set("genderFocus", v)}
            options={[{ value: "women_only", label: "Women Only" }, { value: "unisex", label: "Unisex" }]} />
        </div>
      );

    case "WELLNESS":
      return (
        <div className="space-y-5">
          <MultiSelect label="Wellness Types *" value={(fields.wellnessTypes as string[]) || []}
            onChange={(v) => set("wellnessTypes", v)}
            options={["Massage", "Spa", "Sauna", "Hammam", "Reflexology", "Aromatherapy", "Hot Stone", "Body Wrap"]} />
          <Toggle label="Has Swimming Pool" value={!!(fields.hasPool)} onChange={(v) => set("hasPool", v)} />
          <Toggle label="Has Sauna" value={!!(fields.hasSauna)} onChange={(v) => set("hasSauna", v)} />
          <Toggle label="Couples Treatments Available" value={!!(fields.couplesAvailable)} onChange={(v) => set("couplesAvailable", v)} />
        </div>
      );

    case "HEALTH_CARE":
      return (
        <div className="space-y-5">
          <MultiSelect label="Health Services *" value={(fields.healthServices as string[]) || []}
            onChange={(v) => set("healthServices", v)}
            options={["Physiotherapy", "Chiropractic", "Dental", "Dermatology", "Nutrition", "Psychology", "General Checkup", "Lab Tests"]} />
          <Toggle label="Accepts Insurance" value={!!(fields.acceptsInsurance)} onChange={(v) => set("acceptsInsurance", v)} />
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">License Number</label>
            <input type="text" value={(fields.licenseNumber as string) || ""}
              onChange={(e) => set("licenseNumber", e.target.value)}
              className="field-base" placeholder="e.g. LB-PHYS-2041" />
          </div>
        </div>
      );

    default:
      return null;
  }
}

// ─── Main Component ────────────────────────────────────

export default function CreateBusinessPage() {
  const router = useRouter();
  const createBusiness = useCreateBusiness();
  const uploadImage = useUploadImage();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<BusinessCategory | "">("");

  // Step 2 — common fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Step 3 — category-specific fields (dynamic)
  const [extraFields, setExtraFields] = useState<Record<string, unknown>>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage.mutateAsync(file);
      setImages((prev) => [...prev, result.url]);
    } catch {
      toast.error("Image upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    try {
      const business = await createBusiness.mutateAsync({
        name, category, description, phone, address, city, images, extraFields,
      });
      toast.success("Business created!");
      router.push(`/dashboard?created=${business.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create business");
    }
  };

  const categories = Object.entries(CATEGORY_CONFIG) as [BusinessCategory, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][];

  return (
    <div className="py-10 px-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-10 flex items-center justify-center gap-0">
        {STEPS.map((label, i) => {
          const s = i + 1;
          const isActive = s === step;
          const isDone = s < step;
          return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
                  style={isDone ? { backgroundColor: "var(--color-success)", color: "white" }
                    : isActive ? { backgroundColor: "var(--color-accent)", color: "white" }
                    : { backgroundColor: "var(--color-surface-dim)", color: "var(--color-text-secondary)" }
                  }
                >
                  {isDone ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className="mt-1 text-xs font-medium" style={{ color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)" }}>{label}</span>
              </div>
              {s < STEPS.length && (
                <div className="h-0.5 w-16 mx-2 mb-4" style={{ backgroundColor: s < step ? "var(--color-success)" : "var(--color-surface-border)" }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-surface-border">

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">What type of business?</h1>
            <p className="text-sm text-text-secondary mb-6">Choose the category that best fits your business.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map(([cat, cfg]) => {
                const Icon = ICON_MAP[cfg.icon] ?? Trophy;
                return (
                  <button key={cat} type="button" onClick={() => setCategory(cat)}
                    className="rounded-xl border-2 p-4 text-left transition-all"
                    style={category === cat
                      ? { borderColor: "var(--color-accent)", backgroundColor: "var(--color-accent-soft)" }
                      : { borderColor: "var(--color-surface-border)" }
                    }
                  >
                    <Icon className="w-6 h-6 mb-2" style={{ color: category === cat ? "var(--color-accent)" : "var(--color-text-secondary)" }} />
                    <div className="text-sm font-semibold text-text-primary leading-tight">{cfg.displayName}</div>
                    <div className="text-xs text-text-secondary mt-0.5 leading-tight">{cfg.subtitle}</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => category && setStep(2)} disabled={!category} className="btn-primary px-6 py-2.5">Continue</button>
            </div>
          </div>
        )}

        {/* Step 2: Common Fields */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Business Details</h1>
            <p className="text-sm text-text-secondary mb-6">Tell us about your business.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Business Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="field-base" placeholder="e.g. Beirut Padel Club" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="field-base" placeholder="Describe your business…" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="field-base" placeholder="+961 XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">City *</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="field-base">
                    <option value="">Select city…</option>
                    {LEBANESE_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Address *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="field-base" placeholder="Street address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Photos</label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {images.map((url, i) => (
                    <div key={i} className="relative h-20 w-20 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full rounded-xl object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: "var(--color-error)" }}
                      ><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors" style={{ borderColor: "var(--color-surface-border)", color: "var(--color-text-secondary)" }}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    {uploading ? <span className="text-xs animate-pulse">…</span> : <><Plus className="w-5 h-5" /><span className="text-xs">Add</span></>}
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary px-6 py-2.5">Back</button>
              <button onClick={() => {
                if (!name || !phone || !address || !city) { toast.error("Please fill in all required fields"); return; }
                setStep(3);
              }} className="btn-primary px-6 py-2.5">Continue</button>
            </div>
          </div>
        )}

        {/* Step 3: Category-specific */}
        {step === 3 && category && (
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">{CATEGORY_CONFIG[category].displayName} Details</h1>
            <p className="text-sm text-text-secondary mb-6">Tell us more about your {CATEGORY_CONFIG[category].displayName.toLowerCase()} business.</p>
            <CategorySpecificFields category={category} fields={extraFields} setFields={setExtraFields} />
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary px-6 py-2.5">Back</button>
              <button onClick={() => handleSubmit()} disabled={createBusiness.isPending} className="btn-primary px-6 py-2.5">
                {createBusiness.isPending ? "Creating…" : "Create Business"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

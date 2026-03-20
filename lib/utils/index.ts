import { prisma } from "./prisma";

/**
 * Generate a URL-friendly slug from a name.
 * Appends a random suffix if the slug already exists.
 */
export async function generateSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const existing = await prisma.business.findUnique({ where: { slug: base } });
  if (!existing) return base;

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

const VALID_CATEGORIES = [
  "FOOD", "NIGHTLIFE", "EVENTS", "ATTRACTIONS_TOURISM", "ACTIVITIES_EXPERIENCES",
  "COURTS_SPORTS", "STUDIOS_CLASSES", "MEN_CARE", "WOMEN_CARE", "WELLNESS", "HEALTH_CARE",
] as const;

type ValidCategory = typeof VALID_CATEGORIES[number];

function isArray(v: unknown): v is unknown[] { return Array.isArray(v); }
function isNonEmptyArray(v: unknown): boolean { return isArray(v) && v.length > 0; }
function isString(v: unknown): v is string { return typeof v === "string" && v.length > 0; }
function isBool(v: unknown): v is boolean { return typeof v === "boolean"; }
function isNum(v: unknown): v is number { return typeof v === "number" && !isNaN(v); }

function validateByCategory(category: ValidCategory, f: Record<string, unknown>): { valid: boolean; error?: string } {
  switch (category) {
    case "FOOD":
      if (!isNonEmptyArray(f.cuisineTypes)) return { valid: false, error: "cuisineTypes must be a non-empty array" };
      if (!isString(f.diningStyle)) return { valid: false, error: "diningStyle is required" };
      if (!isBool(f.hasDelivery)) return { valid: false, error: "hasDelivery must be boolean" };
      if (!isBool(f.hasOutdoorSeating)) return { valid: false, error: "hasOutdoorSeating must be boolean" };
      if (!isString(f.priceRange)) return { valid: false, error: "priceRange is required" };
      return { valid: true };

    case "NIGHTLIFE":
      if (!isString(f.venueType)) return { valid: false, error: "venueType is required" };
      if (!isNonEmptyArray(f.musicGenre)) return { valid: false, error: "musicGenre must be a non-empty array" };
      if (!isString(f.dressCode)) return { valid: false, error: "dressCode is required" };
      if (!isNum(f.ageRestriction)) return { valid: false, error: "ageRestriction must be a number" };
      if (!isBool(f.hasVIP)) return { valid: false, error: "hasVIP must be boolean" };
      return { valid: true };

    case "EVENTS":
      if (!isNonEmptyArray(f.eventTypes)) return { valid: false, error: "eventTypes must be a non-empty array" };
      if (!isNum(f.venueCapacity) || (f.venueCapacity as number) < 1) return { valid: false, error: "venueCapacity must be a positive number" };
      if (!isBool(f.isIndoor)) return { valid: false, error: "isIndoor must be boolean" };
      if (!isBool(f.isOutdoor)) return { valid: false, error: "isOutdoor must be boolean" };
      return { valid: true };

    case "ATTRACTIONS_TOURISM":
      if (!isNonEmptyArray(f.attractionType)) return { valid: false, error: "attractionType must be a non-empty array" };
      if (!isString(f.tourDuration)) return { valid: false, error: "tourDuration is required" };
      if (!isNonEmptyArray(f.languages)) return { valid: false, error: "languages must be a non-empty array" };
      if (!isBool(f.accessibility)) return { valid: false, error: "accessibility must be boolean" };
      return { valid: true };

    case "ACTIVITIES_EXPERIENCES":
      if (!isNonEmptyArray(f.activityTypes)) return { valid: false, error: "activityTypes must be a non-empty array" };
      if (!isString(f.difficultyLevel)) return { valid: false, error: "difficultyLevel is required" };
      if (!isNum(f.groupSizeMin)) return { valid: false, error: "groupSizeMin must be a number" };
      if (!isNum(f.groupSizeMax)) return { valid: false, error: "groupSizeMax must be a number" };
      if (!isNum(f.ageRequirement)) return { valid: false, error: "ageRequirement must be a number" };
      return { valid: true };

    case "COURTS_SPORTS":
      if (!isNum(f.courtCount) || (f.courtCount as number) < 1) return { valid: false, error: "courtCount must be a positive number" };
      if (!isNonEmptyArray(f.sportTypes)) return { valid: false, error: "sportTypes must be a non-empty array" };
      if (!isString(f.surfaceType)) return { valid: false, error: "surfaceType is required" };
      if (!isBool(f.isIndoor)) return { valid: false, error: "isIndoor must be boolean" };
      return { valid: true };

    case "STUDIOS_CLASSES":
      if (!isNonEmptyArray(f.classTypes)) return { valid: false, error: "classTypes must be a non-empty array" };
      if (!isString(f.skillLevel)) return { valid: false, error: "skillLevel is required" };
      if (!isNum(f.maxClassSize) || (f.maxClassSize as number) < 1) return { valid: false, error: "maxClassSize must be a positive number" };
      if (!isBool(f.providesEquipment)) return { valid: false, error: "providesEquipment must be boolean" };
      return { valid: true };

    case "MEN_CARE":
      if (!isNonEmptyArray(f.specialties)) return { valid: false, error: "specialties must be a non-empty array" };
      if (!isBool(f.walkInsAccepted)) return { valid: false, error: "walkInsAccepted must be boolean" };
      return { valid: true };

    case "WOMEN_CARE":
      if (!isNonEmptyArray(f.specialties)) return { valid: false, error: "specialties must be a non-empty array" };
      if (!isString(f.genderFocus)) return { valid: false, error: "genderFocus is required" };
      return { valid: true };

    case "WELLNESS":
      if (!isNonEmptyArray(f.wellnessTypes)) return { valid: false, error: "wellnessTypes must be a non-empty array" };
      if (!isBool(f.hasPool)) return { valid: false, error: "hasPool must be boolean" };
      if (!isBool(f.hasSauna)) return { valid: false, error: "hasSauna must be boolean" };
      if (!isBool(f.couplesAvailable)) return { valid: false, error: "couplesAvailable must be boolean" };
      return { valid: true };

    case "HEALTH_CARE":
      if (!isNonEmptyArray(f.healthServices)) return { valid: false, error: "healthServices must be a non-empty array" };
      if (!isBool(f.acceptsInsurance)) return { valid: false, error: "acceptsInsurance must be boolean" };
      return { valid: true };
  }
}

/**
 * Validate category-specific extra fields.
 */
export function validateExtraFields(
  category: string,
  fields: unknown
): { valid: boolean; error?: string } {
  if (!VALID_CATEGORIES.includes(category as ValidCategory)) {
    return { valid: false, error: `Invalid category: ${category}` };
  }
  if (!fields || typeof fields !== "object") {
    return { valid: false, error: `extraFields is required for ${category} category` };
  }
  return validateByCategory(category as ValidCategory, fields as Record<string, unknown>);
}

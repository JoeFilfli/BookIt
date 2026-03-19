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

  const existing = await prisma.business.findUnique({
    where: { slug: base },
  });

  if (!existing) return base;

  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

/**
 * Validate SPORTS extra fields.
 */
export function validateSportsExtraFields(fields: unknown): { valid: boolean; error?: string } {
  if (!fields || typeof fields !== "object") {
    return { valid: false, error: "extraFields is required for SPORTS category" };
  }
  const f = fields as Record<string, unknown>;
  if (typeof f.courtCount !== "number" || f.courtCount < 1) {
    return { valid: false, error: "courtCount must be a positive number" };
  }
  if (!Array.isArray(f.sportTypes) || f.sportTypes.length === 0) {
    return { valid: false, error: "sportTypes must be a non-empty array" };
  }
  if (typeof f.surfaceType !== "string" || !f.surfaceType) {
    return { valid: false, error: "surfaceType is required" };
  }
  if (typeof f.indoor !== "boolean") {
    return { valid: false, error: "indoor must be a boolean" };
  }
  return { valid: true };
}

/**
 * Validate SALON extra fields.
 */
export function validateSalonExtraFields(fields: unknown): { valid: boolean; error?: string } {
  if (!fields || typeof fields !== "object") {
    return { valid: false, error: "extraFields is required for SALON category" };
  }
  const f = fields as Record<string, unknown>;
  if (!Array.isArray(f.specialties) || f.specialties.length === 0) {
    return { valid: false, error: "specialties must be a non-empty array" };
  }
  if (!["men", "women", "unisex"].includes(f.genderFocus as string)) {
    return { valid: false, error: "genderFocus must be 'men', 'women', or 'unisex'" };
  }
  return { valid: true };
}

/**
 * Validate category-specific extra fields.
 */
export function validateExtraFields(
  category: string,
  fields: unknown
): { valid: boolean; error?: string } {
  if (category === "SPORTS") return validateSportsExtraFields(fields);
  if (category === "SALON") return validateSalonExtraFields(fields);
  return { valid: false, error: "Invalid category" };
}

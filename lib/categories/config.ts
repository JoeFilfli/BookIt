import type { BusinessCategory, ResourceType } from "@/lib/types";

export interface CategoryConfig {
  displayName: string;
  slug: string;
  icon: string; // lucide-react icon name
  subtitle: string;
  defaultResourceType: ResourceType;
  resourceLabelSingular: string;
  resourceLabelPlural: string;
  resourceSectionHeading: string;
}

export const CATEGORY_CONFIG: Record<BusinessCategory, CategoryConfig> = {
  FOOD: {
    displayName: "Food",
    slug: "food",
    icon: "UtensilsCrossed",
    subtitle: "Restaurants & dining",
    defaultResourceType: "TABLE",
    resourceLabelSingular: "Table",
    resourceLabelPlural: "Tables",
    resourceSectionHeading: "Tables & Seating",
  },
  NIGHTLIFE: {
    displayName: "Nightlife",
    slug: "nightlife",
    icon: "Wine",
    subtitle: "Bars, clubs & lounges",
    defaultResourceType: "VENUE_SPACE",
    resourceLabelSingular: "Space",
    resourceLabelPlural: "Spaces",
    resourceSectionHeading: "Spaces & Areas",
  },
  EVENTS: {
    displayName: "Events",
    slug: "events",
    icon: "Ticket",
    subtitle: "Concerts, shows & festivals",
    defaultResourceType: "VENUE_SPACE",
    resourceLabelSingular: "Venue",
    resourceLabelPlural: "Venues",
    resourceSectionHeading: "Venues & Spaces",
  },
  ATTRACTIONS_TOURISM: {
    displayName: "Attractions & Tourism",
    slug: "attractions-tourism",
    icon: "Landmark",
    subtitle: "Sightseeing & tours",
    defaultResourceType: "GUIDE",
    resourceLabelSingular: "Guide",
    resourceLabelPlural: "Guides",
    resourceSectionHeading: "Tours & Guides",
  },
  ACTIVITIES_EXPERIENCES: {
    displayName: "Activities & Experiences",
    slug: "activities-experiences",
    icon: "Compass",
    subtitle: "Adventures & group outings",
    defaultResourceType: "EQUIPMENT",
    resourceLabelSingular: "Activity",
    resourceLabelPlural: "Activities",
    resourceSectionHeading: "Equipment & Groups",
  },
  COURTS_SPORTS: {
    displayName: "Courts & Sports",
    slug: "courts-sports",
    icon: "Trophy",
    subtitle: "Padel, tennis, football & more",
    defaultResourceType: "COURT",
    resourceLabelSingular: "Court",
    resourceLabelPlural: "Courts",
    resourceSectionHeading: "Courts & Fields",
  },
  STUDIOS_CLASSES: {
    displayName: "Studios & Classes",
    slug: "studios-classes",
    icon: "GraduationCap",
    subtitle: "Art, music, dance & fitness",
    defaultResourceType: "INSTRUCTOR",
    resourceLabelSingular: "Instructor",
    resourceLabelPlural: "Instructors",
    resourceSectionHeading: "Instructors & Rooms",
  },
  MEN_CARE: {
    displayName: "Men Care",
    slug: "men-care",
    icon: "Scissors",
    subtitle: "Barbershops & men's grooming",
    defaultResourceType: "STAFF",
    resourceLabelSingular: "Stylist",
    resourceLabelPlural: "Stylists",
    resourceSectionHeading: "Our Team",
  },
  WOMEN_CARE: {
    displayName: "Women Care",
    slug: "women-care",
    icon: "Sparkles",
    subtitle: "Hair, beauty & nails",
    defaultResourceType: "STAFF",
    resourceLabelSingular: "Stylist",
    resourceLabelPlural: "Stylists",
    resourceSectionHeading: "Our Team",
  },
  WELLNESS: {
    displayName: "Wellness",
    slug: "wellness",
    icon: "Leaf",
    subtitle: "Spa, massage & relaxation",
    defaultResourceType: "ROOM",
    resourceLabelSingular: "Room",
    resourceLabelPlural: "Rooms",
    resourceSectionHeading: "Rooms & Therapists",
  },
  HEALTH_CARE: {
    displayName: "Health & Care",
    slug: "health-care",
    icon: "Heart",
    subtitle: "Clinics, therapy & checkups",
    defaultResourceType: "STAFF",
    resourceLabelSingular: "Practitioner",
    resourceLabelPlural: "Practitioners",
    resourceSectionHeading: "Practitioners & Rooms",
  },
};

/** Map a URL slug to a BusinessCategory enum value. Returns null for unknown slugs. */
export function slugToCategory(slug: string): BusinessCategory | null {
  for (const [cat, cfg] of Object.entries(CATEGORY_CONFIG)) {
    if (cfg.slug === slug) return cat as BusinessCategory;
  }
  // Legacy slug support
  if (slug === "sports") return "COURTS_SPORTS";
  if (slug === "salons") return "WOMEN_CARE";
  return null;
}

/** All valid URL slugs (for route validation). */
export const ALL_CATEGORY_SLUGS = Object.values(CATEGORY_CONFIG).map((c) => c.slug);

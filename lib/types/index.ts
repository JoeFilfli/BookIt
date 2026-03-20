// ─── Enums ───────────────────────────────────────────────

export type BusinessCategory =
  | "FOOD"
  | "NIGHTLIFE"
  | "EVENTS"
  | "ATTRACTIONS_TOURISM"
  | "ACTIVITIES_EXPERIENCES"
  | "COURTS_SPORTS"
  | "STUDIOS_CLASSES"
  | "MEN_CARE"
  | "WOMEN_CARE"
  | "WELLNESS"
  | "HEALTH_CARE";

export type ResourceType =
  | "COURT"
  | "STAFF"
  | "ROOM"
  | "TABLE"
  | "VENUE_SPACE"
  | "INSTRUCTOR"
  | "GUIDE"
  | "EQUIPMENT";

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";

// ─── User ────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: string | null;
  phone: string | null;
  avatarUrl: string | null;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Business Extra Fields ────────────────────────────────

export interface FoodExtraFields {
  cuisineTypes: string[];
  diningStyle: "casual" | "fine_dining" | "fast_casual" | "cafe";
  hasDelivery: boolean;
  hasOutdoorSeating: boolean;
  priceRange: "$" | "$$" | "$$$" | "$$$$";
}

export interface NightlifeExtraFields {
  venueType: "bar" | "club" | "lounge" | "pub" | "rooftop";
  musicGenre: string[];
  dressCode: "casual" | "smart_casual" | "formal" | "none";
  ageRestriction: number;
  hasVIP: boolean;
}

export interface EventsExtraFields {
  eventTypes: string[];
  venueCapacity: number;
  isIndoor: boolean;
  isOutdoor: boolean;
}

export interface AttractionsTourismExtraFields {
  attractionType: string[];
  tourDuration: string;
  languages: string[];
  accessibility: boolean;
}

export interface ActivitiesExperiencesExtraFields {
  activityTypes: string[];
  difficultyLevel: "easy" | "moderate" | "hard";
  groupSizeMin: number;
  groupSizeMax: number;
  ageRequirement: number;
}

export interface CourtsSportsExtraFields {
  courtCount: number;
  sportTypes: string[];
  surfaceType: string;
  isIndoor: boolean;
}

export interface StudiosClassesExtraFields {
  classTypes: string[];
  skillLevel: "beginner" | "intermediate" | "advanced" | "all_levels";
  maxClassSize: number;
  providesEquipment: boolean;
}

export interface MenCareExtraFields {
  specialties: string[];
  walkInsAccepted: boolean;
}

export interface WomenCareExtraFields {
  specialties: string[];
  genderFocus: "women_only" | "unisex";
}

export interface WellnessExtraFields {
  wellnessTypes: string[];
  hasPool: boolean;
  hasSauna: boolean;
  couplesAvailable: boolean;
}

export interface HealthCareExtraFields {
  healthServices: string[];
  acceptsInsurance: boolean;
  licenseNumber: string;
}

export type AnyExtraFields =
  | FoodExtraFields
  | NightlifeExtraFields
  | EventsExtraFields
  | AttractionsTourismExtraFields
  | ActivitiesExperiencesExtraFields
  | CourtsSportsExtraFields
  | StudiosClassesExtraFields
  | MenCareExtraFields
  | WomenCareExtraFields
  | WellnessExtraFields
  | HealthCareExtraFields;

// ─── Business ────────────────────────────────────────────

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  description: string | null;
  phone: string;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  extraFields: AnyExtraFields | null;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessWithRelations extends Business {
  owner: Pick<User, "id" | "name" | "avatarUrl">;
  resources: Resource[];
  services: Service[];
  reviews: Review[];
  _count?: {
    reviews: number;
  };
  averageRating?: number;
}

// ─── Resource ────────────────────────────────────────────

export interface Resource {
  id: string;
  businessId: string;
  name: string;
  type: ResourceType;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceWithSchedules extends Resource {
  schedules: ResourceSchedule[];
}

// ─── Service ─────────────────────────────────────────────

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string; // Decimal serialized as string
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// ─── ResourceSchedule ────────────────────────────────────

export interface ResourceSchedule {
  id: string;
  resourceId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// ─── Booking ─────────────────────────────────────────────

export interface Booking {
  id: string;
  userId: string;
  resourceId: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: string; // Decimal serialized as string
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithRelations extends Booking {
  user: Pick<User, "id" | "name" | "email">;
  resource: Pick<Resource, "id" | "name" | "type">;
  service: Pick<Service, "id" | "name" | "durationMinutes" | "price">;
  review?: Review | null;
}

// ─── Review ──────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  businessId: string;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithUser extends Review {
  user: Pick<User, "id" | "name" | "avatarUrl">;
}

// ─── API Types ───────────────────────────────────────────

export interface AvailableSlot {
  startTime: string;
  endTime: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

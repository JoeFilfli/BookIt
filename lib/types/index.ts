// ─── Enums ───────────────────────────────────────────────

export type BusinessCategory = "SPORTS" | "SALON";

export type ResourceType = "COURT" | "STAFF" | "ROOM";

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

// ─── Business ────────────────────────────────────────────

export interface SportsExtraFields {
  courtCount: number;
  sportTypes: string[];
  surfaceType: string;
  indoor: boolean;
}

export interface SalonExtraFields {
  specialties: string[];
  genderFocus: "men" | "women" | "unisex";
}

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
  extraFields: SportsExtraFields | SalonExtraFields | null;
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

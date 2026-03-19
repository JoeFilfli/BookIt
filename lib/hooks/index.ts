"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Businesses ─────────────────────────────────────────

interface BusinessFilters {
  category?: string;
  city?: string;
  search?: string;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useBusinesses(filters: BusinessFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["businesses", filters],
    queryFn: async () => {
      const res = await fetch(`/api/businesses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch businesses");
      return res.json();
    },
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create business");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/businesses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update business");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json() as Promise<{ url: string }>;
    },
  });
}

// ─── Services ───────────────────────────────────────────

export function useServices(businessId: string) {
  return useQuery({
    queryKey: ["services", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${businessId}/services`);
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
    enabled: !!businessId,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      data,
    }: {
      businessId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/businesses/${businessId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create service");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", variables.businessId],
      });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      serviceId,
      data,
    }: {
      businessId: string;
      serviceId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(
        `/api/businesses/${businessId}/services/${serviceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update service");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", variables.businessId],
      });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      serviceId,
    }: {
      businessId: string;
      serviceId: string;
    }) => {
      const res = await fetch(
        `/api/businesses/${businessId}/services/${serviceId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete service");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["services", variables.businessId],
      });
    },
  });
}

// ─── Resources ──────────────────────────────────────────

export function useResources(businessId: string) {
  return useQuery({
    queryKey: ["resources", businessId],
    queryFn: async () => {
      const res = await fetch(`/api/businesses/${businessId}/resources`);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json();
    },
    enabled: !!businessId,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      data,
    }: {
      businessId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/businesses/${businessId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create resource");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.businessId],
      });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      resourceId,
      data,
    }: {
      businessId: string;
      resourceId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(
        `/api/businesses/${businessId}/resources/${resourceId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update resource");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.businessId],
      });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      resourceId,
    }: {
      businessId: string;
      resourceId: string;
    }) => {
      const res = await fetch(
        `/api/businesses/${businessId}/resources/${resourceId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete resource");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["resources", variables.businessId],
      });
    },
  });
}

// ─── Schedules ──────────────────────────────────────────

export function useSchedules(resourceId: string) {
  return useQuery({
    queryKey: ["schedules", resourceId],
    queryFn: async () => {
      const res = await fetch(`/api/resources/${resourceId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch schedules");
      return res.json();
    },
    enabled: !!resourceId,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      data,
    }: {
      resourceId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/resources/${resourceId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create schedule");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.resourceId],
      });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      scheduleId,
      data,
    }: {
      resourceId: string;
      scheduleId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(
        `/api/resources/${resourceId}/schedules/${scheduleId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update schedule");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.resourceId],
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      scheduleId,
    }: {
      resourceId: string;
      scheduleId: string;
    }) => {
      const res = await fetch(
        `/api/resources/${resourceId}/schedules/${scheduleId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete schedule");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["schedules", variables.resourceId],
      });
    },
  });
}

// ─── Service Schedules ──────────────────────────────────

export function useServiceSchedules(serviceId: string) {
  return useQuery({
    queryKey: ["service-schedules", serviceId],
    queryFn: async () => {
      const res = await fetch(`/api/services/${serviceId}/schedules`);
      if (!res.ok) throw new Error("Failed to fetch service schedules");
      return res.json();
    },
    enabled: !!serviceId,
  });
}

export function useCreateServiceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      data,
    }: {
      serviceId: string;
      data: Record<string, unknown>;
    }) => {
      const res = await fetch(`/api/services/${serviceId}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create service schedule");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-schedules", variables.serviceId],
      });
    },
  });
}

export function useDeleteServiceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      scheduleId,
    }: {
      serviceId: string;
      scheduleId: string;
    }) => {
      const res = await fetch(
        `/api/services/${serviceId}/schedules/${scheduleId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete service schedule");
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["service-schedules", variables.serviceId],
      });
    },
  });
}

// ─── Availability ───────────────────────────────────────

export function useAvailableSlots(
  businessId: string,
  resourceId: string,
  serviceId: string,
  date: string
) {
  return useQuery({
    queryKey: ["availability", businessId, resourceId, serviceId, date],
    queryFn: async () => {
      const params = new URLSearchParams({ resourceId, serviceId, date });
      const res = await fetch(
        `/api/businesses/${businessId}/availability?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json() as Promise<{
        slots: { startTime: string; endTime: string }[];
      }>;
    },
    enabled: !!businessId && !!resourceId && !!serviceId && !!date,
  });
}

// ─── Bookings ───────────────────────────────────────────

interface BookingFilters {
  status?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}

export function useUserBookings(filters: BookingFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.upcoming !== undefined) params.set("upcoming", String(filters.upcoming));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["user-bookings", filters],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
  });
}

interface BusinessBookingFilters {
  status?: string;
  date?: string;
  resourceId?: string;
  page?: number;
  limit?: number;
}

export function useBusinessBookings(businessId: string, filters: BusinessBookingFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.date) params.set("date", filters.date);
  if (filters.resourceId) params.set("resourceId", filters.resourceId);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["business-bookings", businessId, filters],
    queryFn: async () => {
      const res = await fetch(
        `/api/bookings/business/${businessId}?${params.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch business bookings");
      return res.json();
    },
    enabled: !!businessId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      resourceId: string;
      serviceId: string;
      date: string;
      startTime: string;
    }) => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        const error = new Error(err.error || "Failed to create booking") as Error & { status: number };
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to cancel booking");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to mark booking as complete");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-bookings"] });
    },
  });
}

// ─── Reviews ────────────────────────────────────────────

export function useBusinessReviews(businessId: string, page = 1) {
  return useQuery({
    queryKey: ["reviews", businessId, page],
    queryFn: async () => {
      const res = await fetch(
        `/api/businesses/${businessId}/reviews?page=${page}&limit=10`
      );
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!businessId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bookingId: string;
      rating: number;
      comment?: string;
    }) => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
    },
  });
}

"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useBusinessBySlug, useAvailableSlots, useCreateBooking, useBusinessReviews } from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { BusinessProfileSkeleton, SlotsSkeleton } from "@/app/components/Skeletons";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type BookingStep = "service" | "resource" | "date" | "time" | "review" | "confirmed";

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const { data: business, isLoading, error } = useBusinessBySlug(slug);

  // Booking panel state
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Record<string, unknown> | null>(null);

  const [reviewsPage, setReviewsPage] = useState(1);
  const { data: reviewsData } = useBusinessReviews(business?.id || "", reviewsPage);

  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    business?.id || "",
    selectedResourceId,
    selectedServiceId,
    selectedDate
  );

  const createBooking = useCreateBooking();

  if (isLoading) {
    return <BusinessProfileSkeleton />;
  }

  if (error || !business) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Business not found
          </h1>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Derive operating hours from resource schedules
  const allSchedules = business.resources?.flatMap(
    (r: { schedules: { dayOfWeek: number; startTime: string; endTime: string }[] }) => r.schedules
  ) || [];
  const hoursByDay: Record<number, { start: string; end: string }> = {};
  for (const s of allSchedules) {
    if (
      !hoursByDay[s.dayOfWeek] ||
      s.startTime < hoursByDay[s.dayOfWeek].start
    ) {
      hoursByDay[s.dayOfWeek] = {
        start: s.startTime,
        end: hoursByDay[s.dayOfWeek]?.end > s.endTime ? hoursByDay[s.dayOfWeek].end : s.endTime,
      };
    }
    if (s.endTime > hoursByDay[s.dayOfWeek].end) {
      hoursByDay[s.dayOfWeek] = { ...hoursByDay[s.dayOfWeek], end: s.endTime };
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-gray-200">
        {business.images?.length > 0 ? (
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-h-96 overflow-hidden">
              {business.images.slice(0, 3).map((url: string, i: number) => (
                <div
                  key={i}
                  className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}
                >
                  <img
                    src={url}
                    alt={`${business.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl flex items-center justify-center h-48 text-6xl text-gray-400">
            {business.category === "SPORTS" ? "\u26BD" : "\u2702\uFE0F"}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Business Info */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <p className="mt-1 text-gray-500">
                    {business.address}, {business.city}
                  </p>
                </div>
                {business.averageRating > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <StarRating rating={business.averageRating} size="lg" />
                      <span className="text-lg font-semibold">
                        {business.averageRating}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {business.reviewCount} reviews
                    </p>
                  </div>
                )}
              </div>
              {business.description && (
                <p className="mt-4 text-gray-600">{business.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>Phone: {business.phone}</span>
                {business.owner && (
                  <span>By {business.owner.name}</span>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            {Object.keys(hoursByDay).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Operating Hours
                </h2>
                <div className="mt-4 space-y-2">
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className="flex justify-between text-sm py-1 border-b border-gray-100"
                    >
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900">
                        {hoursByDay[i]
                          ? `${hoursByDay[i].start} - ${hoursByDay[i].end}`
                          : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {business.services?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Services
                </h2>
                <div className="mt-4 space-y-3">
                  {business.services.map(
                    (service: {
                      id: string;
                      name: string;
                      description: string | null;
                      durationMinutes: number;
                      price: string;
                      currency: string;
                    }) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-sm text-gray-500">
                              {service.description}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-gray-400">
                            {service.durationMinutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${Number(service.price).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {service.currency}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Resources */}
            {business.resources?.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {business.category === "SPORTS" ? "Courts & Facilities" : "Our Team"}
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.resources.map(
                    (resource: {
                      id: string;
                      name: string;
                      type: string;
                      description: string | null;
                      imageUrl: string | null;
                    }) => (
                      <div
                        key={resource.id}
                        className="rounded-lg bg-white p-4 shadow-sm"
                      >
                        {resource.imageUrl && (
                          <img
                            src={resource.imageUrl}
                            alt={resource.name}
                            className="h-32 w-full rounded-lg object-cover"
                          />
                        )}
                        <h3 className="mt-2 font-medium text-gray-900">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {resource.type.toLowerCase()}
                        </p>
                        {resource.description && (
                          <p className="mt-1 text-sm text-gray-400">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                {reviewsData?.totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={reviewsData.averageRating} size="sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {reviewsData.averageRating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({reviewsData.totalReviews})
                    </span>
                  </div>
                )}
              </div>

              {!reviewsData || reviewsData.data?.length === 0 ? (
                <p className="mt-4 text-gray-500">No reviews yet</p>
              ) : (
                <>
                  <div className="mt-4 space-y-4">
                    {reviewsData.data.map(
                      (review: {
                        id: string;
                        rating: number;
                        comment: string | null;
                        createdAt: string;
                        user: { id: string; name: string; avatarUrl: string | null };
                      }) => (
                        <div key={review.id} className="rounded-lg bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                              {review.user.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.user.name}
                              </p>
                              <StarRating rating={review.rating} />
                            </div>
                            <span className="ml-auto text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-3 text-sm text-gray-600">{review.comment}</p>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Pagination */}
                  {reviewsData.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                        disabled={reviewsPage === 1}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {reviewsPage} of {reviewsData.totalPages}
                      </span>
                      <button
                        onClick={() => setReviewsPage((p) => Math.min(reviewsData.totalPages, p + 1))}
                        disabled={reviewsPage === reviewsData.totalPages}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Book Now</h2>

              {!session ? (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">Sign in to book</p>
                  <Link
                    href={`/login?callbackUrl=/business/${slug}`}
                    className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-blue-700"
                  >
                    Sign In to Book
                  </Link>
                </div>
              ) : confirmedBooking ? (
                <div className="mt-4">
                  <div className="rounded-lg bg-green-50 p-4 text-center">
                    <p className="text-green-700 font-medium">Booking Confirmed!</p>
                    <p className="mt-2 text-sm text-green-600">
                      {(confirmedBooking.service as { name: string })?.name} on{" "}
                      {selectedDate} at {selectedSlot?.startTime}
                    </p>
                  </div>
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Please cancel at least 2 hours in advance so others can book.
                  </p>
                  <Link
                    href="/bookings"
                    className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 text-center hover:bg-gray-50"
                  >
                    View My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      setConfirmedBooking(null);
                      setStep("service");
                      setSelectedServiceId("");
                      setSelectedResourceId("");
                      setSelectedDate("");
                      setSelectedSlot(null);
                      setBookingError("");
                    }}
                    className="mt-2 block w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white text-center hover:bg-blue-700"
                  >
                    Book Another
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {bookingError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {bookingError}
                      {bookingError.includes("no longer available") && (
                        <button
                          onClick={() => { setBookingError(""); setSelectedSlot(null); refetchSlots(); setStep("time"); }}
                          className="mt-1 block text-red-600 underline"
                        >
                          Choose another time
                        </button>
                      )}
                    </div>
                  )}

                  {/* Step 1: Service */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      1. Service
                    </p>
                    {step === "service" ? (
                      <div className="space-y-2">
                        {business.services?.map((s: { id: string; name: string; durationMinutes: number; price: string; currency: string }) => (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedServiceId(s.id); setStep("resource"); }}
                            className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">{s.name}</span>
                            <span className="text-sm text-gray-500">{s.durationMinutes}min · ${Number(s.price).toFixed(0)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                        <span className="text-sm font-medium text-blue-900">
                          {business.services?.find((s: { id: string; name: string }) => s.id === selectedServiceId)?.name}
                        </span>
                        <button onClick={() => { setStep("service"); setSelectedResourceId(""); setSelectedDate(""); setSelectedSlot(null); }} className="text-xs text-blue-600 hover:text-blue-700">Change</button>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Resource */}
                  {(step === "resource" || (selectedResourceId && step !== "service")) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        2. {business.category === "SPORTS" ? "Court" : "Staff"}
                      </p>
                      {step === "resource" ? (
                        <div className="space-y-2">
                          {business.resources?.map((r: { id: string; name: string; description: string | null }) => (
                            <button
                              key={r.id}
                              onClick={() => { setSelectedResourceId(r.id); setStep("date"); }}
                              className="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-900">{r.name}</span>
                              {r.description && <span className="text-xs text-gray-400">{r.description}</span>}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                          <span className="text-sm font-medium text-blue-900">
                            {business.resources?.find((r: { id: string; name: string }) => r.id === selectedResourceId)?.name}
                          </span>
                          <button onClick={() => { setStep("resource"); setSelectedDate(""); setSelectedSlot(null); }} className="text-xs text-blue-600 hover:text-blue-700">Change</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Date */}
                  {(step === "date" || (selectedDate && step !== "service" && step !== "resource")) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">3. Date</p>
                      {step === "date" ? (
                        <input
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          value={selectedDate}
                          onChange={(e) => { setSelectedDate(e.target.value); if (e.target.value) setStep("time"); }}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                          <span className="text-sm font-medium text-blue-900">{selectedDate}</span>
                          <button onClick={() => { setStep("date"); setSelectedSlot(null); }} className="text-xs text-blue-600 hover:text-blue-700">Change</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 4: Time */}
                  {(step === "time" || (selectedSlot && step === "review")) && selectedDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">4. Time</p>
                      {step === "time" ? (
                        slotsLoading ? (
                          <SlotsSkeleton />
                        ) : !slotsData?.slots?.length ? (
                          <p className="text-sm text-gray-500">No available slots for this date.</p>
                        ) : (
                          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                            {slotsData.slots.map((slot: { startTime: string; endTime: string }) => (
                              <button
                                key={slot.startTime}
                                onClick={() => { setSelectedSlot(slot); setStep("review"); }}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                {slot.startTime}
                              </button>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                          <span className="text-sm font-medium text-blue-900">{selectedSlot?.startTime} – {selectedSlot?.endTime}</span>
                          <button onClick={() => { setStep("time"); setSelectedSlot(null); }} className="text-xs text-blue-600 hover:text-blue-700">Change</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Review & Confirm */}
                  {step === "review" && selectedSlot && (
                    <div className="border-t pt-4">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Summary</p>
                      <div className="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Service</span>
                          <span className="font-medium">{business.services?.find((s: { id: string; name: string }) => s.id === selectedServiceId)?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{business.category === "SPORTS" ? "Court" : "Staff"}</span>
                          <span className="font-medium">{business.resources?.find((r: { id: string; name: string }) => r.id === selectedResourceId)?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date</span>
                          <span className="font-medium">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Time</span>
                          <span className="font-medium">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 mt-1">
                          <span className="text-gray-500">Total</span>
                          <span className="font-semibold text-gray-900">
                            ${Number(business.services?.find((s: { id: string; price: string }) => s.id === selectedServiceId)?.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setBookingError("");
                          try {
                            const result = await createBooking.mutateAsync({
                              resourceId: selectedResourceId,
                              serviceId: selectedServiceId,
                              date: selectedDate,
                              startTime: selectedSlot.startTime,
                            });
                            setConfirmedBooking(result);
                            setStep("confirmed");
                            toast.success("Booking confirmed!");
                          } catch (err) {
                            const e = err as Error & { status?: number };
                            if (e.status === 409) {
                              setBookingError("This slot was just booked by someone else. Please choose another time.");
                              toast.error("Slot no longer available — please choose another time.");
                              refetchSlots();
                              setStep("time");
                              setSelectedSlot(null);
                            } else {
                              setBookingError(e.message || "Something went wrong");
                              toast.error(e.message || "Booking failed");
                            }
                          }
                        }}
                        disabled={createBooking.isPending}
                        className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

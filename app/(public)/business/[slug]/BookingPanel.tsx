"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { useAvailableSlots, useCreateBooking } from "@/lib/hooks";
import { SlotsSkeleton } from "@/app/components/Skeletons";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  price: string;
  currency: string;
};

type Resource = {
  id: string;
  name: string;
  description: string | null;
};

type BookingPanelProps = {
  businessId: string;
  businessSlug: string;
  businessCategory: string;
  services: Service[];
  resources: Resource[];
};

type BookingStep = "service" | "resource" | "date" | "time" | "review" | "confirmed";

export default function BookingPanel({
  businessId,
  businessSlug,
  businessCategory,
  services,
  resources,
}: BookingPanelProps) {
  const { data: session } = useSession();

  const [step, setStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [bookingError, setBookingError] = useState("");
  const [confirmedBooking, setConfirmedBooking] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } =
    useAvailableSlots(businessId, selectedResourceId, selectedServiceId, selectedDate);

  const createBooking = useCreateBooking();

  return (
    <div className="w-full lg:w-96 shrink-0">
      <div className="sticky top-8 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Book Now</h2>

        {!session ? (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-3">Sign in to book</p>
            <Link
              href={`/login?callbackUrl=/business/${businessSlug}`}
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
                    onClick={() => {
                      setBookingError("");
                      setSelectedSlot(null);
                      refetchSlots();
                      setStep("time");
                    }}
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
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedServiceId(s.id);
                        setStep("resource");
                      }}
                      className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {s.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {s.durationMinutes}min · ${Number(s.price).toFixed(0)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                  <span className="text-sm font-medium text-blue-900">
                    {services.find((s) => s.id === selectedServiceId)?.name}
                  </span>
                  <button
                    onClick={() => {
                      setStep("service");
                      setSelectedResourceId("");
                      setSelectedDate("");
                      setSelectedSlot(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Resource */}
            {(step === "resource" ||
              (selectedResourceId && step !== "service")) && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  2. {businessCategory === "SPORTS" ? "Court" : "Staff"}
                </p>
                {step === "resource" ? (
                  <div className="space-y-2">
                    {resources.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedResourceId(r.id);
                          setStep("date");
                        }}
                        className="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {r.name}
                        </span>
                        {r.description && (
                          <span className="text-xs text-gray-400">
                            {r.description}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                    <span className="text-sm font-medium text-blue-900">
                      {resources.find((r) => r.id === selectedResourceId)?.name}
                    </span>
                    <button
                      onClick={() => {
                        setStep("resource");
                        setSelectedDate("");
                        setSelectedSlot(null);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Date */}
            {(step === "date" ||
              (selectedDate &&
                step !== "service" &&
                step !== "resource")) && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  3. Date
                </p>
                {step === "date" ? (
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) setStep("time");
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedDate}
                    </span>
                    <button
                      onClick={() => {
                        setStep("date");
                        setSelectedSlot(null);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Time */}
            {(step === "time" || (selectedSlot && step === "review")) &&
              selectedDate && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    4. Time
                  </p>
                  {step === "time" ? (
                    slotsLoading ? (
                      <SlotsSkeleton />
                    ) : !slotsData?.slots?.length ? (
                      <p className="text-sm text-gray-500">
                        No available slots for this date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                        {slotsData.slots.map(
                          (slot: { startTime: string; endTime: string }) => (
                            <button
                              key={slot.startTime}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setStep("review");
                              }}
                              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              {slot.startTime}
                            </button>
                          )
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedSlot?.startTime} – {selectedSlot?.endTime}
                      </span>
                      <button
                        onClick={() => {
                          setStep("time");
                          setSelectedSlot(null);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

            {/* Step 5: Review & Confirm */}
            {step === "review" && selectedSlot && (
              <div className="border-t pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Summary
                </p>
                <div className="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium">
                      {services.find((s) => s.id === selectedServiceId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      {businessCategory === "SPORTS" ? "Court" : "Staff"}
                    </span>
                    <span className="font-medium">
                      {resources.find((r) => r.id === selectedResourceId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium">
                      {selectedSlot.startTime} – {selectedSlot.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-1">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold text-gray-900">
                      $
                      {Number(
                        services.find((s) => s.id === selectedServiceId)
                          ?.price || 0
                      ).toFixed(2)}
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
                        setBookingError(
                          "This slot was just booked by someone else. Please choose another time."
                        );
                        toast.error(
                          "Slot no longer available — please choose another time."
                        );
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
  );
}

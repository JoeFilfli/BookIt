"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle, CalendarDays, Clock, ChevronRight, RefreshCw } from "lucide-react";
import { useAvailableSlots, useCreateBooking } from "@/lib/hooks";
import { BottomSheet } from "@/app/components/ui";

type Service = {
  id: string; name: string; durationMinutes: number;
  price: string; currency: string; description?: string | null;
};
type Resource = {
  id: string; name: string; description: string | null;
  type: string; imageUrl?: string | null;
};

type BookingStep = "service" | "resource" | "date" | "time" | "review" | "confirmed";

function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
        ${done ? "bg-success text-white" :
          active ? "text-white" : "bg-surface-border text-text-secondary"}`}
      style={active && !done ? { backgroundColor: "var(--color-accent)" } : undefined}
    >
      {done ? "✓" : n}
    </div>
  );
}

function BookingFlow({
  businessId, businessSlug, businessCategory, services, resources,
}: {
  businessId: string; businessSlug: string; businessCategory: string;
  services: Service[]; resources: Resource[];
}) {
  const { data: session } = useSession();
  const [step, setStep] = useState<BookingStep>("service");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Record<string, unknown> | null>(null);

  const { data: slotsData, isLoading: slotsLoading, refetch: refetchSlots } =
    useAvailableSlots(businessId, selectedResourceId, selectedServiceId, selectedDate);
  const createBooking = useCreateBooking();

  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  function resetAll() {
    setConfirmedBooking(null); setStep("service");
    setSelectedServiceId(""); setSelectedResourceId("");
    setSelectedDate(""); setSelectedSlot(null);
  }

  if (!session) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">🔐</div>
        <p className="text-sm text-text-secondary mb-4">Sign in to book this venue</p>
        <Link
          href={`/login?callbackUrl=/business/${businessSlug}`}
          className="btn-primary w-full justify-center text-sm"
          style={{ display: "flex" }}
        >
          Sign In to Book
        </Link>
      </div>
    );
  }

  if (confirmedBooking) {
    return (
      <div className="text-center py-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(16,185,129,0.1)" }}
        >
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">Booking Confirmed!</h3>
        <p className="text-sm text-text-secondary mb-4">
          {selectedService?.name} on {selectedDate} at {selectedSlot?.startTime}
        </p>
        <p className="text-xs text-text-secondary bg-surface-dim rounded-lg p-3 mb-4">
          💡 Please cancel at least 2 hours in advance so others can book.
        </p>
        <Link
          href="/bookings"
          className="block w-full py-2.5 rounded-lg text-sm font-semibold border-2 border-primary text-primary text-center hover:bg-primary hover:text-white transition-all mb-2"
        >
          View My Bookings
        </Link>
        <button onClick={resetAll} className="btn-primary w-full justify-center text-sm" style={{ display: "flex" }}>
          Book Another
        </button>
      </div>
    );
  }

  const stepsDone = {
    service: !!selectedServiceId,
    resource: !!selectedResourceId,
    date: !!selectedDate,
    time: !!selectedSlot,
  };

  return (
    <div className="space-y-3">
      {/* Step 1: Service */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <StepBadge n={1} active={step === "service"} done={stepsDone.service && step !== "service"} />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Service</span>
        </div>
        {step === "service" ? (
          <div className="space-y-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedServiceId(s.id); setStep("resource"); }}
                className="w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all hover:border-accent"
                style={{ borderColor: selectedServiceId === s.id ? "var(--color-accent)" : "var(--color-surface-border)" }}
              >
                <div>
                  <div className="text-sm font-semibold text-text-primary">{s.name}</div>
                  <div className="text-xs text-text-secondary mt-0.5">{s.durationMinutes} min</div>
                </div>
                <div className="text-sm font-bold text-text-primary shrink-0">${Number(s.price).toFixed(0)}</div>
              </button>
            ))}
          </div>
        ) : selectedService ? (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ backgroundColor: "var(--color-accent-soft)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
              {selectedService.name}
            </span>
            <button
              onClick={() => { setStep("service"); setSelectedResourceId(""); setSelectedDate(""); setSelectedSlot(null); }}
              className="text-xs underline"
              style={{ color: "var(--color-accent)" }}
            >
              Change
            </button>
          </div>
        ) : null}
      </div>

      {/* Step 2: Resource */}
      {(step === "resource" || (selectedResourceId && step !== "service")) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepBadge n={2} active={step === "resource"} done={stepsDone.resource && step !== "resource"} />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {businessCategory === "SPORTS" ? "Court" : "Staff Member"}
            </span>
          </div>
          {step === "resource" ? (
            <div className="space-y-2">
              {resources.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedResourceId(r.id); setStep("date"); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:border-accent"
                  style={{ borderColor: selectedResourceId === r.id ? "var(--color-accent)" : "var(--color-surface-border)" }}
                >
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-dim flex items-center justify-center shrink-0 text-lg">
                      {r.type === "COURT" ? "🏟️" : "👤"}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{r.name}</div>
                    {r.description && <div className="text-xs text-text-secondary">{r.description}</div>}
                  </div>
                </button>
              ))}
            </div>
          ) : selectedResource ? (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                {selectedResource.name}
              </span>
              <button
                onClick={() => { setStep("resource"); setSelectedDate(""); setSelectedSlot(null); }}
                className="text-xs underline"
                style={{ color: "var(--color-accent)" }}
              >
                Change
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Step 3: Date */}
      {(step === "date" || (selectedDate && step !== "service" && step !== "resource")) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepBadge n={3} active={step === "date"} done={stepsDone.date && step !== "date"} />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</span>
          </div>
          {step === "date" ? (
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); if (e.target.value) setStep("time"); }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-surface-border text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          ) : selectedDate ? (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                {selectedDate}
              </span>
              <button
                onClick={() => { setStep("date"); setSelectedSlot(null); }}
                className="text-xs underline"
                style={{ color: "var(--color-accent)" }}
              >
                Change
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Step 4: Time */}
      {(step === "time" || (selectedSlot && step === "review")) && selectedDate && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <StepBadge n={4} active={step === "time"} done={stepsDone.time && step !== "time"} />
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Time Slot</span>
          </div>
          {step === "time" ? (
            slotsLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-9 rounded-lg" />
                ))}
              </div>
            ) : !slotsData?.slots?.length ? (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                <p className="text-sm text-text-secondary">No slots available for this date.</p>
                <button
                  onClick={() => refetchSlots()}
                  className="mt-2 flex items-center gap-1 text-xs mx-auto"
                  style={{ color: "var(--color-accent)" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto">
                {slotsData.slots.map((slot: { startTime: string; endTime: string }) => (
                  <button
                    key={slot.startTime}
                    onClick={() => { setSelectedSlot(slot); setStep("review"); }}
                    className="py-2 rounded-lg border-2 text-xs font-semibold transition-all hover:border-accent hover:text-accent"
                    style={{ borderColor: "var(--color-surface-border)" }}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>
            )
          ) : selectedSlot ? (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--color-accent-soft)" }}
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                {selectedSlot.startTime} – {selectedSlot.endTime}
              </span>
              <button
                onClick={() => { setStep("time"); setSelectedSlot(null); }}
                className="text-xs underline"
                style={{ color: "var(--color-accent)" }}
              >
                Change
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Step 5: Review & Confirm */}
      {step === "review" && selectedSlot && selectedService && selectedResource && (
        <div className="border-t border-surface-border pt-4">
          <h3 className="text-sm font-bold text-text-primary mb-3">Booking Summary</h3>
          <div className="bg-surface-dim rounded-xl p-4 space-y-2 text-sm mb-4">
            {[
              ["Service", selectedService.name],
              [businessCategory === "SPORTS" ? "Court" : "Staff", selectedResource.name],
              ["Date", selectedDate],
              ["Time", `${selectedSlot.startTime} – ${selectedSlot.endTime}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-text-secondary">{label}</span>
                <span className="font-semibold text-text-primary">{value}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-surface-border pt-2 mt-2">
              <span className="font-bold text-text-primary">Total</span>
              <span className="text-lg font-extrabold" style={{ color: "var(--color-accent)" }}>
                ${Number(selectedService.price).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={async () => {
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
                  toast.error("Slot taken — please choose another time.");
                  refetchSlots();
                  setStep("time");
                  setSelectedSlot(null);
                } else {
                  toast.error(e.message || "Booking failed");
                }
              }
            }}
            disabled={createBooking.isPending}
            className="btn-primary w-full justify-center text-sm"
            style={{ display: "flex" }}
          >
            {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BookingPanel({
  businessId, businessSlug, businessCategory, services, resources, minPrice,
}: {
  businessId: string; businessSlug: string; businessCategory: string;
  services: Service[]; resources: Resource[]; minPrice: number | null;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const flowProps = { businessId, businessSlug, businessCategory, services, resources };

  return (
    <>
      {/* Desktop sticky panel */}
      <div className="hidden lg:block w-[400px] shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-extrabold text-text-primary mb-1">Book Now</h2>
          {minPrice !== null && (
            <p className="text-sm text-text-secondary mb-4">
              Starting from <span className="font-bold text-text-primary">${minPrice}</span>
            </p>
          )}
          <BookingFlow {...flowProps} />
        </div>
      </div>

      {/* Mobile: fixed bottom bar + bottom sheet */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-border px-4 py-3 flex items-center justify-between shadow-lg">
        <div>
          {minPrice !== null ? (
            <>
              <div className="text-xs text-text-secondary">Starting from</div>
              <div className="text-lg font-extrabold text-text-primary">${minPrice}</div>
            </>
          ) : (
            <div className="text-sm font-semibold text-text-primary">Book Now</div>
          )}
        </div>
        <button
          onClick={() => setSheetOpen(true)}
          className="btn-primary text-sm flex items-center gap-1"
        >
          Book Now <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Book Now">
        <BookingFlow {...flowProps} />
      </BottomSheet>
    </>
  );
}

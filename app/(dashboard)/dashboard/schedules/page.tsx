"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  useResources,
  useServices,
  useSchedules,
  useCreateSchedule,
  useDeleteSchedule,
  useServiceSchedules,
  useCreateServiceSchedule,
  useDeleteServiceSchedule,
} from "@/lib/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, ArrowLeft, Plus, X, Clock } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface ScheduleBlock {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function WeeklyScheduleGrid({
  schedules,
  schedulesLoading,
  onAdd,
  onDelete,
  isCreating,
  isDeleting,
}: {
  schedules: ScheduleBlock[];
  schedulesLoading: boolean;
  onAdd: (dayOfWeek: number, startTime: string, endTime: string) => Promise<void>;
  onDelete: (scheduleId: string) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
}) {
  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("22:00");

  const handleAdd = async (dayOfWeek: number) => {
    try {
      await onAdd(dayOfWeek, startTime, endTime);
      toast.success("Schedule block added");
      setAddingDay(null);
      setStartTime("08:00");
      setEndTime("22:00");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add schedule");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      await onDelete(scheduleId);
      toast.success("Schedule block removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const getSchedulesForDay = (day: number) => schedules.filter((s) => s.dayOfWeek === day);

  if (schedulesLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {DAYS.map((dayName, dayIndex) => {
        const daySchedules = getSchedulesForDay(dayIndex);
        return (
          <div key={dayIndex} className="rounded-xl bg-white p-4 shadow-sm border border-surface-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text-primary text-sm">{dayName}</h3>
              {addingDay !== dayIndex && (
                <button
                  onClick={() => setAddingDay(dayIndex)}
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: "var(--color-accent)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Block
                </button>
              )}
            </div>

            {daySchedules.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{ backgroundColor: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {schedule.startTime} — {schedule.endTime}
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={isDeleting}
                      className="ml-1 opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {daySchedules.length === 0 && addingDay !== dayIndex && (
              <p className="mt-1 text-xs text-text-secondary">Closed — no availability</p>
            )}

            {addingDay === dayIndex && (
              <div className="mt-3 flex items-end gap-3 border-t border-surface-border pt-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Start</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="rounded-lg border border-surface-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                    style={{ borderColor: "var(--color-surface-border)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">End</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="rounded-lg border border-surface-border px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                    style={{ borderColor: "var(--color-surface-border)" }}
                  />
                </div>
                <button
                  onClick={() => handleAdd(dayIndex)}
                  disabled={isCreating}
                  className="btn-primary text-sm px-3 py-1.5 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingDay(null)}
                  className="btn-secondary text-sm px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ManageSchedulesPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<"resources" | "services">("resources");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const { data: businessData, isLoading: bizLoading } = useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      const res = await fetch("/api/businesses/my");
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const businessId = businessData?.id || "";

  const { data: resources = [] } = useResources(businessId);
  const { data: services = [] } = useServices(businessId);

  const resourceList = resources as Array<{ id: string; name: string; type: string }>;
  const serviceList = services as Array<{ id: string; name: string; durationMinutes: number }>;

  if (resourceList.length > 0 && !selectedResourceId) {
    setSelectedResourceId(resourceList[0].id);
  }
  if (serviceList.length > 0 && !selectedServiceId) {
    setSelectedServiceId(serviceList[0].id);
  }

  const { data: resourceSchedules = [], isLoading: resourceSchedulesLoading } = useSchedules(selectedResourceId);
  const { data: serviceSchedules = [], isLoading: serviceSchedulesLoading } = useServiceSchedules(selectedServiceId);

  const createResourceSchedule = useCreateSchedule();
  const deleteResourceSchedule = useDeleteSchedule();
  const createServiceSchedule = useCreateServiceSchedule();
  const deleteServiceSchedule = useDeleteServiceSchedule();

  if (status === "loading" || bizLoading) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <div className="skeleton h-6 w-32 mb-2 rounded" />
        <div className="skeleton h-8 w-48 mb-2 rounded" />
        <div className="skeleton h-4 w-64 mb-8 rounded" />
        <div className="skeleton h-10 w-48 mb-6 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!businessData) {
    return (
      <div className="py-20 px-4 flex flex-col items-center text-center">
        <CalendarDays className="w-12 h-12 mb-4" style={{ color: "var(--color-text-secondary)" }} />
        <h2 className="text-lg font-semibold text-text-primary mb-2">No business yet</h2>
        <p className="text-text-secondary text-sm mb-6">Create your business profile before setting schedules.</p>
        <Link href="/dashboard/create" className="btn-primary text-sm px-5 py-2.5">
          Create Your Business
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-medium mb-3 transition-colors"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Manage Schedules</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Set when resources and services are available for booking.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: "var(--color-surface-dim)" }}>
        {(["resources", "services"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="rounded-lg px-5 py-2 text-sm font-medium transition-all capitalize"
            style={
              activeTab === tab
                ? { backgroundColor: "white", color: "var(--color-text-primary)", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--color-text-secondary)" }
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Resource Schedules Tab */}
      {activeTab === "resources" && (
        resourceList.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 rounded-xl bg-white border border-dashed border-surface-border">
            <CalendarDays className="w-10 h-10 mb-3" style={{ color: "var(--color-text-secondary)" }} />
            <p className="font-medium text-text-primary mb-1">No resources added yet</p>
            <p className="text-sm text-text-secondary mb-5">You need resources before setting their schedule.</p>
            <Link href="/dashboard/resources" className="btn-primary text-sm px-5 py-2.5">
              Add Resources
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary mb-1">Select Resource</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="field-base max-w-xs"
              >
                {resourceList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type.charAt(0) + r.type.slice(1).toLowerCase()})
                  </option>
                ))}
              </select>
            </div>
            <WeeklyScheduleGrid
              schedules={resourceSchedules as ScheduleBlock[]}
              schedulesLoading={resourceSchedulesLoading}
              onAdd={async (dayOfWeek, startTime, endTime) => {
                await createResourceSchedule.mutateAsync({ resourceId: selectedResourceId, data: { dayOfWeek, startTime, endTime } });
              }}
              onDelete={async (scheduleId) => {
                await deleteResourceSchedule.mutateAsync({ resourceId: selectedResourceId, scheduleId });
              }}
              isCreating={createResourceSchedule.isPending}
              isDeleting={deleteResourceSchedule.isPending}
            />
          </>
        )
      )}

      {/* Service Schedules Tab */}
      {activeTab === "services" && (
        serviceList.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 rounded-xl bg-white border border-dashed border-surface-border">
            <CalendarDays className="w-10 h-10 mb-3" style={{ color: "var(--color-text-secondary)" }} />
            <p className="font-medium text-text-primary mb-1">No services added yet</p>
            <p className="text-sm text-text-secondary mb-5">You need services before setting their schedule.</p>
            <Link href="/dashboard/services" className="btn-primary text-sm px-5 py-2.5">
              Add Services
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Select Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="field-base max-w-xs"
              >
                {serviceList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
            <p className="mb-5 text-sm text-text-secondary">
              If no schedule is set, this service follows the resource&apos;s schedule.
            </p>
            <WeeklyScheduleGrid
              schedules={serviceSchedules as ScheduleBlock[]}
              schedulesLoading={serviceSchedulesLoading}
              onAdd={async (dayOfWeek, startTime, endTime) => {
                await createServiceSchedule.mutateAsync({ serviceId: selectedServiceId, data: { dayOfWeek, startTime, endTime } });
              }}
              onDelete={async (scheduleId) => {
                await deleteServiceSchedule.mutateAsync({ serviceId: selectedServiceId, scheduleId });
              }}
              isCreating={createServiceSchedule.isPending}
              isDeleting={deleteServiceSchedule.isPending}
            />
          </>
        )
      )}
    </div>
  );
}

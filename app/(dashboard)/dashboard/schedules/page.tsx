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

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
  const [error, setError] = useState("");

  const handleAdd = async (dayOfWeek: number) => {
    setError("");
    try {
      await onAdd(dayOfWeek, startTime, endTime);
      setAddingDay(null);
      setStartTime("08:00");
      setEndTime("22:00");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add schedule");
    }
  };

  const handleDelete = async (scheduleId: string) => {
    setError("");
    try {
      await onDelete(scheduleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete schedule");
    }
  };

  const getSchedulesForDay = (day: number) =>
    schedules.filter((s) => s.dayOfWeek === day);

  if (schedulesLoading) {
    return <p className="text-gray-500">Loading schedules...</p>;
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-3">
        {DAYS.map((dayName, dayIndex) => {
          const daySchedules = getSchedulesForDay(dayIndex);

          return (
            <div key={dayIndex} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{dayName}</h3>
                {addingDay !== dayIndex && (
                  <button
                    onClick={() => setAddingDay(dayIndex)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Block
                  </button>
                )}
              </div>

              {daySchedules.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2"
                    >
                      <span className="text-sm text-blue-800">
                        {schedule.startTime} — {schedule.endTime}
                      </span>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        disabled={isDeleting}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-400">
                  No schedule — closed
                </p>
              )}

              {addingDay === dayIndex && (
                <div className="mt-3 flex items-end gap-3 border-t pt-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Start
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      End
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleAdd(dayIndex)}
                    disabled={isCreating}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAddingDay(null)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function ManageSchedulesPage() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState<"resources" | "services">("resources");
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const { data: businessData } = useQuery({
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

  // Auto-select first resource/service when lists load
  if (resourceList.length > 0 && !selectedResourceId) {
    setSelectedResourceId(resourceList[0].id);
  }
  if (serviceList.length > 0 && !selectedServiceId) {
    setSelectedServiceId(serviceList[0].id);
  }

  const { data: resourceSchedules = [], isLoading: resourceSchedulesLoading } =
    useSchedules(selectedResourceId);
  const { data: serviceSchedules = [], isLoading: serviceSchedulesLoading } =
    useServiceSchedules(selectedServiceId);

  const createResourceSchedule = useCreateSchedule();
  const deleteResourceSchedule = useDeleteSchedule();
  const createServiceSchedule = useCreateServiceSchedule();
  const deleteServiceSchedule = useDeleteServiceSchedule();

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!businessData) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-gray-600">You need to create a business first.</p>
          <Link
            href="/dashboard/create"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Your Business
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Manage Schedules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Set when resources and services are available for booking.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-gray-200 p-1 w-fit">
          <button
            onClick={() => setActiveTab("resources")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "resources"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "services"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Services
          </button>
        </div>

        {/* Resource Schedules Tab */}
        {activeTab === "resources" && (
          <>
            {resourceList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  You need to add resources before setting schedules.
                </p>
                <Link
                  href="/dashboard/resources"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Resources
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Resource
                  </label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                    await createResourceSchedule.mutateAsync({
                      resourceId: selectedResourceId,
                      data: { dayOfWeek, startTime, endTime },
                    });
                  }}
                  onDelete={async (scheduleId) => {
                    await deleteResourceSchedule.mutateAsync({
                      resourceId: selectedResourceId,
                      scheduleId,
                    });
                  }}
                  isCreating={createResourceSchedule.isPending}
                  isDeleting={deleteResourceSchedule.isPending}
                />
              </>
            )}
          </>
        )}

        {/* Service Schedules Tab */}
        {activeTab === "services" && (
          <>
            {serviceList.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  You need to add services before setting schedules.
                </p>
                <Link
                  href="/dashboard/services"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Add Services
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Service
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {serviceList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.durationMinutes} min)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mb-6 text-sm text-gray-500">
                  Define when this service is offered. If no schedule is set, the service follows the resource&apos;s schedule.
                </p>
                <WeeklyScheduleGrid
                  schedules={serviceSchedules as ScheduleBlock[]}
                  schedulesLoading={serviceSchedulesLoading}
                  onAdd={async (dayOfWeek, startTime, endTime) => {
                    await createServiceSchedule.mutateAsync({
                      serviceId: selectedServiceId,
                      data: { dayOfWeek, startTime, endTime },
                    });
                  }}
                  onDelete={async (scheduleId) => {
                    await deleteServiceSchedule.mutateAsync({
                      serviceId: selectedServiceId,
                      scheduleId,
                    });
                  }}
                  isCreating={createServiceSchedule.isPending}
                  isDeleting={deleteServiceSchedule.isPending}
                />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

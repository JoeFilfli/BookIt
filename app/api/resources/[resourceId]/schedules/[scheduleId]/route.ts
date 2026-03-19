import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

async function getScheduleWithOwnership(scheduleId: string) {
  return prisma.resourceSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      resource: {
        select: { id: true, businessId: true },
      },
    },
  });
}

// PUT /api/resources/[resourceId]/schedules/[scheduleId] — Update schedule block
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ resourceId: string; scheduleId: string }> }
) {
  try {
    const { resourceId, scheduleId } = await params;

    const schedule = await getScheduleWithOwnership(scheduleId);
    if (!schedule || schedule.resourceId !== resourceId) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    await requireBusinessOwner(schedule.resource.businessId);

    const body = await req.json();
    const { dayOfWeek, startTime, endTime } = body;

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

    const newDay = dayOfWeek !== undefined ? dayOfWeek : schedule.dayOfWeek;
    const newStart = startTime || schedule.startTime;
    const newEnd = endTime || schedule.endTime;

    if (typeof newDay !== "number" || newDay < 0 || newDay > 6) {
      return NextResponse.json(
        { error: "dayOfWeek must be 0 (Sunday) through 6 (Saturday)" },
        { status: 400 }
      );
    }

    if (!timeRegex.test(newStart) || !timeRegex.test(newEnd)) {
      return NextResponse.json(
        { error: "startTime and endTime must be in HH:MM format" },
        { status: 400 }
      );
    }

    if (newStart >= newEnd) {
      return NextResponse.json(
        { error: "endTime must be after startTime" },
        { status: 400 }
      );
    }

    // Check for overlapping blocks (exclude current schedule)
    const existing = await prisma.resourceSchedule.findMany({
      where: { resourceId, dayOfWeek: newDay, id: { not: scheduleId } },
    });

    const overlaps = existing.some(
      (s) => newStart < s.endTime && newEnd > s.startTime
    );

    if (overlaps) {
      return NextResponse.json(
        { error: "This schedule block overlaps with an existing one" },
        { status: 409 }
      );
    }

    const updated = await prisma.resourceSchedule.update({
      where: { id: scheduleId },
      data: {
        dayOfWeek: newDay,
        startTime: newStart,
        endTime: newEnd,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[resourceId]/schedules/[scheduleId] — Delete schedule block
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string; scheduleId: string }> }
) {
  try {
    const { resourceId, scheduleId } = await params;

    const schedule = await getScheduleWithOwnership(scheduleId);
    if (!schedule || schedule.resourceId !== resourceId) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    await requireBusinessOwner(schedule.resource.businessId);

    await prisma.resourceSchedule.delete({ where: { id: scheduleId } });

    return NextResponse.json({ message: "Schedule block deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

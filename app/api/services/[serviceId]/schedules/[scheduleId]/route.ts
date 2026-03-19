import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

async function getScheduleWithOwnership(scheduleId: string) {
  return prisma.serviceSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      service: {
        select: { id: true, businessId: true },
      },
    },
  });
}

// DELETE /api/services/[serviceId]/schedules/[scheduleId] — Delete schedule block
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ serviceId: string; scheduleId: string }> }
) {
  try {
    const { serviceId, scheduleId } = await params;

    const schedule = await getScheduleWithOwnership(scheduleId);
    if (!schedule || schedule.serviceId !== serviceId) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    await requireBusinessOwner(schedule.service.businessId);

    await prisma.serviceSchedule.delete({ where: { id: scheduleId } });

    return NextResponse.json({ message: "Schedule block deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete service schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

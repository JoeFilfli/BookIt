import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

async function getResourceWithBusiness(resourceId: string) {
  return prisma.resource.findUnique({
    where: { id: resourceId },
    select: { id: true, businessId: true },
  });
}

// POST /api/resources/[resourceId]/schedules — Add a schedule block
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await params;

    const resource = await getResourceWithBusiness(resourceId);
    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    await requireBusinessOwner(resource.businessId);

    const body = await req.json();
    const { dayOfWeek, startTime, endTime } = body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "dayOfWeek, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    if (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { error: "dayOfWeek must be 0 (Sunday) through 6 (Saturday)" },
        { status: 400 }
      );
    }

    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "startTime and endTime must be in HH:MM format" },
        { status: 400 }
      );
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "endTime must be after startTime" },
        { status: 400 }
      );
    }

    // Check for overlapping schedule blocks on the same day
    const existing = await prisma.resourceSchedule.findMany({
      where: { resourceId, dayOfWeek },
    });

    const overlaps = existing.some(
      (s) => startTime < s.endTime && endTime > s.startTime
    );

    if (overlaps) {
      return NextResponse.json(
        { error: "This schedule block overlaps with an existing one" },
        { status: 409 }
      );
    }

    const schedule = await prisma.resourceSchedule.create({
      data: { resourceId, dayOfWeek, startTime, endTime },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create schedule error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/resources/[resourceId]/schedules — List schedule blocks
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const { resourceId } = await params;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      select: { id: true },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const schedules = await prisma.resourceSchedule.findMany({
      where: { resourceId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("List schedules error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

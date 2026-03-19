import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

// POST /api/businesses/[businessId]/resources — Create a resource
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await requireBusinessOwner(businessId);

    const body = await req.json();
    const { name, type, description, imageUrl } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    if (!["COURT", "STAFF", "ROOM"].includes(type)) {
      return NextResponse.json(
        { error: "type must be COURT, STAFF, or ROOM" },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        businessId,
        name,
        type,
        description: description || null,
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/businesses/[businessId]/resources — List resources for a business
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const resources = await prisma.resource.findMany({
      where: { businessId },
      include: {
        schedules: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("List resources error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

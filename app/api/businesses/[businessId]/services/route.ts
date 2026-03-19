import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

// POST /api/businesses/[businessId]/services — Create a service
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    await requireBusinessOwner(businessId);

    const body = await req.json();
    const { name, description, durationMinutes, price, currency } = body;

    if (!name || !durationMinutes || price === undefined) {
      return NextResponse.json(
        { error: "name, durationMinutes, and price are required" },
        { status: 400 }
      );
    }

    if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
      return NextResponse.json(
        { error: "durationMinutes must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json(
        { error: "price must be a non-negative number" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        description: description || null,
        durationMinutes,
        price,
        currency: currency || "USD",
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/businesses/[businessId]/services — List services for a business
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

    const services = await prisma.service.findMany({
      where: { businessId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("List services error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

// PUT /api/businesses/[businessId]/services/[serviceId] — Update a service
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  try {
    const { businessId, serviceId } = await params;
    await requireBusinessOwner(businessId);

    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, description, durationMinutes, price, currency } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (durationMinutes !== undefined) {
      if (typeof durationMinutes !== "number" || durationMinutes <= 0) {
        return NextResponse.json(
          { error: "durationMinutes must be a positive number" },
          { status: 400 }
        );
      }
      data.durationMinutes = durationMinutes;
    }
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return NextResponse.json(
          { error: "price must be a non-negative number" },
          { status: 400 }
        );
      }
      data.price = price;
    }
    if (currency !== undefined) data.currency = currency;

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/businesses/[businessId]/services/[serviceId] — Delete a service
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string; serviceId: string }> }
) {
  try {
    const { businessId, serviceId } = await params;
    await requireBusinessOwner(businessId);

    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    await prisma.service.delete({ where: { id: serviceId } });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

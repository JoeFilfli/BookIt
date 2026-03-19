import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";

// PUT /api/businesses/[businessId]/resources/[resourceId] — Update a resource
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string; resourceId: string }> }
) {
  try {
    const { businessId, resourceId } = await params;
    await requireBusinessOwner(businessId);

    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, businessId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, type, description, imageUrl } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (type !== undefined) {
      if (!["COURT", "STAFF", "ROOM"].includes(type)) {
        return NextResponse.json(
          { error: "type must be COURT, STAFF, or ROOM" },
          { status: 400 }
        );
      }
      data.type = type;
    }
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const updated = await prisma.resource.update({
      where: { id: resourceId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update resource error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/businesses/[businessId]/resources/[resourceId] — Delete a resource
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string; resourceId: string }> }
) {
  try {
    const { businessId, resourceId } = await params;
    await requireBusinessOwner(businessId);

    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, businessId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      );
    }

    await prisma.resource.delete({ where: { id: resourceId } });

    return NextResponse.json({ message: "Resource deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete resource error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

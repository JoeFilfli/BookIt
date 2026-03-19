import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { requireBusinessOwner } from "@/lib/auth/helpers";
import { validateExtraFields } from "@/lib/utils";

/**
 * Find a business by slug or UUID id.
 */
async function findBusiness(slugOrId: string) {
  // Try by slug first
  let business = await prisma.business.findUnique({ where: { slug: slugOrId } });
  // If not found and looks like a UUID, try by id
  if (!business && /^[0-9a-f-]{36}$/i.test(slugOrId)) {
    business = await prisma.business.findUnique({ where: { id: slugOrId } });
  }
  return business;
}

// GET /api/businesses/[businessId] — Get full business profile by slug or id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await findBusiness(businessId);

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const full = await prisma.business.findUnique({
      where: { id: business.id },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        resources: {
          include: {
            schedules: {
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
          },
        },
        services: { orderBy: { name: "asc" } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!full) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const avgRating =
      full.reviews.length > 0
        ? full.reviews.reduce((sum, r) => sum + r.rating, 0) / full.reviews.length
        : 0;

    return NextResponse.json({
      ...full,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: full._count.reviews,
    });
  } catch (error) {
    console.error("Get business error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/businesses/[businessId] — Update a business (by slug or id)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await findBusiness(businessId);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    await requireBusinessOwner(business.id);

    const body = await req.json();
    const {
      name,
      description,
      phone,
      address,
      city,
      latitude,
      longitude,
      images,
      extraFields,
    } = body;

    if (extraFields !== undefined) {
      const validation = validateExtraFields(business.category, extraFields);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (latitude !== undefined) data.latitude = latitude;
    if (longitude !== undefined) data.longitude = longitude;
    if (images !== undefined) data.images = images;
    if (extraFields !== undefined) data.extraFields = extraFields;

    const updated = await prisma.business.update({
      where: { id: business.id },
      data,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/businesses/[businessId] — Delete a business (by slug or id)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const { businessId } = await params;
    const business = await findBusiness(businessId);

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    await requireBusinessOwner(business.id);

    await prisma.business.delete({ where: { id: business.id } });

    return NextResponse.json({ message: "Business deleted successfully" });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete business error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

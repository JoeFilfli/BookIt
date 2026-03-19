import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/utils/prisma";
import { NextResponse } from "next/server";

/**
 * Get the current authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

/**
 * Require authentication. Returns the user or throws a 401 response.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return user;
}

/**
 * Require that the authenticated user owns the specified business.
 * Returns the user or throws 401/403 response.
 */
export async function requireBusinessOwner(businessId: string) {
  const user = await requireAuth();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  });

  if (!business) {
    throw NextResponse.json(
      { error: "Business not found" },
      { status: 404 }
    );
  }

  if (business.ownerId !== user.id) {
    throw NextResponse.json(
      { error: "You do not have permission to manage this business" },
      { status: 403 }
    );
  }

  return user;
}

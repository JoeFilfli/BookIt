import { PrismaClient, BusinessCategory, ResourceType, BookingStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.resourceSchedule.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ───────────────────────────────────────────

  const customer = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      hashedPassword: "$2b$10$sZFrxbZCoWxnGP4C9bPZ.eLXzXrTd4hFBJ0kI2nWbshZp7jewO1Gu",
      phone: "+961 71 123 456",
    },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Ahmad Khalil",
      email: "ahmad@example.com",
      hashedPassword: "$2b$10$sZFrxbZCoWxnGP4C9bPZ.eLXzXrTd4hFBJ0kI2nWbshZp7jewO1Gu",
      phone: "+961 70 987 654",
    },
  });

  // ─── Sports Venue ────────────────────────────────────

  const sportsVenue = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Beirut Padel Club",
      slug: "beirut-padel-club",
      category: BusinessCategory.SPORTS,
      description:
        "Premium padel and tennis courts in the heart of Beirut. Indoor and outdoor courts available with professional lighting and equipment rental.",
      phone: "+961 1 234 567",
      address: "123 Sports Avenue, Achrafieh",
      city: "Beirut",
      latitude: 33.8938,
      longitude: 35.5018,
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/sports/court1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/sports/court2.jpg",
      ],
      extraFields: {
        courtCount: 3,
        sportTypes: ["padel", "tennis"],
        surfaceType: "artificial-grass",
        indoor: false,
      },
    },
  });

  // Sports courts
  const court1 = await prisma.resource.create({
    data: {
      businessId: sportsVenue.id,
      name: "Court 1",
      type: ResourceType.COURT,
      description: "Outdoor padel court with LED lighting",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/sports/court1.jpg",
    },
  });

  const court2 = await prisma.resource.create({
    data: {
      businessId: sportsVenue.id,
      name: "Court 2",
      type: ResourceType.COURT,
      description: "Outdoor padel court with LED lighting",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/sports/court2.jpg",
    },
  });

  const court3 = await prisma.resource.create({
    data: {
      businessId: sportsVenue.id,
      name: "Court 3",
      type: ResourceType.COURT,
      description: "Indoor tennis court with climate control",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/sports/court3.jpg",
    },
  });

  // Sports services
  const padelSession = await prisma.service.create({
    data: {
      businessId: sportsVenue.id,
      name: "Padel Session",
      description: "60-minute padel court booking with equipment",
      durationMinutes: 60,
      price: new Decimal(25.0),
      currency: "USD",
    },
  });

  const tennisSession = await prisma.service.create({
    data: {
      businessId: sportsVenue.id,
      name: "Tennis Session",
      description: "90-minute tennis court booking",
      durationMinutes: 90,
      price: new Decimal(35.0),
      currency: "USD",
    },
  });

  // Schedules for all courts (Mon-Sun, 08:00-22:00)
  for (const court of [court1, court2, court3]) {
    for (let day = 0; day <= 6; day++) {
      await prisma.resourceSchedule.create({
        data: {
          resourceId: court.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "22:00",
        },
      });
    }
  }

  // ─── Salon ───────────────────────────────────────────

  const salon = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Glamour Studio",
      slug: "glamour-studio",
      category: BusinessCategory.SALON,
      description:
        "Upscale salon offering premium hair and beauty services. Our experienced stylists specialize in modern cuts, coloring, and treatments.",
      phone: "+961 1 876 543",
      address: "456 Beauty Street, Hamra",
      city: "Beirut",
      latitude: 33.8969,
      longitude: 35.4846,
      images: [
        "https://res.cloudinary.com/demo/image/upload/v1/salon/interior1.jpg",
        "https://res.cloudinary.com/demo/image/upload/v1/salon/interior2.jpg",
      ],
      extraFields: {
        specialties: ["haircut", "coloring", "nails", "facial"],
        genderFocus: "unisex",
      },
    },
  });

  // Salon staff
  const stylist1 = await prisma.resource.create({
    data: {
      businessId: salon.id,
      name: "Nadia",
      type: ResourceType.STAFF,
      description: "Senior stylist specializing in coloring and modern cuts",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/salon/nadia.jpg",
    },
  });

  const stylist2 = await prisma.resource.create({
    data: {
      businessId: salon.id,
      name: "Rami",
      type: ResourceType.STAFF,
      description: "Expert in men's cuts and beard grooming",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/salon/rami.jpg",
    },
  });

  // Salon services
  const haircut = await prisma.service.create({
    data: {
      businessId: salon.id,
      name: "Haircut",
      description: "Professional haircut with wash and styling",
      durationMinutes: 45,
      price: new Decimal(20.0),
      currency: "USD",
    },
  });

  const coloring = await prisma.service.create({
    data: {
      businessId: salon.id,
      name: "Hair Coloring",
      description: "Full hair coloring with premium products",
      durationMinutes: 120,
      price: new Decimal(75.0),
      currency: "USD",
    },
  });

  const beardTrim = await prisma.service.create({
    data: {
      businessId: salon.id,
      name: "Beard Trim",
      description: "Professional beard shaping and trim",
      durationMinutes: 30,
      price: new Decimal(10.0),
      currency: "USD",
    },
  });

  // Schedules for stylists (Tue-Sat, split shift with lunch break)
  for (const stylist of [stylist1, stylist2]) {
    for (let day = 2; day <= 6; day++) {
      // Morning block
      await prisma.resourceSchedule.create({
        data: {
          resourceId: stylist.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "13:00",
        },
      });
      // Afternoon block
      await prisma.resourceSchedule.create({
        data: {
          resourceId: stylist.id,
          dayOfWeek: day,
          startTime: "14:00",
          endTime: "19:00",
        },
      });
    }
  }

  // ─── Sample Bookings ─────────────────────────────────

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const booking1 = await prisma.booking.create({
    data: {
      userId: customer.id,
      resourceId: court1.id,
      serviceId: padelSession.id,
      date: tomorrow,
      startTime: "10:00",
      endTime: "11:00",
      status: BookingStatus.CONFIRMED,
      totalPrice: new Decimal(25.0),
      notes: "Bringing my own racket",
    },
  });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);
  pastDate.setHours(0, 0, 0, 0);

  const booking2 = await prisma.booking.create({
    data: {
      userId: customer.id,
      resourceId: stylist1.id,
      serviceId: haircut.id,
      date: pastDate,
      startTime: "10:00",
      endTime: "10:45",
      status: BookingStatus.COMPLETED,
      totalPrice: new Decimal(20.0),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: customer.id,
      resourceId: court2.id,
      serviceId: padelSession.id,
      date: pastDate,
      startTime: "14:00",
      endTime: "15:00",
      status: BookingStatus.COMPLETED,
      totalPrice: new Decimal(25.0),
    },
  });

  // ─── Sample Reviews ──────────────────────────────────

  await prisma.review.create({
    data: {
      userId: customer.id,
      businessId: sportsVenue.id,
      bookingId: booking3.id,
      rating: 5,
      comment: "Excellent courts! Well maintained and great lighting for evening games.",
    },
  });

  await prisma.review.create({
    data: {
      userId: customer.id,
      businessId: salon.id,
      bookingId: booking2.id,
      rating: 4,
      comment: "Nadia did an amazing job with my hair. Very professional and friendly.",
    },
  });

  console.log("Seed data created successfully!");
  console.log(`  - 2 users (customer: ${customer.email}, owner: ${owner.email})`);
  console.log(`  - 1 sports venue: ${sportsVenue.name} (3 courts, 2 services)`);
  console.log(`  - 1 salon: ${salon.name} (2 staff, 3 services)`);
  console.log(`  - 3 bookings, 2 reviews`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

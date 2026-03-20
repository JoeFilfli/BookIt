import { PrismaClient, BusinessCategory, ResourceType, BookingStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function addSchedules(resourceId: string, days: number[], start: string, end: string) {
  for (const day of days) {
    await prisma.resourceSchedule.create({ data: { resourceId, dayOfWeek: day, startTime: start, endTime: end } });
  }
}

async function main() {
  // Clean up
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

  const allDays = [0, 1, 2, 3, 4, 5, 6];
  const weekdays = [1, 2, 3, 4, 5];
  const tueSat = [2, 3, 4, 5, 6];

  // ─── 1. COURTS_SPORTS ────────────────────────────────

  const sportsVenue = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Beirut Padel Club",
      slug: "beirut-padel-club",
      category: BusinessCategory.COURTS_SPORTS,
      description: "Premium padel and tennis courts in the heart of Beirut. Indoor and outdoor courts available with professional lighting and equipment rental.",
      phone: "+961 1 234 567",
      address: "123 Sports Avenue, Achrafieh",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"],
      extraFields: { courtCount: 3, sportTypes: ["Padel", "Tennis"], surfaceType: "Artificial Turf", isIndoor: false },
    },
  });

  const court1 = await prisma.resource.create({ data: { businessId: sportsVenue.id, name: "Court 1", type: ResourceType.COURT, description: "Outdoor padel court with LED lighting" } });
  const court2 = await prisma.resource.create({ data: { businessId: sportsVenue.id, name: "Court 2", type: ResourceType.COURT, description: "Outdoor padel court with LED lighting" } });
  for (const c of [court1, court2]) await addSchedules(c.id, allDays, "08:00", "22:00");

  const padelSession = await prisma.service.create({ data: { businessId: sportsVenue.id, name: "Padel Session", durationMinutes: 60, price: new Decimal(25), currency: "USD" } });
  await prisma.service.create({ data: { businessId: sportsVenue.id, name: "Tennis Session", durationMinutes: 90, price: new Decimal(35), currency: "USD" } });

  // ─── 2. WOMEN_CARE ───────────────────────────────────

  const salon = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Glamour Studio",
      slug: "glamour-studio",
      category: BusinessCategory.WOMEN_CARE,
      description: "Upscale salon offering premium hair and beauty services in Hamra. Expert stylists specializing in modern cuts, coloring, and treatments.",
      phone: "+961 1 876 543",
      address: "456 Beauty Street, Hamra",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80"],
      extraFields: { specialties: ["Haircut", "Coloring", "Nails", "Facial"], genderFocus: "unisex" },
    },
  });

  const stylist1 = await prisma.resource.create({ data: { businessId: salon.id, name: "Nadia", type: ResourceType.STAFF, description: "Senior stylist, coloring specialist" } });
  const stylist2 = await prisma.resource.create({ data: { businessId: salon.id, name: "Rami", type: ResourceType.STAFF, description: "Men's cuts and beard grooming expert" } });
  for (const s of [stylist1, stylist2]) {
    await addSchedules(s.id, tueSat, "10:00", "13:00");
    await addSchedules(s.id, tueSat, "14:00", "19:00");
  }

  const haircut = await prisma.service.create({ data: { businessId: salon.id, name: "Haircut", durationMinutes: 45, price: new Decimal(20), currency: "USD" } });
  await prisma.service.create({ data: { businessId: salon.id, name: "Hair Coloring", durationMinutes: 120, price: new Decimal(75), currency: "USD" } });
  await prisma.service.create({ data: { businessId: salon.id, name: "Beard Trim", durationMinutes: 30, price: new Decimal(10), currency: "USD" } });

  // ─── 3. FOOD ─────────────────────────────────────────

  const restaurant = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Tawlet Beirut",
      slug: "tawlet-beirut",
      category: BusinessCategory.FOOD,
      description: "Authentic Lebanese cuisine with a contemporary twist. Family recipes passed down generations, made with locally sourced ingredients.",
      phone: "+961 1 448 129",
      address: "12 Naher Street, Mar Mikhael",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
      extraFields: { cuisineTypes: ["Lebanese", "Mediterranean"], diningStyle: "casual", hasDelivery: false, hasOutdoorSeating: true, priceRange: "$$" },
    },
  });

  const table1 = await prisma.resource.create({ data: { businessId: restaurant.id, name: "Table 1 (Indoor)", type: ResourceType.TABLE, description: "2-4 pax indoor table" } });
  const table2 = await prisma.resource.create({ data: { businessId: restaurant.id, name: "Table 2 (Terrace)", type: ResourceType.TABLE, description: "4-6 pax outdoor terrace" } });
  for (const t of [table1, table2]) await addSchedules(t.id, [2, 3, 4, 5, 6, 0], "12:00", "22:00");
  await prisma.service.create({ data: { businessId: restaurant.id, name: "Table Reservation", durationMinutes: 90, price: new Decimal(0), currency: "USD", description: "Reserve your table (no charge)" } });

  // ─── 4. NIGHTLIFE ────────────────────────────────────

  const bar = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "The Rooftop Bar",
      slug: "the-rooftop-bar",
      category: BusinessCategory.NIGHTLIFE,
      description: "Beirut's most iconic rooftop bar with panoramic city views, craft cocktails, and live DJ sets every weekend.",
      phone: "+961 71 900 111",
      address: "Rooftop Level, Downtown",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80"],
      extraFields: { venueType: "rooftop", musicGenre: ["House", "R&B", "Mixed"], dressCode: "smart_casual", ageRestriction: 21, hasVIP: true },
    },
  });

  const vipSection = await prisma.resource.create({ data: { businessId: bar.id, name: "VIP Lounge", type: ResourceType.VENUE_SPACE, description: "Private VIP section with bottle service" } });
  const generalArea = await prisma.resource.create({ data: { businessId: bar.id, name: "General Area", type: ResourceType.VENUE_SPACE, description: "Open-air general seating" } });
  for (const r of [vipSection, generalArea]) await addSchedules(r.id, [4, 5, 6], "20:00", "03:00");
  await prisma.service.create({ data: { businessId: bar.id, name: "Table Reservation", durationMinutes: 180, price: new Decimal(50), currency: "USD", description: "Minimum spend reservation" } });

  // ─── 5. WELLNESS ─────────────────────────────────────

  const spa = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Zen Spa Jounieh",
      slug: "zen-spa-jounieh",
      category: BusinessCategory.WELLNESS,
      description: "Tranquil spa retreat offering traditional hammam, massages, and holistic wellness treatments. Your sanctuary of relaxation in Jounieh.",
      phone: "+961 9 912 345",
      address: "Rue Maameltein, Jounieh",
      city: "Jounieh",
      images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"],
      extraFields: { wellnessTypes: ["Massage", "Hammam", "Aromatherapy", "Hot Stone"], hasPool: false, hasSauna: true, couplesAvailable: true },
    },
  });

  const massageRoom = await prisma.resource.create({ data: { businessId: spa.id, name: "Room 1 — Massage", type: ResourceType.ROOM, description: "Private massage room" } });
  const hammamRoom = await prisma.resource.create({ data: { businessId: spa.id, name: "Hammam Suite", type: ResourceType.ROOM, description: "Traditional Lebanese hammam" } });
  for (const r of [massageRoom, hammamRoom]) await addSchedules(r.id, [1, 2, 3, 4, 5, 6, 0], "09:00", "20:00");
  await prisma.service.create({ data: { businessId: spa.id, name: "Swedish Massage", durationMinutes: 60, price: new Decimal(50), currency: "USD" } });
  await prisma.service.create({ data: { businessId: spa.id, name: "Traditional Hammam", durationMinutes: 90, price: new Decimal(70), currency: "USD" } });

  // ─── 6. MEN_CARE ─────────────────────────────────────

  const barber = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "The Beirut Barber",
      slug: "the-beirut-barber",
      category: BusinessCategory.MEN_CARE,
      description: "Classic barbershop meets modern grooming. Precision cuts, hot shaves, and beard sculpting in a relaxed old-school atmosphere.",
      phone: "+961 70 555 222",
      address: "45 Gemmayzeh Street",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80"],
      extraFields: { specialties: ["Haircut", "Beard Trim", "Shave", "Eyebrow Grooming"], walkInsAccepted: true },
    },
  });

  const barber1 = await prisma.resource.create({ data: { businessId: barber.id, name: "Charbel", type: ResourceType.STAFF, description: "Master barber, 10 years experience" } });
  await addSchedules(barber1.id, [1, 2, 3, 4, 5, 6], "09:00", "20:00");
  await prisma.service.create({ data: { businessId: barber.id, name: "Haircut", durationMinutes: 30, price: new Decimal(15), currency: "USD" } });
  await prisma.service.create({ data: { businessId: barber.id, name: "Beard Trim & Shape", durationMinutes: 30, price: new Decimal(12), currency: "USD" } });
  await prisma.service.create({ data: { businessId: barber.id, name: "Hot Shave", durationMinutes: 45, price: new Decimal(20), currency: "USD" } });

  // ─── 7. STUDIOS_CLASSES ──────────────────────────────

  const studio = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Beirut Art & Yoga Studio",
      slug: "beirut-art-yoga-studio",
      category: BusinessCategory.STUDIOS_CLASSES,
      description: "A creative space for yoga, painting, and dance classes. All levels welcome. Small class sizes for personalized instruction.",
      phone: "+961 1 744 888",
      address: "78 Rue Armenia, Gemmayze",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80"],
      extraFields: { classTypes: ["Yoga", "Pilates", "Art", "Dance"], skillLevel: "all_levels", maxClassSize: 10, providesEquipment: true },
    },
  });

  const yogaInstructor = await prisma.resource.create({ data: { businessId: studio.id, name: "Maya (Yoga)", type: ResourceType.INSTRUCTOR, description: "Certified yoga and pilates instructor" } });
  await addSchedules(yogaInstructor.id, weekdays, "07:00", "19:00");
  await prisma.service.create({ data: { businessId: studio.id, name: "Yoga Class (1hr)", durationMinutes: 60, price: new Decimal(20), currency: "USD" } });
  await prisma.service.create({ data: { businessId: studio.id, name: "Art Workshop (2hr)", durationMinutes: 120, price: new Decimal(35), currency: "USD" } });

  // ─── 8. HEALTH_CARE ──────────────────────────────────

  const clinic = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Vitality Physiotherapy",
      slug: "vitality-physiotherapy",
      category: BusinessCategory.HEALTH_CARE,
      description: "Professional physiotherapy and rehabilitation center. Our licensed therapists treat sports injuries, back pain, and post-surgical recovery.",
      phone: "+961 9 223 441",
      address: "Rue du Liban, Kaslik",
      city: "Jounieh",
      images: ["https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80"],
      extraFields: { healthServices: ["Physiotherapy", "Chiropractic", "Nutrition"], acceptsInsurance: true, licenseNumber: "LB-PHYS-2041" },
    },
  });

  const therapist = await prisma.resource.create({ data: { businessId: clinic.id, name: "Dr. Hana Khoury", type: ResourceType.STAFF, description: "Licensed physiotherapist, sports rehab specialist" } });
  await addSchedules(therapist.id, weekdays, "08:00", "18:00");
  await prisma.service.create({ data: { businessId: clinic.id, name: "Physiotherapy Session", durationMinutes: 45, price: new Decimal(60), currency: "USD" } });
  await prisma.service.create({ data: { businessId: clinic.id, name: "Initial Assessment", durationMinutes: 60, price: new Decimal(80), currency: "USD" } });

  // ─── 9. EVENTS ───────────────────────────────────────

  const eventVenue = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "The Grand Hall Byblos",
      slug: "grand-hall-byblos",
      category: BusinessCategory.EVENTS,
      description: "Stunning event venue in historic Byblos with sea views. Perfect for weddings, corporate events, and cultural celebrations.",
      phone: "+961 9 540 100",
      address: "Port of Byblos",
      city: "Byblos",
      images: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"],
      extraFields: { eventTypes: ["Wedding", "Conference", "Concert", "Exhibition"], venueCapacity: 500, isIndoor: true, isOutdoor: true },
    },
  });

  const mainHall = await prisma.resource.create({ data: { businessId: eventVenue.id, name: "Main Hall", type: ResourceType.VENUE_SPACE, description: "300-person capacity indoor ballroom" } });
  await addSchedules(mainHall.id, allDays, "09:00", "23:00");
  await prisma.service.create({ data: { businessId: eventVenue.id, name: "Full Day Venue Rental", durationMinutes: 480, price: new Decimal(1500), currency: "USD" } });
  await prisma.service.create({ data: { businessId: eventVenue.id, name: "Half Day Rental", durationMinutes: 240, price: new Decimal(800), currency: "USD" } });

  // ─── 10. ATTRACTIONS_TOURISM ─────────────────────────

  const tourOperator = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Lebanon Explorers",
      slug: "lebanon-explorers",
      category: BusinessCategory.ATTRACTIONS_TOURISM,
      description: "Discover Lebanon's hidden gems with our expert local guides. From cedar forests to ancient ruins, we offer unforgettable day trips.",
      phone: "+961 71 777 888",
      address: "Martyrs Square",
      city: "Beirut",
      images: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80"],
      extraFields: { attractionType: ["Historical", "Natural", "Cultural"], tourDuration: "Full day", languages: ["English", "Arabic", "French"], accessibility: false },
    },
  });

  const guide1 = await prisma.resource.create({ data: { businessId: tourOperator.id, name: "Karim (English Guide)", type: ResourceType.GUIDE, description: "Certified tour guide, 8 years experience" } });
  await addSchedules(guide1.id, allDays, "07:00", "18:00");
  await prisma.service.create({ data: { businessId: tourOperator.id, name: "Jeita & Harissa Day Tour", durationMinutes: 480, price: new Decimal(65), currency: "USD" } });
  await prisma.service.create({ data: { businessId: tourOperator.id, name: "Baalbek Full Day Tour", durationMinutes: 600, price: new Decimal(75), currency: "USD" } });

  // ─── 11. ACTIVITIES_EXPERIENCES ──────────────────────

  const adventure = await prisma.business.create({
    data: {
      ownerId: owner.id,
      name: "Lebanon Adventure Co.",
      slug: "lebanon-adventure-co",
      category: BusinessCategory.ACTIVITIES_EXPERIENCES,
      description: "Thrilling outdoor adventures for all levels. Hiking, canyoning, and paragliding in Lebanon's stunning mountain landscapes.",
      phone: "+961 3 456 789",
      address: "Faraya Mountain Resort",
      city: "Faraya",
      images: ["https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80"],
      extraFields: { activityTypes: ["Hiking", "Paragliding", "Canyoning", "ATV"], difficultyLevel: "moderate", groupSizeMin: 2, groupSizeMax: 12, ageRequirement: 16 },
    },
  });

  const equipment1 = await prisma.resource.create({ data: { businessId: adventure.id, name: "Paragliding Tandem", type: ResourceType.EQUIPMENT, description: "Tandem paraglide with certified pilot" } });
  await addSchedules(equipment1.id, [5, 6, 0], "08:00", "17:00");
  await prisma.service.create({ data: { businessId: adventure.id, name: "Tandem Paraglide", durationMinutes: 30, price: new Decimal(90), currency: "USD" } });
  await prisma.service.create({ data: { businessId: adventure.id, name: "Half-Day Hike", durationMinutes: 240, price: new Decimal(40), currency: "USD" } });

  // ─── Sample Bookings & Reviews ───────────────────────

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);
  pastDate.setHours(0, 0, 0, 0);

  const booking1 = await prisma.booking.create({
    data: {
      userId: customer.id, resourceId: court1.id, serviceId: padelSession.id,
      date: tomorrow, startTime: "10:00", endTime: "11:00",
      status: BookingStatus.CONFIRMED, totalPrice: new Decimal(25),
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      userId: customer.id, resourceId: stylist1.id, serviceId: haircut.id,
      date: pastDate, startTime: "10:00", endTime: "10:45",
      status: BookingStatus.COMPLETED, totalPrice: new Decimal(20),
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: customer.id, resourceId: court2.id, serviceId: padelSession.id,
      date: pastDate, startTime: "14:00", endTime: "15:00",
      status: BookingStatus.COMPLETED, totalPrice: new Decimal(25),
    },
  });

  await prisma.review.create({
    data: { userId: customer.id, businessId: sportsVenue.id, bookingId: booking3.id, rating: 5, comment: "Excellent courts! Well maintained and great lighting for evening games." },
  });
  await prisma.review.create({
    data: { userId: customer.id, businessId: salon.id, bookingId: booking2.id, rating: 4, comment: "Nadia did an amazing job. Very professional and friendly." },
  });

  console.log("✅ Seed complete: 11 businesses across all categories");
  console.log(`   Users: ${customer.email} | ${owner.email}`);
  console.log("   Bookings: 3 | Reviews: 2");

  void booking1;
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

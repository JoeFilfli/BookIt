import { prisma } from "@/lib/utils/prisma";
import { notFound } from "next/navigation";
import BookingPanel from "./BookingPanel";
import ReviewsSection from "./ReviewsSection";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
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
    },
  });

  if (!business) notFound();

  const [reviewAggregate, initialReviews, totalReviews] = await Promise.all([
    prisma.review.aggregate({
      where: { businessId: business.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { businessId: business.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.count({ where: { businessId: business.id } }),
  ]);

  const averageRating = reviewAggregate._avg.rating
    ? Math.round(reviewAggregate._avg.rating * 10) / 10
    : 0;
  const totalPages = Math.ceil(totalReviews / 10);

  // Compute operating hours from resource schedules
  const allSchedules = business.resources.flatMap((r) => r.schedules);
  const hoursByDay: Record<number, { start: string; end: string }> = {};
  for (const s of allSchedules) {
    if (!hoursByDay[s.dayOfWeek] || s.startTime < hoursByDay[s.dayOfWeek].start) {
      hoursByDay[s.dayOfWeek] = {
        start: s.startTime,
        end: hoursByDay[s.dayOfWeek]?.end > s.endTime
          ? hoursByDay[s.dayOfWeek].end
          : s.endTime,
      };
    }
    if (s.endTime > hoursByDay[s.dayOfWeek].end) {
      hoursByDay[s.dayOfWeek] = { ...hoursByDay[s.dayOfWeek], end: s.endTime };
    }
  }

  // Serialize for client components (Decimal → string, Date → ISO string)
  const serializedServices = business.services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    price: s.price.toString(),
    currency: s.currency,
  }));

  const serializedResources = business.resources.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    type: r.type as string,
    imageUrl: r.imageUrl,
  }));

  const serializedReviews = initialReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="bg-gray-200">
        {business.images.length > 0 ? (
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-h-96 overflow-hidden">
              {business.images.slice(0, 3).map((url, i) => (
                <div key={i} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                  <img
                    src={url}
                    alt={`${business.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl flex items-center justify-center h-48 text-6xl text-gray-400">
            {business.category === "SPORTS" ? "⚽" : "✂️"}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Business Info */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {business.name}
                  </h1>
                  <p className="mt-1 text-gray-500">
                    {business.address}, {business.city}
                  </p>
                </div>
                {averageRating > 0 && (
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <StarRating rating={averageRating} size="lg" />
                      <span className="text-lg font-semibold">{averageRating}</span>
                    </div>
                    <p className="text-sm text-gray-500">{totalReviews} reviews</p>
                  </div>
                )}
              </div>
              {business.description && (
                <p className="mt-4 text-gray-600">{business.description}</p>
              )}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span>Phone: {business.phone}</span>
                {business.owner && (
                  <span>By {business.owner.name}</span>
                )}
              </div>
            </div>

            {/* Operating Hours */}
            {Object.keys(hoursByDay).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Operating Hours
                </h2>
                <div className="mt-4 space-y-2">
                  {DAYS.map((day, i) => (
                    <div
                      key={day}
                      className="flex justify-between text-sm py-1 border-b border-gray-100"
                    >
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900">
                        {hoursByDay[i]
                          ? `${hoursByDay[i].start} - ${hoursByDay[i].end}`
                          : "Closed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {serializedServices.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                <div className="mt-4 space-y-3">
                  {serializedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-gray-500">
                            {service.description}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-400">
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${Number(service.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">{service.currency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {serializedResources.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {business.category === "SPORTS"
                    ? "Courts & Facilities"
                    : "Our Team"}
                </h2>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serializedResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="rounded-lg bg-white p-4 shadow-sm"
                    >
                      {resource.imageUrl && (
                        <img
                          src={resource.imageUrl}
                          alt={resource.name}
                          className="h-32 w-full rounded-lg object-cover"
                        />
                      )}
                      <h3 className="mt-2 font-medium text-gray-900">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {resource.type.toLowerCase()}
                      </p>
                      {resource.description && (
                        <p className="mt-1 text-sm text-gray-400">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection
              businessId={business.id}
              initialReviews={serializedReviews}
              totalReviews={totalReviews}
              averageRating={averageRating}
              totalPages={totalPages}
            />
          </div>

          {/* Right: Booking Panel */}
          <BookingPanel
            businessId={business.id}
            businessSlug={business.slug}
            businessCategory={business.category as string}
            services={serializedServices}
            resources={serializedResources}
          />
        </div>
      </div>
    </main>
  );
}

# Booking Marketplace — Claude Code Prompts

## STEP 0: Project Setup

```
Scaffold a Next.js 14+ booking marketplace monorepo with the following specs:

Framework & Stack:
- Next.js 14+ with App Router and TypeScript (strict mode)
- Tailwind CSS with RTL plugin (@tailwindcss/rtl or tailwindcss-rtl) configured
- Prisma ORM (do NOT create models yet — just initialize Prisma with PostgreSQL datasource)
- NextAuth.js installed and configured for Google OAuth + Credentials (email/password)
- React Query (@tanstack/react-query) with provider wrapper
- Cloudinary SDK (cloudinary and next-cloudinary)

Project Structure:
/app
  /api            → API route handlers (empty folders for now):
    /auth           → NextAuth route ([...nextauth])
    /businesses
    /services
    /resources
    /availability
    /bookings
    /reviews
  /(public)       → public-facing pages (placeholder files):
    /page.tsx       → homepage
    /[category]     → category listing
    /business/[slug] → business profile
  /(dashboard)    → business dashboard (placeholder files):
    /dashboard
  /(account)      → customer account (placeholder files):
    /bookings
  /login          → auth page
/lib
  /types          → shared TypeScript types and interfaces
  /utils          → helper functions
  /hooks          → React Query hooks (empty for now)
  /auth           → NextAuth config
/prisma
  /schema.prisma  → initialized, no models yet
/public           → static assets
/messages         → i18n translation files:
  /en.json        → English (active)
  /ar.json        → Arabic (placeholder, empty structure)

Configuration:
- next.config.js with i18n configured for 'en' (default) and 'ar' locales
- tailwind.config.js with RTL plugin enabled
- .env.example with all required env vars:
  DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
  CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
  EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_FROM
- tsconfig.json with path aliases (@/lib, @/app, etc.)
- .gitignore configured for Next.js + Prisma + node_modules + .env

Do NOT install NestJS or Express. All backend logic goes in Next.js API Route Handlers.
Do NOT create any database models yet.
Do NOT build any UI yet — just placeholder pages that say "Coming Soon" or similar.
Focus on a clean, working scaffold that builds and runs with `npm run dev`.

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Manual checks in the browser/API
- Expected results for each check
```

---

## STEP 1: Database Schema

```
In the existing Next.js project, define the Prisma schema for the booking marketplace.

Create these models in prisma/schema.prisma:

1. User
   - id: UUID, default auto-generated
   - name: String
   - email: String, unique
   - emailVerified: DateTime (for NextAuth)
   - phone: String, optional
   - avatarUrl: String, optional
   - googleId: String, optional, unique
   - hashedPassword: String, optional (null if Google-only user)
   - createdAt, updatedAt timestamps

2. Account + Session + VerificationToken
   - Standard NextAuth Prisma adapter models (use @auth/prisma-adapter schema)
   - This is required for NextAuth to work with Prisma

3. Business
   - id: UUID
   - ownerId: references User
   - name: String
   - slug: String, unique (URL-friendly)
   - category: Enum (SPORTS, SALON) — use Prisma enum called BusinessCategory
   - description: String, optional
   - phone: String
   - address: String
   - city: String
   - latitude: Float, optional
   - longitude: Float, optional
   - images: String[] (array of Cloudinary URLs)
   - extraFields: Json, optional (category-specific data)
   - createdAt, updatedAt

4. Resource
   - id: UUID
   - businessId: references Business (cascade delete)
   - name: String (e.g., "Court 1", "Nadia")
   - type: Enum (COURT, STAFF, ROOM) — use Prisma enum called ResourceType
   - description: String, optional
   - imageUrl: String, optional
   - createdAt, updatedAt

5. Service
   - id: UUID
   - businessId: references Business (cascade delete)
   - name: String (e.g., "Padel Session", "Haircut")
   - description: String, optional
   - durationMinutes: Int
   - price: Decimal (use Prisma Decimal type)
   - currency: String, default "USD"
   - createdAt, updatedAt

6. ResourceSchedule
   - id: UUID
   - resourceId: references Resource (cascade delete)
   - dayOfWeek: Int (0 = Sunday, 6 = Saturday)
   - startTime: String (HH:MM format, e.g., "08:00")
   - endTime: String (HH:MM format, e.g., "22:00")
   - Unique constraint on [resourceId, dayOfWeek, startTime] to prevent duplicate schedule blocks

7. Booking
   - id: UUID
   - userId: references User
   - resourceId: references Resource
   - serviceId: references Service
   - date: DateTime (date only, store as start of day)
   - startTime: String (HH:MM format)
   - endTime: String (HH:MM format)
   - status: Enum (CONFIRMED, COMPLETED, CANCELLED) — default CONFIRMED
   - totalPrice: Decimal
   - notes: String, optional
   - createdAt, updatedAt

8. Review
   - id: UUID
   - userId: references User
   - businessId: references Business (cascade delete)
   - bookingId: references Booking, optional, unique (one review per booking)
   - rating: Int (1-5)
   - comment: String, optional
   - createdAt, updatedAt

Relations:
- User has many Businesses (as owner), Bookings, Reviews
- Business has many Resources, Services, Reviews. Belongs to User (owner)
- Resource has many ResourceSchedules, Bookings. Belongs to Business
- Service has many Bookings. Belongs to Business
- No direct link between Service and Resource — any resource at a business can perform any service at that business

Also create:
- prisma/seed.ts with sample data:
  - 2 users (one customer, one who owns businesses)
  - 1 sports venue with 3 courts, 2 services, schedules for each court
  - 1 salon with 2 staff members, 3 services, schedules for each stylist
  - A few sample bookings and reviews
- Add seed script to package.json: "prisma:seed": "tsx prisma/seed.ts"

Also update /lib/types with TypeScript types that mirror the Prisma models for use in frontend components.

Run `npx prisma generate` after creating the schema to make sure it compiles.
Do NOT run migrations yet — just validate the schema compiles cleanly.

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- API/database verification checks
- Expected results for each check
```

---

## STEP 2: Authentication

```
Implement authentication in the existing Next.js project using NextAuth.js v5 (Auth.js).

Setup:
- Use Prisma adapter (@auth/prisma-adapter) to store sessions/accounts in the database
- Configure JWT strategy (not database sessions) for API route protection
- Session includes: user id, email, name, avatarUrl

Providers:
1. Google OAuth
   - Standard Google provider configuration
   - If a user signs in with Google and an account with that email already exists, link them automatically
   - Store googleId on User model

2. Credentials (email + password)
   - Registration endpoint: POST /api/auth/register
     - Input: name, email, password
     - Hash password with bcrypt
     - Return user (without password)
     - Validate: email format, password min 8 chars, name required
   - Login via NextAuth Credentials provider
     - Verify email + bcrypt password
     - Return user object for JWT

Auth utilities:
- /lib/auth/config.ts — NextAuth configuration
- /lib/auth/helpers.ts — helper functions:
  - getCurrentUser(req) — extract user from JWT in API routes
  - requireAuth(req) — same but throws 401 if not authenticated
  - requireBusinessOwner(req, businessId) — verify user owns the business, throw 403 if not

API route middleware pattern:
- Create a consistent pattern for protected API routes using the helpers above
- Example: GET /api/bookings should use requireAuth()
- Example: PUT /api/businesses/[id] should use requireBusinessOwner()

Auth page:
- /app/login/page.tsx
  - Google OAuth button ("Continue with Google")
  - Email + password form with toggle between "Sign In" and "Sign Up"
  - Form validation with error messages
  - Redirect to homepage after login
  - Use Tailwind CSS for styling, keep it clean and minimal

Do NOT implement phone verification or WhatsApp — those come later.
Do NOT implement role-based access — business ownership is determined by whether the user has a Business record linked to their userId.

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Auth flow test cases (success and failure)
- Expected results for each test
```

---

## STEP 3: Business Management

```
Implement business profile management in the existing Next.js project.

API Routes — /app/api/businesses/:

1. POST /api/businesses
   - Protected: requireAuth
   - Input: name, category (SPORTS or SALON), description, phone, address, city, latitude, longitude, images (Cloudinary URLs), extraFields (JSON)
   - Auto-generate slug from name (lowercase, hyphenated, append random suffix if duplicate)
   - Category-specific extraFields validation:
     - SPORTS: { courtCount: number, sportTypes: string[], surfaceType: string, indoor: boolean }
     - SALON: { specialties: string[], genderFocus: "men" | "women" | "unisex" }
   - Return created business

2. GET /api/businesses
   - Public (no auth required)
   - Query params: category, city, search (name search), minRating, page, limit
   - Return paginated list with average rating calculated from reviews
   - Sort by: rating (default), newest, name

3. GET /api/businesses/[slug]
   - Public
   - Return full business profile with:
     - All resources and their schedules
     - All services
     - Reviews with user names
     - Average rating and review count
     - Owner info (name, avatar only)

4. PUT /api/businesses/[id]
   - Protected: requireBusinessOwner
   - Update any business fields
   - Re-validate extraFields based on category

5. DELETE /api/businesses/[id]
   - Protected: requireBusinessOwner
   - Cascade deletes handled by Prisma

Image Upload:
- POST /api/upload
  - Protected: requireAuth
  - Accept image file, upload to Cloudinary
  - Return Cloudinary URL
  - Max 5MB, accept jpg/png/webp

Frontend Pages:

1. Create Business — /app/(dashboard)/dashboard/create/page.tsx
   - Step 1: Pick category (two cards: Sports Venue, Salon)
   - Step 2: Common fields form (name, description, phone, address, city, image upload)
   - Step 3: Category-specific fields form
     - Sports: court count, sport types (multi-select: padel, tennis, basketball, football, etc.), surface type (dropdown), indoor/outdoor toggle
     - Salon: specialties (multi-select: haircut, coloring, nails, facial, etc.), gender focus (radio: men/women/unisex)
   - Submit creates business and redirects to dashboard
   - Use Tailwind CSS, clean minimal forms

2. Business Dashboard — /app/(dashboard)/dashboard/page.tsx
   - Show "Create your business" CTA if user has no businesses
   - If user has a business, show dashboard with:
     - Business name and status
     - Quick stats: total bookings, upcoming bookings, average rating
     - Navigation to: Edit Profile, Manage Resources, Manage Services, Manage Schedules, View Bookings
   - Placeholder sections for resources/services/schedules (built in Step 4)

3. Category Listing — /app/(public)/[category]/page.tsx
   - Grid of business cards showing: image, name, category, city, average rating, price range
   - Filter sidebar: city, minimum rating
   - Search bar
   - Pagination

4. Business Profile — /app/(public)/business/[slug]/page.tsx
   - Image gallery
   - Business info: name, description, address, phone, hours (derived from resource schedules)
   - Services list with prices and durations
   - Resources list with images and descriptions
   - Reviews section with average rating
   - Booking panel on right (desktop) / bottom sheet (mobile) — placeholder for now, built in Step 5
   - Use split-view layout: business info scrollable on left, booking panel sticky on right

React Query Hooks:
- useBusinesses(filters) — GET /api/businesses with query params
- useBusinessBySlug(slug) — GET /api/businesses/[slug]
- useCreateBusiness() — mutation POST /api/businesses
- useUpdateBusiness() — mutation PUT /api/businesses/[id]

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- API and UI test scenarios
- Expected results for each scenario
```

---

## STEP 4: Services, Resources & Availability

```
Implement services, resources, and availability schedule management in the existing Next.js project.

API Routes:

Services — /app/api/businesses/[businessId]/services/:
1. POST — create service (requireBusinessOwner). Input: name, description, durationMinutes, price, currency
2. GET — list all services for a business (public)
3. PUT /[serviceId] — update service (requireBusinessOwner)
4. DELETE /[serviceId] — delete service (requireBusinessOwner)

Resources — /app/api/businesses/[businessId]/resources/:
1. POST — create resource (requireBusinessOwner). Input: name, type (COURT/STAFF/ROOM), description, imageUrl
2. GET — list all resources for a business (public)
3. PUT /[resourceId] — update resource (requireBusinessOwner)
4. DELETE /[resourceId] — delete resource (requireBusinessOwner)

Resource Schedules — /app/api/resources/[resourceId]/schedules/:
1. POST — add schedule block (requireBusinessOwner via resource->business->owner check)
   Input: dayOfWeek (0-6), startTime (HH:MM), endTime (HH:MM)
   Validation: endTime > startTime, no overlapping blocks for same resource and day
2. GET — list all schedule blocks for a resource (public)
3. PUT /[scheduleId] — update schedule block
4. DELETE /[scheduleId] — delete schedule block

Available Slots — /app/api/businesses/[businessId]/availability:
GET — calculate and return available time slots
Query params: resourceId, serviceId, date (YYYY-MM-DD)
Logic:
  1. Get the resource's schedule for that day of week
  2. Get the service's duration
  3. Generate all possible start times within the schedule windows (in 15-min or duration-based increments)
  4. Subtract any existing confirmed bookings that overlap
  5. Return array of { startTime, endTime } available slots
Example: Resource schedule 08:00-22:00, service is 60min, existing booking 10:00-11:00
  → Returns: 08:00-09:00, 09:00-10:00, 11:00-12:00, 12:00-13:00, ..., 21:00-22:00
If resource has multiple schedule blocks in a day (e.g., 10:00-13:00 and 14:00-19:00), generate slots within each block separately.

Dashboard Pages:

1. Manage Resources — /app/(dashboard)/dashboard/resources/page.tsx
   - List existing resources with edit/delete
   - "Add Resource" form: name, type (auto-selected based on business category — COURT for sports, STAFF for salon), description, image upload
   - Simple and clean table or card layout

2. Manage Services — /app/(dashboard)/dashboard/services/page.tsx
   - List existing services with edit/delete
   - "Add Service" form: name, description, duration (dropdown: 15, 30, 45, 60, 90, 120 min), price
   - Simple and clean table or card layout

3. Manage Schedules — /app/(dashboard)/dashboard/schedules/page.tsx
   - Select a resource from dropdown
   - Show 7-day week grid (Sun-Sat)
   - For each day: show existing schedule blocks, "Add Schedule" form with start time and end time (time pickers)
   - Simple form per resource per day — NOT a drag calendar
   - Allow multiple blocks per day (for breaks workaround)
   - Delete individual schedule blocks

React Query Hooks:
- useServices(businessId)
- useCreateService(), useUpdateService(), useDeleteService()
- useResources(businessId)
- useCreateResource(), useUpdateResource(), useDeleteResource()
- useSchedules(resourceId)
- useCreateSchedule(), useUpdateSchedule(), useDeleteSchedule()
- useAvailableSlots(businessId, resourceId, serviceId, date)

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- API and dashboard interaction tests
- Expected results for each test
```

---

## STEP 5: Booking Engine

```
Implement the booking engine in the existing Next.js project.

API Routes:

1. POST /api/bookings
   - Protected: requireAuth
   - Input: resourceId, serviceId, date (YYYY-MM-DD), startTime (HH:MM)
   - Logic (all inside a Prisma transaction with row-level locking):
     a. Verify the resource exists and belongs to a business
     b. Verify the service exists and belongs to the same business
     c. Calculate endTime from startTime + service.durationMinutes
     d. Verify the time slot falls within the resource's schedule for that day of week
     e. Use raw SQL inside the transaction: SELECT FOR UPDATE to lock existing bookings for this resource on this date
     f. Check no overlapping confirmed bookings exist for this resource, date, and time range
     g. If available: create booking with status CONFIRMED, totalPrice = service.price
     h. If not available: return 409 Conflict with message "This slot is no longer available"
   - Return the created booking with business, resource, and service details

2. GET /api/bookings
   - Protected: requireAuth
   - Returns bookings for the current user
   - Query params: status (filter), upcoming (boolean — date >= today), page, limit
   - Include: business name, resource name, service name
   - Sort by date descending

3. GET /api/bookings/business/[businessId]
   - Protected: requireBusinessOwner
   - Returns all bookings for that business
   - Query params: status, date, resourceId, page, limit
   - Include: user name, resource name, service name

4. PATCH /api/bookings/[id]/cancel
   - Protected: requireAuth
   - Only the booking user OR the business owner can cancel
   - Set status to CANCELLED
   - Return updated booking

5. PATCH /api/bookings/[id]/complete
   - Protected: requireBusinessOwner (of the booking's business)
   - Set status to COMPLETED
   - Return updated booking

Frontend — Booking Flow (inside business profile page):

Update /app/(public)/business/[slug]/page.tsx booking panel:
- The booking panel sits on the right (desktop) or as a bottom sheet (mobile)
- Flow within the panel:
  1. Select a service (list of services with name, duration, price)
  2. Select a resource (list of resources with name, image)
  3. Select a date (date picker, starting from today)
  4. Select available time (call useAvailableSlots, show available time buttons)
  5. Review summary: service, resource, date, time, price
  6. "Confirm Booking" button
  7. On success: show confirmation with details and friendly note "Please cancel at least 2 hours in advance so others can book"
  8. On 409 conflict: show "This slot was just booked by someone else. Please choose another time." and refresh available slots
- If user is not logged in, show "Sign in to book" button that redirects to /login with a return URL

Customer Bookings Page — /app/(account)/bookings/page.tsx:
- Tabs: Upcoming / Past
- Each booking card shows: business name, service, resource, date, time, status, price
- "Cancel" button on upcoming confirmed bookings
- "Leave Review" button on completed bookings (only if no review exists yet)
- Cancellation shows friendly note before confirming

Business Bookings Page — /app/(dashboard)/dashboard/bookings/page.tsx:
- Table/list of all bookings for the business
- Filter by: resource, status, date
- Each row: customer name, service, resource, date, time, status
- "Mark Complete" and "Cancel" action buttons
- Sort by date

React Query Hooks:
- useCreateBooking() — mutation POST /api/bookings
- useUserBookings(filters) — GET /api/bookings
- useBusinessBookings(businessId, filters) — GET /api/bookings/business/[businessId]
- useCancelBooking() — mutation PATCH /api/bookings/[id]/cancel
- useCompleteBooking() — mutation PATCH /api/bookings/[id]/complete

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Concurrency and conflict test scenarios (including 409 case)
- Expected results for each scenario
```

---

## STEP 6: Notifications (Email)

```
Implement email notifications in the existing Next.js project.

Setup:
- Install Resend SDK (resend)
- Add RESEND_API_KEY to .env.example
- Create /lib/email/client.ts — Resend client initialization
- Create /lib/email/templates/ — email template functions

Email Templates (use React Email or simple HTML strings):

1. Booking Confirmation — sent to CUSTOMER
   Subject: "Booking Confirmed — {serviceName} at {businessName}"
   Body:
   - Greeting with customer name
   - Booking details: business name, service, resource, date, time, price
   - Business address and phone
   - Friendly note: "Need to cancel? You can do so anytime from your bookings page."
   - Link to bookings page

2. Booking Notification — sent to BUSINESS OWNER
   Subject: "New Booking — {serviceName} by {customerName}"
   Body:
   - New booking alert
   - Customer name
   - Booking details: service, resource, date, time
   - Link to business dashboard bookings

3. Booking Cancellation — sent to BOTH customer and business owner
   Subject: "Booking Cancelled — {serviceName} at {businessName}"
   Body:
   - Cancellation confirmation
   - Cancelled booking details
   - Who cancelled (customer or business)

Integration:
- Create /lib/email/send.ts with functions:
  - sendBookingConfirmation(booking, customer, business)
  - sendBookingNotification(booking, customer, businessOwner)
  - sendBookingCancellation(booking, customer, businessOwner, cancelledBy)

- Update POST /api/bookings:
  After successful booking creation, send confirmation email to customer AND notification email to business owner.
  Email sending should NOT block the API response — use a fire-and-forget pattern (call the send function but don't await it, or use a try/catch that logs errors but doesn't fail the request).

- Update PATCH /api/bookings/[id]/cancel:
  After successful cancellation, send cancellation email to both parties.

Keep emails simple and clean. No complex HTML layouts needed — just clear, readable text with the essential details.

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Email-trigger test cases
- Expected results (including what should happen if email sending fails)
```

---

## STEP 7: Reviews

```
Implement the review system in the existing Next.js project.

API Routes:

1. POST /api/reviews
   - Protected: requireAuth
   - Input: bookingId, rating (1-5), comment (optional)
   - Validation:
     - Booking must exist and belong to the current user
     - Booking status must be COMPLETED
     - No existing review for this booking (enforced by unique constraint)
     - Rating must be integer 1-5
   - Creates review linked to user, business (via booking), and booking
   - Return created review

2. GET /api/businesses/[businessId]/reviews
   - Public
   - Returns paginated reviews for the business
   - Include: user name, user avatar, rating, comment, createdAt
   - Sort by newest first
   - Also return aggregate: averageRating, totalReviews

Frontend:

1. Review Form — shown on customer bookings page for completed bookings
   - Star rating selector (1-5 stars, clickable)
   - Optional comment textarea
   - Submit button
   - Show success message after submission
   - Hide "Leave Review" button once review exists

2. Reviews Section — on business profile page
   - Average rating with star display and count
   - List of individual reviews: user avatar, name, rating stars, comment, date
   - Pagination (load more)

React Query Hooks:
- useCreateReview() — mutation POST /api/reviews
- useBusinessReviews(businessId, page) — GET /api/businesses/[businessId]/reviews

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Review submission and listing test cases
- Expected results for each case
```

---

## STEP 8: Homepage & Navigation

```
Build the homepage and global navigation for the existing Next.js project.

Navigation — /app/components/Navbar.tsx:
- Logo/brand name on the left
- Category links: Sports, Salons
- Search bar (expandable on mobile)
- Right side:
  - If logged out: "Sign In" button
  - If logged in: user avatar dropdown with:
    - "My Bookings" link
    - "Business Dashboard" link (always visible — if they have no business, dashboard shows the create CTA)
    - "Sign Out"
- Mobile: hamburger menu with same links
- Sticky top navbar

Homepage — /app/(public)/page.tsx:
- Hero section:
  - Headline: "Book Sports Courts & Salons in Lebanon"
  - Subtitle: "Find and book the best venues instantly"
  - Search bar: text input + category dropdown (All, Sports, Salons) + "Search" button
  - Search redirects to /[category]?search=query

- Category Tiles Section:
  - Two large cards: "Sports & Courts" and "Salons"
  - Each card has an image/icon, name, brief description, count of businesses
  - Click navigates to /sports or /salons

- Featured Businesses Section:
  - "Popular in Sports" — top 4 sports businesses by rating
  - "Popular in Salons" — top 4 salon businesses by rating
  - Business cards: image, name, city, rating, price range indicator
  - "View All" link to category page

- Footer:
  - About, Contact, Terms links (placeholder pages)
  - "List Your Business" CTA
  - Copyright

API:
- GET /api/businesses/featured — returns top 4 per category by average rating (for homepage)

Keep the design clean, modern, and mobile-first. Use Tailwind CSS.
Think booking.com meets ClassPass — professional, trustworthy, easy to browse.

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Navigation/search/homepage behavior checks
- Expected results for each check
```

---

## STEP 9: Final Polish & Deployment

```
Final polish and deployment setup for the existing Next.js project.

1. Loading & Error States:
   - Add loading skeletons for: business listing cards, business profile, booking slots, bookings list
   - Add error boundaries with user-friendly error messages
   - Add empty states: "No businesses found", "No bookings yet", "No reviews yet"
   - Add toast notifications (use react-hot-toast or sonner): booking confirmed, booking cancelled, review submitted, errors

2. Form Validation:
   - Review all forms and add proper validation with error messages:
     - Registration: email format, password min 8 chars, name required
     - Create business: all required fields validated
     - Booking: all selections required before confirm button is enabled
   - Disable submit buttons while mutations are pending

3. Responsive Design Review:
   - Ensure all pages work on mobile (375px), tablet (768px), desktop (1024px+)
   - Business profile: booking panel becomes bottom sheet on mobile (use a slide-up drawer)
   - Navigation: hamburger menu on mobile
   - Category listing: single column on mobile, 2 on tablet, 3 on desktop

4. SEO Basics:
   - Add metadata to all pages (title, description) using Next.js Metadata API
   - Business profile pages: dynamic metadata from business name and description
   - Add a basic sitemap.ts

5. Security:
   - Rate limiting on auth routes (register, login) — use a simple in-memory rate limiter or upstash/ratelimit
   - Input sanitization on all API routes
   - Verify CORS is properly configured
   - Ensure all business-owner-only routes properly check ownership

6. Deployment to Railway:
   - Create a Dockerfile or use Railway's nixpacks (Next.js is auto-detected)
   - Add railway.toml or railway.json if needed
   - Build command: npx prisma generate && npx prisma migrate deploy && npm run build
   - Start command: npm start
   - Document all required environment variables for Railway:
     DATABASE_URL (Railway PostgreSQL plugin)
     NEXTAUTH_SECRET (generate with openssl rand -base64 32)
     NEXTAUTH_URL (Railway-provided domain)
     GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
     CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
     RESEND_API_KEY

7. Database:
   - Run: npx prisma migrate dev --name init (create initial migration)
   - Ensure seed script works: npx prisma db seed
   - Add to package.json: "prisma": { "seed": "tsx prisma/seed.ts" }

Test the complete flow manually:
1. Register with email → login → browse → view business → book a slot → check email → view booking → cancel → check email
2. Register with Google → same flow
3. Create a business → add resources → add services → add schedules → check it appears in listings → receive booking notification email

At the end of your response for this step, add a section titled "How to test this step" with:
- Exact commands to run
- Pre-deploy and post-deploy validation checklist
- Expected results for each validation item
```

---

## Running Order Checklist

- [ ] Step 0: Scaffold project → verify `npm run dev` works
- [ ] Step 1: Database schema → run `npx prisma generate` and `npx prisma migrate dev`
- [ ] Step 2: Auth → test Google login + email/password registration and login
- [ ] Step 3: Business management → create a test business, verify listing and profile pages
- [ ] Step 4: Services & availability → add resources, services, schedules, verify available slots API
- [ ] Step 5: Booking engine → book a slot, verify no double booking, test cancellation
- [ ] Step 6: Email notifications → verify emails sent on booking and cancellation
- [ ] Step 7: Reviews → leave a review, verify it shows on business profile
- [ ] Step 8: Homepage & nav → verify homepage loads, search works, navigation works
- [ ] Step 9: Polish & deploy → deploy to Railway, test full flow on production
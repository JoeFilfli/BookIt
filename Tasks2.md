# BookIt — Complete Claude Code Prompts (V2 Expanded)

## Overview

This document contains TWO sections:

**SECTION A** — Redesigned frontend prompts (Tasks 0–8) with the BookIt design system. These REPLACE the original MVP frontend steps. Run these AFTER your backend (Steps 0–6 from the original MVP prompts) is working.

**SECTION B** — Category expansion prompts (Tasks 9–12) that expand from 2 categories to all 11. Run these AFTER Section A is complete.

---

## DESIGN SYSTEM — COPY THIS INTO EVERY FRONTEND PROMPT

Copy everything between ===START=== and ===END=== and paste it at the TOP of every Claude Code prompt that involves UI work.

===START DESIGN SYSTEM===

DESIGN SYSTEM FOR BOOKIT — follow this exactly for all UI work.

Brand: BookIt — a booking marketplace in Lebanon.
Design Philosophy: Clean, conversion-focused layout (like Booking.com) with bold color energy and visual confidence (like Webook.com). Professional but not boring. Trustworthy but not corporate.

COLOR PALETTE (use CSS variables, define in globals.css):
--color-primary: #1A1A2E        (deep midnight navy — main backgrounds, headers)
--color-primary-light: #16213E  (slightly lighter navy — cards on dark bg, secondary sections)
--color-accent: #E94560          (vibrant coral-red — CTAs, highlights, active states, badges)
--color-accent-hover: #D63851    (darker coral — button hover states)
--color-accent-soft: rgba(233,69,96,0.1) (soft coral bg — subtle highlights, selected states)
--color-secondary: #0F3460       (royal blue — secondary buttons, links, information)
--color-surface: #FFFFFF          (white — main content areas, cards on light bg)
--color-surface-dim: #F5F6F8     (off-white — page backgrounds, alternating sections)
--color-surface-border: #E2E5EA  (light gray — borders, dividers)
--color-text-primary: #1A1A2E    (near-black — headings, body text on light bg)
--color-text-secondary: #6B7280  (medium gray — secondary text, labels, captions)
--color-text-on-dark: #FFFFFF    (white — text on dark backgrounds)
--color-text-on-dark-muted: rgba(255,255,255,0.7) (muted white — secondary text on dark bg)
--color-success: #10B981         (green — confirmations, available slots)
--color-warning: #F59E0B         (amber — warnings, limited availability)
--color-error: #EF4444           (red — errors, cancellations)
--color-star: #FBBF24            (gold — star ratings)

TYPOGRAPHY (import from Google Fonts):
- Display/Headings: "Plus Jakarta Sans", weight 700 and 800
- Body: "Plus Jakarta Sans", weight 400 and 500
- Accent/Small labels: "Plus Jakarta Sans", weight 600, uppercase tracking-wide for category tags
- DO NOT use Inter, Roboto, Arial, or system fonts

SPACING & LAYOUT:
- Max content width: 1280px (max-w-7xl), centered
- Page padding: px-4 mobile, px-6 tablet, px-8 desktop
- Section spacing: py-16 to py-24
- Card padding: p-4 to p-6
- Border radius: rounded-xl cards, rounded-lg buttons/inputs, rounded-full avatars/badges

SHADOWS & DEPTH:
- Cards: shadow-sm default, shadow-md hover
- Elevated (modals, dropdowns): shadow-xl
- Booking panel: shadow-2xl
- All hover: transition-all duration-200

BUTTONS:
- Primary: bg-accent text-white rounded-lg px-6 py-3 font-semibold hover:bg-accent-hover active:scale-[0.98]
- Secondary: border-2 border-primary text-primary rounded-lg px-6 py-3 hover:bg-primary hover:text-white
- Ghost: text-secondary hover:text-primary hover:bg-surface-dim rounded-lg px-4 py-2

CARDS:
- White bg, rounded-xl, shadow-sm, hover:shadow-md hover:translateY(-2px)
- Image top, content p-4, whole card clickable
- Category badge: uppercase pill, accent-soft bg, accent text

NAVIGATION:
- Sticky top-0, bg-primary, z-50, h-16 desktop, h-14 mobile
- Logo "Book" white + "It" accent, font-extrabold
- Mobile: hamburger → slide-in drawer from right

HERO (homepage):
- Gradient from-primary via-primary-light to-secondary
- Large search bar: white bg, rounded-2xl, shadow-2xl

BOOKING PANEL:
- Desktop: sticky right column, w-[400px], bg-white, rounded-2xl, shadow-2xl
- Mobile: bottom sheet, rounded-t-2xl, max-h-[85vh], drag handle

LOADING: skeleton screens with pulse, never spinners
ANIMATIONS: subtle and fast (150-200ms), card hover lifts, button scale on active
ICONS: Lucide React, w-4 inline, w-5 buttons, w-6 features
RESPONSIVE: mobile-first, 1 col mobile, 2 tablet, 3-4 desktop
EMPTY STATES: centered icon + heading + description + CTA button

===END DESIGN SYSTEM===

---

# SECTION A — REDESIGNED FRONTEND PROMPTS

---

## TASK 0: Design System Setup

```
Set up the BookIt design system foundation in the existing Next.js project.

1. Install Google Font "Plus Jakarta Sans" via next/font/google:
   - Import weights: 400, 500, 600, 700, 800
   - Apply as default font via Tailwind config and layout.tsx

2. Update tailwind.config.ts:
   - Extend colors with the full BookIt palette using CSS variable references:
     primary: { DEFAULT: '#1A1A2E', light: '#16213E' }
     accent: { DEFAULT: '#E94560', hover: '#D63851', soft: 'rgba(233,69,96,0.1)' }
     secondary: '#0F3460'
     surface: { DEFAULT: '#FFFFFF', dim: '#F5F6F8', border: '#E2E5EA' }
     And all other colors from the design system
   - Set "Plus Jakarta Sans" as the default sans font
   - Add custom animation classes: animate-fade-in, animate-slide-up, animate-slide-left

3. Update globals.css:
   - Define all CSS variables under :root
   - Add base styles: smooth scrolling, antialiased text
   - Add utility classes:
     .card-hover (shadow + translateY transition)
     .btn-primary, .btn-secondary, .btn-ghost
     .skeleton (pulse loading animation)
     .section-dark, .section-light

4. Create reusable UI components in /components/ui/:

   a. Button.tsx — variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Loading + disabled states.
   b. Card.tsx — variants: default, dark. Hover lift. Image + content slots. Clickable option.
   c. Input.tsx — label, error, helper text. Focus ring accent. Search variant with icon.
   d. Badge.tsx — variants: accent, success, warning, neutral. Small uppercase pill.
   e. StarRating.tsx — display mode (filled stars + number) and interactive mode (clickable). Gold color.
   f. Skeleton.tsx — variants: card, text-line, avatar, image. Pulse animation.
   g. Modal.tsx — centered overlay, backdrop blur, slide-up mobile, fade-in desktop. Close, title, content, footer.
   h. BottomSheet.tsx — slides from bottom, drag handle, max-h-85vh, backdrop.
   i. Toast setup — install and configure sonner. Variants: success, error, info.
   j. EmptyState.tsx — icon + heading + description + optional CTA.

5. /components/ui/index.ts exporting all components.
6. Install lucide-react for icons.

Every component must use CSS variables. No hardcoded colors.
```

---

## TASK 1: Navigation & Layout Shell

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build the global navigation and layout shell for BookIt.

1. Navbar — /components/layout/Navbar.tsx:

   DESKTOP (lg+):
   - Sticky top-0, h-16, bg-primary, z-50
   - Left: "Book" white + "It" accent (#E94560), font-extrabold text-xl
   - Center-left: nav links — "Explore" dropdown showing all categories (see category list below), font-medium, text-on-dark-muted hover:text-white
   - Center: compact search bar, white bg, rounded-lg, search icon, max-w-md, expands on focus
   - Right (logged out): "Sign In" ghost + "List Your Business" accent button
   - Right (logged in): avatar dropdown → My Bookings, Business Dashboard, Sign Out

   Categories for "Explore" dropdown (show as a mega-menu or grouped dropdown):
   - Food
   - Nightlife
   - Events
   - Attractions & Tourism
   - Activities & Experiences
   - Courts & Sports Venues
   - Studios & Classes
   - Men Care
   - Women Care
   - Wellness
   - Health & Care

   The dropdown should be a clean grid/list grouped nicely. Each item has a small icon and the category name. bg-white, rounded-xl, shadow-xl.

   MOBILE (below lg):
   - Sticky, h-14, bg-primary
   - Left: BookIt logo
   - Right: search icon + hamburger icon
   - Hamburger → slide-in drawer: user info, all category links, List Your Business button

2. Footer — /components/layout/Footer.tsx:
   - bg-primary, text-white
   - 4 columns desktop, stacked mobile:
     Col 1: BookIt logo + "Book it. Live it." tagline
     Col 2: "Categories" — all 11 categories as links
     Col 3: "Company" — About, Contact, Terms, Privacy
     Col 4: "For Businesses" — List Your Business, Help Center
   - Bottom bar: copyright + social icons (Instagram, Facebook, WhatsApp)

3. Layout — /app/layout.tsx:
   - Navbar + main (flex-1) + Footer
   - Font provider, QueryClientProvider, SessionProvider, Toaster

4. /app/(public)/layout.tsx — navbar + footer
5. /app/(dashboard)/layout.tsx — sidebar + topbar, no footer:
   - Sidebar bg-white, border-r, w-[260px], sticky
   - Items: Overview, Bookings, Resources, Services, Schedules, Profile
   - Active: bg-accent-soft, text-accent
   - Mobile: bottom tab bar
```

---

## TASK 2: Homepage

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build the BookIt homepage — the first thing users see.

/app/(public)/page.tsx:

SECTION 1 — Hero:
- Full-width, min-h-[500px] desktop, min-h-[400px] mobile
- Gradient bg: from-primary via-primary-light to-secondary, subtle radial glow of accent at 5% opacity center
- Subtle dot-grid pattern overlay at 3% opacity
- Centered content, max-w-4xl:
  - Headline: "Discover & Book the Best in Lebanon" — text-white, text-4xl md:text-5xl lg:text-6xl, font-extrabold
  - Subheadline: "Sports, salons, dining, nightlife, wellness and more — all in one place" — text-on-dark-muted, text-lg md:text-xl
  - SEARCH BAR: mt-8, bg-white, rounded-2xl, shadow-2xl, p-2
    - Horizontal desktop, stacked mobile
    - Fields: category dropdown (All / all 11 categories) + location input + date picker + search button (accent)
    - No visible borders between fields — just subtle dividers
    - Search button: bg-accent text-white "Search" with icon

SECTION 2 — Category Tiles:
- bg-surface-dim, py-20
- Heading: "Browse by Category" — text-3xl font-bold text-center
- Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop (gap-4)
- 11 category cards, each card:
  - Aspect-[3/2], rounded-xl, overflow-hidden, relative
  - Background: relevant Unsplash image with dark gradient overlay from bottom
  - Content overlaid bottom: category icon (white, w-8), category name text-white font-bold text-lg, short subtitle text-white/70 text-sm
  - Hover: scale-[1.02], shadow-lg
  - Links to /[category-slug]

  Categories with icons and subtitles:
  1. Food — UtensilsCrossed icon — "Restaurants & dining"
  2. Nightlife — Wine icon — "Bars, clubs & lounges"
  3. Events — Ticket icon — "Concerts, shows & festivals"
  4. Attractions & Tourism — Landmark icon — "Sightseeing & tours"
  5. Activities & Experiences — Compass icon — "Adventures & outings"
  6. Courts & Sports Venues — Trophy icon — "Padel, tennis, football & more"
  7. Studios & Classes — GraduationCap icon — "Art, music, dance & fitness"
  8. Men Care — Scissors icon — "Barbershops & grooming"
  9. Women Care — Sparkles icon — "Hair, beauty & nails"
  10. Wellness — Leaf icon — "Spa, massage & relaxation"
  11. Health & Care — Heart icon — "Clinics, therapy & checkups"

SECTION 3 — Featured Businesses:
- bg-white, py-20
- Show 2 featured rows (pick 2 most popular categories that have businesses):
  "[Category Name]" heading + "View All →" link
  - 4-col grid desktop, horizontal scroll mobile
  - Business cards: image, name, badge, stars, location, price
  - Skeleton loaders while loading
- Fetch from /api/businesses/featured

SECTION 4 — How It Works:
- bg-primary (dark), py-20, text-white
- "How BookIt Works" heading
- 3 steps: Search → Book → Enjoy (icons, headings, descriptions)
- Accent colored icons, connecting line on desktop

SECTION 5 — CTA Banner:
- bg-accent, py-16, text-white, text-center
- "Own a business? Get listed on BookIt"
- "Reach thousands of customers looking to book"
- "List Your Business" white button

Footer follows.
```

---

## TASK 3: Category Listing Page

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build the category listing page for BookIt.

/app/(public)/[category]/page.tsx

This page must work for ALL 11 categories. The category slug maps to:
- food, nightlife, events, attractions-tourism, activities-experiences, courts-sports, studios-classes, men-care, women-care, wellness, health-care

PAGE HEADER:
- bg-primary, py-12
- Breadcrumb: Home > [Category Name]
- Heading: category display name — text-3xl font-bold text-white
- Category icon next to heading (from the icon map above)
- Result count: "X businesses found"

FILTER BAR:
- Sticky below navbar, bg-white, shadow-sm, z-40
- Scrollable horizontal on mobile
- Filters:
  - City: dropdown (All, Beirut, Jounieh, Byblos, Tripoli, Sidon, Batroun, Broummana, etc.)
  - Rating: 4+ Stars, 3+ Stars
  - Price: $, $$, $$$
  - Sort: Top Rated, Newest, Price Low-High
- Active filters as accent pills with X
- Clear All link

LISTING GRID:
- bg-surface-dim, py-8
- Grid: 1 mobile, 2 tablet, 3 desktop, gap-6
- Business cards:
  - Image aspect-[4/3], rounded-t-xl
  - Category badge on image (top-left pill)
  - Name, location (map-pin), rating (star + count), price
  - Category-specific tags (sport types, specialties, cuisine type, etc.)
  - Hover lift
  - Links to /business/[slug]

PAGINATION:
- Previous/Next buttons + page indicator

EMPTY STATE:
- Search icon + "No businesses found" + "Try adjusting your filters" + "Clear Filters"

LOADING: 6 skeleton cards

URL updates with query params for shareability. Read filters from URL on load.
```

---

## TASK 4: Business Profile Page

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build the business profile page — the key conversion page.

/app/(public)/business/[slug]/page.tsx

LAYOUT — Split view:
- Desktop: left (flex-1, max-w-3xl) scrollable + right (w-[400px]) sticky booking panel
- Mobile: single column + bottom CTA bar → opens BottomSheet
- bg-surface-dim

LEFT COLUMN:

1. Image Gallery:
   - Main image: full-width, aspect-[16/9] md:aspect-[2/1], rounded-xl
   - Thumbnails row below (click to swap)

2. Business Header:
   - Category badge pill
   - Name: text-3xl font-bold
   - Rating: stars + number + "(X reviews)" clickable → scrolls to reviews
   - Location: map-pin + city
   - Phone: clickable tel: link

3. About:
   - Description text
   - Category-specific detail badges (sport types, specialties, cuisine, etc.)

4. Services:
   - "Services" heading
   - List: service name (bold) | duration | price (right-aligned)
   - Subtle dividers

5. Resources:
   - Heading adapts: "Our Courts", "Our Team", "Our Rooms", "Our Instructors" etc. based on category
   - Grid of resource cards: image/avatar + name + type + description

6. Reviews:
   - Average rating (large) + breakdown bars
   - Review cards: avatar + name + date + stars + comment
   - Load More pagination

RIGHT COLUMN — Booking Panel (desktop):
- Sticky top-24, bg-white, rounded-2xl, shadow-2xl, p-6
- "Book Now" heading
- Steps with slide animation:
  1. Select Service → selectable cards with accent highlight
  2. Select Resource → resource cards with image
  3. Select Date → date picker, past dates disabled
  4. Select Time → grid of time buttons from useAvailableSlots()
  5. Confirm → summary + price + "Confirm Booking" accent button
- Not logged in: "Sign in to book" redirects to /login?redirect=current-url
- Success: checkmark + "Booking Confirmed!" + details + friendly cancel note
- 409 error: "Slot just booked" + auto-refresh times

MOBILE:
- Fixed bottom bar: "From $XX" left + "Book Now" accent button right
- Tapping opens BottomSheet with same step flow
```

---

## TASK 5: Auth Pages

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build auth pages for BookIt.

/app/login/page.tsx:

DESKTOP: two columns — left dark branded panel, right white form
MOBILE: form only

LEFT PANEL (desktop only):
- w-1/2, bg-primary, gradient + pattern
- BookIt logo large, tagline "Book it. Live it."
- 3 benefit bullets with icons

RIGHT PANEL:
- max-w-md centered
- "Welcome to BookIt" heading
- Google OAuth button (prominent, top): white bg, border, Google G icon, "Continue with Google"
- "or" divider
- Toggle tabs: "Sign In" | "Create Account"
- Sign In: email + password + forgot password link + submit
- Create Account: name + email + password (min 8 chars helper) + submit
- Terms text at bottom
- Inline validation errors, toast for server errors
- Redirect after auth to previous page or homepage
```

---

## TASK 6: Customer Bookings Page

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build customer bookings page.

/app/(account)/bookings/page.tsx:

HEADER: "My Bookings" + tabs: Upcoming | Past | Cancelled (accent underline active)

BOOKING CARDS (list, max-w-3xl):
- Horizontal desktop (image left, details center, actions right), stacked mobile
- Business image (w-24 h-24 rounded-lg)
- Business name (link), service + resource, date/time with icon, status badge, price
- Actions:
  - Upcoming: "Cancel" button → confirmation modal with friendly note
  - Completed (no review): "Leave Review" → modal with StarRating + comment textarea
  - Completed (reviewed): "Reviewed ✓" green text
  - Cancelled: no actions

EMPTY STATES per tab with appropriate icons and CTAs.
LOADING: 3 skeleton cards.
```

---

## TASK 7: Business Dashboard

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Build business owner dashboard.

SIDEBAR (from Task 1 layout): Overview, Bookings, Resources, Services, Schedules, Profile

OVERVIEW — /app/(dashboard)/dashboard/page.tsx:
- No business: CTA card "Start accepting bookings" + "Create Business" button
- Has business:
  - Welcome + business name
  - Stats row: Total Bookings, This Week, Average Rating, Revenue — white cards, shadow-sm
  - Recent bookings table (5 rows)
  - Quick actions: Add Resource, Add Service, Edit Profile

BOOKINGS — /app/(dashboard)/dashboard/bookings/page.tsx:
- Filters: date range, resource, status
- Table: customer, service, resource, date, time, status, actions (Complete/Cancel)
- Pagination, empty state

RESOURCES — /app/(dashboard)/dashboard/resources/page.tsx:
- Grid of resource cards + "Add Resource" button
- Add/Edit in Modal: name, type (auto from category), description, image

SERVICES — /app/(dashboard)/dashboard/services/page.tsx:
- Grid of service cards + "Add Service" button
- Add/Edit in Modal: name, description, duration dropdown, price

SCHEDULES — /app/(dashboard)/dashboard/schedules/page.tsx:
- Resource selector dropdown
- 7-day grid: each day shows schedule blocks + "Add hours" inline form
- Delete individual blocks

EDIT PROFILE — /app/(dashboard)/dashboard/profile/page.tsx:
- Common fields + category-specific fields
- Image management, save button

CREATE BUSINESS — /app/(dashboard)/dashboard/create/page.tsx:
- Step 1: category selection — show ALL 11 categories as cards in a grid (3 cols desktop, 2 mobile)
  Each card: category icon + name + short description
  Cards:
  1. Food — "Restaurants, cafes & catering"
  2. Nightlife — "Bars, clubs & lounges"
  3. Events — "Event venues & organizers"
  4. Attractions & Tourism — "Tours, landmarks & experiences"
  5. Activities & Experiences — "Adventure, outdoor & group activities"
  6. Courts & Sports Venues — "Courts, fields & sports facilities"
  7. Studios & Classes — "Art, music, dance & fitness studios"
  8. Men Care — "Barbershops & men's grooming"
  9. Women Care — "Hair salons, beauty & nail studios"
  10. Wellness — "Spas, massage & relaxation centers"
  11. Health & Care — "Clinics, physiotherapy & health services"

- Step 2: common fields + category-specific fields (see Task 9 for per-category fields)
- After creation: redirect to dashboard with success toast
```

---

## TASK 8: Visual Polish & Responsive QA

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Final visual polish pass across ALL BookIt pages.

1. RESPONSIVE — test at 375px, 390px, 768px, 1024px, 1440px:
   - No horizontal scroll anywhere
   - No overlapping elements
   - Touch targets >= 44px on mobile
   - Text readable without zooming
   - Images don't break layout
   - Bottom sheet booking works on mobile
   - Category grid adapts properly (1→2→3→4 cols)
   - Dashboard sidebar collapses to bottom tabs on mobile

2. LOADING STATES on every page:
   - Skeleton loaders matching component shapes
   - Button loading spinners during mutations
   - Image blur-up placeholders

3. EMPTY STATES on every list/grid:
   - Icon + message + CTA
   - Never blank space or broken layout

4. ERROR HANDLING:
   - Toast for API errors
   - Inline form validation
   - /app/not-found.tsx styled with BookIt branding (big "404", friendly message, "Go Home" button)
   - Network error → retry option

5. TOASTS for:
   - Booking confirmed/cancelled
   - Review submitted
   - Business created/updated
   - Resource/service/schedule created/updated/deleted
   - Any API error

6. ANIMATIONS verified:
   - Card hover lifts smooth (200ms)
   - Booking panel step transitions (slide-left)
   - Modal/BottomSheet open/close
   - Button active:scale-[0.98]
   - Star rating hover scale
   - Page fade-in on route change
   - Dropdown open/close

7. VISUAL CONSISTENCY:
   - All pages use the BookIt color palette — no stray colors
   - All text uses Plus Jakarta Sans — no fallback fonts visible
   - All cards have consistent border radius (rounded-xl)
   - All buttons follow the 3 variant system (primary/secondary/ghost)
   - Dark sections alternate with light sections on content-heavy pages
   - Star ratings always gold (#FBBF24)
   - Status badges always: green=confirmed, gray=completed, red=cancelled

8. ACCESSIBILITY basics:
   - All images have alt text
   - All buttons have aria-labels where text isn't visible
   - Focus states visible (accent ring)
   - Sufficient color contrast on all text
   - Form labels linked to inputs

9. SEO:
   - Every page has metadata (title, description) via Next.js Metadata API
   - Business pages: dynamic metadata from business name/description
   - Category pages: dynamic metadata from category name
   - /app/sitemap.ts generating URLs for all public pages
```

---

# SECTION B — CATEGORY EXPANSION

---

## TASK 9: Expand Database & Backend for All Categories

```
Expand BookIt from 2 categories to 11. Update the database schema, API validation, and seed data.

1. Update Prisma schema — BusinessCategory enum:

   enum BusinessCategory {
     FOOD
     NIGHTLIFE
     EVENTS
     ATTRACTIONS_TOURISM
     ACTIVITIES_EXPERIENCES
     COURTS_SPORTS
     STUDIOS_CLASSES
     MEN_CARE
     WOMEN_CARE
     WELLNESS
     HEALTH_CARE
   }

2. Update ResourceType enum to cover all categories:

   enum ResourceType {
     COURT        // Courts & Sports
     STAFF        // Salons, Barbers, Health
     ROOM         // Wellness (spa rooms, therapy rooms)
     TABLE        // Food (restaurant tables)
     VENUE_SPACE  // Nightlife, Events (sections, VIP areas)
     INSTRUCTOR   // Studios & Classes
     GUIDE        // Attractions & Tourism
     EQUIPMENT    // Activities & Experiences
   }

3. Define extraFields JSON structure per category. Create a config file /lib/categories/config.ts:

   FOOD:
   - cuisineTypes: string[] (Lebanese, Italian, Japanese, etc.)
   - diningStyle: "casual" | "fine_dining" | "fast_casual" | "cafe"
   - hasDelivery: boolean
   - hasOutdoorSeating: boolean
   - priceRange: "$" | "$$" | "$$$" | "$$$$"

   NIGHTLIFE:
   - venueType: "bar" | "club" | "lounge" | "pub" | "rooftop"
   - musicGenre: string[]
   - dressCode: "casual" | "smart_casual" | "formal" | "none"
   - ageRestriction: number (e.g., 21)
   - hasVIP: boolean

   EVENTS:
   - eventTypes: string[] (concert, festival, exhibition, conference, party)
   - venueCapacity: number
   - isIndoor: boolean
   - isOutdoor: boolean

   ATTRACTIONS_TOURISM:
   - attractionType: string[] (historical, natural, cultural, adventure)
   - tourDuration: string
   - languages: string[]
   - accessibility: boolean

   ACTIVITIES_EXPERIENCES:
   - activityTypes: string[] (hiking, kayaking, paintball, escape room, cooking class)
   - difficultyLevel: "easy" | "moderate" | "hard"
   - groupSizeMin: number
   - groupSizeMax: number
   - ageRequirement: number

   COURTS_SPORTS:
   - courtCount: number
   - sportTypes: string[] (padel, tennis, basketball, football, squash, volleyball)
   - surfaceType: string
   - isIndoor: boolean

   STUDIOS_CLASSES:
   - classTypes: string[] (yoga, pilates, dance, art, music, cooking, pottery, photography)
   - skillLevel: "beginner" | "intermediate" | "advanced" | "all_levels"
   - maxClassSize: number
   - providesEquipment: boolean

   MEN_CARE:
   - specialties: string[] (haircut, beard_trim, shave, facial, hair_coloring)
   - walkInsAccepted: boolean

   WOMEN_CARE:
   - specialties: string[] (haircut, coloring, blowout, nails, facial, waxing, lashes, brows, makeup)
   - genderFocus: "women_only" | "unisex"

   WELLNESS:
   - wellnessTypes: string[] (massage, spa, sauna, hammam, reflexology, aromatherapy)
   - hasPool: boolean
   - hasSauna: boolean
   - couplesAvailable: boolean

   HEALTH_CARE:
   - healthServices: string[] (physiotherapy, chiropractic, dental, dermatology, nutrition, psychology)
   - acceptsInsurance: boolean
   - licenseNumber: string

4. Export from config.ts:
   - CATEGORY_CONFIG: object mapping each category to its display name, slug, icon name, subtitle, extraFields schema, default resource type, resource label (plural), and resource label (singular)

   Example:
   COURTS_SPORTS: {
     displayName: "Courts & Sports Venues",
     slug: "courts-sports",
     icon: "Trophy",
     subtitle: "Padel, tennis, football & more",
     defaultResourceType: "COURT",
     resourceLabelSingular: "Court",
     resourceLabelPlural: "Courts",
     extraFields: { ... schema definition ... }
   }

   FOOD: {
     displayName: "Food",
     slug: "food",
     icon: "UtensilsCrossed",
     subtitle: "Restaurants & dining",
     defaultResourceType: "TABLE",
     resourceLabelSingular: "Table",
     resourceLabelPlural: "Tables",
     extraFields: { ... }
   }

   ... and so on for all 11.

5. Update API validation in POST/PUT /api/businesses:
   - Read the category from request body
   - Look up the extraFields schema from CATEGORY_CONFIG
   - Validate extraFields against the schema for that category
   - This replaces the old hardcoded Sports/Salon validation

6. Update /api/businesses/featured:
   - Return top businesses across ALL categories that have businesses
   - Group by category

7. Update seed data in prisma/seed.ts:
   - Add at least 1 sample business per category (11 businesses total)
   - Each with appropriate resources, services, schedules, and sample bookings
   - Use realistic Lebanese business names and locations

8. Run prisma migrate and prisma db seed to verify everything works.
```

---

## TASK 10: Category-Specific Business Creation Forms

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Update the business creation flow to have specific forms for all 11 categories.

Update /app/(dashboard)/dashboard/create/page.tsx:

STEP 1 stays the same — grid of 11 category cards for selection.

STEP 2 — after selecting a category:

Common fields (all categories):
- Business name (required)
- Description (textarea, required)
- Phone (required)
- Address (required)
- City (dropdown: Beirut, Jounieh, Byblos, Tripoli, Sidon, Batroun, Broummana, Zahle, Baalbek, etc.)
- Images (Cloudinary upload, up to 10)

Then show category-specific fields. Import the field definitions from CATEGORY_CONFIG and render the appropriate form:

FOOD:
- Cuisine types (multi-select checkboxes: Lebanese, Italian, Japanese, French, American, Mexican, Indian, Chinese, Sushi, Seafood, Burger, Pizza, Other)
- Dining style (radio: Casual, Fine Dining, Fast Casual, Café)
- Outdoor seating (toggle)
- Delivery available (toggle)
- Price range (radio: $, $$, $$$, $$$$)

NIGHTLIFE:
- Venue type (radio: Bar, Club, Lounge, Pub, Rooftop)
- Music genre (multi-select: House, Techno, Hip-Hop, R&B, Arabic, Latin, Live Band, DJ, Mixed)
- Dress code (radio: Casual, Smart Casual, Formal, None)
- Age restriction (number input, default 18)
- Has VIP (toggle)

EVENTS:
- Event types (multi-select: Concert, Festival, Exhibition, Conference, Party, Workshop, Comedy Show)
- Venue capacity (number input)
- Indoor (toggle)
- Outdoor (toggle)

ATTRACTIONS_TOURISM:
- Attraction type (multi-select: Historical, Natural, Cultural, Adventure, Religious, Architectural)
- Tour duration (dropdown: 1 hour, 2 hours, Half day, Full day, Multi-day)
- Languages offered (multi-select: English, Arabic, French, Other)
- Wheelchair accessible (toggle)

ACTIVITIES_EXPERIENCES:
- Activity types (multi-select: Hiking, Kayaking, Paintball, Escape Room, Cooking Class, Wine Tasting, Paragliding, Zip-lining, ATV, Camping, Other)
- Difficulty level (radio: Easy, Moderate, Hard)
- Min group size (number)
- Max group size (number)
- Minimum age (number)

COURTS_SPORTS:
- Court count (number)
- Sport types (multi-select: Padel, Tennis, Basketball, Football, Squash, Volleyball, Badminton, Table Tennis, Other)
- Surface type (dropdown: Hard Court, Clay, Grass, Artificial Turf, Indoor Wood, Concrete)
- Indoor (toggle)

STUDIOS_CLASSES:
- Class types (multi-select: Yoga, Pilates, Dance, Art, Music, Cooking, Pottery, Photography, Martial Arts, CrossFit, Other)
- Skill level (radio: Beginner, Intermediate, Advanced, All Levels)
- Max class size (number)
- Equipment provided (toggle)

MEN_CARE:
- Specialties (multi-select: Haircut, Beard Trim, Shave, Facial, Hair Coloring, Scalp Treatment, Eyebrow Grooming)
- Walk-ins accepted (toggle)

WOMEN_CARE:
- Specialties (multi-select: Haircut, Coloring, Blowout, Nails, Facial, Waxing, Lashes, Brows, Makeup, Keratin Treatment, Hair Extension)
- Gender focus (radio: Women Only, Unisex)

WELLNESS:
- Wellness types (multi-select: Massage, Spa, Sauna, Hammam, Reflexology, Aromatherapy, Hot Stone, Body Wrap)
- Has pool (toggle)
- Has sauna (toggle)
- Couples treatments available (toggle)

HEALTH_CARE:
- Health services (multi-select: Physiotherapy, Chiropractic, Dental, Dermatology, Nutrition, Psychology, General Checkup, Lab Tests)
- Accepts insurance (toggle)
- License number (text input)

Create reusable form field components:
- MultiSelectCheckboxes.tsx — a grid of checkboxes with labels
- RadioGroup.tsx — radio buttons with labels
- ToggleField.tsx — labeled toggle switch
- These should all follow the design system styling

Also update the business EDIT page (/app/(dashboard)/dashboard/profile/page.tsx) to show the same category-specific fields for editing.
```

---

## TASK 11: Category-Aware Business Profile & Listing UI

```
[PASTE DESIGN SYSTEM BLOCK HERE]

Update the business profile page and listing cards to show category-specific information intelligently.

1. Update business listing cards (/app/(public)/[category]/page.tsx):

   Show category-relevant tags on each card:
   - FOOD: cuisine types as tags, price range indicator ($ to $$$$), dining style
   - NIGHTLIFE: venue type badge, music genres as tags
   - EVENTS: event types as tags, capacity
   - ATTRACTIONS_TOURISM: attraction types, tour duration
   - ACTIVITIES_EXPERIENCES: activity types, difficulty badge, group size
   - COURTS_SPORTS: sport types as tags, indoor/outdoor badge
   - STUDIOS_CLASSES: class types as tags, skill level badge
   - MEN_CARE: specialties as tags, "Walk-ins OK" badge if applicable
   - WOMEN_CARE: specialties as tags, "Women Only" or "Unisex" badge
   - WELLNESS: wellness types as tags, amenity badges (pool, sauna, couples)
   - HEALTH_CARE: health services as tags, "Insurance Accepted" badge

   Tags should be small pills (Badge component), max 3 visible + "+X more" if overflow.

2. Update business profile page (/app/(public)/business/[slug]/page.tsx):

   The "About" section should display category-specific details as a structured info grid:

   FOOD:
   - "Cuisine" with tag list
   - "Style" badge
   - "Price Range" indicator
   - "Outdoor Seating" ✓/✗
   - "Delivery" ✓/✗

   NIGHTLIFE:
   - "Venue Type" badge
   - "Music" tag list
   - "Dress Code" text
   - "Age" requirement
   - "VIP Available" ✓/✗

   (Apply same pattern for all 11 categories — show the extraFields in a clean 2-col info grid with labels and values/badges)

   The "Resources" section heading adapts per category:
   - FOOD: "Tables & Seating"
   - NIGHTLIFE: "Spaces & Areas"
   - EVENTS: "Venues & Spaces"
   - ATTRACTIONS_TOURISM: "Tours & Guides"
   - ACTIVITIES_EXPERIENCES: "Equipment & Groups"
   - COURTS_SPORTS: "Courts & Fields"
   - STUDIOS_CLASSES: "Instructors & Rooms"
   - MEN_CARE / WOMEN_CARE: "Our Team"
   - WELLNESS: "Rooms & Therapists"
   - HEALTH_CARE: "Practitioners & Rooms"

   Import these labels from CATEGORY_CONFIG.

3. Update the booking panel service/resource selection:
   - Resource labels adapt per category (e.g., "Select a Court" vs "Select a Table" vs "Select a Therapist")
   - Import from CATEGORY_CONFIG.resourceLabelSingular

4. Add category-specific filters to listing pages:
   Per-category extra filters in the filter bar (in addition to city, rating, price, sort):
   - FOOD: cuisine type dropdown, dining style dropdown
   - COURTS_SPORTS: sport type dropdown, indoor/outdoor toggle
   - WELLNESS: has pool, has sauna toggles
   - HEALTH_CARE: accepts insurance toggle
   - MEN_CARE / WOMEN_CARE: specialty dropdown
   - Other categories: no extra filters for now (keep it clean)
```

---

## TASK 12: Category Slug Routing & SEO

```
Update routing, slugs, and SEO for all 11 categories.

1. Category slug mapping in /lib/categories/config.ts (add if not already present):

   food → /food
   nightlife → /nightlife
   events → /events
   attractions-tourism → /attractions-tourism
   activities-experiences → /activities-experiences
   courts-sports → /courts-sports
   studios-classes → /studios-classes
   men-care → /men-care
   women-care → /women-care
   wellness → /wellness
   health-care → /health-care

2. Update /app/(public)/[category]/page.tsx:
   - Validate the category slug against the config
   - If invalid slug → redirect to 404
   - Map slug to BusinessCategory enum for API queries
   - Dynamic metadata per category:
     title: "[Category Name] in Lebanon — BookIt"
     description: "Find and book the best [category subtitle] in Lebanon. Browse ratings, compare prices, and book instantly on BookIt."

3. Update /app/(public)/business/[slug]/page.tsx metadata:
   - title: "[Business Name] — [Category Name] in [City] | BookIt"
   - description: first 160 chars of business description

4. Update /app/sitemap.ts:
   - Include all 11 category pages
   - Include all business profile pages
   - Include homepage
   - Dynamically generate from database

5. Add structured data (JSON-LD) to business profile pages:
   - LocalBusiness schema with name, address, rating, priceRange, image
   - This helps Google show rich results

6. Update the search bar on homepage:
   - Category dropdown lists all 11 categories
   - Search redirects to /[category-slug]?search=query&city=city
   - If "All Categories" selected, redirect to a search results page /search?q=query&city=city

7. Create /app/(public)/search/page.tsx:
   - Search across all categories
   - Show results grouped by category or in a single mixed grid
   - Same card design and filters as category listing
   - URL-based query params: q (search text), city, category (optional filter)
```

---

# RUNNING ORDER

## Phase 1: Backend (from original MVP prompts)
- [ ] MVP Step 0: Project scaffold
- [ ] MVP Step 1: Database schema (use the EXPANDED schema from Task 9 above instead of the original 2-category schema)
- [ ] MVP Step 2: Authentication
- [ ] MVP Step 3: Business APIs
- [ ] MVP Step 4: Services & Availability APIs
- [ ] MVP Step 5: Booking engine
- [ ] MVP Step 6: Email notifications

## Phase 2: Design System + Frontend
- [ ] Task 0: Design system setup
- [ ] Task 1: Navigation & layout shell
- [ ] Task 2: Homepage
- [ ] Task 3: Category listing page
- [ ] Task 4: Business profile page
- [ ] Task 5: Auth pages
- [ ] Task 6: Customer bookings page
- [ ] Task 7: Business dashboard
- [ ] Task 8: Visual polish & responsive QA

## Phase 3: Category Expansion
- [ ] Task 9: Expand database & backend for all 11 categories
- [ ] Task 10: Category-specific creation forms
- [ ] Task 11: Category-aware profile & listing UI
- [ ] Task 12: Category routing & SEO

## Phase 4: Deploy
- [ ] MVP Step 9: Railway deployment (from original prompts)
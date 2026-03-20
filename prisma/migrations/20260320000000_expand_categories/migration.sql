-- Expand BusinessCategory enum from SPORTS/SALON to all 11 categories
-- Expand ResourceType enum with new resource types

-- Step 1: Create new BusinessCategory enum
CREATE TYPE "BusinessCategory_new" AS ENUM (
  'FOOD',
  'NIGHTLIFE',
  'EVENTS',
  'ATTRACTIONS_TOURISM',
  'ACTIVITIES_EXPERIENCES',
  'COURTS_SPORTS',
  'STUDIOS_CLASSES',
  'MEN_CARE',
  'WOMEN_CARE',
  'WELLNESS',
  'HEALTH_CARE'
);

-- Step 2: Migrate existing rows (SPORTS → COURTS_SPORTS, SALON → WOMEN_CARE)
ALTER TABLE "Business"
  ALTER COLUMN "category" TYPE "BusinessCategory_new"
  USING (
    CASE category::text
      WHEN 'SPORTS' THEN 'COURTS_SPORTS'
      WHEN 'SALON'  THEN 'WOMEN_CARE'
      ELSE category::text
    END
  )::"BusinessCategory_new";

-- Step 3: Drop old enum and rename new one
DROP TYPE "BusinessCategory";
ALTER TYPE "BusinessCategory_new" RENAME TO "BusinessCategory";

-- Step 4: Create new ResourceType enum
CREATE TYPE "ResourceType_new" AS ENUM (
  'COURT',
  'STAFF',
  'ROOM',
  'TABLE',
  'VENUE_SPACE',
  'INSTRUCTOR',
  'GUIDE',
  'EQUIPMENT'
);

-- Step 5: Migrate ResourceType column (existing values COURT/STAFF/ROOM are kept as-is)
ALTER TABLE "Resource"
  ALTER COLUMN "type" TYPE "ResourceType_new"
  USING type::text::"ResourceType_new";

-- Step 6: Drop old enum and rename new one
DROP TYPE "ResourceType";
ALTER TYPE "ResourceType_new" RENAME TO "ResourceType";

-- Adds the Category level (Lesson > Category > Tile) and moves existing data:
-- each old Lesson's `category` string becomes a Category row, and its tiles
-- move under it. Then Tile.lessonId and Lesson.category are dropped.

CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Category_lessonId_idx" ON "Category"("lessonId");
ALTER TABLE "Category" ADD CONSTRAINT "Category_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;

-- One category per existing lesson, named after the old category string.
INSERT INTO "Category" ("id", "lessonId", "name")
SELECT 'cat_' || "id", "id", initcap("category") FROM "Lesson";

ALTER TABLE "Tile" ADD COLUMN "categoryId" TEXT;
UPDATE "Tile" SET "categoryId" = 'cat_' || "lessonId";
ALTER TABLE "Tile" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Tile" DROP CONSTRAINT "Tile_lessonId_fkey";
DROP INDEX "Tile_lessonId_idx";
ALTER TABLE "Tile" DROP COLUMN "lessonId";
CREATE INDEX "Tile_categoryId_idx" ON "Tile"("categoryId");
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lesson" DROP COLUMN "category";

-- The seeded sample lesson becomes "Les 1"; its category (Nommers) already exists.
UPDATE "Lesson" SET "title" = 'Les 1' WHERE "title" = 'Nommers 1-10';

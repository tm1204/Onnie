-- CreateEnum
CREATE TYPE "VisualType" AS ENUM ('TEXT', 'COLOUR', 'IMAGE');

-- CreateTable
CREATE TABLE "AgeGroup" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AgeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "ageGroupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'af',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "parentId" TEXT,
    "displayValue" TEXT NOT NULL,
    "visualType" "VisualType" NOT NULL DEFAULT 'TEXT',
    "visualValue" TEXT,
    "audioUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgeGroup_slug_key" ON "AgeGroup"("slug");

-- CreateIndex
CREATE INDEX "Lesson_ageGroupId_idx" ON "Lesson"("ageGroupId");

-- CreateIndex
CREATE INDEX "Tile_lessonId_idx" ON "Tile"("lessonId");

-- CreateIndex
CREATE INDEX "Tile_parentId_idx" ON "Tile"("parentId");

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_ageGroupId_fkey" FOREIGN KEY ("ageGroupId") REFERENCES "AgeGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

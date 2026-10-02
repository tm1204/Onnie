-- Optional colour for text tiles. Additive and nullable, so existing rows are untouched.
ALTER TABLE "Tile" ADD COLUMN "colour" TEXT;

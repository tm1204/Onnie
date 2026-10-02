-- Supabase exposes every public table through its REST API using the public
-- anon key. Enable RLS with no policies so only the server's direct database
-- connection (table owner, bypasses RLS) can read or write these tables.
ALTER TABLE "AgeGroup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tile" ENABLE ROW LEVEL SECURITY;

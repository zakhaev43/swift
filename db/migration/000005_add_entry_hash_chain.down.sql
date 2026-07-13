DROP INDEX IF EXISTS "entries_hash_idx";
ALTER TABLE "entries" DROP COLUMN "hash";
ALTER TABLE "entries" DROP COLUMN "prev_hash";

ALTER TABLE "entries" ADD COLUMN "prev_hash" varchar NOT NULL DEFAULT '';
ALTER TABLE "entries" ADD COLUMN "hash" varchar NOT NULL DEFAULT '';

CREATE INDEX ON "entries" ("hash");

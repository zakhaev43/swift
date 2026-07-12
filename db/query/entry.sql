-- name: CreateEntry :one
INSERT INTO entries (
  account_id,
  amount
) VALUES (
  $1, $2
) RETURNING *;

-- name: SetEntryHash :one
UPDATE entries
SET prev_hash = $2,
    hash = $3
WHERE id = $1
RETURNING *;

-- name: GetLastEntryHash :one
SELECT hash FROM entries
ORDER BY id DESC
LIMIT 1;

-- name: GetEntry :one
SELECT * FROM entries
WHERE id = $1 LIMIT 1;

-- name: ListEntries :many
SELECT * FROM entries
WHERE account_id = $1
ORDER BY id
LIMIT $2
OFFSET $3;

-- name: ListAllEntries :many
SELECT * FROM entries
ORDER BY id;

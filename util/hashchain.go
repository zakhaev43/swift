package util

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

// GenesisHash is the prev_hash value for the first entry in the ledger chain.
const GenesisHash = ""

// ChainHash computes a tamper-evident hash for a ledger entry, binding it to
// the hash of the entry before it. Changing or reordering any past entry
// changes its hash, which breaks every hash after it in the chain.
func ChainHash(prevHash string, entryID int64, accountID int64, amount int64, createdAt time.Time) string {
	data := fmt.Sprintf("%s|%d|%d|%d|%d", prevHash, entryID, accountID, amount, createdAt.UnixNano())
	sum := sha256.Sum256([]byte(data))
	return hex.EncodeToString(sum[:])
}

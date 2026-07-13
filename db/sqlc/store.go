package db

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/lib/pq"
	"github.com/zakhaev43/Swift-Transfer/util"
)

// Store interface defines all functions to execute db queries and transactions
type Store interface {
	Querier
	TransferTx(ctx context.Context, arg TransferTxParams) (TransferTxResult, error)
	VerifyEntryChain(ctx context.Context) (bool, int64, error)
}

// SQLStore provides all functions to execute SQL queries and transactions
// The Store interface embeds the Querier interface,
// meaning it inherits all the methods defined in Querier. This allowed Store to compose multiple interfaces together,
// providing a more comprehensive set of methods
type SQLStore struct {
	db *sql.DB
	*Queries
}

// NewStore creates a new store
func NewStore(db *sql.DB) Store {
	return &SQLStore{
		db:      db,
		Queries: New(db),
	}
}

// ExecTx executes a function within a database transaction
// So it require context and a callback function
func (store *SQLStore) execTx(ctx context.Context, fn func(*Queries) error) error {
	const maxRetries = 10
	for i := 0; i < maxRetries; i++ {
		tx, err := store.db.BeginTx(ctx, &sql.TxOptions{
			Isolation: sql.LevelSerializable,
		})
		if err != nil {
			return err
		}

		q := New(tx)
		err = fn(q)
		if err != nil {
			if rbErr := tx.Rollback(); rbErr != nil {
				return fmt.Errorf("tx err: %v, rb err: %v", err, rbErr)
			}

			// Check if the error is related to serialization failure
			if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "40001" { // PostgreSQL serialization error code
				continue // Retry the transaction
			}
			return err
		}

		if err := tx.Commit(); err != nil {
			return err
		}
		return nil
	}
	return fmt.Errorf("transaction failed after %d retries", maxRetries)
}

// TransferTxParams contains the input parameters of the transfer transaction
type TransferTxParams struct {
	FromAccountID int64 `json:"from_account_id"`
	ToAccountID   int64 `json:"to_account_id"`
	Amount        int64 `json:"amount"`
}

// TransferTxResult is the result of the transfer transaction
type TransferTxResult struct {
	Transfer    Transfer `json:"transfer"`
	FromAccount Account  `json:"from_account"`
	ToAccount   Account  `json:"to_account"`
	FromEntry   Entry    `json:"from_entry"`
	ToEntry     Entry    `json:"to_entry"`
}

// TransferTx performs a money transfer from one account to the other.
// It creates the transfer, add account entries, and update accounts' balance within a database transaction
func (store *SQLStore) TransferTx(ctx context.Context, arg TransferTxParams) (TransferTxResult, error) {
	var result TransferTxResult

	err := store.execTx(ctx, func(q *Queries) error {
		var err error

		result.Transfer, err = q.CreateTransfer(ctx, CreateTransferParams{
			FromAccountID: arg.FromAccountID,
			ToAccountID:   arg.ToAccountID,
			Amount:        arg.Amount,
		})
		if err != nil {
			return err
		}

		lastHash, err := q.GetLastEntryHash(ctx)
		if err != nil && err != sql.ErrNoRows {
			return err
		}

		result.FromEntry, err = q.CreateEntry(ctx, CreateEntryParams{
			AccountID: arg.FromAccountID,
			Amount:    -arg.Amount,
		})
		if err != nil {
			return err
		}

		fromHash := util.ChainHash(lastHash, result.FromEntry.ID, result.FromEntry.AccountID, result.FromEntry.Amount, result.FromEntry.CreatedAt)
		result.FromEntry, err = q.SetEntryHash(ctx, SetEntryHashParams{
			ID:       result.FromEntry.ID,
			PrevHash: lastHash,
			Hash:     fromHash,
		})
		if err != nil {
			return err
		}

		result.ToEntry, err = q.CreateEntry(ctx, CreateEntryParams{
			AccountID: arg.ToAccountID,
			Amount:    arg.Amount,
		})
		if err != nil {
			return err
		}

		toHash := util.ChainHash(fromHash, result.ToEntry.ID, result.ToEntry.AccountID, result.ToEntry.Amount, result.ToEntry.CreatedAt)
		result.ToEntry, err = q.SetEntryHash(ctx, SetEntryHashParams{
			ID:       result.ToEntry.ID,
			PrevHash: fromHash,
			Hash:     toHash,
		})
		if err != nil {
			return err
		}

		if arg.FromAccountID < arg.ToAccountID {
			result.FromAccount, result.ToAccount, err = addMoney(ctx, q, arg.FromAccountID, -arg.Amount, arg.ToAccountID, arg.Amount)
		} else {
			result.ToAccount, result.FromAccount, err = addMoney(ctx, q, arg.ToAccountID, arg.Amount, arg.FromAccountID, -arg.Amount)
		}

		return err
	})

	return result, err
}

// VerifyEntryChain walks the entries ledger in order and recomputes each
// entry's hash from its data and the previous entry's hash. It returns false
// and the ID of the first entry whose stored hash doesn't match what the
// chain implies — evidence that entry (or one before it) was tampered with.
func (store *SQLStore) VerifyEntryChain(ctx context.Context) (bool, int64, error) {
	entries, err := store.ListAllEntries(ctx)
	if err != nil {
		return false, 0, err
	}

	prevHash := util.GenesisHash
	for _, entry := range entries {
		expectedHash := util.ChainHash(prevHash, entry.ID, entry.AccountID, entry.Amount, entry.CreatedAt)
		if entry.PrevHash != prevHash || entry.Hash != expectedHash {
			return false, entry.ID, nil
		}
		prevHash = entry.Hash
	}

	return true, 0, nil
}

func addMoney(
	ctx context.Context,
	q *Queries,
	accountID1 int64,
	amount1 int64,
	accountID2 int64,
	amount2 int64,
) (account1 Account, account2 Account, err error) {
	account1, err = q.AddAccountBalance(ctx, AddAccountBalanceParams{
		ID:     accountID1,
		Amount: amount1,
	})
	if err != nil {
		return
	}

	account2, err = q.AddAccountBalance(ctx, AddAccountBalanceParams{
		ID:     accountID2,
		Amount: amount2,
	})
	return
}

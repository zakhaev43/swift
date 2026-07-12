package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type verifyLedgerResponse struct {
	Valid       bool  `json:"valid"`
	BrokenEntry int64 `json:"broken_entry_id,omitempty"`
}

func (server *Server) verifyLedger(ctx *gin.Context) {
	valid, brokenEntryID, err := server.store.VerifyEntryChain(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, verifyLedgerResponse{
		Valid:       valid,
		BrokenEntry: brokenEntryID,
	})
}

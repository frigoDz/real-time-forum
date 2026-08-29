package handlers

import (
	"net/http"

	"real-time-forum/internal/database"
)

func ConversationUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		SendError(w, http.StatusUnauthorized, "Unauthorized!")
		return
	}

	users, err := database.GetConversationUsers(userID)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to get conversations!")
		return
	}

	SendResponse(w, http.StatusOK, users)
}

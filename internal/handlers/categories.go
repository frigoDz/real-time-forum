package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
)

// Categories returns the list of all available categories in JSON.
func Categories(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	categories, err := database.GetAllCategories()
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to retrieve categories")
		return
	}

	SendResponse(w, http.StatusOK, categories)
}

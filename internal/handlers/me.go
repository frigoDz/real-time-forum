package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
)
func Me(w http.ResponseWriter, r *http.Request) {
	// 1. Get cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		SendError(w, http.StatusUnauthorized, "Not logged in")
		return
	}

	// 2. Get user ID from session (already checks expiration)
	userID, err := database.GetSessionByToken(cookie.Value)
	if err != nil {
		SendError(w, http.StatusUnauthorized, "Invalid or expired session")
		return
	}

	// 3. Get user by ID
	user, err := database.GetUserByID(userID)
	if err != nil {
		SendError(w, http.StatusUnauthorized, "User not found")
		return
	}

	// 4. Return user
	SendResponse(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"nickname":   user.Nickname,
		"email":      user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"age":        user.Age,
		"gender":     user.Gender,
	})
}
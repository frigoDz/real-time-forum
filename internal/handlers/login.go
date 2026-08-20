package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"real-time-forum/internal/auth"
	"real-time-forum/internal/database"
)

type LoginRequest struct {
	Identifier string `json:"identifier"`
	Password   string `json:"password"`
}

type UserInfo struct {
	ID        int    `json:"id"`
	Nickname  string `json:"nickname"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	CreatedAt string `json:"createdAt"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON Data!")
		return
	}

	// 1. Trim whitespace & validate non-empty
	req.Identifier = strings.TrimSpace(req.Identifier)
	if req.Identifier == "" || req.Password == "" {
		SendError(w, http.StatusBadRequest, "Identifier and Password are required!")
		return
	}

	// 2. Fetch User & Verify Credentials
	user, err := database.GetUserByNicknameOrEmail(req.Identifier)
	if err != nil {
		SendError(w, http.StatusUnauthorized, "Invalid Credentials!")
		return
	}

	if !auth.CheckPassword(user.Password, req.Password) {
		SendError(w, http.StatusUnauthorized, "Invalid Credentials!")
		return
	}

	// 3. Generate Session Token
	token, err := database.CreateSession(user.ID)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed To Generate User Token!")
		return
	}

	// 4. Set Secure Session Cookie (with 24h Expiration)
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   86400, // 24 hours
		Expires:  time.Now().Add(24 * time.Hour),
	})

	info := UserInfo{
		ID:        user.ID,
		Nickname:  user.Nickname,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Age:       user.Age,
		Gender:    user.Gender,
		CreatedAt: user.CreatedAt,
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "data": info})
}


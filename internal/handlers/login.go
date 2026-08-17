package handlers

import (
	"net/http"
	"real-time-forum/internal/auth"
	"real-time-forum/internal/database"
)

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	identifier := r.FormValue("identifier")
	password := r.FormValue("password")

	user, err := database.GetUserByNicknameOrEmail(identifier)
	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	if !auth.CheckPassword(user.Password, password) {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}
	token, err := database.CreateSession(user.ID)
	if err != nil {
		http.Error(w, "failed to create session", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
	w.Write([]byte("login successful"))
}

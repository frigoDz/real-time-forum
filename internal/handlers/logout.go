package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/database"
	"time"
)

func Logout(w http.ResponseWriter, r *http.Request) {
	// delete the token from the db
	cookie, err := r.Cookie("session")
	fmt.Println(err, "|cookie|", cookie)
	if err == nil {
		err = database.DeleteSession(cookie.Value)
		if err != nil {
			clearSessionCookie(w)
			SendError(w, http.StatusBadRequest, "Failed to logout properly!")
			return
		}
	}
	clearSessionCookie(w)
	SendResponse(w, http.StatusOK, map[string]string{
		"message": "Logged out successfully!",
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	// clear cookies
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})
}

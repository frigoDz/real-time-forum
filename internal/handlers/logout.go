package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
	websockets "real-time-forum/internal/websockets"
	"time"
)

func Logout(manager *websockets.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session")
		if err == nil && cookie.Value != "" {
			userID, errGet := database.GetSessionByToken(cookie.Value)
			if errGet == nil && userID > 0 {
				_ = database.DeleteSession(cookie.Value)

				// Close websocket and broadcast user_offline directly on backend
				if client, ok := manager.GetClient(userID); ok {
					manager.RemoveClient(userID, client)
					_ = client.Conn.Close()
				}

				if !manager.IsOnline(userID) {
					manager.Broadcast(map[string]any{
						"type":   "user_offline",
						"userId": userID,
					})
				}
			}
		}

		clearSessionCookie(w)
		SendResponse(w, http.StatusOK, map[string]string{
			"message": "Logged out successfully!",
		})
	}
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

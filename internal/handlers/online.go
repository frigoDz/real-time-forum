package handlers

import (
	"net/http"
	"strconv"

	websocket "real-time-forum/internal/websockets"
)

func OnlineStatus(manager *websocket.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, err := strconv.Atoi(r.URL.Query().Get("user_id"))
		if err != nil || userID <= 0 {
			SendError(w, http.StatusBadRequest, "Invalid user ID!")
			return
		}

		online := manager.IsOnline(userID)

		SendResponse(w, http.StatusOK, map[string]any{
			"userId": userID,
			"online": online,
		})
	}
}

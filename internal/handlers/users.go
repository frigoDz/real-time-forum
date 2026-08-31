package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/internal/database"
	websockets "real-time-forum/internal/websockets"
)

func GetUsers(manager *websockets.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		users, err := database.GetAllUsersExcept(userID)
		if err != nil {
			http.Error(w, "failed to get users", http.StatusInternalServerError)
			return
		}

		type UserStatus struct {
			ID       int    `json:"id"`
			Nickname string `json:"nickname"`
			Online   bool   `json:"online"`
		}

		result := make([]UserStatus, 0, len(users))

		for _, user := range users {
			result = append(result, UserStatus{
				ID:       user.ID,
				Nickname: user.Nickname,
				Online:   manager.IsOnline(user.ID),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}

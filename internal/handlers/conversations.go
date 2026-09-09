package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/internal/database"
	websockets "real-time-forum/internal/websockets"
)

func ConversationUsers(manager *websockets.ClientManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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

		type UserWithStatus struct {
			ID              int    `json:"id"`
			Nickname        string `json:"nickname"`
			Age             int    `json:"age"`
			Gender          string `json:"gender"`
			FirstName       string `json:"firstName"`
			LastName        string `json:"lastName"`
			Email           string `json:"email"`
			CreatedAt       string `json:"createdAt"`
			Online          bool   `json:"online"`
			LastMessageDate string `json:"lastMessageDate"`
			Unread          bool   `json:"unread"`
		}

		result := make([]UserWithStatus, 0, len(users))
		for _, user := range users {
			result = append(result, UserWithStatus{
				ID:              user.ID,
				Nickname:        user.Nickname,
				Age:             user.Age,
				Gender:          user.Gender,
				FirstName:       user.FirstName,
				LastName:        user.LastName,
				Email:           user.Email,
				CreatedAt:       user.CreatedAt,
				Online:          manager.IsOnline(user.ID),
				LastMessageDate: user.LastMessageDate,
				Unread:          user.Unread,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}


package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"real-time-forum/internal/database"
)

func ToggleLike() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}

		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
		if err != nil || postID <= 0 {
			http.Error(w, "invalid post id", http.StatusBadRequest)
			return
		}

		err = database.ToggleLike(userID, postID)
		if err != nil {
			http.Error(w, "failed to toggle like", http.StatusInternalServerError)
			return
		}

		likes, err := database.GetPostLikes(postID)
		if err != nil {
			http.Error(w, "failed to get likes", http.StatusInternalServerError)
			return
		}

		liked, err := database.GetUserLike(userID, postID)
		if err != nil {
			http.Error(w, "failed to get like status", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]any{
			"likes": likes,
			"liked": liked,
		})
	}
}

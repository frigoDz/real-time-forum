package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

type CreateCommentRequest struct {
	PostID  int    `json:"postId"`
	Content string `json:"content"`
}

func Comments(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		postID, err := strconv.Atoi(r.URL.Query().Get("post_id"))
		if err != nil || postID <= 0 {
			SendError(w, http.StatusBadRequest, "Invalid post ID!")
			return
		}

		comments, err := database.GetCommentsByPost(postID)
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to get comments!")
			return
		}

		SendResponse(w, http.StatusOK, comments)
		return
	}

	if r.Method == http.MethodPost {
		userID, ok := r.Context().Value("userID").(int)
		if !ok {
			SendError(w, http.StatusUnauthorized, "Unauthorized!")
			return
		}

		var req CreateCommentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			SendError(w, http.StatusBadRequest, "Invalid JSON Data!")
			return
		}

		if req.PostID <= 0 || req.Content == "" {
			SendError(w, http.StatusBadRequest, "Post ID and Content are required!")
			return
		}

		comment := models.Comment{
			UserID:  userID,
			PostID:  req.PostID,
			Content: req.Content,
		}

		id, err := database.CreateComment(comment)
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to create comment!")
			return
		}

		SendResponse(w, http.StatusCreated, map[string]any{
			"success": true,
			"id":      id,
		})
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
}


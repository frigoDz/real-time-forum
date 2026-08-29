package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

type CreatePostRequest struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	Categories []int  `json:"categories"`
}

func Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	posts, err := database.GetPosts()
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to get posts!")
		return
	}

	SendResponse(w, http.StatusOK, posts)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		SendError(w, http.StatusUnauthorized, "Unauthorized!")
		return
	}

	var req CreatePostRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON Data!")
		return
	}

	if req.Title == "" || req.Content == "" {
		SendError(w, http.StatusBadRequest, "Title and Content are required!")
		return
	}

	post := models.Post{
		Title:   req.Title,
		Content: req.Content,
		UserID:  userID,
	}

	// Create the post first
	id, err := database.CreatePost(post)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to create post!")
		return
	}

	// Attach categories to the newly created post
	err = database.AddPostCategories(id, req.Categories)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to add categories!")
		return
	}

	SendResponse(w, http.StatusCreated, map[string]any{
		"success": true,
		"id":      id,
	})
}

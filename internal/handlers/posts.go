package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

type CreatePostRequest struct {
	Content    string `json:"content"`
	Categories []int  `json:"categories"`
}

func Posts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	idStr := r.URL.Query().Get("post_id")

	userID, _ := r.Context().Value("userID").(int)

	if idStr != "" {
		id, err := strconv.Atoi(idStr)
		if err != nil || id <= 0 {
			SendError(w, http.StatusBadRequest, "Invalid post ID!")
			return
		}

		post, err := database.GetPostByID(id, userID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				SendError(w, http.StatusNotFound, "Post not found!")
				return
			}
			SendError(w, http.StatusInternalServerError, "Failed to get post!")
			return
		}

		SendResponse(w, http.StatusOK, post)
		return
	}

	categoryID := r.URL.Query().Get("category_id")
	if categoryID == "" {
		categoryID = r.URL.Query().Get("category")
	}
	filter := r.URL.Query().Get("filter")

	userID, _ = r.Context().Value("userID").(int)

	posts, err := database.GetPostsFiltered(categoryID, filter, userID)
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

	req.Content = strings.TrimSpace(req.Content)

	if req.Content == "" {
		SendError(w, http.StatusBadRequest, "Post content is required!")
		return
	}

	if len(req.Content) < 5 || len(req.Content) > 2000 {
		SendError(w, http.StatusBadRequest, "Content length must be between 5 and 2000 characters!")
		return
	}

	if len(req.Categories) == 0 {
		SendError(w, http.StatusBadRequest, "At least one category is required!")
		return
	}

	post := models.Post{
		Content: req.Content,
		UserID:  userID,
	}

	// Create the post first
	id, err := database.CreatePost(post)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to create post!")
		return
	}

	// Attach categories to the newly created post in post_category join table
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

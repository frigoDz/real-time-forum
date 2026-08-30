package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/database"
	"strconv"
	"strings"
)

type BatchDeleteRequest struct {
	IDs []int `json:"ids"`
}

type UpdateUserRequest struct {
	ID        int    `json:"id"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
}

type UpdatePostRequest struct {
	ID      int    `json:"id"`
	Content string `json:"content"`
}

type CategoryRequest struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Admin Users
func AdminUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		users, err := database.GetAllUsers()
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to fetch users")
			return
		}
		SendResponse(w, http.StatusOK, users)
		return
	}

	if r.Method == http.MethodDelete {
		idStr := r.URL.Query().Get("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			SendError(w, http.StatusBadRequest, "Invalid User ID")
			return
		}

		err = database.DeleteUser(id)
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to delete user")
			return
		}

		SendResponse(w, http.StatusOK, map[string]any{"success": true})
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
}

func AdminUsersUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	if req.ID <= 0 || strings.TrimSpace(req.Nickname) == "" || strings.TrimSpace(req.Email) == "" {
		SendError(w, http.StatusBadRequest, "User ID, Nickname, and Email are required")
		return
	}

	err := database.UpdateUser(req.ID, req.Nickname, req.Email, req.FirstName, req.LastName, req.Age, req.Gender)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true})
}

func AdminUsersDeleteBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req BatchDeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := database.DeleteUsersBatch(req.IDs); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to delete users batch")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "deletedCount": len(req.IDs)})
}

// Admin Sessions
func AdminSessions(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		sessions, err := database.GetAllSessions()
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to fetch sessions")
			return
		}
		SendResponse(w, http.StatusOK, sessions)
		return
	}

	if r.Method == http.MethodDelete {
		idStr := r.URL.Query().Get("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			SendError(w, http.StatusBadRequest, "Invalid Session ID")
			return
		}

		err = database.DeleteSessionByID(id)
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to delete session")
			return
		}

		SendResponse(w, http.StatusOK, map[string]any{"success": true})
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
}

func AdminSessionsDeleteBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req BatchDeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := database.DeleteSessionsBatch(req.IDs); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to delete sessions batch")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "deletedCount": len(req.IDs)})
}

// Admin Posts
func AdminPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		posts, err := database.GetPosts()
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to fetch posts")
			return
		}
		SendResponse(w, http.StatusOK, posts)
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
}

func AdminPostsUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req UpdatePostRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	req.Content = strings.TrimSpace(req.Content)
	if req.ID <= 0 || req.Content == "" {
		SendError(w, http.StatusBadRequest, "Post ID and content are required")
		return
	}

	if err := database.UpdatePostContent(req.ID, req.Content); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to update post")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true})
}

func AdminPostsDeleteBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req BatchDeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := database.DeletePostsBatch(req.IDs); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to delete posts batch")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "deletedCount": len(req.IDs)})
}

// Admin Categories
func AdminCategories(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		cats, err := database.GetAllCategories()
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to fetch categories")
			return
		}
		SendResponse(w, http.StatusOK, cats)
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
}

func AdminCategoriesCreate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req CategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		SendError(w, http.StatusBadRequest, "Category name is required")
		return
	}

	if err := database.CreateCategoryAdmin(req.Name); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to create category")
		return
	}

	SendResponse(w, http.StatusCreated, map[string]any{"success": true})
}

func AdminCategoriesUpdate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req CategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.ID <= 0 || req.Name == "" {
		SendError(w, http.StatusBadRequest, "Category ID and name are required")
		return
	}

	if err := database.UpdateCategoryAdmin(req.ID, req.Name); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to update category")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true})
}

func AdminCategoriesDeleteBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req BatchDeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := database.DeleteCategoriesBatch(req.IDs); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to delete categories batch")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "deletedCount": len(req.IDs)})
}

// Admin Comments
func AdminComments(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		comments, err := database.GetAllCommentsAdmin()
		if err != nil {
			SendError(w, http.StatusInternalServerError, "Failed to fetch comments")
			return
		}
		SendResponse(w, http.StatusOK, comments)
		return
	}

	SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
}

func AdminCommentsDeleteBatch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed")
		return
	}

	var req BatchDeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	if err := database.DeleteCommentsBatch(req.IDs); err != nil {
		SendError(w, http.StatusInternalServerError, "Failed to delete comments batch")
		return
	}

	SendResponse(w, http.StatusOK, map[string]any{"success": true, "deletedCount": len(req.IDs)})
}

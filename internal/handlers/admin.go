package handlers

import (
	"net/http"
	"real-time-forum/internal/database"
	"strconv"
)

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

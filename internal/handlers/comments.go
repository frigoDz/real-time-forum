package handlers

import (
	"net/http"
)

// SafeUserResponse excludes sensitive fields like Password hash
type SafeUserResponse struct {
	ID        int    `json:"id"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	CreatedAt string `json:"createdAt"`
}

func Comments(w http.ResponseWriter, r *http.Request) {
	SendResponse(w, http.StatusOK, map[string]string{"message": "comments endpoint"})
}
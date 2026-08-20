package handlers

import (
	"encoding/json"
	"net/http"
)

func SendResponse(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func SendError(w http.ResponseWriter, status int, message string) {
	SendResponse(w, status, map[string]string{"error": message})
}
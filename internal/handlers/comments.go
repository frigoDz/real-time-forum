package handlers

import (
	"net/http"
)

func Comments(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("realtime is running"))
}

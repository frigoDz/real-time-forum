package handlers

import (
	"net/http"
)

func Messages(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("realtime is running"))
}

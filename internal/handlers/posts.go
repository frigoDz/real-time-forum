package handlers

import (
	"net/http"
)

func Posts(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("realtime is running"))
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("realtime is running"))
}

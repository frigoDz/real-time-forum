package handlers

import "net/http"

func Session(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("who am i?\n"))
}
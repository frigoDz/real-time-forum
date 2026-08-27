package routes

import (
	"net/http"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/middleware"
	websockets "real-time-forum/internal/websockets"
)

func Route() {
	manager := websockets.NewClientManager()
	http.HandleFunc("/register", handlers.Register)
	http.HandleFunc("/login", handlers.Login)
	http.HandleFunc("/logout", handlers.Logout)
	http.HandleFunc("/posts", handlers.Posts)
	http.HandleFunc("/posts/create", handlers.CreatePost)
	http.HandleFunc("/comments", handlers.Comments)
	http.HandleFunc("/messages", handlers.Messages)
	http.HandleFunc("/session", handlers.Session)
	http.HandleFunc("/me", handlers.Me)
	http.Handle("/ws", middleware.AuthMiddleware(
		handlers.WebSocketHandler(manager),
	))
}

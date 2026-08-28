package routes

import (
	"net/http"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/middleware"
	websockets "real-time-forum/internal/websockets"
)

func Route() {
	manager := websockets.NewClientManager()
	http.HandleFunc("/api/register", handlers.Register)
	http.HandleFunc("/api/login", handlers.Login)
	http.HandleFunc("/api/logout", handlers.Logout)
	http.HandleFunc("/api/posts", handlers.Posts)
	http.HandleFunc("/api/posts/create", handlers.CreatePost)
	http.HandleFunc("/api/comments", handlers.Comments)
	http.HandleFunc("/api/messages", handlers.Messages)
	http.HandleFunc("/api/session", handlers.Session)
	http.HandleFunc("/api/me", handlers.Me)

	// Admin API Endpoints
	http.HandleFunc("/api/admin/users", handlers.AdminUsers)
	http.HandleFunc("/api/admin/sessions", handlers.AdminSessions)

	http.Handle("/api/ws", middleware.AuthMiddleware(
		handlers.WebSocketHandler(manager),
	))
}

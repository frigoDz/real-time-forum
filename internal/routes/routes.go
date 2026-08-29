package routes

import (
	"net/http"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/middleware"
	websockets "real-time-forum/internal/websockets"
)

func Route() {
	manager := websockets.NewClientManager()
	http.Handle("/api/users/online",
		middleware.AuthMiddleware(
			handlers.OnlineStatus(manager),
		),
	)
	http.Handle("/api/conversations",
		middleware.AuthMiddleware(
			http.HandlerFunc(handlers.ConversationUsers),
		),
	)
	http.HandleFunc("/api/register", handlers.Register)
	http.HandleFunc("/api/login", handlers.Login)
	http.HandleFunc("/api/logout", handlers.Logout)
	http.HandleFunc("/api/posts", handlers.Posts)
	http.Handle("/api/posts/create",
		middleware.AuthMiddleware(http.HandlerFunc(handlers.CreatePost)),
	)
	http.Handle("/api/comments",
		middleware.AuthMiddleware(http.HandlerFunc(handlers.Comments)),
	)
	http.Handle("/api/messages", middleware.AuthMiddleware(
		http.HandlerFunc(handlers.Messages),
	))
	http.Handle("/api/session", middleware.AuthMiddleware(
		http.HandlerFunc(handlers.Session),
	))
	http.Handle("/api/me", middleware.AuthMiddleware(
		http.HandlerFunc(handlers.Me),
	))

	// Admin API Endpoints
	http.HandleFunc("/api/admin/users", handlers.AdminUsers)
	http.HandleFunc("/api/admin/sessions", handlers.AdminSessions)

	http.Handle("/api/ws", middleware.AuthMiddleware(
		handlers.WebSocketHandler(manager),
	))
}

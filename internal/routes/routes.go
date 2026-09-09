package routes

import (
	"net/http"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/middleware"
	websockets "real-time-forum/internal/websockets"
)

func Route() {
	manager := websockets.NewClientManager()
	http.Handle("/api/online",
		middleware.AuthMiddleware(
			handlers.OnlineStatus(manager),
		),
	)
	http.Handle("/api/conversations",
		middleware.AuthMiddleware(
			handlers.ConversationUsers(manager),
		),
	)
	http.HandleFunc("/api/register", handlers.Register)
	http.HandleFunc("/api/login", handlers.Login)
	http.HandleFunc("/api/logout", handlers.Logout(manager))
	http.Handle("/api/posts", middleware.AuthMiddleware(http.HandlerFunc(handlers.Posts)))
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
	http.Handle("/api/categories", middleware.AuthMiddleware(
		http.HandlerFunc(handlers.Categories),
	))

	http.Handle("/api/users", middleware.AuthMiddleware(
		handlers.GetUsers(manager),
	))
	http.Handle("/api/ws", middleware.AuthMiddleware(
		handlers.WebSocketHandler(manager),
	))
	http.Handle(
		"/api/likes",
		middleware.AuthMiddleware(
			handlers.ToggleLike(),
		),
	)
}

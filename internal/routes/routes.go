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

	// Admin API Endpoints (Full CRUD for DB Management)
	http.HandleFunc("/api/admin/users", handlers.AdminUsers)
	http.HandleFunc("/api/admin/users/update", handlers.AdminUsersUpdate)
	http.HandleFunc("/api/admin/users/delete-batch", handlers.AdminUsersDeleteBatch)

	http.HandleFunc("/api/admin/sessions", handlers.AdminSessions)
	http.HandleFunc("/api/admin/sessions/delete-batch", handlers.AdminSessionsDeleteBatch)

	http.HandleFunc("/api/admin/posts", handlers.AdminPosts)
	http.HandleFunc("/api/admin/posts/update", handlers.AdminPostsUpdate)
	http.HandleFunc("/api/admin/posts/delete-batch", handlers.AdminPostsDeleteBatch)

	http.HandleFunc("/api/admin/categories", handlers.AdminCategories)
	http.HandleFunc("/api/admin/categories/create", handlers.AdminCategoriesCreate)
	http.HandleFunc("/api/admin/categories/update", handlers.AdminCategoriesUpdate)
	http.HandleFunc("/api/admin/categories/delete-batch", handlers.AdminCategoriesDeleteBatch)

	http.HandleFunc("/api/admin/comments", handlers.AdminComments)
	http.HandleFunc("/api/admin/comments/delete-batch", handlers.AdminCommentsDeleteBatch)

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

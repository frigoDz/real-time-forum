package main

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/routes"
	"real-time-forum/internal/database"
)

func main() {
	routes.Route()
	database.DBinit()
	defer database.DBClose()
	fmt.Println("server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

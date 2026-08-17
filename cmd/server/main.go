package main

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/database"
	"real-time-forum/internal/routes"
)

func main() {
	database.DBinit()
	defer database.DBClose()
	routes.Route()
	fmt.Println("server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

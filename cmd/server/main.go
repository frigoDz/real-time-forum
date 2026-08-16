package main

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/routes"
)

func main() {
	routes.Route()
	fmt.Println("server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

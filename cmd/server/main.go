package main

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/database"
)

func main() {
	database.DBinit()
	defer database.DBClose()
	http.Handle("/", http.FileServer(http.Dir("./static")))
	fmt.Println("server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

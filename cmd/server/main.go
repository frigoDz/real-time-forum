package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"real-time-forum/internal/database"
	"real-time-forum/internal/routes"
)

func main() {
	database.DBinit()
	defer database.DBClose()
	routes.Route()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := "./web" + r.URL.Path
		if r.URL.Path != "/" {
			if _, err := os.Stat(path); err == nil {
				http.FileServer(http.Dir("./web")).ServeHTTP(w, r)
				return
			}
		}
		http.ServeFile(w, r, "./web/index.html")
	})

	fmt.Println("server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

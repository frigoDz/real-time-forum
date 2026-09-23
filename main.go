package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"real-time-forum/internal/database"
	"real-time-forum/internal/routes"
)

func main() {
	database.DBinit()
	defer database.DBClose()
	routes.Route()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error": "API route not found"}`))
			return
		}

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

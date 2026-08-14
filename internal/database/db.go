package database

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"log"
)

var DB *sql.DB

func DBinit() {
	var err error
	DB, err = sql.Open("sqlite3", "./real-time-forum.db")
	if err != nil {
		log.Fatal(err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatal(err)

	}
	_, err = DB.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Fatal(err)
	}
	TableCreation()

}
func DBClose() {
	if DB != nil {
		DB.Close()
	}
}

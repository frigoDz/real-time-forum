package models

type Post struct {
	ID         int      `json:"id"`
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	UserID     int      `json:"userId"`
	CreatedAt  string   `json:"createdAt"`
	Categories []string `json:"categories"`
}

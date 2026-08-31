package models

type Post struct {
	ID         int      `json:"id"`
	Content    string   `json:"content"`
	UserID     int      `json:"userId"`
	Author     string   `json:"author"`
	CreatedAt  string   `json:"createdAt"`
	Categories []string `json:"categories"`
	Likes      int      `json:"likes"`
}

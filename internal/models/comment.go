package models

type Comment struct {
	ID        int    `json:"id"`
	UserID    int    `json:"userId"`
	Author    string `json:"author"`
	PostID    int    `json:"postId"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}

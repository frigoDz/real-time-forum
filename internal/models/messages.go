package models

type Message struct {
	ID         int
	SenderID   int
	ReceiverID int
	Content    string
	CreatedAt  string
}
type SendMessage struct {
	ReceiverID int    `json:"receiverId"`
	Content    string `json:"content"`
}

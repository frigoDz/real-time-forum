package database

import "real-time-forum/internal/models"

func CreateMessage(message models.Message) (int64, error) {
	query := `
		INSERT INTO messages (sender_id, receiver_id, content)
		VALUES (?, ?, ?)
	`

	result, err := DB.Exec(
		query,
		message.SenderID,
		message.ReceiverID,
		message.Content,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

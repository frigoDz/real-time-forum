package database

import (
	"database/sql"
	"fmt"
	"real-time-forum/internal/models"
	"strings"
)

func GetMessages(userID1, userID2, limit, offset int) ([]models.Message, error) {
	query := `
		SELECT id, sender_id, receiver_id, content, created_at
		FROM messages
		WHERE
			(sender_id = ? AND receiver_id = ?)
			OR
			(sender_id = ? AND receiver_id = ?)
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := DB.Query(
		query,
		userID1, userID2,
		userID2, userID1,
		limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message

	for rows.Next() {
		var message models.Message

		err := rows.Scan(
			&message.ID,
			&message.SenderID,
			&message.ReceiverID,
			&message.Content,
			&message.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		messages = append(messages, message)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return messages, nil
}

func CreateMessage(message models.Message) (int64, error) {
	if message.SenderID <= 0 {
		return 0, fmt.Errorf("invalid sender")
	}

	if message.ReceiverID <= 0 {
		return 0, fmt.Errorf("invalid receiver")
	}

	if message.SenderID == message.ReceiverID {
		return 0, fmt.Errorf("sender and receiver cannot be the same")
	}

	message.Content = strings.TrimSpace(message.Content)

	if message.Content == "" {
		return 0, fmt.Errorf("message cannot be empty")
	}

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
func GetConversationUsers(userID int) ([]models.User, error) {
	query := `
		SELECT
			u.id,
			u.nickname,
			u.age,
			u.gender,
			u.first_name,
			u.last_name,
			u.email,
			u.created_at,
			MAX(m.created_at) AS last_message
		FROM users u
		LEFT JOIN messages m
			ON (
				(m.sender_id = ? AND m.receiver_id = u.id)
				OR
				(m.receiver_id = ? AND m.sender_id = u.id)
			)
		WHERE u.id != ?
		GROUP BY u.id
		ORDER BY
			CASE WHEN last_message IS NULL THEN 1 ELSE 0 END,
			last_message DESC,
			u.nickname ASC
	`

	rows, err := DB.Query(query, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User
		var lastMessage sql.NullString

		err := rows.Scan(
			&user.ID,
			&user.Nickname,
			&user.Age,
			&user.Gender,
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.CreatedAt,
			&lastMessage,
		)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if users == nil {
		users = []models.User{}
	}

	return users, nil
}

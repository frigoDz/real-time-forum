package database

import (
	"database/sql"
	"fmt"
	"real-time-forum/internal/models"
	"strings"
	"time"
)

func GetMessages(userID1, userID2, limit, offset int) ([]models.Message, error) {
	query := `
    SELECT id, sender_id, receiver_id, content, strftime('%Y-%m-%dT%H:%M:%fZ', COALESCE(created_at, CURRENT_TIMESTAMP)) AS created_at
    FROM messages
    WHERE
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
`

	// Mark unread messages from userID2 to userID1 as read
	_, _ = DB.Exec("UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0", userID2, userID1)

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

	messages := []models.Message{}

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

func CreateMessage(message models.Message) (models.Message, error) {
	if message.SenderID <= 0 {
		return models.Message{}, fmt.Errorf("invalid sender")
	}

	if message.ReceiverID <= 0 {
		return models.Message{}, fmt.Errorf("invalid receiver")
	}

	if message.SenderID == message.ReceiverID {
		return models.Message{}, fmt.Errorf("sender and receiver cannot be the same")
	}

	message.Content = strings.TrimSpace(message.Content)

	if message.Content == "" {
		return models.Message{}, fmt.Errorf("message cannot be empty")
	}

	message.CreatedAt = time.Now().UTC().Format("2006-01-02T15:04:05.000Z")

	query := `
		INSERT INTO messages (sender_id, receiver_id, content, created_at)
		VALUES (?, ?, ?, ?)
	`

	result, err := DB.Exec(
		query,
		message.SenderID,
		message.ReceiverID,
		message.Content,
		message.CreatedAt,
	)
	if err != nil {
		return models.Message{}, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return models.Message{}, err
	}
	message.ID = int(id)

	return message, nil
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
			MAX(m.created_at) AS last_message,
			COALESCE((SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = u.id AND m2.receiver_id = ? AND m2.is_read = 0), 0) AS unread_count
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

	rows, err := DB.Query(query, userID, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User
		var lastMessage sql.NullString
		var unreadCount int

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
			&unreadCount,
		)
		if err != nil {
			return nil, err
		}

		if lastMessage.Valid {
			user.LastMessageDate = lastMessage.String
		}
		user.Unread = unreadCount > 0

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

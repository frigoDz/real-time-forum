package database

import "real-time-forum/internal/models"

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
			u.created_at
		FROM users u
		JOIN (
			SELECT
				CASE
					WHEN sender_id = ? THEN receiver_id
					ELSE sender_id
				END AS other_user_id,
				MAX(created_at) AS last_message
			FROM messages
			WHERE sender_id = ? OR receiver_id = ?
			GROUP BY other_user_id
		) m ON u.id = m.other_user_id
		ORDER BY m.last_message DESC
	`

	rows, err := DB.Query(query, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User

	for rows.Next() {
		var user models.User

		err := rows.Scan(
			&user.ID,
			&user.Nickname,
			&user.Age,
			&user.Gender,
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

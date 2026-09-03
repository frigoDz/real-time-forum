package database

import "real-time-forum/internal/models"

func CreateComment(comment models.Comment) (int64, error) {
	query := `
		INSERT INTO comments (user_id, post_id, content)
		VALUES (?, ?, ?)
	`

	result, err := DB.Exec(
		query,
		comment.UserID,
		comment.PostID,
		comment.Content,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func GetCommentsByPost(postID int) ([]models.Comment, error) {
	query := `
		SELECT c.id, c.user_id, COALESCE(u.nickname, 'Anonymous') AS author, c.post_id, c.content, c.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		WHERE c.post_id = ?
		ORDER BY c.created_at ASC
	`

	rows, err := DB.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.Comment

	for rows.Next() {
		var comment models.Comment

		err := rows.Scan(
			&comment.ID,
			&comment.UserID,
			&comment.Author,
			&comment.PostID,
			&comment.Content,
			&comment.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		comments = append(comments, comment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if comments == nil {
		comments = []models.Comment{}
	}

	return comments, nil
}

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
		SELECT id, user_id, post_id, content, created_at
		FROM comments
		WHERE post_id = ?
		ORDER BY created_at ASC
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

	return comments, nil
}

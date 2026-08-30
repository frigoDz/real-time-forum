package database

import (
	"fmt"
	"strings"
)

// UpdateUser updates a user's details in SQLite.
func UpdateUser(id int, nickname, email, firstName, lastName string, age int, gender string) error {
	query := `
		UPDATE users 
		SET nickname = ?, email = ?, first_name = ?, last_name = ?, age = ?, gender = ?
		WHERE id = ?
	`
	_, err := DB.Exec(query, nickname, email, firstName, lastName, age, gender, id)
	return err
}

// DeleteUsersBatch deletes multiple user rows at once by IDs.
func DeleteUsersBatch(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM users WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := DB.Exec(query, args...)
	return err
}

// UpdatePostContent updates a post's content text in SQLite.
func UpdatePostContent(id int, content string) error {
	query := "UPDATE posts SET content = ? WHERE id = ?"
	_, err := DB.Exec(query, content, id)
	return err
}

// DeletePostsBatch deletes multiple post rows at once by IDs.
func DeletePostsBatch(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM posts WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := DB.Exec(query, args...)
	return err
}

// CreateCategoryAdmin inserts a new category into SQLite.
func CreateCategoryAdmin(name string) error {
	query := "INSERT INTO category (name) VALUES (?)"
	_, err := DB.Exec(query, name)
	return err
}

// UpdateCategoryAdmin renames an existing category.
func UpdateCategoryAdmin(id int, name string) error {
	query := "UPDATE category SET name = ? WHERE id = ?"
	_, err := DB.Exec(query, name, id)
	return err
}

// DeleteCategoriesBatch deletes multiple category rows at once by IDs.
func DeleteCategoriesBatch(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM category WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := DB.Exec(query, args...)
	return err
}

// DeleteSessionsBatch deletes multiple session/token rows at once by IDs.
func DeleteSessionsBatch(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM session WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := DB.Exec(query, args...)
	return err
}

// GetAllCommentsAdmin fetches all comments for admin inspection.
func GetAllCommentsAdmin() ([]map[string]any, error) {
	query := `
		SELECT c.id, c.user_id, COALESCE(u.nickname, 'User') AS author, c.post_id, c.content, c.created_at
		FROM comments c
		LEFT JOIN users u ON c.user_id = u.id
		ORDER BY c.id DESC
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []map[string]any
	for rows.Next() {
		var id, userID, postID int
		var author, content, createdAt string
		if err := rows.Scan(&id, &userID, &author, &postID, &content, &createdAt); err == nil {
			comments = append(comments, map[string]any{
				"id":        id,
				"userId":    userID,
				"author":    author,
				"postId":    postID,
				"content":   content,
				"createdAt": createdAt,
			})
		}
	}
	if comments == nil {
		comments = []map[string]any{}
	}
	return comments, nil
}

// DeleteCommentsBatch deletes multiple comment rows at once by IDs.
func DeleteCommentsBatch(ids []int) error {
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	query := fmt.Sprintf("DELETE FROM comments WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := DB.Exec(query, args...)
	return err
}

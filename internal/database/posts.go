package database

import (
	"real-time-forum/internal/models"
	"strings"
)

func CreatePost(post models.Post) (int64, error) {
	query := `
		INSERT INTO posts (title, content, user_id)
		VALUES (?, ?, ?)
	`

	result, err := DB.Exec(
		query,
		post.Title,
		post.Content,
		post.UserID,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func GetPosts() ([]models.Post, error) {
	query := `
		SELECT
			p.id,
			p.title,
			p.content,
			p.user_id,
			p.created_at,
			COALESCE(GROUP_CONCAT(c.name), '') AS categories
		FROM posts p
		LEFT JOIN post_category pc ON p.id = pc.post_id
		LEFT JOIN category c ON pc.category_id = c.id
		GROUP BY p.id
		ORDER BY p.created_at DESC
	`

	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post

	for rows.Next() {
		var post models.Post
		var categories string

		err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Content,
			&post.UserID,
			&post.CreatedAt,
			&categories,
		)
		if err != nil {
			return nil, err
		}

		if categories != "" {
			post.Categories = strings.Split(categories, ",")
		} else {
			post.Categories = []string{}
		}

		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return posts, nil
}

func AddPostCategories(postID int64, categoryIDs []int) error {
	query := `
		INSERT INTO post_category (post_id, category_id)
		VALUES (?, ?)
	`

	for _, categoryID := range categoryIDs {
		_, err := DB.Exec(query, postID, categoryID)
		if err != nil {
			return err
		}
	}

	return nil
}

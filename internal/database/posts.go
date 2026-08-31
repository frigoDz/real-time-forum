package database

import (
	"real-time-forum/internal/models"
	"strings"
)

// CreatePost inserts a new post record into SQLite (content & user_id) and returns the generated post ID.
func CreatePost(post models.Post) (int64, error) {
	query := `
		INSERT INTO posts (content, user_id)
		VALUES (?, ?)
	`

	result, err := DB.Exec(
		query,
		post.Content,
		post.UserID,
	)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

// GetPosts returns all posts from SQLite along with author nicknames and associated categories.
func GetPosts() ([]models.Post, error) {
	query := `
		SELECT
			p.id,
			p.content,
			p.user_id,
			COALESCE(u.nickname, 'Anonymous') AS author,
			p.created_at,
			COALESCE(GROUP_CONCAT(c.name), '') AS categories
			COUNT(DISTINCT l.id) AS likes
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN post_category pc ON p.id = pc.post_id
		LEFT JOIN category c ON pc.category_id = c.id
		LEFT JOIN likes l ON p.id = l.post_id
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
		var likes int

		err := rows.Scan(
			&post.ID,
			&post.Content,
			&post.UserID,
			&post.Author,
			&post.CreatedAt,
			&categories,
			&likes,
		)
		if err != nil {
			return nil, err
		}

		if categories != "" {
			post.Categories = strings.Split(categories, ",")
		} else {
			post.Categories = []string{}
		}

		post.Likes = likes
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if posts == nil {
		posts = []models.Post{}
	}

	return posts, nil
}

// AddPostCategories inserts entries into the post_category join table.
func AddPostCategories(postID int64, categoryIDs []int) error {
	if len(categoryIDs) == 0 {
		return nil
	}

	query := `
		INSERT OR IGNORE INTO post_category (post_id, category_id)
		VALUES (?, ?)
	`

	stmt, err := DB.Prepare(query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, categoryID := range categoryIDs {
		_, err := stmt.Exec(postID, categoryID)
		if err != nil {
			return err
		}
	}

	return nil
}

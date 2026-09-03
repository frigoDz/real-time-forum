package database

import (
	"fmt"
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
	return GetPostsFiltered("", "", 0)
}

// GetPostsFiltered returns posts with optional category, author (my-posts), or liked filter.
func GetPostsFiltered(categoryID string, filter string, userID int) ([]models.Post, error) {
	var whereClauses []string
	var args []any

	args = append(args, userID)

	if categoryID != "" {
		whereClauses = append(whereClauses, "p.id IN (SELECT post_id FROM post_category WHERE category_id = ?)")
		args = append(args, categoryID)
	}

	if filter == "created" || filter == "my-posts" {
		whereClauses = append(whereClauses, "p.user_id = ?")
		args = append(args, userID)
	} else if filter == "liked" || filter == "liked-posts" {
		whereClauses = append(whereClauses, "p.id IN (SELECT post_id FROM likes WHERE user_id = ?)")
		args = append(args, userID)
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT
			p.id,
			p.content,
			p.user_id,
			COALESCE(u.nickname, 'Anonymous') AS author,
			p.created_at,
			COALESCE(GROUP_CONCAT(DISTINCT c.name), '') AS categories,
			COUNT(DISTINCT l.id) AS likes,
			COUNT(DISTINCT cm.id) AS comments_count,
			EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) AS liked
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN post_category pc ON p.id = pc.post_id
		LEFT JOIN category c ON pc.category_id = c.id
		LEFT JOIN likes l ON p.id = l.post_id
		LEFT JOIN comments cm ON p.id = cm.post_id
		%s
		GROUP BY p.id
		ORDER BY p.created_at DESC
	`, whereSQL)

	rows, err := DB.Query(query, args...)
	if err != nil {
		fmt.Println("GetPostsFiltered query error:", err)
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post

	for rows.Next() {
		var post models.Post
		var categories string
		var likes int
		var commentsCount int
		var liked bool

		err := rows.Scan(
			&post.ID,
			&post.Content,
			&post.UserID,
			&post.Author,
			&post.CreatedAt,
			&categories,
			&likes,
			&commentsCount,
			&liked,
		)
		if err != nil {
			fmt.Println("GetPostsFiltered scan error:", err)
			return nil, err
		}

		if categories != "" {
			post.Categories = strings.Split(categories, ",")
		} else {
			post.Categories = []string{}
		}

		post.Likes = likes
		post.CommentsCount = commentsCount
		post.Liked = liked
		posts = append(posts, post)
	}

	if err := rows.Err(); err != nil {
		fmt.Println("GetPostsFiltered rows error:", err)
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

	// check available cats
	dbCategories, err := GetAllCategories()
	if err != nil {
		return err
	}
	catMap := make(map[int]bool)
	for _, cat := range dbCategories {
		catMap[cat.ID] = true
	}
	for _, cat := range categoryIDs {
		if !catMap[cat] {
			return fmt.Errorf("Error: categorie/s not found!")
		} 
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

// GetPostByID fetches a single post by its ID along with author nickname, categories, likes count, comments count, and liked status for current user.
func GetPostByID(id int, userID int) (*models.Post, error) {
	query := `
		SELECT
			p.id,
			p.content,
			p.user_id,
			COALESCE(u.nickname, 'Anonymous') AS author,
			p.created_at,
			COALESCE(GROUP_CONCAT(DISTINCT c.name), '') AS categories,
			COUNT(DISTINCT l.id) AS likes,
			COUNT(DISTINCT cm.id) AS comments_count,
			EXISTS(SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id) AS liked
		FROM posts p
		LEFT JOIN users u ON p.user_id = u.id
		LEFT JOIN post_category pc ON p.id = pc.post_id
		LEFT JOIN category c ON pc.category_id = c.id
		LEFT JOIN likes l ON p.id = l.post_id
		LEFT JOIN comments cm ON p.id = cm.post_id
		WHERE p.id = ?
		GROUP BY p.id
	`

	var post models.Post
	var categories string
	var likes int
	var commentsCount int
	var liked bool

	err := DB.QueryRow(query, userID, id).Scan(
		&post.ID,
		&post.Content,
		&post.UserID,
		&post.Author,
		&post.CreatedAt,
		&categories,
		&likes,
		&commentsCount,
		&liked,
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
	post.CommentsCount = commentsCount
	post.Liked = liked
	return &post, nil
}




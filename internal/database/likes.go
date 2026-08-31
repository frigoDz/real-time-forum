package database

import "database/sql"

func ToggleLike(userID, postID int) error {
	var exists int

	err := DB.QueryRow(`
		SELECT 1
		FROM likes
		WHERE user_id = ? AND post_id = ?
	`, userID, postID).Scan(&exists)

	if err == sql.ErrNoRows {
		_, err = DB.Exec(`
			INSERT INTO likes (user_id, post_id)
			VALUES (?, ?)
		`, userID, postID)

		return err
	}

	if err != nil {
		return err
	}

	_, err = DB.Exec(`
		DELETE FROM likes
		WHERE user_id = ? AND post_id = ?
	`, userID, postID)

	return err
}

func GetPostLikes(postID int) (int, error) {
	var count int

	err := DB.QueryRow(`
		SELECT COUNT(*)
		FROM likes
		WHERE post_id = ?
	`, postID).Scan(&count)

	return count, err
}

func GetUserLike(userID, postID int) (bool, error) {
	var exists int

	err := DB.QueryRow(`
		SELECT 1
		FROM likes
		WHERE user_id = ? AND post_id = ?
	`, userID, postID).Scan(&exists)

	if err == sql.ErrNoRows {
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return true, nil
}

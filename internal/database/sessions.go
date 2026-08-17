package database

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

func CreateSession(userID int) (string, error) {
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	token := hex.EncodeToString(bytes)
	expiresAt := time.Now().Add(24 * time.Hour)
	query := `
		INSERT INTO session (user_id, token, expires_at)
		VALUES (?, ?, ?)
	`
	_, err = DB.Exec(query, userID, token, expiresAt)
	if err != nil {
		return "", err
	}
	return token, nil
}

func GetSessionByToken(token string) (int, error) {
	var userID int

	query := `
		SELECT user_id
		FROM session
		WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
	`

	err := DB.QueryRow(query, token).Scan(&userID)
	if err != nil {
		return 0, err
	}

	return userID, nil
}

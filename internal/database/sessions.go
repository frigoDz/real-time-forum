package database

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type SessionInfo struct {
	ID        int       `json:"id"`
	UserID    int       `json:"userId"`
	Nickname  string    `json:"nickname"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expiresAt"`
}

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

func DeleteSession(token string) error {
	query := `
		DELETE FROM session WHERE token = ?
	`
	_, err := DB.Exec(query, token)
	return err
}

func GetAllSessions() ([]SessionInfo, error) {
	query := `
		SELECT s.id, s.user_id, u.nickname, s.token, s.expires_at 
		FROM session s 
		JOIN users u ON s.user_id = u.id 
		ORDER BY s.id DESC
	`
	rows, err := DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []SessionInfo
	for rows.Next() {
		var s SessionInfo
		if err := rows.Scan(&s.ID, &s.UserID, &s.Nickname, &s.Token, &s.ExpiresAt); err == nil {
			sessions = append(sessions, s)
		}
	}
	return sessions, nil
}

func DeleteSessionByID(id int) error {
	_, err := DB.Exec("DELETE FROM session WHERE id = ?", id)
	return err
}

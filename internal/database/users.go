package database

import (
	"real-time-forum/internal/models"
)

func CreateUser(user models.User) (int, error) {
	query := "INSERT INTO users (nickname, age, gender, first_name, last_name, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)"
	result, err := DB.Exec(query, user.Nickname, user.Age, user.Gender, user.FirstName, user.LastName, user.Email, user.Password)
	if err != nil {
		return 0, err
	}
	lastID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return int(lastID), nil
}

func GetUserByNicknameOrEmail(identifier string) (models.User, error) {
	var user models.User

	query := `
		SELECT id, nickname, age, gender, first_name, last_name, email, password, created_at
		FROM users
		WHERE id = ? OR nickname = ? OR email = ?
	`

	err := DB.QueryRow(query, identifier, identifier, identifier).Scan(
		&user.ID,
		&user.Nickname,
		&user.Age,
		&user.Gender,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
	)
	if err != nil {
		return models.User{}, err
	}

	return user, nil
}

func GetUserByID(id int) (models.User, error) {
	var user models.User

	query := `
		SELECT id, nickname, age, gender, first_name, last_name, email, created_at
		FROM users
		WHERE id = ?
	`

	err := DB.QueryRow(query, id).Scan(
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
		return models.User{}, err
	}

	return user, nil
}
package handlers

import (
	"encoding/json"
	"html"
	"log"
	"net/http"
	"net/mail"
	"regexp"
	"strings"

	"real-time-forum/internal/auth"
	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
)

type RegisterRequest struct {
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	CreatedAt string `json:"createdAt"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendError(w, http.StatusMethodNotAllowed, "Method Not Allowed!")
		return
	}

	var req RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid JSON Data!")
		return
	}

	// 1. Trim whitespace
	req.Nickname = strings.TrimSpace(req.Nickname)
	req.Email = strings.TrimSpace(req.Email)
	req.FirstName = strings.TrimSpace(req.FirstName)
	req.LastName = strings.TrimSpace(req.LastName)
	req.Gender = strings.TrimSpace(req.Gender)

	// 2. Validate empty fields
	if req.Nickname == "" || req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" || req.Gender == "" {
		SendError(w, http.StatusBadRequest, "All fields are required!")
		return
	}

	// 3. Validate Email format
	parsedEmail, err := mail.ParseAddress(req.Email)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Invalid Email Address!")
		return
	}

	// 4. Validate Nickname format (no emojis or special symbols)
	nicknameRegex := regexp.MustCompile(`^[a-zA-Z0-9_-]{3,30}$`)
	if !nicknameRegex.MatchString(req.Nickname) {
		SendError(w, http.StatusBadRequest, "Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens!")
		return
	}

	// 5. Validate First and Last Name format
	nameRegex := regexp.MustCompile(`^[a-zA-Z\s'-]{2,50}$`)
	if !nameRegex.MatchString(req.FirstName) || !nameRegex.MatchString(req.LastName) {
		SendError(w, http.StatusBadRequest, "First and last names must contain only letters, spaces, hyphens, or apostrophes!")
		return
	}

	// 6. Validate Password length
	if len(req.Password) < 8 || len(req.Password) > 72 {
		SendError(w, http.StatusBadRequest, "Password must be between 8 and 72 characters!")
		return
	}

	// 7. Validate Age boundaries
	if req.Age < 13 || req.Age > 120 {
		SendError(w, http.StatusBadRequest, "Age must be between 13 and 120!")
		return
	}

	// 6. Security Sanitization (XSS prevention)
	cleanNickname := html.EscapeString(req.Nickname)
	cleanFirstName := html.EscapeString(req.FirstName)
	cleanLastName := html.EscapeString(req.LastName)
	cleanGender := html.EscapeString(req.Gender)

	// 7. Hash Password (only after all validations pass)
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		SendError(w, http.StatusInternalServerError, "Failed To Hash The Password!")
		return
	}

	user := models.User{
		Nickname:  cleanNickname,
		Email:     parsedEmail.Address,
		Password:  hashedPassword,
		FirstName: cleanFirstName,
		LastName:  cleanLastName,
		Age:       req.Age,
		Gender:    cleanGender,
		CreatedAt: req.CreatedAt,
	}

	lastId, err := database.CreateUser(user)
	if err != nil {
		SendError(w, http.StatusBadRequest, "Nickname or Email already registered!")
		log.Println("DB Register Error:", err)
		return
	}

	SendResponse(w, http.StatusCreated, map[string]any{"message": "User Created", "user_id": lastId})
}


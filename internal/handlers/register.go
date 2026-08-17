package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/auth"
	"real-time-forum/internal/database"
	"real-time-forum/internal/models"
	"strconv"
)

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	nickname := r.FormValue("nickname")
	ageString := r.FormValue("age")
	gender := r.FormValue("gender")
	firstName := r.FormValue("firstName")
	lastName := r.FormValue("lastName")
	email := r.FormValue("email")
	password := r.FormValue("password")

	age, err := strconv.Atoi(ageString)
	if err != nil {
		http.Error(w, "invalid age", http.StatusBadRequest)
		return
	}
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}
	user := models.User{
		Nickname:  nickname,
		Age:       age,
		Gender:    gender,
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Password:  hashedPassword,
	}
	userID, err := database.CreateUser(user)
	if err != nil {
		http.Error(w, "failed to create user", http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "user created with ID %d", userID)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("user created"))
}

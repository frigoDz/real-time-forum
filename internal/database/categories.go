package database

import (
	"log"
	"real-time-forum/internal/models"
)

// SeedCategories inserts default forum categories if the category table is empty.
func SeedCategories() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM category").Scan(&count)
	if err != nil {
		log.Printf("Error checking category count: %v", err)
		return
	}

	if count == 0 {
		defaultCategories := []string{"General", "Development", "Tech", "Random"}
		stmt, err := DB.Prepare("INSERT INTO category(name) VALUES(?)")
		if err != nil {
			log.Printf("Error preparing category seed statement: %v", err)
			return
		}
		defer stmt.Close()

		for _, name := range defaultCategories {
			_, err := stmt.Exec(name)
			if err != nil {
				log.Printf("Error seeding category %s: %v", name, err)
			}
		}
		log.Println("Default categories seeded successfully.")
	}
}

// GetAllCategories returns all categories stored in SQLite.
func GetAllCategories() ([]models.Category, error) {
	rows, err := DB.Query("SELECT id, name FROM category ORDER BY id ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var cat models.Category
		if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}

	if categories == nil {
		categories = []models.Category{}
	}

	return categories, nil
}

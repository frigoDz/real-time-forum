package database

import "log"

func TableCreation() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users(
			id INTEGER PRIMARY KEY,
    	nickname TEXT UNIQUE NOT NULL,
    	age INTEGER NOT NULL,
    	gender TEXT NOT NULL,
    	first_name TEXT NOT NULL,
    	last_name TEXT NOT NULL,
    	email TEXT UNIQUE NOT NULL,
    	password TEXT NOT NULL,
    	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`,

		`CREATE TABLE IF NOT EXISTS posts(
			id INTEGER PRIMARY KEY,
			title VARCHAR,
			content TEXT,
			user_id INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`,

		`CREATE TABLE IF NOT EXISTS category(
			id INTEGER PRIMARY KEY,
			name VARCHAR NOT NULL
	)`,

		`CREATE TABLE IF NOT EXISTS post_category(
			post_id INTEGER NOT NULL,
    	category_id INTEGER NOT NULL,
  		PRIMARY KEY (post_id, category_id),
    	FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    	FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
	)`,

		`CREATE TABLE IF NOT EXISTS comments(
		id INTEGER PRIMARY KEY,
		user_id INTEGER NOT NULL,
		post_id INTEGER NOT NULL,
		content VARCHAR,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
	)`,

		`CREATE TABLE IF NOT EXISTS likes(
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    post_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
	)`,

		`CREATE TABLE IF NOT EXISTS session(
		id INTEGER PRIMARY KEY,
		user_id INTEGER NOT NULL,
		token VARCHAR UNIQUE NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	)`,
		`CREATE TABLE IF NOT EXISTS messages(
			id INTEGER PRIMARY KEY,
			sender_id INTEGER NOT NULL,
    	receiver_id INTEGER NOT NULL,
    	content TEXT NOT NULL,
    	is_read INTEGER DEFAULT 0,
    	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    	FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
	)`,
	}
	for _, query := range queries {
		_, err := DB.Exec(query)
		if err != nil {
			log.Fatal(err)
		}
	}

	SeedCategories()
}

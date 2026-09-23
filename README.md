# Real-Time Forum

A small full-stack forum application with user authentication, posts, comments, likes, categories, and private real-time messaging.

## Features

- Register and log in with session-based authentication
- Create, filter, like, and comment on posts
- View your own posts and liked posts
- Chat privately with other users
- See online users and receive live presence updates
- Load previous messages with pagination

## Tech Stack

- **Backend:** Go
- **Frontend:** Vanilla JavaScript, HTML, and CSS
- **Database:** SQLite
- **Real-time communication:** WebSockets

## Project Structure

```text
cmd/server/          Application entry point
internal/auth/       Password hashing and authentication helpers
internal/database/   SQLite queries and table setup
internal/handlers/   HTTP and WebSocket handlers
internal/middleware/ Authentication middleware
internal/models/     Application data models
internal/routes/     API route registration
internal/websockets/ Connected-client management
web/                 Frontend application
```


## Running Locally

Make sure Go and SQLite build tools are installed, then run:
```bash
go run main.go
```

open the application at:
```text
localhost:8080
```

The SQLite database is created automatically as real-time-forum.db in the project root.


## Main AIP routes

- POST      /api/register
- POST      /api/login
- POST      /api/logout
- GET       /api/posts
- POST      /api/posts/create
- GET       /api/comments
- GET       /api/messages
- GET       /api/users
- GET       /api/categories
- GET       /api/ws


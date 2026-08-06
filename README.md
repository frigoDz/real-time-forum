# Forum Frontend & Backend Contract Specification

## Overview
This document acts as the contract between the backend and frontend teams. The frontend assumes all REST endpoints and WebSocket events described in this specification exist and behave as defined below.

---

## SPA Flow & Navigation Logic

```
Login/Register -> Forum -> Post Details
```

---

## REST API Endpoints

### Authentication
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in user and establish session |
| `POST` | `/api/auth/logout` | Log out user session |

### Forum & Posts
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/posts` | Fetch forum post feed |
| `POST` | `/api/posts` | Create a new post |
| `GET` | `/api/posts/{id}` | Get detailed information for a specific post |
| `GET` | `/api/posts/{id}/comments` | List all comments for a specific post |
| `POST` | `/api/posts/{id}/comments` | Create a new comment on a post |

### Users & Messaging
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Retrieve all registered users |
| `GET` | `/api/users/online` | Retrieve currently online users |
| `GET` | `/api/messages/{userId}?offset=0&limit=10` | Fetch paginated chat history with a user |

---

## WebSocket Events

| Direction | Event Name | Description |
| :--- | :--- | :--- |
| **Client → Server** | `private_message` | Send a private chat message to a specific user |
| **Server → Client** | `private_message` | Receive incoming private chat message |
| **Server → Client** | `online_users` | Initial broadcast of online users list |
| **Server → Client** | `user_connected` | Notification when a user comes online |
| **Server → Client** | `user_disconnected` | Notification when a user goes offline |
| **Client → Server** | `load_messages` | Request additional historical messages |

---

## Example Payloads

### 1. Login Request
```json
{
  "login": "john",
  "password": "secret"
}
```

### 2. Login Response
```json
{
  "success": true,
  "user": {
    "id": 1,
    "nickname": "john"
  }
}
```

### 3. Create Post Request
```json
{
  "title": "Hello",
  "content": "My first post",
  "category": "General"
}
```

### 4. Private Message Event
```json
{
  "type": "private_message",
  "receiver": 5,
  "content": "Hello!"
}
```

---

## Frontend Behavior Requirements

- **Authentication Navigation:** On successful login, navigate directly to the main Forum view.
- **Post Details:** Clicking on a post loads its details and associated comments.
- **Online Presence:** The online users list must remain visible across main views.
- **Private Chat:** Clicking a user in the user list opens a direct private chat modal or window.
- **Chat Pagination:** When scrolling to the top of the chat panel, fetch 10 older messages using pagination parameters (`offset`/`limit` or `load_messages`).
- **Real-time Messaging:** All incoming and outgoing real-time messages and status updates must pass through the WebSocket connection.

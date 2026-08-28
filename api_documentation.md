# Real-Time Forum API Specifications

This document defines all backend API endpoints, their expected request data, headers, cookies, and response payloads.

---

## Standard Error Response Format
All endpoint errors return JSON with the corresponding HTTP status code:

```json
{
  "error": "Detailed error message here"
}
```

---

## 1. Check Authentication (`/api/me`)
Retrieves the currently authenticated user's profile based on the session cookie.

* **URL:** `/api/me`
* **Method:** `GET`
* **Headers:** None (uses browser cookies)
* **Cookie Required:** `session=<session_token>`

### Success Response (`200 OK`)
```json
{
  "id": 1,
  "nickname": "johndoe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "age": 25,
  "gender": "male"
}
```

### Error Responses
* **`401 Unauthorized`:** `{ "error": "Not logged in" }` or `{ "error": "Invalid or expired session" }`

---

## 2. Register User (`/api/register`)
Creates a new user account in the forum.

* **URL:** `/api/register`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "nickname": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 25,
  "gender": "male"
}
```

### Validation Rules
* `nickname`, `email`, `password`, `firstName`, `lastName`, `gender` cannot be empty.
* `email`: Must be a valid email format.
* `password`: Length must be between 8 and 72 characters.
* `age`: Must be an integer between 13 and 120.

### Success Response (`201 Created`)
```json
{
  "message": "User Created",
  "user_id": 1
}
```

### Error Responses
* **`400 Bad Request`:** `{ "error": "All fields are required!" }`
* **`400 Bad Request`:** `{ "error": "Invalid Email Address!" }`
* **`400 Bad Request`:** `{ "error": "Password must be between 8 and 72 characters!" }`
* **`400 Bad Request`:** `{ "error": "Age must be between 13 and 120!" }`
* **`400 Bad Request`:** `{ "error": "Nickname or Email already registered!" }`

---

## 3. Login (`/api/login`)
Authenticates a user and establishes a session.

* **URL:** `/api/login`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

### Request Body
```json
{
  "identifier": "johndoe", // Can be Nickname or Email
  "password": "securepassword123"
}
```

### Success Response (`200 OK`)
Sets `Set-Cookie: session=<token>; HttpOnly; Path=/; Max-Age=86400`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "age": 25,
    "gender": "male",
    "createdAt": "2026-08-28T00:00:00Z"
  }
}
```

### Error Responses
* **`400 Bad Request`:** `{ "error": "Identifier and Password are required!" }`
* **`401 Unauthorized`:** `{ "error": "Invalid Credentials!" }`

---

## 4. Logout (`/api/logout`)
Terminates the active session and clears the cookie.

* **URL:** `/api/logout`
* **Method:** `POST` or `GET`
* **Cookie Required:** `session=<token>`

### Success Response (`200 OK`)
Clears `session` cookie (`Max-Age=-1`).

```json
{
  "message": "Logged out successfully!"
}
```

---

## 5. Real-Time WebSocket (`/api/ws`)
Establishes a real-time WebSocket connection for live messages and user online status.

* **URL:** `ws://localhost:8080/api/ws`
* **Requires Authentication:** `session` cookie must be valid.

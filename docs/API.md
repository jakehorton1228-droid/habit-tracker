# API Documentation

Base URL: `http://localhost:8000/api`

All endpoints except registration and login require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Authentication

### Register

Create a new user account.

```
POST /auth/register/
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

---

### Login

Obtain JWT access and refresh tokens.

```
POST /auth/login/
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### Refresh Token

Get a new access token using a refresh token.

```
POST /auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

### Get Current User

Get the authenticated user's information.

```
GET /auth/user/
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com"
}
```

---

## Habits

### List Habits

Get all habits for the authenticated user.

```
GET /habits/
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Morning Run",
    "frequency": "daily",
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-15T08:00:00Z"
  },
  {
    "id": 2,
    "name": "Read 30 minutes",
    "frequency": "daily",
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-15T08:00:00Z"
  }
]
```

---

### Create Habit

Create a new habit.

```
POST /habits/
```

**Request Body:**
```json
{
  "name": "Meditate",
  "frequency": "daily"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "name": "Meditate",
  "frequency": "daily",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### Get Habit

Get a specific habit by ID.

```
GET /habits/{id}/
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Morning Run",
  "frequency": "daily",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-01-15T08:00:00Z"
}
```

---

### Update Habit

Update an existing habit.

```
PUT /habits/{id}/
```

**Request Body:**
```json
{
  "name": "Morning Jog",
  "frequency": "daily"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Morning Jog",
  "frequency": "daily",
  "created_at": "2025-01-15T08:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

### Delete Habit

Delete a habit.

```
DELETE /habits/{id}/
```

**Response:** `204 No Content`

---

## Habit Logs

### List Habit Logs

Get all completion logs for the user's habits.

```
GET /habits/logs/
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "habit": 1,
    "date": "2025-01-15",
    "note": "Ran 5km today!",
    "created_at": "2025-01-15T07:30:00Z"
  },
  {
    "id": 2,
    "habit": 1,
    "date": "2025-01-14",
    "note": null,
    "created_at": "2025-01-14T07:45:00Z"
  }
]
```

---

### Create Habit Log

Log a habit completion.

```
POST /habits/logs/
```

**Request Body:**
```json
{
  "habit": 1,
  "date": "2025-01-15",
  "note": "Felt great today!"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "habit": 1,
  "date": "2025-01-15",
  "note": "Felt great today!",
  "created_at": "2025-01-15T08:00:00Z"
}
```

---

## Goals

### List Goals

Get all goals for the authenticated user.

```
GET /goals/
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Save $1000",
    "description": "Emergency fund savings",
    "unit": "dollars",
    "target_value": "1000.00",
    "current_value": "350.00",
    "start_date": "2025-01-01",
    "end_date": "2025-06-30",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T00:00:00Z"
  }
]
```

---

### Create Goal

Create a new goal.

```
POST /goals/
```

**Request Body:**
```json
{
  "name": "Read 12 Books",
  "description": "One book per month",
  "unit": "books",
  "target_value": "12.00",
  "current_value": "0.00",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "name": "Read 12 Books",
  "description": "One book per month",
  "unit": "books",
  "target_value": "12.00",
  "current_value": "0.00",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

---

### Get Goal

Get a specific goal by ID.

```
GET /goals/{id}/
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Save $1000",
  "description": "Emergency fund savings",
  "unit": "dollars",
  "target_value": "1000.00",
  "current_value": "350.00",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

---

### Update Goal

Update an existing goal.

```
PUT /goals/{id}/
```

**Request Body:**
```json
{
  "name": "Save $1500",
  "description": "Increased emergency fund target",
  "unit": "dollars",
  "target_value": "1500.00",
  "current_value": "350.00",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Save $1500",
  "description": "Increased emergency fund target",
  "unit": "dollars",
  "target_value": "1500.00",
  "current_value": "350.00",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

### Delete Goal

Delete a goal.

```
DELETE /goals/{id}/
```

**Response:** `204 No Content`

---

## Goal Progress

### List Progress Entries

Get all progress entries for the user's goals.

```
GET /goals/progress/
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "goal": 1,
    "date": "2025-01-15",
    "amount": "50.00",
    "note": "Weekly savings deposit",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

### Create Progress Entry

Log progress toward a goal.

```
POST /goals/progress/
```

**Request Body:**
```json
{
  "goal": 1,
  "amount": "100.00",
  "note": "Bonus from work"
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "goal": 1,
  "date": "2025-01-15",
  "amount": "100.00",
  "note": "Bonus from work",
  "created_at": "2025-01-15T14:00:00Z"
}
```

---

## Error Responses

### 400 Bad Request

Invalid request data.

```json
{
  "field_name": ["Error message describing the issue."]
}
```

### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden

User doesn't have permission to access this resource.

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found

Resource doesn't exist.

```json
{
  "detail": "Not found."
}
```

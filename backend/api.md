# ShubhaMAI — API Reference

Base URL: `http://localhost:5000/api`  
All request/response bodies are **JSON** unless noted.  
Protected routes require: `Authorization: Bearer <jwt_token>`

---

## Table of Contents

- [Health Check](#health-check)
- [Auth](#auth)
  - [POST /auth/check-identifier](#post-authcheck-identifier)
  - [POST /auth/register](#post-authregister)
  - [POST /auth/verify-signup-otp](#post-authverify-signup-otp)
  - [POST /auth/login](#post-authlogin)
  - [POST /auth/forgot-password](#post-authforgot-password)
  - [POST /auth/verify-reset-otp](#post-authverify-reset-otp)
  - [POST /auth/reset-password](#post-authreset-password)
  - [POST /auth/resend-otp](#post-authresend-otp)
- [Events](#events)
  - [GET /events](#get-events)
  - [GET /events/today](#get-eventstoday)
  - [GET /events/search](#get-eventssearch)
  - [GET /events/:id](#get-eventsid)
  - [POST /events](#post-events)
  - [POST /events/bulk](#post-eventsbulk)
- [Poster](#poster)
  - [POST /poster/generate-event](#post-postergenerate-event)
  - [POST /poster/generate-custom](#post-postergenerate-custom)
  - [POST /poster/save](#post-postersave)
  - [DELETE /poster/:cloudinaryId](#delete-postercloudinaryid)
- [User](#user)
  - [GET /user/profile](#get-userprofile)
  - [PUT /user/profile](#put-userprofile)
  - [GET /user/business-profile](#get-userbusiness-profile)
  - [PUT /user/business-profile](#put-userbusiness-profile)
  - [GET /user/important-dates](#get-userimportant-dates)
  - [POST /user/important-dates](#post-userimportant-dates)
  - [POST /user/important-dates/bulk](#post-userimportant-datesbulk)
  - [PUT /user/important-dates/:dateId](#put-userimportant-datesdateid)
  - [DELETE /user/important-dates/:dateId](#delete-userimportant-datesdateid)
  - [GET /user/saved-posters](#get-usersaved-posters)
  - [DELETE /user/account](#delete-useraccount)
- [Error Responses](#error-responses)

---

## Health Check

### GET /health

Check that the server is running.

**Auth:** None

**Response `200`**

```json
{
  "success": true,
  "message": "ShubhaMAI backend is running 🚀",
  "timestamp": "2024-12-01T10:00:00.000Z"
}
```

---

## Auth

> All auth routes are rate-limited to **10 requests / 10 minutes per IP**.

---

### POST /auth/check-identifier

**SignUp Step 1** — Check whether an email or phone number is already registered before creating an account.

**Auth:** None

**Request Body**

```json
{
  "email": "user@example.com",
  "phone": "9876543210"
}
```

Either `email` or `phone` (or both) must be provided.

**Response `200` — Available**

```json
{
  "success": true,
  "message": "Identifier available. Proceed to next step."
}
```

**Response `409` — Already Exists**

```json
{
  "success": false,
  "message": "An account with this email or phone already exists."
}
```

---

### POST /auth/register

**SignUp Step 3** — Create the user account and send OTP to the provided email.  
Unverified accounts are automatically deleted after 10 minutes by the cron job.

**Auth:** None

**Request Body**

```json
{
  "fullName": "Ravi Kumar",
  "businessName": "Ravi Enterprises",
  "email": "ravi@example.com",
  "phone": "9876543210",
  "password": "securePassword123"
}
```

| Field          | Required | Notes                    |
| -------------- | :------: | ------------------------ |
| `fullName`     |    ✅    |                          |
| `email`        |    ✅    |                          |
| `password`     |    ✅    | Minimum 6 characters     |
| `businessName` |    ❌    | Defaults to empty string |
| `phone`        |    ❌    | Defaults to empty string |

**Response `201`**

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify within 10 minutes.",
  "email": "ravi@example.com"
}
```

---

### POST /auth/verify-signup-otp

**SignUp Step 4** — Verify the 6-digit OTP sent to email. On success, returns a JWT and user is marked verified.

**Auth:** None

**Request Body**

```json
{
  "email": "ravi@example.com",
  "otp": "847291"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Account verified successfully! Welcome to ShubhaMAI 🎉",
  "token": "<jwt_token>",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "businessName": "Ravi Enterprises",
    "businessAddress": ""
  }
}
```

**Error cases:** `400` invalid OTP, `400` expired OTP, `400` already verified, `404` user not found.

---

### POST /auth/login

Login with email/phone and password. Returns a JWT valid for 7 days.

**Auth:** None

**Request Body**

```json
{
  "identifier": "ravi@example.com",
  "password": "securePassword123"
}
```

`identifier` accepts email address or phone number.

**Response `200`**

```json
{
  "success": true,
  "message": "Login successful!",
  "token": "<jwt_token>",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "businessName": "Ravi Enterprises",
    "businessAddress": ""
  }
}
```

**Error cases:** `401` invalid credentials, `403` account not verified.

---

### POST /auth/forgot-password

**Reset Step 1** — Check if user exists and send a password-reset OTP to their email.

**Auth:** None

**Request Body**

```json
{
  "identifier": "ravi@example.com"
}
```

`identifier` accepts email address or phone number.

**Response `200`**

```json
{
  "success": true,
  "message": "OTP sent to your registered email.",
  "email": "r***@example.com"
}
```

---

### POST /auth/verify-reset-otp

**Reset Step 2** — Verify the reset OTP. Returns a short-lived reset token.

**Auth:** None

**Request Body**

```json
{
  "email": "ravi@example.com",
  "otp": "382910"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "OTP verified. You may now reset your password.",
  "resetToken": "<short_lived_token>"
}
```

---

### POST /auth/reset-password

**Reset Step 3** — Set a new password using the reset token from the previous step.

**Auth:** None

**Request Body**

```json
{
  "email": "ravi@example.com",
  "resetToken": "<short_lived_token>",
  "newPassword": "newSecurePass456"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

---

### POST /auth/resend-otp

Resend OTP for signup or password reset flow.

**Auth:** None

**Request Body**

```json
{
  "email": "ravi@example.com",
  "type": "signup"
}
```

`type` is `"signup"` or `"reset"`.

**Response `200`**

```json
{
  "success": true,
  "message": "OTP resent successfully."
}
```

---

## Events

> All event routes require `Authorization: Bearer <token>`.

---

### GET /events

Fetch events for a given region and month. Combines local DB events with live Calendarific data (when API key is configured).

**Auth:** ✅ Required

**Query Parameters**

| Param    | Type   | Default       | Description                                        |
| -------- | ------ | ------------- | -------------------------------------------------- |
| `region` | string | `all`         | `all` · `telangana` · `national` · `international` |
| `month`  | number | current month | 1–12                                               |
| `year`   | number | current year  | e.g. `2024`                                        |

**Example:** `GET /api/events?region=telangana&month=10&year=2024`

**Response `200` — region=all**

```json
{
  "success": true,
  "total": 42,
  "region": "all",
  "month": 10,
  "year": 2024,
  "events": {
    "international": [
      /* event objects */
    ],
    "national": [
      /* event objects */
    ],
    "telangana": [
      /* event objects */
    ]
  }
}
```

**Response `200` — specific region**

```json
{
  "success": true,
  "total": 5,
  "region": "telangana",
  "month": 10,
  "year": 2024,
  "events": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Bathukamma Festival",
      "description": "A floral festival celebrated by women of Telangana.",
      "date": "10-02",
      "isAnnual": true,
      "region": "telangana",
      "category": "Festival",
      "emoji": "🌸",
      "tags": ["bathukamma", "festival", "flowers"],
      "promptHint": "Colorful stacked flower arrangement...",
      "source": "local",
      "isActive": true
    }
  ]
}
```

---

### GET /events/today

Fetch all events (across all regions) that fall on today's date.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "date": "2024-10-02",
  "events": [
    /* event objects */
  ]
}
```

---

### GET /events/search

Search events by name, description, tags, or category.

**Auth:** ✅ Required

**Query Parameters**

| Param | Required | Description    |
| ----- | :------: | -------------- |
| `q`   |    ✅    | Search keyword |

**Example:** `GET /api/events/search?q=bathukamma`

**Response `200`**

```json
{
  "success": true,
  "total": 2,
  "events": [
    /* matching event objects */
  ]
}
```

---

### GET /events/:id

Fetch a single event by its MongoDB ObjectId.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "event": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Bathukamma Festival",
    "description": "...",
    "date": "10-02",
    "region": "telangana",
    "category": "Festival",
    "emoji": "🌸",
    "promptHint": "...",
    "isActive": true
  }
}
```

**Response `404`** — Event not found.

---

### POST /events

Add a single event to the database. Intended for admin/seeding use.

**Auth:** None _(add auth guard in production)_

**Request Body**

```json
{
  "name": "Deccan Festival",
  "description": "Cultural festival in Hyderabad.",
  "date": "02-20",
  "isAnnual": true,
  "region": "telangana",
  "category": "Cultural",
  "emoji": "🎭",
  "tags": ["deccan", "hyderabad", "culture"],
  "promptHint": "Deccan heritage, Biryani, Golconda Fort...",
  "source": "local"
}
```

**Response `201`**

```json
{
  "success": true,
  "event": {
    /* created event object */
  }
}
```

---

### POST /events/bulk

Bulk-insert multiple events. Useful for loading `telanganaEvents.json` into MongoDB.

**Auth:** None _(add auth guard in production)_

**Request Body**

```json
{
  "events": [
    {
      /* event object 1 */
    },
    {
      /* event object 2 */
    }
  ]
}
```

**Response `201`**

```json
{
  "success": true,
  "inserted": 20
}
```

---

## Poster

> All poster routes require `Authorization: Bearer <token>`.  
> Image generation can take **20–60 seconds** — implement a loading state on the frontend.

---

### POST /poster/generate-event

Generate an AI poster for a calendar event.

**Workflow:**

1. Fetch event from DB (if `eventId` provided)
2. Send event details to Gemini Flash → receive image prompt
3. Send prompt to Gemini Imagen → receive base64 PNG
4. Return base64 image to client

**Auth:** ✅ Required

**Request Body**

```json
{
  "eventId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "eventName": "Bathukamma Festival",
  "eventDate": "10-02",
  "region": "telangana",
  "description": "A floral festival celebrated by women of Telangana.",
  "promptHint": "Colorful stacked flower arrangement..."
}
```

Either `eventId` or `eventName` is required. When `eventId` is provided, all other fields are auto-resolved from DB.

**Response `200`**

```json
{
  "success": true,
  "message": "Poster generated successfully!",
  "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
  "prompt": "Ultra-realistic digital art of Bathukamma festival...",
  "eventName": "Bathukamma Festival"
}
```

**Response `500`** — Gemini API failure or timeout.

---

### POST /poster/generate-custom

Generate a custom AI poster for personal occasions (birthdays, anniversaries, etc.).

**Auth:** ✅ Required

**Request Body**

```json
{
  "personName": "Srilatha",
  "description": "Happy Birthday",
  "businessName": "Ravi Enterprises",
  "wisherName": "Ravi Kumar",
  "referenceImageBase64": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

| Field                  | Required | Notes                                                |
| ---------------------- | :------: | ---------------------------------------------------- |
| `personName`           |    ✅    | Name of the person being celebrated                  |
| `description`          |    ✅    | Occasion text, e.g. "Happy Birthday"                 |
| `businessName`         |    ❌    | Defaults to user's `businessName` or "ShubhaMAI"     |
| `wisherName`           |    ❌    | Defaults to user's `fullName`                        |
| `referenceImageBase64` |    ❌    | Person's photo as base64 data URI for face reference |

**Response `200`**

```json
{
  "success": true,
  "message": "Custom poster generated successfully!",
  "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
  "prompt": "Celebratory birthday poster with Srilatha...",
  "eventName": "Happy Birthday"
}
```

---

### POST /poster/save

Upload a generated poster to Cloudinary and save the reference in the user's `savedPosters` array.  
Call this when the user taps **Share** or **Save** after viewing a poster.

**Auth:** ✅ Required

**Request Body**

```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
  "eventName": "Bathukamma Festival"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Poster saved successfully!",
  "cloudinaryId": "shubhamai/posters/64f1a2b3.../1701425600000",
  "imageUrl": "https://res.cloudinary.com/your_cloud/image/upload/shubhamai/posters/..."
}
```

---

### DELETE /poster/:cloudinaryId

Delete a saved poster from both Cloudinary storage and the user's `savedPosters` list.

**Auth:** ✅ Required

**URL Parameter:** `cloudinaryId` — URL-encoded Cloudinary public ID.

**Example:** `DELETE /api/poster/shubhamai%2Fposters%2F64f1a2b3%2F1701425600000`

**Response `200`**

```json
{
  "success": true,
  "message": "Poster deleted successfully."
}
```

---

## User

> All user routes require `Authorization: Bearer <token>`.

---

### GET /user/profile

Fetch the authenticated user's full profile.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "fullName": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "9876543210",
    "businessName": "Ravi Enterprises",
    "businessAddress": "Hyderabad, Telangana",
    "isVerified": true,
    "importantDates": [
      /* date objects */
    ],
    "savedPosters": [
      /* poster objects */
    ],
    "createdAt": "2024-12-01T10:00:00.000Z",
    "updatedAt": "2024-12-01T12:00:00.000Z"
  }
}
```

---

### PUT /user/profile

Update the user's full name or phone number.

**Auth:** ✅ Required

**Request Body** _(all fields optional)_

```json
{
  "fullName": "Ravi Kumar Reddy",
  "phone": "9123456789"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Profile updated.",
  "user": {
    /* updated user object */
  }
}
```

---

### GET /user/business-profile

Fetch only the business-related fields.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "businessProfile": {
    "businessName": "Ravi Enterprises",
    "phone": "9876543210",
    "businessAddress": "Hyderabad, Telangana"
  }
}
```

---

### PUT /user/business-profile

Update business name, phone, and/or address.

**Auth:** ✅ Required

**Request Body** _(all fields optional)_

```json
{
  "businessName": "Ravi & Co.",
  "phone": "9000011112",
  "businessAddress": "Banjara Hills, Hyderabad - 500034"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Business profile updated.",
  "businessProfile": {
    "businessName": "Ravi & Co.",
    "phone": "9000011112",
    "businessAddress": "Banjara Hills, Hyderabad - 500034"
  }
}
```

---

### GET /user/important-dates

Fetch all important dates saved by the user.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "importantDates": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
      "title": "Mom's Birthday",
      "date": "08-15",
      "type": "annual",
      "description": "Buy cake and flowers",
      "category": "Family"
    }
  ]
}
```

---

### POST /user/important-dates

Add a single important date to the user's list.

**Auth:** ✅ Required

**Request Body**

```json
{
  "title": "Wedding Anniversary",
  "date": "11-22",
  "type": "annual",
  "description": "Book restaurant reservation",
  "category": "Personal"
}
```

| Field         | Required | Notes                                              |
| ------------- | :------: | -------------------------------------------------- |
| `title`       |    ✅    |                                                    |
| `date`        |    ✅    | `"MM-DD"` for annual · `"YYYY-MM-DD"` for one-time |
| `type`        |    ❌    | `"annual"` (default) or `"one-time"`               |
| `description` |    ❌    |                                                    |
| `category`    |    ❌    | Defaults to `"Personal"`                           |

**Response `201`**

```json
{
  "success": true,
  "message": "Important date added.",
  "importantDates": [
    /* full updated array */
  ]
}
```

---

### POST /user/important-dates/bulk

Replace all important dates with a new array (used by `ImportantDatesScreen` save action).

**Auth:** ✅ Required

**Request Body**

```json
{
  "importantDates": [
    { "title": "Mom's Birthday", "date": "08-15", "type": "annual" },
    { "title": "Company Founding", "date": "2019-03-10", "type": "one-time" }
  ]
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Important dates saved.",
  "importantDates": [
    /* full updated array */
  ]
}
```

---

### PUT /user/important-dates/:dateId

Update a specific important date by its `_id`.

**Auth:** ✅ Required

**URL Parameter:** `dateId` — MongoDB ObjectId of the date entry.

**Request Body** _(send all fields you want to update)_

```json
{
  "title": "Parents' Anniversary",
  "date": "11-22",
  "type": "annual",
  "description": "Family dinner",
  "category": "Family"
}
```

**Response `200`**

```json
{
  "success": true,
  "message": "Important date updated.",
  "importantDates": [
    /* full updated array */
  ]
}
```

---

### DELETE /user/important-dates/:dateId

Remove a specific important date by its `_id`.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "message": "Important date deleted.",
  "importantDates": [
    /* remaining dates */
  ]
}
```

---

### GET /user/saved-posters

Fetch all posters saved by the user, newest first.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "savedPosters": [
    {
      "cloudinaryId": "shubhamai/posters/64f1a2b3.../1701425600000",
      "imageUrl": "https://res.cloudinary.com/your_cloud/image/upload/...",
      "eventName": "Bathukamma Festival",
      "savedAt": "2024-12-01T10:30:00.000Z"
    }
  ]
}
```

---

### DELETE /user/account

Permanently delete the authenticated user's account and all associated data.

**Auth:** ✅ Required

**Response `200`**

```json
{
  "success": true,
  "message": "Account deleted successfully."
}
```

---

## Error Responses

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error description."
}
```

| Status Code | Meaning                                            |
| ----------- | -------------------------------------------------- |
| `400`       | Bad request — missing or invalid fields            |
| `401`       | Unauthorized — invalid or missing JWT              |
| `403`       | Forbidden — account not verified                   |
| `404`       | Not found — resource doesn't exist                 |
| `409`       | Conflict — duplicate resource (e.g., email exists) |
| `429`       | Too many requests — rate limit exceeded            |
| `500`       | Internal server error — check server logs          |

---

_Last updated: December 2024 — ShubhaMAI Backend v1.0_

# 🔌 API Reference

REST API for the AI-Powered Learning Assistant. All responses are JSON.

- **Base URL (local):** `http://localhost:8000`
- **Base URL (deployed):** see `frontend/src/utils/apiPaths.js` → `BASE_URL`
- **Auth:** protected routes require `Authorization: Bearer <JWT>`.

## 📦 Response conventions

Most successful responses look like:

```json
{ "success": true, "data": { }, "message": "..." }
```

Errors look like:

```json
{ "success": false, "error": "Human-readable message", "statusCode": 400 }
```

A `404` for unknown routes returns `{ "success": false, "error": "Route not found", "statusCode": 404 }`.

---

## 🔐 Auth — `/api/auth`

### POST `/api/auth/register` — _public_
```json
// request
{ "username": "jane", "email": "jane@example.com", "password": "secret123" }
```
```json
// 201
{ "success": true, "data": { "user": { "id": "...", "username": "jane", "email": "jane@example.com", "profileImage": null, "createdAt": "..." }, "token": "<jwt>" }, "message": "User registered successfully" }
```

### POST `/api/auth/login` — _public_
```json
// request
{ "email": "jane@example.com", "password": "secret123" }
```
```json
// 200
{ "success": true, "user": { "id": "...", "username": "jane", "email": "jane@example.com", "profileImage": null }, "token": "<jwt>", "message": "Login successful" }
```

### GET `/api/auth/profile` — _private_
Returns the current user's profile in `data`.

### PUT `/api/auth/profile` — _private_
```json
{ "username": "jane2", "email": "new@example.com", "profileImage": "https://..." }
```

### PUT `/api/auth/change-password` — _private_
```json
{ "currentPassword": "secret123", "newPassword": "evenbetter456" }
```

---

## 📄 Documents — `/api/documents` _(all private)_

### POST `/api/documents/upload`
`multipart/form-data` with fields `file` (PDF) and `title`.
```bash
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Authorization: Bearer <jwt>" \
  -F "file=@notes.pdf" \
  -F "title=React Concepts"
```
```json
// 201 — processing continues in the background
{ "success": true, "data": { "_id": "...", "title": "React Concepts", "status": "processing", "...": "..." }, "message": "Document uploaded successfully. Processing in progress..." }
```

### GET `/api/documents`
List documents (heavy fields omitted) with `flashcardCount` and `quizCount`.

### GET `/api/documents/:id`
Single document, including `chunks`, plus `flashcardCount` / `quizCount`.

### DELETE `/api/documents/:id`
Deletes the document, its flashcards, quizzes, and stored file.

---

## 🤖 AI — `/api/ai` _(all private)_

### POST `/api/ai/generate-summary`
```json
// request
{ "documentId": "<id>" }
```
```json
// 200
{ "success": true, "data": { "documentId": "<id>", "title": "React Concepts", "summary": "..." }, "message": "Summary generated successfully" }
```

### POST `/api/ai/generate-flashcards`
```json
// request
{ "documentId": "<id>", "count": 10 }
```
Creates and returns a flashcard set in `data`.

### POST `/api/ai/generate-quiz`
```json
// request
{ "documentId": "<id>", "numQuestions": 5, "title": "Optional title" }
```
Creates and returns a quiz in `data`.

### POST `/api/ai/explain-concept`
```json
// request
{ "documentId": "<id>", "concept": "React Hooks" }
```
```json
// 200
{ "success": true, "data": { "concept": "React Hooks", "explanation": "...", "relevantChunks": [0, 3, 5] }, "message": "Explanation generated successfully" }
```

### POST `/api/ai/chat`
```json
// request
{ "documentId": "<id>", "question": "What is the virtual DOM?" }
```
```json
// 200
{ "success": true, "data": { "question": "...", "answer": "...", "relevantChunks": [1, 2], "chatHistoryId": "<id>" }, "message": "Response generated successfully" }
```

### GET `/api/ai/chat-history/:documentId`
Returns the `messages` array for that document (empty array if none).

### POST `/api/ai/generate-study-plan` 🆕
Build a day-by-day plan from a **document** or a free-text **topic**.
```json
// request (document-based)
{ "documentId": "<id>", "days": 7, "dailyMinutes": 60, "goal": "Prepare for an interview" }
```
```json
// request (topic-based)
{ "topic": "Learn React fundamentals", "days": 5, "dailyMinutes": 45 }
```
```json
// 200
{
  "success": true,
  "data": {
    "documentId": "<id-or-null>",
    "source": "React Concepts",
    "days": 7,
    "plan": {
      "title": "7-Day React Study Plan",
      "overview": "A focused plan covering fundamentals to advanced topics.",
      "days": [
        {
          "day": 1,
          "title": "JSX & Components",
          "focus": "Understand JSX and functional components",
          "tasks": ["Read the JSX section", "Build a Hello World component"],
          "estimatedMinutes": 60
        }
      ]
    }
  },
  "message": "Study plan generated successfully"
}
```
**Rules:** either `documentId` or `topic` is required. `days` is clamped to **1–30**.

---

## 🧠 Agent — `/api/agent` _(private)_ 🆕

### POST `/api/agent/ask`
Ask the Study Assistant Agent. It decides which tools to use and may chain several.
```json
// request
{ "documentId": "<id>", "question": "Summarize this and make 5 flashcards on the key topics" }
```
```json
// 200
{
  "success": true,
  "data": {
    "documentId": "<id>",
    "question": "Summarize this and make 5 flashcards on the key topics",
    "answer": "Here is a summary... and I created 5 flashcards for you.",
    "steps": [
      { "tool": "summarize_document", "args": {} },
      { "tool": "generate_flashcards", "args": { "count": 5 } }
    ],
    "flashcards": [
      { "question": "What is JSX?", "answer": "A syntax extension for JavaScript.", "difficulty": "easy" }
    ]
  },
  "message": "Agent response generated successfully"
}
```
**Notes:**
- `steps` reflects the exact tools the agent invoked, in order.
- `flashcards` is only populated when the agent calls `generate_flashcards`.
- Available tools: `search_document`, `summarize_document`, `generate_flashcards`.

---

## 📇 Flashcards — `/api/flashcards` _(all private)_

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/flashcards` | All flashcard sets for the user |
| GET | `/api/flashcards/:documentId` | Sets for one document |
| POST | `/api/flashcards/:cardId/review` | Record a review of a card |
| PUT | `/api/flashcards/:cardId/star` | Toggle star on a card |
| DELETE | `/api/flashcards/:id` | Delete a flashcard set |

---

## 📝 Quizzes — `/api/quizzes` _(all private)_

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/quizzes/:documentId` | Quizzes for one document |
| GET | `/api/quizzes/quiz/:id` | Get a single quiz |
| POST | `/api/quizzes/:id/submit` | Submit answers for grading |
| GET | `/api/quizzes/:id/results` | Get graded results |
| DELETE | `/api/quizzes/:id` | Delete a quiz |

---

## 📊 Progress — `/api/progress` _(private)_

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/progress/dashboard` | Aggregated learning stats |

---

## 🔑 Status codes used

| Code | Meaning |
| --- | --- |
| 200 | OK |
| 201 | Created (register, upload, flashcards, quiz) |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid/expired token, bad credentials) |
| 404 | Not found (document/route) |
| 500 | Server error |

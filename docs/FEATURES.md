# ✨ Features

This document lists every user-facing feature in the AI-Powered Learning Assistant, grouped by area. Each entry notes the key backend route(s) and the frontend surface where it appears.

---

## 🔐 Authentication & Account

| Feature | Description | Backend | Frontend |
| --- | --- | --- | --- |
| Register | Create an account (username, email, password). Returns a JWT. | `POST /api/auth/register` | Register page |
| Login | Authenticate and receive a JWT. | `POST /api/auth/login` | Login page |
| View profile | Fetch the logged-in user's profile. | `GET /api/auth/profile` | Profile page |
| Update profile | Change username, email, or profile image. | `PUT /api/auth/profile` | Profile page |
| Change password | Update password after verifying the current one. | `PUT /api/auth/change-password` | Profile page |

- Passwords are hashed with **bcrypt** before storage.
- Protected routes require an `Authorization: Bearer <token>` header.

---

## 📄 Document Management

| Feature | Description | Backend |
| --- | --- | --- |
| Upload PDF | Upload a PDF (max ~10 MB). Text is extracted and chunked in the background. | `POST /api/documents/upload` |
| List documents | List the user's documents with flashcard/quiz counts (heavy fields excluded). | `GET /api/documents` |
| View document | Get one document, its counts, and refresh `lastAccessed`. | `GET /api/documents/:id` |
| Delete document | Remove a document plus its flashcards, quizzes, and the stored file. | `DELETE /api/documents/:id` |

**Processing pipeline:** on upload the document status is `processing`. A background task extracts text (`pdf-parse`), splits it into overlapping chunks, and sets status to `ready` (or `failed` on error). AI features only work on `ready` documents.

---

## 🤖 AI Features (single-shot)

All AI features are grounded in the uploaded document's extracted text and powered by **Google Gemini**.

| Feature | Description | Backend |
| --- | --- | --- |
| Generate summary | Concise, structured summary of the whole document. | `POST /api/ai/generate-summary` |
| Generate flashcards | Q/A flashcards with difficulty levels; saved to DB. | `POST /api/ai/generate-flashcards` |
| Generate quiz | Multiple-choice questions (4 options + explanation); saved as a quiz. | `POST /api/ai/generate-quiz` |
| Explain concept | Deep explanation of a specific concept, grounded in relevant chunks. | `POST /api/ai/explain-concept` |
| Chat with document | RAG chat — finds relevant chunks and answers; history is stored. | `POST /api/ai/chat` |
| Chat history | Retrieve prior chat messages for a document. | `GET /api/ai/chat-history/:documentId` |
| **Study Plan Generator** 🆕 | Builds a day-by-day study schedule (configurable days, minutes/day, goal) from a document or a free-text topic. Returns structured JSON. | `POST /api/ai/generate-study-plan` |

### Study Plan Generator (new)
- Inputs: `documentId` **or** `topic`, plus `days`, `dailyMinutes`, and an optional `goal`.
- Output: a plan with a title, overview, and an array of days — each day has a title, focus, task list, and estimated minutes.
- Surfaced in the **"Study Plan"** tab on the Document Detail page.

---

## 🧠 Agentic AI (new)

| Feature | Description | Backend |
| --- | --- | --- |
| **Study Assistant Agent** 🆕 | A tool-using agent. The user asks a free-form question; the agent decides which tools to call and loops until done. | `POST /api/agent/ask` |

**How it differs from the single-shot features:** instead of one prompt → one answer, the agent uses **Gemini function calling** to pick from a set of tools and chain them together.

**Tools available to the agent:**
- `search_document` — keyword-ranked chunk search over the document.
- `summarize_document` — reuses the summary generator.
- `generate_flashcards` — reuses the flashcard generator.

**Response includes:**
- `answer` — the final grounded answer.
- `steps` — the ordered list of tools the agent used (shown in the UI as an "agent steps" trace).
- `flashcards` — populated only if the agent chose to generate flashcards.

Surfaced in the **"Agent"** tab on the Document Detail page.

---

## 📇 Flashcards

| Feature | Description | Backend |
| --- | --- | --- |
| List all sets | All flashcard sets for the user. | `GET /api/flashcards` |
| Get sets for a document | Flashcard sets tied to one document. | `GET /api/flashcards/:documentId` |
| Review a card | Record a review (updates `reviewCount` / `lastReviewed`). | `POST /api/flashcards/:cardId/review` |
| Star a card | Toggle a card's starred state. | `PUT /api/flashcards/:cardId/star` |
| Delete a set | Remove a flashcard set. | `DELETE /api/flashcards/:id` |

---

## 📝 Quizzes

| Feature | Description | Backend |
| --- | --- | --- |
| Get quizzes for a document | All quizzes for one document. | `GET /api/quizzes/:documentId` |
| Get a quiz | Fetch a single quiz by id. | `GET /api/quizzes/quiz/:id` |
| Submit a quiz | Submit answers; scoring is recorded. | `POST /api/quizzes/:id/submit` |
| Quiz results | Retrieve graded results. | `GET /api/quizzes/:id/results` |
| Delete a quiz | Remove a quiz. | `DELETE /api/quizzes/:id` |

---

## 📊 Progress

| Feature | Description | Backend |
| --- | --- | --- |
| Dashboard | Aggregated learning stats for the user. | `GET /api/progress/dashboard` |

---

## 🧩 Feature → Document Detail tabs

The Document Detail page organizes most features into tabs:

`Content` · `Chat` · `AI Actions` · `Study Plan` 🆕 · `Agent` 🆕 · `Flashcards` · `Quizzes`

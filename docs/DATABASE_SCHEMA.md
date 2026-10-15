# 🗄️ Database Schema

The app uses **MongoDB** via **Mongoose**. There are five collections. All timestamps (`createdAt` / `updatedAt`) are added automatically by Mongoose (`{ timestamps: true }`).

> MongoDB is schemaless at the engine level; the "schema" here is enforced by Mongoose models in `backend/models/`.

---

## 🔗 Entity-Relationship (high level)

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1
     │
     │ owns (userId)
     │
     ▼ many
┌──────────────┐
│   Document   │  (one uploaded PDF + extracted text + chunks)
└──────┬───────┘
       │ 1
       │
   ┌───┴───────────────┬────────────────────┐
   ▼ many              ▼ many                ▼ 0..1 (per user+doc)
┌───────────┐   ┌──────────────┐      ┌──────────────┐
│ Flashcard │   │     Quiz     │      │ ChatHistory  │
│   (set)   │   │              │      │              │
└───────────┘   └──────────────┘      └──────────────┘
```

- A **User** owns many **Documents**, **Flashcard** sets, **Quizzes**, and **ChatHistory** records.
- A **Document** is referenced by **Flashcard** sets, **Quizzes**, and **ChatHistory**.
- Relationships are modeled with `ObjectId` references (`ref`), not embedded joins. Reads join on demand (e.g. `$lookup` in the document list aggregation).

---

## 👤 User (`users`)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `username` | String | Required, **unique**, min 3 chars, trimmed |
| `email` | String | Required, **unique**, lowercased, validated format |
| `password` | String | Required, min 6 chars, hashed with bcrypt, `select: false` |
| `profileImage` | String | Default `null` |
| `createdAt` / `updatedAt` | Date | Auto |

**Behavior:**
- `pre('save')` hook hashes the password when modified.
- `matchPassword(entered)` instance method compares a plaintext password to the hash.
- `password` is excluded from queries by default (must `.select('+password')` to include).

---

## 📄 Document (`documents`)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId → `User` | Required (owner) |
| `title` | String | Required, trimmed |
| `fileName` | String | Original uploaded file name |
| `filePath` | String | Public path, e.g. `/uploads/documents/<file>` |
| `fileSize` | Number | Bytes |
| `extractedText` | String | Full extracted PDF text (default `''`) |
| `chunks` | Array | Chunked text for RAG — see below |
| `uploadDate` | Date | Default now |
| `lastAccessed` | Date | Updated on each view |
| `status` | String enum | `processing` \| `ready` \| `failed` |
| `createdAt` / `updatedAt` | Date | Auto |

**`chunks[]` subdocument:**

| Field | Type | Notes |
| --- | --- | --- |
| `content` | String | Chunk text (required) |
| `pageNumber` | Number | Default 0 |
| `chunkIndex` | Number | Required, ordering within the document |

**Indexes:** `{ userId: 1, uploadDate: -1 }`.

> AI features only operate on documents with `status: 'ready'`.

---

## 📇 Flashcard (`flashcards`)

A single document in this collection represents a **set** of cards generated from one document.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key (the "set" id) |
| `userId` | ObjectId → `User` | Required |
| `documentId` | ObjectId → `Document` | Required |
| `cards` | Array | The individual cards — see below |
| `createdAt` / `updatedAt` | Date | Auto |

**`cards[]` subdocument:**

| Field | Type | Notes |
| --- | --- | --- |
| `question` | String | Required |
| `answer` | String | Required |
| `difficulty` | String enum | `easy` \| `medium` \| `hard` (default `medium`) |
| `lastReviewed` | Date | Default `null` |
| `reviewCount` | Number | Default 0 |
| `isStarred` | Boolean | Default `false` |

**Indexes:** `{ userId: 1, documentId: 1 }`.

---

## 📝 Quiz (`quizzes`)

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId → `User` | Required |
| `documentId` | ObjectId → `Document` | Required |
| `title` | String | Required, trimmed |
| `questions` | Array | Generated questions — see below |
| `userAnswers` | Array | Submitted answers — see below |
| `score` | Number | Default 0 |
| `totalQuestions` | Number | Required |
| `completedAt` | Date | Default `null` |
| `createdAt` / `updatedAt` | Date | Auto |

**`questions[]` subdocument:**

| Field | Type | Notes |
| --- | --- | --- |
| `question` | String | Required |
| `options` | [String] | Required, validated to **exactly 4** options |
| `correctAnswer` | String | Required (matches one option) |
| `explanation` | String | Default `''` |
| `difficulty` | String enum | `easy` \| `medium` \| `hard` (default `medium`) |

**`userAnswers[]` subdocument:**

| Field | Type | Notes |
| --- | --- | --- |
| `questionIndex` | Number | Required |
| `selectedAnswer` | String | Required |
| `isCorrect` | Boolean | Required |
| `answeredAt` | Date | Default now |

**Indexes:** `{ userId: 1, documentId: 1 }`.

---

## 💬 ChatHistory (`chathistories`)

Stores the conversation for the "Chat with document" feature. Typically one record per `(userId, documentId)` pair.

| Field | Type | Notes |
| --- | --- | --- |
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId → `User` | Required |
| `documentId` | ObjectId → `Document` | Required |
| `messages` | Array | Ordered conversation — see below |
| `createdAt` / `updatedAt` | Date | Auto |

**`messages[]` subdocument:**

| Field | Type | Notes |
| --- | --- | --- |
| `role` | String enum | `user` \| `assistant` (required) |
| `content` | String | Required |
| `timestamp` | Date | Default now |
| `relevantChunks` | [Number] | Chunk indices used to answer (default `[]`) |

**Indexes:** `{ userId: 1, documentId: 1 }`.

---

## 🧹 Cascade behavior

There are no DB-level foreign keys. Cascading is handled in application code:

- **Deleting a Document** (`DELETE /api/documents/:id`) also deletes its **Flashcards** and **Quizzes**, and removes the stored file. (ChatHistory is not auto-deleted in the current code.)

## 🆕 Note on new features

The **Study Plan Generator** and **Study Assistant Agent** are **stateless** with respect to the database — they read a document's `extractedText` / `chunks` and return results directly. No new collections or schema changes were introduced. (The agent may reuse the flashcard generator, but it returns cards in the response rather than persisting a new set.)

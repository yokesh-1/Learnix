# 🗃️ Database Design

The design rationale behind the data model: modeling decisions, relationships, indexing strategy, and query patterns. For a plain field-by-field reference, see [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md); this document focuses on **why the schema looks the way it does**.

---

## 🧩 Modeling philosophy

- **Document database (MongoDB)** chosen to fit naturally nested, variable-shape data — especially a document's `chunks[]`, a flashcard set's `cards[]`, and a quiz's `questions[]`/`userAnswers[]`.
- **Reference vs. embed:**
  - **Embed** data that is read/written together and bounded in growth → `cards`, `questions`, `userAnswers`, `chunks`, chat `messages`.
  - **Reference** independently-queried, cross-cutting entities via `ObjectId` → `userId`, `documentId`.
- **Ownership everywhere:** every non-user collection carries `userId`, enabling per-user isolation and a single indexable access path.

---

## 🔗 Relationships

```
User (1) ──< Document (M)
User (1) ──< Flashcard set (M)         Document (1) ──< Flashcard set (M)
User (1) ──< Quiz (M)                  Document (1) ──< Quiz (M)
User (1) ──< ChatHistory (M)           Document (1) ──< ChatHistory (0..1 per user+doc)
```

| From | To | Cardinality | Mechanism |
| --- | --- | --- | --- |
| User → Document | owns | 1 → M | `Document.userId` |
| User → Flashcard | owns | 1 → M | `Flashcard.userId` |
| User → Quiz | owns | 1 → M | `Quiz.userId` |
| User → ChatHistory | owns | 1 → M | `ChatHistory.userId` |
| Document → Flashcard | has sets | 1 → M | `Flashcard.documentId` |
| Document → Quiz | has quizzes | 1 → M | `Quiz.documentId` |
| Document → ChatHistory | has thread | 1 → 0..1 (per user) | `ChatHistory.documentId` |

- Relationships are **application-enforced**, not DB-enforced (MongoDB has no foreign keys).
- A **Flashcard document is a *set*** (it embeds many `cards`), not a single card — important when designing queries and the card-level endpoints (which address cards by `cardId` within a set).

---

## 📇 Indexing strategy

| Collection | Index | Purpose |
| --- | --- | --- |
| `users` | `username` unique | Enforce unique usernames; fast lookup |
| `users` | `email` unique | Enforce unique emails; login lookup |
| `documents` | `{ userId: 1, uploadDate: -1 }` | List a user's docs newest-first (matches the list query sort) |
| `flashcards` | `{ userId: 1, documentId: 1 }` | Fetch a user's sets for a document |
| `quizzes` | `{ userId: 1, documentId: 1 }` | Fetch a user's quizzes for a document |
| `chathistories` | `{ userId: 1, documentId: 1 }` | Locate the thread for a user+document |

**Design notes**
- The compound indexes lead with `userId` because **every** access path filters by owner first — ideal prefix for the index.
- `documents` pairs `userId` with `uploadDate: -1` so the common "my documents, newest first" listing is index-backed end to end.
- Uniqueness on `username`/`email` doubles as a data-integrity guard; duplicate-key errors are translated to `400` by the error handler.

---

## 🔎 Query patterns (and how the schema supports them)

### List documents with counts
`getDocuments` uses an **aggregation pipeline**:
```
$match userId → $lookup flashcards → $lookup quizzes
→ $addFields { flashcardCount, quizCount }
→ $project out { extractedText, chunks, flashcardSets, quizzes }
→ $sort { uploadDate: -1 }
```
- `$project` drops the heavy `extractedText`/`chunks` so list payloads stay small.
- `$lookup` joins counts on demand instead of denormalizing counters into `Document`.

### Single document
`getDocument` fetches the full document (including `chunks`), counts flashcards/quizzes with `countDocuments`, and refreshes `lastAccessed`.

### AI retrieval
Chat/explain/agent-search read `document.chunks` and rank them in app code (`findRelevantChunks`). Chunks are **embedded** precisely so retrieval needs a single document read — no join.

---

## 🧱 Field-level design choices

- **`password` has `select: false`** → never returned by default; must be explicitly requested for comparison. Hashing is handled by a `pre('save')` hook so controllers never see plaintext at rest.
- **`status` enum on Document** (`processing`/`ready`/`failed`) models the async pipeline as explicit state; AI reads gate on `ready`.
- **`difficulty` enums** on cards/questions constrain values at the schema layer.
- **Quiz `options` validator** enforces **exactly 4** options — invalid data is rejected before insert, surfacing as a `ValidationError` → `400`.
- **`relevantChunks` on chat messages** stores which chunk indices grounded each answer (lightweight provenance).
- **Timestamps** (`createdAt`/`updatedAt`) are enabled on all models for auditing and ordering.

---

## 🧹 Integrity & lifecycle

- **Cascade on document delete:** application code removes associated `Flashcard` and `Quiz` documents and unlinks the file.
  - ⚠️ **Known gap:** `ChatHistory` is **not** deleted in the current cascade — orphaned threads can remain. Candidate cleanup: add `ChatHistory.deleteMany({ documentId })` to `deleteDocument`.
- **Orphan prevention otherwise** relies on always setting `userId`/`documentId` on create.

---

## 🆕 Impact of new features

The **Study Plan Generator** and **Study Assistant Agent** introduce **no schema changes and no new collections**:
- Study plan reads `extractedText` (or a free-text topic) and returns JSON directly.
- The agent reads `extractedText`/`chunks`; if it generates flashcards it returns them in the response rather than persisting a new set.

This keeps the data model stable while adding capability — consistent with the layered, reuse-first design.

---

## 🔭 Evolution options

| Need | Change |
| --- | --- |
| Semantic retrieval | Add an embeddings field/collection + vector index; keep `chunks` for display |
| Persist study plans | New `StudyPlan` collection referencing `userId`/`documentId` |
| Large documents | Consider GridFS or object storage for text; paginate chunks |
| Cleaner cascades | Centralize cascade logic or use change streams/soft-deletes |

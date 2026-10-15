# 📐 API Design

The design principles, conventions, and contracts behind the REST API. For the full endpoint catalog with examples, see [API.md](./API.md); this document explains the **"why"** and the **rules** every endpoint follows.

---

## 🧭 Design principles

1. **Resource-oriented, domain-prefixed routing.** Each domain owns a prefix: `/api/auth`, `/api/documents`, `/api/ai`, `/api/agent`, `/api/flashcards`, `/api/quizzes`, `/api/progress`.
2. **Stateless.** Auth travels in a JWT per request; the server keeps no session.
3. **Consistent envelopes.** Success and error responses share a predictable shape.
4. **Ownership by default.** Every data operation is scoped to the authenticated user.
5. **Thin transport, rich logic underneath.** Routes only wire paths; controllers validate and orchestrate.
6. **Reuse the contract.** New AI features (study plan, agent) adopt the same request/response conventions rather than inventing new ones.

---

## 🔤 URL & verb conventions

| Verb | Usage | Examples |
| --- | --- | --- |
| `GET` | Read resources | `GET /api/documents`, `GET /api/ai/chat-history/:documentId` |
| `POST` | Create or trigger an action | `POST /api/documents/upload`, `POST /api/ai/generate-quiz`, `POST /api/agent/ask` |
| `PUT` | Update existing state | `PUT /api/auth/profile`, `PUT /api/flashcards/:cardId/star` |
| `DELETE` | Remove a resource | `DELETE /api/documents/:id` |

- **Action-style POSTs** are used intentionally for AI operations (`/generate-summary`, `/generate-study-plan`, `/ask`). These are RPC-flavored because they trigger computation rather than CRUD — a pragmatic choice for an AI product.
- Path params identify resources (`:id`, `:documentId`, `:cardId`); nested context uses sub-paths (`/quizzes/quiz/:id`, `/:id/results`).

---

## 📦 Response contract

### Success

```json
{ "success": true, "data": { }, "message": "..." }
```

- `data` carries the payload (object or array). Some list endpoints add `count`.
- `message` is a human-friendly confirmation.
- A couple of legacy endpoints (login) place fields at the top level alongside `data`-style content; new endpoints consistently use `data`.

### Error

```json
{ "success": false, "error": "Human-readable message", "statusCode": 400 }
```

- In development only, errors may include a `stack` field (added by `errorHandler`).
- Unknown routes return a `404` envelope with `error: "Route not found"`.

### Status code policy

| Code | Meaning | Set by |
| --- | --- | --- |
| 200 | OK (reads, updates, AI results) | controllers |
| 201 | Created (register, upload, flashcards, quiz) | controllers |
| 400 | Validation/bad input, duplicate key, file too large | controllers / errorHandler |
| 401 | Unauthorized (bad creds, missing/invalid/expired token) | auth middleware / errorHandler |
| 404 | Resource or route not found | controllers / errorHandler |
| 500 | Unhandled server error | errorHandler |

---

## 🔐 Authentication contract

- **Scheme:** `Authorization: Bearer <JWT>`.
- **Token payload:** `{ id }` (the user id), signed with `JWT_SECRET`, expiring per `JWT_EXPIRE` (default `7d`).
- **Protected routes** apply `protect` (router-level `router.use(protect)` for most domains; per-route for `/api/auth`).
- See [AUTH_FLOW.md](./AUTH_FLOW.md) for the full lifecycle.

---

## 🧾 Request validation

- **Declarative:** auth routes use `express-validator` (`registerValidation`, `loginValidation`).
- **Imperative:** other controllers validate inline (presence checks, clamping). Examples:
  - `generate-study-plan`: requires `documentId` **or** `topic`; `days` clamped to **1–30**.
  - `agent/ask`: requires non-empty `documentId` and `question`.
- **Resource preconditions:** AI endpoints require the document to be **owned** and `status: 'ready'`, else `404`.

---

## 📑 Endpoint contracts (quick reference)

| Endpoint | Required inputs | Returns (`data`) |
| --- | --- | --- |
| `POST /api/auth/register` | username, email, password | `{ user, token }` |
| `POST /api/auth/login` | email, password | `{ user, token }` (top-level) |
| `POST /api/documents/upload` | file (PDF), title | created document (status=processing) |
| `GET /api/documents` | — | array of docs + `flashcardCount`/`quizCount` |
| `GET /api/documents/:id` | — | document (+ chunks, counts) |
| `POST /api/ai/generate-summary` | documentId | `{ documentId, title, summary }` |
| `POST /api/ai/generate-flashcards` | documentId, count? | persisted flashcard set |
| `POST /api/ai/generate-quiz` | documentId, numQuestions?, title? | persisted quiz |
| `POST /api/ai/explain-concept` | documentId, concept | `{ concept, explanation, relevantChunks }` |
| `POST /api/ai/chat` | documentId, question | `{ question, answer, relevantChunks, chatHistoryId }` |
| `POST /api/ai/generate-study-plan` 🆕 | documentId **or** topic, days?, dailyMinutes?, goal? | `{ source, days, plan }` |
| `POST /api/agent/ask` 🆕 | documentId, question | `{ answer, steps[], flashcards[] }` |

> Full request/response JSON samples live in [API.md](./API.md).

---

## 🧩 Designing the AI/agent endpoints

- **Grounding is mandatory:** AI endpoints always load the document first; the model is given the source text/chunks. This keeps answers tied to user content.
- **Deterministic envelopes around nondeterministic output:** model output is parsed defensively (e.g. study plan strips code fences and extracts JSON) so the API contract stays stable even if the model formats loosely.
- **Transparency fields:** the agent returns `steps` (tools used) and the chat/explain endpoints return `relevantChunks`, giving clients explainability without extra round-trips.
- **Idempotency note:** generation endpoints are **not** idempotent (each call may create a new flashcard set/quiz or a fresh plan). Clients should avoid blind retries on timeout for `generate-*`.

---

## 🌐 Transport & CORS

- JSON over HTTP(S); bodies parsed via `express.json()` and `urlencoded`.
- CORS currently allows all origins (`*`) with `GET,POST,PUT,DELETE` and `Content-Type`/`Authorization` headers.
- Static assets (uploaded PDFs) served at `/uploads`.

**Hardening backlog:** restrict CORS to known origins, add rate limiting (especially on `/api/ai/*` and `/api/agent/*`), and consider request-id correlation for tracing.

---

## 🔄 Versioning & evolution

- No explicit version segment today (routes are unversioned under `/api`). If breaking changes become necessary, introduce `/api/v2/...` and keep `v1` stable.
- New capabilities are added as **new routes** (as the study-plan and agent features were), preserving existing contracts.

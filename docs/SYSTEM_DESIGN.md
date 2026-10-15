# 🧩 System Design

An end-to-end view of how the AI-Powered Learning Assistant runs: components, data flows, the AI subsystem, and operational concerns. For code layout and layering, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🎯 Goals & constraints

| Goal | How it's met |
| --- | --- |
| Turn a PDF into interactive study tools | Extract text → chunk → feed Gemini for summaries/flashcards/quizzes/chat |
| Keep user data isolated | Every query is scoped by `userId`; JWT auth on protected routes |
| Keep AI grounded in the source | RAG: relevant chunks are retrieved and passed as context |
| Be easy to extend | Domain-mirrored folders; new features reuse existing utils |
| Low operational complexity | Single API process, single DB, managed Gemini API |

**Current constraints / simplifications**
- PDF processing runs **in-process** in the background (not a separate queue).
- Uploaded files live on the **local filesystem** of the API host.
- Chunk retrieval uses **keyword scoring**, not vector embeddings.

---

## 🧱 Components

```
┌──────────────────────────────────────────────────────────────────────┐
│                             Browser (SPA)                              │
│  React + Vite · Tailwind · react-router · axios · AuthContext          │
└───────────────┬────────────────────────────────────────────────────────┘
                │ JSON over HTTPS (Bearer JWT)
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Express API (Node.js)                          │
│  routes → auth middleware → controllers → services/utils → models      │
│  errorHandler (central) · CORS · express.json                          │
└───────┬─────────────────────┬──────────────────────────┬───────────────┘
        │                     │                          │
        ▼                     ▼                          ▼
 ┌─────────────┐      ┌──────────────────┐       ┌────────────────────┐
 │  MongoDB    │      │  Google Gemini   │       │  Filesystem        │
 │ (Mongoose)  │      │ (@google/genai)  │       │  uploads/documents │
 └─────────────┘      └──────────────────┘       └────────────────────┘
```

---

## 🔄 Core data flows

### 1) Authentication

```
Register/Login ─▶ bcrypt verify/hash ─▶ sign JWT ─▶ client stores token (localStorage)
Subsequent requests ─▶ axios adds Authorization header ─▶ auth middleware verifies ─▶ req.user
```

### 2) Document upload & processing

```
Upload (multipart) ─▶ multer saves PDF ─▶ create Document(status=processing) ─▶ 201 to client
                                   └▶ background: extract text ─▶ chunk ─▶ update(status=ready|failed)
Client polls / re-fetches ─▶ sees status=ready ─▶ AI features unlock
```

> Because processing is asynchronous, the UI should treat `processing` as a transient state and only enable AI actions when `status === 'ready'`.

### 3) Grounded AI (summary / flashcards / quiz / explain / chat)

```
Request(documentId) ─▶ load Document(ready, owned) ─▶ (optional) findRelevantChunks
                     ─▶ geminiService.<fn>(text|chunks) ─▶ parse ─▶ persist (flashcards/quiz/chat)
                     ─▶ JSON response
```

### 4) Study Plan Generator 🆕

```
Request(documentId OR topic, days, dailyMinutes, goal)
  ─▶ (if documentId) load Document(ready, owned) → use extractedText
  ─▶ geminiService.generateStudyPlan(...) → model returns JSON
  ─▶ defensive JSON parse (strip code fences, extract braces, normalize days)
  ─▶ JSON response { plan: { title, overview, days[] } }
```

### 5) Study Assistant Agent 🆕

```
Request(documentId, question)
  ─▶ load Document(ready, owned)
  ─▶ runStudyAgent: Gemini + functionDeclarations
       ├─ model may call: search_document | summarize_document | generate_flashcards
       ├─ each tool runs locally against THIS document; results fed back
       └─ loop until model returns a final text answer (max 5 steps safeguard)
  ─▶ JSON response { answer, steps[], flashcards[] }
```

---

## 🤖 AI subsystem design

| Aspect | Design choice |
| --- | --- |
| Model | `gemini-2.5-flash-lite` (fast, cost-efficient) for all calls |
| Grounding | Document text (summaries/plan) or retrieved chunks (chat/explain/agent search) |
| Retrieval | Keyword relevance scoring in `textChunker.findRelevantChunks` (top-K, default 3) |
| Structured output | Prompts request a strict format; parsers tolerate noise (fence stripping, brace extraction) |
| Agentic control | Gemini **function calling**; the model selects tools, the server executes them |
| Safety rails | Agent step cap (5), input validation, per-tool try/catch, ownership checks |

**Why RAG with keyword scoring (not vectors)?** It keeps the system dependency-light and fast to run with no embedding store. Swapping in a vector index later is a localized change in `textChunker` + the retrieval call sites.

---

## 🔐 Security design

- **Authentication:** stateless JWT; secret and expiry from env (`JWT_SECRET`, `JWT_EXPIRE`).
- **Password storage:** bcrypt hashing via a Mongoose `pre('save')` hook; `password` field is `select: false`.
- **Authorization:** every data query filters by `userId: req.user._id`, so users can only touch their own records.
- **Upload hardening:** PDF-only MIME filter and a configurable size cap (`MAX_FILE_SIZE`, default 10 MB).
- **Error surface:** a central `errorHandler` keeps responses consistent and avoids leaking internals.

> Hardening backlog: scope CORS to known origins (currently `*`), add rate limiting on AI/auth endpoints, and move secrets to a managed secret store in production.

---

## 📈 Scalability & reliability notes

| Area | Current | Recommended evolution |
| --- | --- | --- |
| PDF processing | In-process background task | Move to a job queue (e.g. BullMQ) + worker for retries/backpressure |
| File storage | Local disk | Object storage (S3 / Cloudinary — config stub already present) |
| Retrieval | Keyword scoring | Vector embeddings + ANN index for larger documents |
| AI calls | Synchronous per request | Add caching for summaries, request timeouts, and retries with backoff |
| Stateless API | Single process | Horizontal scaling behind a load balancer (JWT makes this easy) |
| Observability | Console logs | Structured logging + metrics + tracing around Gemini calls |

**Failure handling today**
- PDF failures set `status: 'failed'` without crashing the request.
- Gemini/service errors are caught and surfaced as `500` via `next(error)`.
- Agent tool failures are caught per-tool and reported back to the model instead of aborting.

---

## 🚀 Deployment view

```
Frontend (static build)                 Backend (Node process)
  vite build → static assets    ──▶       Express server (PORT)
  BASE_URL → API origin                     ├─ connects to MongoDB (MONGODB_URI)
                                            ├─ calls Gemini (GEMINI_API_KEY)
                                            └─ serves /uploads statically
```

**Required environment variables (backend `.env`):**

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for JWTs |
| `JWT_EXPIRE` | Token lifetime (default `7d`) |
| `GEMINI_API_KEY` | Google Gemini API key (**required** — the server exits if missing) |
| `PORT` | API port (default 8000) |
| `MAX_FILE_SIZE` | Max upload size in bytes (default 10485760) |

**Frontend config:** `src/utils/apiPaths.js` → `BASE_URL`. Set it to the API origin for the target environment (local vs deployed).

---

## 🧪 Extensibility checklist (adding a new AI feature)

1. Add a generation function in `utils/geminiService.js` (or a new util).
2. Add a controller in the matching `controllers/*.js`, scoping by `req.user._id`.
3. Wire a route in `routes/*.js` under the right prefix and `protect`.
4. (If a new domain) mount the router in `server.js`.
5. Frontend: add the path to `utils/apiPaths.js`, a method in the matching `services/*.js`, and a component/tab.

This is exactly the path the **Study Plan Generator** and **Study Assistant Agent** followed.

# 🧩 Module Design

Each module's responsibility, its public surface, what it depends on, and how modules interact. "Module" here means a cohesive unit of code — a controller, a util, a middleware, a model, or a frontend service/component group.

---

## 🗺️ Module map (backend)

```
server.js
  ├─ config/db.js            (connect MongoDB)
  ├─ middleware/auth.js       (protect)
  ├─ middleware/errorHandler.js
  └─ routes/*  ──▶ controllers/*  ──▶ utils/*  ──▶ models/*
```

---

## 🔧 Backend modules

### `server.js` — Application bootstrap
- **Responsibility:** create the Express app, apply global middleware (CORS, JSON, static uploads), mount all routers, register the error handler and 404, connect to the DB, and start listening.
- **Depends on:** every router, `config/db.js`, `middleware/errorHandler.js`.
- **Interacts with:** nothing calls it; it is the composition root.

### `config/db.js` — Database connection
- **Responsibility:** connect to MongoDB via Mongoose using `MONGODB_URI`; exit the process on failure.
- **Exposes:** `connectDB()`.

### `config/multer.js` — Upload configuration
- **Responsibility:** disk storage for PDFs, unique filenames, PDF-only filter, size limit (`MAX_FILE_SIZE`).
- **Exposes:** configured `upload` middleware.
- **Used by:** `documentRoutes.js` (`upload.single('file')`).

### `middleware/auth.js` — Authentication gate
- **Responsibility:** read the `Bearer` token, verify the JWT, load the user, attach `req.user`; reject on missing/invalid/expired tokens.
- **Exposes:** `protect`.
- **Used by:** every protected router via `router.use(protect)` (or per-route in auth).

### `middleware/errorHandler.js` — Central error formatter
- **Responsibility:** translate thrown errors into consistent JSON. Maps Mongoose `CastError`→404, duplicate key→400, `ValidationError`→400, Multer size→400, JWT errors→401; includes stack trace only in development.
- **Interacts with:** receives errors from controllers via `next(error)`.

### `models/*` — Data layer
- **Responsibility:** define schemas, validation, indexes, hooks, and instance methods.
- **Notable behavior:** `User` hashes passwords (`pre('save')`) and exposes `matchPassword()`.
- **Used by:** controllers (and the agent/service utils for lookups).

### `controllers/authController.js` — Identity
- **Responsibility:** register, login, profile read/update, change password; issues JWTs.
- **Depends on:** `models/User`, `jsonwebtoken`.

### `controllers/documentController.js` — Document lifecycle
- **Responsibility:** upload (+ async processing), list (with aggregation counts), get one, delete (cascades flashcards/quizzes + file).
- **Depends on:** `models/Document|Flashcard|Quiz`, `utils/pdfParser`, `utils/textChunker`, `fs`.
- **Key interaction:** fire-and-forget `processPDF()` after responding to the upload.

### `controllers/aiController.js` — Grounded AI features
- **Responsibility:** summary, flashcards, quiz, explain-concept, chat, chat history, and **study plan** 🆕. Loads a ready/owned document, calls a Gemini helper, persists where relevant.
- **Depends on:** `utils/geminiService`, `utils/textChunker`, `models/Document|Flashcard|Quiz|ChatHistory`.

### `controllers/agentController.js` — Agent entry point 🆕
- **Responsibility:** validate `documentId`+`question`, load the document, delegate to the agent engine, return `answer`/`steps`/`flashcards`.
- **Depends on:** `utils/studyAgent`, `models/Document`.

### `controllers/flashcardController.js` / `quizController.js` / `progressController.js`
- **Responsibility:** CRUD + interactions for flashcards and quizzes; dashboard aggregation for progress.
- **Depends on:** the respective models.

### `utils/geminiService.js` — Gemini single-shot calls
- **Responsibility:** build prompts and parse responses for summary, flashcards, quiz, chat, explain, and **study plan** 🆕. Owns the model name (`gemini-2.5-flash-lite`) and defensive parsing.
- **Exposes:** `generateFlashcards`, `generateQuiz`, `generateSummary`, `chatWithContext`, `explainConcept`, `generateStudyPlan`.

### `utils/studyAgent.js` — Agentic engine 🆕
- **Responsibility:** declare tools to Gemini, run the function-calling loop, execute tools against the current document, and assemble the final result.
- **Tools:** `search_document` (→ `textChunker`), `summarize_document` (→ `geminiService.generateSummary`), `generate_flashcards` (→ `geminiService.generateFlashcards`).
- **Exposes:** `runStudyAgent({ question, document })`.
- **Note:** reuses lower-level modules rather than duplicating logic.

### `utils/textChunker.js` — Chunking + retrieval
- **Responsibility:** split text into overlapping chunks (`chunkText`) and rank chunks by keyword relevance (`findRelevantChunks`).
- **Used by:** document processing, chat, explain-concept, and the agent's search tool.

### `utils/pdfParser.js` — PDF text extraction
- **Responsibility:** extract raw text from a stored PDF.
- **Used by:** `documentController.processPDF`.

---

## 🎨 Frontend modules

### `App.jsx` — Routing + guards
- **Responsibility:** declare routes, redirect based on `isAuthenticated`, wrap private routes in `ProtectedRoute`.

### `context/AuthContext.jsx` — Auth state
- **Responsibility:** hold `user`, `isAuthenticated`, `loading`; provide `login`, `logout`, `updateUser`, `checkAuthStatus`; persist to `localStorage`.
- **Exposes:** `AuthProvider` + `useAuth()` hook.

### `utils/apiPaths.js` — Endpoint registry
- **Responsibility:** single source of truth for `BASE_URL` and all endpoint strings/builders.

### `utils/axiosInstance.js` — HTTP client
- **Responsibility:** preconfigured axios with base URL/timeout, a request interceptor that injects the `Bearer` token, and a response interceptor for error logging.

### `services/*` — API clients (one per domain)
- **Responsibility:** wrap axios calls, normalize errors (`throw error.response?.data || {...}`), return `data`.
- **Members:** `authService`, `documentService`, `aiService` (+ `generateStudyPlan` 🆕), `agentService` 🆕, `flashcardService`, `quizService`, `progressService`.

### `components/ai/*` — AI UI
- **`AIActions.jsx`** — summary + explain concept (uses `aiService`, `Modal`, `MarkdownRenderer`).
- **`StudyPlanGenerator.jsx`** 🆕 — form (days/minutes/goal) → `aiService.generateStudyPlan` → renders the day timeline.
- **`StudyAgent.jsx`** 🆕 — free-form prompt → `agentService.ask` → renders answer, agent steps, and any flashcards.

### `components/common/*` — Shared primitives
- `Modal`, `Tabs`, `Spinner`, `Button`, `EmptyState`, `PageHeader`, `MarkdownRenderer` — reused across features (e.g. the new AI components reuse `MarkdownRenderer`).

---

## 🔁 Module interactions (sequence examples)

### Study plan request
```
StudyPlanGenerator → aiService.generateStudyPlan → axiosInstance
   → POST /api/ai/generate-study-plan
   → aiRoutes → protect → aiController.generateStudyPlan
   → geminiService.generateStudyPlan → Gemini
   → JSON back up the chain → component renders plan
```

### Agent request
```
StudyAgent → agentService.ask → axiosInstance
   → POST /api/agent/ask
   → agentRoutes → protect → agentController.askAgent
   → studyAgent.runStudyAgent
        ↳ geminiService.generateSummary / generateFlashcards
        ↳ textChunker.findRelevantChunks
   → { answer, steps, flashcards } → component renders trace + result
```

---

## 🧷 Coupling & cohesion notes

- **High cohesion:** each util owns one concern (chunking vs. Gemini prompts vs. agent loop).
- **Low coupling:** controllers depend on utils through small function interfaces; swapping the AI model or retrieval strategy is localized.
- **Reuse direction:** `studyAgent` → `geminiService`/`textChunker` (higher-level composes lower-level), never the reverse.

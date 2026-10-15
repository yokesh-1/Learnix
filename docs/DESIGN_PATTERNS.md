# 🧠 Design Patterns

The patterns actually present in this codebase, each with where it lives and why it helps. These are observations from the real code, not aspirational.

---

## 🏗️ Architectural patterns

### Layered / N-tier architecture
Requests flow through clear layers: **Route → Middleware → Controller → Service/Util → Model → DB**. Each layer has a single kind of responsibility.
- **Where:** the whole backend.
- **Why:** isolates HTTP concerns from business logic from data access, making each layer testable and swappable.

### MVC-ish (Model + Controller, View on the client)
- **Model:** `models/*` (Mongoose schemas + behavior).
- **Controller:** `controllers/*` (orchestration).
- **View:** the React SPA.
- **Why:** familiar separation; the API is a pure JSON backend for the SPA view.

### Client-server SPA
A stateless JSON API serves a React single-page app. Auth is carried by JWT, so the API holds no session state.

### Background processing (fire-and-forget)
`documentController.uploadDocument` responds `201` immediately and kicks off `processPDF()` without awaiting it.
- **Why:** keeps the upload request fast; heavy extraction/chunking happens afterward and flips `status` to `ready`/`failed`.
- **Trade-off:** no retries/backpressure yet (see SYSTEM_DESIGN for the queue evolution).

---

## 🧩 Structural & creational patterns

### Module pattern (ES Modules)
Every file is a module with an explicit public surface via `export`. Utilities expose named functions; routers/services export a default object/router.

### Singleton (effectively)
- The Mongoose connection (`connectDB`) and the Gemini client (`new GoogleGenAI(...)` created once per module) act as app-wide singletons.
- The frontend `axiosInstance` is a single shared, pre-configured client.

### Factory / Builder (token + prompts)
- `generateToken(id)` centralizes JWT creation.
- The Gemini helpers build structured prompts from inputs — a lightweight builder for model requests.

### Repository-ish via Mongoose models
Models encapsulate persistence; controllers query through them rather than touching the driver. `User` also encapsulates domain behavior (`matchPassword`, password hashing hook) — an **Active Record** flavor.

### Provider pattern (React Context)
`AuthProvider` + `useAuth()` expose auth state/actions to the tree without prop drilling.

---

## 🔁 Behavioral patterns

### Middleware / Chain of Responsibility
Express middleware forms a chain: CORS → JSON parse → `protect` → controller → `errorHandler`. Each handler can short-circuit (e.g. `protect` rejects) or pass control via `next()`.

### Centralized Error Handling
All controllers use `try/catch → next(error)`; a single `errorHandler` maps error types to status codes and messages.
- **Why:** consistent error contract; no scattered status/formatting logic.

### Strategy (pluggable retrieval & model)
Retrieval is a strategy encapsulated in `textChunker.findRelevantChunks` (keyword scoring today, could become vector search). The AI model name is centralized in `geminiService`, so the "generation strategy" is swappable in one place.

### Tool-use agent loop (ReAct-style)
`studyAgent.runStudyAgent` implements an iterative **reason → act → observe** loop: Gemini decides which tool(s) to call, the server executes them, feeds observations back, and repeats until a final answer (bounded by a step cap).
- **Pattern:** function-calling / tool-calling agent — the model is the planner, the server is the executor.
- **Why:** lets one endpoint satisfy multi-intent requests ("summarize AND make flashcards") without hardcoding the sequence.

### Adapter / Facade over the AI SDK
`geminiService` is a facade: callers invoke `generateSummary(...)` etc. and never see prompt wiring or SDK details. `studyAgent` adapts internal functions into Gemini "tool" declarations.

### DTO shaping / response normalization
Controllers deliberately shape outbound JSON (e.g. omitting `password`, projecting out `extractedText`/`chunks` in the list aggregation) rather than returning raw documents.
- **Why:** avoids leaking heavy or sensitive fields.

---

## 🎨 Frontend-specific patterns

### Service layer abstraction
`services/*` isolate all HTTP from components. Components call `aiService.generateStudyPlan(...)`; they don't know URLs or axios.

### Interceptor pattern
`axiosInstance` request interceptor injects the auth token; response interceptor centralizes error logging — cross-cutting concerns handled once.

### Centralized configuration
`apiPaths.js` is the single registry of endpoints and `BASE_URL`; changing an endpoint touches one file.

### Container/Presentational blend + composition
Pages act as containers (own state, fetch via services) and compose presentational components; shared `common/*` primitives (`Modal`, `Tabs`, `MarkdownRenderer`) are reused across features.

### Guarded routes
`ProtectedRoute` + `App.jsx` redirects implement route-level authorization based on `useAuth()`.

---

## 🧷 Principles reinforced by these patterns

| Principle | How it shows up |
| --- | --- |
| **Single Responsibility** | Thin routes, orchestrating controllers, single-concern utils |
| **DRY** | New AI features reuse `geminiService`/`textChunker`; endpoints centralized |
| **Separation of Concerns** | HTTP vs. logic vs. persistence vs. AI cleanly split |
| **Open/Closed** | Add features by adding modules; existing layers rarely change |
| **Least Privilege** | Ownership scoping + `password select:false` + PDF-only uploads |

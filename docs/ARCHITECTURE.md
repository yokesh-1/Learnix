# 🏛️ Architecture

This document describes the project structure plus the **high-level** and **low-level** architecture.

---

## 🗂️ Project structure

```
AI-Powered-Learning-Assistant-App/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js        # (optional) media config
│   │   ├── db.js                # MongoDB connection
│   │   ├── env.js               # environment helpers
│   │   └── multer.js            # PDF upload (disk storage, 10MB, PDF-only)
│   ├── controllers/
│   │   ├── aiController.js      # summary, flashcards, quiz, chat, explain, STUDY PLAN 🆕
│   │   ├── agentController.js   # Study Assistant Agent endpoint 🆕
│   │   ├── authController.js    # register, login, profile, password
│   │   ├── documentController.js# upload, list, get, delete + PDF processing
│   │   ├── flashcardController.js
│   │   ├── progressController.js
│   │   └── quizController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT "protect" middleware
│   │   └── errorHandler.js      # centralized error responses
│   ├── models/                  # Mongoose schemas (User, Document, Flashcard, Quiz, ChatHistory)
│   ├── routes/                  # One router per domain, incl. agentRoutes.js 🆕
│   ├── uploads/documents/       # Stored PDFs (served statically)
│   ├── utils/
│   │   ├── geminiService.js     # Gemini single-shot calls + generateStudyPlan 🆕
│   │   ├── studyAgent.js        # Agent engine: tools + function-calling loop 🆕
│   │   ├── pdfParser.js         # PDF → text
│   │   └── textChunker.js       # chunking + keyword relevance search (RAG)
│   └── server.js                # Express app bootstrap + route mounting
│
└── frontend/ai-learning-assistant/
    └── src/
        ├── components/
        │   ├── ai/
        │   │   ├── AIActions.jsx          # summary + explain concept
        │   │   ├── StudyPlanGenerator.jsx # 🆕
        │   │   └── StudyAgent.jsx         # 🆕
        │   ├── auth/  chat/  common/  documents/  flashcards/  layout/  quizzes/
        ├── context/AuthContext.jsx        # auth state (token, user)
        ├── pages/                         # route-level pages
        ├── services/                      # axios API clients (one per domain)
        │   ├── aiService.js  (+ generateStudyPlan 🆕)
        │   └── agentService.js 🆕
        ├── utils/
        │   ├── apiPaths.js    # BASE_URL + endpoint map
        │   └── axiosInstance.js # axios w/ auth interceptor
        ├── App.jsx            # router + route guards
        └── main.jsx
```

---

## 🔭 High-level architecture

```
┌─────────────────────────┐        HTTPS / JSON        ┌───────────────────────────┐
│       React SPA          │  ───────────────────────▶  │     Express REST API      │
│  (Vite, Tailwind)        │  ◀───────────────────────  │        (Node.js)          │
│                          │                            │                           │
│  services/ (axios)       │                            │  routes → controllers     │
│  AuthContext (JWT)       │                            │  middleware (auth, error) │
└─────────────────────────┘                            └───────────┬───────────────┘
                                                                     │
                                        ┌────────────────────────────┼────────────────────────────┐
                                        ▼                            ▼                            ▼
                                ┌───────────────┐          ┌──────────────────┐        ┌────────────────────┐
                                │   MongoDB     │          │  Google Gemini   │        │  Local filesystem  │
                                │  (Mongoose)   │          │  (@google/genai) │        │  uploads/documents │
                                └───────────────┘          └──────────────────┘        └────────────────────┘
```

**Separation of concerns**

| Tier | Responsibility |
| --- | --- |
| **Client (React)** | UI, routing, auth token storage, calling the API |
| **API (Express)** | Request validation, auth, business logic, orchestration of AI + DB + files |
| **Data (MongoDB)** | Persistent storage of users, documents, chunks, flashcards, quizzes, chat |
| **AI (Gemini)** | Text generation and agentic tool-calling |
| **Files (disk)** | Uploaded PDFs, served statically under `/uploads` |

---

## 🔩 Low-level architecture

### Request lifecycle (typical protected request)

```
Client (axios)
  │  Authorization: Bearer <jwt>
  ▼
Express router  (e.g. routes/aiRoutes.js)
  │  router.use(protect)
  ▼
auth middleware (middleware/auth.js)
  │  verify JWT → attach req.user
  ▼
controller (e.g. controllers/aiController.js)
  │  validate body → load document → call service
  ▼
service / util (geminiService.js | studyAgent.js | textChunker.js)
  │  Gemini call(s) and/or DB access
  ▼
Mongoose model → MongoDB
  │
  ▼
controller sends JSON response  → (errors flow to errorHandler.js)
```

### Layering rules

- **Routes** only wire HTTP verbs/paths to controllers and apply middleware.
- **Controllers** handle validation, ownership checks (`userId: req.user._id`), and shaping responses. They never talk to Gemini directly beyond calling a util.
- **Utils/services** contain the integration logic (Gemini prompts, chunking, agent loop).
- **Models** define schema + behavior (hooks, methods).

### PDF processing pipeline (low-level)

```
POST /api/documents/upload
  → multer saves file to uploads/documents, creates Document(status=processing)
  → responds 201 immediately
  → background: processPDF()
       → pdfParser.extractTextFromPDF(filePath)   // text
       → textChunker.chunkText(text, 500, 50)      // overlapping chunks
       → Document.update({ extractedText, chunks, status: 'ready' })
       (on error → status: 'failed')
```

### RAG (chat / explain-concept) (low-level)

```
question + document.chunks
  → textChunker.findRelevantChunks(chunks, query, 3)   // keyword scoring
  → build context from top chunks
  → geminiService.chatWithContext(question, chunks)     // grounded answer
  → persist to ChatHistory (chat only)
```

### Agent loop (low-level) 🆕

```
POST /api/agent/ask
  → agentController loads the document (status=ready, owned by user)
  → studyAgent.runStudyAgent({ question, document })
       loop (max 5 steps):
         call Gemini with functionDeclarations (tools)
         if model returns functionCall(s):
             execute tool(s) locally (search / summarize / flashcards)
             feed functionResponse back into the conversation
             continue loop
         else:
             return final answer + collected steps + any flashcards
```

**Agent tools** are plain functions bound to the current document, declared to Gemini via `Type.OBJECT` schemas. The model chooses which to call; the controller never hard-codes the sequence.

---

## 🔐 Cross-cutting concerns

| Concern | Where it lives |
| --- | --- |
| Authentication | `middleware/auth.js` (JWT verify) + `AuthContext` + axios interceptor |
| Authorization | Controllers scope every query by `userId: req.user._id` |
| Error handling | `middleware/errorHandler.js` (central), `try/catch → next(error)` in controllers |
| Validation | `express-validator` on auth routes; manual checks elsewhere |
| CORS | Configured in `server.js` (`origin: *`, methods, headers) |
| File limits | `config/multer.js` (PDF-only, size cap) |

---

## 🧱 Design principles observed

- **Feature-per-domain folders** (controllers / routes / services mirror each other).
- **Thin routes, fat-ish controllers, reusable utils.**
- **Reuse over duplication** — the agent and study-plan features reuse existing Gemini helpers and the chunker rather than reimplementing them.
- **Stateless AI add-ons** — the new features don't change the DB schema.

> For the full runtime/data-flow picture, see [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

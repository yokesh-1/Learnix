# 🗂️ Code Structure

How the codebase is organized, what belongs where, and the conventions that keep it consistent. This complements [ARCHITECTURE.md](./ARCHITECTURE.md) (which focuses on design) by focusing on **file/folder organization**.

---

## 📁 Top level

```
AI-Powered-Learning-Assistant-App/
├── backend/     # Express REST API (Node, ES Modules)
├── frontend/    # React SPA (Vite)
├── docs/        # Project documentation (this folder)
├── Readme.md
└── .gitignore
```

The frontend lives one level deeper at `frontend/ai-learning-assistant/`.

---

## 🖥️ Backend layout

```
backend/
├── config/        # Infrastructure setup (DB, uploads, env, media)
├── controllers/   # Request handlers (business logic per domain)
├── middleware/    # Cross-cutting request handlers (auth, errors)
├── models/        # Mongoose schemas + model behavior
├── routes/        # HTTP verb/path → controller wiring (one per domain)
├── utils/         # Reusable logic (Gemini, agent, PDF, chunking)
├── uploads/       # Stored PDFs (served statically)
├── server.js      # App bootstrap: middleware + route mounting
└── package.json
```

### What goes in each folder

| Folder | Responsibility | Example files |
| --- | --- | --- |
| `config/` | Connecting to / configuring infrastructure | `db.js`, `multer.js`, `env.js`, `cloudinary.js` |
| `controllers/` | Validate input, enforce ownership, orchestrate utils + models, shape responses | `aiController.js`, `agentController.js`, `authController.js` |
| `middleware/` | Logic that runs around requests | `auth.js` (JWT), `errorHandler.js` |
| `models/` | Schema definitions, hooks, instance methods | `User.js`, `Document.js`, `Quiz.js` |
| `routes/` | Map paths/verbs to controllers, apply `protect` | `aiRoutes.js`, `agentRoutes.js` |
| `utils/` | Pure/reusable logic with no HTTP concerns | `geminiService.js`, `studyAgent.js`, `textChunker.js`, `pdfParser.js` |

### The "domain quartet" pattern

Each feature domain is mirrored across folders so related code is easy to find:

```
Domain "ai"      → routes/aiRoutes.js    → controllers/aiController.js    → utils/geminiService.js
Domain "agent"   → routes/agentRoutes.js → controllers/agentController.js → utils/studyAgent.js
Domain "auth"    → routes/authRoutes.js  → controllers/authController.js  → models/User.js
Domain "document"→ routes/documentRoutes.js → controllers/documentController.js → utils/pdfParser.js, textChunker.js
```

### Naming conventions (backend)

- Files: `camelCase.js` (`aiController.js`, `textChunker.js`).
- Models: `PascalCase.js` matching the exported model (`User.js` → `User`).
- Routers export a default `express.Router()`.
- Controllers export **named** functions (e.g. `export const generateSummary`).
- Mongoose collection names are the lowercased plural of the model (`User` → `users`).

---

## 🎨 Frontend layout

```
frontend/ai-learning-assistant/
├── public/
├── index.html
├── vite.config.js
├── eslint.config.js
└── src/
    ├── components/      # Reusable + feature UI, grouped by area
    │   ├── ai/          # AIActions, StudyPlanGenerator 🆕, StudyAgent 🆕
    │   ├── auth/        # ProtectedRoute, forms
    │   ├── chat/        # ChatInterface
    │   ├── common/      # Button, Modal, Spinner, Tabs, MarkdownRenderer, ...
    │   ├── documents/   # Document UI
    │   ├── flashcards/  # FlashcardManager, Flashcard
    │   ├── layout/      # Shell/layout pieces
    │   └── quizzes/     # QuizManager
    ├── context/         # React context providers (AuthContext)
    ├── pages/           # Route-level screens, grouped by area
    │   ├── Auth/  Dashboard/  Documents/  Flashcards/  Profile/  Quizzes/
    │   └── NotFoundPage.jsx
    ├── services/        # One axios client per backend domain
    ├── utils/           # apiPaths (endpoint map) + axiosInstance (interceptors)
    ├── App.jsx          # Router + guards
    ├── main.jsx         # React root
    └── index.css        # Tailwind entry
```

### What goes in each folder

| Folder | Responsibility |
| --- | --- |
| `components/<area>/` | Presentational + feature components, grouped by domain |
| `components/common/` | Shared primitives reused everywhere (Modal, Tabs, Spinner, MarkdownRenderer) |
| `context/` | Global React state (auth) via Context API |
| `pages/<area>/` | Screens mapped to routes in `App.jsx` |
| `services/` | API calls — each file wraps axios + `API_PATHS` for one domain |
| `utils/` | `apiPaths.js` (central endpoint map + `BASE_URL`), `axiosInstance.js` (auth interceptor) |

### Frontend layering

```
Page (pages/*)                → composes components, owns screen state
  └─ Component (components/*)  → UI + local state; calls a service
       └─ Service (services/*)→ axios call using API_PATHS
            └─ axiosInstance  → injects Bearer token, handles errors
```

### Naming conventions (frontend)

- Components/pages: `PascalCase.jsx` (`StudyAgent.jsx`, `DocumentDetailPage.jsx`).
- Services: `camelCaseService.js` (`aiService.js`, `agentService.js`), default-exporting an object of methods.
- Endpoint constants live only in `utils/apiPaths.js` — components never hardcode URLs.

---

## 🔗 How a new feature touches the tree (worked example: Study Plan Generator)

```
backend/utils/geminiService.js         + generateStudyPlan()
backend/controllers/aiController.js     + generateStudyPlan controller
backend/routes/aiRoutes.js              + POST /generate-study-plan
frontend/src/utils/apiPaths.js          + AI.GENERATE_STUDY_PLAN
frontend/src/services/aiService.js      + generateStudyPlan()
frontend/src/components/ai/StudyPlanGenerator.jsx  (new component)
frontend/src/pages/Documents/DocumentDetailPage.jsx + "Study Plan" tab
```

The Study Assistant Agent followed the same shape but introduced a **new domain** (`agent`), so it also added `routes/agentRoutes.js`, `controllers/agentController.js`, `utils/studyAgent.js`, `services/agentService.js`, and a mount line in `server.js`.

---

## 📌 Conventions summary

- **ES Modules** everywhere (`import`/`export`), both tiers.
- **Thin routes, controllers orchestrate, utils are reusable** (no HTTP in utils).
- **Ownership scoping** in every data query (`userId: req.user._id`).
- **Centralized endpoints** on the frontend (`apiPaths.js`) and **centralized errors** on the backend (`errorHandler.js`).
- **Group by domain**, not by file type, within `components/` and `pages/`.

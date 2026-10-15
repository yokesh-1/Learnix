# 🛠️ Tech Stack

A full inventory of languages, frameworks, libraries, and tooling used across the project. Versions reflect the ranges declared in each `package.json`.

---

## 🧱 Overview

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite, Tailwind CSS 4 |
| Backend | Node.js + Express 5 (ES Modules) |
| Database | MongoDB + Mongoose |
| AI | Google Gemini (`@google/genai`) |
| Auth | JWT + bcrypt |
| File handling | Multer (disk storage), pdf-parse |

---

## 🖥️ Backend (`backend/`)

**Runtime:** Node.js (ES Modules — `"type": "module"`).

### Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `express` | ^5.2.1 | HTTP server and routing |
| `mongoose` | ^9.6.2 | MongoDB ODM (schemas, models, queries) |
| `@google/genai` | ^2.6.0 | Google Gemini SDK — text generation **and function calling** (the agent) |
| `jsonwebtoken` | ^9.0.3 | JWT creation/verification for auth |
| `bcryptjs` | ^3.0.3 | Password hashing |
| `multer` | ^2.1.1 | Multipart file upload (PDF to disk) |
| `pdf-parse` | ^2.4.5 | Extract text from uploaded PDFs |
| `express-validator` | ^7.3.2 | Request body validation (auth routes) |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `dotenv` | ^17.4.2 | Load environment variables |

### Dev dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `nodemon` | ^3.1.14 | Auto-restart in development |

### Scripts

```json
"start": "node server.js",
"dev":   "nodemon server.js"
```

### AI model

- Model used throughout: **`gemini-2.5-flash-lite`**.
- Single-shot generation for summary/flashcards/quiz/explain/chat/study-plan.
- **Function calling** (tool use) for the Study Assistant Agent via the `Type` schema helpers and `functionDeclarations`.

---

## 🎨 Frontend (`frontend`)

**Build tool:** Vite 8. **Module system:** ES Modules.

### Dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `react` / `react-dom` | ^19.2.6 | UI library |
| `react-router-dom` | ^7.15.1 | Client-side routing |
| `axios` | ^1.16.1 | HTTP client (with interceptors for auth token) |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3.0 | Utility-first styling |
| `lucide-react` | ^1.16.0 | Icon set |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `react-markdown` | ^10.1.0 | Render Markdown (AI responses) |
| `remark-gfm` | ^4.0.1 | GitHub-flavored Markdown support |
| `react-syntax-highlighter` | ^16.1.1 | Code block highlighting in Markdown |
| `moment` | ^2.30.1 | Date formatting |

### Dev dependencies

| Package | Version | Purpose |
| --- | --- | --- |
| `vite` | ^8.0.12 | Dev server + bundler |
| `@vitejs/plugin-react` | ^6.0.1 | React fast refresh |
| `eslint` + plugins | ^10.x | Linting (React hooks + refresh rules) |
| `@types/react*` | ^19.x | Type definitions |
| `globals` | ^17.6.0 | ESLint globals config |

### Scripts

```json
"dev":     "vite",
"build":   "vite build",
"lint":    "eslint .",
"preview": "vite preview"
```

---

## 🔧 Tooling & conventions

- **ES Modules everywhere** (both frontend and backend use `import`/`export`).
- **ESLint** governs the frontend code style.
- **nodemon** for backend hot-reload.
- **Environment config** via `.env` (backend) and `apiPaths.js` `BASE_URL` (frontend).

## 🌍 External services

| Service | Used for |
| --- | --- |
| **MongoDB** (Atlas or self-hosted) | Primary datastore |
| **Google Gemini API** | All AI generation and agent tool-calling |
| **Render** (current deploy target) | Backend hosting — the frontend `BASE_URL` points here |

> ⚠️ **Note for developers:** the frontend `BASE_URL` in `src/utils/apiPaths.js` is currently hardcoded to the deployed Render URL. For local development, point it at `http://localhost:8000` (or make it environment-driven).

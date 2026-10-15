# 🧠 Learnix 

Turn any PDF into an interactive study kit. Upload a document and use AI to summarize it, chat with it, explain concepts, generate flashcards and quizzes, build a personalized study plan, and let an **AI agent** do multi-step study tasks for you.



> Built with the MERN stack and Google Gemini. Full developer docs live in [`/docs`](./docs/README.md).

---

## ✨ Features

- 📄 **Document management** — upload PDFs; text is extracted and chunked automatically
- 💬 **Chat with your document** — context-aware answers grounded in the content (RAG)
- 📝 **Summaries** — concise overviews of long material
- 💡 **Concept explanation** — deep-dive any topic from the document
- 🃏 **Flashcards** — auto-generated Q/A cards with review + starring
- 🧩 **Quizzes** — multiple-choice questions with scoring and feedback
- 🗓️ **Study Plan Generator** 🆕 — a day-by-day schedule from a document or topic
- 🤖 **Study Assistant Agent** 🆕 — an agentic AI that picks tools (search / summarize / flashcards) to fulfill free-form requests
- 📊 **Dashboard** — track documents, flashcards, and quiz activity
- 🔐 **Auth** — JWT-based registration, login, and protected routes

---

## 🛠️ Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| AI | Google Gemini (`@google/genai`) — generation **and** function-calling agent |
| Auth | JWT + bcrypt |
| Deploy | Vercel (frontend) · Render (backend) · MongoDB Atlas |

---

## 🚀 Quick Start

```bash
# 1) Backend
cd backend
npm install
npm run dev          # http://localhost:8000

# 2) Frontend
cd frontend/
npm install
npm run dev          # Vite dev server
```

**Backend `.env`:**

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
MAX_FILE_SIZE=10485760
```

> For local dev, point the frontend `BASE_URL` in `frontend/src/utils/apiPaths.js` to `http://localhost:8000`.

---

## 🧩 How it works

```
Upload PDF → extract text → chunk → store (status: ready)
                                   │
      ┌────────────────────────────┼───────────────────────────┐
      ▼                            ▼                             ▼
  Summaries / Explain      Chat (RAG retrieval)         Agent (tool-calling loop)
      │                            │                             │
      └────────────────────── Google Gemini ─────────────────────┘
```

---

## 📚 Documentation

Deep dives live in the [`docs/`](./docs/README.md) folder:

| Doc | Topic |
| --- | --- |
| [FEATURES](./docs/FEATURES.md) | All features by area |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | High- & low-level design |
| [API](./docs/API.md) · [API_DESIGN](./docs/API_DESIGN.md) | Endpoints + contracts |
| [DATABASE_SCHEMA](./docs/DATABASE_SCHEMA.md) · [DATABASE_DESIGN](./docs/DATABASE_DESIGN.md) | Data model |
| [DATA_FLOW](./docs/DATA_FLOW.md) · [MODULE_DESIGN](./docs/MODULE_DESIGN.md) | Flows & modules |
| [AUTH_FLOW](./docs/AUTH_FLOW.md) · [DESIGN_PATTERNS](./docs/DESIGN_PATTERNS.md) | Auth & patterns |
| [SYSTEM_DESIGN](./docs/SYSTEM_DESIGN.md) · [CODE_STRUCTURE](./docs/CODE_STRUCTURE.md) | System & code layout |
| [TECH_STACK](./docs/TECH_STACK.md) | Versions & tooling |

---

## 📂 Project Structure

```text
AI-Powered-Learning-Assistant-App/
├── backend/     # Express REST API, MongoDB, Gemini integration
├── frontend/    # React (Vite) single-page app
└── docs/        # Developer documentation
```

---

## 📸 Screenshots

![App screenshot](<Screenshot 2026-06-08 192321.png>)
![App screenshot](image.png)

# 📚 Documentation — AI-Powered Learning Assistant

Welcome to the developer documentation for the **AI-Powered Learning Assistant**. This folder is the single source of truth for understanding how the project is built, how its pieces fit together, and how to extend it.

## 📖 Document index

| Document | What it covers |
| --- | --- |
| [FEATURES.md](./FEATURES.md) | Every user-facing feature, grouped by area |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Project structure, high-level and low-level design |
| [API.md](./API.md) | All REST endpoints with request/response examples |
| [TECH_STACK.md](./TECH_STACK.md) | Languages, frameworks, libraries and tooling |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | MongoDB collections, fields and relationships |
| [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) | End-to-end system design, data flows and scaling notes |
| [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) | Code organization, folder layout and conventions |
| [MODULE_DESIGN.md](./MODULE_DESIGN.md) | Module responsibilities and interactions |
| [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md) | Design patterns used across the codebase |
| [DATA_FLOW.md](./DATA_FLOW.md) | Data flow diagrams per operation |
| [API_DESIGN.md](./API_DESIGN.md) | API contracts, conventions and design rationale |
| [DATABASE_DESIGN.md](./DATABASE_DESIGN.md) | Schema rationale, indexes and relationships |
| [AUTH_FLOW.md](./AUTH_FLOW.md) | Authentication and authorization flow |

## 🧭 Quick overview

The app lets a user upload PDF study material and then use AI to learn from it:

- **Upload** a PDF → text is extracted and chunked.
- **Study** using AI: summaries, flashcards, quizzes, concept explanations, document chat, a **study plan generator**, and an **agentic study assistant**.
- **Track** progress on a dashboard.

It is a classic **MERN-style stack** (MongoDB, Express, React, Node) with **Google Gemini** as the AI engine.

## 🗂️ Repository layout (top level)

```
AI-Powered-Learning-Assistant-App/
├── backend/     # Node + Express REST API, MongoDB, Gemini integration
├── frontend/    # React (Vite) single-page app
└── docs/        # You are here
```

## 🚀 Running locally (summary)

```bash
# Backend
cd backend
npm install
npm run dev          # starts on http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev          # starts Vite dev server
```

Backend environment variables (`.env` in `backend/`):

```
MONGODB_URI=...
JWT_SECRET=...
JWT_EXPIRE=7d
GEMINI_API_KEY=...
PORT=8000
MAX_FILE_SIZE=10485760
```

> See [TECH_STACK.md](./TECH_STACK.md) for versions and [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for how it all runs together.

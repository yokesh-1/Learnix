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

#### Login Page 
<img width="1414" height="739" alt="login" src="https://github.com/user-attachments/assets/a7af02d1-0005-411b-9d3b-b5840b809ab3" />

#### Dashboard Page 
<img width="1896" height="943" alt="dashboard" src="https://github.com/user-attachments/assets/662a251a-dfd4-4985-aba8-6cc77b7bf744" />

#### Documents Page 
<img width="1878" height="877" alt="Documentpage" src="https://github.com/user-attachments/assets/ae6ec9ab-b42b-47f8-a724-e1a28e84be5f" />

#### uploaded Content render
<img width="1878" height="877" alt="pdf-view" src="https://github.com/user-attachments/assets/6a219bbb-e546-47fd-9554-d1c4b256b0ec" />

#### Chat History 

<img width="1878" height="877" alt="chat" src="https://github.com/user-attachments/assets/b58c1f16-fcb2-42ce-89cf-8b9ced1fa450" />


#### AI Actions
<img width="1903" height="681" alt="Ai-actions" src="https://github.com/user-attachments/assets/8cdfaa75-ee8e-4f68-86ca-d0d597dd84e9" />


#### Flashcards
<img width="1908" height="815" alt="flashcard" src="https://github.com/user-attachments/assets/35980a65-43cf-42e9-ab35-386c28d7f2f9" />


#### Flashcard sets Page
![flashcard-sets](https://github.com/user-attachments/assets/6c612d52-f011-48dc-85d2-93abe1b07ff0)


#### Quiz Results
<img width="1920" height="898" alt="Quiz" src="https://github.com/user-attachments/assets/43b1dfca-9305-46d4-86cc-b25a9b236e03" />

#### Study Plan Input 
<img width="1912" height="858" alt="study-plan-generator" src="https://github.com/user-attachments/assets/e6f2bddb-16bd-4741-87ee-9937cdd3390f" />


#### Study plan Output 
<img width="1916" height="893" alt="generated plan" src="https://github.com/user-attachments/assets/c517cb89-6894-423d-b6fa-846a38d2c0b4" />


#### Agent Input 

<img width="1916" height="893" alt="study-agent" src="https://github.com/user-attachments/assets/7f3df4b7-b4e3-4f50-a5c7-485773fa596c" />


#### Agent Output 

<img width="1916" height="893" alt="agent-output" src="https://github.com/user-attachments/assets/fa6e9e29-f802-4f81-a4ff-411223e45797" />


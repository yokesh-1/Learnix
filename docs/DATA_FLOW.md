# 🔀 Data Flow

Diagrams tracing how data moves through the system for each major operation. Boxes are components; arrows are data moving between them.

> Notation: `──▶` request/data forward, `◀──` response/data back, `└▶` async/background branch.

---

## 0) Legend of actors

```
[Browser SPA]   React components + services (axios)
[API]           Express routes → middleware → controllers
[Util]          geminiService / studyAgent / textChunker / pdfParser
[DB]            MongoDB via Mongoose
[Gemini]        Google Gemini API
[FS]            Local filesystem (uploads/documents)
```

---

## 1) Registration / Login

```
[Browser] ──{username,email,password}──▶ [API] authController
                                             │
                                             ├─ (register) User.create → bcrypt hash (pre-save) → [DB]
                                             ├─ (login) User.findOne(+password) → matchPassword()
                                             └─ generateToken(id)  → JWT
[Browser] ◀──{ user, token }── [API]
   │
   └─ AuthContext.login(): store token+user in localStorage, set isAuthenticated
```

---

## 2) Authenticated request (every protected call)

```
[Browser] axiosInstance
   │  request interceptor adds: Authorization: Bearer <token>
   ▼
[API] protect (middleware/auth.js)
   │  jwt.verify → User.findById(select -password) → req.user
   ├─ invalid/expired/missing → 401 (short-circuit)
   ▼
[API] controller (ownership: filter by req.user._id)
```

---

## 3) Document upload + background processing

```
[Browser] ──multipart{ file, title }──▶ [API] documentRoutes (multer upload.single)
                                             │
   [FS] ◀── save PDF to uploads/documents ───┤
                                             │ Document.create(status=processing) → [DB]
[Browser] ◀──201 { document }── [API]        │
                                             └▶ processPDF(id, path)   (async, not awaited)
                                                   │ pdfParser.extractTextFromPDF → text
                                                   │ textChunker.chunkText(text,500,50) → chunks[]
                                                   ▼
                                                [DB] Document.update({ extractedText, chunks, status: ready|failed })
```

The client later re-fetches the document and sees `status: ready`, unlocking AI features.

---

## 4) Grounded single-shot AI (summary example)

```
[Browser] AIActions ──{ documentId }──▶ aiService.generateSummary ──▶ [API] aiController.generateSummary
                                                                         │ Document.findOne(ready, owned) → [DB]
                                                                         ▼
                                                                   [Util] geminiService.generateSummary(text)
                                                                         ──prompt──▶ [Gemini]
                                                                         ◀──summary── [Gemini]
[Browser] ◀──{ summary }── [API] ◀───────────────────────────────────────┘
   └─ rendered via MarkdownRenderer in a Modal
```

Flashcards/quiz follow the same shape but also **persist** the generated set/quiz to `[DB]` before responding.

---

## 5) RAG chat / explain-concept

```
[Browser] ──{ documentId, question }──▶ [API] aiController.chat
                                           │ Document.findOne(ready, owned) → [DB]
                                           │ textChunker.findRelevantChunks(chunks, question, 3)
                                           ▼
                                     [Util] geminiService.chatWithContext(question, chunks)
                                           ──context+question──▶ [Gemini]
                                           ◀──answer── [Gemini]
                                           │ ChatHistory.push(user+assistant msgs) → [DB]
[Browser] ◀──{ answer, relevantChunks, chatHistoryId }── [API]
```

`explain-concept` is identical except it builds context from the top chunks and does **not** persist history.

---

## 6) Study Plan Generator 🆕

```
[Browser] StudyPlanGenerator ──{ documentId|topic, days, dailyMinutes, goal }──▶ [API] aiController.generateStudyPlan
                                                                                   │ clamp days 1..30
                                                                                   │ if documentId → Document.findOne(ready, owned) → text
                                                                                   ▼
                                                                             [Util] geminiService.generateStudyPlan(...)
                                                                                   ──JSON-format prompt──▶ [Gemini]
                                                                                   ◀──text(JSON)── [Gemini]
                                                                                   │ strip fences → extract { } → JSON.parse → normalize days[]
[Browser] ◀──{ plan:{ title, overview, days[] } }── [API]
   └─ renders a day-by-day timeline (title, focus, tasks, estimatedMinutes)
```

---

## 7) Study Assistant Agent 🆕 (tool-calling loop)

```
[Browser] StudyAgent ──{ documentId, question }──▶ [API] agentController.askAgent
                                                      │ Document.findOne(ready, owned) → [DB]
                                                      ▼
                                                [Util] studyAgent.runStudyAgent({ question, document })
                                                      │
         ┌────────────────────────── loop (max 5 steps) ──────────────────────────┐
         │ call [Gemini] with functionDeclarations (tools)                         │
         │   ├─ model returns functionCall(s)?                                     │
         │   │     ├─ search_document   → textChunker.findRelevantChunks           │
         │   │     ├─ summarize_document→ geminiService.generateSummary → [Gemini] │
         │   │     └─ generate_flashcards→ geminiService.generateFlashcards→[Gemini]│
         │   │     feed functionResponse back into conversation → continue         │
         │   └─ else → final text answer → exit loop                               │
         └──────────────────────────────────────────────────────────────────────┘
                                                      ▼
[Browser] ◀──{ answer, steps[], flashcards[] }── [API]
   └─ renders agent "steps" trace + answer (Markdown) + any flashcards
```

Key detail: **tools run on the server**, grounded to the loaded document; the model only decides *which* tools and *with what args*.

---

## 8) Document list (aggregation with counts)

```
[Browser] ──▶ [API] documentController.getDocuments
                 │ Document.aggregate:
                 │   $match userId → $lookup flashcards → $lookup quizzes
                 │   $addFields flashcardCount, quizCount
                 │   $project out extractedText/chunks → $sort uploadDate desc
                 ▼ [DB]
[Browser] ◀──{ count, data:[ lightweight docs + counts ] }── [API]
```

---

## 9) Delete document (application-level cascade)

```
[Browser] ──DELETE /:id──▶ [API] documentController.deleteDocument
                              │ Document.findOne(owned) → [DB]
                              │ Flashcard.deleteMany({documentId}) → [DB]
                              │ Quiz.deleteMany({documentId}) → [DB]
                              │ fs.unlink(filePath) → [FS]
                              │ document.deleteOne() → [DB]
[Browser] ◀──{ success }── [API]
```

---

## 🔎 Cross-cutting: error path

```
any controller: try { ... } catch (e) { next(e) }
                                           ▼
                              [API] errorHandler
                                 maps: CastError→404, dup key→400,
                                       ValidationError→400, Multer size→400,
                                       JWT errors→401, else→500
[Browser] ◀──{ success:false, error, statusCode }──
```

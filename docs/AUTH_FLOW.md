# 🔐 Authentication & Authorization Flow

How identity, sessions, and access control work end to end — from registration to protecting every API call. Based on `authController.js`, `middleware/auth.js`, `models/User.js`, and the frontend `AuthContext` + `axiosInstance`.

---

## 🧭 Model at a glance

- **Authentication:** stateless **JWT**. The server issues a signed token; the client sends it on every request. No server-side sessions.
- **Authorization:** two layers —
  1. **Route protection** via the `protect` middleware (are you logged in?).
  2. **Ownership scoping** in controllers (`userId: req.user._id`) (is this *your* resource?).
- **Password security:** bcrypt hashing via a Mongoose `pre('save')` hook; the `password` field is `select: false`.

---

## 🪪 Token design

- **Created by:** `generateToken(id)` → `jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE || '7d' })`.
- **Payload:** just the user `id` (minimal; everything else is looked up fresh).
- **Secret/expiry:** from env `JWT_SECRET` and `JWT_EXPIRE`.
- **Transport:** `Authorization: Bearer <token>` header.
- **Client storage:** `localStorage` (`token` + serialized `user`), managed by `AuthContext`.

---

## 📝 Registration flow

```
[Browser] Register form ──{username,email,password}──▶ [API] POST /api/auth/register
   │                                                     │ express-validator: username≥3, valid email, password≥6
   │                                                     │ User.findOne({email}) → exists? → 400
   │                                                     │ User.create(...)  → pre('save') bcrypt hash
   │                                                     │ generateToken(user._id)
[Browser] ◀──201 { data:{ user }, token }──────────────┘
   └─ AuthContext.login(user, token): persist + setIsAuthenticated(true)
```

- The raw password is **never stored**; the pre-save hook hashes it before insert.
- Duplicate email/username surfaces as a `400` (either the controller's explicit check or the unique-index duplicate-key path in `errorHandler`).

---

## 🔑 Login flow

```
[Browser] Login form ──{email,password}──▶ [API] POST /api/auth/login
   │                                          │ validate presence → 400 if missing
   │                                          │ User.findOne({email}).select('+password')  (password normally hidden)
   │                                          │ not found → 401
   │                                          │ user.matchPassword(password) → bcrypt.compare → false → 401
   │                                          │ generateToken(user._id)
[Browser] ◀──200 { user, token }────────────┘
   └─ AuthContext.login(user, token)
```

- Credentials are intentionally vague on failure (`Invalid credentials`) to avoid leaking which field was wrong.
- `select('+password')` is required because the field is excluded by default.

---

## 🛡️ Protected request flow (authorization layer 1)

Every protected call passes through `protect` (`middleware/auth.js`):

```
[Browser] axiosInstance request interceptor
   │  reads localStorage token → sets Authorization: Bearer <token>
   ▼
[API] protect
   │  header present & starts with "Bearer"? → extract token
   │  jwt.verify(token, JWT_SECRET)
   │     ├─ TokenExpiredError → 401 "Token has expired"
   │     ├─ invalid            → 401 "Not authorized, token failed"
   │     └─ ok → decoded.id
   │  User.findById(decoded.id).select('-password') → req.user
   │     └─ user missing → 401 "User not found"
   │  no token at all → 401 "Not authorized, no token"
   ▼
[API] controller runs with req.user populated
```

- Most routers apply it globally: `router.use(protect)` (documents, ai, agent, flashcards, quizzes, progress).
- Auth routes apply it per-route for the private endpoints (`/profile`, `/change-password`).

---

## 🔒 Ownership enforcement (authorization layer 2)

Being authenticated is not enough — controllers additionally scope data to the caller:

```js
const document = await Document.findOne({ _id: id, userId: req.user._id, status: 'ready' });
if (!document) return 404;  // either not found OR not owned by this user
```

- Applied uniformly across documents, flashcards, quizzes, chat history, study plan, and the agent.
- Returning `404` (not `403`) for someone else's resource avoids confirming its existence.

---

## 🔁 Password change flow

```
[Browser] ──{currentPassword,newPassword}──▶ [API] PUT /api/auth/change-password (protect)
   │                                            │ User.findById(req.user._id).select('+password')
   │                                            │ matchPassword(currentPassword) → false → 401
   │                                            │ user.password = newPassword → save() → pre-save re-hash
[Browser] ◀──200 { success }──────────────────┘
```

Assigning a new password and calling `save()` re-triggers the hashing hook, so the new password is stored hashed.

---

## 🚪 Session lifecycle on the client

```
Login/Register → AuthContext.login(): localStorage{token,user}, isAuthenticated=true
App start      → checkAuthStatus(): if token+user in storage → restore session
Logout         → AuthContext.logout(): clear storage → redirect /login
Guarding       → App.jsx + ProtectedRoute: redirect based on isAuthenticated
```

- There is **no silent refresh**; when the JWT expires the API returns `401` and the user must log in again. (`axiosInstance` logs errors; expiry handling/redirect is driven by the app/`logout`.)

---

## 🧯 Auth-related error mapping

| Situation | Status | Message |
| --- | --- | --- |
| Missing token | 401 | `Not authorized, no token` |
| Invalid token | 401 | `Not authorized, token failed` / `Invalid token` |
| Expired token | 401 | `Token has expired` / `Token expired` |
| Bad credentials | 401 | `Invalid credentials` |
| Wrong current password | 401 | `Invalid current password` |
| Duplicate email/username | 400 | `Email/Username already exists` or `<field> already exists` |

JWT errors are handled both in `protect` (verification time) and in `errorHandler` (as a safety net).

---

## ✅ Strengths & 🧱 hardening backlog

**Strengths**
- Stateless and horizontally scalable (no session store).
- Minimal token payload; user re-fetched each request so revoked/changed users reflect quickly.
- Defense in depth: route protection **plus** ownership scoping.
- Passwords never stored or returned in plaintext.

**Hardening backlog**
- Consider **httpOnly cookies** instead of `localStorage` to reduce XSS token theft risk.
- Add **refresh tokens** / short-lived access tokens for smoother expiry handling.
- Add **rate limiting / lockout** on login and password-change.
- Scope **CORS** to known origins (currently `*`).
- Add a **401 interceptor** on the client to auto-logout and redirect on expiry.

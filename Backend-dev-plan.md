
# BACKEND DEVELOPMENT PLAN — ELEVATE

## 1️⃣ EXECUTIVE SUMMARY

**What Will Be Built:**
A FastAPI backend for Elevate, a youth athlete performance tracking platform that enables athletes (ages 8-18) to log game stats, training sessions, set goals, generate AI insights, and share progress with parents/coaches.

**Why:**
The frontend currently uses localStorage for data persistence. This backend will provide:
- Multi-device data synchronization
- Secure user authentication
- Persistent data storage in MongoDB Atlas
- AI-powered performance insights
- Shareable progress reports

**Key Constraints:**
- Backend: FastAPI (Python 3.13, async)
- Database: MongoDB Atlas using Motor and Pydantic v2
- No Docker
- Manual testing required after every task
- Git workflow: single branch `main` only
- API base path: `/api/v1/*`
- Background tasks: synchronous by default

**Sprint Structure:**
- S0: Environment Setup & Frontend Connection
- S1: Basic Auth (Signup/Login/Logout)
- S2: Player Profile Management
- S3: Game Stats Tracking
- S4: Training Sessions Tracking
- S5: Goals Management
- S6: AI Insights Generation
- S7: Share Links & Public Reports

---

## 2️⃣ IN-SCOPE & SUCCESS CRITERIA

**In-Scope Features:**
- User authentication (signup, login, logout, JWT tokens)
- Player profile CRUD operations
- Game stats CRUD operations
- Training sessions CRUD operations
- Goals CRUD operations
- AI-generated weekly/monthly summaries
- Share link generation and public report viewing
- Dashboard aggregations (averages, personal bests, activity scores)

**Success Criteria:**
- All frontend features functional end-to-end
- All task-level tests pass via UI
- Each sprint's code pushed to `main` after verification
- Frontend successfully connects to backend APIs
- Data persists across sessions and devices
- Share links work without authentication

---

## 3️⃣ API DESIGN

**Base Path:** `/api/v1`

**Error Envelope:** `{ "error": "message" }`

### Health Check
- **GET /healthz**
- Purpose: Verify backend and database connectivity
- Response: `{ "status": "ok", "database": "connected" }`

### Authentication
- **POST /api/v1/auth/signup**
- Purpose: Register new user
- Request: `{ "email": "string", "password": "string" }`
- Response: `{ "id": "string", "email": "string", "token": "string" }`

- **POST /api/v1/auth/login**
- Purpose: Authenticate user
- Request: `{ "email": "string", "password": "string" }`
- Response: `{ "id": "string", "email": "string", "token": "string" }`

- **POST /api/v1/auth/logout**
- Purpose: Invalidate session (client-side token removal)
- Response: `{ "message": "Logged out successfully" }`

- **GET /api/v1/auth/me**
- Purpose: Get current user info
- Response: `{ "id": "string", "email": "string", "createdAt": "ISO8601" }`

### Player Profile
- **POST /api/v1/profile**
- Purpose: Create player profile
- Request: `{ "name": "string", "team": "string", "position": "string", "ageGroup": "string", "sport": "string", ... }`
- Response: Profile object with `userId`, timestamps

- **GET /api/v1/profile**
- Purpose: Get current user's profile
- Response: Profile object or 404

- **PUT /api/v1/profile**
- Purpose: Update profile
- Request: Partial profile fields
- Response: Updated profile object

- **DELETE /api/v1/profile**
- Purpose: Delete profile and all user data
- Response: `{ "message": "Profile deleted" }`

### Game Stats
- **POST /api/v1/stats/games**
- Purpose: Log new game
- Request: `{ "date": "ISO8601", "opponent": "string", "points": number, "assists": number, ... }`
- Response: Game stat object with `id`, `userId`, timestamps

- **GET /api/v1/stats/games**
- Purpose: Get all user's games
- Response: `{ "games": [...] }`

- **GET /api/v1/stats/games/{id}**
- Purpose: Get specific game
- Response: Game stat object

- **PUT /api/v1/stats/games/{id}**
- Purpose: Update game stats
- Request: Partial game fields
- Response: Updated game object

- **DELETE /api/v1/stats/games/{id}**
- Purpose: Delete game
- Response: `{ "message": "Game deleted" }`

### Training Sessions
- **POST /api/v1/stats/training**
- Purpose: Log training session
- Request: `{ "date": "ISO8601", "drillType": "string", "metrics": {...}, "notes": "string" }`
- Response: Training session object

- **GET /api/v1/stats/training**
- Purpose: Get all user's training sessions
- Response: `{ "sessions": [...] }`

- **GET /api/v1/stats/training/{id}**
- Purpose: Get specific session
- Response: Training session object

- **PUT /api/v1/stats/training/{id}**
- Purpose: Update session
- Request: Partial session fields
- Response: Updated session object

- **DELETE /api/v1/stats/training/{id}**
- Purpose: Delete session
- Response: `{ "message": "Session deleted" }`

### Goals
- **POST /api/v1/goals**
- Purpose: Create goal
- Request: `{ "type": "weekly|monthly|seasonal", "category": "string", "title": "string", ... }`
- Response: Goal object

- **GET /api/v1/goals**
- Purpose: Get all user's goals
- Response: `{ "goals": [...] }`

- **GET /api/v1/goals/{id}**
- Purpose: Get specific goal
- Response: Goal object

- **PUT /api/v1/goals/{id}**
- Purpose: Update goal
- Request: Partial goal fields
- Response: Updated goal object

- **DELETE /api/v1/goals/{id}**
- Purpose: Delete goal
- Response: `{ "message": "Goal deleted" }`

### AI Insights
- **POST /api/v1/insights/generate**
- Purpose: Generate AI summary
- Request: `{ "period": "weekly|monthly" }`
- Response: AI summary object with insights, improvements, focus areas

- **GET /api/v1/insights**
- Purpose: Get all user's summaries
- Response: `{ "summaries": [...] }`

- **GET /api/v1/insights/{id}**
- Purpose: Get specific summary
- Response: AI summary object

### Share Links
- **POST /api/v1/share**
- Purpose: Generate share link
- Response: `{ "id": "string", "token": "string", "url": "string", ... }`

- **GET /api/v1/share**
- Purpose: Get all user's share links
- Response: `{ "links": [...] }`

- **DELETE /api/v1/share/{id}**
- Purpose: Revoke share link
- Response: `{ "message": "Link deleted" }`

- **GET /api/v1/report/{token}**
- Purpose: Get public report (no auth required)
- Response: `{ "profile": {...}, "games": [...], "sessions": [...], "goals": [...] }`

### Dashboard Aggregations
- **GET /api/v1/dashboard**
- Purpose: Get dashboard data
- Response: `{ "averages": {...}, "personalBest": {...}, "activityScore": number, "recentGames": [...] }`

---

## 4️⃣ DATA MODEL (MONGODB ATLAS)

### Collection: `users`
- `_id`: ObjectId (auto)
- `email`: string (required, unique, indexed)
- `password_hash`: string (required, Argon2)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "athlete@example.com",
  "password_hash": "$argon2id$v=19$m=65536...",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Collection: `profiles`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed, unique)
- `name`: string (required)
- `team`: string (required)
- `position`: string (required)
- `age_group`: string (required)
- `sport`: string (required)
- `height`: string (optional)
- `weight`: string (optional)
- `wingspan`: string (optional)
- `goals`: string (optional)
- `bio`: string (optional)
- `photo`: string (optional, URL)
- `photos`: array of strings (optional, URLs)
- `videos`: array of strings (optional, URLs)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user_id": "507f1f77bcf86cd799439011",
  "name": "Jordan Smith",
  "team": "Eagles Basketball",
  "position": "Point Guard",
  "age_group": "14",
  "sport": "Basketball",
  "height": "5'8\"",
  "weight": "145 lbs",
  "created_at": "2025-01-15T10:35:00Z",
  "updated_at": "2025-01-15T10:35:00Z"
}
```

### Collection: `game_stats`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed)
- `date`: datetime (required)
- `opponent`: string (required)
- `points`: int (required, default 0)
- `assists`: int (required, default 0)
- `rebounds`: int (required, default 0)
- `steals`: int (required, default 0)
- `blocks`: int (required, default 0)
- `turnovers`: int (required, default 0)
- `minutes`: int (required, default 0)
- `custom_stats`: dict (optional)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "user_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-14T18:00:00Z",
  "opponent": "Warriors",
  "points": 18,
  "assists": 5,
  "rebounds": 7,
  "steals": 3,
  "blocks": 1,
  "turnovers": 2,
  "minutes": 32,
  "created_at": "2025-01-15T10:40:00Z",
  "updated_at": "2025-01-15T10:40:00Z"
}
```

### Collection: `training_sessions`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed)
- `date`: datetime (required)
- `drill_type`: string (required)
- `metrics`: dict (required, flexible schema)
- `notes`: string (optional)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "user_id": "507f1f77bcf86cd799439011",
  "date": "2025-01-15T16:00:00Z",
  "drill_type": "Shooting",
  "metrics": {
    "free_throw_percentage": 85,
    "three_point_percentage": 42,
    "mid_range_percentage": 55
  },
  "notes": "Felt good today, consistent form",
  "created_at": "2025-01-15T17:00:00Z",
  "updated_at": "2025-01-15T17:00:00Z"
}
```

### Collection: `goals`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed)
- `type`: string (required, enum: weekly/monthly/seasonal)
- `category`: string (required)
- `title`: string (required)
- `description`: string (required)
- `target_value`: int (optional)
- `current_value`: int (optional)
- `metric`: string (optional)
- `start_date`: datetime (required)
- `end_date`: datetime (required)
- `status`: string (required, enum: active/completed/missed)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "user_id": "507f1f77bcf86cd799439011",
  "type": "weekly",
  "category": "performance",
  "title": "Average 15 PPG",
  "description": "Increase scoring average to 15 points per game",
  "target_value": 15,
  "current_value": 12,
  "metric": "points",
  "start_date": "2025-01-13T00:00:00Z",
  "end_date": "2025-01-20T00:00:00Z",
  "status": "active",
  "created_at": "2025-01-13T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### Collection: `ai_summaries`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed)
- `period`: string (required, enum: weekly/monthly)
- `start_date`: datetime (required)
- `end_date`: datetime (required)
- `insights`: array of strings (required)
- `improvements`: array of objects (required)
- `focus_areas`: array of strings (required)
- `motivational_message`: string (required)
- `created_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "user_id": "507f1f77bcf86cd799439011",
  "period": "weekly",
  "start_date": "2025-01-08T00:00:00Z",
  "end_date": "2025-01-15T00:00:00Z",
  "insights": ["You played 3 games this week", "You averaged 16.3 points per game"],
  "improvements": [
    {
      "metric": "Points Per Game",
      "change": 12,
      "description": "Your scoring improved by 12% this week!"
    }
  ],
  "focus_areas": ["Ball handling - work on reducing turnovers"],
  "motivational_message": "You're making great progress! Keep up the hard work.",
  "created_at": "2025-01-15T20:00:00Z"
}
```

### Collection: `share_links`
- `_id`: ObjectId (auto)
- `user_id`: ObjectId (required, indexed)
- `token`: string (required, unique, indexed)
- `player_name`: string (required)
- `view_count`: int (required, default 0)
- `last_viewed`: datetime (optional)
- `expires_at`: datetime (optional)
- `created_at`: datetime (required)

**Example:**
```json
{
  "_id": "507f1f77bcf86cd799439017",
  "user_id": "507f1f77bcf86cd799439011",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "player_name": "Jordan Smith",
  "view_count": 5,
  "last_viewed": "2025-01-15T14:30:00Z",
  "created_at": "2025-01-10T10:00:00Z"
}
```

---

## 5️⃣ FRONTEND AUDIT & FEATURE MAP

### Landing Page (`/`)
- **Route:** Landing.tsx
- **Purpose:** User authentication (login/signup)
- **Data Needed:** None initially
- **Backend Endpoints:** POST /api/v1/auth/signup, POST /api/v1/auth/login
- **Auth:** None (public)

### Profile Creation (`/profile/create`)
- **Route:** ProfileCreate.tsx
- **Purpose:** First-time profile setup
- **Data Needed:** User info from auth context
- **Backend Endpoints:** POST /api/v1/profile
- **Auth:** Required (JWT)

### Dashboard (`/dashboard`)
- **Route:** Dashboard.tsx
- **Purpose:** Overview of stats, activity, recent performance
- **Data Needed:** Games, training sessions, aggregated stats
- **Backend Endpoints:** GET /api/v1/dashboard, GET /api/v1/stats/games, GET /api/v1/stats/training
- **Auth:** Required (JWT)

### Game Stats (`/stats/games`)
- **Route:** GameStats.tsx
- **Purpose:** CRUD operations for game statistics
- **Data Needed:** All user's games
- **Backend Endpoints:** GET/POST/PUT/DELETE /api/v1/stats/games
- **Auth:** Required (JWT)

### Training Stats (`/stats/training`)
- **Route:** TrainingStats.tsx
- **Purpose:** CRUD operations for training sessions
- **Data Needed:** All user's training sessions
- **Backend Endpoints:** GET/POST/PUT/DELETE /api/v1/stats/training
- **Auth:** Required (JWT)

### Goals (`/goals`)
- **Route:** Goals.tsx
- **Purpose:** CRUD operations for goals
- **Data Needed:** All user's goals
- **Backend Endpoints:** GET/POST/PUT/DELETE /api/v1/goals
- **Auth:** Required (JWT)

### Profile (`/profile`)
- **Route:** Profile.tsx
- **Purpose:** View and edit player profile
- **Data Needed:** User profile, basic stats count
- **Backend Endpoints:** GET/PUT/DELETE /api/v1/profile
- **Auth:** Required (JWT)

### Insights (`/insights`)
- **Route:** Insights.tsx
- **Purpose:** Generate and view AI summaries
- **Data Needed:** AI summaries, games, training for charts
- **Backend Endpoints:** GET/POST /api/v1/insights
- **Auth:** Required (JWT)

### Share (`/share`)
- **Route:** Share.tsx
- **Purpose:** Generate and manage share links
- **Data Needed:** User's share links
- **Backend Endpoints:** GET/POST/DELETE /api/v1/share
- **Auth:** Required (JWT)

### Shared Report (`/report/:token`)
- **Route:** SharedReport.tsx
- **Purpose:** Public view of player progress
- **Data Needed:** Profile, games, sessions, goals for specific user
- **Backend Endpoints:** GET /api/v1/report/{token}
- **Auth:** None (public, token-based)

---

## 6️⃣ CONFIGURATION & ENV VARS

**Required Environment Variables:**
- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Token signing key (min 32 chars)
- `JWT_EXPIRES_IN` — Seconds before JWT expiry (default: 604800 = 7 days)
- `CORS_ORIGINS` — Allowed frontend URL(s) (comma-separated)

**Example `.env` file:**
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/elevate?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRES_IN=604800
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 7️⃣ BACKGROUND WORK

**AI Insights Generation:**
- Trigger: User clicks "Generate Weekly" or "Generate Monthly" button
- Purpose: Analyze games, training, goals to produce insights
- Implementation: Synchronous endpoint (POST /api/v1/insights/generate)
- Idempotency: Multiple summaries allowed for same period
- UI Check: Frontend receives summary immediately in response

**No background tasks required** — all operations complete synchronously within request/response cycle.

---

## 8️⃣ INTEGRATIONS

**No external integrations required for MVP.**

All AI insights are generated using rule-based logic (similar to frontend's `aiInsights.ts`), not external AI services.

---

## 9️⃣ TESTING STRATEGY (MANUAL VIA FRONTEND)

**Validation Method:** Manual testing through frontend UI only

**Per-Task Testing:**
- Every task includes Manual Test Step (exact UI action + expected result)
- Every task includes User Test Prompt (concise instruction)
- Test immediately after implementing each task
- Fix any failures before proceeding to next task

**Per-Sprint Testing:**
- After all tasks in sprint pass individual tests
- Verify sprint objectives met
- Commit and push to `main`

**If Any Test Fails:**
- Fix issue immediately
- Retest until passing
- Do not proceed until all tests pass

---

## 🔟 DYNAMIC SPRINT PLAN & BACKLOG

---

## 🧱 S0 – ENVIRONMENT SETUP & FRONTEND CONNECTION

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Connect to MongoDB Atlas using `MONGODB_URI`
- `/healthz` performs DB ping and returns JSON status
- Enable CORS for frontend
- Initialize Git at root, set default branch to `main`, push to GitHub
- Create single `.gitignore` at root

**User Stories:**
- As a developer, I need a working FastAPI backend that connects to MongoDB Atlas
- As a developer, I need CORS enabled so frontend can make API calls
- As a developer, I need version control set up on GitHub

**Tasks:**

### Task 1: Initialize FastAPI Project Structure
- Create `backend/` directory at project root
- Create `backend/main.py` with FastAPI app
- Create `backend/requirements.txt` with dependencies: `fastapi`, `uvicorn[standard]`, `motor`, `pydantic`, `pydantic-settings`, `python-dotenv`, `argon2-cffi`, `pyjwt`, `python-multipart`
- Create `backend/.env.example` with all required env vars
- Create `backend/config.py` for settings using Pydantic BaseSettings
- Manual Test Step: Run `pip install -r requirements.txt` → all packages install successfully
- User Test Prompt: "Install backend dependencies and confirm no errors"

### Task 2: Create Health Check Endpoint
- Implement `GET /healthz` endpoint in `main.py`
- Connect to MongoDB Atlas using Motor
- Perform database ping in health check
- Return `{ "status": "ok", "database": "connected" }` on success
- Return `{ "status": "error", "database": "disconnected" }` on failure
- Manual Test Step: Start backend with `uvicorn backend.main:app --reload`, visit `http://localhost:8000/healthz` → see `{"status": "ok", "database": "connected"}`
- User Test Prompt: "Start the backend and navigate to /healthz. Confirm database connection status shows 'connected'."

### Task 3: Enable CORS
- Add CORS middleware to FastAPI app
- Use `CORS_ORIGINS` from environment config
- Allow credentials, all methods, all headers
- Manual Test Step: Open browser console on frontend, make fetch to `http://localhost:8000/healthz` → no CORS errors
- User Test Prompt: "Open frontend dev tools, make a test API call to backend. Confirm no CORS errors appear."

### Task 4: Initialize Git Repository
- Run `git init` at project root (if not already initialized)
- Create `.gitignore` at root with: `__pycache__/`, `*.pyc`, `.env`, `.venv/`, `venv/`, `*.log`, `.DS_Store`
- Set default branch to `main`: `git branch -M main`
- Create initial commit with backend skeleton
- Create GitHub repository and push
- Manual Test Step: Run `git status` → see clean working tree, run `git log` → see initial commit
- User Test Prompt: "Check GitHub repository. Confirm backend code is pushed to main branch."

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` returns success with DB connection status
- CORS enabled for frontend origin
- Git repository initialized with `.gitignore`
- Code pushed to GitHub `main` branch

**Post-Sprint:** Commit and push to `main`

---

## 🧩 S1 – BASIC AUTH (SIGNUP / LOGIN / LOGOUT)

**Objectives:**
- Implement JWT-based signup, login, and logout
- Store users in MongoDB with Argon2 password hashing
- Protect one backend route + verify frontend auth flow works

**User Stories:**
- As an athlete, I can create an account with email and password
- As an athlete, I can log in and receive a JWT token
- As an athlete, I can log out and my session ends

**Endpoints:**
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

**Tasks:**

### Task 1: Create User Model and Database Schema
- Create `backend/models/user.py` with Pydantic User model
- Fields: `id`, `email`, `password_hash`, `created_at`, `updated_at`
- Create `backend/database.py` with Motor client and database connection
- Manual Test Step: Start backend → no errors, database connection established
- User Test Prompt: "Start backend and check logs. Confirm database connection successful."

### Task 2: Implement Signup Endpoint
- Create `backend/routers/auth.py` with signup route
- Validate email format and password length (min 8 chars)
- Hash password using Argon2
- Store user in `users` collection
- Return user object with JWT token
- Manual Test Step: Use frontend signup form → account created, redirected to profile creation
- User Test Prompt: "Create a new account via the signup form. Confirm success message and redirect to profile creation."

### Task 3: Implement Login Endpoint
- Create login route in `auth.py`
- Verify email exists and password matches (Argon2 verify)
- Generate JWT token with user ID and expiration
- Return user object with token
- Manual Test Step: Use frontend login form → successful login, redirected to dashboard or profile creation
- User Test Prompt: "Log in with your credentials. Confirm successful login and redirect."

### Task 4: Implement JWT Authentication Dependency
- Create `backend/dependencies/auth.py` with `get_current_user` dependency
- Verify JWT token from Authorization header
- Extract user ID from token
- Fetch user from database
- Raise 401 if token invalid or user not found
- Manual Test Step: Access protected route without token → 401 error, with valid token → success
- User Test Prompt: "Try accessing a protected page without logging in. Confirm redirect to login."

### Task 5: Implement Logout Endpoint
- Create logout route (client-side token removal, server returns success)
- Manual Test Step: Click logout in frontend → token cleared, redirected to landing page
- User Test Prompt: "Log out from the app. Confirm redirect to landing page and inability to access protected pages."

### Task 6: Implement Get Current User Endpoint
- Create `GET /api/v1/auth/me` route
- Use `get_current_user` dependency
- Return current user info (id, email, created_at)
- Manual Test Step: Log in, frontend calls `/auth/me` → receives user data
- User Test Prompt: "After logging in, check browser network tab. Confirm /auth/me returns your user data."

**Definition of Done:**
- Users can signup via frontend
- Users can login and receive JWT token
- Users can logout and session ends
- Protected routes require valid JWT
- Auth flow works end-to-end in frontend

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S2 – PLAYER PROFILE MANAGEMENT

**Objectives:**
- Implement profile CRUD operations
- Store profiles in MongoDB linked to user
- Enable profile creation, viewing, editing, and deletion

**User Stories:**
- As an athlete, I can create my player profile with personal info
- As an athlete, I can view and edit my profile
- As an athlete, I can delete my profile and all associated data

**Endpoints:**
- POST /api/v1/profile
- GET /api/v1/profile
- PUT /api/v1/profile
- DELETE /api/v1/profile

**Tasks:**

### Task 1: Create Profile Model
- Create `backend/models/profile.py` with Pydantic Profile model
- Fields: `id`, `user_id`, `name`, `team`, `position`, `age_group`, `sport`, `height`, `weight`, `wingspan`, `goals`, `bio`, `photo`, `photos`, `videos`, `created_at`, `updated_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Create Profile Endpoint
- Create `backend/routers/profile.py` with POST route
- Require authentication (use `get_current_user` dependency)
- Validate required fields: name, team, position, age_group, sport
- Check if profile already exists for user (return 400 if exists)
- Store profile in `profiles` collection
- Return created profile
- Manual Test Step: Complete profile creation form in frontend → profile created, redirected to dashboard
- User Test Prompt: "After signup, create your player profile. Confirm success and redirect to dashboard."

### Task 3: Implement Get Profile Endpoint
- Create GET route in `profile.py`
- Require authentication
- Fetch profile for current user from database
- Return 404 if profile doesn't exist
- Return profile object if found
- Manual Test Step: Navigate to profile page → see your profile data displayed
- User Test Prompt: "Go to your profile page. Confirm all your information displays correctly."

### Task 4: Implement Update Profile Endpoint
- Create PUT route in `profile.py`
- Require authentication
- Accept partial profile updates
- Update `updated_at` timestamp
- Return updated profile
- Manual Test Step: Edit profile via frontend → changes saved and displayed immediately
- User Test Prompt: "Edit your profile information and save. Confirm changes appear immediately."

### Task 5: Implement Delete Profile Endpoint
- Create DELETE route in `profile.py`
- Require authentication
- Delete profile from database
- Also delete all user's games, training sessions, goals, summaries, share links
- Return success message
- Manual Test Step: Delete account via profile page → confirmation dialog, account deleted, redirected to landing
- User Test Prompt: "Delete your account from the profile page. Confirm deletion and redirect to landing page."

**Definition of Done:**
- Athletes can create profiles via frontend
- Athletes can view their profile
- Athletes can edit profile information
- Athletes can delete profile and all data
- Profile operations work end-to-end

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S3 – GAME STATS TRACKING

**Objectives:**
- Implement game stats CRUD operations
- Store game stats in MongoDB linked to user
- Enable logging, viewing, editing, and deleting games

**User Stories:**
- As an athlete, I can log game statistics
- As an athlete, I can view all my games
- As an athlete, I can edit game stats
- As an athlete, I can delete games

**Endpoints:**
- POST /api/v1/stats/games
- GET /api/v1/stats/games
- GET /api/v1/stats/games/{id}
- PUT /api/v1/stats/games/{id}
- DELETE /api/v1/stats/games/{id}

**Tasks:**

### Task 1: Create Game Stats Model
- Create `backend/models/game_stat.py` with Pydantic GameStat model
- Fields: `id`, `user_
id`, `date`, `opponent`, `points`, `assists`, `rebounds`, `steals`, `blocks`, `turnovers`, `minutes`, `custom_stats`, `created_at`, `updated_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Create Game Stats Endpoint
- Create `backend/routers/game_stats.py` with POST route
- Require authentication
- Validate required fields: date, opponent, all stat fields
- Store game in `game_stats` collection
- Return created game object
- Manual Test Step: Log a game via frontend → game created, appears in game list
- User Test Prompt: "Log your first game with stats. Confirm it appears in your game history."

### Task 3: Implement Get All Games Endpoint
- Create GET route for all games
- Require authentication
- Fetch all games for current user
- Sort by date descending
- Return games array
- Manual Test Step: Navigate to game stats page → see all logged games
- User Test Prompt: "Go to game stats page. Confirm all your games are listed."

### Task 4: Implement Get Single Game Endpoint
- Create GET route for specific game by ID
- Require authentication
- Verify game belongs to current user (403 if not)
- Return game object or 404
- Manual Test Step: Click on a game in frontend → game details load
- User Test Prompt: "Click on a game to view details. Confirm data loads correctly."

### Task 5: Implement Update Game Stats Endpoint
- Create PUT route for game by ID
- Require authentication
- Verify game belongs to current user
- Accept partial updates
- Update `updated_at` timestamp
- Return updated game
- Manual Test Step: Edit a game via frontend → changes saved and displayed
- User Test Prompt: "Edit a game's stats and save. Confirm changes appear immediately."

### Task 6: Implement Delete Game Endpoint
- Create DELETE route for game by ID
- Require authentication
- Verify game belongs to current user
- Delete game from database
- Return success message
- Manual Test Step: Delete a game via frontend → confirmation dialog, game removed from list
- User Test Prompt: "Delete a game. Confirm deletion after confirmation dialog."

**Definition of Done:**
- Athletes can log games via frontend
- Athletes can view all their games
- Athletes can edit game stats
- Athletes can delete games
- Game stats operations work end-to-end
- Dashboard shows correct game averages

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S4 – TRAINING SESSIONS TRACKING

**Objectives:**
- Implement training sessions CRUD operations
- Store training sessions in MongoDB linked to user
- Enable logging, viewing, editing, and deleting sessions

**User Stories:**
- As an athlete, I can log training sessions with drill metrics
- As an athlete, I can view all my training sessions
- As an athlete, I can edit session data
- As an athlete, I can delete sessions

**Endpoints:**
- POST /api/v1/stats/training
- GET /api/v1/stats/training
- GET /api/v1/stats/training/{id}
- PUT /api/v1/stats/training/{id}
- DELETE /api/v1/stats/training/{id}

**Tasks:**

### Task 1: Create Training Session Model
- Create `backend/models/training_session.py` with Pydantic TrainingSession model
- Fields: `id`, `user_id`, `date`, `drill_type`, `metrics` (dict), `notes`, `created_at`, `updated_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Create Training Session Endpoint
- Create `backend/routers/training.py` with POST route
- Require authentication
- Validate required fields: date, drill_type, metrics
- Store session in `training_sessions` collection
- Return created session object
- Manual Test Step: Log a training session via frontend → session created, appears in list
- User Test Prompt: "Log your first training session. Confirm it appears in training history."

### Task 3: Implement Get All Sessions Endpoint
- Create GET route for all sessions
- Require authentication
- Fetch all sessions for current user
- Sort by date descending
- Return sessions array
- Manual Test Step: Navigate to training stats page → see all logged sessions
- User Test Prompt: "Go to training stats page. Confirm all your sessions are listed."

### Task 4: Implement Get Single Session Endpoint
- Create GET route for specific session by ID
- Require authentication
- Verify session belongs to current user
- Return session object or 404
- Manual Test Step: Click on a session in frontend → session details load
- User Test Prompt: "Click on a session to view details. Confirm data loads correctly."

### Task 5: Implement Update Session Endpoint
- Create PUT route for session by ID
- Require authentication
- Verify session belongs to current user
- Accept partial updates
- Update `updated_at` timestamp
- Return updated session
- Manual Test Step: Edit a session via frontend → changes saved and displayed
- User Test Prompt: "Edit a training session and save. Confirm changes appear immediately."

### Task 6: Implement Delete Session Endpoint
- Create DELETE route for session by ID
- Require authentication
- Verify session belongs to current user
- Delete session from database
- Return success message
- Manual Test Step: Delete a session via frontend → confirmation dialog, session removed
- User Test Prompt: "Delete a training session. Confirm deletion after confirmation dialog."

**Definition of Done:**
- Athletes can log training sessions via frontend
- Athletes can view all their sessions
- Athletes can edit session data
- Athletes can delete sessions
- Training operations work end-to-end
- Dashboard shows correct training count

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S5 – GOALS MANAGEMENT

**Objectives:**
- Implement goals CRUD operations
- Store goals in MongoDB linked to user
- Enable creating, viewing, editing, and deleting goals
- Support goal status updates (active/completed/missed)

**User Stories:**
- As an athlete, I can create performance goals
- As an athlete, I can view all my goals
- As an athlete, I can edit goals
- As an athlete, I can mark goals as completed
- As an athlete, I can delete goals

**Endpoints:**
- POST /api/v1/goals
- GET /api/v1/goals
- GET /api/v1/goals/{id}
- PUT /api/v1/goals/{id}
- DELETE /api/v1/goals/{id}

**Tasks:**

### Task 1: Create Goal Model
- Create `backend/models/goal.py` with Pydantic Goal model
- Fields: `id`, `user_id`, `type`, `category`, `title`, `description`, `target_value`, `current_value`, `metric`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Create Goal Endpoint
- Create `backend/routers/goals.py` with POST route
- Require authentication
- Validate required fields: type, category, title, description, start_date, end_date
- Default status to "active"
- Store goal in `goals` collection
- Return created goal object
- Manual Test Step: Create a goal via frontend → goal created, appears in goals list
- User Test Prompt: "Create your first goal. Confirm it appears in the goals page."

### Task 3: Implement Get All Goals Endpoint
- Create GET route for all goals
- Require authentication
- Fetch all goals for current user
- Sort by created_at descending
- Return goals array
- Manual Test Step: Navigate to goals page → see all created goals
- User Test Prompt: "Go to goals page. Confirm all your goals are listed."

### Task 4: Implement Get Single Goal Endpoint
- Create GET route for specific goal by ID
- Require authentication
- Verify goal belongs to current user
- Return goal object or 404
- Manual Test Step: Click on a goal in frontend → goal details load
- User Test Prompt: "Click on a goal to view details. Confirm data loads correctly."

### Task 5: Implement Update Goal Endpoint
- Create PUT route for goal by ID
- Require authentication
- Verify goal belongs to current user
- Accept partial updates (including status changes)
- Update `updated_at` timestamp
- Return updated goal
- Manual Test Step: Edit a goal or mark as completed via frontend → changes saved
- User Test Prompt: "Edit a goal or mark it complete. Confirm changes appear immediately."

### Task 6: Implement Delete Goal Endpoint
- Create DELETE route for goal by ID
- Require authentication
- Verify goal belongs to current user
- Delete goal from database
- Return success message
- Manual Test Step: Delete a goal via frontend → confirmation dialog, goal removed
- User Test Prompt: "Delete a goal. Confirm deletion after confirmation dialog."

**Definition of Done:**
- Athletes can create goals via frontend
- Athletes can view all their goals
- Athletes can edit goals
- Athletes can mark goals as completed
- Athletes can delete goals
- Goals operations work end-to-end
- Dashboard shows correct active goals count

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S6 – AI INSIGHTS GENERATION

**Objectives:**
- Implement AI insights generation endpoint
- Analyze user's games, training, and goals
- Generate weekly/monthly summaries with insights, improvements, focus areas
- Store summaries in MongoDB
- Enable viewing historical summaries

**User Stories:**
- As an athlete, I can generate AI-powered weekly summaries
- As an athlete, I can generate AI-powered monthly summaries
- As an athlete, I can view all my past summaries
- As an athlete, I can see performance trends and recommendations

**Endpoints:**
- POST /api/v1/insights/generate
- GET /api/v1/insights
- GET /api/v1/insights/{id}

**Tasks:**

### Task 1: Create AI Summary Model
- Create `backend/models/ai_summary.py` with Pydantic AISummary model
- Fields: `id`, `user_id`, `period`, `start_date`, `end_date`, `insights`, `improvements`, `focus_areas`, `motivational_message`, `created_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Insights Generation Logic
- Create `backend/services/insights.py` with `generate_insights` function
- Accept games, sessions, goals, and period (weekly/monthly)
- Calculate improvements (points, shooting percentages, etc.)
- Generate insights based on activity
- Identify focus areas based on weaknesses
- Create motivational message
- Return insights object
- Manual Test Step: Call function with test data → returns valid insights object
- User Test Prompt: "Test insights generation with sample data. Confirm output structure is correct."

### Task 3: Implement Generate Insights Endpoint
- Create `backend/routers/insights.py` with POST route
- Require authentication
- Accept period parameter (weekly/monthly)
- Fetch user's games, sessions, goals
- Filter by period date range
- Call insights generation service
- Store summary in `ai_summaries` collection
- Return created summary
- Manual Test Step: Click "Generate Weekly" in frontend → summary created and displayed
- User Test Prompt: "Generate a weekly summary. Confirm insights appear with your data."

### Task 4: Implement Get All Summaries Endpoint
- Create GET route for all summaries
- Require authentication
- Fetch all summaries for current user
- Sort by created_at descending
- Return summaries array
- Manual Test Step: Navigate to insights page → see all generated summaries
- User Test Prompt: "Go to insights page. Confirm all your summaries are listed."

### Task 5: Implement Get Single Summary Endpoint
- Create GET route for specific summary by ID
- Require authentication
- Verify summary belongs to current user
- Return summary object or 404
- Manual Test Step: Click on a summary in frontend → summary details load with charts
- User Test Prompt: "Click on a summary to view details. Confirm charts and insights display."

**Definition of Done:**
- Athletes can generate weekly summaries via frontend
- Athletes can generate monthly summaries via frontend
- Athletes can view all their summaries
- Summaries show insights, improvements, focus areas
- Insights generation works end-to-end
- Charts display correctly with summary data

**Post-Sprint:** Commit and push to `main`

---

## 🧱 S7 – SHARE LINKS & PUBLIC REPORTS

**Objectives:**
- Implement share link generation
- Store share links in MongoDB
- Enable public report viewing without authentication
- Track view counts and last viewed timestamps
- Enable share link deletion (revocation)

**User Stories:**
- As an athlete, I can generate shareable links
- As an athlete, I can view all my active share links
- As an athlete, I can delete share links to revoke access
- As a parent/coach, I can view an athlete's report via share link without login

**Endpoints:**
- POST /api/v1/share
- GET /api/v1/share
- DELETE /api/v1/share/{id}
- GET /api/v1/report/{token}

**Tasks:**

### Task 1: Create Share Link Model
- Create `backend/models/share_link.py` with Pydantic ShareLink model
- Fields: `id`, `user_id`, `token`, `player_name`, `view_count`, `last_viewed`, `expires_at`, `created_at`
- Manual Test Step: Import model in Python shell → no errors
- User Test Prompt: "Start backend and check logs. Confirm no model import errors."

### Task 2: Implement Create Share Link Endpoint
- Create `backend/routers/share.py` with POST route
- Require authentication
- Generate unique token (UUID)
- Fetch user's profile to get player name
- Store share link in `share_links` collection
- Return created link with full URL
- Manual Test Step: Click "Create Share Link" in frontend → link created and displayed
- User Test Prompt: "Create a share link. Confirm link appears in your share links list."

### Task 3: Implement Get All Share Links Endpoint
- Create GET route for all share links
- Require authentication
- Fetch all links for current user
- Sort by created_at descending
- Return links array
- Manual Test Step: Navigate to share page → see all created links
- User Test Prompt: "Go to share page. Confirm all your share links are listed."

### Task 4: Implement Delete Share Link Endpoint
- Create DELETE route for link by ID
- Require authentication
- Verify link belongs to current user
- Delete link from database
- Return success message
- Manual Test Step: Delete a share link via frontend → confirmation dialog, link removed
- User Test Prompt: "Delete a share link. Confirm deletion and link becomes inactive."

### Task 5: Implement Public Report Endpoint
- Create GET route for `/api/v1/report/{token}` (no auth required)
- Find share link by token
- Return 404 if token invalid
- Increment view_count and update last_viewed
- Fetch user's profile, games, sessions, goals
- Return public report data
- Manual Test Step: Open share link in incognito window → report displays without login
- User Test Prompt: "Open a share link in a private/incognito window. Confirm report displays without requiring login."

### Task 6: Update Frontend API URLs
- Update frontend to use backend API endpoints instead of localStorage
- Replace all localStorage calls with API calls
- Update AuthContext to use real auth endpoints
- Update all pages to fetch data from backend
- Manual Test Step: Use entire app → all features work with backend data
- User Test Prompt: "Use all app features (create profile, log games, create goals, generate insights, share). Confirm everything works end-to-end."

**Definition of Done:**
- Athletes can generate share links via frontend
- Athletes can view all their share links
- Athletes can delete share links
- Share links work in incognito/private browsing
- Public reports display without authentication
- View counts increment correctly
- Frontend fully integrated with backend
- All features work end-to-end

**Post-Sprint:** Commit and push to `main`

---

## ✅ FINAL VERIFICATION

After completing all sprints, perform comprehensive end-to-end testing:

1. **Authentication Flow:**
   - Sign up new account → success
   - Log in → success
   - Access protected routes → works
   - Log out → redirects to landing

2. **Profile Management:**
   - Create profile → success
   - View profile → displays correctly
   - Edit profile → changes persist
   - Delete account → all data removed

3. **Game Stats:**
   - Log multiple games → all saved
   - View game list → sorted correctly
   - Edit game → changes persist
   - Delete game → removed from list
   - Dashboard shows correct averages

4. **Training Sessions:**
   - Log multiple sessions → all saved
   - View session list → sorted correctly
   - Edit session → changes persist
   - Delete session → removed from list
   - Dashboard shows correct count

5. **Goals:**
   - Create multiple goals → all saved
   - View goals list → sorted correctly
   - Mark goal complete → status updates
   - Edit goal → changes persist
   - Delete goal → removed from list

6. **AI Insights:**
   - Generate weekly summary → insights appear
   - Generate monthly summary → insights appear
   - View summaries list → all displayed
   - Charts render correctly with data

7. **Share Links:**
   - Create share link → link generated
   - Copy link → works
   - Open in incognito → report displays
   - View count increments
   - Delete link → becomes inactive

8. **Multi-Device:**
   - Log in on different browser → same data
   - Make changes on one device → reflects on other

**Success Criteria Met:**
- ✅ All frontend features functional end-to-end
- ✅ All task-level tests passed via UI
- ✅ All sprint code pushed to `main`
- ✅ Frontend successfully connected to backend APIs
- ✅ Data persists across sessions and devices
- ✅ Share links work without authentication

---

## 📋 APPENDIX: QUICK REFERENCE

### Project Structure
```
/
├── frontend/              # React + Vite frontend
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Settings and environment
│   ├── database.py       # MongoDB connection
│   ├── models/           # Pydantic models
│   ├── routers/          # API route handlers
│   ├── services/         # Business logic
│   ├── dependencies/     # Auth and other dependencies
│   ├── requirements.txt  # Python dependencies
│   └── .env             # Environment variables
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

### Running the Application
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

### Environment Variables Template
```env
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/elevate
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRES_IN=604800
CORS_ORIGINS=http://localhost:5173
```

### Key Technologies
- **Backend:** FastAPI, Motor (async MongoDB), Pydantic v2, Argon2, PyJWT
- **Database:** MongoDB Atlas
- **Auth:** JWT tokens with Argon2 password hashing
- **Frontend:** React, TypeScript, Vite, TanStack Query

---

**END OF BACKEND DEVELOPMENT PLAN**
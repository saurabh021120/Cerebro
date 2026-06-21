# 🧠 Cerebro — AI-Powered Learning Platform

> Generate personalized, structured courses on any topic in seconds, powered by Google Gemini.

---

## ✨ Features

| Feature | Description |
|---|---|
| **AI Course Generation** | Two-phase Gemini pipeline generates a full course — outline first, then detailed module content in parallel |
| **Structured Curriculum** | Every course includes modules, lessons (400-600 words each in Markdown), and per-module quizzes |
| **AI Tutor Chat** | Context-aware tutor powered by Gemini 2.5 Flash — asks follow-up questions and references lesson content |
| **AI Interview Prep** | Start topic-based mock interview sessions with adaptive questioning *(in development)* |
| **Progress Tracking** | Tracks lesson completion and quiz scores per course |
| **Resource Validation** | Filters hallucinated/placeholder URLs before saving; validates against trusted domains |
| **Admin Dashboard** | Separate `CerebroAdmin` panel for event tracking, issue management, and analytics |

---

## 🏗️ Architecture

```
LearnAI/
├── backend/                  # FastAPI + PostgreSQL backend (Cerebro API)
│   ├── app/
│   │   ├── api/routes/       # REST route handlers
│   │   │   ├── course_routes.py
│   │   │   ├── chat_routes.py
│   │   │   ├── quiz_routes.py
│   │   │   ├── interview_routes.py
│   │   │   └── progress_routes.py
│   │   ├── services/         # Business logic
│   │   │   ├── ai_service.py          # Two-phase Gemini course generation
│   │   │   ├── course_service.py      # Course CRUD
│   │   │   ├── tutor_service.py       # AI tutor chat
│   │   │   ├── quiz_service.py        # Quiz handling
│   │   │   ├── progress_service.py    # Progress tracking
│   │   │   ├── interview_service.py   # Interview sessions
│   │   │   └── resource_validator.py  # URL validation
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── dto/              # Pydantic request/response schemas
│   │   ├── config/           # App settings (env vars)
│   │   └── database/         # Async DB engine & session
│   ├── server.py             # Uvicorn entry point
│   └── requirements.txt
├── frontend/                 # React 18 frontend
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── CreateCourse.jsx
│       │   ├── MyCourses.jsx
│       │   ├── CourseDashboard.jsx
│       │   ├── LessonView.jsx
│       │   ├── QuizPage.jsx
│       │   ├── AITutor.jsx
│       │   └── AIInterview.jsx
│       └── components/
└── CerebroAdmin/             # Separate admin dashboard
    ├── backend/              # FastAPI admin API
    └── frontend/             # React admin UI
```

---

## 🤖 How Course Generation Works

Cerebro uses a **two-phase Gemini pipeline** to avoid truncated content and hallucinated URLs:

```
Phase 1 — Outline (1 fast call)
  └─► Course title, description, difficulty
      └─► N module stubs (title + lesson titles only)

Phase 2 — Module Content (N parallel calls)
  └─► Full Markdown lesson content (400-600 words each)
  └─► Search queries (article_query + video_query) — NOT raw URLs
  └─► 4-6 quiz questions per module
```

> **Why search queries instead of URLs?** Gemini hallucinates URLs. Instead, the model generates precise Google/YouTube search queries per lesson, which are then resolved to real URLs via SerpAPI / YouTube Data API v3.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Google Gemini API key

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
```

Create a `.env` file inside `backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/cerebro
CORS_ORIGINS=["http://localhost:3000"]
```

```bash
# 5. Start the server
uvicorn server:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
```

Create a `.env` file inside `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8000
```

```bash
# 4. Start the development server
npm start
```

The app will be available at `http://localhost:3000`.

---

### CerebroAdmin Setup

```bash
# Backend
cd CerebroAdmin/backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# Frontend (separate terminal)
cd CerebroAdmin/frontend
npm install && npm start
```

Admin panel: `http://localhost:3001`

---

## 📡 API Reference

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/courses` | Generate a new AI course |
| `GET` | `/api/courses` | List all courses |
| `GET` | `/api/courses/{id}` | Get course details |
| `DELETE` | `/api/courses/{id}` | Delete a course |

### Chat / AI Tutor
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send a message to the AI tutor |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/quiz/submit` | Submit quiz answers |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/progress/{course_id}` | Get course progress |
| `POST` | `/api/progress/{course_id}/lesson` | Mark lesson complete |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interview/start` | Start a mock interview session |
| `POST` | `/api/interview/respond` | Submit an answer |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status |
| `GET` | `/health` | Health check |

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.110 |
| AI | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| ORM | SQLAlchemy 2.0 (async) |
| Database | PostgreSQL + asyncpg |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Server | Uvicorn |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Routing | React Router v6 |
| UI Components | Radix UI primitives + shadcn/ui |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Charts | Recharts |
| Icons | Lucide React |

---

## ⚙️ Course Creation Request

```json
POST /api/courses
{
  "topic": "FastAPI",
  "goal": "Build and deploy production REST APIs",
  "duration_weeks": 4,
  "additional_info": "Focus on async patterns and PostgreSQL"
}
```

**Response:** A fully structured course with modules, lessons (Markdown content), curated resource links, and quizzes — ready to learn from immediately.

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `DATABASE_URL` | ✅ | PostgreSQL async connection string |
| `CORS_ORIGINS` | ✅ | JSON array of allowed frontend origins |

---

## 📋 Roadmap

- [x] Two-phase AI course generation
- [x] Per-module parallel content generation
- [x] Resource URL validation
- [x] AI Tutor chat with course context
- [x] Quiz system with scoring
- [x] Progress tracking
- [x] Admin analytics dashboard
- [ ] AI Interview module (in progress)
- [ ] SerpAPI / YouTube Data API integration for verified resource URLs
- [ ] User authentication & multi-user support
- [ ] Course sharing & export (PDF)

---

## 📄 License
Cerebro AI

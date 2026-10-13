# LUMEN AI INTERVIEW — THE INTERVIEW INTELLIGENCE STUDIO

A premium full-stack mock interview platform engineered for software developers, data scientists, and machine learning engineers. Lumen delivers personalized AI-powered mock interview sessions, resume-informed questioning, structured weighted rubric evaluations, and persistent MySQL analytics.

---

## Architecture Overview

```
lumen-ai-interview/
├── src/                          # React 19 + TypeScript + Tailwind CSS Frontend
│   ├── components/               # Cockpit, Editor, Widgets, ScoreRing, Modals
│   ├── context/                  # AuthContext (JWT & profile management)
│   ├── pages/                    # Landing, Auth, Dashboard, Cockpit, Results, History, Resumes, Settings
│   ├── services/                 # Centralized API client (api.ts)
│   └── types/                    # Domain models & rubric contracts
├── server/                       # Node.js + Express Backend
│   ├── config/                   # Environment & secret configuration
│   ├── controllers/              # Auth, Profile, Resume, Interview, Analytics
│   ├── db/                       # MySQL 8 adapter & persistent relational engine
│   ├── middleware/               # JWT authentication & Multer PDF upload validation
│   ├── routes/                   # REST API routes
│   └── services/                 # Gemini 3.8 Flash SDK & PDF resume parser
├── database/
│   ├── schema.sql                # MySQL 8 relational schema (6 core tables)
│   ├── seed.sql                  # Initial SQL demo candidates & question pool
│   └── seed.json                 # Curated multi-role interview question blueprint
├── tests/
│   └── api.test.ts               # Automated end-to-end integration test suite
└── server.ts                     # Full-stack server entry point (Vite middlewares in dev)
```

---

## Core Features

1. **Practice Progress Widget**: Real-time dual-arc ring chart tracking completed vs. in-progress interview sessions on the Dashboard.
2. **AI Question Generation**: Uses Google Gemini 3.8 Flash (`@google/genai`) to generate role-specific questions across Junior, Mid, and Staff/Principal difficulties.
3. **Resume Skill Extraction**: Upload PDF resumes with magic-byte validation (`%PDF-`) to extract technical competencies and customize question prompts.
4. **Weighted Rubric Evaluations**:
   - **Relevance (40%)**: Directly addresses core engineering challenges.
   - **Technical Accuracy (30%)**: Correctness of algorithms, APIs, and concurrency models.
   - **Structure & Clarity (20%)**: Organization and STAR-method articulation.
   - **Supporting Evidence (10%)**: Production benchmarks and concrete edge-case trade-offs.
5. **Interactive Interview Cockpit**: Distraction-free answering arena with live character/word count, question jumping, and auto-save.
6. **Persistent Relational Database**: Connects to MySQL 8 via connection pooling or operates seamlessly with the embedded ACID relational store.
7. **Score Trajectory & Analytics**: Live trajectory graphs, rubric averages, and session audits.

---

## MySQL 8 Database Schema

The database model consists of 6 relational tables:

- **`users`**: Candidate accounts with bcrypt password hashes and target roles.
- **`resume_profiles`**: Parsed PDF metadata, raw text, and JSON skill arrays.
- **`interviews`**: Session instances with difficulty, question count, and status flags (`created`, `in_progress`, `completed`).
- **`questions`**: Ordered question prompts, topic tags, and expected key concepts.
- **`answers`**: Candidate responses timestamped per question.
- **`results`**: Evaluated scores, key strengths, missing concepts, and benchmark model answers.

Initialize the MySQL database:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here

# MySQL Configuration (Optional: uses persistent relational engine if not set)
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=lumen_user
MYSQL_PASSWORD=lumen_password
MYSQL_DATABASE=lumen_ai_interview
```

---

## Local Development & Execution

```bash
# Install dependencies
npm install

# Run automated integration tests (11 passing tests)
npm test

# Launch development server
npm run dev

# Build for production
npm run build
npm start
```

---

## Automated Verification

The test suite in `tests/api.test.ts` validates:
- User registration and password hashing
- Profile updates
- PDF resume magic-byte filtering and skill extraction
- AI question generation and fallback pool integrity
- Interview creation and MySQL question persistence
- Answer saving and upsert mechanics
- Mathematical 40/30/20/10 weighted score formula compliance
- Dashboard SQL analytics aggregation
- Cross-user privacy isolation

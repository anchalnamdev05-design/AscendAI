# AscendAI
AI-Powered Resume Analyzer & Career Roadmap Generator

**Prepare Smarter. Interview Better. Get Hired.**

## Stack
- Frontend: React + Vite, React Router, Axios, Context API, Lucide React, SCSS
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer, pdf-parse, Zod
- AI: Groq API (configured in backend `.env`, default model `llama-3.3-70b-versatile`)

## Run locally

### 1. Backend
```powershell
cd backend
npm install
npm run dev
```
Keep your existing `backend/.env` with `GROQ_API_KEY`, `MONGO_URI`, and `JWT_SECRET`.
Backend health check: http://localhost:5000/api/health

### 2. Frontend (open a second terminal)
```powershell
cd frontend
npm install
# Optional: copy .env.example to .env if you want to change the API URL
npm run dev
```
Frontend: http://localhost:5173

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Phase progress
- [x] Phase 1: Project setup (React + Vite, Express, dependencies)
- [x] Phase 2: Backend (MongoDB, auth, JWT, PDF parsing, Groq AI, reports, stats)
- [x] Phase 3: Frontend pages and API integration
- [ ] Phase 4: End-to-end integration testing with your real Atlas/Groq credentials
- [ ] Phase 5: UI polish based on your local screenshots/feedback
- [ ] Phase 6: Deployment and final verification

## Frontend routes
- `/` Landing page
- `/login` Login
- `/register` Register
- `/app` Dashboard (protected)
- `/app/analyze` Resume + job description analysis (protected)
- `/app/reports` Report history (protected)
- `/app/reports/:id` Full AI report (protected)
- `/app/profile` Profile and password settings (protected)

## Backend APIs used by the frontend
Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`

Interview:
- `POST /api/interviews/analyze` (multipart fields: `resume`, `jobDescription`, `jobRole`, `experience`)
- `GET /api/interviews/stats`
- `GET /api/interviews/reports?q=&page=&limit=`
- `GET /api/interviews/reports/:id`
- `DELETE /api/interviews/reports/:id`

## Notes
- The Groq API key stays only in `backend/.env`; never put it in frontend variables.
- PDF uploads are sent as multipart form data. The backend validates and extracts text.
- The frontend stores the JWT in localStorage and sends it as `Authorization: Bearer <token>`.
- Do not upload `.env` files or real credentials to GitHub.
- Dashboard statistics and reports are fetched from MongoDB-backed APIs; the frontend does not substitute demo stats.


## Phase 5 — AI Resume Builder

Added authenticated resume CRUD APIs at `/api/resumes`, scratch resume creation, PDF resume extraction + Groq-powered improvement, job-description tailoring, modern ATS live preview, saved drafts, and browser PDF/Print export. Existing Phase 1–4 routes remain in place.

Frontend route: `/app/resume-builder`. Backend uses the existing `GROQ_API_KEY` and `GROQ_MODEL` environment variables. No new secrets are required. PDF upload is limited to text-based PDFs up to 5 MB. Browser print dialog can save the preview as PDF. Review AI output before saving or sending; it is instructed not to invent candidate facts.

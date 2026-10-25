# InternTrack

InternTrack is a full-stack internship application tracker. Users can create an account, manage their own internship applications, and use a simple AI Job-Fit Assistant to compare saved resume notes with a job description.

## Live demo

- App: https://interntrack-umber.vercel.app
- API docs: https://interntrack-gbx7.onrender.com/docs

> The backend uses Render’s free tier, so the first request after inactivity can take around a minute while the server wakes up.

### Test accounts

- Email: `tom@email.com`  
  Password: `Tom@1234`

- Email: `alice@email.com`  
  Password: `Alice@1234`

## Features

- User registration and login
- JWT-based authentication
- Users can only view and manage their own applications
- Add, edit, delete, and track internship applications
- Filter applications by status
- Dashboard showing total, applied, interview, offer, and rejected applications
- Save resume or profile notes
- AI Job-Fit Assistant for comparing a job description with saved resume notes

## Tech stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- `fetch()` for API calls

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- PyJWT
- bcrypt
- Google Gemini API

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

## AI Job-Fit Assistant

The Job-Fit Assistant is a small RAG-based feature.

A user can save notes from their resume, such as skills, projects, coursework, or experience. Then they can paste a job description to get a match score, strengths, missing skills, and improvement suggestions.

The flow is kept simple:

1. The user saves resume or profile notes.
2. The backend splits saved notes into smaller chunks.
3. Gemini embeddings are created for the job description and note chunks.
4. Cosine similarity is used to find the most relevant note chunks.
5. The relevant chunks and job description are sent to Gemini.
6. Gemini returns a match score and suggestions, which are shown in the React UI.

This project does not use a vector database or a large RAG framework. It uses a simple in-memory similarity comparison, which is easier to understand and suitable for a small project.

## Project structure

```text
InternTrack/
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── simple_rag.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ApplicationForm.jsx
│   │   ├── JobFitAssistant.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
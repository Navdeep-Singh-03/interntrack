# InternTrack

InternTrack is a simple full-stack internship application tracker. Each user can create an account, log in, and manage only their own applications.

## Live demo

- App: https://interntrack-umber.vercel.app
- API docs: https://interntrack-gbx7.onrender.com/docs

The backend runs on Render's free plan, so the first request after a period of inactivity can take about 50 seconds while the server wakes up.

Demo accounts (sample data, created for this demo):

| Name  | Email           | Password   |
|-------|-----------------|------------|
| Tom   | tom@email.com   | Tom@1234   |
| Alice | alice@email.com | Alice@1234 |

You can also sign up with your own account.

## Technology

- Backend: FastAPI, SQLAlchemy, PostgreSQL, psycopg 3, Pydantic, PyJWT, bcrypt
- Frontend: React, Vite, JavaScript, CSS, fetch()

## Structure

```text
interntrack/
├── backend/       # FastAPI app and PostgreSQL models
├── frontend/      # React app
└── README.md
```

## Deployment

- Frontend: Vercel
- Backend: Render (FastAPI + Uvicorn)
- Database: Neon (PostgreSQL)

Backend environment variables: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `FRONTEND_URL`

Frontend environment variable: `VITE_API_BASE_URL`

## Run locally

### 1. PostgreSQL setup

Create a database named `interntrack`:

```sql
CREATE DATABASE interntrack;
```

In `backend`, copy `.env.example` to `.env` and set your PostgreSQL password plus a long random `SECRET_KEY`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/interntrack
SECRET_KEY=a-long-random-secret-value
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Hosted databases such as Neon use the same format with `?sslmode=require` at the end of the URL.

### 2. Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

FastAPI runs on http://127.0.0.1:8000. The first start creates the tables in PostgreSQL.

### 3. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API overview

| Method | Endpoint             | Purpose                                                |
|--------|----------------------|--------------------------------------------------------|
| POST   | /auth/register       | Create an account and receive a JWT                    |
| POST   | /auth/login          | Log in and receive a JWT                               |
| GET    | /auth/me             | Get the logged-in user                                 |
| GET    | /applications        | List own applications; supports `search` and `status_filter` |
| GET    | /applications/{id}   | Get one own application                                |
| POST   | /applications        | Create an application                                  |
| PUT    | /applications/{id}   | Replace an application                                 |
| DELETE | /applications/{id}   | Delete an application                                  |

## Authentication flow

Register or log in returns a JWT access token. The React app saves that token in browser `localStorage` and sends it in an `Authorization: Bearer <token>` header on application requests. FastAPI reads the token and always filters records by the token's user id, so one user cannot read or change another user's applications.

## Key files

- `backend/main.py` — all endpoints and ownership checks
- `backend/models.py` — database tables and relationship
- `backend/auth.py` — password hashing and JWT authentication
- `frontend/src/api.js` — all `fetch()` calls
- `frontend/src/App.jsx` — switching between login and dashboard
- `frontend/src/Dashboard.jsx` — CRUD, dashboard counts, search, and filter
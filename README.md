# InternTrack

InternTrack is a simple full-stack internship application tracker. Each user can create an account, log in, and manage only their own applications.

## Technology

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Pydantic, PyJWT, bcrypt
- Frontend: React, Vite, JavaScript, CSS, `fetch()`

## Structure

```text
interntrack/
├── backend/       # FastAPI app and PostgreSQL models
├── frontend/      # React app
└── README.md
```

## 1. PostgreSQL setup

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

## 2. Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

FastAPI runs on `http://127.0.0.1:8000`. The first start creates the tables in PostgreSQL.

## 3. Run the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create an account and receive a JWT |
| POST | `/auth/login` | Log in and receive a JWT |
| GET | `/auth/me` | Get the logged-in user |
| GET | `/applications` | List own applications; supports `search` and `status_filter` |
| GET | `/applications/{id}` | Get one own application |
| POST | `/applications` | Create an application |
| PUT | `/applications/{id}` | Replace an application |
| DELETE | `/applications/{id}` | Delete an application |

## Authentication flow

Register or log in returns a JWT access token. The React app saves that token in browser `localStorage` and sends it in an `Authorization: Bearer <token>` header on application requests. FastAPI reads the token and always filters records by the token's user id, so one user cannot read or change another user's applications.

## Files to study first

1. `backend/main.py` — all endpoints and ownership checks
2. `backend/models.py` — database tables and relationship
3. `backend/auth.py` — password hashing and JWT authentication
4. `frontend/src/api.js` — all `fetch()` calls
5. `frontend/src/App.jsx` — switching between login and dashboard
6. `frontend/src/Dashboard.jsx` — CRUD, dashboard counts, search, and filter

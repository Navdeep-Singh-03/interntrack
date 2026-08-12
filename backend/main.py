import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, hash_password, verify_password
from database import Base, engine, get_db
from models import InternshipApplication, User
from schemas import ApplicationCreate, ApplicationResponse, TokenResponse, UserLogin, UserRegister, UserResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="InternTrack API")

allowed_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    email = user_data.email.lower().strip()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        name=user_data.name.strip(),
        email=email,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user.id), "user": user}


@app.post("/auth/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(user.id), "user": user}


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/applications", response_model=list[ApplicationResponse])
def get_applications(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(InternshipApplication).filter(InternshipApplication.user_id == current_user.id)
    if search:
        search_text = f"%{search.strip()}%"
        query = query.filter(or_(InternshipApplication.company.ilike(search_text), InternshipApplication.role.ilike(search_text)))
    if status_filter:
        query = query.filter(InternshipApplication.status == status_filter)
    return query.order_by(InternshipApplication.application_date.desc()).all()


@app.get("/applications/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return find_user_application(application_id, db, current_user.id)


@app.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application_data: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    application = InternshipApplication(**application_data.model_dump(), user_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@app.put("/applications/{application_id}", response_model=ApplicationResponse)
def update_application(application_id: int, application_data: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    application = find_user_application(application_id, db, current_user.id)
    for field, value in application_data.model_dump().items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


@app.delete("/applications/{application_id}")
def delete_application(application_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    application = find_user_application(application_id, db, current_user.id)
    db.delete(application)
    db.commit()
    return {"message": "Application deleted successfully"}


def find_user_application(application_id: int, db: Session, user_id: int) -> InternshipApplication:
    """A lookup always includes user_id, so users cannot access each other's records."""
    application = db.query(InternshipApplication).filter(
        InternshipApplication.id == application_id,
        InternshipApplication.user_id == user_id,
    ).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

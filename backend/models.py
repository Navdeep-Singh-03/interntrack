from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    applications = relationship("InternshipApplication", back_populates="user", cascade="all, delete")
    profile_notes = relationship("ProfileNote", back_populates="user", cascade="all, delete")


class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(120), nullable=False)
    role = Column(String(120), nullable=False)
    status = Column(String(30), nullable=False, default="Wishlist")
    location = Column(String(120), nullable=False)
    application_date = Column(Date, nullable=False)
    deadline = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="applications")


class ProfileNote(Base):
    """A user-owned resume, skills, project, or experience note for the Job-Fit Assistant."""
    __tablename__ = "profile_notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="profile_notes")

from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

ApplicationStatus = Literal["Wishlist", "Applied", "OA", "Interview", "Offer", "Rejected"]


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=120)
    role: str = Field(min_length=1, max_length=120)
    status: ApplicationStatus = "Wishlist"
    location: str = Field(min_length=1, max_length=120)
    application_date: date
    deadline: Optional[date] = None
    notes: Optional[str] = None


class ApplicationResponse(ApplicationCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

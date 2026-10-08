from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class BadgeResponse(BaseModel):
    name: str
    icon: str
    awarded_at: datetime

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    xp: int
    quiz_score: int
    scans_completed: int
    badges: list[BadgeResponse] = []

    class Config:
        from_attributes = True

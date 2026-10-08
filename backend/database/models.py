from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .config import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CrowdPattern(Base):
    __tablename__ = "crowd_patterns"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, index=True)
    risk_level = Column(String)
    threat_category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    xp = Column(Integer, default=0)
    quiz_score = Column(Integer, default=0)
    scans_completed = Column(Integer, default=0)
    
    user = relationship("User", backref="profile")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    icon = Column(String)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now())

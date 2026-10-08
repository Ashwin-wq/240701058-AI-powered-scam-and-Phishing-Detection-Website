from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.config import get_db
from database.models import User, UserProfile, Badge
from schemas.user import ProfileResponse

# Note: In a fully fleshed out app, we would use a get_current_user dependency here
# using the JWT token created in auth.py. For MVP purposes, we'll fetch by username.

router = APIRouter()

@router.get("/profile/{username}", response_model=ProfileResponse)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    
    # Create default profile if not exists
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    badges = db.query(Badge).filter(Badge.user_id == user.id).all()
    
    return {
        "xp": profile.xp,
        "quiz_score": profile.quiz_score,
        "scans_completed": profile.scans_completed,
        "badges": badges
    }

@router.post("/profile/{username}/add-xp")
def add_xp(username: str, amount: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        
    profile.xp += amount
    
    # Simple Badge logic for demo
    new_badge = None
    if profile.xp >= 100 and db.query(Badge).filter(Badge.user_id == user.id, Badge.name == "Scam Spotter").count() == 0:
        new_badge = Badge(user_id=user.id, name="Scam Spotter", icon="🔎")
        db.add(new_badge)
        
    db.commit()
    
    return {"message": f"Added {amount} XP", "new_badge": new_badge.name if new_badge else None}

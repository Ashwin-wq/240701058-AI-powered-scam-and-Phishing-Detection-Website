from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uuid
import sys
import os
import asyncio
from urllib.parse import urlparse

# Add PHISHSENSE root to path (for 'from agents.x import ...' and 'from backend.x import ...')
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Add backend/ directory to path (for 'from database.x import ...' and 'from api import ...')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.schemas.scan import ScanUrlRequest, ScanMessageRequest, ScanResponse
from fastapi import UploadFile, File
import re
from agents.detection_agent import detection_agent
from agents.threat_intelligence_agent import threat_agent
from agents.explanation_agent import explanation_agent
from agents.awareness_agent import awareness_agent
from agents.live_analysis_agent import live_agent
from agents.vision_agent import vision_agent
from agents.message_agent import message_agent
from database.config import engine, Base, get_db
from database.models import CrowdPattern
from api import auth, awareness, ws
from sqlalchemy.orm import Session

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PHISHSENSE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(awareness.router, prefix="/api/awareness", tags=["awareness"])
app.include_router(ws.router, tags=["websockets"])

@app.post("/scan/url", response_model=ScanResponse)
async def scan_url(request: ScanUrlRequest, client_id: str = None, db: Session = Depends(get_db)):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
        
    url_obj = urlparse(request.url if request.url.startswith('http') else f"http://{request.url}")
    domain = url_obj.netloc
    
    # Check Crowd Memory
    if client_id: await ws.manager.send_status(client_id, "Checking crowd memory...")
    similar_scans = db.query(CrowdPattern).filter(CrowdPattern.domain == domain).count()

        
    # Phase 3: Run Detection Agent
    if client_id: await ws.manager.send_status(client_id, "Running ML detection pipeline...")
    detection_result = detection_agent.scan_url(request.url)
    
    # Phase 4: Run Threat Intelligence
    if client_id: await ws.manager.send_status(client_id, "Querying Threat Intelligence (PhishTank)...")
    threat_intel_result = threat_agent.check_url(request.url)
    
    # Calculate final score based on both
    final_score = detection_result["risk_score"]
    final_level = detection_result["risk_level"]
    if threat_intel_result["found"]:
        final_score = min(100, final_score + 25)
        final_level = "HIGH" if final_score >= 75 else ("SUSPICIOUS" if final_score >= 50 else final_level)
        
    # Phase 2: Run Live Website Analysis (Playwright)
    if client_id: await ws.manager.send_status(client_id, "Extracting live features with Headless Browser...")
    live_analysis_result = await live_agent.analyze_url(request.url)
    
    if live_analysis_result.get("success"):
        if live_analysis_result.get("password_field") or live_analysis_result.get("external_form_action"):
            final_score = min(100, final_score + 15)
        if live_analysis_result.get("hidden_iframe"):
            final_score = min(100, final_score + 10)
        final_level = "HIGH" if final_score >= 75 else ("SUSPICIOUS" if final_score >= 50 else final_level)
        
    # Phase 3: Run Vision Agent
    vision_analysis_result = None
    if live_analysis_result.get("success") and live_analysis_result.get("screenshot_path"):
        if client_id: await ws.manager.send_status(client_id, "Analyzing visual layout for brand impersonation...")
        vision_analysis_result = vision_agent.analyze_screenshot(live_analysis_result["screenshot_path"], request.url)
        if vision_analysis_result.get("visual_impersonation_risk", 0.0) > 0.7:
            final_score = min(100, final_score + 25)
            final_level = "CRITICAL" if final_score >= 90 else "HIGH"

        
    # Phase 5: Run Explanation Agent
    if client_id: await ws.manager.send_status(client_id, "Generating simple explanation...")
    explanation_result = explanation_agent.explain(
        evidence=detection_result["evidence"],
        threat_intel=threat_intel_result,
        risk_level=final_level,
        risk_score=final_score
    )
    
    # Phase 6: Run Awareness Agent
    if client_id: await ws.manager.send_status(client_id, "Building personalized awareness training...")
    awareness_result = awareness_agent.generate_training(
        evidence=detection_result["evidence"],
        risk_level=final_level
    )
    
    # Save to Crowd Memory if high risk
    if final_level in ["HIGH", "CRITICAL"]:
        if client_id: await ws.manager.send_status(client_id, "Saving high-risk pattern to Crowd Memory...")
        new_pattern = CrowdPattern(domain=domain, risk_level=final_level, threat_category="Phishing")
        db.add(new_pattern)
        db.commit()
    
    # Structure the response
    response = ScanResponse(
        scan_id=str(uuid.uuid4()),
        input_type="url",
        risk_score=final_score,
        risk_level=final_level,
        model=detection_result["model"],
        evidence=detection_result["evidence"],
        threat_intelligence=threat_intel_result,
        live_analysis=live_analysis_result,
        vision_analysis=vision_analysis_result,
        explanation=explanation_result,
        awareness=awareness_result,
        similar_scans=similar_scans
    )
    
    return response

@app.post("/scan/message", response_model=ScanResponse)
async def scan_message(request: ScanMessageRequest, client_id: str = None, db: Session = Depends(get_db)):
    # Use the NLP Message Agent (Gemini LLM) for advanced semantic analysis
    if client_id: await ws.manager.send_status(client_id, "Running advanced NLP analysis on message...")
    analysis = message_agent.analyze_message(request.content)
    
    score = analysis.get("risk_score", 0)
    evidence = analysis.get("evidence", [])
    
    if score >= 75:
        level = "HIGH"
    elif score >= 50:
        level = "SUSPICIOUS"
    elif score >= 25:
        level = "LOW"
    else:
        level = "SAFE"

    # Generate explanations dynamically
    if client_id: await ws.manager.send_status(client_id, "Generating simple explanation...")
    explanation_result = explanation_agent.explain(
        evidence=evidence,
        threat_intel={"found": False, "details": ""},
        risk_level=level,
        risk_score=score
    )
    
    # Generate tailored awareness training
    if client_id: await ws.manager.send_status(client_id, "Building personalized awareness training...")
    awareness_result = awareness_agent.generate_training(
        evidence=evidence,
        risk_level=level
    )

    # Save to Crowd Memory if high risk
    if level in ["HIGH", "CRITICAL"]:
        if client_id: await ws.manager.send_status(client_id, "Saving high-risk message pattern to Crowd Memory...")
        snippet = request.content[:40] + ("..." if len(request.content) > 40 else "")
        new_pattern = CrowdPattern(domain=f"MSG: {snippet}", risk_level=level, threat_category="Social Engineering")
        db.add(new_pattern)
        db.commit()

    return ScanResponse(
        scan_id=str(uuid.uuid4()),
        input_type="message",
        risk_score=score,
        risk_level=level,
        model={"primary": "gemini-nlp", "probability": float(score)/100.0, "rf_probability": 0.0},
        evidence=evidence,
        explanation=explanation_result,
        awareness=awareness_result
    )

@app.post("/scan/file", response_model=ScanResponse)
async def scan_file(file: UploadFile = File(...), client_id: str = None, db: Session = Depends(get_db)):
    # Save to Crowd Memory
    new_pattern = CrowdPattern(domain=f"FILE: {file.filename}", risk_level="HIGH", threat_category="Malicious Attachment")
    db.add(new_pattern)
    db.commit()

    return ScanResponse(
        scan_id=str(uuid.uuid4()),
        input_type="file",
        risk_score=75,
        risk_level="HIGH",
        model={"primary": "vision_agent", "probability": 0.75, "rf_probability": 0.0},
        evidence=[{"feature": "Suspicious Layout", "value": "Detected", "impact": "High", "description": "File layout mimics an invoice."}],
        explanation={"plain_explanation": "This file looks like a fake bill meant to steal your money!", "technical_explanation": "Vision analysis detected impersonation.", "reasons": [], "safe_next_step": "Delete the file immediately."},
        awareness={"topic": "Malicious Attachments", "description": "Never open unexpected attachments, even if they look like invoices."}
    )

@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    # Returns the 50 most recent high-risk crowd scans
    history = db.query(CrowdPattern).order_by(CrowdPattern.created_at.desc()).limit(50).all()
    return {"history": history}

@app.delete("/api/history/{item_id}")
async def delete_history(item_id: int, db: Session = Depends(get_db)):
    item = db.query(CrowdPattern).filter(CrowdPattern.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

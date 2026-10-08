# PHISHSENSE Architecture

## Core Idea & Problem Statement
PHISHSENSE is an "Explainable Multi-Agent Phishing & Scam Detection with Personalized Awareness Training" application. Rather than just being a black-box phishing classifier, PHISHSENSE combines machine-learning detection, threat intelligence, explainable evidence, and personalized security awareness training. Every detection becomes a learning opportunity for the user.

## Architecture

The system uses a four-agent logical architecture orchestrated by n8n. The most important architectural principle is that **ML models make the detection decision**—the Generative AI model (Gemini) NEVER decides whether something is phishing.

### Logical Agents
1. **Detection Agent**
   - Responsible for URL feature extraction, ML inference (Random Forest and XGBoost), rule-based evidence, risk scoring, and feature importance (SHAP/evidence extraction).
2. **Threat Intelligence Agent**
   - Responsible for PhishTank lookup, known malicious domain matching, and producing threat-intelligence evidence.
3. **Explanation Agent**
   - Receives evidence from Detection and Threat Intelligence agents. Responsible ONLY for explaining that evidence, converting technical evidence into plain language, generating explanations from screenshot observations, and translating explanations.
4. **Awareness Agent**
   - Responsible for generating personalized educational content, a 3-question awareness quiz based on the specific threat, and "how to spot this yourself next time".

## Technology Stack

- **Frontend / Web Programming**: HTML5, CSS3, JavaScript ES6+, React, Vite, Tailwind CSS, Lucide React icons. (Responsive, light/dark mode).
- **Backend / Web API**: Python 3.11+, FastAPI, Uvicorn.
- **PHP Component**: PHP 8+ (Provides a lightweight, server-side web programming demonstration, such as a report rendering component, cleanly separated from the ML backend).
- **Database**: SQLite (SQLAlchemy or a lightweight layer) for scan history, detected patterns, and crowd-memory.
- **Machine Learning**: scikit-learn, Random Forest Classifier, XGBoost Classifier, SHAP/feature importance.
- **Generative AI**: Google Gemini API (gemini-1.5-flash) used strictly for explanation, translation, vision extraction, and awareness content.
- **Agent Orchestration**: n8n (Webhook-triggered workflow orchestrating the four logical agents).

## Data Flow (URL Scanning Pipeline)
1. **User** submits a URL via the React frontend.
2. **FastAPI** backend receives the request.
3. **Detection Agent**: Normalizes input, extracts URL features, runs Random Forest and XGBoost, applies rule-based adjustments, calculates a final Risk Score (0-100), and outputs evidence.
4. **Threat Intelligence Agent**: Queries PhishTank or local mock data to find known malicious reports, producing threat evidence. Records scan in SQLite crowd-memory.
5. **Explanation Agent (Gemini)**: Reads the gathered evidence (and only the gathered evidence) to generate plain-language and technical explanations.
6. **Awareness Agent (Gemini)**: Reads the gathered evidence to generate a customized 3-question quiz and educational content.
7. **Result** is returned to the frontend and displayed to the user.

## Risk Scoring
Risk scores are clamped between 0 and 100.
- **0-24**: SAFE
- **25-49**: LOW
- **50-74**: SUSPICIOUS
- **75-100**: HIGH

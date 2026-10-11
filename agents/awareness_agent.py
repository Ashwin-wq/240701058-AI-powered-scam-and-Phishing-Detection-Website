import os
import json
from google import genai
from google.genai import types

class AwarenessAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        self.is_available = False
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.is_available = True
            except Exception as e:
                print(f"Warning: Gemini API configuration failed in Awareness Agent: {e}")

    def generate_training(self, evidence: list, risk_level: str) -> dict:
        """
        Takes technical evidence and generates a personalized 3-question quiz and lesson.
        """
        
        context = {
            "risk_level": risk_level,
            "detected_evidence": evidence
        }
        
        if not self.is_available:
            return self._mock_training(context)
            
        prompt = f"""
You are the Awareness Agent for PHISHSENSE.
Your job is to generate a personalized 3-question security awareness quiz and a short lesson based strictly on the detected evidence below.

Detected Evidence:
{json.dumps(context, indent=2)}

Output a valid JSON object strictly adhering to this schema:
{{
  "quiz": [
    {{
      "question": "Question text directly related to the evidence.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Why this is the correct answer."
    }},
    ... (generate exactly 3 questions)
  ],
  "what_to_remember": "A 2-sentence summary of the main learning point.",
  "how_to_spot_next_time": "A specific tip on how the user can spot this exact type of scam themselves next time."
}}
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            result = json.loads(response.text)
            return result
        except Exception as e:
            print(f"Error calling Gemini in Awareness Agent: {e}")
            return self._mock_training(context)
            
    def _mock_training(self, context: dict) -> dict:
        """Fallback training when AI is unavailable."""
        
        features = [e["feature"] for e in context["detected_evidence"]]
        
        quiz = []
        if "IP Address" in features:
            quiz.append({
                "question": "Why should you be suspicious of a URL that uses an IP address instead of a domain name (like Google.com)?",
                "options": ["It is faster", "It hides the true identity of the host", "It is required for secure connections", "It means the site is legitimate"],
                "correct_answer": "It hides the true identity of the host",
                "explanation": "Legitimate organizations register domain names. Scammers often use raw IP addresses to avoid domain registration filters."
            })
        if "HTTPS" in features:
            quiz.append({
                "question": "What does a missing HTTPS or padlock symbol indicate?",
                "options": ["The connection is slow", "The connection is not encrypted and can be intercepted", "The website is new", "The website is very popular"],
                "correct_answer": "The connection is not encrypted and can be intercepted",
                "explanation": "HTTPS ensures your data is encrypted. Never enter passwords on sites without it."
            })
        if "Hyphen in Domain" in features or "URL Shortener" in features:
            quiz.append({
                "question": "How do scammers often disguise their malicious links?",
                "options": ["Using all capital letters", "Adding hyphens (e.g., pay-pal.com) or using URL shorteners", "Making the text bold", "Using a lot of images"],
                "correct_answer": "Adding hyphens (e.g., pay-pal.com) or using URL shorteners",
                "explanation": "Scammers use URL shorteners or typosquatting (adding hyphens) to trick you into thinking you are visiting a legitimate brand."
            })
            
        # Fill in generic questions if evidence was empty or didn't match specific heuristics
        while len(quiz) < 3:
            quiz.append({
                "question": "What is the best action to take if you receive an unexpected urgent link?",
                "options": ["Click it immediately", "Forward it to friends", "Do not click; navigate to the official website manually", "Reply asking if it is real"],
                "correct_answer": "Do not click; navigate to the official website manually",
                "explanation": "Urgency is a common phishing tactic. Always verify by going directly to the source."
            })

        # Ensure exactly 3 questions
        quiz = quiz[:3]
            
        return {
            "quiz": quiz,
            "what_to_remember": "Phishing relies on tricking you with subtle URL changes or false urgency.",
            "how_to_spot_next_time": "Always check the address bar for the correct, exact domain name and ensure the connection is secure (HTTPS) before entering credentials.",
            "ai_unavailable": True
        }

awareness_agent = AwarenessAgent()

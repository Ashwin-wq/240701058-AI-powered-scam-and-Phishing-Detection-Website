import os
import json
import google.generativeai as genai

class MessageAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_available = False
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
                self.is_available = True
            except Exception as e:
                print(f"Warning: Gemini API configuration failed: {e}")

    def analyze_message(self, content: str) -> dict:
        if not self.is_available:
            return self._mock_analysis(content)
            
        prompt = f"""
You are an advanced NLP cybersecurity agent designed to detect phishing, social engineering, and scams in text messages and emails.
Analyze the following message and assign a risk score from 0 to 100, where 100 is explicitly malicious/scam and 0 is completely safe.

CRITICAL INSTRUCTIONS:
1. If the message is a standard, polite, informational message containing a well-known, legitimate domain (e.g. jio.com, google.com) and does NOT ask for passwords, payments, or use extreme urgency, you MUST assign a score between 0 and 20 (Very Low Risk). 
2. Do not penalize a message simply because it contains a link.

Message Content:
"{content}"

Output a valid JSON object strictly adhering to this schema:
{{
  "risk_score": integer (0-100),
  "evidence": [
    {{
      "feature": "string (e.g. 'Urgent Language', 'Financial Demand', 'Suspicious Link')",
      "value": "string (e.g. 'Present')",
      "impact": "string ('High', 'Medium', 'Low')",
      "description": "string (brief explanation)"
    }}
  ]
}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result
        except Exception as e:
            print(f"Error calling Gemini for message analysis: {e}")
            return self._mock_analysis(content)

    def _mock_analysis(self, content: str) -> dict:
        return {
            "risk_score": 60, 
            "evidence": [{"feature": "AI Analysis Unavailable", "value": "Unknown", "impact": "Medium", "description": "Gemini API unavailable. Defaulting to suspicious."}]
        }

message_agent = MessageAgent()

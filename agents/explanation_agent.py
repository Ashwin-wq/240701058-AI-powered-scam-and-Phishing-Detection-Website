import os
import json
from google import genai
from google.genai import types

class ExplanationAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        self.is_available = False
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.is_available = True
            except Exception as e:
                print(f"Warning: Gemini API configuration failed: {e}")

    def explain(self, evidence: list, threat_intel: dict, risk_level: str, risk_score: int) -> dict:
        """
        Takes technical evidence and threat intelligence and uses Gemini to explain it.
        Strictly enforces that the LLM only explains provided evidence and does not independently classify.
        """
        
        # Prepare the exact context Gemini is allowed to explain
        context = {
            "provided_risk_level": risk_level,
            "provided_risk_score": risk_score,
            "technical_evidence": evidence,
            "threat_intelligence_found": threat_intel.get("found", False),
            "threat_intelligence_details": threat_intel.get("details", "")
        }
        
        if not self.is_available:
            # Graceful degradation if Gemini is unavailable
            return self._mock_explanation(context)
            
        prompt = f"""
You are the Explanation Agent for PHISHSENSE.
Your ONLY job is to explain the technical evidence provided below in extremely simple language so that a 5-year-old child can understand the scary consequences of opening this link.
CRITICAL SAFETY RULE: You must NEVER independently declare if a URL is safe or phishing. 
You must ONLY explain why the provided `technical_evidence` and `threat_intelligence_found` led to the `provided_risk_level`.

Make the `plain_explanation` very dramatic but simple, like talking to a toddler (e.g., "DANGER! Bad guys are trying to steal your secrets!").

Evidence Context:
{json.dumps(context, indent=2)}

Output a valid JSON object strictly adhering to this schema:
{{
  "plain_explanation": "A 1-2 sentence extremely simple explanation for a 5-year-old about the bad consequences.",
  "technical_explanation": "A slightly more technical explanation focusing on the specific features triggered.",
  "reasons": ["short reason 1", "short reason 2"],
  "safe_next_step": "A recommended safe action (e.g. 'Close the window right now!')."
}}
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            # Parse the JSON response
            result = json.loads(response.text)
            return result
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return self._mock_explanation(context)
            
    def _mock_explanation(self, context: dict) -> dict:
        """Fallback explanation when AI is unavailable."""
        reasons = [e['description'] for e in context['technical_evidence']]
        if context['threat_intelligence_found']:
            reasons.append("Known threat intelligence match.")
            
        if context['provided_risk_level'] in ["HIGH", "SUSPICIOUS"]:
            plain = "DANGER! 🛑 This is a trick link made by bad guys! If you open it, they can steal your secret passwords and break your computer!"
            tech = "The detection pipeline identified specific anomalous URL features or a threat intelligence match."
            step = "Close this window right now and do not touch anything!"
        else:
            plain = "Yay! 🌟 This link looks perfectly safe to play with."
            tech = "The ML pipeline found no structural anomalies and no threat intelligence matches."
            step = "It is safe to proceed, but always be careful!"
            if not reasons:
                reasons = ["No bad guy tricks found."]
                
        return {
            "plain_explanation": plain,
            "technical_explanation": tech,
            "reasons": reasons,
            "safe_next_step": step,
            "ai_unavailable": True
        }

explanation_agent = ExplanationAgent()

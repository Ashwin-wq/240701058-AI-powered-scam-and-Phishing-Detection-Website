import os
import json
import google.generativeai as genai
import PIL.Image

class VisionAgent:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_available = False
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"response_mime_type": "application/json"})
                self.is_available = True
            except Exception as e:
                print(f"Warning: Gemini Vision configuration failed: {e}")

    def analyze_screenshot(self, screenshot_path: str, url: str) -> dict:
        """
        Takes a screenshot path and uses Gemini Vision to detect brand impersonation.
        """
        if not self.is_available:
            return self._mock_vision()

        try:
            if not os.path.exists(screenshot_path):
                return {"error": "Screenshot not found"}

            img = PIL.Image.open(screenshot_path)

            prompt = f"""
You are the Visual Analysis Agent for PHISHSENSE.
Your job is to analyze this screenshot of the website located at URL: {url}

Detect if this website is visually impersonating a known brand (e.g. PayPal, Microsoft, Netflix, a bank).
Look for logos, specific color schemes, and login form designs that mimic famous companies.

Output a valid JSON object strictly adhering to this schema:
{{
  "brand_detected": "Name of brand detected, or null if none",
  "login_page": true or false,
  "visual_impersonation_risk": A float between 0.0 and 1.0 (1.0 means highly likely impersonating, 0.0 means original design or unknown brand),
  "details": "A 1-2 sentence explanation of what visual elements were found."
}}
"""
            response = self.model.generate_content([prompt, img])
            result = json.loads(response.text)
            return result
        except Exception as e:
            print(f"Error calling Gemini Vision: {e}")
            return self._mock_vision()

    def _mock_vision(self) -> dict:
        """Fallback when Gemini is unavailable."""
        return {
            "brand_detected": None,
            "login_page": False,
            "visual_impersonation_risk": 0.0,
            "details": "Visual analysis unavailable (Gemini API key not configured or request failed)."
        }

vision_agent = VisionAgent()

import os
import json
import requests
from urllib.parse import urlparse

class ThreatIntelligenceAgent:
    def __init__(self):
        self.mock_data_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_threat_intel.json")
        self.phishtank_api_key = os.getenv("PHISHTANK_API_KEY", None)
        
        # Load mock data
        self.mock_domains = []
        self.mock_urls = []
        try:
            with open(self.mock_data_path, "r") as f:
                data = json.load(f)
                self.mock_domains = data.get("domains", [])
                self.mock_urls = data.get("urls", [])
        except Exception as e:
            print(f"Warning: Could not load mock threat intel data: {e}")

    def normalize_url(self, url: str) -> tuple:
        """Returns normalized url and domain."""
        if not url.startswith('http'):
            url = 'http://' + url
        parsed = urlparse(url)
        return url, parsed.netloc

    def query_phishtank(self, url: str) -> dict:
        """
        Attempts to query the live PhishTank API.
        If no API key is present or the API is unavailable, raises an exception.
        """
        if not self.phishtank_api_key:
            raise ValueError("No PhishTank API Key configured")
            
        # Example POST to PhishTank check URL endpoint (heuristic implementation)
        endpoint = "https://checkurl.phishtank.com/checkurl/"
        data = {
            "url": url,
            "format": "json",
            "app_key": self.phishtank_api_key
        }
        
        try:
            response = requests.post(endpoint, data=data, timeout=5)
            if response.status_code == 200:
                result = response.json()
                if result.get("results", {}).get("in_database"):
                    return {
                        "found": True,
                        "source": "PhishTank",
                        "is_simulated": False,
                        "details": "This URL is present in the PhishTank database of known malicious links."
                    }
            return {
                "found": False,
                "source": "PhishTank",
                "is_simulated": False,
                "details": "No match found in PhishTank."
            }
        except Exception as e:
            raise Exception(f"PhishTank API unavailable: {e}")

    def query_mock(self, url: str, domain: str) -> dict:
        """Queries the local mock dataset for demo purposes."""
        if domain in self.mock_domains or url in self.mock_urls:
            return {
                "found": True,
                "source": "PHISHSENSE Local Threat Intel",
                "is_simulated": True,
                "details": "This domain/URL was found in the local simulated threat intelligence database."
            }
            
        return {
            "found": False,
            "source": "PHISHSENSE Local Threat Intel",
            "is_simulated": True,
            "details": "No known threat records found locally."
        }

    def check_url(self, url: str) -> dict:
        """
        Main entrypoint. Tries PhishTank first, falls back to Mock data.
        """
        url, domain = self.normalize_url(url)
        
        try:
            return self.query_phishtank(url)
        except Exception as e:
            # Fallback to simulated mock data
            return self.query_mock(url, domain)

threat_agent = ThreatIntelligenceAgent()

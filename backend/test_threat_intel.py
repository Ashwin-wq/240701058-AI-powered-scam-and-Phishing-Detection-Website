import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.threat_intelligence_agent import threat_agent

def test_threat_intel():
    urls = [
        "https://www.google.com",
        "https://secure-login-update-paypal-account.com",
        "http://bit.ly/xyz123"
    ]
    
    print("Testing Threat Intelligence Agent (Mock Mode Expected without API Key)\n")
    
    for url in urls:
        print(f"URL: {url}")
        result = threat_agent.check_url(url)
        print(f"Found: {result['found']}")
        print(f"Source: {result['source']}")
        print(f"Simulated: {result['is_simulated']}")
        print(f"Details: {result['details']}")
        print("-" * 40)

if __name__ == "__main__":
    test_threat_intel()

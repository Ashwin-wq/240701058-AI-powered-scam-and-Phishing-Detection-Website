import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.schemas.scan import ScanUrlRequest
from backend.main import scan_url

async def test():
    urls = [
        "https://www.google.com",
        "http://192.168.1.1/login.php",
        "https://secure-login-update-paypal-account.com",
        "http://bit.ly/xyz123"
    ]
    
    for url in urls:
        print(f"\n--- Scanning: {url} ---")
        req = ScanUrlRequest(url=url)
        res = await scan_url(req)
        print(f"Risk Score: {res.risk_score}")
        print(f"Risk Level: {res.risk_level}")
        print(f"XGB Prob: {res.model.probability:.4f}")
        print("Evidence:")
        for ev in res.evidence:
            print(f"  - {ev.feature}: {ev.impact} ({ev.description})")
        if res.threat_intelligence:
            print(f"Threat Intel: Found={res.threat_intelligence.get('found')}, Simulated={res.threat_intelligence.get('is_simulated')}")
            print(f"  - Details: {res.threat_intelligence.get('details')}")
        if res.explanation:
            print(f"Explanation:")
            print(f"  - Plain: {res.explanation.get('plain_explanation')}")
            print(f"  - Next Step: {res.explanation.get('safe_next_step')}")
        if res.awareness:
            print(f"Awareness Quiz:")
            for i, q in enumerate(res.awareness.get('quiz', [])):
                print(f"  Q{i+1}: {q['question']}")
            print(f"  - Lesson: {res.awareness.get('what_to_remember')}")

if __name__ == "__main__":
    asyncio.run(test())

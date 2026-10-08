import os
import json
import joblib
import re
from urllib.parse import urlparse

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "ml", "models")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost.joblib")
FEATURES_PATH = os.path.join(MODELS_DIR, "features.json")

class DetectionAgent:
    def __init__(self):
        try:
            self.rf_model = joblib.load(RF_MODEL_PATH)
            self.xgb_model = joblib.load(XGB_MODEL_PATH)
            with open(FEATURES_PATH, "r") as f:
                self.feature_names = json.load(f)
        except Exception as e:
            print(f"Warning: Models not loaded. {e}")
            self.rf_model, self.xgb_model, self.feature_names = None, None, []

    def extract_features(self, url: str):
        """
        Extracts 30 features matching the UCI dataset schema.
        Note: For hackathon scope, some external features (e.g. PageRank) are estimated 
        or set to neutral (0) if they cannot be computed instantly without APIs.
        """
        # Ensure URL has scheme for parsing
        if not url.startswith('http'):
            parsed = urlparse('http://' + url)
        else:
            parsed = urlparse(url)
            
        domain = parsed.netloc
        path = parsed.path

        features = {}
        
        # 1. having_ip_address: -1 if IP is used instead of domain
        ip_pattern = re.compile(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
        features['having_ip_address'] = -1 if ip_pattern.match(domain.split(':')[0]) else 1
        
        # 2. url_length: -1 if > 75, 0 if 54-75, 1 if < 54
        if len(url) < 54: features['url_length'] = 1
        elif 54 <= len(url) <= 75: features['url_length'] = 0
        else: features['url_length'] = -1
        
        # 3. shortining_service: -1 if yes, 1 if no
        shorteners = ['bit.ly', 'goo.gl', 't.co', 'tinyurl.com']
        features['shortining_service'] = -1 if any(s in domain for s in shorteners) else 1
        
        # 4. having_at_symbol: -1 if @ in URL, 1 if not
        features['having_at_symbol'] = -1 if '@' in url else 1
        
        # 5. double_slash_redirecting: -1 if // occurs after position 7
        features['double_slash_redirecting'] = -1 if url.rfind('//') > 7 else 1
        
        # 6. prefix_suffix: -1 if domain has hyphen
        features['prefix_suffix'] = -1 if '-' in domain else 1
        
        # 7. having_sub_domain: -1 if >2 subdomains, 0 if 2, 1 if 1
        dot_count = domain.count('.')
        if dot_count == 1: features['having_sub_domain'] = 1
        elif dot_count == 2: features['having_sub_domain'] = 0
        else: features['having_sub_domain'] = -1
        
        # 8. sslfinal_state: 1 for legit (https), -1 for bad
        features['sslfinal_state'] = 1 if parsed.scheme == 'https' else -1
        
        # 9-30. Approximations/heuristics for the rest for instant demo purposes
        # In a production system, these would do deep DOM/DNS analysis
        defaults = {
            'domain_registration_length': -1 if len(domain) > 20 else 1,
            'favicon': 1,
            'port': 1,
            'https_token': -1 if 'https' in domain else 1,
            'request_url': 1,
            'url_of_anchor': 0, # Often a highly predictive feature
            'links_in_tags': 0,
            'sfh': 1,
            'submitting_to_email': 1 if 'mailto:' in url else 1,
            'abnormal_url': 1,
            'redirect': 1,
            'on_mouseover': 1,
            'rightclick': 1,
            'popupwindow': 1,
            'iframe': 1,
            'age_of_domain': -1 if features['having_ip_address'] == -1 else 1,
            'dnsrecord': 1,
            'web_traffic': 0,
            'page_rank': -1,
            'google_index': 1,
            'links_pointing_to_page': 0,
            'statistical_report': 1
        }
        
        for k, v in defaults.items():
            features[k] = v
            
        # Ensure exact order as model expects
        feature_vector = [[features.get(fn, 1) for fn in self.feature_names]]
        return features, feature_vector

    def calculate_risk_score(self, xgb_prob: float, features: dict) -> tuple:
        """
        Risk score is base ML probability * 100, plus rule-based adjustments.
        Returns final score (0-100) and risk level.
        """
        score = xgb_prob * 100
        
        # Rule adjustments (Evidence-based)
        if features.get('having_ip_address') == -1: score += 50
        if features.get('having_at_symbol') == -1: score += 50
        if features.get('prefix_suffix') == -1: score += 30
        if features.get('sslfinal_state') == -1: score += 40
        if features.get('shortining_service') == -1: score += 30
        
        score = max(0, min(100, round(score)))
        
        if score < 25: level = "SAFE"
        elif score < 50: level = "LOW"
        elif score < 75: level = "SUSPICIOUS"
        else: level = "HIGH"
        
        return score, level

    def extract_evidence(self, features: dict) -> list:
        """
        Converts raw ML features into human-readable evidence points.
        """
        evidence = []
        if features.get('having_ip_address') == -1:
            evidence.append({"feature": "IP Address", "value": "Present", "impact": "High", "description": "URL uses an IP address instead of a standard domain name."})
        if features.get('prefix_suffix') == -1:
            evidence.append({"feature": "Hyphen in Domain", "value": "Present", "impact": "Medium", "description": "Domain contains a hyphen, often used in typosquatting."})
        if features.get('having_at_symbol') == -1:
            evidence.append({"feature": "@ Symbol", "value": "Present", "impact": "High", "description": "URL contains an @ symbol, usually to hide the true destination."})
        if features.get('sslfinal_state') == -1:
            evidence.append({"feature": "HTTPS", "value": "Missing", "impact": "High", "description": "The connection is not secure (no HTTPS)."})
        if features.get('url_length') == -1:
            evidence.append({"feature": "URL Length", "value": "Very Long", "impact": "Medium", "description": "The URL is unusually long, which can be used to hide suspicious parts."})
        if features.get('shortining_service') == -1:
            evidence.append({"feature": "URL Shortener", "value": "Present", "impact": "Medium", "description": "A link shortening service was used to obscure the final destination."})
            
        return evidence

    def scan_url(self, url: str) -> dict:
        features_dict, feature_vector = self.extract_features(url)
        
        if self.xgb_model:
            # The models were trained such that 1 = Legitimate and 0 = Phishing
            # We want the probability of Phishing, which is class 0
            xgb_prob = float(self.xgb_model.predict_proba(feature_vector)[0][0])
            rf_prob = float(self.rf_model.predict_proba(feature_vector)[0][0])
        else:
            xgb_prob, rf_prob = 0.5, 0.5

        risk_score, risk_level = self.calculate_risk_score(xgb_prob, features_dict)
        evidence = self.extract_evidence(features_dict)
        
        return {
            "input_type": "url",
            "url": url,
            "model": {
                "primary": "xgboost",
                "probability": xgb_prob,
                "rf_probability": rf_prob
            },
            "risk_score": risk_score,
            "risk_level": risk_level,
            "features": features_dict,
            "evidence": evidence
        }

detection_agent = DetectionAgent()

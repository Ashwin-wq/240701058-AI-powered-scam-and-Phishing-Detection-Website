import os
import joblib
import json

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")
FEATURES_PATH = os.path.join(MODELS_DIR, "features.json")

print("Verifying model artifacts...")

try:
    rf_clf = joblib.load(RF_MODEL_PATH)
    print(f"✅ Random Forest model loaded successfully. Type: {type(rf_clf)}")
    
    xgb_clf = joblib.load(XGB_MODEL_PATH)
    print(f"✅ XGBoost model loaded successfully. Type: {type(xgb_clf)}")
    
    with open(METRICS_PATH, "r") as f:
        metrics = json.load(f)
        print(f"✅ Metrics loaded successfully. Keys: {list(metrics.keys())}")
        
    with open(FEATURES_PATH, "r") as f:
        features = json.load(f)
        print(f"✅ Features loaded successfully. Count: {len(features)}")
        
    print("Verification complete. All Phase 2 artifacts are accessible.")
except Exception as e:
    print(f"❌ Error loading artifacts: {str(e)}")

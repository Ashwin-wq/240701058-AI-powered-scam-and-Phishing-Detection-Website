import os
import json
import pandas as pd
from ucimlrepo import fetch_ucirepo
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import xgboost as xgb
import joblib

# Paths
MODELS_DIR = os.path.join("..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest.joblib")
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost.joblib")
FEATURES_PATH = os.path.join(MODELS_DIR, "features.json")

print("1. Fetching dataset...")
phishing_websites = fetch_ucirepo(id=327)
X = phishing_websites.data.features
y = phishing_websites.data.targets

print("2. Preprocessing...")
# Combine to remove duplicates across both features and targets
df = pd.concat([X, y], axis=1)
df_dedup = df.drop_duplicates()

X_clean = df_dedup.drop(columns=['result'])
y_clean = df_dedup['result']

# Map target -1 to 0 (0: Safe, 1: Phishing)
y_clean = y_clean.map({-1: 0, 1: 1})

# Save feature names
feature_names = list(X_clean.columns)
with open(FEATURES_PATH, "w") as f:
    json.dump(feature_names, f, indent=4)

print("3. Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(
    X_clean, y_clean, test_size=0.2, random_state=42, stratify=y_clean
)

print("4. Training Random Forest...")
rf_clf = RandomForestClassifier(n_estimators=100, random_state=42, class_weight="balanced")
rf_clf.fit(X_train, y_train)

print("5. Training XGBoost...")
# Calculate scale_pos_weight for imbalance
neg_cases = (y_train == 0).sum()
pos_cases = (y_train == 1).sum()
scale_pos_weight = neg_cases / pos_cases

xgb_clf = xgb.XGBClassifier(
    n_estimators=100, 
    random_state=42, 
    scale_pos_weight=scale_pos_weight,
    eval_metric="logloss",
    use_label_encoder=False
)
xgb_clf.fit(X_train, y_train)

print("6. Evaluating Models...")
def evaluate_model(model, X_t, y_t):
    y_pred = model.predict(X_t)
    y_prob = model.predict_proba(X_t)[:, 1]
    
    return {
        "precision": float(precision_score(y_t, y_pred)),
        "recall": float(recall_score(y_t, y_pred)),
        "f1_score": float(f1_score(y_t, y_pred)),
        "roc_auc": float(roc_auc_score(y_t, y_prob)),
        "confusion_matrix": confusion_matrix(y_t, y_pred).tolist()
    }

rf_metrics = evaluate_model(rf_clf, X_test, y_test)
xgb_metrics = evaluate_model(xgb_clf, X_test, y_test)

# Extract Feature Importances
rf_importance = dict(zip(feature_names, rf_clf.feature_importances_.tolist()))
xgb_importance = dict(zip(feature_names, xgb_clf.feature_importances_.tolist()))

# Sort importances
rf_importance = dict(sorted(rf_importance.items(), key=lambda item: item[1], reverse=True))
xgb_importance = dict(sorted(xgb_importance.items(), key=lambda item: item[1], reverse=True))

metrics = {
    "random_forest": {
        "metrics": rf_metrics,
        "feature_importance": rf_importance
    },
    "xgboost": {
        "metrics": xgb_metrics,
        "feature_importance": xgb_importance
    }
}

print("7. Saving artifacts...")
with open(METRICS_PATH, "w") as f:
    json.dump(metrics, f, indent=4)

joblib.dump(rf_clf, RF_MODEL_PATH)
joblib.dump(xgb_clf, XGB_MODEL_PATH)

print("Phase 2 complete. Models and metrics saved in ml/models/")

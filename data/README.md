# PHISHSENSE Datasets and Preprocessing

## 1. Primary Dataset: UCI Phishing Websites Dataset
- **Source**: UCI Machine Learning Repository (ID 327)
- **URL**: https://archive.ics.uci.edu/dataset/327/phishing+websites
- **Dataset Size**: 11,055 instances
- **Features**: 30 features
- **Target Variable**: `result` (1 for Phishing, -1 for Legitimate)
- **Class Balance**: 
  - 1 (Phishing): 6,157 instances
  - -1 (Legitimate): 4,898 instances
  - *Note: Classes are fairly balanced, so SMOTE will not be required.*
- **Missing Values**: 0 missing values
- **Duplicates**: 5,206 duplicate rows detected across features and target.
- **Data Types**: All features are `int64`. The features are categorical integers (mostly 1, 0, -1).

### Feature Names:
`having_ip_address`, `url_length`, `shortining_service`, `having_at_symbol`, `double_slash_redirecting`, `prefix_suffix`, `having_sub_domain`, `sslfinal_state`, `domain_registration_length`, `favicon`, `port`, `https_token`, `request_url`, `url_of_anchor`, `links_in_tags`, `sfh`, `submitting_to_email`, `abnormal_url`, `redirect`, `on_mouseover`, `rightclick`, `popupwindow`, `iframe`, `age_of_domain`, `dnsrecord`, `web_traffic`, `page_rank`, `google_index`, `links_pointing_to_page`, `statistical_report`.

### Preprocessing Requirements:
1. **Target Mapping**: Remap target `-1` (Legitimate) to `0` to standardize binary classification (1 = Phishing, 0 = Safe).
2. **Duplicate Handling**: Remove the 5,206 duplicate rows to prevent data leakage and overfitting, as duplicate entries can artificially inflate validation metrics if they appear in both train and test sets.
3. **Encoding**: Features are already encoded as integers (-1, 0, 1). No further categorical encoding or scaling is strictly required for tree-based models like Random Forest and XGBoost.
4. **Train/Test Split**: Perform an 80/20 stratified split after duplicate removal, using a fixed random seed (e.g., 42) for reproducibility.

## 2. Secondary Dataset: Kaggle "Phishing Site URLs" Dataset
- **Source**: Kaggle (`taruntiwarihp/phishing-site-urls`)
- **Structure**: This dataset primarily contains just the `URL` string and a `Label` (good/bad).
- **Usage**: Since our primary ML models (Random Forest, XGBoost) depend on 30 specific categorical features (like `sslfinal_state`, `url_of_anchor`), this dataset would require extensive feature engineering to match the UCI dataset structure. We will prioritize the UCI dataset for model training, as it already contains robust, pre-extracted features representing both URL structure and webpage content, which aligns better with our dual-agent (Detection + Threat Intel) explanation paradigm.

## 3. Threat Intelligence
- **Source**: PhishTank (https://phishtank.org)
- **Role**: This is NOT a training dataset. It is used strictly for live lookup by the Threat Intelligence Agent.
- **Mock Fallback**: A local mock JSON file (`data/mock_threat_intel.json`) will be used when the live API is unavailable.

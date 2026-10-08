import pandas as pd
try:
    # pyrefly: ignore [missing-import]
    from ucimlrepo import fetch_ucirepo
except ImportError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "ucimlrepo"])
    from ucimlrepo import fetch_ucirepo

# fetch dataset
phishing_websites = fetch_ucirepo(id=327)

# data (as pandas dataframes)
X = phishing_websites.data.features
y = phishing_websites.data.targets

print("UCI Phishing Websites Dataset (ID 327)")
print("=======================================")
print(f"Shape of X (features): {X.shape}")
print(f"Shape of y (targets): {y.shape}")
print(f"Target distribution:\n{y.value_counts()}")
print(f"Missing values:\n{X.isnull().sum().sum()} total missing")
print(f"Feature names: {list(X.columns)}")
print(f"Feature types:\n{X.dtypes}")

# Let's check for duplicates (requires concatenation)
df = pd.concat([X, y], axis=1)
print(f"Duplicates: {df.duplicated().sum()}")

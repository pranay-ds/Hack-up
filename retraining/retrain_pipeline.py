import pandas as pd
import numpy as np
import joblib
import os
from imblearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

def main():
    print("Loading dataset...")
    df = pd.read_csv("Bank_Transaction_Fraud_Detection.csv")
    
    # We will use these key features to train our model to keep it fast and highly explainable
    features = ["Transaction_Amount", "State", "Transaction_Device", "Merchant_Category"]
    X = df[features].copy()
    y = df["Is_Fraud"].astype(int)
    
    # Fill missing values to be safe
    X.fillna("Unknown", inplace=True)
    
    numeric_features = ["Transaction_Amount"]
    categorical_features = ["State", "Transaction_Device", "Merchant_Category"]
    
    # Create the column transformer
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )
    
    # Create the imbalanced-learn Pipeline
    # Using SMOTE to synthetically boost the minority fraud class before feeding to XGBoost
    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("smote", SMOTE(random_state=42, sampling_strategy=0.1)), # Boost minority class to 10%
        ("classifier", XGBClassifier(n_estimators=50, max_depth=6, random_state=42, eval_metric='logloss'))
    ])
    
    print("Splitting dataset into train/test...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training Model with SMOTE on {len(X_train)} rows... This may take up to 2 minutes!")
    pipeline.fit(X_train, y_train)
    
    print("Evaluating Model...")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    # Save the pipeline
    os.makedirs("models/saved", exist_ok=True)
    model_path = "models/saved/xgboost_pipeline.pkl"
    joblib.dump(pipeline, model_path)
    print(f"\nModel saved successfully to {model_path}!")

if __name__ == "__main__":
    main()

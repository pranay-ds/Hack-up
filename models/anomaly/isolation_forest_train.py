import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_anomaly_model():
    print("Loading bank_transactions_data_2.csv...")
    file_path = os.path.join(os.path.dirname(__file__), '../../bank_transactions_data_2.csv')
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return
        
    print(f"Dataset shape before filtering: {df.shape}")
    
    # Drop identifiers and dates to focus purely on behavioral metrics
    columns_to_drop = [
        'TransactionID', 'AccountID', 'DeviceID', 'IP Address', 
        'MerchantID', 'TransactionDate', 'PreviousTransactionDate'
    ]
    
    existing_cols_to_drop = [col for col in columns_to_drop if col in df.columns]
    feature_df = df.drop(columns=existing_cols_to_drop)
    
    # Identify column types
    categorical_cols = feature_df.select_dtypes(include=['object', 'category']).columns.tolist()
    numeric_cols = feature_df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    print("Numeric columns:", numeric_cols)
    print("Categorical columns:", categorical_cols)
    
    # Preprocessing
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
    
    # Contamination is an estimate of how many anomalies exist (~1% fraud standard)
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('anomaly_detector', IsolationForest(n_estimators=100, contamination=0.01, random_state=42))
    ])
    
    print("Training Isolation Forest on unlabeled data...")
    # Fill NAs quickly if any exist
    feature_df = feature_df.fillna(method='ffill').fillna(method='bfill')
    
    model_pipeline.fit(feature_df)
    
    # Save the model
    save_dir = os.path.join(os.path.dirname(__file__), '../saved')
    os.makedirs(save_dir, exist_ok=True)
    
    save_path = os.path.join(save_dir, 'isf_pipeline.pkl')
    joblib.dump(model_pipeline, save_path)
    print(f"✅ Isolation Forest model saved to {save_path}")

if __name__ == '__main__':
    train_anomaly_model()

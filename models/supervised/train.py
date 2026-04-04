import pandas as pd
import numpy as np
import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, roc_auc_score

def train_supervised_model():
    print("Loading Bank_Transaction_Fraud_Detection.csv...")
    file_path = os.path.join(os.path.dirname(__file__), '../../Bank_Transaction_Fraud_Detection.csv')
    
    try:
        df = pd.read_csv(file_path)
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return
        
    print(f"Dataset shape before filtering: {df.shape}")
    
    # Drop unwanted columns to speed up training and remove noise as requested
    columns_to_drop = [
        'Customer_Name', 'Gender', 'Age', 
        'Customer_Contact', 'Customer_Email',
        'Customer_ID', 'Transaction_ID', 'Merchant_ID', 
        'Transaction_Date', 'Transaction_Time', 'Transaction_Description'
    ]
    
    # Drop only the columns that actually exist in the dataframe
    existing_cols_to_drop = [col for col in columns_to_drop if col in df.columns]
    df = df.drop(columns=existing_cols_to_drop)
    
    print(f"Dataset shape after dropping unwanted columns: {df.shape}")
    
    # Separate features and target
    X = df.drop(columns=['Is_Fraud'])
    y = df['Is_Fraud']
    
    # Identify categorical and numeric columns
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
    numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    print("Numeric columns:", numeric_cols)
    print("Categorical columns:", categorical_cols)
    
    # Create preprocessing pipelines
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
        
    # Build the full model pipeline using Logistic Regression (Linear approach for classification)
    # class_weight='balanced' handles extreme class imbalances automatically
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42))
    ])
    
    # Train test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Training Logistic Regression model...")
    model_pipeline.fit(X_train, y_train)
    
    # Evaluate
    print("Evaluating model...")
    y_pred = model_pipeline.predict(X_test)
    y_prob = model_pipeline.predict_proba(X_test)[:, 1]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, y_prob):.4f}")
    
    # Save the model
    save_dir = os.path.join(os.path.dirname(__file__), '../saved')
    os.makedirs(save_dir, exist_ok=True)
    
    save_path = os.path.join(save_dir, 'logistic_pipeline.pkl')
    joblib.dump(model_pipeline, save_path)
    print(f"✅ Model saved to {save_path}")

if __name__ == '__main__':
    train_supervised_model()

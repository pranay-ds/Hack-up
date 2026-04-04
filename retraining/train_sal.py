import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sal.sal_model import create_sal_model, SALConfig

def main():
    print("Loading dataset for Stake-Aware Learning (SAL) ...")
    df = pd.read_csv("Bank_Transaction_Fraud_Detection.csv")
    
    features = ["Transaction_Amount", "State", "Transaction_Device", "Merchant_Category"]
    X = df[features].copy()
    y = df["Is_Fraud"].astype(int)
    
    X.fillna("Unknown", inplace=True)
    
    numeric_features = ["Transaction_Amount"]
    categorical_features = ["State", "Transaction_Device", "Merchant_Category"]
    
    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
    ])
    
    print("Preprocessing data (One-Hot & Standardization)...")
    X_processed = preprocessor.fit_transform(X)
    
    print("Applying SMOTE to balance fraud instances...")
    smote = SMOTE(random_state=42, sampling_strategy=0.1)
    X_bal, y_bal = smote.fit_resample(X_processed, y)
    
    X_train, X_test, y_train, y_test = train_test_split(X_bal, y_bal, test_size=0.2, random_state=42, stratify=y_bal)
    
    print(f"Training set shape: {X_train.shape}")
    
    # Convert to PyTorch tensors
    train_dataset = TensorDataset(torch.FloatTensor(X_train), torch.LongTensor(y_train.to_numpy()))
    val_dataset = TensorDataset(torch.FloatTensor(X_test), torch.LongTensor(y_test.to_numpy()))
    
    train_loader = DataLoader(train_dataset, batch_size=2048, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=2048, shuffle=False)
    
    input_dim = X_train.shape[1]
    print(f"Neural Network Input Dimension: {input_dim}")
    
    # Configure Stake-Aware constraints
    config = SALConfig(
        fraud_stake=200.0,
        normal_stake=1.0,
        abstention_penalty=2.28,
        selection_threshold=0.95
    )
    
    # Dual-Head architecture
    model, trainer = create_sal_model(input_dim, config=config, device='cpu')
    
    print("\nBeginning Backpropagation over SAL Loss functions...")
    # Train for a few epochs for demonstration
    for epoch in range(3):
        train_metrics = trainer.train_epoch(train_loader)
        val_metrics = trainer.validate(val_loader)
        
        print(f"Epoch {epoch+1}/3 | Train SAL Risk: {train_metrics['risk']:.4f} | Margin Penalty: {train_metrics['penalty']:.4f} | Gate Confidence (s): {val_metrics['selection_confidence_mean']:.4f}")
        
    os.makedirs("models/saved", exist_ok=True)
    # Save the pipeline wrappers
    joblib.dump(preprocessor, "models/saved/sal_preprocessor.pkl")
    joblib.dump(input_dim, "models/saved/sal_input_dim.pkl")
    
    # Safely save the PyTorch model state dict
    torch.save(model.state_dict(), "models/saved/sal_model.pth")
    print("\n[SUCCESS] SAL Architecture weights dynamically exported to models/saved/sal_model.pth!")

if __name__ == "__main__":
    main()

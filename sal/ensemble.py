"""
Ensemble Fraud Detection Model

Combines multiple base models (XGBoost, LightGBM, Isolation Forest)
with weighted voting for robust fraud detection.

Architecture:
- XGBoost: Primary classification model
- LightGBM: Fast alternative with different hyperparameters
- Isolation Forest: Anomaly detection for novel patterns
- Weighted ensemble: Majority voting with configurable weights
"""

from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional, Any
import numpy as np
import pickle
import json
from pathlib import Path

# Import base models
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, precision_recall_curve, f1_score,
    confusion_matrix, roc_curve
)
from imblearn.over_sampling import SMOTE


@dataclass
class EnsembleConfig:
    """Configuration for ensemble model"""
    
    # Model weights (must sum to ~1.0)
    xgboost_weight: float = 0.4
    lightgbm_weight: float = 0.4
    isolation_forest_weight: float = 0.2
    
    # XGBoost config
    xgb_max_depth: int = 7
    xgb_learning_rate: float = 0.1
    xgb_n_estimators: int = 200
    xgb_subsample: float = 0.8
    xgb_colsample_bytree: float = 0.8
    xgb_scale_pos_weight: float = 50.0  # Fraud is rarer
    
    # LightGBM config
    lgb_num_leaves: int = 31
    lgb_learning_rate: float = 0.05
    lgb_n_estimators: int = 200
    lgb_feature_fraction: float = 0.8
    lgb_bagging_fraction: float = 0.8
    lgb_lambda_l1: float = 0.1
    lgb_lambda_l2: float = 0.1
    
    # Isolation Forest config
    if_contamination: float = 0.05  # Assume 5% fraud rate
    if_n_estimators: int = 100
    if_random_state: int = 42
    
    # Ensemble settings
    fraud_threshold: float = 0.5  # Decision boundary
    feature_scaling: bool = True
    apply_smote: bool = True
    smote_ratio: float = 0.5


class EnsembleModel:
    """
    Ensemble fraud detection model combining multiple algorithms
    """
    
    def __init__(self, config: EnsembleConfig = None):
        self.config = config or EnsembleConfig()
        self.xgb_model = None
        self.lgb_model = None
        self.iso_forest = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_importance_dict = {}
        self.training_metrics = {}
        self.feature_names = None
    
    def prepare_data(self, X: np.ndarray, y: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data with scaling and SMOTE balancing
        
        Args:
            X: Features array
            y: Labels array (0: normal, 1: fraud)
        
        Returns:
            Tuple of (X_processed, y_processed)
        """
        # Scaling
        if self.config.feature_scaling:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = X
        
        # SMOTE for class imbalance
        if self.config.apply_smote:
            smote = SMOTE(
                sampling_strategy=self.config.smote_ratio,
                random_state=42
            )
            X_balanced, y_balanced = smote.fit_resample(X_scaled, y)
            return X_balanced, y_balanced
        
        return X_scaled, y
    
    def train(
        self,
        X: np.ndarray,
        y: np.ndarray,
        validation_data: Optional[Tuple[np.ndarray, np.ndarray]] = None,
        verbose: bool = True
    ) -> Dict[str, float]:
        """
        Train all base models
        
        Args:
            X: Training features
            y: Training labels
            validation_data: Tuple of (X_val, y_val) for early stopping
            verbose: Print training progress
        
        Returns:
            Dictionary with training metrics
        """
        # Prepare data
        X_train, y_train = self.prepare_data(X, y)
        
        # Split validation if not provided
        if validation_data is None:
            X_train, X_val, y_train, y_val = train_test_split(
                X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
            )
        else:
            X_val, y_val = validation_data
            X_val = self.scaler.transform(X_val)
        
        if verbose:
            print(f"Training set: {X_train.shape}, Fraud rate: {y_train.mean():.3f}")
            print(f"Validation set: {X_val.shape}, Fraud rate: {y_val.mean():.3f}")
        
        metrics = {}
        
        # Train XGBoost
        if XGBOOST_AVAILABLE:
            if verbose:
                print("Training XGBoost...")
            
            self.xgb_model = xgb.XGBClassifier(
                max_depth=self.config.xgb_max_depth,
                learning_rate=self.config.xgb_learning_rate,
                n_estimators=self.config.xgb_n_estimators,
                subsample=self.config.xgb_subsample,
                colsample_bytree=self.config.xgb_colsample_bytree,
                scale_pos_weight=self.config.xgb_scale_pos_weight,
                random_state=42,
                n_jobs=-1,
                eval_metric='logloss'
            )
            
            self.xgb_model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                verbose=False
            )
            
            xgb_pred = self.xgb_model.predict_proba(X_val)[:, 1]
            xgb_auc = roc_auc_score(y_val, xgb_pred)
            metrics['xgboost_auc'] = xgb_auc
            
            if verbose:
                print(f"  XGBoost AUC: {xgb_auc:.4f}")
        
        # Train LightGBM
        if LIGHTGBM_AVAILABLE:
            if verbose:
                print("Training LightGBM...")
            
            self.lgb_model = lgb.LGBMClassifier(
                num_leaves=self.config.lgb_num_leaves,
                learning_rate=self.config.lgb_learning_rate,
                n_estimators=self.config.lgb_n_estimators,
                feature_fraction=self.config.lgb_feature_fraction,
                bagging_fraction=self.config.lgb_bagging_fraction,
                lambda_l1=self.config.lgb_lambda_l1,
                lambda_l2=self.config.lgb_lambda_l2,
                random_state=42,
                n_jobs=-1,
                verbose=-1
            )
            
            self.lgb_model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                callbacks=[lgb.log_evaluation(period=0)]
            )
            
            lgb_pred = self.lgb_model.predict_proba(X_val)[:, 1]
            lgb_auc = roc_auc_score(y_val, lgb_pred)
            metrics['lightgbm_auc'] = lgb_auc
            
            if verbose:
                print(f"  LightGBM AUC: {lgb_auc:.4f}")
        
        # Train Isolation Forest
        if verbose:
            print("Training Isolation Forest...")
        
        self.iso_forest = IsolationForest(
            contamination=self.config.if_contamination,
            n_estimators=self.config.if_n_estimators,
            random_state=self.config.if_random_state,
            n_jobs=-1
        )
        self.iso_forest.fit(X_train)
        
        # IF anomaly scores (convert to 0-1 probability)
        if_scores = self.iso_forest.score_samples(X_val)
        if_proba = 1.0 / (1.0 + np.exp(-if_scores))  # Sigmoid
        if_auc = roc_auc_score(y_val, if_proba)
        metrics['isolation_forest_auc'] = if_auc
        
        if verbose:
            print(f"  Isolation Forest AUC: {if_auc:.4f}")
        
        # Ensemble evaluation
        ensemble_pred = self.predict_proba(X_val)
        ensemble_auc = roc_auc_score(y_val, ensemble_pred)
        metrics['ensemble_auc'] = ensemble_auc
        
        if verbose:
            print(f"\nEnsemble AUC: {ensemble_auc:.4f}")
        
        self.is_trained = True
        self.training_metrics = metrics
        
        return metrics
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Predict fraud probability using ensemble voting
        
        Args:
            X: Feature array
        
        Returns:
            Fraud probability array [0, 1]
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Scale features
        if self.config.feature_scaling:
            X = self.scaler.transform(X)
        
        # Get predictions from each model
        predictions = []
        weights = []
        
        if self.xgb_model is not None:
            xgb_pred = self.xgb_model.predict_proba(X)[:, 1]
            predictions.append(xgb_pred)
            weights.append(self.config.xgboost_weight)
        
        if self.lgb_model is not None:
            lgb_pred = self.lgb_model.predict_proba(X)[:, 1]
            predictions.append(lgb_pred)
            weights.append(self.config.lightgbm_weight)
        
        # Isolation Forest
        if_scores = self.iso_forest.score_samples(X)
        if_proba = 1.0 / (1.0 + np.exp(-if_scores))
        predictions.append(if_proba)
        weights.append(self.config.isolation_forest_weight)
        
        # Weighted ensemble
        predictions = np.array(predictions)
        weights = np.array(weights)
        weights = weights / weights.sum()  # Normalize
        
        ensemble_pred = (predictions * weights.reshape(-1, 1)).sum(axis=0)
        
        return ensemble_pred
    
    def predict(self, X: np.ndarray, threshold: Optional[float] = None) -> np.ndarray:
        """
        Predict fraud class (0 or 1)
        
        Args:
            X: Feature array
            threshold: Classification threshold (uses config if None)
        
        Returns:
            Predicted labels array
        """
        proba = self.predict_proba(X)
        threshold = threshold or self.config.fraud_threshold
        return (proba >= threshold).astype(int)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Get average feature importance across XGBoost and LightGBM
        
        Returns:
            Dictionary mapping feature names to importance scores
        """
        if not self.is_trained:
            return {}
        
        importances = {}
        
        if self.xgb_model is not None:
            xgb_imp = self.xgb_model.feature_importances_
            for i, imp in enumerate(xgb_imp):
                importances[f'feature_{i}'] = imp * 0.5  # 50% weight
        
        if self.lgb_model is not None:
            lgb_imp = self.lgb_model.feature_importances_
            for i, imp in enumerate(lgb_imp):
                key = f'feature_{i}'
                importances[key] = importances.get(key, 0) + imp * 0.5
        
        return importances
    
    def save(self, path: str):
        """Save model to disk"""
        path = Path(path)
        path.mkdir(parents=True, exist_ok=True)
        
        if self.xgb_model:
            self.xgb_model.save_model(str(path / "xgb_model.json"))
        
        if self.lgb_model:
            self.lgb_model.booster_.save_model(str(path / "lgb_model.txt"))
        
        with open(path / "iso_forest.pkl", "wb") as f:
            pickle.dump(self.iso_forest, f)
        
        with open(path / "scaler.pkl", "wb") as f:
            pickle.dump(self.scaler, f)
        
        # Save config and metadata
        config_dict = {k: v for k, v in self.config.__dict__.items()}
        with open(path / "config.json", "w") as f:
            json.dump(config_dict, f, indent=2)
        
        with open(path / "metrics.json", "w") as f:
            json.dump({k: float(v) for k, v in self.training_metrics.items()}, f, indent=2)
    
    def load(self, path: str):
        """Load model from disk"""
        path = Path(path)
        
        if (path / "xgb_model.json").exists():
            self.xgb_model = xgb.XGBClassifier()
            self.xgb_model.load_model(str(path / "xgb_model.json"))
        
        if (path / "lgb_model.txt").exists():
            self.lgb_model = lgb.Booster(model_file=str(path / "lgb_model.txt"))
        
        with open(path / "iso_forest.pkl", "rb") as f:
            self.iso_forest = pickle.load(f)
        
        with open(path / "scaler.pkl", "rb") as f:
            self.scaler = pickle.load(f)
        
        self.is_trained = True

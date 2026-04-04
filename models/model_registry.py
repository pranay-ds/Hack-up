import os
import joblib
import pandas as pd
import logging

ENABLE_SHAP_EXPLANATIONS = os.getenv("ENABLE_SHAP_EXPLANATIONS", "0").strip().lower() in {"1", "true", "yes", "on"}

if ENABLE_SHAP_EXPLANATIONS:
    try:
        import shap
    except Exception:  # pragma: no cover - defensive for production runtime differences
        shap = None
else:
    shap = None

logger = logging.getLogger(__name__)

class ModelRegistry:
    def __init__(self):
        self.models = {}
        self.registry_dir = os.path.join(os.path.dirname(__file__), 'saved')
        self.explainers = {}

    def get_model(self, model_name: str):
        if model_name not in self.models:
            print(f"Loading real trained model pipeline: {model_name}.pkl")
            try:
                path = os.path.join(self.registry_dir, f"{model_name}.pkl")
                self.models[model_name] = joblib.load(path)
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {e}")
                self.models[model_name] = None
        return self.models[model_name]

    def get_explainer(self, classifier):
        if shap is None:
            return None
        if "xgboost" not in self.explainers:
            self.explainers["xgboost"] = shap.TreeExplainer(classifier)
        return self.explainers["xgboost"]

registry = ModelRegistry()

def map_to_supervised_schema(transaction: dict):
    return pd.DataFrame([{
        'Transaction_Amount': float(transaction.get('amount', 0)),
        'State': transaction.get('location', 'Unknown'),
        'Transaction_Device': transaction.get('device_id', 'Unknown'),
        'Merchant_Category': transaction.get('merchant_category', 'Unknown')
    }])

def score_transaction(transaction: dict):
    df = map_to_supervised_schema(transaction)

    # --- 1. Fetch XGBoost Pipeline ---
    xgboost_pipeline = registry.get_model("xgboost_pipeline")
    ensemble_score = 0.0
    shap_reasons = []
    
    if xgboost_pipeline:
        try:
            # Get probability
            ensemble_score = xgboost_pipeline.predict_proba(df)[0][1]
            
            # --- 2. Generate SHAP Explanations for insights (optional, expensive) ---
            if ENABLE_SHAP_EXPLANATIONS and ensemble_score > 0.7:
                preprocessor = xgboost_pipeline.named_steps["preprocessor"]
                classifier = xgboost_pipeline.named_steps["classifier"]
                X_preprocessed = preprocessor.transform(df)
                
                explainer = registry.get_explainer(classifier)
                if explainer is not None:
                    shap_values = explainer.shap_values(X_preprocessed)
                    feature_names = preprocessor.get_feature_names_out()

                    contributions = {feat: val for feat, val in zip(feature_names, shap_values[0])}
                    sorted_contributions = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)

                    for feat, impact in sorted_contributions[:3]:
                        clean_feat = feat.replace("num__", "").replace("cat__", "")
                        if impact > 0:
                            shap_reasons.append(f"AI Warning: {clean_feat} increases risk (+{impact:.2f} log-odds).")
        except Exception as e:
            logger.error(f"XGBoost scoring failed: {e}")

    return {
        "ensemble_score": round(ensemble_score, 4),
        "shap_reasons": shap_reasons
    }

from rules.rules_engine import run_rules
from models.model_registry import score_transaction
from storage.transaction_logger import log_decision_to_db

def evaluate_transaction_pipeline(transaction: dict, persist: bool = True):
    """
    Core pipeline: executes rules, ML models, and outputs a final decision.
    """
    # 1. Quick Rules Evaluation (Fast Path)
    rules_result = run_rules(transaction)
    
    # 2. ML Model Scoring (XGBoost + SHAP)
    ml_scores = score_transaction(transaction)
    
    # 3. Decision Logic
    decision = "APPROVE"
    reasons = rules_result["reasons"]
    
    # --- IF rules say BLOCK/MFA, prioritize it ---
    if rules_result["decision"] == "BLOCK":
        decision = "BLOCK"
    elif rules_result["decision"] == "MFA":
        decision = "MFA"
    else:
        # --- ELSE use the XGBoost risk score ---
        ensemble_score = ml_scores.get("ensemble_score", 0.0)
        shap_reasons = ml_scores.get("shap_reasons", [])
        
        # BLOCK if risk > 0.85
        if ensemble_score > 0.85:
            decision = "BLOCK"
            reasons.extend(shap_reasons)
            reasons.append(f"High risk score from XGBoost: {ensemble_score:.4f}")
        # MFA if risk > 0.5
        elif ensemble_score > 0.5:
            decision = "MFA"
            reasons.extend(shap_reasons)
            reasons.append(f"Uncertain risk score from XGBoost (escalate to MFA): {ensemble_score:.4f}")
        else:
            decision = "APPROVE"
        
    if persist:
        log_decision_to_db(
            transaction_id=transaction.get("transaction_id"),
            decision=decision,
            risk_score=ml_scores.get("ensemble_score", 0.0),
            reasons=reasons
        )
        
    return {
        "transaction_id": transaction.get("transaction_id"),
        "decision": decision,
        "risk_scores": ml_scores,
        "reasons": reasons
    }

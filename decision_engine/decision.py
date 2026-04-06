from rules.rules_engine import run_rules
from models.model_registry import score_transaction
from storage.transaction_logger import log_decision_to_db
import logging

logger = logging.getLogger("sentinel.decision")

def evaluate_transaction_pipeline(transaction: dict, persist: bool = True):
    """
    Orchestrates the fraud decision pipeline for a single transaction.
    
    The pipeline processes events in three distinct stages:
    1. Deterministic Rules (Fast Path): Safety guardrails and simple logic.
    2. ML Scoring (ML Path): High-confidence risk probability from XGBoost.
    3. Final Decision Policy: Aggregates rule + ML signals into a verdict.
    """
    transaction_id = transaction.get("transaction_id", "unknown")
    logger.debug(f"Starting decision pipeline for {transaction_id}")
    
    # --- 1. Deterministic Rule Checks ---
    # Fast-path logic for hard blocks or mandatory escalations.
    rules_result = run_rules(transaction)
    
    # --- 2. Probabilistic ML Scoring ---
    # Real-time risk scoring, optionally including SHAP feature importance.
    ml_scores = score_transaction(transaction)
    
    # --- 3. Final Decision Logic ---
    decision = "APPROVE"
    reasons = rules_result["reasons"]
    
    # Rule engine priority: if a safety rule triggers a BLOCK/MFA, it takes precedence.
    if rules_result["decision"] == "BLOCK":
        decision = "BLOCK"
    elif rules_result["decision"] == "MFA":
        decision = "MFA"
    else:
        # Use ML-based thresholds if rules pass.
        ensemble_score = ml_scores.get("ensemble_score", 0.0)
        shap_reasons = ml_scores.get("shap_reasons", [])
        
        # High-risk threshold
        if ensemble_score > 0.85:
            decision = "BLOCK"
            reasons.extend(shap_reasons)
            reasons.append(f"XGBoost risk threshold exceeded: {ensemble_score:.4f}")
        # Medium-risk threshold (step-up authentication)
        elif ensemble_score > 0.5:
            decision = "MFA"
            reasons.extend(shap_reasons)
            reasons.append(f"XGBoost moderate risk detected: {ensemble_score:.4f}")
        else:
            decision = "APPROVE"
            
    logger.info(f"Final verdict for {transaction_id} | Result: {decision}")
        
    if persist:
        # Standardize record logging to local ledger
        log_decision_to_db(
            transaction_id=transaction_id,
            decision=decision,
            risk_score=ml_scores.get("ensemble_score", 0.0),
            reasons=reasons
        )
        
    return {
        "transaction_id": transaction_id,
        "decision": decision,
        "risk_scores": ml_scores,
        "reasons": reasons
    }

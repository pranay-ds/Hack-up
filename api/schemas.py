from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class Transaction(BaseModel):
    transaction_id: str = Field(..., description="Unique ID for the transaction")
    user_id: str = Field(..., description="ID of the user making the transaction")
    amount: float = Field(..., description="Transaction amount")
    currency: str = Field(default="USD")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    merchant_id: str
    location: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class RiskResponse(BaseModel):
    transaction_id: str
    decision: str = Field(..., description="APPROVE, BLOCK, or MFA")
    risk_score: float = Field(..., description="0.0 to 1.0 probability of fraud")
    reasons: list[str] = Field(default_factory=list, description="Reasons for the decision")

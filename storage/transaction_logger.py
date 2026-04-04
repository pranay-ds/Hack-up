from sqlalchemy import create_engine, Column, String, Float, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

class TransactionLog(Base):
    """
    SQLAlchemy Table declaring exactly what columns we need to persist forever in our Ledger.
    """
    __tablename__ = 'transaction_ledger'
    
    transaction_id = Column(String, primary_key=True)
    decision = Column(String)
    risk_score = Column(Float)
    reasons = Column(Text)  # Stored as JSON Text
    timestamp = Column(DateTime, default=datetime.utcnow)

# Configure SQLite natively since Docker is not available.
# To switch to Postgres later, literally just change 'sqlite:///...' to 'postgresql://user:pass@host...' !
engine = create_engine('sqlite:///fraud_ledger.db', echo=False, connect_args={"check_same_thread": False})
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def log_decision_to_db(transaction_id: str, decision: str, risk_score: float, reasons: list):
    """
    Called by the stream processor. Asynchronously dumps decisions into the database.
    """
    try:
        with Session() as session:
            log_entry = TransactionLog(
                transaction_id=str(transaction_id),
                decision=decision,
                risk_score=float(risk_score) if risk_score else 0.0,
                reasons=json.dumps(reasons)
            )
            session.merge(log_entry) # Prevents crashing if transaction ingested twice
            session.commit()
    except Exception as e:
        logger.error(f"Failed to log transaction {transaction_id} to DB: {e}")

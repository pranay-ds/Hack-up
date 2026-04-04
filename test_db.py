from decision_engine.decision import evaluate_transaction_pipeline
from sqlalchemy import create_engine
import pandas as pd
import json

def run_test():
    transaction = {
        "transaction_id": "TEST-DB-ARCHIVE-002",
        "user_id": "U1234",
        "amount": 40000.00, # Bypasses hard threshold to test ML
        "location": "Russia",
        "device_id": "Unknown-Device",
        "merchant_category": "Crypto"
    }

    print("Pushing anomalous transaction through Decision Engine...")
    result = evaluate_transaction_pipeline(transaction)
    print(f"Engine decided to: {result['decision']}")
    
    print("\n[VERIFICATION] Running SELECT * FROM transaction_ledger...")
    engine = create_engine('sqlite:///fraud_ledger.db')
    
    # Read the data back using Pandas for nice console formatting
    df = pd.read_sql("SELECT * FROM transaction_ledger WHERE transaction_id='TEST-DB-ARCHIVE-002'", engine)
    
    print("\n====== DATABASE ARCHIVE RECORD ======")
    for index, row in df.iterrows():
        print(f"Transaction ID: {row['transaction_id']}")
        print(f"Timestamp:      {row['timestamp']}")
        print(f"Risk Score:     {row['risk_score']}")
        print(f"Decision:       {row['decision']}")
        
        reasons = json.loads(row['reasons'])
        print(f"Logged Reasons:")
        for r in reasons:
            print(f"  - {r}")
    print("=====================================")

if __name__ == "__main__":
    run_test()

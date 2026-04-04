import time
import csv
from ingestion.producer import produce_transaction_event

# Wait for background Kafka to boot up!
print("Waiting 15 seconds for Kafka broker to come online...")
time.sleep(15)

def stream_real_data(csv_file="Bank_Transaction_Fraud_Detection.csv"):
    print(f"Reading real transactions from {csv_file}...")
    
    try:
        with open(csv_file, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Map the CSV columns to the dictionary format our ML Pipeline expects
                txn = {
                    "transaction_id": row["Transaction_ID"],
                    "user_id": row["Customer_ID"],
                    "amount": float(row["Transaction_Amount"]),
                    "location": row["State"],
                    "device_id": row["Transaction_Device"],
                    "currency": row["Transaction_Currency"],
                    "merchant_category": row["Merchant_Category"],
                    "time": f"{row['Transaction_Date']} {row['Transaction_Time']}",
                    
                    # Passing this along so we can see if the system correctly guessed the fraud!
                    "actual_is_fraud": row["Is_Fraud"] 
                }
                
                print(f"Streaming TXN {txn['transaction_id']} | Amount: ${txn['amount']}")
                produce_transaction_event(txn)
                
                # Sleep a tiny bit to realistically simulate live streaming (so your console doesn't explode)
                time.sleep(1.0)
                
    except FileNotFoundError:
        print(f"Error: Could not find {csv_file} in the project folder!")

if __name__ == "__main__":
    print("Starting Live Stream Simulator...")
    stream_real_data()


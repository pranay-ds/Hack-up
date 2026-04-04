import time
import random
import requests
import uuid

API_URL = "http://localhost:8000/api/v1/evaluate"

def generate_transaction():
    is_fraud = random.random() > 0.95
    amount = random.uniform(5.0, 50000.0) if is_fraud else random.uniform(1.0, 1000.0)
    
    return {
        "transaction_id": str(uuid.uuid4()),
        "user_id": f"U_{random.randint(1000, 9999)}",
        "amount": round(amount, 2),
        "currency": "USD",
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "merchant_id": f"M_{random.randint(100, 999)}",
        "location": random.choice(["US", "UK", "CA", "FR", "DE"]),
        "device_id": f"DEV_{random.randint(1000, 9999)}",
        "ip_address": f"{random.randint(1,255)}.{random.randint(1,255)}.0.1",
        "metadata": {
            "txn_count_1h": random.randint(1, 15) if is_fraud else random.randint(1, 3)
        }
    }

def run_simulation(count=100, delay=0.5):
    print(f"Starting transaction simulation. Targeting API at {API_URL}")
    for i in range(count):
        tx = generate_transaction()
        try:
            resp = requests.post(API_URL, json=tx)
            if resp.status_code == 200:
                print(f"[{i+1}/{count}] TX: {tx['amount']:>8.2f} USD -> Risk: {resp.json().get('decision')}")
            else:
                print(f"Failed: {resp.text}")
        except Exception as e:
            print(f"API unreachable: {e}")
            break
        time.sleep(delay)

if __name__ == "__main__":
    run_simulation()

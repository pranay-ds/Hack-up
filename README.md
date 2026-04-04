# 🛡️ Sentinel: Production-Grade Fraud Detection System

This project is a localized, real-time financial fraud detection system utilizing a modular architecture. While the infrastructure supports heavy Kafka streaming and PyFlink processing via Docker, the codebase is configured to intelligently fall back to a purely native Python execution mode for immediate local testing.

---

## 🚀 Quick Run Guide (No Docker Required)

To see the system evaluating anomalies in real-time, you need to open **three separate terminal windows**.

### 1. Start the API Gateway
The API receives transaction payloads. If Kafka is absent, it routes payloads directly to our ML Ensemble & Rules Engine.

Open Terminal 1 in the project root (`olaa/`) and run:
```powershell
python -m api.app
```
*(You will see a "Failed to connect to Kafka" warning—this is expected. The API has successfully switched to Fallback Mode and is running on port 8000).*

### 2. Launch the Threat Dashboard
The frontend is a beautifully styled React + Vite glassmorphic UI visualizing the real-time datastream.

Open Terminal 2, navigate to the frontend directory, and start the Vite server:
```powershell
cd frontend
npm.cmd run dev
```
*(Once running, `CTRL + Click` the `http://localhost:5173` link in the terminal to view the dashboard in your browser).*

### 3. Generate Synthetic Traffic
We need transactions to evaluate! This testing script acts as a firehose, blasting the API with both legitimate and synthetic fraudulent transactions.

Open Terminal 3 in the project root (`olaa/`) and run:
```powershell
python tests/test_pipeline.py
```

### 🎉 The Result
Return to your browser where the React Dashboard is open. You will immediately see the transaction pipeline react in real-time as the Python server evaluates risk scores and outputs `APPROVE`, `MFA`, or `BLOCK` verdicts on the fly!

---

## 🏗️ Phase 2: Full Distributed Mode (Requires Docker)

To run the system explicitly through the asynchronous Streaming pipeline instead of the API fallback:

1. Ensure **Docker Desktop** is running.
2. Spin up the infrastructure broker:
   ```powershell
   docker compose up -d
   ```
3. Start the Kafka Stream Processor in a terminal:
   ```powershell
   python streaming/flink_job.py
   ```
4. Start the API, Dashboard, and test scripts exactly as outlined in the quick run guide above. Payload data will now flow across Kafka topics before hitting the evaluation engine!

@echo off
echo Starting Fraud Detection Backend (FastAPI)...
start "FastAPI Backend" cmd /k "python -m uvicorn api.app:app --reload --host 0.0.0.0 --port 8000"

echo Starting React Dashboard...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo Dashboard services are booting up in background windows!

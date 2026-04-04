@echo off
SETLOCAL EnableDelayedExpansion

echo 🛡️  Starting Sentinel Fraud Detection Demo...
echo --------------------------------------------

:: 1. Check for Python dependencies
echo [1/3] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b
)
pip install -r requirements.txt --quiet

:: 2. Start the API Gateway in a new window
echo [2/3] Launching API Gateway (Backend)...
start "Sentinel API" cmd /c "python -m api.app"

:: 3. Launch the Frontend
echo [3/3] Launching Threat Dashboard (Frontend)...
cd frontend
:: Using npm.cmd to bypass PowerShell execution policy issues on Windows
start "Sentinel Dashboard" cmd /c "npm.cmd run dev"

echo.
echo ✅ System is booting up!
echo - API is running on http://localhost:8000
echo - Dashboard will be available shortly on http://localhost:5173
echo.
echo Press any key to stop the demo simulator...
pause >nul

:: Optional: Clean up could go here
echo Shutting down...
taskkill /FI "WINDOWTITLE eq Sentinel API*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Sentinel Dashboard*" /T /F >nul 2>&1
echo Done.

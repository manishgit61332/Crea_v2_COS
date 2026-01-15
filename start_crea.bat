@echo off
echo ===================================================
echo     STARTING CREA: THE AI CHIEF OF STAFF
echo ===================================================
echo.
echo [1/2] Connecting to Neural Network (Backend :3001)...
start "CREA Backend" cmd /k "cd crea-backend && npm start"

echo [2/2] Launching Command Center (Web :3000)...
start "CREA Dashboard" cmd /k "cd crea-web && npm run dev"

echo.
echo ===================================================
echo ✅ SYSTEMS GO.
echo.
echo PLEASE ENSURE YOU HAVE UPDATED THE .ENV FILES:
echo   - crea-backend/.env
echo   - crea-web/.env.local
echo ===================================================
pause

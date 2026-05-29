@echo off
title LucyCore AGI System
echo ===================================================
echo        LucyCore AGI System OS - Startup Script
echo ===================================================
echo.
echo Installing node modules (if they are missing)...
call npm install
echo.
echo Starting the Express Backend and Vite Frontend Server...
echo The LucyCore OS will be available at http://localhost:3000
echo.
call npm run dev
pause

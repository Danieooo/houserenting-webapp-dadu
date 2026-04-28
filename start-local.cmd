@echo off
REM Start backend and frontend locally in separate command windows.

set ROOT_DIR=%~dp0

start "Backend" cmd /k "cd /d "%ROOT_DIR%backend" && npm.cmd run dev"
start "Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && npm.cmd run dev"
start "Browser" "http://localhost:5173"
echo Local development servers are starting in separate windows.
echo Backend: backend\src\index.js
echo Frontend: frontend\src\main.jsx
exit /b 0

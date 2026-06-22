@echo off
REM Starts the full stack (Postgres + backend + frontend) in separate windows.
REM Double-click this file, or run it from cmd. No PowerShell policy needed.

echo Starting PostgreSQL...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgdata" -l "%~dp0pg.log" -o "-p 5432" start
timeout /t 2 >nul

echo Starting backend on http://localhost:8000 ...
start "Sahel Backend" /d "%~dp0backend" cmd /k C:\Users\mdakr\AppData\Local\Python\pythoncore-3.14-64\python.exe -m uvicorn app.main:app --port 8000

echo Starting frontend on http://localhost:3000 ...
start "Sahel Frontend" /d "%~dp0frontend" cmd /k npm run dev

echo.
echo ============================================================
echo  Open http://localhost:3000
echo  Logins (password: Passw0rd!):
echo    admin +201000000001 ^| host +201000000002 ^| guest +201000000003
echo ============================================================
echo (Two new windows opened - keep them running. Close them to stop.)
pause

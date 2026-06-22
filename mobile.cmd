@echo off
REM Starts the FULL stack + a public mobile URL, in persistent windows.
REM Double-click this file. Keep the windows open while testing on your phone.
cd /d "%~dp0"

echo Starting PostgreSQL...
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgdata" -l "%~dp0pg.log" -o "-p 5432" start
timeout /t 3 >nul

echo Starting backend (port 8000)...
start "WDX Backend" /d "%~dp0backend" cmd /k C:\Users\mdakr\AppData\Local\Python\pythoncore-3.14-64\python.exe -m uvicorn app.main:app --port 8000

echo Starting frontend (port 3000)...
start "WDX Frontend" /d "%~dp0frontend" cmd /k npm run dev

echo Waiting for the frontend to compile...
timeout /t 14 >nul

echo Opening the public mobile tunnel...
start "WDX Mobile Tunnel" /d "%~dp0" cmd /k cloudflared.exe tunnel --url http://localhost:3000

echo.
echo ============================================================
echo  Your phone URL appears in the "WDX Mobile Tunnel" window
echo  as a  https://xxxxx.trycloudflare.com  link.
echo  Open that link on your phone (any network).
echo.
echo  Demo logins (password: Passw0rd!):
echo    host 201000000002 ^| guest 201000000003 ^| admin 201000000001
echo.
echo  Keep these windows open. Closing them stops the site.
echo ============================================================
pause

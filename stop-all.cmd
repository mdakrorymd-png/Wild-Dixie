@echo off
REM Stops PostgreSQL. Close the backend/frontend windows to stop them.
"%~dp0pgsql\bin\pg_ctl.exe" -D "%~dp0pgdata" stop
echo PostgreSQL stopped. Close the backend and frontend windows too.
pause

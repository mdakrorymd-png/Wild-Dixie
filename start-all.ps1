# Starts the full local stack: Postgres + FastAPI backend + Next.js frontend.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
& "$root\pgsql\bin\pg_ctl.exe" -D "$root\pgdata" -l "$root\pg.log" -o "-p 5432" start
Start-Sleep -Seconds 2

Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python -m uvicorn app.main:app --port 8000"

Write-Host "Starting frontend on http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "Stack starting. Open http://localhost:3000" -ForegroundColor Green
Write-Host "Demo logins (password: Passw0rd!):" -ForegroundColor Green
Write-Host "  admin +201000000001 | host +201000000002 | guest +201000000003"

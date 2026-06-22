# Stops the local Postgres server. Close the backend/frontend windows to stop them.
$root = $PSScriptRoot
& "$root\pgsql\bin\pg_ctl.exe" -D "$root\pgdata" stop
Write-Host "Postgres stopped. Close the backend & frontend terminal windows to stop them." -ForegroundColor Yellow

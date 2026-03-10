# Yummo Development Links Launcher
# Run this script to open the development dashboard

param(
    [switch]$Frontend,
    [switch]$Backend,
    [switch]$Docs,
    [switch]$Dashboard
)

if ($Frontend) {
    Start-Process "http://localhost:8080"
    Write-Host "Opening Frontend (Web)..." -ForegroundColor Green
}
elseif ($Backend) {
    Start-Process "http://localhost:8000"
    Write-Host "Opening Backend API..." -ForegroundColor Green
}
elseif ($Docs) {
    Start-Process "http://localhost:8000/docs"
    Write-Host "Opening API Documentation..." -ForegroundColor Green
}
elseif ($Dashboard) {
    $dashboardPath = Join-Path $PSScriptRoot "web.html"
    if (Test-Path $dashboardPath) {
        Start-Process $dashboardPath
        Write-Host "Opening Development Dashboard..." -ForegroundColor Green
    } else {
        Write-Host "Dashboard file not found. Please run from the project root directory." -ForegroundColor Red
    }
}
else {
    Write-Host "Yummo Development Links" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\web.ps1 -Frontend    # Open React frontend"
    Write-Host "  .\web.ps1 -Backend     # Open FastAPI backend"
    Write-Host "  .\web.ps1 -Docs        # Open API documentation"
    Write-Host "  .\web.ps1 -Dashboard   # Open development dashboard"
    Write-Host ""
    Write-Host "Direct URLs:" -ForegroundColor Yellow
    Write-Host "  Frontend: http://localhost:8080"
    Write-Host "  Backend:  http://localhost:8000"
    Write-Host "  API Docs: http://localhost:8000/docs"
    Write-Host "  Dashboard: .\web.html"
}
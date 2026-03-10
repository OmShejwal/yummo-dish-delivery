@echo off
echo Yummo Development Links
echo ======================
echo.
echo Choose an option:
echo 1. Open Frontend (Web)
echo 2. Open Backend API
echo 3. Open API Documentation
echo 4. Open Development Dashboard
echo 5. Open All
echo.
set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    start http://localhost:8080
    echo Opening Frontend...
) else if "%choice%"=="2" (
    start http://localhost:8000
    echo Opening Backend API...
) else if "%choice%"=="3" (
    start http://localhost:8000/docs
    echo Opening API Documentation...
) else if "%choice%"=="4" (
    start web.html
    echo Opening Development Dashboard...
) else if "%choice%"=="5" (
    start http://localhost:8080
    start http://localhost:8000
    start http://localhost:8000/docs
    start web.html
    echo Opening all services...
) else (
    echo Invalid choice. Please run again and choose 1-5.
)

pause
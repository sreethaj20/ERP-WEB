@echo off
echo Setting up ERP Backend on Windows...
echo ===================================

echo.
echo 1. Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check the output above.
    pause
    exit /b 1
)

echo.
echo 2. Setting up PM2...
call npm install -g pm2

if %ERRORLEVEL% NEQ 0 (
    echo Error installing PM2. Please check the output above.
    pause
    exit /b 1
)

echo.
echo 3. Creating required directories...
if not exist "logs" mkdir logs
if not exist "backups" mkdir backups

:: Create a .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy ".env.example" ".env"
)

echo.
echo 4. Setting up firewall rules...
PowerShell -NoProfile -ExecutionPolicy Bypass -File "scripts/configure-firewall.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to configure firewall rules. You may need to run this script as Administrator.
    pause
)

echo.
echo 5. Setting up PM2 startup...
PowerShell -NoProfile -ExecutionPolicy Bypass -File "scripts/setup-pm2-startup.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to set up PM2 startup. You may need to run this script as Administrator.
    pause
)

echo.
echo 6. Creating a test backup...
call scripts\backup-db.bat

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Database backup test failed. Make sure PostgreSQL is running and credentials are correct.
    pause
)

echo.
echo ===================================
echo Setup completed!
echo.
echo Next steps:
echo 1. Edit the .env file with your configuration
echo 2. Start the application: npm start
echo 3. To run in production: pm2 start ecosystem.config.js
echo 4. To view logs: pm2 logs
echo.
pause

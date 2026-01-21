@echo off
setlocal enabledelayedexpansion

:: Set PostgreSQL bin directory (update this path to your PostgreSQL bin directory)
set PGBIN="C:\Program Files\PostgreSQL\18\bin"

:: Set backup directory
set BACKUP_DIR=%~dp0..\backups

:: Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
    set _date=%%c-%%a-%%b
)
for /f "tokens=1-3 delims=:." %%a in ('time /t') do (
    set _time=%%a-%%b-%%c
)
set TIMESTAMP=!_date!_!_time!

:: Set backup file path
set BACKUP_FILE=erp_backup_!TIMESTAMP!.sql
set BACKUP_PATH="%BACKUP_DIR%\!BACKUP_FILE!"

:: Database connection details
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=erp
set DB_USER=erp_app_user
set DB_PASSWORD=sreethaj

echo Starting backup of %DB_NAME% to %BACKUP_PATH%...

"%PGBIN%\pg_dump.exe" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f %BACKUP_PATH% -F p -b -v

if errorlevel 1 (
    echo Backup failed with error code %errorlevel%
    exit /b 1
) else (
    echo Backup completed successfully: %BACKUP_PATH%
    
    :: Delete backups older than 7 days
    forfiles /p "%BACKUP_DIR%" /m erp_backup_*.sql /d -7 /c "cmd /c del @path"
    
    echo Deleted backups older than 7 days
)

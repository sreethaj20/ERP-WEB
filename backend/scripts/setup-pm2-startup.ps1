# Run this script as Administrator

# Install PM2 if not already installed
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    npm install -g pm2
}

# Create PM2 startup script
pm2 startup

# Save the current PM2 process list
pm2 save

# Create a scheduled task to start PM2 on system startup
$action = New-ScheduledTaskAction -Execute "npm" -Argument "start" -WorkingDirectory "$PSScriptRoot\.."
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Register the task
Register-ScheduledTask -TaskName "ERP Backend PM2" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -Force

Write-Host "PM2 startup configuration completed. The ERP backend will start automatically on system startup." -ForegroundColor Green

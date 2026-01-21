# Run this script as Administrator

# Allow Node.js through Windows Firewall
$ruleName = "Node.js ERP Server"
$port = 4000

# Remove existing rule if it exists
if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName $ruleName
}

# Create new rule
New-NetFirewallRule -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort $port `
    -Profile Any `
    -Description "Allow inbound traffic for ERP backend on port $port"

Write-Host "Firewall rule '$ruleName' has been configured to allow traffic on port $port" -ForegroundColor Green

# Show current rules (optional)
# Get-NetFirewallRule -DisplayName $ruleName | Format-Table -Property DisplayName, Enabled, Direction, Action, Profile

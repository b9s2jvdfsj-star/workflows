param(
    [Parameter(Mandatory=$true)]
    [string]$Region,
    [Parameter(Mandatory=$true)]
    [string]$Topic
)

# Define variables (replace with your values)
$server = "your-server-address"     # <-- REPLACE WITH YOUR SERVER IP/HOSTNAME
$user   = "your-username"           # <-- REPLACE WITH YOUR SSH USERNAME
$key    = "C:\path\to\your\private\key"  # <-- REPLACE WITH FULL PATH TO YOUR PRIVATE KEY

# Create local output directory if it doesn't exist
$outputDir = ".\output"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Build the remote command string
$remoteCommand = "set -e && cd ~/global-video-engine && echo ""Fetching latest code..."" && git fetch origin && git reset --hard origin/main && git pull origin main > /dev/null 2>&1 && echo ""Installing dependencies..."" && npm ci > /dev/null 2>&1 && echo ""Running assemble.js for region: '" + $Region + "', topic: '" + $Topic + "'' && node assemble.js ""'" + $Region + "'' ""'" + $Topic + "''"""

Write-Host "Remote command: $remoteCommand"


# Global Video Engine - Batch Render Script (PowerShell)
# This script renders videos for all markets defined in markets.json
# Using the exact format that worked in the error message example: --props="C:\\path\\to\\file.json"

# Ensure output directory exists
$outputDir = "out"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Read the markets configuration
$configPath = "config/markets.json"
if (-not (Test-Path $configPath)) {
    Write-Error "Configuration file not found: $configPath"
    exit 1
}

try {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    $markets = $config.markets
} catch {
    Write-Error "Failed to parse configuration file: $_"
    exit 1
}

Write-Host "Starting batch render for $($markets.Count) markets..." -ForegroundColor Green

$successCount = 0
$failedCount = 0

foreach ($market in $markets) {
    $region = $market.region
    $title = $market.title
    $jsonFile = "config/${region}-props.json"
    
    if (-not (Test-Path $jsonFile)) {
        Write-Host "File not found: $jsonFile" -ForegroundColor Yellow
        continue
    }

    # Get the absolute path and replace single backslashes with double backslashes for the CLI
    $absolutePath = (Resolve-Path $jsonFile).Path
    $escapedPath = $absolutePath -replace '\\', '\\\\'
    
    Write-Host "Rendering for ${region}..." -ForegroundColor Cyan
    
    # Use the exact format: --props="C:\\path\\to\\file.json"
    & npx remotion render remotion/index.tsx my-composition "out/${region}-video.mp4" --props="\"$escapedPath\""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully rendered ${region}." -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "Error rendering ${region}." -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ("Batch rendering complete! Success: {0}, Failed: {1}" -f $successCount, $failedCount) -ForegroundColor Green

if ($failedCount -gt 0) {
    exit 1
}
# Global Video Engine - Batch Render Script (PowerShell)
# This script renders videos for all markets by creating temporary props files
# This avoids Windows path escaping and JSON parsing issues with inline props

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
    $language = $market.language
    
    # Create output filename
    $outputFile = Join-Path $outputDir ("{0}-video.mp4" -f $region)
    
    # Create temporary props file
    $tempPropsPath = "$env:TEMP\global-video-props-{0}.json" -f $region
    
    try {
        # Create the props data
        $propsData = @{
            region = $region
            title = $title
            language = $language
        }
        
        # Write the props to the temporary file
        $propsData | ConvertTo-Json | Set-Content -Path $tempPropsPath -Encoding UTF8
        
        Write-Host ("Rendering for {0}: {1}" -f $region, $title) -ForegroundColor Cyan
        
        # Render with the temporary props file
        & npx remotion render remotion/index.tsx my-composition $outputFile --props $tempPropsPath --concurrency=2 --image-format=jpeg
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ("[SUCCESS] Completed: {0}" -f $outputFile) -ForegroundColor Green
            $successCount++
        } else {
            Write-Error ("[FAILED] Failed: {0}" -f $outputFile)
            $failedCount++
        }
    } finally {
        # Clean up the temporary props file
        if (Test-Path $tempPropsPath) {
            Remove-Item $tempPropsPath -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ("Batch rendering complete! Success: {0}, Failed: {1}" -f $successCount, $failedCount) -ForegroundColor Green

if ($failedCount -gt 0) {
    exit 1
}
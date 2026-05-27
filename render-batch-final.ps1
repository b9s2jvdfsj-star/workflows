# Global Video Engine - Batch Render Script
# Optimized for speed: Externalizes content and enables batch rendering

param(
    [string]$ConfigPath = "config/markets.json",
    [string]$CompositionPath = "remotion/index.tsx",
    [string]$OutputDir = "out",
    [int]$Concurrency = 2,
    [string]$ImageFormat = "jpeg"
)

# Ensure output directory exists
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

# Ensure config directory exists for props files
New-Item -ItemType Directory -Path "config" -Force | Out-Null

# Read market configuration
if (-not (Test-Path $ConfigPath)) {
    Write-Error "Configuration file not found: $ConfigPath"
    exit 1
}

try {
    $config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
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
    $outputFile = Join-Path $OutputDir ("{0}-video.mp4" -f $region)
    
    # Create props JSON file in config directory
    $propsPath = Join-Path "config" ("{0}-props.json" -f $region)
    $propsData = @{
        region = $region
        title = $title
        language = $language
    }
    $propsData | ConvertTo-Json | Out-File -FilePath $propsPath -Encoding utf8
    
    Write-Host ("Rendering for {0}: {1}" -f $region, $title) -ForegroundColor Cyan
    
    # Point Remotion to the props file
    & npx remotion render $CompositionPath my-composition $outputFile --props=$propsPath --concurrency=$Concurrency --image-format=$ImageFormat
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ("[SUCCESS] Completed: {0}" -f $outputFile) -ForegroundColor Green
        $successCount++
    } else {
        Write-Error ("[FAILED] Failed: {0}" -f $outputFile)
        $failedCount++
    }
    
    # Clean up props file after rendering
    Remove-Item $propsPath -ErrorAction SilentlyContinue
}

Write-Host ("Batch rendering complete! Success: {0}, Failed: {1}" -f $successCount, $failedCount) -ForegroundColor Green

if ($failedCount -gt 0) {
    exit 1
}
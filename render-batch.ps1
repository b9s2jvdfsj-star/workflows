# Batch Render Script for Global Video Engine
# Reads market configuration and renders localized videos

param(
    [string]$ConfigPath = "config/markets.json",
    [string]$CompositionPath = "remotion/index.tsx",
    [string]$OutputDir = "out",
    [int]$Concurrency = 2,
    [string]$ImageFormat = "jpeg"
)

# Ensure output directory exists
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

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
    } else {
        Write-Error ("[FAILED] Failed: {0}" -f $outputFile)
    }
}

Write-Host "Batch rendering complete!" -ForegroundColor Green
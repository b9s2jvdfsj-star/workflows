# Batch Render Script for Global Video Engine
# Creates temporary component files for each market and renders them

param(
    [string]$ConfigPath = "config/markets.json",
    [string]$BaseComponentPath = "remotion/index.tsx",
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

$successCount = 0
$failedCount = 0

# Read the base component template
$baseTemplate = Get-Content $BaseComponentPath -Raw

foreach ($market in $markets) {
    $region = $market.region
    $title = $market.title
    $language = $market.language
    
    # Create output filename
    $outputFile = Join-Path $OutputDir ("{0}-video.mp4" -f $region)
    
    # Create temporary component file
    $tempComponentPath = "$env:TEMP\global-video-{0}.tsx" -f $region
    
    try {
        # Replace placeholders in the template with actual values
        $componentContent = $baseTemplate
            -replace 'region="[^"]*"', ("region=""{0}""" -f $region)
            -replace 'title="[^"]*"', ("title=""{0}""" -f $title)
        
        # Save the temporary component
        $componentContent | Set-Content -Path $tempComponentPath -Encoding UTF8
        
        Write-Host ("Rendering for {0}: {1}" -f $region, $title) -ForegroundColor Cyan
        
        # Render the temporary component
        & npx remotion render $tempComponentPath my-composition $outputFile --concurrency=$Concurrency --image-format=$ImageFormat
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ("[SUCCESS] Completed: {0}" -f $outputFile) -ForegroundColor Green
            $successCount++
        } else {
            Write-Error ("[FAILED] Failed: {0}" -f $outputFile)
            $failedCount++
        }
    } finally {
        # Clean up temporary component file
        if (Test-Path $tempComponentPath) {
            Remove-Item $tempComponentPath -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ("Batch rendering complete! Success: {0}, Failed: {1}" -f $successCount, $failedCount) -ForegroundColor Green

if ($failedCount -gt 0) {
    exit 1
}
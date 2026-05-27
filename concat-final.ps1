# Concatenate intro, market video, and outro for each market
# Outputs to public/videos/final/

# Ensure output directory exists
$finalDir = "public/videos/final"
if (-not (Test-Path $finalDir)) {
    New-Item -ItemType Directory -Path $finalDir | Out-Null
}

# Get the project root (current directory)
$projectRoot = (Get-Location).Path

# List of markets (matching the file names in out/)
$markets = @("usa", "uk", "australia", "canada", "global")

foreach ($market in $markets) {
    $introPath = Join-Path $projectRoot "out/intro.mp4"
    $marketPath = Join-Path $projectRoot ("out/$market-video.mp4")
    $outroPath = Join-Path $projectRoot "out/outro.mp4"
    $outputPath = Join-Path $finalDir ("{0}-final.mp4" -f $market)
    
    # Check if market video exists
    if (-not (Test-Path $marketPath)) {
        Write-Warning "Market video not found: $marketPath"
        continue
    }
    
    # Create a temporary file list for concat (use forward slashes)
    $tempList = "$env:TEMP\concat-$market.txt"
    @(
        "file '$($introPath.Replace('\','/'))'"
        "file '$($marketPath.Replace('\','/'))'"
        "file '$($outroPath.Replace('\','/'))'"
    ) | Set-Content -Path $tempList -Encoding ASCII
    
    # Run ffmpeg to concatenate
    & ffmpeg -y -f concat -safe 0 -i $tempList -c copy $outputPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ("Successfully created: {0}" -f $outputPath) -ForegroundColor Green
    } else {
        Write-Error ("Failed to create: {0}" -f $outputPath)
    }
    
    # Clean up temp list
    Remove-Item $tempList -ErrorAction SilentlyContinue
}

Write-Host "All concatenations complete." -ForegroundColor Green
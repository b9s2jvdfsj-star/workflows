# Batch Render All Script for Global Video Engine
# Iterates through all .json props files in /config and renders corresponding videos to /out

# Ensure output directory exists
New-Item -ItemType Directory -Path "out" -Force | Out-Null

# Get all JSON files in config directory, excluding markets.json
$propsFiles = Get-ChildItem -Path "config" -Filter "*.json" | 
              Where-Object { $_.Name -ne "markets.json" }

Write-Host "Found $($propsFiles.Count) props files to process." -ForegroundColor Green

foreach ($propsFile in $propsFiles) {
    # Extract region from filename (removing -props.json suffix)
    $region = $propsFile.BaseName.Replace("-props", "")
    
    # If the filename doesn't follow the pattern, try to get region from JSON content
    if (-not $region) {
        try {
            $propsContent = Get-Content $propsFile.FullName -Raw | ConvertFrom-Json
            $region = $propsContent.region
        } catch {
            Write-Warning "Could not determine region for $($propsFile.Name), skipping..."
            continue
        }
    }
    
    # Define output filename
    $outputFile = "out\$region-video.mp4"
    
    Write-Host "Rendering for $region..." -ForegroundColor Cyan
    
    # Get full path to props file and resolve it
    $propsPath = (Resolve-Path $propsFile.FullName).Path
    # Render using Remotion
    & npx remotion render remotion/index.tsx my-composition $outputFile --props=$propsPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Completed: $outputFile" -ForegroundColor Green
    } else {
        Write-Error "[FAILED] Failed: $outputFile"
    }
}

Write-Host "Batch rendering complete!" -ForegroundColor Green
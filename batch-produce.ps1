# Batch production script for Global Video Engine
# Iterates through all JSON config files in /config and renders corresponding videos to /out

# Ensure output directory exists
New-Item -ItemType Directory -Path "out" -Force | Out-Null

# Get all JSON files in config directory, excluding markets.json
$configFiles = Get-ChildItem -Path "config" -Filter "*.json" | 
               Where-Object { $_.Name -ne "markets.json" }

Write-Host "Found $($configFiles.Count) config files to process." -ForegroundColor Green

foreach ($configFile in $configFiles) {
    try {
        # Load the JSON content to get region and title
        $propsContent = Get-Content $configFile.FullName -Raw | ConvertFrom-Json
        $region = $propsContent.region
        $title = $propsContent.title
        
        # If region is not in the JSON, try to extract from filename
        if (-not $region) {
            $filename = $configFile.BaseName
            # Remove common suffixes like -props
            $region = $filename -replace '-props$', ''
        }
        
        # Define output filename
        $outputFile = Join-Path -Path "out" -ChildPath "$region-video.mp4"
        
        Write-Host ("Rendering for {0}: {1}..." -f $region, $title) -ForegroundColor Cyan
        
        # Convert the props object back to JSON string for passing directly to --props
        $propsJson = $propsContent | ConvertTo-Json -Compress
        Write-Host ("DEBUG: Props JSON: $propsJson")
        
        # Render using Remotion with the config file as props using & operator
        Write-Host ("DEBUG: Executing with & operator: npx remotion render remotion/index.tsx my-composition $outputFile --props='$propsJson'")
        & npx remotion render remotion/index.tsx my-composition $outputFile --props='$propsJson'
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Completed: $outputFile" -ForegroundColor Green
        } else {
            Write-Error "[FAILED] Failed: $outputFile"
        }
    } catch {
        Write-Error "Error processing $($configFile.Name): $_"
    }
}

Write-Host "Batch rendering complete!" -ForegroundColor Green
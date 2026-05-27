# Create temp directory
New-Item -ItemType Directory -Path ".\temp" -Force | Out-Null

# Define the markets
$markets = @("USA", "UK", "Australia", "Canada", "Global")

foreach ($market in $markets) {
    Write-Host "Rendering for $market..."
    
    $props = @{
        region = $market
        title = "$market Market Analysis"
    }
    
    $propsJson = $props | ConvertTo-Json
    $propsPath = ".\temp\$market.json"
    
    Set-Content -Path $propsPath -Value $propsJson
    
    # Use the correct path to our composition file: remotion/index.tsx
    npx remotion render remotion/index.tsx my-composition "out/$market-video.mp4" --props="$propsPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] $market rendered" -ForegroundColor Green
    } else {
        Write-Error "[FAILED] $market failed"
    }
}
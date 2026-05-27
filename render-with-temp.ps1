# Create temp directory
New-Item -ItemType Directory -Force -Path ".\temp" | Out-Null

# Define the markets
$markets = @("USA", "UK", "Australia", "Canada", "Global")

foreach ($market in $markets) {
    Write-Host "Rendering for $market..."
    
    $props = @{
        market = $market
        title = "$market Market Analysis"
    }
    
    $propsJson = $props | ConvertTo-Json
    $propsPath = ".\temp\$market.json"
    
    Set-Content -Path $propsPath -Value $propsJson
    
    npx remotion render src/index.ts my-composition "out/$market-video.mp4" --props="$propsPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] $market rendered" -ForegroundColor Green
    } else {
        Write-Error "[FAILED] $market failed"
    }
}
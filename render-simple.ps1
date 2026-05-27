# 1. Ensure the config directory exists
New-Item -Path "config" -ItemType Directory -Force | Out-Null

# 2. Define your global target markets
$markets = @(
    @{ region = "USA"; title = "Market Analysis" },
    @{ region = "UK";  title = "Market Review" },
    @{ region = "AU";  title = "Economic Outlook" }
)

# 3. Process each market
foreach ($market in $markets) {
    $region = $market.region
    $title = $market.title
    $propsPath = "config/${region}-props.json"
    
    # Create the JSON file dynamically
    $jsonContent = @{
        region = $region
        title  = $title
    } | ConvertTo-Json
    
    $jsonContent | Out-File -FilePath $propsPath -Encoding utf8
    
    Write-Host "Rendering for ${region}: $title" -ForegroundColor Cyan
    
    # Render using the JSON file as the source of truth
    npx remotion render remotion/index.tsx my-composition out/${region}-video.mp4 --props=$propsPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully rendered ${region}." -ForegroundColor Green
    } else {
        Write-Host "Error rendering ${region}." -ForegroundColor Red
    }
}

Write-Host "Batch rendering complete!" -ForegroundColor Green
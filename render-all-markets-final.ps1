# Global Video Engine - Batch Render Script (PowerShell)
# This script renders videos for all markets defined in markets.json
# By creating temporary component files with hardcoded region and title values.

# Ensure output directory exists
$outputDir = "out"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Ensure config directory exists for props files (though we won't use them for props, we still need the markets.json)
$configDir = "config"
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir | Out-Null
}

# Read the markets configuration
$configPath = Join-Path $configDir "markets.json"
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

# Define the component template
$componentTemplate = @'
import React from 'react';
import { Composition, registerRoot, AbsoluteFill } from 'remotion';
import GlobalStandardHeader from '../src/GlobalStandardHeader';

const MyComponent = () => {
  return <AbsoluteFill style={{ backgroundColor: 'white', paddingTop: '80px' }}>
    <GlobalStandardHeader 
      region="__REGION__" 
      title="__TITLE__" 
    />
    <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Hello Remotion!</h1>
  </AbsoluteFill>;
};

const RemotionRoot = () => (
  <Composition
    id="my-composition"
    component={MyComponent}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
  />
);

registerRoot(RemotionRoot);
'@

foreach ($market in $markets) {
    $region = $market.region
    $title = $market.title
    $language = $market.language
    
    # Create output filename
    $outputFile = Join-Path $outputDir ("{0}-video.mp4" -f $region)
    
    # Create temporary component file
    $tempComponentPath = "$env:TEMP\global-video-{0}.tsx" -f $region
    
    try {
        # Replace placeholders in the template
        $componentContent = $componentTemplate
            -replace '__REGION__', $region
            -replace '__TITLE__', $title
        
        # Save the temporary component
        $componentContent | Set-Content -Path $tempComponentPath -Encoding UTF8
        
        Write-Host ("Rendering for {0}: {1}" -f $region, $title) -ForegroundColor Cyan
        
        # Render the temporary component
        & npx remotion render $tempComponentPath my-composition $outputFile --concurrency=2 --image-format=jpeg
        
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
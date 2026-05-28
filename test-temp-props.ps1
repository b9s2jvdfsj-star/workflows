# Test script for temporary props file approach

# 1. Prepare your props
$props = @{
    region = "AU"
    title  = "Economic Outlook"
}

# 2. Serialize and save to a temporary file
$propsJson = $props | ConvertTo-Json -Compress
$tempFile = Join-Path -Path $PSScriptRoot -ChildPath "temp-props.json"
$propsJson | Set-Content -Path $tempFile -Encoding utf8

# 3. Use the file path in your command
Write-Host "Props content: $propsJson"
Write-Host "Temp file: $tempFile"
Write-Host "Temp file content: $(Get-Content $tempFile)"

# Try to render
npx remotion render remotion/index.tsx my-composition out/test-temp.mp4 --props="$tempFile"

# Clean up
Remove-Item $tempFile
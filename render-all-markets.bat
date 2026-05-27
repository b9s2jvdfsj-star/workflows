@echo off
REM Batch Render Script for Global Video Engine
REM This script renders videos for all markets defined in markets.json

REM Ensure output directory exists
if not exist out mkdir out

REM Process each market in the markets.json file
for /f "usebackq delims=" %%a in (`type config/markets.json ^| findstr /r /c:""region"""`) do (
    for /f "tokens=2 delims=:" %%b in ("%%a") do (
        set "region=%%b"
        set "region=%region: =%"
        set "region=%region:"=%"
        set "region=%region: ,=%"
        
        for /f "usebackq tokens=2 delims=:" %%c in (`type config/markets.json ^| findstr /r /c:"""!region!"""" /c:""title"""` ) do (
            set "title=%%c"
            set "title=%title: =%"
            set "title=%title:"=%"
            set "title=%title: ,=%"
            
            echo Processing region: !region! with title: !title!
            
            REM Render the video for this market
            npx remotion render remotion/index.tsx my-composition out/!region!-video.mp4 --props "./config/!region!-props.json" --concurrency=2 --image-format=jpeg
            
            if !errorlevel! equ 0 (
                echo Successfully rendered !region!.
            ) else (
                echo Error rendering !region!.
            )
        )
    )
)

echo Batch rendering complete!
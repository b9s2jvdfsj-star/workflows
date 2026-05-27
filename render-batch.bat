@echo off
REM Batch Render Script for Global Video Engine
REM This script creates temporary component files for each market and renders them

REM Ensure output directory exists
if not exist out mkdir out

REM Read market configuration and process each market
for /f "usebackq tokens=2 delims=:" %%a in (`type config/markets.json ^| findstr /r /c:""region""`) do (
    set "region=%%a"
    set "region=%region: =%"
    set "region=%region:"=%"
    set "region=%region: ,=%"
    
    for /f "usebackq tokens=2 delims=:" %%b in (`type config/markets.json ^| findstr /r /c:"""!region!"""" /c:""title"""` ) do (
        set "title=%%b"
        set "title=%title: =%"
        set "title=%title:"=%"
        set "title=%title: ,=%"
        
        echo Processing region: !region! with title: !title!
        
        REM Create temporary component file
        set "tempFile=%TEMP%\global-video-!region!.tsx"
        (
            echo import React from 'react';
            echo import { Composition, registerRoot, AbsoluteFill } from 'remotion';
            echo import GlobalStandardHeader from '../src/GlobalStandardHeader';
            echo.
            echo const MyComponent = () => {
            echo   return <AbsoluteFill style={{ backgroundColor: 'white', paddingTop: '80px' }}>
            echo     <GlobalStandardHeader region="!region!" title="!title!" />
            echo     <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Hello Remotion!</h1>
            echo   </AbsoluteFill>;
            echo };
            echo.
            echo const RemotionRoot = () => (
            echo   <Composition
            echo     id="my-composition"
            echo     component={MyComponent}
            echo     durationInFrames={150}
            echo     fps={30}
            echo     width={1920}
            echo     height={1080}
            echo   />
            echo );
            echo.
            echo registerRoot(RemotionRoot);
        ) > "!tempFile!"
        
        REM Render the temporary component
        npx remotion render "!tempFile!" my-composition out/!region!-video.mp4 --concurrency=2 --image-format=jpeg
        
        if !errorlevel! equ 0 (
            echo Successfully rendered !region!.
        ) else (
            echo Error rendering !region!.
        )
        
        REM Clean up temporary component file
        del /f /q "!tempFile!" 2>nul
    )
)

echo Batch rendering complete!
@echo off
REM Simple batch script to render videos for all markets
REM Enable delayed expansion for proper variable handling
setlocal EnableDelayedExpansion

REM Ensure output directory exists
if not exist out mkdir out

REM Define the markets
set markets=USA UK Australia Canada Global

REM Process each market
for %%r in (%markets%) do (
    set region=%%r
    if "%%r"=="USA" set title=Market Analysis
    if "%%r"=="UK" set title=Market Analysis
    if "%%r"=="Australia" set title=Market Analysis
    if "%%r"=="Canada" set title=Market Analysis
    if "%%r"=="Global" set title=Global Market Overview
    
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

echo Batch rendering complete!
endlocal
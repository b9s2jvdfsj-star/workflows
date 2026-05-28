@echo off
REM GitHub Actions Self-Hosted Runner Configuration Script
REM This script helps configure and register a self-hosted runner

echo ============================================================
echo GitHub Actions Self-Hosted Runner Setup
echo ============================================================
echo.

REM Check if required variables are set
if "%GITHUB_REPOSITORY%"=="" (
    echo Error: GITHUB_REPOSITORY environment variable not set.
    echo Please set it to your repository in the format: owner/repo
    echo Example: set GITHUB_REPOSITORY=username/global-video-engine
    goto :eof
)

if "%GITHUB_TOKEN%"=="" (
    echo Error: GITHUB_TOKEN environment variable not set.
    echo Please set it to a personal access token with repo scope.
    goto :eof
)

REM Set default values
set "RUNNER_NAME=%COMPUTERNAME%-github-runner"
set "RUNNER_GROUP=default"
set "RUNNER_WORKDIR=_work"
set "LABELS=self-hosted,windows"

echo Repository: %GITHUB_REPOSITORY%
echo Runner Name: %RUNNER_NAME%
echo Runner Group: %RUNNER_GROUP%
echo Working Directory: %RUNNER_WORKDIR%
echo Labels: %LABELS%
echo.

REM Create runner directory if it doesn't exist
if not exist "%RUNNER_WORKDIR%" (
    mkdir "%RUNNER_WORKDIR%"
    echo Created working directory: %RUNNER_WORKDIR%
)

REM Download and configure the runner (if not already done)
if not exist runner.exe (
    echo Downloading latest runner...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/actions/runner/releases/download/v2.316.0/actions-runner-win-x64-2.316.0.zip' -OutFile 'runner.zip'"
    echo Extracting runner...
    powershell -Command "Expand-Archive -Path runner.zip -DestinationPath ."
    del runner.zip
    echo Runner downloaded and extracted.
) else (
    echo Runner already exists.
)

REM Configure the runner
echo.
echo Configuring runner...
.\config.cmd --url https://github.com/%GITHUB_REPOSITORY% --token %GITHUB_TOKEN% --name %RUNNER_NAME% --runnergroup %RUNNER_GROUP% --work %RUNNER_WORKDIR% --labels %LABELS% --unattended --replace

if errorlevel 1 (
    echo.
    echo Error: Runner configuration failed.
    echo Please check the error above and try again.
    goto :eof
)

echo.
echo Runner configured successfully!
echo.
echo To install the runner as a service, run:
echo   .\svc install
echo.
echo To start the runner, run:
echo   .\svc start
echo.
echo To check the status, run:
echo   .\svc status
echo.
echo ============================================================
echo Setup Complete!
echo ============================================================
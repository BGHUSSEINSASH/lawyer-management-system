@echo off
REM Deploy Firebase Hosting from repo root even if run elsewhere
setlocal

set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set ROOT=%ROOT:~0,-1%

where firebase >nul 2>nul
if errorlevel 1 (
  echo Firebase CLI not found. Install with: npm install -g firebase-tools
  exit /b 1
)

REM Deploy hosting (quotes for Windows)
firebase deploy --only "hosting" --config "%ROOT%\firebase.json"

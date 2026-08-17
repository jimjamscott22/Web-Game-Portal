@echo off
setlocal

set "APP_DIR=%~dp0app"

if not exist "%APP_DIR%\package.json" (
  echo Error: Could not find "%APP_DIR%\package.json".
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo Error: Node.js is not installed or is not available on PATH.
  echo Install Node.js 20.19 or newer, then run this script again.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo Error: npm is not installed or is not available on PATH.
  exit /b 1
)

cd /d "%APP_DIR%"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

echo Starting PixelPlay...
if "%~1"=="" (
  call npm run dev
) else (
  call npm run dev -- %*
)

set "EXIT_CODE=%errorlevel%"
endlocal & exit /b %EXIT_CODE%

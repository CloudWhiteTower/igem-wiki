@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PORT=4199"
set "URL=http://localhost:%PORT%/"

echo Starting Auto-MC-Sensor iGEM Wiki...
echo.

where node >nul 2>nul
if %errorlevel%==0 (
  start "Auto-MC-Sensor Wiki Server" cmd /k "cd /d ""%~dp0"" && set PORT=%PORT% && node serve.mjs"
  timeout /t 2 >nul
  start "" "%URL%"
  exit /b 0
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "Auto-MC-Sensor Wiki Server" cmd /k "cd /d ""%~dp0"" && py -3 -m http.server %PORT%"
  timeout /t 2 >nul
  start "" "%URL%"
  exit /b 0
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "Auto-MC-Sensor Wiki Server" cmd /k "cd /d ""%~dp0"" && python -m http.server %PORT%"
  timeout /t 2 >nul
  start "" "%URL%"
  exit /b 0
)

echo Could not find Node.js or Python on this computer.
echo Please install Node.js from https://nodejs.org/ or Python from https://www.python.org/,
echo then double-click START_HERE.bat again.
echo.
pause

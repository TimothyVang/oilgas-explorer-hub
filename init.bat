@echo off
REM =============================================================================
REM Oil & Gas Explorer Hub - Development Environment Setup (Windows)
REM =============================================================================
REM
REM This script sets up and starts the development environment.
REM
REM Usage:
REM   init.bat           - Install dependencies and start dev server
REM   init.bat install   - Only install dependencies
REM   init.bat start     - Only start dev server
REM   init.bat build     - Build for production
REM   init.bat check     - Check environment status
REM =============================================================================

setlocal enabledelayedexpansion

echo.
echo =============================================
echo   Oil ^& Gas Explorer Hub
echo   Development Environment Setup
echo =============================================
echo.

REM Check arguments
if "%1"=="install" goto install
if "%1"=="start" goto start
if "%1"=="build" goto build
if "%1"=="lint" goto lint
if "%1"=="check" goto check
if "%1"=="help" goto help
if "%1"=="-h" goto help

REM Default: full setup
goto fullsetup

:check
echo [INFO] Checking development environment...
echo.

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install from: https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo [SUCCESS] Node.js %%i detected

REM Check npm
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed!
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do echo [SUCCESS] npm %%i detected

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "tokens=*" %%i in ('python --version') do echo [SUCCESS] %%i detected
) else (
    echo [WARNING] Python not found. Checklist manager requires Python 3.8+
)

REM Check .env
if exist .env (
    echo [SUCCESS] .env file found
) else (
    echo [WARNING] .env file not found!
)

REM Check node_modules
if exist node_modules (
    echo [SUCCESS] Dependencies installed
) else (
    echo [WARNING] Dependencies not installed. Run: init.bat install
)

echo.
REM Show checklist status
if exist checklist_manager.py (
    echo [INFO] Checking project checklist...
    python checklist_manager.py 2>nul
)
goto end

:install
echo [INFO] Installing npm dependencies...
npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed!
goto end

:start
echo [INFO] Starting development server...
echo.
echo =============================================
echo   Development server starting...
echo   Access the app at: http://localhost:8080
echo   Press Ctrl+C to stop
echo =============================================
echo.
npm run dev
goto end

:build
echo [INFO] Building for production...
npm run build
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Production build complete! Output in .\dist
) else (
    echo [ERROR] Build failed
    exit /b 1
)
goto end

:lint
echo [INFO] Running ESLint...
npm run lint
goto end

:fullsetup
REM Full setup: check, install, and start
call :check
echo.
call :install
echo.
call :start
goto end

:help
echo Usage: init.bat [option]
echo.
echo Options:
echo   (no option)  Install dependencies and start dev server
echo   install      Only install dependencies
echo   start        Only start dev server
echo   build        Build for production
echo   lint         Run ESLint
echo   check        Check environment status
echo   help         Show this help message
echo.
goto end

:end
endlocal

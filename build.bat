@echo off
:: Medicare Pro Extra - Automated Windows Packaging Script
:: This script compiles, links, rebuilds native drivers, and outputs a single portable .exe.

echo ======================================================================
echo           MEDICARE PRO - AUTOMATED STANDALONE BUILD SYSTEM
echo ======================================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if errorlevel 1 goto no_node

echo [+] Node.js detected.
echo.
echo [1/3] Restoring node modules and core packages...
call npm install
if errorlevel 1 goto npm_failed

echo.
echo [2/3] Cleaning up old distribution directories...
call npm run clean
:: We do not crash on clean failure, just continue

echo.
echo [3/3] Commencing full production compile, driver rebuild, and packaging...
echo This will transpile React, compile the Server, rebuild better-sqlite3 for Electron,
echo and assemble a single, completely self-contained .exe file...
echo.
call npm run package
if errorlevel 1 goto package_failed

echo.
echo ======================================================================
echo [+] SUCCESS: Portable standalone Medicare Pro .exe is built!
echo ======================================================================
echo.
echo Output Location:
echo    %~dp0release\Medicare Pro 1.0.0.exe
echo.
echo This file has NO dependencies. You can copy it to ANY Windows computer
echo and double-click to run it instantly without requiring node, sqlite or installations.
echo.
pause
exit /b 0

:no_node
echo.
echo [ERROR] Node.js is not installed or not in your system's PATH!
echo Please install Node.js (v18 or higher recommended) from "https://nodejs.org/"
echo.
pause
exit /b 1

:npm_failed
echo.
echo [ERROR] npm install failed!
echo Please ensure you are connected to the Internet and try again.
echo.
pause
exit /b 1

:package_failed
echo.
echo [ERROR] Standing build compilation failed. Please check the logs.
echo.
pause
exit /b 1


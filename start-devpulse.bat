@echo off
title DevPulse Desktop Widget
cd /d "%~dp0"

:: Check if unpacked binary exists
if exist "release\win-unpacked\DevPulse.exe" (
    start "" "release\win-unpacked\DevPulse.exe"
    exit
)

:: Fallback to running dev server
start "" cmd /c "npm run electron:dev"
exit

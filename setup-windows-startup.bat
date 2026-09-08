@echo off
title DevPulse — Permanent Laptop Setup
echo ======================================================================
echo          DevPulse Desktop Widgets — Permanent Laptop Setup
echo ======================================================================
echo.

set SCRIPT_DIR=%~dp0
set TARGET_EXE=%SCRIPT_DIR%release\win-unpacked\DevPulse.exe
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set START_MENU_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs
set SHORTCUT_VBS=%TEMP%\CreateDevPulseShortcuts.vbs

if not exist "%TARGET_EXE%" (
    echo [!] Production executable not found at:
    echo     %TARGET_EXE%
    echo.
    echo     Running quick production build now...
    call npm run build
    call npx electron-builder --dir
)

echo [1/3] Creating Windows Startup auto-boot shortcut...
echo [2/3] Creating Desktop 1-click shortcut...
echo [3/3] Creating Start Menu shortcut...
echo.

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%SHORTCUT_VBS%"

:: Startup Shortcut (starts silently every time laptop turns on)
echo sStartupLink = "%STARTUP_FOLDER%\DevPulse.lnk" >> "%SHORTCUT_VBS%"
echo Set oStartup = oWS.CreateShortcut(sStartupLink) >> "%SHORTCUT_VBS%"
echo oStartup.TargetPath = "%TARGET_EXE%" >> "%SHORTCUT_VBS%"
echo oStartup.WorkingDirectory = "%SCRIPT_DIR%release\win-unpacked" >> "%SHORTCUT_VBS%"
echo oStartup.Description = "DevPulse Developer Desktop Widgets (Auto-Start)" >> "%SHORTCUT_VBS%"
echo oStartup.Save >> "%SHORTCUT_VBS%"

:: Desktop Shortcut
echo sDesktop = oWS.SpecialFolders("Desktop") >> "%SHORTCUT_VBS%"
echo sDesktopLink = sDesktop ^& "\DevPulse Widgets.lnk" >> "%SHORTCUT_VBS%"
echo Set oDesktop = oWS.CreateShortcut(sDesktopLink) >> "%SHORTCUT_VBS%"
echo oDesktop.TargetPath = "%TARGET_EXE%" >> "%SHORTCUT_VBS%"
echo oDesktop.WorkingDirectory = "%SCRIPT_DIR%release\win-unpacked" >> "%SHORTCUT_VBS%"
echo oDesktop.Description = "DevPulse Developer Desktop Widgets" >> "%SHORTCUT_VBS%"
echo oDesktop.Save >> "%SHORTCUT_VBS%"

:: Start Menu Shortcut
echo sMenuLink = "%START_MENU_FOLDER%\DevPulse Widgets.lnk" >> "%SHORTCUT_VBS%"
echo Set oMenu = oWS.CreateShortcut(sMenuLink) >> "%SHORTCUT_VBS%"
echo oMenu.TargetPath = "%TARGET_EXE%" >> "%SHORTCUT_VBS%"
echo oMenu.WorkingDirectory = "%SCRIPT_DIR%release\win-unpacked" >> "%SHORTCUT_VBS%"
echo oMenu.Description = "DevPulse Developer Desktop Widgets" >> "%SHORTCUT_VBS%"
echo oMenu.Save >> "%SHORTCUT_VBS%"

cscript /nologo "%SHORTCUT_VBS%"
del "%SHORTCUT_VBS%"

echo ======================================================================
echo  [SUCCESS] DevPulse is permanently installed on your laptop!
echo ======================================================================
echo.
echo  1. Auto-Starts on Boot: Every time your laptop turns on, your widgets
echo     (LeetCode @s4njay, ChatGPT app, Tasks, Habits, Screen Time) appear.
echo.
echo  2. Desktop Shortcut: "DevPulse Widgets" is now on your Desktop.
echo.
echo  3. Start Menu: You can press the Windows key and type "DevPulse".
echo.
echo  4. Stays on Wallpaper: Widgets sit cleanly on your desktop wallpaper
echo     without overlapping or blocking apps like ChatGPT, browser, or IDE.
echo.
echo Starting DevPulse widgets now...
start "" "%TARGET_EXE%"
echo.
echo You can close this window.
pause

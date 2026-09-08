$WshShell = New-Object -ComObject WScript.Shell

$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$StartupPath = [System.Environment]::GetFolderPath('Startup')
$ProgramsPath = [System.Environment]::GetFolderPath('Programs')

$BaseDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $BaseDir) { $BaseDir = "D:\widget" }
$ExePath = Join-Path $BaseDir "release\win-unpacked\DevPulse.exe"
$WorkDir = Join-Path $BaseDir "release\win-unpacked"

# 1. Desktop Shortcut
$DesktopShortcut = $WshShell.CreateShortcut("$DesktopPath\DevPulse Widgets.lnk")
$DesktopShortcut.TargetPath = $ExePath
$DesktopShortcut.WorkingDirectory = $WorkDir
$DesktopShortcut.Description = "DevPulse Developer Desktop Widgets"
$DesktopShortcut.IconLocation = "$ExePath,0"
$DesktopShortcut.Save()

# 2. Windows Startup Shortcut (boots when laptop turns on)
$StartupShortcut = $WshShell.CreateShortcut("$StartupPath\DevPulse.lnk")
$StartupShortcut.TargetPath = $ExePath
$StartupShortcut.WorkingDirectory = $WorkDir
$StartupShortcut.Description = "DevPulse Auto-Start"
$StartupShortcut.IconLocation = "$ExePath,0"
$StartupShortcut.Save()

# 3. Windows Start Menu Shortcut
$StartMenuShortcut = $WshShell.CreateShortcut("$ProgramsPath\DevPulse Widgets.lnk")
$StartMenuShortcut.TargetPath = $ExePath
$StartMenuShortcut.WorkingDirectory = $WorkDir
$StartMenuShortcut.Description = "DevPulse Developer Desktop Widgets"
$StartMenuShortcut.IconLocation = "$ExePath,0"
$StartMenuShortcut.Save()

Write-Output "[SUCCESS] All permanent shortcuts created:"
Write-Output " - Desktop: $DesktopPath\DevPulse Widgets.lnk"
Write-Output " - Startup: $StartupPath\DevPulse.lnk"
Write-Output " - Start Menu: $ProgramsPath\DevPulse Widgets.lnk"

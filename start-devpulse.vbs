Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = scriptDir & "\release\win-unpacked"
WshShell.Run Chr(34) & scriptDir & "\release\win-unpacked\DevPulse.exe" & Chr(34), 0, False

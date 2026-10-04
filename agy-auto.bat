@echo off
setlocal EnableDelayedExpansion
title Antigravity (agy) Auto-Approve Launcher [Git Commit Protected]

rem ==============================================================================
rem Antigravity (agy) Auto-Approve Utility
rem ------------------------------------------------------------------------------
rem Features:
rem 1. Auto-approves all tool permission prompts (Yes/No confirmations) via
rem    --dangerously-skip-permissions.
rem 2. HARD-BLOCKS all 'git commit' attempts (including --no-verify) via:
rem    - Native Git wrapper shim in PATH (intercepts and rejects commit command)
rem    - Git core.hooksPath pre-commit hook (rejects commit at Git core level)
rem 3. Allows all safe Git operations (status, diff, log, branch, add, checkout).
rem 4. Works in current folder, with argument, or via drag-and-drop.
rem 5. Optional Explorer Right-Click Context Menu integration.
rem ==============================================================================

rem Check for help or flags
if /i "%~1"=="--help" goto :SHOW_HELP
if /i "%~1"=="-h" goto :SHOW_HELP
if /i "%~1"=="/?" goto :SHOW_HELP
if /i "%~1"=="--install-context-menu" goto :INSTALL_CONTEXT_MENU
if /i "%~1"=="--uninstall-context-menu" goto :UNINSTALL_CONTEXT_MENU

rem Step 1: Initialize Setup and Shim Directories
set "SHIM_BASE=%LOCALAPPDATA%\agy-auto"
set "SHIM_BIN=%SHIM_BASE%\bin"
set "SHIM_HOOKS=%SHIM_BASE%\hooks"

if not exist "%SHIM_BIN%" mkdir "%SHIM_BIN%" >nul 2>&1
if not exist "%SHIM_HOOKS%" mkdir "%SHIM_HOOKS%" >nul 2>&1

rem Step 2: Locate Real Git Executable
set "REAL_GIT="
for /f "delims=" %%I in ('where git.exe 2^>nul') do (
    if not defined REAL_GIT (
        set "REAL_GIT=%%I"
    )
)
if not defined REAL_GIT (
    if exist "C:\Program Files\Git\cmd\git.exe" set "REAL_GIT=C:\Program Files\Git\cmd\git.exe"
    if exist "C:\Program Files (x86)\Git\cmd\git.exe" set "REAL_GIT=C:\Program Files (x86)\Git\cmd\git.exe"
)

if not defined REAL_GIT (
    echo [ERROR] Git was not found on this system!
    echo Please ensure Git is installed and available in PATH.
    pause
    exit /b 1
)

rem Step 3: Ensure Git Pre-Commit Hook exists
if not exist "%SHIM_HOOKS%\pre-commit" (
    (
        echo #!/bin/sh
        echo echo ""
        echo echo "======================================================================"
        echo echo "[SAFETY GUARD] 'git commit' is BLOCKED in agy auto-approval mode!"
        echo echo "All changes remain uncommitted so you can review & commit manually."
        echo echo "======================================================================"
        echo echo ""
        echo exit 1
    ) > "%SHIM_HOOKS%\pre-commit"
)

rem Step 4: Ensure Git Shim Executable exists (Compile via csc.exe if needed)
if not exist "%SHIM_BIN%\git.exe" (
    echo [*] First-time setup: compiling Git safety guard shim...
    call :BUILD_GIT_SHIM
)

rem Ensure batch fallback exists
if not exist "%SHIM_BIN%\git.cmd" (
    (
        echo @echo off
        echo setlocal EnableDelayedExpansion
        echo for %%%%A in ^(%%*^) do ^(
        echo     if /i "%%%%~A"=="commit" ^(
        echo         echo.
        echo         echo ======================================================================
        echo         echo [SAFETY GUARD] 'git commit' is BLOCKED in agy auto-approval mode!
        echo         echo All changes remain uncommitted so you can review ^& commit manually.
        echo         echo ======================================================================
        echo         echo.
        echo         exit /b 1
        echo     ^)
        echo ^)
        echo if defined REAL_GIT_EXE ^(
        echo     "%%REAL_GIT_EXE%%" %%*
        echo ^) else ^(
        echo     "%REAL_GIT%" %%*
        echo ^)
        echo exit /b %%ERRORLEVEL%%
    ) > "%SHIM_BIN%\git.cmd"
    copy /y "%SHIM_BIN%\git.cmd" "%SHIM_BIN%\git.bat" >nul 2>&1
)

rem Step 5: Check agy CLI availability
where agy.exe >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Google Antigravity CLI ^(agy^) is not installed or not in PATH.
    echo To install, run: winget install Google.AntigravityCLI
    pause
    exit /b 1
)

rem Step 6: Determine Target Project Directory
set "TARGET_DIR="
set "EXTRA_ARGS="

if not "%~1"=="" (
    if exist "%~1\" (
        set "TARGET_DIR=%~f1"
        shift
        :COLLECT_ARGS
        if not "%~1"=="" (
            set "EXTRA_ARGS=!EXTRA_ARGS! %1"
            shift
            goto :COLLECT_ARGS
        )
    ) else (
        rem First argument is not a folder, treat all arguments as agy flags
        set "EXTRA_ARGS=%*"
    )
)

if not defined TARGET_DIR (
    if /i "%CD%"=="%WINDIR%\System32" (
        set "TARGET_DIR="
    ) else if /i "%CD%"=="%WINDIR%" (
        set "TARGET_DIR="
    ) else (
        set "TARGET_DIR=%CD%"
    )
)

if not defined TARGET_DIR (
    cls
    echo ======================================================================
    echo          Google Antigravity ^(agy^) Auto-Approve Launcher
    echo ======================================================================
    echo.
    echo Enter the path to your project directory, or drag and drop a folder here.
    echo (Press ENTER to use current directory: %CD%)
    echo.
    set /p "USER_INPUT=Project Path: "
    if defined USER_INPUT (
        rem Strip quotes if present
        set "USER_INPUT=!USER_INPUT:"=!"
        if exist "!USER_INPUT!\" (
            set "TARGET_DIR=!USER_INPUT!"
        ) else (
            echo [ERROR] Directory does not exist: "!USER_INPUT!"
            pause
            exit /b 1
        )
    ) else (
        set "TARGET_DIR=%CD%"
    )
)

rem Normalize target directory path
for %%I in ("%TARGET_DIR%\.") do set "TARGET_DIR=%%~fI"

if not exist "%TARGET_DIR%\" (
    echo [ERROR] Target directory does not exist: "%TARGET_DIR%"
    pause
    exit /b 1
)

rem Step 7: Inject Non-Destructive Agent Safety Rule if .agents exists or project root
if exist "%TARGET_DIR%\.git\" (
    if not exist "%TARGET_DIR%\.agents\rules\" mkdir "%TARGET_DIR%\.agents\rules" >nul 2>&1
    if not exist "%TARGET_DIR%\.agents\rules\no-git-commit.md" (
        (
            echo # Git Safety Rules
            echo - DO NOT run `git commit` under any circumstances.
            echo - All code changes must remain uncommitted for manual user inspection.
            echo - You may use `git status`, `git diff`, and `git log` to inspect changes.
        ) > "%TARGET_DIR%\.agents\rules\no-git-commit.md"
    )
)

rem Step 8: Configure Environment for Safety and Launch
set "REAL_GIT_EXE=%REAL_GIT%"
set "PATH=%SHIM_BIN%;%PATH%"
set "GIT_CONFIG_COUNT=1"
set "GIT_CONFIG_KEY_0=core.hooksPath"
set "GIT_CONFIG_VALUE_0=%SHIM_HOOKS%"

rem Sync self to global PATH if possible
if exist "C:\Users\dell\.gemini\antigravity-cli\bin\" (
    if not "%~dpnx0"=="C:\Users\dell\.gemini\antigravity-cli\bin\agy-auto.bat" (
        copy /y "%~dpnx0" "C:\Users\dell\.gemini\antigravity-cli\bin\agy-auto.bat" >nul 2>&1
    )
)

cls
echo ==============================================================================
echo              GOOGLE ANTIGRAVITY (agy) AUTO-APPROVE SESSION
echo ==============================================================================
echo  Project Location     : %TARGET_DIR%
echo  Confirmations (Y/N)  : [AUTO-APPROVE ACTIVATED] (Skipping prompts)
echo  Git Commit Safety    : [HARD-BLOCKED] (Git commits strictly prevented)
echo  Allowed Git Commands : status, diff, log, add, checkout, branch, etc.
if defined EXTRA_ARGS (
echo  Extra agy Flags      : %EXTRA_ARGS%
)
echo ==============================================================================
echo.

pushd "%TARGET_DIR%"
agy --dangerously-skip-permissions %EXTRA_ARGS%
set "EXIT_CODE=%ERRORLEVEL%"
popd

echo.
echo ==============================================================================
echo Antigravity session ended with code %EXIT_CODE%.
echo ==============================================================================
exit /b %EXIT_CODE%

rem ==============================================================================
rem Helper Subroutines
rem ==============================================================================

:BUILD_GIT_SHIM
set "CSC_EXE="
if exist "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC_EXE=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
) else if exist "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC_EXE=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if not defined CSC_EXE (
    echo [*] Note: csc.exe not found, falling back to batch shim.
    goto :eof
)

set "SOURCE_FILE=%SHIM_BASE%\GitWrapper.cs"
(
    echo using System;
    echo using System.Diagnostics;
    echo using System.IO;
    echo using System.Text;
    echo namespace AgyGitShim
    echo {
    echo     class Program
    echo     {
    echo         static string FindRealGit^(^)
    echo         {
    echo             string envGit = Environment.GetEnvironmentVariable^("REAL_GIT_EXE"^);
    echo             if ^(!string.IsNullOrEmpty^(envGit^) ^&^& File.Exists^(envGit^)^) return envGit;
    echo             string[] standardPaths = new string[]
    echo             {
    echo                 @"C:\Program Files\Git\cmd\git.exe",
    echo                 @"C:\Program Files\Git\bin\git.exe",
    echo                 @"C:\Program Files ^(x86^)\Git\cmd\git.exe"
    echo             };
    echo             foreach ^(string path in standardPaths^) { if ^(File.Exists^(path^)^) return path; }
    echo             return null;
    echo         }
    echo         static string EscapeArg^(string arg^)
    echo         {
    echo             if ^(string.IsNullOrEmpty^(arg^)^) return "\"\"";
    echo             if ^(arg.IndexOfAny^(new char[] { ' ', '\t', '\n', '\v', '\"' }^) == -1^) return arg;
    echo             return "\"" + arg.Replace^("\"", "\\\""^) + "\"";
    echo         }
    echo         static int Main^(string[] args^)
    echo         {
    echo             foreach ^(string arg in args^)
    echo             {
    echo                 if ^(string.Equals^(arg, "commit", StringComparison.OrdinalIgnoreCase^)^)
    echo                 {
    echo                     Console.ForegroundColor = ConsoleColor.Yellow;
    echo                     Console.WriteLine^("\n=====================================================================^\n[SAFETY GUARD] 'git commit' is BLOCKED in agy auto-approval mode!^\nAll changes remain uncommitted so you can review ^& commit manually.^\n=====================================================================^\n"^);
    echo                     Console.ResetColor^(^);
    echo                     return 1;
    echo                 }
    echo             }
    echo             string realGit = FindRealGit^(^);
    echo             if ^(string.IsNullOrEmpty^(realGit^)^)
    echo             {
    echo                 Console.ForegroundColor = ConsoleColor.Red;
    echo                 Console.WriteLine^("[ERROR] Could not find real git.exe on this system!"^);
    echo                 Console.ResetColor^(^);
    echo                 return 127;
    echo             }
    echo             var sb = new StringBuilder^(^);
    echo             for ^(int i = 0; i ^< args.Length; i++^)
    echo             {
    echo                 if ^(i ^> 0^) sb.Append^(' '^);
    echo                 sb.Append^(EscapeArg^(args[i]^)^);
    echo             }
    echo             var startInfo = new ProcessStartInfo
    echo             {
    echo                 FileName = realGit,
    echo                 Arguments = sb.ToString^(^),
    echo                 UseShellExecute = false
    echo             };
    echo             try
    echo             {
    echo                 using ^(var proc = Process.Start^(startInfo^)^)
    echo                 {
    echo                     proc.WaitForExit^(^);
    echo                     return proc.ExitCode;
    echo                 }
    echo             }
    echo             catch ^(Exception ex^)
    echo             {
    echo                 Console.ForegroundColor = ConsoleColor.Red;
    echo                 Console.WriteLine^("[ERROR] Error forwarding to real git: " + ex.Message^);
    echo                 Console.ResetColor^(^);
    echo                 return 1;
    echo             }
    echo         }
    echo     }
    echo }
) > "%SOURCE_FILE%"

"%CSC_EXE%" /nologo /out:"%SHIM_BIN%\git.exe" "%SOURCE_FILE%" >nul 2>&1
goto :eof

:INSTALL_CONTEXT_MENU
echo [*] Installing Windows Explorer Right-Click Context Menu...
powershell -NoProfile -Command ^
    "$k1 = 'HKCU:\Software\Classes\Directory\shell\AgyAuto';" ^
    "$k2 = 'HKCU:\Software\Classes\Directory\Background\shell\AgyAuto';" ^
    "New-Item -Path $k1 -Force | Out-Null;" ^
    "New-Item -Path \"$k1\command\" -Force | Out-Null;" ^
    "New-Item -Path $k2 -Force | Out-Null;" ^
    "New-Item -Path \"$k2\command\" -Force | Out-Null;" ^
    "Set-ItemProperty -Path $k1 -Name '(Default)' -Value 'Open with agy (Auto-Approve)';" ^
    "Set-ItemProperty -Path \"$k1\command\" -Name '(Default)' -Value 'cmd.exe /c call \"%~dpnx0\" \"%%1\"';" ^
    "Set-ItemProperty -Path $k2 -Name '(Default)' -Value 'Open with agy (Auto-Approve)';" ^
    "Set-ItemProperty -Path \"$k2\command\" -Name '(Default)' -Value 'cmd.exe /c call \"%~dpnx0\" \"%%V\"';"
echo [SUCCESS] 'Open with agy (Auto-Approve)' added to Windows Explorer context menu!
echo You can now right-click any project folder and select 'Open with agy (Auto-Approve)'.
pause
exit /b 0

:UNINSTALL_CONTEXT_MENU
echo [*] Removing Windows Explorer Right-Click Context Menu...
powershell -NoProfile -Command ^
    "Remove-Item -Path 'HKCU:\Software\Classes\Directory\shell\AgyAuto' -Recurse -Force -ErrorAction SilentlyContinue;" ^
    "Remove-Item -Path 'HKCU:\Software\Classes\Directory\Background\shell\AgyAuto' -Recurse -Force -ErrorAction SilentlyContinue;"
echo [SUCCESS] Context menu entries removed.
pause
exit /b 0

:SHOW_HELP
echo ==============================================================================
echo              Google Antigravity (agy) Auto-Approve Launcher
echo ==============================================================================
echo Usage:
echo   agy-auto                       Launch agy in current directory
echo   agy-auto [project_path]        Launch agy in specified project folder
echo   agy-auto [path] [agy_flags]    Launch with extra agy options
echo.
echo Examples:
echo   agy-auto
echo   agy-auto D:\Projects\my-website
echo   agy-auto D:\Projects\my-app --model gemini-2.5-pro
echo   agy-auto --install-context-menu   (Adds right-click menu in Windows Explorer)
echo   agy-auto --uninstall-context-menu (Removes right-click menu)
echo.
echo Features:
echo   - Auto-Approves all tool/action prompts (never asks for Yes/No)
echo   - Prevents 'git commit' unconditionally (changes stay unstaged/uncommitted)
echo   - Allows safe git commands: status, diff, log, add, checkout, branch
echo ==============================================================================
exit /b 0

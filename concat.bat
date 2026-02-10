@echo off
setlocal enabledelayedexpansion

REM Clear h.txt
echo. > h.txt

REM Get all files recursively except h.txt
for /r %%f in (*) do (
    if not "%%~nxf"=="h.txt" (
        echo === %%f === >> h.txt
        type "%%f" >> h.txt
        echo. >> h.txt
    )
)

echo Done.

@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0pack_zip.ps1"

pause
@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 방 만들기 - 로컬 서버

where node >nul 2>nul
if %errorlevel%==0 (
  node "%~dp0서버.js" --open
) else if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" "%~dp0서버.js" --open
) else (
  echo.
  echo   Node.js 가 설치되어 있지 않아요.
  echo   https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요.
  echo.
)
pause

@echo off
title Minecraft AFK Panel
echo.
echo  ==========================================
echo   Minecraft AFK Panel Baslatiliyor...
echo  ==========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [HATA] Node.js bulunamadi!
  echo Lutfen https://nodejs.org adresinden kurun.
  pause
  exit /b 1
)

echo [OK] Node.js versiyonu:
node -v
echo.

if not exist node_modules (
  echo [KURULUM] Bagimliliklar yukleniyor...
  npm install
  echo.
)

echo [BASLATILIYOR] Panel: http://localhost:3000
echo [BILGI] Durdurmak icin bu pencereyi kapatin
echo.
start http://localhost:3000
node server.js
pause

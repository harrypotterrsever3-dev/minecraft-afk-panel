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
  echo Lutfen https://nodejs.org adresinden Node.js kurun.
  pause
  exit /b 1
)

echo [OK] Node.js bulundu: 
node -v
echo.

if not exist node_modules (
  echo [KURULUM] Bagimliliklar yukleniyor...
  npm install
  echo.
)

echo [BASLATILIYOR] Panel aciliyor: http://localhost:3000
echo [BILGI] Durdurmak icin Ctrl+C basin
echo.
start http://localhost:3000
node server.js
pause
#!/bin/bash
echo ""
echo "  =========================================="
echo "   Minecraft AFK Panel Baslatiliyor..."
echo "  =========================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[HATA] Node.js bulunamadi!"
    echo "Kurmak icin: sudo apt install nodejs npm"
    exit 1
fi

echo "[OK] Node.js: $(node -v)"
echo ""

if [ ! -d "node_modules" ]; then
    echo "[KURULUM] npm install calistiriliyor..."
    npm install
    echo ""
fi

echo "[BASLATILIYOR] http://localhost:3000"
node server.js

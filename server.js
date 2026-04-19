const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mineflayer = require('mineflayer');
const path = require('path');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Bot state
let botInstance = null;
let botConfig = null;
let botStatus = 'offline';
let logs = [];
let stats = {
  uptime: 0,
  reconnects: 0,
  startTime: null,
  health: 0,
  food: 0,
  position: { x: 0, y: 0, z: 0 }
};

let uptimeInterval = null;
let cronJob = null;

function addLog(message, type = 'info') {
  const entry = {
    time: new Date().toLocaleTimeString('tr-TR'),
    message,
    type
  };
  logs.push(entry);
  if (logs.length > 200) logs.shift();
  io.emit('log', entry);
}

function updateStats() {
  io.emit('stats', stats);
  io.emit('status', botStatus);
}

function createBot(config) {
  if (botInstance) {
    try { botInstance.quit(); } catch(e) {}
    botInstance = null;
  }

  botConfig = config;
  botStatus = 'connecting';
  addLog(`🔌 Bağlanılıyor: ${config.host}:${config.port} | v${config.version} | Kullanıcı: ${config.username}`, 'info');
  updateStats();

  try {
    const botOptions = {
      host: config.host,
      port: parseInt(config.port) || 25565,
      username: config.username,
      version: config.version !== 'auto' ? config.version : false,
      hideErrors: false,
      auth: 'offline'
    };

    if (config.password && config.password.trim() !== '') {
      botOptions.auth = 'microsoft';
      botOptions.password = config.password;
    }

    botInstance = mineflayer.createBot(botOptions);

    botInstance.on('login', () => {
      botStatus = 'online';
      stats.startTime = Date.now();
      stats.reconnects++;
      addLog(`✅ Sunucuya başarıyla giriş yapıldı!`, 'success');
      addLog(`📍 Oyuncu: ${botInstance.username}`, 'success');
      updateStats();

      uptimeInterval = setInterval(() => {
        if (stats.startTime) {
          stats.uptime = Math.floor((Date.now() - stats.startTime) / 1000);
        }
        if (botInstance) {
          stats.health = botInstance.health ? Math.round(botInstance.health) : 0;
          stats.food = botInstance.food ? Math.round(botInstance.food) : 0;
          const pos = botInstance.entity?.position;
          if (pos) {
            stats.position = {
              x: Math.round(pos.x),
              y: Math.round(pos.y),
              z: Math.round(pos.z)
            };
          }
        }
        updateStats();
      }, 2000);

      // AFK actions
      startAfkActions(config);
    });

    botInstance.on('chat', (username, message) => {
      if (username !== botInstance.username) {
        addLog(`💬 [${username}]: ${message}`, 'chat');
        // Auto reply
        if (config.autoReply && message.toLowerCase().includes('afk')) {
          setTimeout(() => {
            try { botInstance.chat(config.autoReplyMsg || 'AFK modundayım!'); } catch(e) {}
          }, 1000);
        }
      }
    });

    botInstance.on('health', () => {
      stats.health = Math.round(botInstance.health || 0);
      stats.food = Math.round(botInstance.food || 0);
    });

    botInstance.on('kicked', (reason) => {
      botStatus = 'offline';
      clearInterval(uptimeInterval);
      addLog(`⛔ Sunucudan atıldı: ${reason}`, 'error');
      updateStats();
      if (config.autoReconnect) {
        const delay = (config.reconnectDelay || 30) * 1000;
        addLog(`🔄 ${config.reconnectDelay || 30} saniye sonra yeniden bağlanılıyor...`, 'warning');
        setTimeout(() => {
          if (botConfig && botStatus === 'offline') {
            createBot(botConfig);
          }
        }, delay);
      }
    });

    botInstance.on('end', (reason) => {
      botStatus = 'offline';
      clearInterval(uptimeInterval);
      addLog(`🔴 Bağlantı kesildi: ${reason || 'Bilinmeyen sebep'}`, 'warning');
      updateStats();
      if (config.autoReconnect) {
        const delay = (config.reconnectDelay || 30) * 1000;
        addLog(`🔄 ${config.reconnectDelay || 30} saniye sonra yeniden bağlanılıyor...`, 'warning');
        setTimeout(() => {
          if (botConfig && botStatus === 'offline') {
            createBot(botConfig);
          }
        }, delay);
      }
    });

    botInstance.on('error', (err) => {
      addLog(`❌ Hata: ${err.message}`, 'error');
      if (err.code === 'ECONNREFUSED') {
        addLog('⚠️ Sunucuya bağlanılamadı. IP/Port kontrol edin.', 'error');
      }
    });

    botInstance.on('spawn', () => {
      addLog(`🌍 Dünyaya spawn edildi!`, 'info');
    });

  } catch (err) {
    botStatus = 'offline';
    addLog(`❌ Bot oluşturma hatası: ${err.message}`, 'error');
    updateStats();
  }
}

let afkInterval = null;
let lookInterval = null;

function startAfkActions(config) {
  clearInterval(afkInterval);
  clearInterval(lookInterval);

  if (config.afkMethod === 'rotate') {
    let yaw = 0;
    lookInterval = setInterval(() => {
      if (botInstance && botStatus === 'online') {
        try {
          yaw += 0.1;
          botInstance.look(yaw, 0, true);
        } catch(e) {}
      }
    }, 100);
    addLog('🔄 AFK modu: Döndürme aktif', 'info');

  } else if (config.afkMethod === 'sneak') {
    let sneaking = false;
    afkInterval = setInterval(() => {
      if (botInstance && botStatus === 'online') {
        try {
          sneaking = !sneaking;
          botInstance.setControlState('sneak', sneaking);
        } catch(e) {}
      }
    }, 3000);
    addLog('🦾 AFK modu: Çömelme aktif', 'info');

  } else if (config.afkMethod === 'jump') {
    afkInterval = setInterval(() => {
      if (botInstance && botStatus === 'online') {
        try {
          botInstance.setControlState('jump', true);
          setTimeout(() => {
            try { botInstance.setControlState('jump', false); } catch(e) {}
          }, 500);
        } catch(e) {}
      }
    }, 5000);
    addLog('⬆️ AFK modu: Zıplama aktif', 'info');

  } else if (config.afkMethod === 'swing') {
    afkInterval = setInterval(() => {
      if (botInstance && botStatus === 'online') {
        try { botInstance.swingArm(); } catch(e) {}
      }
    }, 3000);
    addLog('👋 AFK modu: Kol sallama aktif', 'info');
  } else {
    addLog('💤 AFK modu: Pasif (hareketsiz)', 'info');
  }
}

function stopBot() {
  clearInterval(afkInterval);
  clearInterval(lookInterval);
  clearInterval(uptimeInterval);
  if (cronJob) { cronJob.stop(); cronJob = null; }
  if (botInstance) {
    try { botInstance.quit(); } catch(e) {}
    botInstance = null;
  }
  botStatus = 'offline';
  stats = { uptime: 0, reconnects: stats.reconnects, startTime: null, health: 0, food: 0, position: { x:0, y:0, z:0 } };
  addLog('🛑 Bot durduruldu.', 'warning');
  updateStats();
}

// Socket.IO
io.on('connection', (socket) => {
  socket.emit('init', { status: botStatus, logs, stats });

  socket.on('start', (config) => {
    if (botStatus === 'online' || botStatus === 'connecting') {
      socket.emit('log', { time: new Date().toLocaleTimeString('tr-TR'), message: '⚠️ Bot zaten çalışıyor!', type: 'warning' });
      return;
    }
    createBot(config);
  });

  socket.on('stop', () => { stopBot(); });

  socket.on('chat', (msg) => {
    if (botInstance && botStatus === 'online') {
      try {
        botInstance.chat(msg);
        addLog(`📤 Mesaj gönderildi: ${msg}`, 'info');
      } catch(e) {
        addLog(`❌ Mesaj gönderilemedi: ${e.message}`, 'error');
      }
    }
  });

  socket.on('command', (cmd) => {
    if (botInstance && botStatus === 'online') {
      try {
        botInstance.chat(cmd);
        addLog(`⚡ Komut: ${cmd}`, 'info');
      } catch(e) {}
    }
  });

  socket.on('clearLogs', () => { logs = []; io.emit('clearLogs'); });
});

// REST API
app.get('/api/status', (req, res) => {
  res.json({ status: botStatus, stats, config: botConfig ? { host: botConfig.host, port: botConfig.port, username: botConfig.username } : null });
});

server.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║  🎮 Minecraft AFK Panel Başlatıldı ║`);
  console.log(`║  🌐 http://localhost:${PORT}          ║`);
  console.log(`╚════════════════════════════════════╝\n`);
});

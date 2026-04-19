# ⛏️ Minecraft AFK Panel

**7/24 Minecraft AFK Bot + Web Yönetim Paneli**

> Mineflayer tabanlı, web panel üzerinden yönetilebilen Minecraft AFK bot sistemi.

---

## 🚀 Özellikler

- 🌐 **Web Panel** — Tarayıcıdan tam kontrol
- ⚙️ **Sunucu IP & Port** — Her sunucuya bağlanma
- 🎮 **Çoklu Versiyon** — 1.8.9 → 1.21.1 arası tüm sürümler
- 💤 **AFK Yöntemleri** — Döndürme, Çömelme, Zıplama, Kol Sallama
- 🔄 **Otomatik Yeniden Bağlanma** — Kick sonrası otomatik giriş
- 📟 **Gerçek Zamanlı Konsol** — Canlı log takibi
- 💬 **Chat & Komut Gönderme** — Panelden doğrudan mesaj
- ❤️ **Can & Açlık Takibi** — Anlık durum görüntüleme
- 📍 **Konum Takibi** — X/Y/Z koordinatları
- 🔐 **Premium & Cracked** — Her iki mod desteği

---

## 📦 Kurulum

### 1. Gereksinimler
```bash
Node.js 18+ — https://nodejs.org
Git
```

### 2. Repo'yu Klonla
```bash
git clone https://github.com/harrypotterrsever3-dev/minecraft-afk-panel.git
cd minecraft-afk-panel
```

### 3. Bağımlılıkları Yükle
```bash
npm install
```

### 4. Başlat
```bash
npm start
```

### 5. Web Paneli Aç
```
http://localhost:3000
```

---

## ⚙️ Kullanım

1. Web paneli aç → `http://localhost:3000`
2. **Sunucu IP** ve **Port** gir
3. **Kullanıcı Adı** belirle (cracked sunucu için herhangi bir isim)
4. **Minecraft Versiyonu** seç (veya Otomatik bırak)
5. **AFK Yöntemi** seç
6. **▶ Botu Başlat** butonuna tıkla

---

## 🔧 AFK Yöntemleri

| Yöntem | Açıklama |
|--------|----------|
| 🔄 Döndürme | Kamerayı sürekli döndürür (en yaygın) |
| 🦾 Çömelme | Periyodik olarak çömeler |
| ⬆️ Zıplama | Belirli aralıklarla zıplar |
| 👋 Kol Sallama | Kol sallar |
| 💤 Pasif | Tamamen hareketsiz |

---

## 🌐 7/24 Çalıştırma (VPS/Sunucu)

### PM2 ile (Önerilen)
```bash
npm install -g pm2
pm2 start server.js --name minecraft-afk
pm2 startup
pm2 save
```

### Screen ile
```bash
screen -S afkbot
npm start
# Ctrl+A, D ile arka plana al
```

### Docker ile
```bash
docker build -t mc-afk .
docker run -d -p 3000:3000 --name mc-afk mc-afk
```

---

## 🔒 Güvenlik

- Panel'i internete açmak istiyorsanız nginx reverse proxy + şifre koruması ekleyin
- `.env` dosyası oluşturup `PORT=3000` gibi ayarları oradan yönetin

---

## 📝 Lisans

MIT License — Özgürce kullanın ve geliştirin!

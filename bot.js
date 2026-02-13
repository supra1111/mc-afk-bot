const mineflayer = require('mineflayer');

// ----- BURAYI DOLDUR (DynIP kullan) -----
// Örnek: '123456.aternos.host' veya 'muttalipcan3162.aternos.me'
const SERVER_ADDRESS = 'muttalipcan3162.aternos.me:25553';  // DynIP ile değiştir
const SERVER_PORT = 25565;  // DynIP'te farklı port varsa onu yaz
const BOT_USERNAME = 'AFKBot' + Math.floor(Math.random() * 1000);  // Rastgele isim
const MINECRAFT_VERSION = '1.21.1';
// -----------------------------------------

console.log('🤖 Bot başlatılıyor...');
console.log('📡 Sunucu:', SERVER_ADDRESS);
console.log('🔌 Port:', SERVER_PORT);
console.log('👤 Bot:', BOT_USERNAME);
console.log('🎮 Sürüm:', MINECRAFT_VERSION);

function createBot() {
    try {
        console.log('🔄 Bağlanmayı dene...');
        
        const bot = mineflayer.createBot({
            host: SERVER_ADDRESS,
            port: SERVER_PORT,
            username: BOT_USERNAME,
            auth: 'offline',
            version: MINECRAFT_VERSION,
            viewDistance: 'tiny',
            connectTimeout: 30000
        });

        bot.on('login', () => {
            console.log('✅ BAŞARILI! Sunucuya bağlandı!');
        });

        bot.on('spawn', () => {
            console.log('🌍 Dünyaya giriş yapıldı!');
            console.log('📍 Konum:', bot.entity.position);
            
            setInterval(() => {
                if (!bot.entity) return;
                try {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 200);
                    console.log('🦘 Zıpladı');
                } catch (e) {}
            }, 4000);
        });

        bot.on('error', (err) => {
            console.log('❌ Hata:', err.message);
            
            if (err.message.includes('ECONNREFUSED')) {
                console.log('🔴 Sunucu kapalı! Aternos\'tan sunucuyu AÇ');
            }
            if (err.message.includes('ETIMEDOUT')) {
                console.log('⏱️ Zaman aşımı - DynIP dene!');
            }
            if (err.message.includes('ECONNRESET')) {
                console.log('🔄 Bağlantı sıfırlandı - Tekrar deneniyor...');
            }
        });

        bot.on('kicked', (reason) => {
            console.log('👢 Bot atıldı:', reason);
        });

        bot.on('end', () => {
            console.log('🔌 Bağlantı koptu, 15sn sonra yeniden...');
            setTimeout(createBot, 15000);
        });

        return bot;
        
    } catch (err) {
        console.log('❌ Bot hatası:', err.message);
        setTimeout(createBot, 10000);
    }
}

createBot();

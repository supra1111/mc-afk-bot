const mineflayer = require('mineflayer');

// ----- KENDİ BİLGİLERİNLE DOLDUR -----
const SERVER_ADDRESS = 'supra1111.aternos.me';
const SERVER_PORT = 25565;
const BOT_USERNAME = 'AFKBot';
const MINECRAFT_VERSION = '1.21.1';  // 1.21.11 için 1.21.1 kullan (uyumlu)
// -------------------------------------

console.log('🤖 Bot başlatılıyor...');
console.log('📡 Sunucu:', SERVER_ADDRESS);
console.log('🎮 Minecraft Sürümü:', MINECRAFT_VERSION);

function createBot() {
    try {
        console.log('🔄 Bağlanmaya çalışılıyor...');
        
        const bot = mineflayer.createBot({
            host: SERVER_ADDRESS,
            port: SERVER_PORT,
            username: BOT_USERNAME,
            auth: 'offline',
            version: MINECRAFT_VERSION,
            viewDistance: 'tiny',
            chatLengthLimit: 256,
            connectTimeout: 30000, // 30 saniye timeout
            keepAlive: true
        });

        bot.on('login', () => {
            console.log('✅ Sunucuya başarıyla bağlandı!');
            console.log('🆔 Bot ID:', bot.entity.id);
        });

        bot.on('spawn', () => {
            console.log('🌍 Bot dünyaya giriş yaptı! AFK modu aktif');
            console.log('📍 Konum:', bot.entity.position);
            
            // Hemen bir mesaj gönder
            setTimeout(() => {
                if (bot.player) {
                    bot.chat('Merhaba! AFK bot aktif!');
                }
            }, 2000);
            
            // Her 3 saniyede bir hareket et (çok sık)
            setInterval(() => {
                if (!bot.entity) return;
                
                try {
                    // Rastgele bir aksiyon seç
                    const actionNum = Math.floor(Math.random() * 5);
                    
                    switch(actionNum) {
                        case 0: // Zıpla
                            bot.setControlState('jump', true);
                            setTimeout(() => bot.setControlState('jump', false), 200);
                            console.log('🦘 Zıpladı');
                            break;
                            
                        case 1: // Sağa bak
                            bot.look(bot.entity.yaw + 1.0, 0);
                            console.log('👉 Sağa döndü');
                            break;
                            
                        case 2: // Sola bak
                            bot.look(bot.entity.yaw - 1.0, 0);
                            console.log('👈 Sola döndü');
                            break;
                            
                        case 3: // İleri yürü
                            bot.setControlState('forward', true);
                            setTimeout(() => bot.setControlState('forward', false), 400);
                            console.log('🚶 İleri yürüdü');
                            break;
                            
                        case 4: // Chat mesajı (daha seyrek)
                            if (Math.random() > 0.5) {
                                const mesajlar = ['AFK', 'farm', 'bot aktif', 'merhaba', '^^'];
                                bot.chat(mesajlar[Math.floor(Math.random() * mesajlar.length)]);
                                console.log('💬 Chat mesajı');
                            }
                            break;
                    }
                    
                } catch (err) {
                    console.log('⚠️ Hareket hatası:', err.message);
                }
            }, 3000); // Her 3 saniyede bir
        });

        bot.on('health', () => {
            if (bot.health < 20) {
                console.log(`❤️ Can: ${bot.health}/20`);
            }
        });

        bot.on('error', (err) => {
            console.log('❌ Hata:', err.message);
            if (err.message.includes('ECONNREFUSED')) {
                console.log('🔴 Sunucu kapalı olabilir! Aternos\'tan sunucuyu aç.');
            } else if (err.message.includes('ETIMEDOUT')) {
                console.log('⏱️ Bağlantı zaman aşımı!');
            }
        });

        bot.on('kicked', (reason) => {
            console.log('👢 Bot atıldı! Sebep:', reason);
        });

        bot.on('end', (reason) => {
            console.log('🔌 Bağlantı koptu! 20 saniye sonra yeniden bağlanılıyor...');
            setTimeout(createBot, 20000);
        });

        return bot;
        
    } catch (err) {
        console.log('❌ Bot oluşturulamadı:', err.message);
        console.log('🔄 15 saniye sonra tekrar denenecek...');
        setTimeout(createBot, 15000);
    }
}

console.log('🚀 Bot başlatılıyor...');
createBot();

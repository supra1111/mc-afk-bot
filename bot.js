const mineflayer = require('mineflayer');

// ----- KENDİ BİLGİLERİNLE DOLDUR -----
const SERVER_ADDRESS = 'sunucu-adin.aternos.me'; // Aternos sunucu adresin
const SERVER_PORT = 25565;                       // Genelde 25565'tir
const BOT_USERNAME = 'AFKBot';                    // Bot ismi
// GELİŞMİŞ AYARLAR (İsteğe bağlı değiştir)
const COMBAT_MODE = true;                         // true = düşman mobları öldürür, false = sadece AFK kalır
const ANTI_AFK_DELAY = 8000;                       // Her 8 saniyede bir aksiyon al (ms)
// -------------------------------------

console.log(`${BOT_USERNAME} sunucuya bağlanmayı deniyor...`);

const bot = mineflayer.createBot({
    host: SERVER_ADDRESS,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    auth: 'offline' // Aternos cracked olduğu için 'offline'
});

let currentTarget = null; // Savaş modu için hedef

// Sunucuya giriş yapınca çalışır
bot.on('login', () => {
    console.log(`✅ ${BOT_USERNAME} sunucuya giriş yaptı!`);
});

// Dünyaya spawn olunca çalışır (asıl aktiviteler burada başlar)
bot.on('spawn', () => {
    console.log('🌍 Bot dünyaya giriş yaptı, gelişmiş AFK aktiviteleri başlıyor...');
    
    // ### 1. GELİŞMİŞ ANTİ-AFK DÖNGÜSÜ ###
    // Normal hareketlerden daha sık ve çeşitli aksiyonlar alır
    setInterval(() => {
        if (!bot.entity) return;

        // Rastgele bir aksiyon seç
        const action = Math.floor(Math.random() * 4);
        
        switch(action) {
            case 0: // Zıpla
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 400);
                console.log('[AFK] Zıpladı');
                break;
            case 1: // Sola bak
                bot.look(bot.entity.yaw + Math.PI/4, 0);
                console.log('[AFK] Sola döndü');
                break;
            case 2: // Sağa bak
                bot.look(bot.entity.yaw - Math.PI/4, 0);
                console.log('[AFK] Sağa döndü');
                break;
            case 3: // İleri git
                bot.setControlState('forward', true);
                setTimeout(() => bot.setControlState('forward', false), 600);
                console.log('[AFK] İleri yürüdü');
                break;
        }

        // Arada bir chat mesajı gönder (daha gerçekçi)
        if (Math.random() > 0.7) {
            const messages = ['Merhaba!', 'iyi server', 'farm yapıyorum', 'selam', 'bot aktif'];
            bot.chat(messages[Math.floor(Math.random() * messages.length)]);
        }

    }, ANTI_AFK_DELAY); // Her 8 saniyede bir çalışır (daha sık)

    // ### 2. SAVAŞ MODU (OPSİYONEL) ###
    // Eğer COMBAT_MODE açıksa, etraftaki düşman mobları öldürür
    if (COMBAT_MODE) {
        console.log('⚔️ Savaş modu aktif! Etraftaki düşmanlar öldürülecek.');
        
        // Sürekli etrafındaki mobları kontrol et
        setInterval(() => {
            if (!bot.entity) return;

            // Düşman mobları filtrele (zombi, iskelet, örümcek, vs.)
            const hostiles = Object.values(bot.entities).filter(entity => {
                if (entity.type !== 'mob') return false;
                const name = entity.name?.toLowerCase() || '';
                const hostileMobs = ['zombie', 'skeleton', 'spider', 'creeper', 'enderman', 'witch', 'pillager', 'vex', 'ravager', 'evoker', 'vindicator', 'husk', 'stray', 'phantom', 'drowned', 'guardian', 'elder_guardian', 'shulker', 'slime', 'magma_cube', 'blaze', 'ghast', 'hoglin', 'zoglin', 'piglin_brute', 'warden'];
                return hostileMobs.includes(name) && entity.position && bot.entity.position.distanceTo(entity.position) < 6; // 6 blok menzil
            });

            if (hostiles.length > 0) {
                // En yakın düşmanı hedef al
                const nearest = hostiles.reduce((a, b) => {
                    return a.position.distanceTo(bot.entity.position) < b.position.distanceTo(bot.entity.position) ? a : b;
                });
                
                currentTarget = nearest;
                console.log(`⚔️ Hedef bulundu: ${currentTarget.name}`);
            } else {
                currentTarget = null;
            }

            // Eğer hedef varsa saldır
            if (currentTarget && bot.supportFeature('physicalWeapons')) {
                const target = currentTarget;
                bot.lookAt(target.position.offset(0, 1, 0));
                bot.attack(target);
                console.log(`⚔️ ${target.name} hedefine saldırıyor...`);
            }

        }, 3000); // Her 3 saniyede bir hedef kontrolü yap
    }

    // ### 3. OTOMATİK YENİDEN BAĞLANMA ###
    // Bot ölürse veya bağlantı koparsa tekrar bağlan
});

// ### 4. HATA YÖNETİMİ ###
bot.on('error', (err) => {
    console.log('❌ Hata:', err);
});

// Sunucudan atılınca (kick)
bot.on('kicked', (reason) => {
    console.log('👢 Bot atıldı! Sebep:', reason);
    // Özel olarak AFK sebebiyle atıldıysa logla
    if (reason.includes('fly') || reason.includes('Flying')) {
        console.log('⚠️ Uçuş koruması nedeniyle atıldı!');
    }
});

// Bağlantı kopunca
bot.on('end', () => {
    console.log('🔌 Bağlantı koptu. 20 saniye sonra yeniden bağlanılacak...');
    setTimeout(() => {
        console.log('Yeniden bağlanılıyor...');
        process.exit(); // Process manager (pm2) otomatik yeniden başlatır
    }, 20000);
});

// Ölünce yeniden doğ
bot.on('death', () => {
    console.log('💀 Bot öldü! Yeniden doğuyor...');
    // Mineflayer otomatik olarak yeniden doğar
});

// Sağlık azalınca uyar
bot.on('health', () => {
    if (bot.health < 10 && bot.food > 5) {
        console.log('⚠️ Can düşük! Bot yemek yiyor...');
        // Envanterde yemek varsa ye (opsiyonel)
        const foodItem = bot.inventory.slots.find(item => item && item.name.includes('bread') || item.name.includes('apple') || item.name.includes('pork') || item.name.includes('beef'));
        if (foodItem) {
            bot.equip(foodItem, 'hand');
            bot.consume();
        }
    }
});

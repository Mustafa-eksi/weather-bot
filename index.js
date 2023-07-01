import TelegramBot from 'node-telegram-bot-api';
import weather from 'weather-turkey';
import topsecret from './top-secret.json' assert {type:"json"};
const bot = new TelegramBot(topsecret['telegram-key'], {polling: true});

const statusToEmoji = {
    "Açık": "☀️",
    "Sisli": "🌫️",
    "Bulutlu": "☁️",
    "Parçalı Bulutlu": "⛅",
    "Fırtına": "⛈️",
    "Çisenti": "🌦️",
    "Hafif Yağmur": "🌦️",
    "Sağanak Yağmur": "🌧️",
    "Şiddetli Yağmur": "🌧️",
    "Kar": "🌨️"
}

function HavaDurumuYazisi(mes, detayli, sehir) {
    let res = ""
    for(let i = 0; i < mes.measurements.length; i++) {
        let ms = mes.measurements[i];
        res += `\n\n-${ms.date} ${ms.time}-\n`+`${sehir}: ${mes.measurements[0].temperature.value}℃ (${mes.measurements[0].temperature.felt.value}) - ${mes.measurements[0].status.text} ${statusToEmoji[mes.measurements[0].status.text]}`+
    (detayli === true ? 
        `\n💧 Nem: %${mes.measurements[0].humidity.value}\n`+
        `☔ Yağış: ${mes.measurements[0].rains.value} mm\n`+
        `🌤️ Kapalılık: %${mes.measurements[0].closeness.value}\n`+
        `🌬️ Rüzgar: ${mes.measurements[0].wind.speed} km/h (${mes.measurements[0].wind.direction.text})`
    : "");
    }
    return res;
}

async function HavaDurumunuYaz(sehir, detayli, count) {
    return HavaDurumuYazisi(await weather({search:sehir, count:count}).catch(console.error), detayli, sehir);
}

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;
    const message = msg.text+"";
    if(message.includes("hava durumu")) {
        let sehir = message.split(" ")[0];
        let count = message.split(" ").filter(v => isNaN(parseInt(v)) === false);
        let send = await HavaDurumunuYaz(sehir ? sehir : "istanbul", message.includes("detaylı"), isNaN(parseInt(count[0])) ? 1 : parseInt(count[0]));
        send = send.length > 4096 ? send.substring(0, 4096) : send;
        bot.sendMessage(chatId, send);
    }else {
        bot.sendMessage(chatId, "Ne demek istediğini anlamadım.");
    }
});
   

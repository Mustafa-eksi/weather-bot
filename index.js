import TelegramBot from 'node-telegram-bot-api';
import topsecret from './top-secret.json' assert {type:"json"};
const bot = new TelegramBot(topsecret.telegram_key, {polling: true});

const ConditionToEmoji = {
    "Clear": "☀️",
    "Foggy": "🌫️",
    "Cloudy": "☁️",
    "Partially cloudy": "⛅",
    "Storm": "⛈️",
    "Spit": "🌦️",
    "Mizzle": "🌦️",
    "Rain": "🌧️",
    "Downpour": "🌧️",
    "Snowy": "🌨️"
}

// I generated with chatgpt
function getArrowEmoji(angle) {
    // Check if the angle is within valid range
    if (angle < 0 || angle > 360) {
      return "Invalid angle! Please provide a number between 0 and 360.";
    }
  
    // Calculate the arrow emoji based on the angle
    if (angle >= 337.5 || angle < 22.5) {
      return "⬆️"; // Up arrow
    } else if (angle >= 22.5 && angle < 67.5) {
      return "↗️"; // Up-right arrow
    } else if (angle >= 67.5 && angle < 112.5) {
      return "➡️"; // Right arrow
    } else if (angle >= 112.5 && angle < 157.5) {
      return "↘️"; // Down-right arrow
    } else if (angle >= 157.5 && angle < 202.5) {
      return "⬇️"; // Down arrow
    } else if (angle >= 202.5 && angle < 247.5) {
      return "↙️"; // Down-left arrow
    } else if (angle >= 247.5 && angle < 292.5) {
      return "⬅️"; // Left arrow
    } else if (angle >= 292.5 && angle < 337.5) {
      return "↖️"; // Up-left arrow
    }
  }
  

function visualcrossingHavaDurumuYazisi(json, detayli, sehir) {
    let res = ""
    for(let i = 0; i < json.days.length; i++) {
        let ms = json.days[i];
        res += `\n\n-${ms.datetime}-\n`+`${sehir}: ${ms.temp}℃ (${ms.feelslike}) - ${ms.conditions} ${ConditionToEmoji[ms.conditions]}`+
    (detayli === true ? 
        `\n💧 Nem: %${ms.humidity}\n`+
        `☔ Yağış: ${ms.precip} mm\n`+
        `🌤️ Kapalılık: %${ms.cloudcover}\n`+
        `🌬️ Rüzgar: ${ms.windspeed} km/h (${getArrowEmoji(ms.winddir)})`
    : "");
    }
    return res;
}

async function HavaDurumunuYaz(sehir, detayli, date) {
    function toJSONLocal(dt) {
        var local = new Date(dt);
        local.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        return local.toJSON().slice(0, 10);
    }
    let deyt = toJSONLocal(date);
    let data = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/konya/${deyt}/${deyt}?unitGroup=metric&include=days&key=${topsecret.visual_crossing_key}&contentType=json`,{
        "method": "GET",
        "headers": {
    }}).then(res => res.json()).catch(console.error);

    return visualcrossingHavaDurumuYazisi(data, detayli, sehir);
}

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;
    const message = msg.text+"";
    if(message.includes("hava durumu")) {
        let sehir = message.split(" ")[0];
        let dateStr = message.split(" ").filter(v => v.split(".").length === 3 || v.split("/").length === 3)[0] // GG/AA/YYYY veya GG.AA.YYYY olmalı
        let date = dateStr !== undefined ? new Date(dateStr.slice(6,10),dateStr.slice(3,4)+(parseInt(dateStr.slice(4,5))-1),dateStr.slice(0,2)) : new Date(Date.now())
        let send = await HavaDurumunuYaz(sehir ? sehir : "istanbul", message.includes("detaylı"), date);
        send = send.length > 4096 ? send.substring(0, 4096) : send;
        bot.sendMessage(chatId, send);
    }else {
        bot.sendMessage(chatId, "Ne demek istediğini anlamadım.");
    }
});
   

/**
 * Shahbaz - Personal WhatsApp Auto-Reply Bot - v2.0 PERSONAL ONLY
 * ================================================================
 * Ye bot Shahbaz ke PERSONAL WhatsApp number par khud reply dega.
 * Jo bhi banda, kisi bhi number se, koi bhi message bheje,
 * bot us ko apni marzi se free personal reply dega,
 * jaise ek dost baat karta hai.
 *
 * Ye sirf ek number ke liye NAHI hai. Har aane wale message par
 * reply karega - haal chaal, kahan ho, kya kar rahe ho, joke,
 * bore, subah/shab bakhair, ya koi bhi baat.
 *
 * Is me NO order, NO services, NO price, NO payment, NO menu,
 * NO Order ID, NO business kaam. Sirf free personal chat.
 *
 * Kaise kaam karta hai:
 *  1. Ye bot aapke WhatsApp se LINK hota hai (Linked Devices),
 *     jaise WhatsApp Web link hota hai.
 *  2. Aap ek dafa QR scan karte ho, phir bot aapke number par
 *     aane wale har message ka khud jawab deta hai.
 *  3. Agar aap khud kisi chat me jawab de do, to bot us chat me
 *     sirf 5 minute ke liye ruk jata hai, phir dobara reply
 *     karne lagta hai.
 *  4. "Team" likhne par bot ruk jata hai, Shahbaz khud baat karega.
 *
 * IMPORTANT WARNING - PEHLE PARHEIN:
 * Ye official WhatsApp Cloud API NAHI hai. Ye WhatsApp Web automation
 * (whatsapp-web.js) use karta hai, jo WhatsApp ki Terms ke mutabiq
 * official tareeqa NAHI hai. Is se number temporarily ya
 * permanently ban ho sakta hai.
 *
 * Is liye:
 *  1. Pehle apni chats ka backup lein.
 *  2. Pehle kisi SECONDARY / test number par try karein, apne main
 *     personal number par seedha mat chalayein.
 *  3. Agar WhatsApp warning de to bot foran band kar dein.
 *  4. Ye bot chalane ke liye ek computer / server hamesha ON
 *     rehna chahiye. Phone band ho to bhi bot chalta rahega,
 *     lekin computer/server band ho to bot bhi band ho jayega.
 *
 * Safety:
 *  - Groups ko reply NAHI karta (default OFF)
 *  - Status / Broadcast ko reply NAHI karta
 *  - Apne khud ke messages ko reply NAHI karta
 *  - Har reply se pehle 2-5 second rukta hai aur typing dikhata hai
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const BOT_NAME = 'Shahbaz';
const REPLY_TO_GROUPS = false;
const HUMAN_PAUSE_MINUTES = 5;
const REPLY_DELAY_MIN = 2000;
const REPLY_DELAY_MAX = 5000;

const humanPause = {};
const botSentIds = new Set();
let pairingCodeRequested = false;

function clean(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function has(text, ...words) {
  return words.some(w => text.includes(w));
}
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
function randomDelay() {
  return REPLY_DELAY_MIN + Math.random() * (REPLY_DELAY_MAX - REPLY_DELAY_MIN);
}

async function sendReply(msg, text) {
  try {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await sleep(randomDelay());
    const sent = await msg.reply(text);
    if (sent && sent.id && sent.id._serialized) botSentIds.add(sent.id._serialized);
    await chat.clearState();
    return sent;
  } catch (e) {
    console.log('Send error:', e.message);
  }
}

// ============================================================
// PERSONAL FREE CHAT - KOI BHI MESSAGE, KOI BHI BAAT
// ============================================================
function freeReply(raw, text) {
  if (has(text, 'kya haal', 'kesay ho', 'kaise ho', 'how are you', 'haal kaisa', 'kese ho', 'kaisa hai')) {
    return 'Alhamdulillah, main theek hoon! Aap sunayein, aap kaise hain? Aaj kya chal raha hai, sab theek hai na?';
  }
  if (has(text, 'kahan ho', 'kidhar ho', 'where are you', 'kahan par ho', 'kaha ho')) {
    return 'Main yahin hoon, aapke message ka wait kar raha tha. Aap batayein, aap kahan ho? Ghar par ho ya bahar?';
  }
  if (has(text, 'kya kar rahe', 'kya kar raha', 'what are you doing', 'kya ho raha')) {
    return 'Main yahan aap se baat kar raha hoon. Aap batayein, aap kya kar rahe ho? Aaj ka din kaisa guzra?';
  }
  if (has(text, 'tum kaun', 'aap kaun', 'who are you', 'apka naam', 'your name', 'tumhara naam', 'aapka naam')) {
    return 'Main Shahbaz hoon. Aap se baat kar raha hoon, aap batayein, aap kaun hain? Aapka naam kya hai?';
  }
  if (has(text, 'good morning', 'subah bakhair', 'good night', 'shab bakhair')) {
    if (has(text, 'night', 'shab')) {
      return 'Shab bakhair! Aap bhi araam se soyein, kal phir baat karte hain. Allah Hafiz!';
    }
    return 'Subah bakhair! Aap ko bhi bohat bohat mubarak. Aaj ka din aapka acha guzre. Aaj kya plan hai?';
  }
  if (has(text, 'joke', 'mazak', 'funny', 'hasao', 'hansi')) {
    return "Ok, ek simple si baat suno: Ek dafa ek banda WhatsApp par likhta hai 'Hi', main jawab deta hoon 'Hello, kaise ho?' Banda kehta hai 'Bas aap se baat karni thi.' Main kehta hoon 'To phir baat karte hain!' Aap bhi batayein, aur kya sunna hai?";
  }
  if (has(text, 'bore', 'bor ho raha', 'boring')) {
    return 'Bore ho rahe ho? Chalo thori baat karte hain. Aap mujhe batayein, aapko kis cheez mein interest hai? Cricket, movies, ya kuch aur? Main sun raha hoon.';
  }
  if (has(text, 'khana khaya', 'kha liya', 'bhook')) {
    return 'Khana to bohat zaroori hai, aap ne kha liya? Main to bas aap se baat kar raha hoon. Aap batayein, aaj kya khaya?';
  }
  if (has(text, 'neend', 'sleep', 'thak gaya', 'tired')) {
    return 'Thak gaye ho to thora araam kar lo, phir baat karte hain. Main yahin hoon, jab bhi message karo ge, reply kar doon ga.';
  }
  if (has(text, 'shukriya', 'thanks', 'thank you')) {
    return 'Aapka bohat shukriya! Aap se baat karke acha laga. Aur kuch poochna hai to bas likh dein.';
  }
  if (has(text, 'allah hafiz', 'bye', 'khuda hafiz', 'goodbye', 'chalta hoon')) {
    return 'Allah Hafiz! Jab bhi zaroorat ho, dobara message karein. Main yahin hoon.';
  }
  if (has(text, 'ok', 'theek hai', 'acha', 'sahi hai', 'han', 'haan', 'yes')) {
    return 'Theek hai! Acha laga aap se baat karke. Aur kuch batana hai ya bas aise hi baat karni hai? Main yahin hoon, aap freely baat karein.';
  }
  if (has(text, 'aur sunao', 'aur batao', 'kya chal raha')) {
    return 'Sab theek hai, Alhamdulillah. Aap sunayein, aapke paas koi nayi baat hai? Aaj kya kiya aap ne?';
  }

  const replies = [
    `Acha, samajh gaya. Aap ne kaha: "${raw}"\n\nYe bohat interesting baat hai. Aap thora detail mein batayein, main aapko behtar jawab doon ga. Aap kya chahte ho, is par baat karein ya kuch aur poochna hai?`,
    `Haan, ye baat to theek hai. "${raw}" par main ye kahoon ga ke aap bilkul sahi soch rahe ho.\n\nAap aur batayein, aapke mind mein aur kya hai? Main sun raha hoon, aap freely baat karein.`,
    `Interesting! Aap ne "${raw}" likha hai.\n\nMujhe ye jan kar acha laga. Aap is ke baare mein aur kya kehna chahte ho? Main aapki baat ko samajh kar jawab de raha hoon, aap bas aise hi baat karte raho.`,
    'Ok, main samajh gaya. Aap ki baat ka matlab clear hai.\n\nAap batayein, is mein main aapki kya madad kar sakta hoon? Ya bas aise hi baat karni hai? Dono theek hai, main yahin hoon.',
  ];
  if (raw.length < 25) {
    return `Haan, batao. Aap ne "${raw}" likha hai.\n\nAap thora detail mein batayein, taake main aapko sahi aur acha jawab de sakoon. Main yahin hoon, aap freely baat karein.`;
  }
  return replies[Math.floor(Math.random() * replies.length)];
}

async function handleMessage(msg) {
  const chatId = msg.from;
  const raw = (msg.body || '').trim();
  const text = clean(raw);
  if (!raw) return;
  if (humanPause[chatId] && Date.now() < humanPause[chatId]) return;

  // Shahbaz khud baat karna chahe to bot ruk jaye
  if (text === 'team' || text === 'shahbaz' || text === 'human' || has(text, 'shahbaz se baat', 'insan se baat', 'team se baat')) {
    humanPause[chatId] = Date.now() + HUMAN_PAUSE_MINUTES * 60 * 1000;
    await sendReply(msg, `Main hi ${BOT_NAME} hoon, aap mujh se hi baat kar rahe ho. Aap apni baat likh dein, main jawab doon ga.\n\nAgar aap chahte hain ke main is chat me ${HUMAN_PAUSE_MINUTES} minute tak reply na karoon, to samajh gaya, main ruk gaya hoon.`);
    return;
  }

  // Hi / Salam - sirf personal welcome, NO menu, NO order
  if ((has(text, 'hi') && text.length < 10) || ['hello', 'hey', 'salam', 'aoa', 'assalam', 'assalam-o-alaikum'].includes(text)) {
    await sendReply(msg, `Assalam-o-Alaikum! Main ${BOT_NAME} hoon.\n\nAap kaise hain? Aap mujh se kuch bhi pooch sakte ho, ya bas aise hi baat kar sakte ho. Main yahin hoon.`);
    return;
  }

  // Har aur message - free personal chat, kisi bhi number se
  await sendReply(msg, freeReply(raw, text));
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', async (qr) => {
  console.log('\n=== QR CODE SCAN KAREIN ===');
  console.log('WhatsApp App kholain > Linked Devices > Link a Device > Ye QR scan karein');
  qrcode.generate(qr, { small: true });
  // Pairing code - QR scan na ho sake to code se link karein.
  // WhatsApp > Linked Devices > Link a Device > Link with phone number
  // par ye 8-character code likhein. Sirf ek dafa request karein.
  if (!pairingCodeRequested) {
    pairingCodeRequested = true;
    try {
      const code = await client.requestPairingCode('923024594578');
      console.log('\n=== PAIRING CODE ===');
      console.log('Pairing code: ' + code);
      console.log('WhatsApp > Linked Devices > Link a Device > Link with phone number par ye code likhein.');
    } catch (e) {
      console.log('Pairing code error:', e.message);
    }
  }
});

client.on('code', (code) => {
  console.log('\n=== PAIRING CODE ===');
  console.log('Pairing code: ' + code);
});

client.on('ready', () => {
  console.log('\nBot READY hai! Ab Shahbaz ke personal number par har aane wale message ka auto reply chalega.');
  console.log('Band karne ke liye Ctrl+C dabayein.');
});

client.on('auth_failure', (m) => console.log('Auth failure:', m));
client.on('disconnected', (r) => console.log('Disconnected:', r));

client.on('message_create', async (msg) => {
  try {
    if (!msg.fromMe) return;
    if (msg.id && msg.id._serialized && botSentIds.has(msg.id._serialized)) return;
    const chatId = msg.to || msg.from;
    if (chatId && !chatId.endsWith('@g.us')) {
      humanPause[chatId] = Date.now() + HUMAN_PAUSE_MINUTES * 60 * 1000;
      console.log('Shahbaz ne khud jawab diya, bot paused for:', chatId);
    }
  } catch (e) { console.log(e.message); }
});

client.on('message', async (msg) => {
  try {
    if (msg.fromMe) return;
    if (msg.from === 'status@broadcast') return;
    const chat = await msg.getChat();
    if (chat.isGroup && !REPLY_TO_GROUPS) return;
    if (!msg.body) {
      await sendReply(msg, 'Aapka message mil gaya hai. Aap apni baat likh dein, main jawab doon ga.');
      return;
    }
    console.log(`Incoming from ${msg.from}: ${msg.body.slice(0, 120)}`);
    await handleMessage(msg);
  } catch (e) {
    console.log('Message handler error:', e.message);
  }
});

client.initialize();

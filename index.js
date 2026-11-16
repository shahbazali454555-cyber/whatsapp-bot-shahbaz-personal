/**
 * Shahbaz - Personal WhatsApp Auto-Reply Bot - v2.1 PERSONAL ONLY
 * ================================================================
 * v2.1 fixes (2026-11-16 21:13 PKT):
 *  - Bot apne khud ke reply ko Shahbaz ka jawab samajh kar 5 minute
 *    ka pause nahi lagayega (botJustReplied guard).
 *  - "auth timeout" jaisa error aane par bot band nahi hoga
 *    (unhandledRejection / uncaughtException handlers + start.sh
 *    auto-restart loop).
 *  - SIRF naye messages ka reply (Shahbaz ka 20:19 PKT rule):
 *    bot READY hone se pehle ke purane messages aur dobara aane
 *    wale messages ignore, har message ka jawab sirf ek dafa.
 * v2.2 (2026-11-16 21:21 PKT):
 *  - Message ko dobara repeat NAHI karna - "Aap ne X likha hai"
 *    wala echo band (Shahbaz ka 21:21 PKT rule). Seedha natural
 *    jawab dena. "Kedar ho" bhi kahan-ho intent mein shamil.
 * v2.3 (2026-11-16 21:22 PKT):
 *  - Real AI attach: Gemini (free) via GEMINI_API_KEY secret.
 *    Har message ka jawab pehle Gemini se, fail ho to rule-based.
 *  - "thoda detail mein batayein" wala lazy jawab bilkul band.
 * v2.4 (2026-11-16 21:40 PKT):
 *  - Link intents: ChatGPT, Gemini, YouTube, Google ke link seedha dega.
 *  - Lazy fallback ("aur kya kehna chahte ho") khatam - seedha jawab.
 *  - Pairing number Replit secret PAIRING_NUMBER se (Business number ke liye).
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
// v2.3: Real AI - Gemini (free) - key Replit Secrets me GEMINI_API_KEY naam se
// Key na ho ya AI fail ho jaye to neeche wala rule-based freeReply chalega
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

async function aiReply(raw) {
  if (!GEMINI_API_KEY) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: 'You are Shahbaz, chatting with a friend on his personal WhatsApp in Roman English (Latin script, simple English mixed with Roman Urdu, the way Shahbaz speaks). Reply naturally like a real friend: short, warm, direct. Never repeat the user message back, never quote what they said, never say "tell me in more detail". Answer the message itself, improvise sensibly when it is unclear. Keep replies short, 1-3 lines usually. Never mention you are an AI, a bot, Gemini or ChatGPT.' }] },
          contents: [{ parts: [{ text: raw }] }],
          generationConfig: { maxOutputTokens: 200, temperature: 0.8 }
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timer);
    if (!res.ok) { console.log('Gemini API error:', res.status); return null; }
    const data = await res.json();
    const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return text ? String(text).trim() : null;
  } catch (e) {
    console.log('Gemini error:', e.message);
    return null;
  }
}

const humanPause = {};
const botSentIds = new Set();
const botJustReplied = {}; // chatId -> time jab bot ne abhi reply bheja (taake apne reply ko Shahbaz ka jawab na samjha jaye)
let readyAtMs = 0; // jab bot READY hua, us ka time - sirf us ke baad wale naye messages ka reply
const seenIncomingIds = new Set(); // har incoming message id ka sirf ek dafa jawab
let pairingCodeRequested = false;

// v2.1 FIX: Bot kisi bhi error se band na ho - error aaye to sirf log kare, process zinda rahe
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection (bot band nahi hoga):', reason && reason.message ? reason.message : reason);
});
process.on('uncaughtException', (e) => {
  console.log('Uncaught exception (bot band nahi hoga):', e && e.message ? e.message : e);
});

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
    // v2.1 FIX: reply bhejne se PEHLE hi mark kar do, taake message_create
    // is ko Shahbaz ka khud ka jawab samajh kar 5 minute ka pause na laga de
    botJustReplied[msg.from] = Date.now();
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
  if (has(text, 'kahan ho', 'kidhar ho', 'kedar ho', 'kidar ho', 'where are you', 'kahan par ho', 'kaha ho', 'kedar ha', 'kidhar ha')) {
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

  // v2.4: "aur kya kehna chahte ho" wala lazy sawal bilkul band (21:36 PKT screenshot) -
  // har message ka seedha jawab dena, sawal wapas nahi karna
  if (has(text, 'chatgpt', 'chat gpt')) {
    return 'ChatGPT ka link ye hai: https://chatgpt.com — is par click karo, wahan account bana kar baat karo. App chahiye to Play Store par "ChatGPT" likh kar download kar lo.';
  }
  if (has(text, 'gemini')) {
    return 'Gemini ka link ye hai: https://gemini.google.com — is par click karo, apne Google account se sign in kar ke baat karo. App chahiye to Play Store par "Gemini" likh kar download kar lo.';
  }
  if (has(text, 'youtube')) {
    return 'YouTube ka link ye hai: https://www.youtube.com — is par click karo. App chahiye to Play Store par "YouTube" likh kar download kar lo.';
  }
  if (has(text, 'google')) {
    return 'Google ka link ye hai: https://www.google.com — is par click karo, jo chahiye search karo.';
  }
  if (has(text, 'link bhej', 'link do', 'link chahiye')) {
    return 'Kaunsa link chahiye? Agar ChatGPT ka chahiye to ye hai: https://chatgpt.com';
  }
  const replies = [
    'Haan, samajh gaya. Ye baat theek hai.',
    'Theek hai, aap ki baat samajh aa gayi. Main yahin hoon.',
    'Haan, ye baat to theek hai. Aap ne sahi kaha.',
    'Ok, samajh gaya. Main aap ki baat sun raha hoon.',
    'Haan, aap sahi keh rahe ho.',
    'Acha, ye baat samajh aa gayi.',
  ];
  if (raw.length < 25) {
    return replies[Math.floor(Math.random() * replies.length)];
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

  // Har aur message - pehle real AI (Gemini), fail ho to rule-based freeReply
  const smart = await aiReply(raw);
  if (smart) {
    await sendReply(msg, smart);
    return;
  }
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
      // v2.4: Pairing number Replit secret PAIRING_NUMBER se (Business number ke liye),
      // warna purana personal number 923024594578. Number 92 se shuru, baghair +.
      const pairingNumber = process.env.PAIRING_NUMBER || '923024594578';
      const code = await client.requestPairingCode(pairingNumber);
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
  readyAtMs = Date.now();
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
    // v2.1 FIX: Bot ne abhi (10 second ke andar) khud reply bheja ho to
    // ye Shahbaz ka jawab NAHI hai - pause mat lagao
    if (chatId && botJustReplied[chatId] && Date.now() - botJustReplied[chatId] < 10000) return;
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
    // v2.1: SIRF naye messages ka reply - purane / dobara aane wale messages ignore
    // (Shahbaz ka 20:19 PKT rule: purane message ka reply nahi, ek hi message sab ko nahi)
    if (msg.timestamp) {
      const msgMs = msg.timestamp * 1000;
      if (readyAtMs && msgMs < readyAtMs - 5000) return; // bot READY hone se pehle ka message
      if (Date.now() - msgMs > 120000) return; // 2 minute se purana message: stale replay
    }
    const incomingId = msg.id && msg.id._serialized;
    if (incomingId) {
      if (seenIncomingIds.has(incomingId)) return; // is message ka jawab ek dafa ho chuka
      seenIncomingIds.add(incomingId);
    }
    console.log(`Incoming from ${msg.from}: ${msg.body.slice(0, 120)}`);
    await handleMessage(msg);
  } catch (e) {
    console.log('Message handler error:', e.message);
  }
});

client.initialize().catch((e) => console.log('Initialize error:', e && e.message ? e.message : e));

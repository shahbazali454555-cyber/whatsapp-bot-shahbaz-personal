/**
 * Shahbaz - Personal WhatsApp Auto-Reply Bot - v12.3 version PERSONAL ONLY (heavy version)
 * ================================================================
 * v12.3 (2026-11-17 08:33 PKT) - varied thk/good/kasa replies: pools of 3-4 short replies, per-chat rotation, never repeats the last bot reply in the same chat, never re-asks 'aur sunao?' right after asking it. All v12.2 behaviour unchanged.
 * v12.2 (2026-11-17 08:20 PKT) - good/ok/thanks short replies, no fallback for short replies:
 * v12.1 (2026-11-17 01:00 PKT) - greeting-follow-up fix:
 * - Rule-based intents (no AI wait) for thk/theek and ap kasa/kaise/kese/kesy ho,
 *   matched anywhere in the message, so the fallback never fires for greetings.
 *   All v12.0 behaviour unchanged (delay 0, AI timeout 3s, Pollinations first).
 * v12.0 SPEED (2026-11-17 00:38 PKT) - speed release:
 * - No artificial reply delay (REPLY_DELAY 0); AI timeout 12s -> 3s;
 *   Pollinations-default FIRST, then Gemini, then Pollinations-openai;
 *   Pollinations single attempt, no 20s/3s retry waits. All else unchanged
 *   from v11.0.
 * v11.0 (2026-11-16 23:18 PKT) - heavy version:
 *  - ROOT CAUSE (diagnosed live from Replit Shell): Gemini 3.8-flash free
 *    tier quota exhausted (HTTP 429, 20/day, retry ~13h54m); Pollinations
 *    with long prompt + ?model=openai took 16.2s (aborted at 8s) and gave
 *    the wrong day for "Kal kia hai?". gemini-2.5-flash is retired (404).
 *  - FIX: date/day is rule-based + instant (live Asia/Karachi), never AI;
 *    Pollinations short prompt, DEFAULT model first (live: 0.39s) + openai
 *    as 2nd attempt; timeout 8s -> 12s; each AI step in own try/catch;
 *    Gemini history fixed (last turn now role "user").
 *  - VOICE: no transcription key - voice notes get one short line only:
 *    "Voice sun nahi sakta, likh kar bhejo."
 *  - Self-test: node index.js --selftest
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
 * v4.0 (2026-11-16 22:49 PKT) - heavy version:
 *  - Conversation memory: har chat ki last 6 exchanges (user message +
 *    bot reply) Gemini ko history ke saath bhejte hain (alternating
 *    user/model turns), taake follow-up jaise "Lahore ka pocha h"
 *    context me samajh aaye.
 *  - Time intent: "time" kahin bhi ho to time batao (typo "kai" bhi
 *    chalega). City naam ho (Lahore, Karachi, Islamabad, Rawalpindi,
 *    Faisalabad, Multan, Peshawar, Quetta) to us city ka time, warna
 *    Pakistan time. Poora Pakistan ek hi timezone (PKT) hai.
 *  - Generic fallback: "Haan, bolo..." / "Haan, main yahin hoon, bolo."
 *    sirf bare call (oye/hello/shahbaz?) par. AI fail ho to real
 *    question par short: "Samajh nahi aaya, dobara likho."
 *  - AI timeout 8s per model (unchanged) - busy Gemini fast fall-through.
 * v2.4.4 (2026-11-16 22:47 PKT):
 *  - SHORT replies only (Shahbaz ka 22:46 PKT rule): greeting salam/aoa ->
 *    "Walaikum Assalam!" only, hi/hello/hey -> "Hi! Kaise ho?" only.
 *    No "Assalam-o-Alaikum, main Shahbaz hoon", no "aap mujh se kuch
 *    bhi pooch sakte hain", no "main ye hoon, main wo hoon".
 *  - Gemini system instruction: short and point to point, 1-2 lines max.
 *    Never introduce yourself, never say "Main Shahbaz hoon", never say
 *    "aap mujh se kuch bhi pooch sakte hain" or "aap kaise hain" unless
 *    the user asked how you are. Answer only the message itself.
 *  - Rule-based intents: trailing questions/invitations removed, every
 *    reply a short statement answering only the point.
 * v2.4.3 (2026-11-16 22:15 PKT):
 *  - FAST: intent (time/link/kon ho/kahan ho) pehle, AI ka wait nahi; delay 0.8-1.5s; AI timeout 8s.
 *  - Multi-AI chain: Gemini 3.8-flash -> Pollinations (free, bina key) -> DeepSeek ->
 *    Groq -> OpenRouter free -> ChatGPT (paid, key ho to). Key wale step bina key skip.
 * v2.4.2 (2026-11-16 22:06 PKT):
 *  - Gemini: 3.8-flash busy (503) ho to 2.5-flash try karo, har model 2 dafa retry.
 *  - Time intent: asli Pakistan time batayega. "Ap kon ho" intent fix.
 *  - CapCut link intent + behtar short-message replies (bewaqoof "aap sahi keh rahe ho" khatam).
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
const REPLY_DELAY_MIN = 0;
const REPLY_DELAY_MAX = 0;
// v12.0 SPEED: per-model timeout 12s -> 3s
const AI_TIMEOUT_MS = 3000;
// v2.3: Real AI - Gemini (free) - key Replit Secrets me GEMINI_API_KEY naam se
// Key na ho ya AI fail ho jaye to neeche wala rule-based freeReply chalega
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
// v2.4.3: sirf 3.8-flash (2.5-flash band hai, 404). v12.0 SPEED AI chain: Pollinations-default -> Gemini -> Pollinations-openai
// -> DeepSeek -> Groq -> OpenRouter -> ChatGPT (paid, key ho to).
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const AI_SYSTEM = 'You are Shahbaz, chatting with a friend on his personal WhatsApp in Roman English (Latin script, simple English mixed with Roman Urdu, the way Shahbaz speaks). Reply short and point to point, 1-2 lines max. Never introduce yourself, never say \'Main Shahbaz hoon\', never say \'aap mujh se kuch bhi pooch sakte hain\' or \'aap kaise hain\' unless the user asked how you are. Answer only the message itself. No preamble, no filler. Never repeat the user message back, never quote what they said, never say "tell me in more detail". Improvise sensibly when it is unclear. Never mention you are an AI, a bot, Gemini or ChatGPT.';

const VOICE_REPLY = 'Voice sun nahi sakta, likh kar bhejo.';

async function postChat(url, key, model, raw, extraHeaders) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key }, extraHeaders || {}),
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: AI_SYSTEM },
          { role: 'user', content: raw }
        ],
        max_tokens: 200,
        temperature: 0.8
      }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) { console.log('AI error:', url.split('/')[2], model, res.status); return null; }
    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return text ? String(text).trim() : null;
  } catch (e) {
    clearTimeout(timer);
    console.log('AI error:', url.split('/')[2], model, e.message);
    return null;
  }
}

async function callGemini(model, raw, history) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    // v4.0: last 6 exchanges as alternating user/model turns, phir naya message
    const contents = [];
    (history || []).forEach(ex => {
      if (!ex || !ex.user || !ex.bot) return;
      contents.push({ role: 'user', parts: [{ text: ex.user }] });
      contents.push({ role: 'model', parts: [{ text: ex.bot }] });
    });
    contents.push({ role: 'user', parts: [{ text: raw }] }); // v11.0 FIX: v4.0 sent this turn with NO role
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: AI_SYSTEM }] },
          contents: contents,
          generationConfig: { maxOutputTokens: 200, temperature: 0.8 }
        }),
        signal: controller.signal
      }
    );
    clearTimeout(timer);
    if (!res.ok) {
      let snippet = '';
      try { snippet = (await res.text()).slice(0, 200); } catch (e) {}
      console.log('Gemini API error:', model, res.status, snippet);
      return null;
    }
    const data = await res.json();
    const text = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return text ? String(text).trim() : null;
  } catch (e) {
    clearTimeout(timer);
    console.log('Gemini error:', model, e.message);
    return null;
  }
}

// v12.0 SPEED: Pollinations - SHORT prompt, DEFAULT model first (live test: 0.39s, correct).
// v4.0 sent the whole AI_SYSTEM with ?model=openai: 16.2s, aborted at 8s, never answered.
async function pollinationsReply(raw, useOpenAiModel) {
  // v12.0 SPEED: single attempt only - on 402/429 or error return null immediately, no retry waits.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const prompt = 'Reply short, 1-2 lines, Roman English: ' + raw;
    const url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt) + (useOpenAiModel ? '?model=openai' : '');
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      console.log('Pollinations error:', res.status, useOpenAiModel ? 'openai' : 'default');
      return null;
    }
    const text = (await res.text() || '').trim();
    if (!text || text.startsWith('<') || /free limit reached/i.test(text)) return null;
    return text.slice(0, 500);
  } catch (e) {
    clearTimeout(timer);
    console.log('Pollinations error:', useOpenAiModel ? 'openai' : 'default', e.message);
    return null;
  }
}

async function aiReply(raw, history) {
  // v11.0: EVERY step in its own try/catch - one model failure never kills the chain.
  const steps = [];
  // v12.0 SPEED: Pollinations-default FIRST, then Gemini, then Pollinations-openai.
  steps.push(['Pollinations-default', () => pollinationsReply(raw, false)]);
  if (GEMINI_API_KEY) steps.push(['Gemini', () => callGemini(GEMINI_MODEL, raw, history)]);
  steps.push(['Pollinations-openai', () => pollinationsReply(raw, true)]);
  if (DEEPSEEK_API_KEY) steps.push(['DeepSeek', () => postChat('https://api.deepseek.com/v1/chat/completions', DEEPSEEK_API_KEY, 'deepseek-chat', raw)]);
  if (GROQ_API_KEY) steps.push(['Groq', () => postChat('https://api.groq.com/openai/v1/chat/completions', GROQ_API_KEY, 'llama-3.3-70b-versatile', raw)]);
  if (OPENROUTER_API_KEY) steps.push(['OpenRouter', () => postChat('https://openrouter.ai/api/v1/chat/completions', OPENROUTER_API_KEY, 'meta-llama/llama-3.3-70b-instruct:free', raw, { 'HTTP-Referer': 'https://replit.com', 'X-Title': 'Shahbaz Bot' })]);
  if (OPENAI_API_KEY) steps.push(['ChatGPT', () => postChat('https://api.openai.com/v1/chat/completions', OPENAI_API_KEY, 'gpt-4o-mini', raw)]);
  for (const [name, fn] of steps) {
    try {
      const r = await fn();
      if (r) return r;
      console.log('AI step empty:', name);
    } catch (e) {
      console.log('AI step failed:', name, e && e.message ? e.message : e);
    }
  }
  return null;
}

const humanPause = {};
const botSentIds = new Set();
const botJustReplied = {}; // chatId -> time jab bot ne abhi reply bheja (taake apne reply ko Shahbaz ka jawab na samjha jaye)
let readyAtMs = 0; // jab bot READY hua, us ka time - sirf us ke baad wale naye messages ka reply
const seenIncomingIds = new Set(); // har incoming message id ka sirf ek dafa jawab
let pairingCodeRequested = false;

// v4.0: conversation memory - har chat ki last 6 exchanges (user message + bot reply)
const chatHistory = {}; // chatId -> [{ user, bot }, ...] (max 6 exchanges)
function remember(chatId, userText, botText) {
  if (!chatHistory[chatId]) chatHistory[chatId] = [];
  chatHistory[chatId].push({ user: userText, bot: botText });
  while (chatHistory[chatId].length > 6) chatHistory[chatId].shift();
}

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
    if (msg.from) lastBotReplyByChat[msg.from] = text;
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
// ============================================================
// v11.0: DATE / DAY - rule-based, INSTANT, live Asia/Karachi date.
// Never AI, never guessed, never hardcoded. Urdu day names:
// Peer=Monday, Mangal=Tuesday, Budh=Wednesday, Jumerat=Thursday,
// Juma=Friday, Hafta=Saturday, Itwaar=Sunday.
// ============================================================
const URDU_DAYS = ['Itwaar', 'Peer', 'Mangal', 'Budh', 'Jumerat', 'Juma', 'Hafta'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function karachiParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(date);
  const get = (t) => parts.find(p => p.type === t).value;
  return { weekday: get('weekday'), day: Number(get('day')), month: get('month'), year: Number(get('year')) };
}
function karachiDatePlus(offsetDays) {
  const p = karachiParts(new Date());
  const d = new Date(Date.UTC(p.year, MONTHS_EN.indexOf(p.month), p.day));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return { weekday: URDU_DAYS[d.getUTCDay()], day: d.getUTCDate(), month: MONTHS_EN[d.getUTCMonth()], year: d.getUTCFullYear() };
}
function hasWord(text, words) {
  const toks = text.split(/[^a-z]+/).filter(Boolean);
  return words.some(w => toks.includes(w));
}
// v12.3: varied short replies - each intent has a POOL, never one fixed line.
// pickVaried rotates per chat and never returns the immediately previous bot
// reply in that chat; it also never re-asks 'aur sunao?' right after asking it.
const THK_POOL = ['Acha, aur sunao?', 'Good, acha laga sun kar.', 'Theek hai, kia kar rahe ho?', 'Acha, khush raho.'];
const GOOD_POOL = ['Acha, aur batao?', 'Good, kia chal raha hai?', 'Acha laga, khush raho.'];
const KASA_POOL = ['Me bhi thk ho, ap sunao?', 'Me bhi thk ho, tum batao kia chal raha hai?'];
const lastBotReplyByChat = {}; // chatId -> last bot reply sent in that chat
const variedIndexByChat = {}; // chatId|poolKey -> next pool index (round-robin)
function pickVaried(poolKey, pool, chatId) {
  const chat = chatId || 'default';
  const last = lastBotReplyByChat[chat] || '';
  let candidates = pool.filter((r) => r !== last && !(last.includes('aur sunao') && r.includes('aur sunao')));
  const hist = (typeof chatHistory !== 'undefined' && chatHistory[chat]) || [];
  const recentBot = hist.slice(-3).map((h) => h.bot || '');
  candidates = candidates.filter((r) => !recentBot.includes(r));
  if (!candidates.length) candidates = pool.filter((r) => r !== last);
  if (!candidates.length) candidates = pool.slice();
  const key = chat + '|' + poolKey;
  const start = variedIndexByChat[key] || 0;
  const choice = candidates[start % candidates.length];
  variedIndexByChat[key] = start + 1;
  lastBotReplyByChat[chat] = choice;
  return choice;
}
function dateDayReply(text) {
  let word = null;
  if (hasWord(text, ['aaj'])) word = 'aaj';
  else if (hasWord(text, ['kal'])) word = 'kal';
  else if (hasWord(text, ['parso', 'parson'])) word = 'parso';
  if (!word) return null;
  const hasDin = hasWord(text, ['din', 'day', 'date', 'tareekh', 'tarikh']);
  const hasQ = hasWord(text, ['kia', 'kya', 'kai', 'kyaa', 'kiaa', 'konsa', 'konsi', 'kaunsa', 'kis', 'which', 'what']) || text.includes('kon sa') || text.includes('kaun sa');
  const hasTime = hasWord(text, ['time', 'baje', 'waqt', 'wakt']);
  if (hasTime && !hasDin) return null;
  const trimmed = text.trim();
  if (!hasDin && !hasQ && trimmed !== word && !trimmed.endsWith('?')) return null;
  const offset = word === 'aaj' ? 0 : (word === 'kal' ? 1 : 2);
  const label = word === 'aaj' ? 'Aaj' : (word === 'kal' ? 'Kal' : 'Parso');
  const t = karachiDatePlus(offset);
  return label + ' ' + t.weekday + ' hai, ' + t.day + ' ' + t.month + ' ' + t.year + '.';
}
function greetingReply(text) {
  const toks = text.split(/[^a-z]+/).filter(Boolean);
  const first = toks[0] || '';
  if (['aoa', 'salam', 'salaam', 'assalam', 'assalamu', 'assalamo', 'walaikum'].includes(first)) return 'Walaikum Assalam!';
  if (['hi', 'hii', 'hiii', 'hello', 'hey', 'helo'].includes(first) && text.length < 12) return 'Hi! Kaise ho?';
  return null;
}

// v2.4.3: intentReply - time/link/kon ho/kahan ho jaise sawal ka jawab
// AI ka wait kiye baghair foran dega (fast reply). Koi intent na mile to null.
function intentReply(text, chatId) {
  const dd = dateDayReply(text);
  if (dd) return dd;
  // v4.0: "time" kahin bhi ho to time batao - typo "kai" bhi chalega.
  // City naam ho to us city ka time, warna Pakistan time (poora Pakistan PKT).
  if (has(text, 'time', 'waqt', 'baje')) {
    const now = new Date().toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi', hour: 'numeric', minute: '2-digit' });
    const cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta'];
    const city = cities.find(c => text.includes(c));
    if (city) {
      const cityName = city.charAt(0).toUpperCase() + city.slice(1);
      return cityName + ' me ' + now + ' ho raha hai.';
    }
    return 'Abhi Pakistan me ' + now + ' ho raha hai.';
  }
  // v12.2 short negative replies - checked FIRST, before 'thk' / 'good' below,
  // so 'not good' does not hit the positive intent and 'theek nahi' does not hit 'thk'.
  if (has(text, 'not good', 'theek nahi', 'thek nahi', 'thik nahi', 'acha nahi', 'nahi thk', 'nahi theek') || hasWord(text, ['bad', 'bura'])) return 'Kia hua? Batao.';
  // v12.1: greeting follow-ups, matched anywhere in the message (no AI wait).
  // How-are-you first, so a combined 'Me thk ho ap kasa ho' answers as
  // 'Me bhi thk ho, ap sunao?' instead of the thk-only reply.
  if (has(text, 'kasa ho', 'kesy ho', 'kaisa ho', 'kaise ho', 'kese ho', 'kesay ho', 'kasa hai', 'kesy hai', 'kaisa hai', 'kya haal', 'kia haal', 'haal kaisa', 'haal kesa', 'how are you')) {
    return pickVaried('kasa', KASA_POOL, chatId);
  }
  // v12.1: 'thk / thik / theek' - user is fine, reply short, no AI wait.
  if (has(text, 'thk', 'thik', 'theek')) {
    return pickVaried('thk', THK_POOL, chatId);
  }
  if (has(text, 'kya haal', 'kesay ho', 'kaise ho', 'how are you', 'haal kaisa', 'kese ho', 'kaisa hai')) {
    return 'Alhamdulillah, main theek hoon.';
  }
  if (has(text, 'kahan ho', 'kidhar ho', 'kedar ho', 'kidar ho', 'where are you', 'kahan par ho', 'kaha ho', 'kedar ha', 'kidhar ha')) {
    return 'Main yahin hoon.';
  }
  if (has(text, 'kya kar rahe', 'kya kar raha', 'what are you doing', 'kya ho raha')) {
    return 'Bas aap se baat kar raha hoon.';
  }
  if (has(text, 'tum kaun', 'aap kaun', 'ap kon', 'tum kon', 'kon ho', 'who are you', 'apka naam', 'your name', 'tumhara naam', 'aapka naam')) {
    return 'Main Shahbaz hoon.';
  }
  if (has(text, 'good morning', 'subah bakhair', 'good night', 'shab bakhair')) {
    if (has(text, 'night', 'shab')) {
      return 'Shab bakhair!';
    }
    return 'Subah bakhair!';
  }
  // v12.3 short positive / acknowledgement replies - VARIED pools, rule-based, no AI wait.
  // hasWord() matches 'good' anywhere in the message, e.g. 'mana likha good'.
  // Placed AFTER 'good morning' / 'good night' above, so those greetings still win.
  // 'ok' / 'han' / 'haan' / 'yes' / 'shukriya' / 'thanks' / 'theek hai' / 'acha hai'
  // were already rule-based in v12.1 ('Theek hai.' / 'Koi baat nahi.') and stay unchanged.
  if (hasWord(text, ['good', 'gud', 'goood', 'great', 'fine', 'okay', 'okey', 'okie', 'nice', 'zabardast', 'bilkul'])) return pickVaried('good', GOOD_POOL, chatId);
  if (has(text, 'joke', 'mazak', 'funny', 'hasao', 'hansi')) {
    return 'Teacher: "Tum homework kyun nahi laye?" Student: "Sir, WhatsApp par bhej diya tha."';
  }
  if (has(text, 'bore', 'bor ho raha', 'boring')) {
    return 'Chalo thori baat karte hain.';
  }
  if (has(text, 'khana khaya', 'kha liya', 'bhook')) {
    return 'Khana zaroor kha lena.';
  }
  if (has(text, 'neend', 'sleep', 'thak gaya', 'tired')) {
    return 'Thora araam kar lo.';
  }
  if (has(text, 'shukriya', 'thanks', 'thank you')) {
    return 'Koi baat nahi.';
  }
  if (has(text, 'allah hafiz', 'bye', 'khuda hafiz', 'goodbye', 'chalta hoon')) {
    return 'Allah Hafiz!';
  }
  if (has(text, 'ok', 'theek hai', 'acha', 'sahi hai', 'han', 'haan', 'yes')) {
    return 'Theek hai.';
  }
  if (has(text, 'aur sunao', 'aur batao', 'kya chal raha', 'kia chal raha', 'chal raha hai')) {
    return 'Sab theek hai, Alhamdulillah.';
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
  if (has(text, 'capcut', 'cap cut')) {
    return 'CapCut ka link ye hai: https://www.capcut.com — is par click karo. App chahiye to Play Store par "CapCut" likh kar download kar lo.';
  }
  if (has(text, 'link bhej', 'link do', 'link chahiye', 'link bjo', 'ka link')) {
    return 'Kaunsa link chahiye? Agar ChatGPT ka chahiye to ye hai: https://chatgpt.com — Gemini ka: https://gemini.google.com — CapCut ka: https://www.capcut.com — YouTube ka: https://www.youtube.com';
  }
  return null;
}

function freeReply(raw, text, chatId) {
  const intent = intentReply(text, chatId);
  if (intent) return intent;
  // v4.0: "Haan, bolo, main sun raha hoon." / "Haan, main yahin hoon, bolo."
  // sirf bare call (oye/hello/shahbaz?) par. Real question par AI fail ho to:
  const bareCall = ['oye', 'oey', 'suno', 'sun', 'bolo', 'shahbaz', 'shahbaz?', 'hello', 'hi', 'hey', 'aoa', 'salam'].includes(text);
  if (bareCall) {
    const replies = [
      'Haan, bolo, main sun raha hoon.',
      'Haan, main yahin hoon, bolo.',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  return 'Samajh nahi aaya, dobara likho.';
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

  // v11.0: short greetings only (token-based, no hi-in-bhai bug).
  const greet = greetingReply(text);
  if (greet) {
    await sendReply(msg, greet);
    remember(chatId, raw, greet);
    return;
  }

  // v2.4.3 FAST: pehle intent (time/link/kon ho) foran, phir AI, phir generic
  const intent = intentReply(text, chatId);
  if (intent) {
    await sendReply(msg, intent);
    remember(chatId, raw, intent);
    return;
  }
  // v4.0: Gemini ko is chat ki last 6 exchanges ki history ke saath bhejo
  const smart = await aiReply(raw, chatHistory[chatId] || []);
  if (smart) {
    await sendReply(msg, smart);
    remember(chatId, raw, smart);
    return;
  }
  const fallback = freeReply(raw, text, chatId);
  await sendReply(msg, fallback);
  remember(chatId, raw, fallback);
}

async function runSelfTest() {
  console.log('=== v12.3 SELFTEST ===');
  const p = karachiParts(new Date());
  console.log('Karachi today (live):', p.weekday, p.day, p.month, p.year);
  const tests = ['Kal kia ha', 'Mana bola Kal kai din ha', 'Kal kya hai', 'Kal konsa din hai', 'Aaj kia din hai', 'Aaj date kia hai', 'Kal date kia hai', 'Parso kia din hai', 'Lahore me time kia ho raha hai', 'kahan ho', 'kon ho', 'Thk', 'Me thk ho ap kasa ho', 'ap kasa ho', 'ap kesy ho', 'main theek hoon', 'aur sunao', 'kia chal raha hai', 'kya haal hai', 'haal kaisa hai', 'Good', 'Mana likha good', 'Great', 'Not good', 'Theek nahi', 'Thanks', 'Ok'];
  for (const t of tests) {
    const out = intentReply(clean(t)) || '(no intent -> AI)';
    console.log('IN:', t, '=> OUT:', out);
  }
  console.log('IN: AOA => OUT:', greetingReply(clean('AOA')));
  console.log('IN: hi => OUT:', greetingReply(clean('hi')));
  console.log('IN: voice message => OUT:', VOICE_REPLY);
  console.log('--- v12.3 SEQUENCE TEST (one chat, Shahbaz screenshot case) ---');
  const seqChat = 'selftest-seq-chat';
  const seq = ['Hi', 'G thk', 'Or me thk', 'Me thk', 'Good'];
  const seqOut = [];
  for (const t of seq) {
    const out = greetingReply(clean(t)) || intentReply(clean(t), seqChat) || '(no intent -> AI)';
    seqOut.push(out);
    console.log('SEQ IN:', t, '=> OUT:', out);
    remember(seqChat, t, out);
  }
  let seqRepeat = false;
  for (let i = 1; i < seqOut.length; i++) if (seqOut[i] === seqOut[i - 1]) seqRepeat = true;
  console.log('SEQ CHECK: all identical?', new Set(seqOut).size === 1, '| any consecutive repeat?', seqRepeat, '| distinct replies:', new Set(seqOut).size, '/', seqOut.length);
  if (seqRepeat || new Set(seqOut).size === 1) console.log('SEQ CHECK: FAIL - bot still repeats');
  else console.log('SEQ CHECK: PASS - replies vary, no consecutive repeat');
  const kasa1 = intentReply(clean('Kasa ho'), seqChat);
  const kasa2 = intentReply(clean('Kasa ho'), seqChat);
  console.log('KASA REPEAT CHECK: 1st:', kasa1, '| 2nd:', kasa2, '| different?', kasa1 !== kasa2);
  const thkOut = intentReply(clean('Thk'), 'selftest-thk-chat');
  console.log('THK CHECK: Thk =>', thkOut, '| in THK_POOL?', THK_POOL.includes(thkOut));
  const goodOut = intentReply(clean('Good'), 'selftest-good-chat');
  console.log('GOOD CHECK: Good =>', goodOut, '| in GOOD_POOL?', GOOD_POOL.includes(goodOut));
  console.log('KAL CHECK: Kal kia ha =>', intentReply(clean('Kal kia ha'), 'selftest-kal-chat'));
  console.log('NOTGOOD CHECK: Not good =>', intentReply(clean('Not good'), 'selftest-ng-chat'));
  console.log('--- AI chain live test: Kal kia hai? ---');
  const ai = await aiReply('Kal kia hai?', []);
  console.log('AI OUT:', ai || '(AI chain failed)');
  await sleep(45000); // v11.0: Pollinations free tier allows about 1 reply per 45s per IP
  console.log('--- AI chain live test: Pakistan ka capital kia hai? ---');
  const ai2 = await aiReply('Pakistan ka capital kia hai?', []);
  console.log('AI OUT:', ai2 || '(AI chain failed)');
  console.log('=== SELFTEST DONE ===');
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
      const mt = (msg.type || '').toLowerCase();
      const isVoice = mt === 'ptt' || mt === 'audio' || mt === 'voice';
      await sendReply(msg, isVoice ? VOICE_REPLY : 'Photo ya file dekh nahi sakta, likh kar bhejo.');
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

if (process.argv.includes('--selftest')) {
  runSelfTest().then(() => process.exit(0)).catch((e) => { console.log('Selftest error:', e.message); process.exit(1); });
} else {
  client.initialize().catch((e) => console.log('Initialize error:', e && e.message ? e.message : e));
}

# Shahbaz - Personal WhatsApp Auto-Reply Bot v2.0

Ye bot Shahbaz ke PERSONAL WhatsApp number par khud reply dega.

Jo bhi banda, kisi bhi number se, koi bhi message bheje, bot us ko apni marzi se free personal reply dega, jaise ek dost baat karta hai.

Bot ke sare replies Roman English me hain.

Is me NO order, NO services, NO price, NO payment, NO menu, NO Order ID. Sirf free personal chat.

## Pehle ye warning zaroor parhein

Ye official WhatsApp Cloud API NAHI hai. Ye WhatsApp Web automation hai (whatsapp-web.js).
WhatsApp is ko officially allow nahi karta, is liye number ban hone ka risk hai.

Safe tareeqa:
1. Pehle apni chats ka backup lein: WhatsApp > Settings > Chats > Chat backup
2. Pehle kisi secondary / test number par try karein, apne main personal number par seedha mat chalayein
3. Groups ko reply band hai, pehle se OFF hai
4. Agar WhatsApp warning de to bot foran band kar dein
5. Bot chalane ke liye ek computer / server hamesha ON rehna chahiye. Server band ho to bot bhi band ho jayega.

## Bot kya karta hai

- Jo bhi message aaye, kisi bhi number se, bot free personal reply deta hai
- Haal chaal, kahan ho, kya kar rahe ho, joke, bore, subah/shab bakhair, khana, neend, thanks, bye, sab ka reply
- Groups, Status aur apne khud ke messages ko reply NAHI karta
- Har reply se pehle 2-5 second rukta hai aur typing dikhata hai
- Agar Shahbaz khud kisi chat me jawab de de, to bot us chat me sirf 5 minute ke liye ruk jata hai, phir dobara khud reply karne lagta hai
- "Team" likhne par bot ruk jata hai

## Chalane ka tareeqa - step by step

### Step 1: Install karein
Is folder me terminal kholein aur likhein:
```
npm install
npm start
```

### Step 2: QR scan karein
- Terminal me QR code aayega
- Apne phone me WhatsApp kholein > Linked Devices > Link a Device
- QR scan karein
- Jab terminal me "Bot READY hai" likha aaye to bot chal raha hai

### Step 3: Test karein
- Kisi dusre number se is number par likhein: Hi
- Phir try karein: Kya haal hai, Kahan ho, Kya kar rahe ho, Joke sunao, Bore ho raha hoon
- Apne khud ke number se test mat karein, dusre number se karein

### Bot band kaise karein
Terminal me Ctrl+C dabayein. Bot band ho jayega.
Dobara chalane ke liye phir `npm start` likhein. QR dobara nahi mangega, kyunki session save ho jata hai.

## Files
- index.js - pura bot ka code
- package.json - zaroori libraries
- README.md - ye hidayat nama

## Agar bot jawab na de to check karein
1. Computer / server ON hai aur internet chal raha hai?
2. Phone online hai?
3. Terminal me "Bot READY" likha hai ya error hai?
4. Kya aap ne us chat me khud abhi jawab diya tha? To bot sirf 5 minute rukega, phir dobara reply karega.

# ทันใจ AI Studio

เว็บแอปสำหรับสร้างสื่อ (โพสต์, สคริปต์วิดีโอ, เสียงพากย์, สไลด์, ภาพ) ด้วยพลัง AI
เป็น Static Web App (HTML/CSS/JS ล้วน ไม่มี build step) รันบน GitHub Pages
ต่อ AI จริงผ่าน Cloudflare Worker แยกต่างหาก (โฟลเดอร์ `ai-worker/`) เพื่อไม่ให้ API key หลุดฝั่ง client

## โครงสร้างโปรเจกต์

```
index.html          หน้าเว็บหลัก (single page app, สลับ view ด้วย hash routing)
css/                 สไตล์และแอนิเมชัน
js/                  โค้ดฝั่งเว็บทั้งหมด (ไม่มี bundler, โหลดตรงผ่าน <script>)
data/                ข้อมูล template/หมวดหมู่แบบ static JSON
assets/              รูป, วิดีโอโลโก้, ไอคอน
ai-worker/           Cloudflare Worker เป็นตัวกลางเรียก Gemini API (เก็บ key ฝั่ง server)
tests/               ทดสอบแบบ Node assert (ตรวจ regression พื้นฐาน ไม่ใช่ unit test เต็มรูปแบบ)
docs/                หมายเหตุการดูแลระบบและวิธีอัปเดตขึ้น GitHub Pages
```

## รันดูในเครื่อง

ไม่ต้อง build อะไร เปิด `index.html` ด้วย local server เฉย ๆ เช่น

```bash
npx serve .
# หรือ
python3 -m http.server 8080
```

> ห้ามเปิดด้วย `file://` ตรง ๆ เพราะ `firebase-auth.js` เป็น ES module (`type="module"`) ซึ่งเบราว์เซอร์บล็อกการโหลดผ่าน `file://`

## ระบบสมาชิก (Firebase)

ใช้ Firebase Authentication (อีเมล/รหัสผ่าน) + Firestore สำหรับเก็บโปรเจกต์และ whitelist ผู้ใช้
ค่า config อยู่ที่ `js/firebase-config.js` — `apiKey` ที่เห็นเป็น public client key ตามปกติของ Firebase ไม่ใช่ความลับ
แต่ **ความปลอดภัยจริงต้องพึ่ง Firestore Security Rules** ดูไฟล์ตัวอย่างที่ `firestore.rules` แล้วนำไป deploy ด้วย

```bash
firebase deploy --only firestore:rules
```

กฎสำคัญที่ต้องมี:
- `allowed_emails` (whitelist) และ `admins` เขียนได้เฉพาะผู้ใช้ที่มีเอกสารอยู่ใน `admins` เท่านั้น
- `projects` และ `users/{uid}/usage` อ่าน/เขียนได้เฉพาะเจ้าของ (`request.auth.uid == uid`)

การเพิ่มผู้ใช้ใหม่: เปิด DevTools console ขณะ login ด้วยบัญชี admin แล้วเรียก
`TANJAI_AUTH.addToWhitelist("user@email.com")` — ฟังก์ชันนี้เช็คสิทธิ์ admin ทั้งฝั่ง client และควรถูกบังคับซ้ำด้วย Firestore rules

## ต่อ AI จริง (Cloudflare Worker)

1. `cd ai-worker`
2. คัดลอก `wrangler.toml.example` เป็น `wrangler.toml` แล้วแก้ `ALLOWED_ORIGINS` เป็นโดเมนจริง
3. ตั้งค่า secret: `wrangler secret put GEMINI_API_KEY`
4. (แนะนำ) สร้าง KV namespace แล้วเปิด binding `USAGE_KV` ใน `wrangler.toml` เพื่อจำกัดโควตาต่อผู้ใช้ต่อวัน
5. `wrangler deploy`
6. เอา URL ที่ได้ไปใส่ใน `js/ai-config.js` (`endpoint`)

ถ้ายังไม่ได้ตั้งค่า Worker เว็บจะ fallback ไปใช้ Specialist Output Engine ในเบราว์เซอร์แทนอัตโนมัติ ใช้งานได้ปกติแค่ไม่ผ่าน AI จริง

## ทดสอบ

```bash
npm test
```

รันสคริปต์ตรวจ regression ทั้งหมดใน `tests/` (เป็น Node `assert` script ไม่ใช่เฟรมเวิร์กเทสเต็มรูปแบบ)

> หมายเหตุ: ตอนนี้มีบางเทสต์ค้าง fail อยู่ (`test-facebook-album-balanced-frame`, `test-free-writing-team`, `test-username-mobile-access`, `test-compact-image-prompt`) เพราะเทสต์อ้างอิงข้อความ/เวอร์ชันเก่า (เช่น `V9.4`) หรือ behavior ที่เปลี่ยนไปแล้ว ควรรีวิวและอัปเดต fixture ให้ตรงกับโค้ดปัจจุบันก่อน merge งานใหม่

## อัปเดตขึ้น GitHub Pages

ดู `docs/UPDATE-GITHUB-PAGES-TH.md`

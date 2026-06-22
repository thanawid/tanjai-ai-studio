# ตั้งค่า AI ให้แสดงผลในเว็บทันที

เว็บยังทำงานได้ตามเดิมแม้ยังไม่เชื่อม AI โดยจะใช้ระบบเขียนสำรองอัตโนมัติ

## 1. สร้าง Gemini API Key

สร้างกุญแจจาก Google AI Studio และเก็บเป็นความลับ ห้ามใส่กุญแจลงใน GitHub

## 2. นำ AI Worker ขึ้น Cloudflare

1. เข้าโฟลเดอร์ `ai-worker`
2. เปลี่ยนชื่อ `wrangler.toml.example` เป็น `wrangler.toml`
3. เข้าสู่ระบบ Cloudflare ด้วย Wrangler
4. เพิ่ม Secret ชื่อ `GEMINI_API_KEY`
5. Deploy Worker
6. แนะนำให้สร้าง KV binding ชื่อ `USAGE_KV` เพื่อจำกัดจำนวนครั้งต่อวัน

ตัวอย่างคำสั่ง:

```text
npx wrangler login
npx wrangler secret put GEMINI_API_KEY
npx wrangler deploy
```

## 3. เชื่อมหน้าเว็บ

เปิด `js/ai-config.js` แล้วใส่ URL ของ Worker เช่น:

```js
window.TANJAI_AI_CONFIG = {
  endpoint: "https://tanjai-ai.example.workers.dev",
  timeoutMs: 60000
};
```

จากนั้นอัปโหลดเว็บขึ้น GitHub Pages ตามเดิม เมนูโพสต์ พิธีกร วิดีโอ เสียงพากย์ และสไลด์จะเรียก AI และแสดงผลในเว็บทันที

## ความปลอดภัย

- ห้ามใส่ `GEMINI_API_KEY` ใน `ai-config.js`, GitHub หรือโค้ดหน้าเว็บ
- ตั้ง `ALLOWED_ORIGINS` ให้เป็น `https://thanawid.github.io`
- เปิด `USAGE_KV` และกำหนด `DAILY_LIMIT` ก่อนเปิดให้คนทั่วไปใช้
- ระบบจะใช้ตัวสร้างข้อความเดิมทันทีเมื่อ AI ขัดข้องหรือครบโควตา


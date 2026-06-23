# PATCH V9.4.3 — Login Fix

แก้เฉพาะระบบ Login ตามคำสั่งล่าสุด

## สิ่งที่แก้
- คืนช่องรหัสผ่านบนหน้า Login
- คงผู้ใช้เดิม `thanawid` → `thanawid@gmail.com`
- เพิ่มผู้ใช้ `teamtanjai` → `teamtanjai@tanjai.local`
- Login ใช้ชื่อผู้ใช้ + รหัสผ่าน แล้วส่งเข้า Firebase Auth ด้วย email/password
- ไม่เปิดโหมด passwordless
- อย่างอื่นคงเดิม

## ไฟล์ที่แก้
- `index.html`
- `js/app.js`
- `js/firebase-auth.js`
- `js/auth-fallback.js`
- `js/firebase-config.js` ยังคง mapping ผู้ใช้เดิมและผู้ใช้ใหม่

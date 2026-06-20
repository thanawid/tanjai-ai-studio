# PATCH NOTES — ทันใจ AI Studio v9.1.3

วันที่แพตช์: 20 มิถุนายน 2569

## แก้ไขหลัก
- ตัดโค้ดทดลองค้างใน `js/ui.js` ที่ทำให้เว็บเสี่ยงพังตั้งแต่โหลดหน้า เพราะอ้าง `$`, `opts`, `toolOptions` นอก scope
- เพิ่ม Prompt Generator แยกตามเมนูจริง: โพสต์, งานพิธีกร, วิดีโอ, เสียงพากย์, สไลด์ และ Universal Prompt Pack
- แก้ `executionPrompt()` ไม่ให้ทุกเมนูส่งออกเป็น Prompt ภาพผิดประเภท
- เสริม Identity Lock สำหรับงานภาพ/วิดีโอ/อัลบั้ม: ห้ามเปลี่ยนใบหน้า ห้ามสลับหน้า ห้าม identity drift เมื่อมีภาพบุคคลจริง
- เปลี่ยนค่าเริ่มต้นชื่อองค์กรจาก “ทันใจ AI Studio” เป็น “ยังไม่ได้ระบุ” เพื่อไม่ปนแบรนด์ระบบลงงานผู้ใช้
- เพิ่มระบบ Auth Fallback หาก Firebase CDN/Config ไม่พร้อม เว็บจะไม่ค้างล็อกหน้าจอถาวร
- ปรับ `copyText()` ให้มี fallback เมื่อ Clipboard API ใช้ไม่ได้
- อัปเดต badge เป็น v9.1.3

## วิธีอัปเดต GitHub Pages
1. แตก ZIP นี้
2. อัปโหลดไฟล์ทั้งหมดทับ repo `tanjai-ai-studio`
3. Commit ข้อความเช่น `Update Tanjai AI Studio v9.1.3`
4. เปิด `https://thanawid.github.io/tanjai-ai-studio/?v=913` เพื่อล้าง cache

## หมายเหตุ
ไฟล์นี้เป็น static web พร้อม deploy บน GitHub Pages ไม่ต้อง build

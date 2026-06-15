# ทันใจ AI Studio v6.1.1 — Sidebar Fix

คงหน้าแรก v6 ไว้ และปรับเฉพาะจุด:
- การ์ด “เลือกทำเฉพาะสิ่งที่ต้องการ” คลิกได้
- เพิ่มคำว่า “ทำคลิป” ให้ชัดในเมนูวิดีโอ
- ปรับ “ทางลัดการใช้งาน” ให้ไม่แตกบรรทัดแปลก
- คืน dropdown หน้า “สร้างภาพ” แบบละเอียด
- เพิ่ม dropdown เฉพาะงานให้โพสต์ วิดีโอ เสียงพากย์ และสไลด์
- อย่างอื่นคงเดิม

## วิธีอัปเดต
อัปโหลดทุกไฟล์และโฟลเดอร์ใน ZIP นี้ทับของเดิมทั้งหมด แล้ว Commit changes


## v6.1.1 Sidebar Fix
- แก้เมนูซ้ายเลื่อนไม่สุด / ค้าง / โดนตัดบนบางหน้าจอ
- ให้ sidebar เลื่อนแยกได้เต็มความสูงหน้าจอ
- ไม่เปลี่ยนหน้าแรกและฟีเจอร์หลัก


## v6.1.2 Menu Click Fix
- แก้สาเหตุ JavaScript หยุดทำงานจากตัวแปร dropdown ที่ยังไม่ประกาศ
- เมนูซ้ายคลิกเปลี่ยนหน้าได้
- การ์ดหน้าแรกคลิกเข้าเมนูได้
- คืน dropdown หน้า “สร้างภาพ” แบบละเอียด
- ยังรวม Sidebar Fix จาก v6.1.1 ไว้


## v6.1.3 Logo Only Fix
- ขยายเฉพาะโลโก้ด้านขวาหน้าแรก
- ไม่ขยายวงกลม
- ไม่เพิ่มกล่องข้อความใหม่
- อย่างอื่นคงเดิมทั้งหมด


## v6.1.4 Responsive All Devices
- รองรับมือถือ แท็บเล็ต โน้ตบุ๊ก และจอใหญ่
- เมนูซ้ายบนมือถือ/แท็บเล็ตเปลี่ยนเป็นปุ่ม ☰ และเปิดเป็น drawer
- กดพื้นที่มืดหรือกดเมนูแล้ว drawer ปิดเอง
- ปรับ Hero, การ์ด, ฟอร์ม, dropdown, ปุ่ม ให้แตะง่ายขึ้นบนมือถือ
- รักษาหน้า Desktop เดิม ไม่รื้อดีไซน์หลัก
- รวม Menu Click Fix, Sidebar Fix และ Logo Only Fix ไว้เป็นฐาน


## v6.1.5 Work Summary Script
- เปลี่ยนเมนู “เขียนโพสต์” ให้เป็น “สคริปต์สรุปงาน”
- ใช้กับงานนายกลงพื้นที่ / ตรวจงาน / ช่วยเหลือประชาชน / กิจกรรมเทศบาล
- แนบรูปประกอบได้ และแสดงตัวอย่างรูปในหน้าเว็บ
- สร้าง Prompt สำหรับให้ AI วิเคราะห์ภาพและสรุปว่าไปที่ไหน ทำอะไร อย่างไร
- ผลลัพธ์แยกเป็น:
  1. สรุปผู้บริหาร
  2. สคริปต์ทำคลิป
  3. โพสต์ Facebook/Line
  4. Bullet สำหรับสไลด์นำเสนอ
  5. ข้อความบนภาพ/ปกคลิป
- หมายเหตุ: เวอร์ชัน GitHub Pages ยังไม่วิเคราะห์ภาพเองในเว็บ ต้องนำ Prompt พร้อมรูปไปใช้กับ AI ที่รองรับการวิเคราะห์ภาพ


## v6.2 Preview Random Cards + Destination Pro
- แก้หน้าที่ยังไม่ตรงจากที่คุย
- เพิ่มภาพตัวอย่างแบบสุ่มในการ์ดหน้าแรก
- การ์ดหน้าแรกยังคลิกได้
- อัปเดต Destination Hub ให้ครบ:
  - ChatGPT
  - Canva
  - CapCut
  - Voice Tool
  - Slide Tool
  - Notebook Tool
- จัดผลลัพธ์ที่แนะนำเฉพาะเมนู:
  - เสียงพากย์: ChatGPT / CapCut / Voice Tool
  - ทำสไลด์: ChatGPT / Canva / Slide Tool / Notebook Tool
  - สคริปต์สรุปงาน: ChatGPT / Notebook Tool / Canva / CapCut
- คงหน้าแรกเดิมให้มากที่สุด
- อย่างอื่นคงเดิมจากฐานล่าสุด


## v6.2.3 Logo Router Safe
- Main logo / Hero / Sidebar ใช้โลโก้เดิม “ทันใจ AI Studio” จาก Logo001(3).jpg
- Favicon / Web app icon / Mobile icon ใช้ TJ จาก IconLogoTJ(2).png
- แก้ AI Router result box ไม่ให้เพี้ยน
- คง Random Preview Cards
- คง Destination Hub ครบ 6 เครื่องมือ
- คงผลลัพธ์แนะนำเฉพาะเมนู
- Title Tag: ทันใจ AI Studio | สร้างสื่อไว ด้วยพลัง AI
- Hero: AI Media Hub / สร้างสื่อไว ด้วยพลัง AI
- อย่างอื่นคงเดิม
- เช็ก JavaScript syntax ก่อนส่ง


## v6.2.4 Router + Voice Text + TJ Favicon Fix
- Main logo / Hero / Sidebar ใช้โลโก้หลักเดิม “ทันใจ AI Studio”
- Favicon / Web app icon / Mobile icon ใช้ TJ
- Title Tag: ทันใจ AI Studio | สร้างสื่อไว ด้วยพลัง AI
- แก้ AI Router result box ไม่ให้เพี้ยน
- ปรับข้อความเมนูเสียงพากย์ให้ใช้คำว่า Voice Tool ทุกจุด
- เปลี่ยนคำอธิบายเสียงเป็น Voice Tool
- เมนูเสียงพากย์:
  - สร้างสคริปต์เสียง
  - บันทึก
  - ผลลัพธ์แนะนำ: ChatGPT / CapCut / Voice Tool
- เมนูทำสไลด์:
  - สร้าง Outline
  - บันทึก
  - ผลลัพธ์แนะนำ: ChatGPT / Canva / Slide Tool / Notebook Tool
- Destination Hub ครบ 6 เครื่องมือ
- คง Random Preview Cards หน้าแรก
- ห้ามกระทบ Layout หลัก สีหลัก เมนู และฟังก์ชันอื่น
- เช็ก JavaScript syntax ก่อนส่ง


## v6.2.6 Favicon / Web App Icon Update
- เปลี่ยนเฉพาะ favicon และ web app icon/mobile icon เป็นไฟล์ Logo002.jpg ที่แนบมา
- ไม่เปลี่ยน main logo / hero / sidebar
- อย่างอื่นคงเดิมจาก v6.2.4


## v6.2.6 Final Two Fixes
- แก้ Destination Hub ให้แสดงครบ 6 เครื่องมือจากแหล่งข้อมูลหลักใน `js/data.js`
- กันข้อความในกล่อง “ทางลัดการใช้งาน” ถูกลากเลือกจนขึ้นแถบสีน้ำเงิน
- คง Real Preview Cards Pro, favicon TJ, layout, สีหลัก และฟังก์ชันอื่นทั้งหมด

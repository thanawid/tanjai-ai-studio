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


## v6.2.6 Final Ready
- Destination Hub แสดงครบ 6 เครื่องมือ: ChatGPT, Canva, CapCut, Voice Tool, Slide Tool, Notebook Tool
- ปรับข้อความ “ทางลัดการใช้งาน” ให้สั้นลง จัดบรรทัดให้อ่านสวย ไม่ตัดคำแปลก
- คง Real Preview Cards Pro, favicon TJ, main logo เดิม, layout, สีหลัก และฟังก์ชันอื่นทั้งหมด


## v6.2.7 Login Gate Semi-Pro
- เพิ่มหน้า Login ก่อนเข้าใช้งานเว็บ
- มีช่องรหัสเข้าใช้งาน
- มีตัวเลือก “จดจำการเข้าใช้งาน”
- ถ้าติ๊กจดจำ จะจำสิทธิ์เข้าใช้งานไว้ 3 วัน
- มีปุ่มออกจากระบบ
- รหัสเริ่มต้น: tanjai2569
- เปลี่ยนรหัสได้ใน `js/app.js` ที่ตัวแปร `PASSCODE`
- เป็นระบบล็อกอินเบาสำหรับเว็บ Static/GitHub Pages ไม่ใช่ระบบสมาชิกจริงระดับ Server
- อย่างอื่นคงเดิมจาก v6.2.6 Final Ready


## v6.2.7 Shortcut Text Polish
- จัดระเบียบข้อความในกล่อง “ทางลัดการใช้งาน” ให้สั้น กระชับ และตัดบรรทัดสวยขึ้น
- คง Login Gate, Real Preview Cards Pro, Destination Hub 6 รายการ, favicon TJ และฟังก์ชันอื่นทั้งหมด


## v6.2.8 — Navigation & Mobile UX Fix
- เพิ่มปุ่ม “ย้อนกลับ” และ “หน้าหลัก” ที่แถบบน ใช้ได้ทั้งคอมและมือถือ
- เพิ่มปุ่มนำทางด่วนด้านล่างเฉพาะมือถือ: ย้อนกลับ / หน้าหลัก
- เพิ่มระบบ URL hash เช่น `#dashboard`, `#image`, `#voice`
- ปุ่ม Back / Forward ของ Browser กลับหน้าก่อนหน้าในเว็บได้จริง
- เวลาเปลี่ยนหน้า ระบบเลื่อนกลับขึ้นด้านบนอัตโนมัติ
- คง Login Gate, Preview Cards, Destination Hub, favicon, main logo, layout และฟังก์ชันสร้างงานเดิมทั้งหมด


## v6.2.9 — Custom GPT Integration
- เปลี่ยนปลายทาง ChatGPT เป็น Custom GPT ของแบรนด์ “ทันใจ AI Studio”
- Destination Hub แสดงเป็น “ทันใจ AI Studio GPT”
- ปุ่มผลลัพธ์แนะนำเปลี่ยนเป็น “เปิด ทันใจ GPT”
- เปิดลิงก์ Custom GPT: https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio
- คง Login Gate, Navigation & Mobile UX Fix, Real Preview Cards Pro, Destination Hub 6 รายการ, favicon, logo, layout และฟังก์ชันอื่นทั้งหมด


## v6.2.9.1 — Custom GPT URL Fix
- แก้ปัญหาลิงก์ Custom GPT ซ้อน `/g/.../g/...` จนขึ้น 404
- ล็อกลิงก์ Custom GPT ให้เป็น absolute URL ตัวเดียวเท่านั้น
- เพิ่มตัวกรอง URL ก่อน `window.open()` เพื่อกันลิงก์ซ้ำอีกชั้น
- คง Custom GPT Integration, Login Gate, Navigation UX, Real Preview Cards Pro, Destination Hub 6 รายการ, favicon, logo, layout และฟังก์ชันอื่นทั้งหมด


## v6.3 — Real Photo Safe Mode
- เพิ่มโหมดการใช้ภาพในเมนูสร้างภาพ
- เพิ่มระบบการปกป้องภาพจริง (กันหน้าเพี้ยน / กันวาดคนใหม่)
- เพิ่ม preset ใช้งานเร็วสำหรับภาพจริง
- เพิ่มคำเตือนเมื่อแนบภาพจริงแต่ยังเลือกโหมดสร้างใหม่
- ปรับ Prompt Engine ให้แยกโหมดภาพจริง / ใส่กราฟิก / รีทัช / สร้างใหม่อย่างชัดเจน


## v6.3.1 — Output Delivery Guard
- เพิ่มคำสั่งท้าย Prompt เพื่อบังคับให้ AI แนบไฟล์จริง ไม่ตอบเป็น path `/mnt/data/...` เฉย ๆ
- ใช้กับ Prompt ภาพ, สไลด์, วิดีโอ/ไฟล์ประกอบ และชุดสื่อ
- เพิ่ม Prompt Hub: Output Delivery Guard
- คง Real Photo Safe Mode, Custom GPT URL Fix, Login Gate, Navigation UX, Destination Hub, Preview Cards, favicon, logo และ layout เดิม


## v6.4 — คำสั่งพร้อมใช้งาน
- เพิ่ม คำสั่งพร้อมใช้งาน ในเมนูสร้างภาพ
- ผลลัพธ์แบบ Creative Director: ช่วยคิดต่อ, ตัดสินใจแทนอย่างมีเหตุผล, สรุปคำสั่งเป็นหมวด, แยกข้อความบนภาพ, สร้างคำสั่งพร้อมส่งเข้า GPT
- เพิ่มคำสั่งสำรองหลังได้ภาพ เช่น ทำเวอร์ชันไม่มีข้อความ / แก้เฉพาะจุดโดยไม่ออกแบบใหม่
- เพิ่มตัวเลือกควบคุมระดับการช่วยคิด, รูปแบบผลลัพธ์, ภาษางานเทศบาล
- คง Real Photo Safe Mode, Output Delivery Guard, Custom GPT URL Fix, Login Gate, Navigation UX, Destination Hub, Preview Cards, favicon, logo และ layout เดิม


## v6.4.1 — คำสั่งพร้อมใช้ Auto Mode
- ซ่อนแผง คำสั่งพร้อมใช้งาน ออกจากหน้าเว็บ ไม่ให้ผู้ใช้เห็นตัวเลือกเทคนิคที่ไม่จำเป็น
- ใช้ คำสั่งพร้อมใช้งาน ทำงานอัตโนมัติหลังบ้านในเมนูสร้างภาพ
- ผลลัพธ์ยังจัดคำสั่งแบบ Creative Director: ตรวจข้อมูลที่ขาด สรุปคำสั่งเป็นหมวด แยกข้อความบนภาพ และสร้างคำสั่งพร้อมส่งเข้า GPT
- คง Real Photo Safe Mode, Output Delivery Guard, Custom GPT URL Fix, Login Gate, Navigation UX, Destination Hub, Preview Cards, favicon, logo และ layout เดิม


## v6.4.2 — Section Numbering Fix
- แก้เลขลำดับในเมนูสร้างภาพให้เรียงต่อเนื่องตาม section ที่มองเห็นจริง
- เมื่อโหมดสร้างภาพใหม่ซ่อนส่วน “การปกป้องภาพจริง” ระบบจะเรียงเป็น 1 2 3 4 5
- เมื่อเปิดโหมดภาพจริงและแสดงส่วนนั้น ระบบจะเรียงเป็น 1 2 3 4 5 6
- อย่างอื่นคงเดิม


## v6.4.3 — Clean Image Note
- เอาข้อความอธิบายยาวใต้หัวข้อเมนูสร้างภาพออก
- คง คำสั่งพร้อมใช้ Auto Mode, Section Numbering Fix, Real Photo Safe Mode, Output Delivery Guard และฟังก์ชันอื่นทั้งหมด


## v6.5 — Prompt Critic & Readiness Score
- เพิ่มระบบตรวจความพร้อมก่อนส่งเข้า GPT ในเมนูสร้างภาพ
- เพิ่มปุ่ม “ตรวจความพร้อม”
- ให้คะแนนความพร้อม 0-100 พร้อมสถานะและคำแนะนำ
- ตรวจข้อมูลที่ครบแล้ว / ข้อมูลที่ยังขาด / ความเสี่ยงหน้าเพี้ยน / ไฟล์ที่ควรแนบ / Checklist ก่อนส่งเข้า GPT
- เมื่อกดสร้าง Prompt ภาพ ระบบจะตรวจความพร้อมให้อัตโนมัติ
- บันทึกโปรเจกต์พร้อมผลตรวจ Prompt Critic
- คง คำสั่งพร้อมใช้ Auto Mode, Section Numbering Fix, Clean Image Note, Real Photo Safe Mode, Output Delivery Guard, Custom GPT URL Fix, Login Gate, Navigation UX, Destination Hub, Preview Cards, favicon, logo และ layout เดิม


## v6.5.1 — Auto Prompt Critic Behind the Scenes
- เอาปุ่ม “ตรวจความพร้อม” ออกจากหน้าเว็บ
- เอากล่อง Prompt Critic ออกจากหน้าเว็บ
- ให้ระบบ Prompt Critic ตรวจอัตโนมัติหลังบ้านเมื่อกด “สร้าง Prompt ภาพ”
- ผลตรวจถูกใช้เสริม Prompt ภายใน ไม่โชว์เป็นแผงให้ผู้ใช้ต้องอ่าน
- แก้ระบบเรียงเลขในหน้าสร้างภาพให้ครบและเรียงตาม section ที่มองเห็นจริง
- คง คำสั่งพร้อมใช้ Auto Mode, Clean Image Note, Real Photo Safe Mode, Output Delivery Guard, Custom GPT URL Fix, Login Gate, Navigation UX, Destination Hub, Preview Cards, favicon, logo และ layout เดิม


## v6.5.2 — UX Clean & Pro Polish
- ปรับหน้าแรกให้เห็นทันทีว่าต้องเริ่มที่ AI Router / สร้างชุดสื่อ / สร้างภาพ
- ใช้แบรนด์หลัก “ทันใจ AI Studio — สร้างสื่อไว ด้วยพลัง AI”
- ไม่เพิ่มบล็อก “งานเทศบาลที่ใช้บ่อย” บนหน้าแรก
- ไม่เพิ่มหน้า “สถานะระบบ”
- เพิ่ม Version Badge เล็ก ๆ เป็น v6.5.2
- ลบปุ่มข้อความ placeholder “ใส่ตัวอย่าง” ออกจากหน้าฟอร์มหลัก
- ปรับคำอธิบายให้เป็นภาษาผู้ใช้ ไม่โชว์ภาษาระบบมากเกินไป
- เพิ่มปุ่ม “คัดลอก + เปิดทันใจ GPT” เพื่อให้ทำงานต่อกับ GPT ได้ลื่นขึ้น
- จัดลำดับเมนูใหม่ให้สอดคล้อง: เริ่มต้น / สร้างงาน / ต่อยอด / จัดการ
- ซ่อน Prompt Hub ที่เป็นระบบหลังบ้าน เช่น Prompt Critic, คำสั่งพร้อมใช้งาน, Output Delivery Guard ไม่ให้ดูเป็นห้องเครื่อง
- คง คำสั่งพร้อมใช้ Auto Mode, Auto Prompt Critic หลังบ้าน, Real Photo Safe Mode, Output Delivery Guard, Custom GPT, Login, Navigation, Destination Hub, Preview Cards, logo/favicon/layout เดิม


## v6.5.3 — Dashboard Pro Layout
- ปรับหน้า Dashboard ให้เหลือแกนหลักที่ชัดขึ้น: Hero + เครื่องมือหลัก + วิธีใช้งาน 3 ขั้น + เครื่องมือปลายทาง
- เอา “เริ่มงานด่วน” ออกจาก Sidebar เพื่อลดความรกและให้ AI Router เป็นจุดเริ่มหลัก
- ลดการ์ดหน้าแรกให้เหลือเครื่องมือหลัก ไม่โชว์ Prompt Hub / เครื่องมือปลายทางซ้ำในกลุ่มเครื่องมือหลัก
- ปรับ Hero Stats เป็น “เริ่มไว / ครบงาน / ต่อยอดลื่น”
- เพิ่ม Badge “แนะนำให้เริ่มตรงนี้” ให้ AI Router
- เพิ่ม Badge “เร็วที่สุด” ให้สร้างชุดสื่อ
- เพิ่มปุ่ม mini destination บน Dashboard: ทันใจ GPT, Canva, CapCut, Voice Tool
- ปรับปุ่มล้างโปรเจกต์ให้ดูอ่อนลง และเพิ่ม Empty State หน้าโปรเจกต์
- ปรับข้อความ “คลังคำสั่งสำเร็จรูป” เป็น “คลังคำสั่งพร้อมใช้”
- คงทุกระบบหลังบ้านและโครงหลักเดิมจาก v6.5.2


## v6.5.4 — Sales Ready Visual Dashboard
- แก้หน้าแรกใหม่แบบจริงจังให้ใช้ขายได้: ไม่ใช่มีแต่ปุ่ม แต่มี Hero Visual และ Showcase ภาพตัวอย่างงาน
- เพิ่ม Hero Visual แบบการ์ดซ้อน: Poster Preview, Post/Caption, Storyboard/Voice และ Prompt Ready
- เพิ่มโซน “ตัวอย่างงานที่ทำได้” 4 ใบพร้อมภาพ: ภาพประชาสัมพันธ์, โพสต์และแคปชั่น, คลิปและเสียงพากย์, สไลด์นำเสนอ
- คงเครื่องมือหลัก 7 ตัวบนหน้าแรก และยังเริ่มงานได้ชัดเจน
- ซ่อนความรกจาก Dashboard: ไม่โชว์เริ่มงานด่วน ไม่โชว์รายละเอียดเมนูซ้ำยาว ๆ บนหน้าแรก
- คงปุ่ม คัดลอก + เปิดทันใจ GPT, คำสั่งพร้อมใช้ Auto Mode, Auto Prompt Critic หลังบ้าน, Real Photo Safe Mode, Output Delivery Guard, Custom GPT, Login, Navigation, Destination Hub, Preview Cards, logo/favicon/layout หลัก


## v7.1 — Restore Logo + Visuals
- คงเมนูและระบบล่าสุดทั้งหมด
- เอาหน้าแรกที่มีโลโก้วงกลมและภาพ Preview กลับมา
- เพิ่มคำว่า “ดีไซน์” บนหน้าแรก
- ใช้โลโก้วงกลมกลาง Hero Visual พร้อมการ์ดภาพตัวอย่างงาน
- คง Showcase ภาพ 4 ใบ และระบบหลังบ้านเดิมทั้งหมด

## v7.1 Color Dropdown Only

- คงธีมเว็บ สีเว็บ เมนู โครงสร้าง ฟังก์ชัน และหน้าแรกเหมือน v7.1
- แก้เฉพาะตัวเลือก “โทนสี” ในฟอร์มสร้างภาพ
- ค่าแนะนำแรก: ม่วง–ทองเป็นหลัก / เขียว–เหลืองเป็นโทนรอง
- ไม่แตะ CSS theme ของเว็บ

## V7.0 Premium Color Label

- คงทุกอย่างเหมือนเดิมจากฐานที่ใช้งานจริง
- เปลี่ยนเฉพาะตัวเลือกโทนสีให้เหมาะกับผู้ใช้ทั่วไป
- ค่าแรกในช่องโทนสี: “ม่วง–ทอง พรีเมียม”
- ไม่ใช้คำว่า “เทศบาล” ในตัวเลือก เพื่อไม่ให้ดูจำกัดกลุ่มผู้ใช้
- ไม่แตะธีมเว็บ ไม่แตะ layout ไม่แตะเมนู ไม่แตะระบบหลัก

## V7.1 Ready Output Clean

- คงทุกอย่างจาก V7
- แก้เฉพาะข้อความ Output ฝั่งขวา/คำสั่งที่คัดลอก
- เอาคำว่า คำสั่งพร้อมใช้งาน และคำว่า คำสั่ง ออกจากผลลัพธ์ผู้ใช้
- ใช้คำว่า “คำสั่งพร้อมใช้งานสำหรับทันใจ GPT” แทน
- ไม่แตะธีมเว็บ ไม่แตะ layout ไม่แตะเมนู ไม่แตะระบบหลัก

# Expert Prompt Engine — แยกผู้เชี่ยวชาญรายเมนู

## แนวคิดหลัก

ระบบไม่ใช้ Prompt กลางแล้วเปลี่ยนเพียงชื่อประเภทงาน แต่ให้แต่ละเมนูมี Role, Workflow, Output Contract และ Quality Gate ของตัวเอง

## ผู้เชี่ยวชาญแต่ละเมนู

- สร้างภาพ — Senior Thai Visual Art Director
  - Big Idea, Information Hierarchy, Production-ready Image Prompt, Negative Prompt
  - Original Photo Protocol ป้องกันใบหน้าและอัตลักษณ์เปลี่ยน
- เรียบเรียงเนื้อหา — Senior Thai Content Strategist & Editor
  - ผลลัพธ์เปลี่ยนตามชนิดงานจริง: สรุปงาน ข่าว Facebook Line หรือแคปชั่น
  - ตัดตัวเลือกสคริปต์เสียงและสคริปต์คลิปออก เพราะมีเมนูเฉพาะแล้ว
- งานพิธีกร — Thai Ceremonial Script Director
  - Run of Show, Stage Direction, คำเชื่อม, ช่องตรวจชื่อ/ตำแหน่ง และ Cue Card
- วิดีโอ — Short-form Video Creative Director & Editor
  - Hook, Story Arc, Timecode, Storyboard, Voice Over, Shot List และ Editing Notes
  - ตรวจให้เวลารวมทุกซีนตรงกับความยาวเป้าหมาย
- เสียงพากย์ — Thai Voice Script Writer & Performance Director
  - คุมจำนวนคำตามเวลา, Script Clean, Script Directed, จังหวะ และคำอ่าน
- สไลด์ — Executive Presentation Strategist
  - Audience, Decision Goal, Story Arc, Takeaway Title, Visual Evidence และ Speaker Notes
  - บังคับจำนวนสไลด์ให้ครบตามที่เลือก
- สร้างชุดสื่อ — Integrated Campaign Creative Director
  - สร้าง Campaign Spine และ Message Consistency Map ก่อนแตกงานรายช่องทาง
  - ไม่ใช้วิธีนำ Prompt หลายเมนูมาต่อกันแบบซ้ำ ๆ

## ข้อมูลที่เคยไม่ถูกนำไปใช้และแก้แล้ว

- ช่อง “สิ่งที่อยากให้เน้นเพิ่มเติม” ของงานเขียนและพิธีกร
- รายชื่อและจำนวนไฟล์ภาพ/เอกสารแนบ
- เป้าหมายเฉพาะ, CTA, วัตถุดิบวิดีโอ, จังหวะเสียง, คำอ่านชื่อเฉพาะ
- เป้าหมายการตัดสินใจและหลักฐานของสไลด์
- Core Message และ Campaign CTA ของชุดสื่อ

## หลักป้องกันข้อมูลมั่ว

- ทุก Prompt มี Source of Truth
- ข้อมูลที่ขาดใช้ `[ต้องระบุ: ชื่อข้อมูล]` แทนการเดา
- แยกข้อเท็จจริงจากผู้ใช้ออกจากข้อเสนอเชิงสร้างสรรค์ของ AI
- ตรวจงานภายในก่อนส่งโดยไม่แสดงกระบวนการคิด
- ห้ามสร้างชื่อ บุคคล ตำแหน่ง วันที่ ตัวเลข โลโก้ QR Code และช่องทางติดต่อ

## ไฟล์หลัก

- `js/expert-prompt-engine.js` — Engine ตัวสุดท้ายที่กำหนด Prompt ของทุกเมนู
- `js/app.js` — UI, ตัวเลือกเมนู และการเชื่อมปุ่มสร้าง
- `css/style.css` — รูปแบบส่วนคำถามเฉพาะ Expert Mode


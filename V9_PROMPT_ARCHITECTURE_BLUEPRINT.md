# V9 Prompt Architecture Blueprint
## ทันใจ AI Studio — Core เดียว / Output หลายโหมด

เป้าหมาย:
- ผู้ใช้กรอกน้อย
- เว็บช่วยคิดหมวด
- เว็บช่วยสรุปข้อความ
- เว็บเลือกโทนและรูปแบบตามบริบท
- เว็บปล่อย Prompt หรือผลลัพธ์พร้อมใช้งานทันที
- ห้ามยัดข้อมูลภายในระบบลง Prompt สุดท้าย
- ถ้ามีไฟล์แนบ ต้องระบุบทบาทไฟล์แนบให้ชัด
- ถ้ามีบุคคลจริง ต้องคงอัตลักษณ์เดิม
- แต่ละเมนูใช้กฎเฉพาะของตัวเอง

## โครงสร้างระบบ
Universal Prompt Engine + Mode Adapter

### Universal Prompt Engine
ใช้ร่วมกันทั้งเว็บ:
- buildSharedBrief(d, type)
- v9DetectImageType(d)
- v9Purpose(type, d)
- v9TextOnImage(d)
- v9AttachmentGuide(d, type)
- v9ProtectedBlock(d, type)

### Mode Adapter
แยกตามเมนู:
- Image Adapter
- Album Adapter
- Video Adapter
- Voice Adapter
- Deck Adapter
- Content Adapter
- MC Adapter

## กฎกลาง
- ใช้ข้อมูลผู้ใช้เป็นหลัก
- ห้ามเดาข้อมูลจริง
- หากข้อมูลไม่พอ ให้ใช้ “จากข้อมูลเบื้องต้น”
- หากอ่านไฟล์ไม่ชัด ให้ระบุว่าอ่านไม่ชัด
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- หากมีบุคคลจริง ให้คงอัตลักษณ์เดิม

## กฎเฉพาะ
### สร้างภาพ
ใช้ Image Execution Prompt: สร้างภาพทันที, ขนาดภาพ, layout, tone, visual focus, ข้อห้ามเรื่องภาพ

### ชุดภาพโพสต์ Facebook
ใช้ Album Production Prompt: ปก, ภาพรอง, ข้อความแต่ละภาพ, caption, ลำดับอัลบั้ม

### ทำวิดีโอ
ใช้ Video Storyboard Prompt: hook, scene, shot list, text on screen, voice over, CTA

### เสียงพากย์
ใช้ Voice Script Prompt: script อ่านออกเสียงจริง, ความยาว, น้ำเสียง, ประโยคไม่ยาว

### ทำสไลด์
ใช้ Slide Outline Prompt: outline, bullet, speaker notes, ภาพประกอบ

### เรียบเรียงเนื้อหา
ใช้ Content Transformation Prompt: สรุปงาน, โพสต์, แคปชั่น, สคริปต์เสียง, สคริปต์คลิป, ข้อความทำสื่อ

### งานพิธีกร
ใช้ Ceremonial Script Prompt: สคริปต์พิธีกร, คำเชิญ, คำกล่าว, คำเชื่อม, เปิด/ปิด, เวอร์ชันถืออ่าน

## Responsive
V9 ไม่เพิ่ม UI หนัก แต่ปรับ engine หลังบ้านให้ผลลัพธ์ดีขึ้นทุกอุปกรณ์
โดยยังคง Mobile UX Fix จาก V8.9.6/8.9.7:
- ซ่อน Hero visual ใหญ่บนมือถือ
- ซ่อน FAB บนมือถือ
- ใช้ bottom tabbar
- การ์ดเมนูเป็นแนวนอนบนมือถือ
- ซ่อน form-note กลางฟอร์ม

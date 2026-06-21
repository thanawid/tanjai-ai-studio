# V9.3.9 — Facebook Album Smart Slot Layout

ฐาน: V9.3.6 Pro Album

ขอบเขต:
- แก้เฉพาะระบบ “ชุดภาพโพสต์ Facebook”
- เมนูอื่นและ logic อื่นคงเดิม

สิ่งที่ปรับ:
- เพิ่ม Slot Engine แยกบทบาทภาพเป็น Cover / Lite / Additional
- Auto Crop ตามบทบาทของภาพ ไม่ใช้สูตรเดียวทุกภาพ
- Auto Size ในโหมดอัตโนมัติ:
  - Cover Top: ภาพปก 1920x1080, ภาพรอง 1080x1080
  - Cover Left: ภาพปก 1080x1350, ภาพรอง 1080x1080
  - Grid: ทุกภาพ 1080x1080
  - Mobile-first: ภาพปก 1080x1350, ภาพรอง 1080x1080
- ปรับ Cover Frame ให้เป็นกรอบหลักตามตัวอย่าง โดยใช้ Gold Luxury เป็นค่าเริ่มต้น
- ปรับ Lite Frame ให้เบากว่าเดิม ลดแถบล่าง ลดโลโก้ ลดการบังภาพ
- ปรับ Additional Frame ให้บางที่สุดและเน้นภาพจริง
- Preview แสดงบทบาท Cover / Lite / Additional และขนาดจริงของแต่ละภาพ
- เพิ่มตัวเลือก Mobile-first: ปกแนวตั้ง + ภาพรองจัตุรัส

ตรวจแล้ว:
- JavaScript syntax ผ่าน
- จำนวนไฟล์ต่ำกว่า 100

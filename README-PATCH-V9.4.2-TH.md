# PATCH NOTES V9.4.2 — Facebook Album Complete + Username Login

## ปรับเฉพาะจุดตามคำสั่ง

### 1) ระบบชุดภาพโพสต์ Facebook
- คงระบบอัปโหลดภาพจริง, Cover Frame, Lite Frame, Preview และ Download ZIP เดิมไว้
- เพิ่มไฟล์ `facebook_caption.txt` เข้าไปใน ZIP อัตโนมัติเมื่อมีแคปชั่น เพื่อให้ดาวน์โหลดแล้วนำไปโพสต์ได้ครบทั้งภาพและข้อความ
- ไม่เปลี่ยนเมนูอื่น ไม่แตะ layout หลักของระบบ

### 2) หน้า Login
- เปลี่ยนเป็นกรอกเฉพาะ “ชื่อผู้ใช้งาน”
- ซ่อนช่องอีเมลและรหัสผ่านจากหน้า Login
- ซ่อนปุ่มสมัครสมาชิกเพื่อคงระบบสิทธิ์ผู้ใช้งานแบบปิด

### 3) ผู้ใช้ teamtanjai
- เพิ่มชื่อผู้ใช้ `teamtanjai`
- ผูกกับอีเมล `teamtanjai@tanjai.local` ในไฟล์ตั้งค่า Firebase/frontend access mapping

## หมายเหตุ
บัญชีและสิทธิ์จริงใน Firebase Console ยังต้องคงการตั้งค่าตามที่เจ้าของระบบกำหนดไว้

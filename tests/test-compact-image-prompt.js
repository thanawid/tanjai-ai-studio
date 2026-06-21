const fs = require("fs");
const path = require("path");
const vm = require("vm");

global.window = { TANJAI: {} };
global.document = {
  getElementById(){ return null; },
  createElement(){ return {}; }
};

const enginePath = path.join(__dirname, "..", "js", "expert-prompt-engine.js");
vm.runInThisContext(fs.readFileSync(enginePath, "utf8"), { filename: enginePath });

const T = window.TANJAI;
T.proBriefAnalyze = d => ({
  facts: [
    d.title && `หัวข้องาน / ประเภทงาน: ${d.title}`,
    d.detail && `รายละเอียดจริงที่ผู้ใช้ให้มา: ${d.detail}`,
    d.orgName && `ชื่อองค์กร / แบรนด์ / หน่วยงาน: ${d.orgName}`
  ].filter(Boolean),
  missing: [],
  forbidden: ["QR Code ปลอม", "โลโก้ปลอม", "ข้อมูลจริงที่ไม่ได้ให้มา"],
  textOnImage: [d.title, d.detail, d.orgName].filter(Boolean),
  design: {
    style: "Modern Premium Clean",
    color: "ให้ AI เลือกตามบริบท",
    layout: "อ่านง่าย มีลำดับชัด",
    hierarchy: [d.title || "สารหลัก"]
  }
});

function assert(condition, message){
  if(!condition) throw new Error(message);
}

const base = {
  title: "โปรโมทเพลง",
  detail: "ชื่อเพลง ‘รักที่ไม่มีช่องว่าง’",
  orgName: "Thanawid Ritchi",
  workContext: "ให้ AI ช่วยเลือกจากรายละเอียด",
  imageType: "ให้ AI ช่วยเลือกตามบริบท",
  qualityLevel: "Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้ (แนะนำ)",
  creativityLevel: "คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์ (แนะนำ)",
  density: "สมดุล อ่านง่าย",
  size: "4:5 Facebook / Line 1080x1350",
  useMode: "สร้างภาพใหม่ด้วย AI",
  photoCount: 0
};

const balanced = T.buildImageExecutionPrompt(base);
assert(balanced.length < 7000, `Balanced prompt too long: ${balanced.length}`);
assert(!balanced.includes("PR CREATIVE ROUTER"), "Compact prompt leaked the full router");
assert(!balanced.includes("เป้าหมายสำเร็จ"), "Compact prompt leaked repeated tool policy");
assert(!balanced.includes("ไม่สามารถเรียกเครื่องมือสร้างภาพในแชทนี้ได้"), "Compact prompt contains an eager fallback");
assert(balanced.includes("ไฟล์แนบ — ไม่บังคับ"), "Optional attachment policy missing");
assert(balanced.includes("ถ้าไม่มีภาพแนบ ให้ทำงานต่อ"), "No-file continuation rule missing");
assert(balanced.includes("Music Campaign Key Visual"), "Music brief was not routed to one concise direction");
assert(!balanced.includes("Thai PR Premium — โปสเตอร์ประชาสัมพันธ์หลายชั้น"), "Premium was emitted without explicit selection");

const premium = T.buildImageExecutionPrompt({
  ...base,
  workContext: "Thai PR Premium",
  qualityLevel: "Thai PR Premium — กราฟิกหลายชั้น ข้อมูลเด่น",
  density: "ข้อมูลเยอะ แต่อ่านง่าย"
});
assert(premium.length < 7000, `Premium prompt too long: ${premium.length}`);
assert(premium.includes("Thai PR Premium — โปสเตอร์ประชาสัมพันธ์หลายชั้น"), "Explicit Premium selection was not honored");
assert(!premium.includes("BALANCED CREATIVE PR PROFILE"), "Premium prompt contains a second profile");

const attached = T.buildImageExecutionPrompt({
  ...base,
  useMode: "ใช้ภาพจริงเป็นต้นฉบับ",
  photoCount: 2,
  photoNames: "logo.png, couple.jpg"
});
assert(attached.length < 7000, `Attached prompt too long: ${attached.length}`);
assert(attached.includes("เว็บไซต์ระบุภาพอ้างอิง 2 ไฟล์"), "Attachment metadata missing");
assert(attached.includes("วิเคราะห์หน้าที่ของแต่ละภาพเองอัตโนมัติ"), "Automatic attachment-role analysis missing");
assert(attached.includes("Photo-led PR key visual"), "Attached photos did not select photo-led direction");
assert(!attached.includes("กรุณากด +"), "Attachment prompt still blocks when files are absent from chat");

console.log(JSON.stringify({
  balancedChars: balanced.length,
  premiumChars: premium.length,
  attachedChars: attached.length,
  status: "PASS"
}, null, 2));

const fs = require("fs");
const assert = require("assert");

const app = fs.readFileSync("js/app.js", "utf8");
const worker = fs.readFileSync("ai-worker/src/index.js", "utf8");
const edgeWorker = fs.readFileSync("js/index.js", "utf8");
const fallback = fs.readFileSync("js/free-writing-team.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");

assert(html.includes("เขียนสคริปต์และเนื้อหา"), "post menu should be script-first");
assert(app.includes('value="ให้ AI วิเคราะห์และเลือกผลงาน" checked'), "AI analysis should be the default");
assert(app.includes('id="post-creativity"'), "post should let users control the writing help level");
assert(app.includes('<option selected>ช่วยคิดและแต่งให้สมบูรณ์</option>'), "complete creative assistance should be the default");
[
  "สคริปต์วิดีโอประชาสัมพันธ์",
  "สคริปต์สรุปกิจกรรม",
  "สคริปต์เชิญชวนประชาสัมพันธ์",
  "บทพากย์และข้อความสำหรับทำเสียง",
  "สคริปต์เสียงตามสายและรถประชาสัมพันธ์",
  "โพสต์ Facebook พร้อมเผยแพร่",
  "ข่าวประชาสัมพันธ์",
  "แคปชั่น YouTube Reels TikTok",
  "สร้างครบชุดจากข้อมูลเดียว"
].forEach(mode => assert(app.includes(mode), `missing post mode: ${mode}`));

[worker, edgeWorker].forEach((source, index) => {
  assert(source.includes("จากข้อมูลที่ให้มา"), `worker ${index + 1} needs an anti-meta-writing rule`);
  assert(source.includes("เสียงตามสาย"), `worker ${index + 1} needs public-address script rules`);
  assert(source.includes("สคริปต์สรุปกิจกรรม"), `worker ${index + 1} needs recap-script rules`);
  assert(source.includes("ห้ามสร้าง CTA ที่อ้างข้อเท็จจริงเฉพาะ") || source.includes("ห้ามสร้างผลลัพธ์"), `worker ${index + 1} needs CTA fact safety`);
});

assert(worker.includes("งานเขียนต้องช่วยคิด"), "online post writer must create editorial value");
assert(fallback.includes("editorialExpansion"), "fallback post writer must expand safely");

assert(fallback.includes("ให้ AI วิเคราะห์"), "fallback should infer an output type");
assert(fallback.includes("รถประชาสัมพันธ์"), "fallback should support public-address scripts");
assert(app.includes("ย่อเป็น 30 วินาที") && app.includes("สร้างแคปชั่นจากงานนี้"), "contextual continuation actions are required");

console.log(JSON.stringify({
  menu:"เขียนสคริปต์และเนื้อหา",
  defaultMode:"AI วิเคราะห์และเลือกผลงาน",
  specialistModes:9,
  onlineAndFallbackBrains:true,
  contextualRevisions:true,
  status:"PASS"
}, null, 2));

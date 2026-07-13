const assert = require("assert");
const fs = require("fs");
const path = require("path");
const team = require("../js/free-writing-team.js");

const data = {
  title: "ประชุมเตรียมความพร้อมชุมชน",
  orgName: "เทศบาลตัวอย่าง",
  detail: "ประชุมร่วมกับประชาชนเพื่อรับฟังข้อเสนอแนะ\nสรุปแนวทางการดำเนินงานร่วมกัน",
  dateTime: "21 มิถุนายน 2569",
  place: "ห้องประชุมเทศบาล",
  people: "ประธานในพิธี [ตรวจชื่อและตำแหน่ง]",
  audience: "ประชาชนในพื้นที่",
  expertAction: "ติดตามประกาศจากเทศบาล",
  expertAgenda: "กล่าวต้อนรับ\nชี้แจงรายละเอียด\nรับฟังความคิดเห็น",
  expertKeyMessage: "ร่วมคิด ร่วมทำ เพื่อชุมชน",
  channel: "โพสต์ Facebook",
  length: "มาตรฐาน อ่านง่าย"
};

const outputs = {
  caption: team.captionWriter(data),
  article: team.articleWriter(data),
  mc: team.mcWriter(data),
  video: team.videoWriter(data, "60 วินาที"),
  voice: team.voiceWriter(data, "60 วินาที", "ทางการ สุภาพ"),
  slides: team.slideWriter(data, 8),
  guard: team.factGuard(data)
};

assert.match(outputs.caption, /โพสต์พร้อมเผยแพร่|โพสต์ Facebook พร้อมใช้/);
assert.match(outputs.article, /บทความ \/ ข่าวประชาสัมพันธ์พร้อมใช้|ข่าวประชาสัมพันธ์พร้อมใช้|ข่าวประชาสัมพันธ์พร้อมเผยแพร่/);
assert.match(outputs.mc, /สคริปต์พิธีกรพร้อมใช้/);
assert.match(outputs.mc, /รับฟังความคิดเห็น/);
assert.match(outputs.video, /Video Production Pack/);
assert.match(outputs.video, /SCENE 6/);
assert.match(outputs.voice, /สคริปต์เสียงพร้อมอ่าน/);
assert.match(outputs.slides, /SLIDE 8/);
assert.match(outputs.guard, /FACT GUARD/);
assert.doesNotMatch(outputs.caption, /Prompt/);
assert.doesNotMatch(outputs.mc, /Prompt/);

const missing = team.factGuard({});
assert.match(missing, /หัวข้องาน/);
assert.match(missing, /รายละเอียดเนื้อหา/);

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert.match(index, /js\/free-writing-team\.js/);
assert.match(index, /V9\.9\.2/);
assert.match(app, /team\.captionWriter\(d\)/);
assert.match(app, /team\.mcWriter\(d\)/);
assert.match(app, /team\.videoWriter\(d, length\)/);
assert.match(app, /team\.voiceWriter\(d, length, style\)/);
assert.match(app, /team\.slideWriter\(d, count\)/);
assert.match(ui, /คัดลอกงานเขียน/);
assert.match(ui, /คัดลอก Video Pack/);
assert.doesNotMatch(ui, /คัดลอก Prompt วิดีโอ/);
assert.match(ui, /editableWritingTools = new Set\(\["post", "mc", "video", "voice", "deck"\]\)/);
assert.match(ui, /contenteditable="true"/);
assert.match(ui, /data-reset-output/);

console.log(JSON.stringify({roles:6, directOutputs:true, factGuard:true, status:"PASS"}, null, 2));

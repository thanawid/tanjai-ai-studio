const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const app = fs.readFileSync("create-video/app.js", "utf8");
const css = fs.readFileSync("css/create-video-module.css", "utf8");
const ui = fs.readFileSync("js/ui.js", "utf8");

assert.match(html, /id="createVideo" class="view create-video-module"/);
assert.match(html, /data-view="createVideo"/);
assert.doesNotMatch(html, /href="create-video\//);
assert.match(ui, /"createVideo"/);
assert.match(app, /"ข้อมูลงาน", "บทและฉาก", "เลือกวิธีสร้าง", "ผลงาน"/);
assert.match(app, /วิเคราะห์และวางแผนวิดีโอ/);
assert.match(app, /นำ Prompt ไปสร้างต่อ/);
assert.match(app, /เลือกเครื่องมือสร้างวิดีโอ/);
assert.match(app, /storyboardFromStudioAI/);
assert.match(app, /starterStoryboard/);
assert.match(app, /เตรียมโครงเริ่มต้นให้แล้ว/);
assert.match(app, /CAPCUT_VOICE_SCRIPT/);
assert.match(app, /Prompt สร้างภาพ/);
assert.match(app, /ขณะนี้ยังไม่สามารถเริ่มสร้างวิดีโอภายในเว็บได้/);
assert.match(app, /downloadPrompts/);
assert.match(app, /ACTIVE_JOB_KEY/);
assert.match(app, /ไม่พบงานเดิม/);
assert.match(css, /video-studio-layout\.brief-mode/);
assert.match(css, /word-break:keep-all/);
assert.doesNotMatch(app, /#sidebar|#mobileMenu|#sidebarBackdrop/);
assert.doesNotMatch(app, /downloadJson|prompts\.json/);

console.log(JSON.stringify({ version: "12.2.1", embeddedModule: true, sharedLoginAndShell: true, completeVideoFlow: true, thaiWrapping: true, status: "PASS" }, null, 2));

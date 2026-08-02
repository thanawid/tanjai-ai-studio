const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("create-video/index.html", "utf8");
const app = fs.readFileSync("create-video/app.js", "utf8");
const css = fs.readFileSync("create-video/styles.css", "utf8");
const auth = fs.readFileSync("create-video/auth-guard.js", "utf8");

assert.match(html, /class="full-nav"/);
assert.match(html, /href="\.\.\/#image"/);
assert.match(html, /auth-guard\.js\?v=12\.2\.1/);
assert.match(app, /"ข้อมูลงาน", "บทและฉาก", "ตรวจและสร้าง", "ผลงาน"/);
assert.match(app, /วิเคราะห์และวางแผนวิดีโอ/);
assert.match(app, /downloadPrompts/);
assert.match(app, /ACTIVE_JOB_KEY/);
assert.match(app, /ไม่พบงานเดิม/);
assert.match(css, /studio-layout\.brief-mode/);
assert.match(css, /word-break:keep-all/);
assert.match(auth, /onAuthStateChanged/);
assert.doesNotMatch(app, /downloadJson|prompts\.json/);

console.log(JSON.stringify({ version: "12.2.1", completeVideoFlow: true, authGuard: true, thaiWrapping: true, status: "PASS" }, null, 2));

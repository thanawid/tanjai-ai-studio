const fs = require('fs');
const assert = require('assert');

const index = fs.readFileSync('index.html','utf8');
const ui = fs.readFileSync('js/ui.js','utf8');
const prep = fs.readFileSync('js/video-editor.js','utf8');
const css = fs.readFileSync('css/style.css','utf8');

assert.match(index,/id="videoEditor"/);
assert.match(index,/ui\.js\?v=11\.6\.7/);
assert.match(index,/https:\/\/thanawid\.github\.io\/tanjai-video-studio\//);
assert.match(index,/<a class="nav-link" href="https:\/\/thanawid\.github\.io\/tanjai-video-studio\/\?source=tanjai-ai-studio"><i>✨<\/i><b>สร้างวิดีโอ<\/b><\/a>/);
assert.doesNotMatch(index,/<button class="nav-link" data-view="videoEditor"><i>✂️<\/i>/);
assert.match(ui,/"videoEditor"/);
assert.doesNotMatch(index,/video-handoff-store\.js/);
assert.match(css,/bridge to the dedicated Tanjai Video Studio/);
assert.doesNotMatch(index,/script src="js\/timeline-editor\.js/);
assert.doesNotMatch(prep,/data-video-mode="script"/);
assert.doesNotMatch(prep,/เริ่มจากไอเดีย/);
assert.match(index,/แต่งวิดีโอ AI/);
assert.match(prep,/ดาวน์โหลดคลิปที่ปรับแล้ว/);
assert.doesNotMatch(prep,/id="continueEditingBtn"/);
assert.doesNotMatch(prep,/showAiDestinationsBtn|aiDestinations|continueAiBtn|data-destination/);
assert.doesNotMatch(prep,/ให้ AI วางโครงคลิปนี้ต่อ|เลือกว่าจะนำคลิปไปทางไหน/);

console.log(JSON.stringify({
  version:'11.6.7',
  bridgeView:true,
  footageDownloadOnly:true,
  externalStudio:true,
  status:'PASS'
},null,2));

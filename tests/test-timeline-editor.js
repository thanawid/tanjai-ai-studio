const fs = require('fs');
const assert = require('assert');

const index = fs.readFileSync('index.html','utf8');
const ui = fs.readFileSync('js/ui.js','utf8');
const prep = fs.readFileSync('js/video-editor.js','utf8');
const css = fs.readFileSync('css/style.css','utf8');

assert.match(index,/id="videoEditor"/);
assert.match(index,/ui\.js\?v=11\.6\.2/);
assert.match(index,/https:\/\/thanawid\.github\.io\/tanjai-video-studio\//);
assert.match(ui,/"videoEditor"/);
assert.match(prep,/tanjai-video-handoff:/);
assert.match(prep,/projectId/);
assert.match(prep,/tanjai-video-studio/);
assert.match(css,/bridge to the dedicated Tanjai Video Studio/);
assert.doesNotMatch(index,/script src="js\/timeline-editor\.js/);
assert.doesNotMatch(prep,/data-video-mode="script"/);
assert.doesNotMatch(prep,/เริ่มจากไอเดีย/);
assert.match(index,/แต่งวิดีโอ AI/);

console.log(JSON.stringify({
  version:'11.6.2',
  bridgeView:true,
  prepTransfer:true,
  projectId:true,
  externalStudio:true,
  status:'PASS'
},null,2));

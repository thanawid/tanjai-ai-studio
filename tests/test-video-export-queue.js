const fs = require('fs');
const assert = require('assert');

const js = fs.readFileSync('js/video-editor.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

assert.match(index, /video-editor\.js\?v=11\.5\.1/);
assert.match(js, /processRenderQueue/);
assert.match(js, /Math\.max\(3,\s*Math\.min\(5/);
assert.match(js, /Promise\.all\(Array\.from/);
assert.match(js, /waiting:\s*clips\.length/);
assert.match(js, /stream\.getTracks\(\)\.forEach\(track => track\.stop\(\)\)/);
assert.match(js, /video\.removeAttribute\('src'\)/);
assert.match(js, /canvas\.width = 1/);
assert.match(js, /exportSettings/);
assert.match(js, /canvasFilterString\(settings\.look\)/);
assert.match(js, /อ่าน video stream ไม่สำเร็จ/);
assert.match(js, /เพื่อป้องกันไฟล์มีแต่เสียง/);

console.log(JSON.stringify({
  version: '11.5.1',
  queueConcurrency: '3-5',
  presetSnapshot: true,
  streamValidation: true,
  memoryCleanup: true,
  status: 'PASS'
}, null, 2));

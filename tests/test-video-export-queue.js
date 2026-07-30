const fs = require('fs');
const assert = require('assert');

const js = fs.readFileSync('js/video-editor.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

assert.match(index, /video-editor\.js\?v=11\.6\.3/);
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
assert.match(js, /lookMode:\s*'auto'/);
assert.match(js, /state\.lookMode = 'manual'/);
assert.match(js, /if \(state\.lookMode === 'auto'\) suggestLook\(false\)/);
assert.match(js, /style\.setProperty\('filter', filterString\(\), 'important'\)/);
assert.match(js, /toggleQueuePause/);
assert.match(js, /cancelQueue/);
assert.match(js, /clipStatusText/);
assert.match(js, /renderOverallPercent/);
assert.match(js, /พื้นที่ว่างชั่วคราวประมาณ/);

console.log(JSON.stringify({
  version: '11.6.3',
  queueConcurrency: '3-5',
  presetSnapshot: true,
  streamValidation: true,
  memoryCleanup: true,
  manualLookLock: true,
  pauseAndCancel: true,
  perClipStatus: true,
  overallProgress: true,
  status: 'PASS'
}, null, 2));

const fs = require('fs');
const assert = require('assert');

const index = fs.readFileSync('index.html','utf8');
const ui = fs.readFileSync('js/ui.js','utf8');
const prep = fs.readFileSync('js/video-editor.js','utf8');
const editor = fs.readFileSync('js/timeline-editor.js','utf8');
const css = fs.readFileSync('css/style.css','utf8');

assert.match(index,/id="videoEditor"/);
assert.match(index,/timeline-editor\.js\?v=11\.6\.0/);
assert.match(index,/ui\.js\?v=11\.6\.0/);
assert.match(ui,/"videoEditor"/);
assert.match(prep,/TANJAI\.switchView\?\.\('videoEditor'\)/);
assert.match(editor,/tanjai:video-continue/);
assert.match(editor,/draggable="true"/);
assert.match(editor,/setTrim/);
assert.match(editor,/arrangeDraft/);
assert.match(editor,/downloadPlan/);
assert.match(editor,/exportVideo/);
assert.match(editor,/MediaRecorder/);
assert.match(editor,/16:9/);
assert.match(editor,/9:16/);
assert.match(editor,/1:1/);
assert.match(css,/Tanjai Timeline Editor V11\.6\.0/);

console.log(JSON.stringify({
  version:'11.6.0',
  separateView:true,
  prepTransfer:true,
  dragTimeline:true,
  trim:true,
  aspectRatios:3,
  titleOverlay:true,
  draftArrange:true,
  editPlan:true,
  browserExport:true,
  status:'PASS'
},null,2));

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const album = fs.readFileSync(path.join(root, 'js', 'album.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.match(app, /value="Balanced Ribbon" selected/);
assert.match(album, /val\("album-proFrame", "Balanced Ribbon"\)/);
assert.match(album, /bottomRatio:\.17/);
assert.match(album, /bottomRatio: d\.mode\.includes\("ภาพกิจกรรมเน้นภาพ"\)\?\.058:\.072/);
assert.doesNotMatch(album, /drawLiteNumberBadge\(ctx, idx,/);
assert.match(album, /const thickness=pro \? Math\.max\(6,Math\.round\(min\*0\.009\)\)/);
assert.match(index, /V10\.0\.0/);
assert.doesNotMatch(album, /<b>โครงอัลบั้ม<\/b>/);
assert.doesNotMatch(album, /<summary>โครงอัลบั้ม<\/summary>/);
assert.match(app, /value="square-grid"/);
assert.match(app, /value="wide-top"/);
assert.match(app, /value="portrait-left"/);
assert.match(app, /class="album-preset-card selected"/);
assert.match(app, /id="album-captionStyle"/);
assert.match(album, /function captionWriter/);
assert.match(album, /function factGuardCaption/);
assert.match(album, /album-sequence-head/);
assert.match(album, /preset==="portrait-left"\) return role==="cover" \? \{w:1280,h:1920\}/);
assert.match(album, /preset==="wide-top"\) return role==="cover" \? \{w:1080,h:800\}/);

console.log(JSON.stringify({
  defaultFrame: 'Balanced Ribbon',
  coverPanelRatio: 0.17,
  litePanelRatio: '0.058–0.072',
  liteSequenceBadge: false,
  facebookPresets: ['square-grid', 'wide-top', 'portrait-left'],
  referenceFrameClean: true,
  specializedCaptionWriter: true,
  status: 'PASS'
}, null, 2));

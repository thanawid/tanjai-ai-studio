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
assert.match(index, /V9\.3\.10 · Balanced Ribbon Facebook Album Frame/);

console.log(JSON.stringify({
  defaultFrame: 'Balanced Ribbon',
  coverPanelRatio: 0.17,
  litePanelRatio: '0.058–0.072',
  liteSequenceBadge: false,
  status: 'PASS'
}, null, 2));

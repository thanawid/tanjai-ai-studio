const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js', 'album.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const document = {getElementById(){return null;},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];}};
const context = {console,document,TextEncoder,Uint8Array,Blob,Intl,URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}},Image:function(){},alert(){},setTimeout(){},window:{}};
vm.runInNewContext(source, context, {filename:'album.js'});
const api = context.window.TANJAI_ALBUM_PRO._test;

assert.match(index,/V12\.6\.3/);
assert.match(app,/id="album-allFiles"/);
assert.match(app,/data-cover-mode="double"/);
assert.match(app,/data-cover-mode="single"/);
assert.match(app,/id="album-headlineFont"/);
assert.match(app,/id="album-headlineColor"/);
assert.match(app,/id="album-coverDetail"/);
assert.match(source,/cover-\$\{i\?'right':'left'\}\.jpg/);
assert.match(source,/fb-five-grid/);
assert.match(source,/containerW=isDouble\?2160:1080|canvasW=isDouble\?2160:1080/);
assert.match(source,/scheduleGeneratedRefresh/);
assert.match(css,/grid-template-columns:repeat\(6,1fr\)/);
assert.match(css,/\.fb-five-cell\.cell-5/);
assert.doesNotMatch(source,/drawLiteFrame|drawAdditionalFrame/);

const centered=api.cropPlacement(1200,800,1080,1080,50,50,1);
assert.strictEqual(Math.round(centered.nh),1080);
assert(centered.x<0);
const left=api.cropPlacement(1200,800,1080,1080,0,50,1);
assert.strictEqual(Math.abs(Math.round(left.x)),0);

const facts={title:'เตรียมความพร้อมรับสถานการณ์น้ำ',org:'เทศบาลเมืองบางรักน้อย',date:'22 กันยายน 2569',time:'09.00 น.',place:'หมู่ 1',detail:'ลงพื้นที่ตรวจสอบเครื่องสูบน้ำ',purpose:'เพื่อป้องกันน้ำท่วมขัง',footer:'#เทศบาลเมืองบางรักน้อย'};
const caption=api.captionWriter(facts,'official');
assert.match(caption,/เตรียมความพร้อมรับสถานการณ์น้ำ/);
assert.match(caption,/เทศบาลเมืองบางรักน้อย/);
assert.match(caption,/22 กันยายน 2569 09\.00 น\./);
assert.match(caption,/หมู่ 1/);
assert.doesNotMatch(caption,/undefined|null|placeholder/i);
assert.strictEqual(api.factGuardCaption('ข้อมูลจริง\nPLACEHOLDER\nundefined'),'ข้อมูลจริง');
assert(api.detailFontSize('ข้อความสั้น',true)>api.detailFontSize('ก'.repeat(150),true));
assert(api.detailFontSize('ก'.repeat(150),true)<=20);
const fullCoverDetail='ข้อมูลจริงว่าใครทำอะไร '.repeat(20).trim();
assert.strictEqual(api.coverDetailText({coverDetail:fullCoverDetail}),fullCoverDetail);
assert(!api.coverDetailText({coverDetail:fullCoverDetail}).includes('…'));
assert.doesNotMatch(app,/placeholder="[^"]*เทศบาลเมืองบางรักน้อย/);

console.log(JSON.stringify({version:'12.6.3',coverModes:2,editableHeadline:true,cleanSupportPhotos:true,facebookFiveGrid:true,caption:true,fullCoverDetail:true,neutralDefaults:true,status:'PASS'},null,2));

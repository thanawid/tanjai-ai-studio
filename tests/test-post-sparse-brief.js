const assert = require('assert');
const team = require('../js/free-writing-team.js');

const brief = {
  title:'โครงการฝึกซ้อมแผนป้องกันและบรรเทาสาธารณภัย',
  detail:'โครงการฝึกซ้อมแผนป้องกันและบรรเทาสาธารณภัย ประจำปี 2569',
  orgName:'เทศบาลเมืองบางรักน้อย'
};
const options = {
  channel:'ให้ AI วิเคราะห์และเลือกผลงาน',
  purpose:'ให้ AI วิเคราะห์จากข้อมูล',
  platform:'Facebook',
  creativity:'ช่วยคิดและแต่งให้สมบูรณ์'
};

assert.strictEqual(team.resolvePostOutput(brief, options), 'เนื้อหาตั้งต้นสำหรับโครงการ');
const output = team.prWriter(brief, options);
assert.match(output, /เนื้อหาตั้งต้นสำหรับโครงการ/);
assert.match(output, /บทบาท.*ประสานงาน.*เหตุฉุกเฉิน/);
assert.match(output, /ประจำปี 2569/);
assert.doesNotMatch(output, /14 สิงหาคม|ขอเชิญ|ที่ผ่านมา|ได้จัด|ดำเนินการแล้ว/);
assert.doesNotMatch(output, /ฉบับร่าง|AI เลือก|ชิ้นงานที่เลือก/);

const explicit = {...brief, dateTime:'14 สิงหาคม 2569', place:'ห้องประชุม'};
assert.match(team.factGuard(explicit), /14 สิงหาคม 2569/);
assert.match(team.factGuard(explicit), /ห้องประชุม/);

const inspection = team.prWriter({
  title:'ตรวจสถานประกอบการ',
  detail:'ตรวจสถานประกอบการสระน้ำบางกอกคิดส์? ออกใบอนุญาตตามพรบ.สาธารณสุข2535'
}, {
  channel:'โพสต์ Facebook พร้อมเผยแพร่',
  purpose:'ให้ AI วิเคราะห์จากข้อมูล',
  platform:'Facebook'
});
assert.match(inspection, /สระว่ายน้ำบางกอกคิดส์/);
assert.match(inspection, /พระราชบัญญัติการสาธารณสุข พ\.ศ\. 2535/);
assert.match(inspection, /สุขลักษณะ.*ความสะอาด.*คุณภาพน้ำ.*ความปลอดภัย/);
assert.match(inspection, /ลดปัจจัยเสี่ยง.*สุขภาพ/);
assert.doesNotMatch(inspection, /Thai PR Copywriter|ใกล้ตัว|ชีวิตประจำวัน|ได้รับอนุญาตแล้ว|ผ่านการตรวจ/);

const inspectionVideo = team.prWriter({
  title:'ตรวจสถานประกอบการ',
  detail:'ตรวจสถานประกอบการสระน้ำบางกอกคิดส์? ออกใบอนุญาตตามพรบ.สาธารณสุข2535'
}, {
  channel:'สคริปต์วิดีโอประชาสัมพันธ์',
  length:'60 วินาที',
  purpose:'ให้ AI วิเคราะห์จากข้อมูล'
});
assert.match(inspectionVideo, /สคริปต์วิดีโอประชาสัมพันธ์พร้อมผลิต/);
assert.match(inspectionVideo, /ช่วงเปิด 0–/);
assert.match(inspectionVideo, /ภาพ:.*สระว่ายน้ำบางกอกคิดส์/);
assert.match(inspectionVideo, /บทพากย์:/);
assert.match(inspectionVideo, /ข้อความบนจอ:/);
assert.match(inspectionVideo, /คุณภาพน้ำ/);
assert.match(inspectionVideo, /พระราชบัญญัติการสาธารณสุข พ\.ศ\. 2535/);
assert.doesNotMatch(inspectionVideo, /โพสต์ Facebook/);

console.log(JSON.stringify({sparseBriefFoundation:true,noInventedEventFacts:true,explicitFactsPreserved:true,regulatoryInspectionPost:true,regulatoryInspectionVideo:true,status:'PASS'},null,2));

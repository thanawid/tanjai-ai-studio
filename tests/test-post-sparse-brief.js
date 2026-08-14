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

console.log(JSON.stringify({sparseBriefFoundation:true,noInventedEventFacts:true,explicitFactsPreserved:true,status:'PASS'},null,2));

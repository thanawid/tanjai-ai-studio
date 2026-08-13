const assert = require("assert");
const fs = require("fs");
const path = require("path");
const team = require("../js/free-writing-team.js");

const data = {
  title: "ประชุมเตรียมความพร้อมชุมชน",
  orgName: "เทศบาลตัวอย่าง",
  detail: "ประชุมร่วมกับประชาชนเพื่อรับฟังข้อเสนอแนะ\nสรุปแนวทางการดำเนินงานร่วมกัน",
  dateTime: "21 มิถุนายน 2569",
  place: "ห้องประชุมเทศบาล",
  people: "ประธานในพิธี [ตรวจชื่อและตำแหน่ง]",
  audience: "ประชาชนในพื้นที่",
  expertAction: "ติดตามประกาศจากเทศบาล",
  expertAgenda: "กล่าวต้อนรับ\nชี้แจงรายละเอียด\nรับฟังความคิดเห็น",
  expertKeyMessage: "ร่วมคิด ร่วมทำ เพื่อชุมชน",
  videoDestination: "Google Veo / Flow",
  videoVoiceMode: "บรรยาย + บทพูดตัวละคร (แนะนำ)",
  channel: "โพสต์ Facebook",
  length: "มาตรฐาน อ่านง่าย"
};

const outputs = {
  caption: team.captionWriter(data),
  article: team.articleWriter(data),
  mc: team.mcWriter(data),
  video: team.videoWriter(data, "60 วินาที"),
  voice: team.voiceWriter(data, "60 วินาที", "ทางการ สุภาพ"),
  slides: team.slideWriter(data, 8),
  guard: team.factGuard(data)
};

const prModes = {
  video: team.prWriter(data, {channel:"สคริปต์วิดีโอประชาสัมพันธ์", length:"30 วินาที"}),
  voice: team.prWriter(data, {channel:"บทพากย์และข้อความสำหรับทำเสียง", length:"30 วินาที"}),
  facebook: team.prWriter(data, {channel:"โพสต์ Facebook พร้อมเผยแพร่"}),
  news: team.prWriter(data, {channel:"ข่าวประชาสัมพันธ์"}),
  clip: team.prWriter(data, {channel:"แคปชั่น YouTube Reels TikTok"}),
  complete: team.prWriter(data, {channel:"สร้างครบชุดจากข้อมูลเดียว", length:"30 วินาที"})
};

assert.match(outputs.caption, /โพสต์พร้อมเผยแพร่|โพสต์ Facebook พร้อมใช้/);
assert.match(outputs.article, /บทความ \/ ข่าวประชาสัมพันธ์พร้อมใช้|ข่าวประชาสัมพันธ์พร้อมใช้|ข่าวประชาสัมพันธ์พร้อมเผยแพร่/);
assert.match(outputs.mc, /สคริปต์พิธีกรพร้อมใช้/);
assert.match(outputs.mc, /รับฟังความคิดเห็น/);
assert.match(outputs.video, /Video Production Pack/);
assert.match(outputs.video, /\[SHORT_SHOT_PROMPTS\]/);
assert.match(outputs.video, /\[CAPCUT_VOICE_SCRIPT\]/);
assert.match(outputs.video, /\[CAPCUT_CHARACTER_DIALOGUE\]/);
assert.match(outputs.video, /ปลายทาง AI วิดีโอ: Google Veo \/ Flow/);
assert.match(outputs.video, /Google Veo \/ Flow: ใช้ Short Prompt/);
assert.match(outputs.video, /SCENE 6/);
assert.match(outputs.voice, /สคริปต์เสียงพร้อมอ่าน/);
assert.match(outputs.slides, /SLIDE 8/);
assert.match(outputs.guard, /FACT GUARD/);
assert.match(prModes.video, /สคริปต์วิดีโอพร้อมนำไปผลิต/);
assert.doesNotMatch(prModes.video, /Video Production Pack|SHORT_SHOT_PROMPTS|CAPCUT/);
assert.match(prModes.voice, /บทพากย์พร้อมบันทึกเสียง/);
assert.match(prModes.facebook, /โพสต์พร้อมเผยแพร่/);
assert.match(prModes.news, /ข่าวประชาสัมพันธ์พร้อมเผยแพร่/);
assert.match(prModes.clip, /ชุดข้อความประกอบคลิปพร้อมใช้/);
assert.match(prModes.complete, /=== 4\. แคปชั่นคลิป ===/);
assert.match(team.reviseWriting(outputs.caption,"proofread"), /ฉบับตรวจทานภาษาแล้ว/);
assert.match(team.reviseWriting(outputs.caption,"expand"), /ข้อมูลที่ควรเติมเพื่อขยายงานโดยไม่แต่งข้อเท็จจริง/);
assert.doesNotMatch(team.reviseWriting(outputs.caption,"expand"), /การสื่อสารอย่างต่อเนื่องและความร่วมมือ/);
assert.doesNotMatch(outputs.caption, /Prompt/);
assert.doesNotMatch(outputs.mc, /Prompt/);

const missing = team.factGuard({});
assert.match(missing, /หัวข้องาน/);
assert.match(missing, /รายละเอียดเนื้อหา/);

const shortHealthBrief=team.prWriter({
  title:"รณรงค์ป้องกันยุงลาย",
  orgName:"หน่วยงานตัวอย่าง",
  detail:"ลงพื้นที่รณรงค์ป้องกันยุงลาย"
},{channel:"โพสต์ Facebook พร้อมเผยแพร่"});
assert.match(shortHealthBrief,/แหล่งน้ำขัง/);
assert.match(shortHealthBrief,/ทุกครัวเรือน/);
assert.match(shortHealthBrief,/จุดเสี่ยงเล็ก ๆ รอบบ้าน/);

const creativeHealthBrief=team.prWriter({
  title:"ลงพื้นที่รณรงค์ป้องกันยุงลาย",
  orgName:"เทศบาลตัวอย่าง",
  detail:"ลงพื้นที่รณรงค์ป้องกันยุงลาย หมู่ที่ 6"
},{channel:"โพสต์ Facebook พร้อมเผยแพร่",creativity:"สร้างสรรค์มากขึ้น"});
assert.match(creativeHealthBrief,/ภาชนะหรือจุดที่อาจกลายเป็นแหล่งน้ำขัง/);
assert.match(creativeHealthBrief,/การเปลี่ยนแปลงที่เห็นผล/);
assert.match(creativeHealthBrief,/มาร่วมกันสำรวจและลดจุดเสี่ยง/);
assert.doesNotMatch(creativeHealthBrief,/จำนวนผู้เข้าร่วม|เบอร์โทร|https?:\/\//);

const autoFacebook=team.prWriter({
  title:"ลงพื้นที่รณรงค์ป้องกันยุงลาย",
  orgName:"เทศบาลตัวอย่าง",
  detail:"เมื่อวันที่ 5 สิงหาคม 2569 ลงพื้นที่หมู่ที่ 6"
},{channel:"ให้ AI วิเคราะห์และเลือกผลงาน",platform:"Facebook",purpose:"สรุปผลการดำเนินงาน"});
assert.match(autoFacebook,/โพสต์พร้อมเผยแพร่/);

const autoYoutube=team.prWriter({
  title:"ลงพื้นที่รณรงค์ป้องกันยุงลาย",
  orgName:"เทศบาลตัวอย่าง",
  detail:"เมื่อวันที่ 5 สิงหาคม 2569 ลงพื้นที่หมู่ที่ 6"
},{channel:"ให้ AI วิเคราะห์และเลือกผลงาน",platform:"YouTube",purpose:"สรุปผลการดำเนินงาน",length:"60 วินาที"});
assert.match(autoYoutube,/สคริปต์วิดีโอพร้อมนำไปผลิต/);
assert.doesNotMatch(autoYoutube,/Video Production Pack|SHORT_SHOT_PROMPTS|CAPCUT/);

const cancellationPost=team.prWriter({
  title:"งดกิจกรรมเต้นแอโรบิค",
  orgName:"เทศบาลตัวอย่าง",
  detail:"งดกิจกรรม 1 วัน เนื่องจากเป็นวันหยุดราชการ"
},{channel:"โพสต์ Facebook พร้อมเผยแพร่"});
assert.match(cancellationPost,/ขอแจ้งประชาสัมพันธ์/);
assert.match(cancellationPost,/โปรดอ่านรายละเอียดให้ครบถ้วน/);
assert.doesNotMatch(cancellationPost,/ขอเชิญผู้สนใจร่วมเป็นส่วนหนึ่ง/);

const shortVoice=team.prWriter({
  title:"กิจกรรมส่งเสริมสุขภาพ",
  orgName:"เทศบาลตัวอย่าง",
  detail:"เมื่อวันที่ 5 สิงหาคม 2569 นายกเทศมนตรีเป็นประธานเปิดกิจกรรม และประชาชนร่วมออกกำลังกาย"
},{channel:"บทพากย์และข้อความสำหรับทำเสียง",length:"60 วินาที"});
assert.match(shortVoice,/บทพากย์พร้อมบันทึกเสียง/);
assert.doesNotMatch(shortVoice,/ขอเชิญชวน/);
assert.doesNotMatch(shortVoice,/ติดตามข้อมูลเพิ่มเติม/);

const exactTime=team.prWriter({
  title:"เสียเหงื่อ กันหน่อยไหม",
  orgName:"เทศบาลเมืองบางรักน้อย",
  detail:"กิจกรรมเต้นแอโรบิก ทุกวันพุธและวันศุกร์ ตั้งแต่เวลา 17.00 น. เป็นต้นไป ณ เทศบาลเมืองบางรักน้อย"
},{channel:"บทพากย์และข้อความสำหรับทำเสียง",length:"60 วินาที"});
assert.match(exactTime,/17\.00 น\./);
assert.doesNotMatch(exactTime,/\n00 น\./);

const publicAddress=team.prWriter({
  title:"รับสมัครอาสาสมัคร",
  orgName:"เทศบาลตัวอย่าง",
  detail:"เปิดรับสมัครอาสาสมัครดูแลชุมชน",
  expertAction:"สมัครได้ที่สำนักปลัดเทศบาล"
},{channel:"สคริปต์เสียงตามสายและรถประชาสัมพันธ์",length:"30 วินาที"});
assert.match(publicAddress,/ข้อความประชาสัมพันธ์พร้อมอ่าน/);
assert.match(publicAddress,/สมัครได้ที่สำนักปลัดเทศบาล/);
assert.doesNotMatch(publicAddress,/\[ต้องระบุ: วัน/);

assert.match(outputs.voice,/สคริปต์เสียงพร้อมอ่าน/);

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui.js"), "utf8");
const aiConfig = fs.readFileSync(path.join(root, "js", "ai-config.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "style.css"), "utf8");
assert.match(index, /js\/free-writing-team\.js/);
assert.match(index, /V12\.5\.5/);
assert.match(app, /ผู้กำกับภาพอัจฉริยะ/);
assert.match(app, /generateCurrentImage/);
assert.match(app, /generateImageWithAI/);
assert.match(app, /team\.prWriter\(d, options\)/);
assert.match(app, /data-post-revise="proofread"/);
assert.match(app, /data-post-revise="expand"/);
assert.match(app, /data-specialist-revise/);
assert.match(app, /team\.mcWriter\(d\)/);
assert.match(app, /team\.videoWriter\(d, length\)/);
assert.match(app, /videoVoiceModes/);
assert.match(app, /videoDestinations/);
assert.match(app, /video-destination/);
assert.match(app, /Google Veo \/ Flow/);
assert.match(app, /บรรยาย \+ บทพูดตัวละคร/);
assert.doesNotMatch(app, /Cinematic Emotional|Modern Social Fast Cut|Warm Storytelling/);
assert.match(app, /team\.voiceWriter\(d, length, style\)/);
assert.match(app, /team\.slideWriter\(d, count\)/);
assert.match(ui, /คัดลอกงานเขียน/);
assert.match(ui, /สร้างภาพในเว็บ/);
assert.match(ui, /data-generate-image/);
assert.match(ui, /imageGenerateButton/);
assert.match(ui, /TANJAI_AI_CONFIG\?\.imageGenerationEnabled/);
assert.match(aiConfig, /imageGenerationEnabled:\s*false/);
assert.match(ui, /generated-image-card-v10/);
assert.match(ui, /คัดลอก Shot Prompts/);
assert.match(ui, /คัดลอกเสียง CapCut/);
assert.match(ui, /คัดลอกบทพูดตัวละคร/);
assert.match(ui, /video-more-actions/);
assert.match(ui, /data-primary-actions/);
assert.match(ui, /CAPCUT_CHARACTER_DIALOGUE/);
assert.doesNotMatch(ui, /คัดลอก Prompt วิดีโอ/);
assert.match(ui, /editableWritingTools = new Set\(\["post", "mc", "video", "voice", "deck"\]\)/);
assert.match(ui, /contenteditable="true"/);
assert.match(ui, /data-reset-output/);
assert.match(css, /data-primary-actions="video"/);
assert.match(css, /grid-template-columns:1fr 1fr/);
assert.match(css, /generated-image-card-v10/);
assert.match(css, /#post \.post-writer-modes/);
assert.match(css, /grid-template-columns:minmax\(0,1\.03fr\) minmax\(440px,\.97fr\)/);
assert.doesNotMatch(css, /view\.active:not\(\.has-output\)[^\{]*result-panel[^\{]*\{display:none\}/);
assert.match(css, /position:static;bottom:auto/);
assert.doesNotMatch(app, /V10 Smart Image/);

console.log(JSON.stringify({roles:6, directOutputs:true, smartImage:true, factGuard:true, status:"PASS"}, null, 2));

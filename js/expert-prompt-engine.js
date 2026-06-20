window.TANJAI = window.TANJAI || {};

/**
 * TANJAI Expert Prompt Engine
 * Final prompt layer: every menu has its own role, workflow, quality gate,
 * and output contract. Shared helpers only clean data and protect facts.
 */
(function(){
  const T = window.TANJAI;
  T.expertPromptVersion = "Expert Engine 1.0";

  const clean = (value = "", fallback = "") => {
    const result = String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return result || fallback;
  };

  const placeholderRe = /^(ไม่ระบุ|ยังไม่ได้ระบุ|หัวข้องาน|กลุ่มเป้าหมายหลัก|ให้ AI เลือกให้เหมาะสม|ให้ AI ช่วยเลือก.*|กำหนดเอง)$/i;
  const meaningful = value => {
    const result = clean(value);
    return !!result && !placeholderRe.test(result);
  };
  const unique = values => [...new Set((values || []).map(value => clean(value)).filter(Boolean))];
  const bullet = (values, fallback = "- ไม่มี") => {
    const items = unique(values);
    return items.length ? items.map(item => `- ${item}`).join("\n") : fallback;
  };
  const line = (label, value) => meaningful(value) ? `${label}: ${clean(value)}` : "";

  const analyze = (d, tool) => {
    if(T.proBriefAnalyze) return T.proBriefAnalyze(d, tool);
    return {
      facts: [line("หัวข้อ", d.title), line("รายละเอียด", d.detail), line("หน่วยงาน", d.orgName)].filter(Boolean),
      missing: [], forbidden: [], textOnImage: [],
      design: {style:d.style || "มืออาชีพ", color:d.colorTone || "เหมาะกับบริบท", layout:d.layout || "อ่านง่าย", hierarchy:[d.brainFocus || d.title || "สารหลัก"]}
    };
  };

  const truthContract = (d, tool, extraFacts = []) => {
    const a = analyze(d, tool);
    const facts = unique(a.facts.concat(extraFacts.filter(Boolean)));
    const missing = unique(a.missing);
    const forbidden = unique(a.forbidden.concat(
      meaningful(d.brainNoInvent) ? clean(d.brainNoInvent).split(/[,\n]/g) : []
    ));
    return `=== SOURCE OF TRUTH — ข้อมูลอ้างอิงเพียงชุดเดียว ===
ข้อมูลที่ยืนยันแล้ว:
${bullet(facts, "- ผู้ใช้ยังให้ข้อมูลจริงน้อย ให้ทำงานจากสิ่งที่มีเท่านั้น")}

ข้อมูลที่ยังไม่ระบุ:
${bullet(missing, "- ไม่มีจุดขาดสำคัญที่ตรวจพบ")}

กติกาข้อมูล:
- ห้ามเดาชื่อบุคคล ตำแหน่ง หน่วยงาน วันที่ เวลา สถานที่ ตัวเลข ราคา เบอร์โทร ลิงก์ QR Code หรือผลลัพธ์
- เมื่อข้อมูลจำเป็นขาด ให้ใช้รูปแบบ [ต้องระบุ: ชื่อข้อมูล] ณ จุดที่ต้องใช้ ห้ามกลบด้วยข้อความกว้าง ๆ
- แยก “ข้อเท็จจริงจากผู้ใช้” ออกจาก “ข้อเสนอเชิงสร้างสรรค์ของ AI” ให้ชัด

ข้อมูลที่ห้ามแต่งหรือเปลี่ยน:
${bullet(forbidden, "- ข้อเท็จจริงและชื่อเฉพาะทั้งหมด")}`;
  };

  const silentQualityGate = checks => `=== QUALITY GATE ก่อนส่ง ===
ตรวจงานภายในแบบเงียบ ๆ แล้วแก้ให้ผ่านทุกข้อ ไม่ต้องอธิบายกระบวนการคิด:
${bullet(checks)}
- ส่งเฉพาะผลงานตาม OUTPUT CONTRACT ห้ามเกริ่นว่า “ในฐานะ AI” และห้ามสรุปบรีฟซ้ำ`;

  const destinationGuard = type => T.outputDeliveryGuard ? T.outputDeliveryGuard(type) : "";

  T.buildImageExpertPrompt = function(d = {}){
    const a = analyze(d, "image");
    const hasRealPhotos = Number(d.photoCount || 0) > 0;
    const mode = clean(d.useMode, "สร้างภาพใหม่ด้วย AI");
    const identityRules = hasRealPhotos || mode !== "สร้างภาพใหม่ด้วย AI" ? `
=== ORIGINAL PHOTO PROTOCOL ===
- มีภาพต้นฉบับ ${Number(d.photoCount || 0)} ภาพ: ${clean(d.photoNames, "ผู้ใช้จะแนบใน AI ปลายทาง")}
- ใช้ภาพจริงเป็นแหล่งอ้างอิงหลัก คงใบหน้า อัตลักษณ์ รูปร่าง ชุด ฉาก และบุคคลเดิม
- ห้าม face swap, facial reconstruction, beauty filter ที่เปลี่ยนคน, เพิ่มคนใหม่ หรือลบสาระสำคัญ
- อนุญาตเฉพาะสิ่งที่ผู้ใช้เลือก เช่น ปรับแสง สี ความคมชัด ครอป และวางกราฟิกโดยไม่บังใบหน้า` : "";

    return `EXPERT MODE: SENIOR THAI VISUAL ART DIRECTOR

ภารกิจ
สร้างงานภาพที่ “เข้าใจสารใน 3 วินาที อ่านได้บนมือถือ และผลิตต่อได้จริง” ไม่ใช่แค่ภาพสวยทั่วไป
โหมดงาน: ${mode}
ประเภทภาพ: ${clean(d.imageType || d.workContext, "ให้วิเคราะห์จากบรีฟ")}
ขนาดปลายทาง: ${clean(d.size, "4:5 Facebook / Line 1080x1350")}

${truthContract(d, "image", [
  line("เป้าหมายการสื่อสาร", d.brainGoal),
  line("สารที่ต้องเด่นที่สุด", d.brainFocus || d.focus),
  line("ข้อความ/ข้อห้ามเพิ่มเติม", d.avoid)
])}
${identityRules}

=== ART-DIRECTION WORKFLOW ===
1. ตีความวัตถุประสงค์ กลุ่มเป้าหมาย และอารมณ์ที่ต้องการ โดยไม่สร้างข้อเท็จจริงใหม่
2. เลือก Big Idea เดียวที่แข็งแรงที่สุด และอธิบายเป็นประโยคเดียว
3. จัด Information Hierarchy: หัวข้อหลัก > ข้อมูลจำเป็น > เจ้าของงาน/CTA
4. จำกัดข้อความบนภาพให้สั้นที่สุด ส่วนรายละเอียดให้ย้ายไป Caption หากเหมาะสม
5. กำหนด Composition, focal point, negative space, color contrast, Thai typography และ safe area ตามขนาดปลายทาง
6. หากมีภาพจริง ให้ใช้ Original Photo Protocol เหนือความสวยงามทุกกรณี
7. ตรวจตัวสะกดไทย ชื่อเฉพาะ และความอ่านง่ายที่ขนาดหน้าจอมือถือ

ทิศทางที่ผู้ใช้เลือก:
- Style: ${clean(d.style || a.design.style, "Modern Premium Clean")}
- Color: ${clean(d.colorTone || a.design.color, "เหมาะกับบริบท")}
- Layout: ${clean(d.layout || a.design.layout, "อ่านง่าย มีลำดับชัด")}
- Density: ${clean(d.density, "สมดุล อ่านง่าย")}
- Creativity: ${clean(d.creativityLevel, "คิดต่อพอดีโดยไม่แต่งข้อมูล")}

=== OUTPUT CONTRACT ===
A. CREATIVE DECISION
- Big Idea 1 ประโยค
- เหตุผลที่แนวนี้ตอบโจทย์ 2–3 ข้อ

B. FINAL TEXT SET
- ข้อความบนภาพตามลำดับชั้น โดยคงข้อความจริง 100%
- ข้อมูลที่ขาดให้แสดง [ต้องระบุ: ...]
- ห้ามนำคำเทคนิค เช่น camera, lighting, prompt ไปใส่เป็นข้อความบนภาพ

C. PRODUCTION-READY IMAGE PROMPT
- เขียน Prompt ฉบับเดียวที่พร้อมใช้ โดยระบุ subject, composition, environment, lighting, color, typography zone, hierarchy, aspect ratio และคุณภาพงาน
- แยก “ข้อความที่ต้องสะกดตรงตามนี้” ออกจากคำอธิบายภาพ

D. NEGATIVE PROMPT / DO-NOT LIST
- ระบุสิ่งที่ห้ามเกิดเฉพาะงานนี้ รวมถึงตัวอักษรเพี้ยน โลโก้ปลอม QR ปลอม ข้อมูลปลอม และใบหน้าเปลี่ยน

E. FINAL ACTION
- ถ้าเครื่องมือสร้างภาพได้ ให้สร้างภาพจริงตาม Prompt ที่ตรวจแล้วทันที
- ถ้าสร้างภาพไม่ได้ ให้ส่ง A–D ครบ ห้ามอ้างว่าสร้างไฟล์สำเร็จ และห้ามตอบเป็น path ภายใน

${silentQualityGate([
  "สารหลักเข้าใจได้ภายใน 3 วินาที",
  "ข้อความไทยทุกคำสะกดถูกและไม่มีข้อความที่ AI แต่งเป็นข้อเท็จจริง",
  "Contrast และขนาดตัวอักษรเหมาะกับมือถือ",
  "ภาพจริงไม่ถูกเปลี่ยนอัตลักษณ์",
  "Prompt มีรายละเอียดการผลิตครบแต่ไม่ขัดกันเอง"
])}

${destinationGuard("ภาพ")}`;
  };

  function postOutputContract(d){
    const target = clean(d.channel, "โพสต์ Facebook");
    if(/สรุปงาน/.test(target)) return `1. Executive Summary 3–5 บรรทัด\n2. สรุปข้อเท็จจริงแบบ Bullet\n3. เนื้อหาสรุปฉบับพร้อมส่งต่อภายในองค์กร`;
    if(/เรียบเรียงข้อมูล|ข่าวประชาสัมพันธ์/.test(target)) return `1. พาดหัวข่าวที่ตรงข้อเท็จจริง 3 ตัวเลือก\n2. ข่าวประชาสัมพันธ์ฉบับพร้อมเผยแพร่\n3. สรุปย่อ 2–3 บรรทัด`;
    if(/Line/.test(target)) return `1. ข้อความ Line ฉบับพร้อมส่ง\n2. เวอร์ชันสั้นมากสำหรับแจ้งเตือน\n3. CTA ที่ชัดเจน 1 บรรทัด`;
    if(/แคปชั่น/.test(target)) return `1. แคปชั่นหลัก 3 ตัวเลือก (ตรงไปตรงมา / อบอุ่น / ดึงดูด)\n2. CTA 2 ตัวเลือก\n3. Hashtag เท่าที่จำเป็น`;
    return `1. Hook 3 ตัวเลือก\n2. โพสต์ฉบับพร้อมเผยแพร่ 1 เวอร์ชัน\n3. เวอร์ชันย่อสำหรับอ่านเร็ว\n4. CTA และ Hashtag ที่เกี่ยวข้องจริง`;
  }

  T.buildPostExpertPrompt = function(d = {}){
    return `EXPERT MODE: SENIOR THAI CONTENT STRATEGIST & EDITOR

ภารกิจ
เปลี่ยนข้อมูลดิบเป็น “${clean(d.channel, "ข้อความเผยแพร่") }” ที่คนอ่านเข้าใจเร็ว เชื่อถือได้ และทำสิ่งที่ต้องการต่อ โดยไม่ใช้ภาษาราชการแข็งหรือคำโฆษณาเกินจริง

${truthContract(d, "post", [
  line("ประเภทเนื้อหา", d.channel),
  line("ประเภทงาน", d.workType),
  line("เป้าหมายหลังอ่านจบ", d.expertAction || d.brainGoal),
  line("สารหลักที่ต้องจำ", d.expertKeyMessage || d.brainFocus),
  line("ข้อเน้นเพิ่มเติม", d.extra),
  d.attachmentCount ? `มีไฟล์ภาพ/เอกสารแนบ ${d.attachmentCount} ไฟล์: ${d.attachmentNames}` : ""
])}

=== EDITORIAL WORKFLOW ===
1. ระบุเป้าหมายเนื้อหาเพียงหนึ่งข้อ: แจ้งให้ทราบ / เชิญชวน / สรุปผล / ให้ความรู้ / กระตุ้นการตัดสินใจ
2. สกัดสารหลักหนึ่งประโยค แล้วเรียงข้อมูลตามความสำคัญ ไม่เรียงตามลำดับที่ผู้ใช้พิมพ์
3. ใช้โครงที่เหมาะกับประเภทงาน เช่น 5W1H สำหรับข่าว, Problem–Value–Action สำหรับประชาสัมพันธ์, Result–Evidence–Next Step สำหรับสรุปผลงาน
4. ปรับน้ำเสียงให้เข้ากับ ${clean(d.audience, "กลุ่มเป้าหมาย")} และช่องทาง โดยคงชื่อเฉพาะ/ตัวเลขตามต้นฉบับ
5. ตัดคำฟุ่มเฟือย คำซ้ำ คำอวดอ้าง และ Emoji ที่ไม่จำเป็น
6. ทำ CTA ให้ชัด แต่ห้ามสร้างลิงก์ เบอร์โทร วันเวลา หรือเงื่อนไขเอง

ข้อกำหนดงานเขียน:
- ความยาว: ${clean(d.length, "มาตรฐาน อ่านง่าย")}
- น้ำเสียง: ${clean(d.tone, "สุภาพ เป็นธรรมชาติ น่าเชื่อถือ")}
- หลีกเลี่ยงคำเปิดสำเร็จรูปซ้ำ ๆ เช่น “ขอเชิญชวนทุกท่าน” หากมีวิธีเปิดที่ตรงประเด็นกว่า
- หากอ่านเอกสารแนบไม่ได้ ให้บอกว่าข้อมูลใดต้องถอดจากเอกสาร ห้ามอ้างว่าอ่านแล้ว

=== OUTPUT CONTRACT ===
${postOutputContract(d)}

ท้ายคำตอบเพิ่ม “FACT CHECK ก่อนเผยแพร่” เฉพาะช่องที่เป็น [ต้องระบุ: ...] ไม่ต้องเตือนเรื่องที่ข้อมูลครบแล้ว

${silentQualityGate([
  "ประโยคแรกบอกสารสำคัญ ไม่เสียพื้นที่กับคำเกริ่น",
  "ข้อเท็จจริง ชื่อคน หน่วยงาน ตัวเลข วันเวลา ตรงกับ Source of Truth",
  "น้ำเสียงเป็นธรรมชาติและเหมาะกับช่องทาง",
  "ไม่มีคำอวดอ้างหรือผลลัพธ์ที่ไม่มีหลักฐาน",
  "CTA บอกการกระทำถัดไปชัดเจน"
])}`;
  };

  function mcDeliverables(channel){
    const selected = clean(channel, "สคริปต์พิธีกรเต็ม");
    if(/ครบชุด/.test(selected)) return `1. Run of Show แบบลำดับช่วง\n2. สคริปต์เปิดงาน\n3. คำเชิญผู้กล่าวรายงาน/ประธาน\n4. คำเชื่อมทุกช่วง\n5. สคริปต์ปิดงาน\n6. Cue Card ฉบับย่อ`;
    return `1. สร้างเฉพาะ “${selected}” ฉบับพร้อมอ่านจริง\n2. Cue Card ฉบับย่อ\n3. รายการชื่อ/ตำแหน่ง/ลำดับที่ต้องยืนยันก่อนขึ้นเวที`;
  }

  T.buildMCExpertPrompt = function(d = {}){
    return `EXPERT MODE: THAI CEREMONIAL SCRIPT DIRECTOR

ภารกิจ
เขียนงานพิธีกรที่อ่านบนเวทีได้จริง สุภาพ ลื่น ไม่เยิ่นเย้อ และไม่ทำให้ลำดับพิธีผิด

${truthContract(d, "mc", [
  line("รูปแบบงาน", d.workType),
  line("ชิ้นงานที่ต้องการ", d.channel),
  line("สไตล์พิธีกร", d.style),
  line("ลำดับพิธี/ข้อมูลหน้างาน", d.expertAgenda || d.extra),
  line("คำเรียกผู้ร่วมงาน", d.expertAddress),
  line("คำอ่านชื่อเฉพาะ", d.expertPronunciation),
  d.attachmentCount ? `มีเอกสาร/กำหนดการแนบ ${d.attachmentCount} ไฟล์: ${d.attachmentNames}` : ""
])}

=== STAGE WORKFLOW ===
1. สร้าง Event Spine จากลำดับพิธีที่มี ห้ามสลับช่วงเอง
2. แยกคำพูดพิธีกรออกจาก Stage Direction ด้วยวงเล็บเหลี่ยม เช่น [รอประธานขึ้นเวที]
3. ใช้ชื่อ–ตำแหน่ง–คำยกย่องตามข้อมูลจริงเท่านั้น ถ้าไม่ครบให้ใช้ [ต้องระบุ: ...]
4. เขียนประโยคเชิญและคำเชื่อมให้พูดได้ในลมหายใจเดียว หลีกเลี่ยงประโยคซ้อนยาว
5. ใส่ทางออกสำหรับสถานการณ์จริงเฉพาะที่ปลอดภัย เช่น [รอสัญญาณจากทีมงาน] โดยไม่สร้างเหตุการณ์
6. ทำ Cue Card ที่มองแล้วรู้ทันทีว่า “พูดอะไร / รออะไร / ใครขึ้นต่อ”

ค่ากำกับ:
- ความยาว: ${clean(d.length, "มาตรฐาน ใช้บนเวที")}
- น้ำเสียง: ${clean(d.style || d.tone, "ทางการ สุภาพ อ่านง่าย")}
- ผู้พูดใช้คำลงท้ายแบบกลาง หากผู้ใช้ไม่ระบุเพศ ให้เขียน “ครับ/ค่ะ” เฉพาะจุดที่จำเป็น

=== OUTPUT CONTRACT ===
${mcDeliverables(d.channel)}

รูปแบบทุกช่วง:
ช่วงที่ N — ชื่อช่วง
[Stage Direction]
พิธีกร: “ข้อความพร้อมอ่าน”
ตรวจยืนยัน: รายการข้อมูลที่ต้องเช็กก่อนพูด

${silentQualityGate([
  "ลำดับพิธีไม่ถูกแต่งหรือสลับเอง",
  "ชื่อและตำแหน่งทุกจุดมาจาก Source of Truth หรือเป็น Placeholder",
  "ประโยคอ่านออกเสียงลื่นและให้เกียรติผู้ร่วมงาน",
  "Stage Direction แยกจากคำพูดชัดเจน",
  "Cue Card สั้นพอสำหรับใช้บนเวที"
])}`;
  };

  const durationSeconds = value => {
    const text = clean(value, "60 วินาที");
    const number = Number((text.match(/\d+/) || [60])[0]);
    return /นาที/.test(text) ? number * 60 : number;
  };

  T.buildVideoExpertPrompt = function(d = {}, extra = {}){
    const length = clean(extra.length || d.length, "60 วินาที");
    const seconds = durationSeconds(length);
    return `EXPERT MODE: SHORT-FORM VIDEO CREATIVE DIRECTOR & EDITOR

ภารกิจ
ออกแบบคลิปที่ถ่ายทำ/ตัดต่อได้จริง ภายใน ${length} โดยทุกซีนมีหน้าที่และเวลารวมต้องพอดีกับความยาวเป้าหมาย

${truthContract(d, "video", [
  line("รูปแบบคลิป", d.format),
  line("แพลตฟอร์ม", d.channel),
  line("CTA", d.expertCTA || d.brainGoal),
  line("วัตถุดิบภาพที่มี", d.expertAssets),
  line("จังหวะคลิป", d.expertPace),
  line("สารที่ต้องจำ", d.brainFocus),
  line("รายละเอียดเพิ่มเติม", d.extra)
])}

=== VIDEO WORKFLOW ===
1. สร้าง Core Message หนึ่งประโยคและ Viewer Promise หนึ่งประโยค
2. เลือก Hook ที่หยุดคนดูได้โดยไม่ clickbait หรือกล่าวเกินจริง
3. วาง Story Arc: Hook → Context → Key Value/Proof → CTA
4. แบ่งซีนตามความยาว ${seconds} วินาที และตรวจให้ผลรวมเวลาทุกซีนเท่ากับ ${seconds} วินาที
5. แต่ละซีนต้องระบุ Visual, Shot/Movement, Voice Over, On-screen Text, Audio และ Transition
6. ข้อความบนจอใช้ประโยคสั้น อ่านทันในเวลาซีน และอยู่ใน safe area ของแพลตฟอร์ม
7. ถ้าไม่มีภาพตามแผน ให้เสนอ B-roll ทางเลือกที่ไม่สร้างบุคคล/เหตุการณ์จริงปลอม

ค่ากำกับ:
- Format: ${clean(d.format, "คลิปประชาสัมพันธ์")}
- Platform: ${clean(d.channel, "Facebook / TikTok / Reels")}
- Pace: ${clean(d.expertPace, "กระชับ มีจังหวะหายใจ")}
- Tone: ${clean(d.tone, "สุภาพ ทันสมัย น่าเชื่อถือ")}

=== OUTPUT CONTRACT ===
A. Core Message + Viewer Promise
B. Hook 3 แบบ พร้อมเหตุผลสั้น ๆ แล้วเลือก 1 แบบที่แนะนำ
C. Storyboard Table คอลัมน์: Timecode | Duration | Visual/Shot | Voice Over | On-screen Text | Audio/SFX | Transition
D. Voice Over ฉบับต่อเนื่องพร้อมนำไปอัดเสียง
E. Shot List แยก Must-have / Nice-to-have
F. Editing Notes: aspect ratio, subtitle, safe area, rhythm, color mood
G. Fact/Asset Checklist ก่อนผลิต

${silentQualityGate([
  `เวลารวมทุกซีนเท่ากับ ${seconds} วินาที`,
  "ภาพ เสียง และข้อความบนจอของแต่ละซีนสื่อสารเรื่องเดียวกัน",
  "Hook ดึงดูดแต่ไม่กล่าวเกินจริง",
  "Storyboard ถ่ายทำได้จากวัตถุดิบที่มีหรือระบุสิ่งที่ต้องหาเพิ่ม",
  "CTA ชัดและไม่สร้างช่องทางติดต่อปลอม"
])}`;
  };

  T.buildVoiceExpertPrompt = function(d = {}, extra = {}){
    const length = clean(extra.length || d.length, "60 วินาที");
    const style = clean(extra.style || d.style || d.tone, "สุภาพ ชัดเจน เป็นธรรมชาติ");
    const seconds = durationSeconds(length);
    const minWords = Math.max(15, Math.round(seconds / 60 * 125));
    const maxWords = Math.max(minWords + 5, Math.round(seconds / 60 * 145));
    return `EXPERT MODE: THAI VOICE SCRIPT WRITER & PERFORMANCE DIRECTOR

ภารกิจ
เขียนสคริปต์เสียงที่ “ฟังแล้วเข้าใจ” ไม่ใช่ข้อความเขียนที่ถูกนำมาอ่าน โดยคุมเวลา ${length} และน้ำเสียง ${style}

${truthContract(d, "voice", [
  line("ช่องทางใช้งาน", d.channel),
  line("อารมณ์การส่งเสียง", d.expertDelivery),
  line("ความเร็ว/จังหวะ", d.expertPace),
  line("คำอ่านชื่อเฉพาะ", d.expertPronunciation),
  line("เป้าหมายผู้ฟัง", d.brainGoal),
  line("สารที่ต้องเน้น", d.brainFocus),
  line("รายละเอียดเพิ่มเติม", d.extra)
])}

=== VOICE WORKFLOW ===
1. สรุป Message Intent และอารมณ์ที่ผู้ฟังควรรู้สึกหลังฟังจบ
2. เขียนเพื่อหู: ประโยคสั้น คำไทยธรรมชาติ ตัวเลข/วันที่อ่านได้ลื่น
3. คุมความยาวประมาณ ${minWords}–${maxWords} คำ แล้วอ่านจำลองภายในเพื่อปรับให้ใกล้ ${seconds} วินาที
4. ใช้เครื่องหมาย / สำหรับหยุดสั้น, // สำหรับหยุดยาว และ **คำ** สำหรับคำเน้น โดยไม่ใส่มากเกินไป
5. ระบุ Pronunciation Guide เฉพาะชื่อหรือคำที่มีโอกาสอ่านผิด ห้ามเดาคำอ่าน
6. ปิดด้วย CTA ที่ออกเสียงแล้วชัดเจนและไม่ยาว

=== OUTPUT CONTRACT ===
A. PERFORMANCE NOTE: อารมณ์ ความเร็ว ระดับพลัง และกลุ่มผู้ฟัง
B. SCRIPT CLEAN: ฉบับพร้อมคัดลอกไปใช้กับ TTS (ไม่มีคำอธิบายแทรก)
C. SCRIPT DIRECTED: ฉบับมี / // **คำเน้น** และคำกำกับอารมณ์
D. PRONUNCIATION GUIDE: คำ | คำอ่าน (เฉพาะที่มีข้อมูล)
E. TIMING CHECK: จำนวนคำโดยประมาณ + เวลาคาดการณ์ + จุดที่ตัดได้หากยาวเกิน

${silentQualityGate([
  `ความยาวใกล้ ${seconds} วินาทีที่ความเร็วพูดธรรมชาติ`,
  "อ่านออกเสียงลื่น ไม่มีประโยคซ้อนยาวหรือภาษาหนังสือเกินไป",
  "ชื่อเฉพาะ ตัวเลข วันที่ และสถานที่อ่านได้ชัด",
  "คำกำกับไม่ปนใน SCRIPT CLEAN",
  "CTA จบชัดและไม่เร่งจนฟังไม่รู้เรื่อง"
])}`;
  };

  T.buildDeckExpertPrompt = function(d = {}, extra = {}){
    const count = Number(extra.count || d.count || 8);
    return `EXPERT MODE: EXECUTIVE PRESENTATION STRATEGIST

ภารกิจ
สร้างสไลด์ ${count} หน้าแบบ “หนึ่งสไลด์ หนึ่งข้อสรุป” ให้ผู้ฟังตามเรื่องทัน ตัดสินใจได้ และผู้นำเสนอมี Speaker Notes ที่พูดต่อได้จริง

${truthContract(d, "deck", [
  line("รูปแบบการนำเสนอ", d.format),
  line("การตัดสินใจ/ผลลัพธ์ที่ต้องการ", d.expertGoal || d.brainGoal),
  line("ข้อมูลหรือหลักฐานที่มี", d.expertEvidence),
  line("ทิศทางภาพ", d.expertVisual),
  line("ประเด็นที่ต้องเน้น", d.brainFocus),
  line("รายละเอียดเพิ่มเติม", d.extra)
])}

=== PRESENTATION WORKFLOW ===
1. ระบุ Audience, Decision Goal และ Single Takeaway ของทั้ง Deck
2. เลือก Story Arc ให้เหมาะกับงาน: Context → Insight → Proposal/Action หรือ Situation → Evidence → Result → Next Step
3. กำหนดบทบาทของทุกสไลด์ก่อนเขียนเนื้อหา และห้ามมีสองประเด็นหลักในหน้าเดียว
4. เขียนหัวข้อสไลด์เป็น “ข้อสรุป” ไม่ใช่ป้ายหมวด เช่น ใช้ “พื้นที่เสี่ยงลดลงหลังปรับแผน” แทน “ผลการดำเนินงาน” เมื่อมีข้อมูลรองรับ
5. จำกัด 3–5 Bullet ต่อหน้า แต่ละ Bullet สั้นและไม่ซ้ำ Speaker Notes
6. ระบุ Visual Evidence ที่เหมาะสม เช่น ภาพจริง ตาราง Timeline หรือกราฟ โดยห้ามสร้างตัวเลข
7. วาง Transition ระหว่างสไลด์ให้ผู้นำเสนอพูดต่อเนื่อง

ค่ากำกับ:
- จำนวน: ${count} สไลด์ (ต้องครบพอดี)
- รูปแบบ: ${clean(d.format, "นำเสนอโครงการ / รายงานผล")}
- ผู้ฟัง: ${clean(d.audience, "ผู้เกี่ยวข้อง")}
- Tone: ${clean(d.tone, "มืออาชีพ กระชับ ชัดเจน")}

=== OUTPUT CONTRACT ===
A. DECK STRATEGY: Audience | Decision Goal | Single Takeaway | Story Arc
B. SLIDE-BY-SLIDE จำนวน ${count} หน้า โดยแต่ละหน้ามี:
- Slide N — Takeaway Title
- Purpose
- On-slide Content (3–5 Bullet)
- Visual Direction / Data Needed
- Speaker Notes 80–140 คำ
- Transition to Next Slide
C. DESIGN SYSTEM: สี ตัวอักษร Grid ภาพ และหลักลดความแน่นของข้อมูล
D. MISSING DATA REGISTER: รายการ [ต้องระบุ: ...] พร้อมเลขสไลด์
E. FINAL PRESENTER CHECKLIST

${silentQualityGate([
  `มีสไลด์ครบ ${count} หน้า ไม่เกินและไม่ขาด`,
  "หัวข้อทุกหน้าเป็นข้อสรุปและแต่ละหน้ามีสารหลักเดียว",
  "ไม่มีตัวเลข ผลลัพธ์ แหล่งอ้างอิง หรือคำกล่าวอ้างที่ถูกแต่ง",
  "Speaker Notes ขยายความ ไม่อ่าน Bullet ซ้ำ",
  "Story Arc เชื่อมต่อและจบด้วยการตัดสินใจ/ขั้นตอนถัดไป"
])}

${destinationGuard("สไลด์")}`;
  };

  T.buildKitExpertPrompt = function(d = {}){
    return `EXPERT MODE: INTEGRATED CAMPAIGN CREATIVE DIRECTOR

ภารกิจ
แปลงบรีฟเดียวเป็นระบบสื่อที่ทุกชิ้นพูด “เรื่องเดียวกัน” แต่ปรับวิธีเล่าให้เหมาะกับแต่ละช่องทาง ห้ามนำ Prompt ของหลายเมนูมาต่อกันแบบซ้ำ ๆ

${truthContract(d, "kit", [
  line("Core Message", d.expertCoreMessage || d.brainFocus),
  line("Campaign CTA", d.expertCTA || d.brainGoal),
  line("Campaign Tone", d.expertCampaignTone || d.tone),
  line("รายละเอียดเพิ่มเติม", d.extra)
])}

=== CAMPAIGN WORKFLOW ===
1. สร้าง Campaign Spine: Objective, Audience Insight, Core Message, Proof, CTA, Tone
2. แยก Master Facts ที่ทุกสื่อต้องใช้ตรงกัน และ Flexible Creative Elements ที่ปรับได้
3. วางบทบาทช่องทาง: ภาพหยุดสายตา / โพสต์อธิบาย / วิดีโอสร้างการมีส่วนร่วม / เสียงสร้างอารมณ์ / สไลด์อธิบายเชิงลึก
4. ทำ Message Consistency Map ป้องกันหัวข้อ วันที่ ชื่อ และ CTA ขัดกันระหว่างชิ้น
5. สร้างผลลัพธ์แต่ละสื่อแบบเฉพาะทาง ไม่คัดลอกข้อความเดียวกันทั้งชุด
6. จัด Production Order และ Asset Checklist เพื่อลดงานซ้ำ

=== OUTPUT CONTRACT ===
A. CAMPAIGN MASTER BRIEF
- Objective | Audience | Core Message | Supporting Points | CTA | Tone | Do/Don't

B. MESSAGE CONSISTENCY MAP
- รายการข้อเท็จจริงหลักและวิธีใช้ใน ภาพ / โพสต์ / วิดีโอ / เสียง / สไลด์

C. CHANNEL DELIVERABLES
1. ภาพ: Big Idea + Text Hierarchy + Production-ready Image Prompt + Negative Prompt
2. โพสต์: Hook + โพสต์พร้อมใช้ + CTA + Hashtag
3. วิดีโอ: Hook + Story Arc + Scene Outline + VO Direction
4. เสียง: Script Clean ความยาวประมาณ 60 วินาที + Performance Note
5. สไลด์: Deck Storyline 8 หน้า + Takeaway Title ต่อหน้า

D. PRODUCTION PLAN
- ลำดับงาน | ไฟล์ต้นฉบับที่ต้องใช้ | ผู้ตรวจข้อมูล | จุดอนุมัติ

E. MISSING DATA REGISTER
- รวม [ต้องระบุ: ...] เพียงชุดเดียวและระบุว่าส่งผลต่อสื่อใดบ้าง

${silentQualityGate([
  "ทุกสื่อใช้ Core Message, ชื่อเฉพาะ, วันที่ และ CTA ตรงกัน",
  "แต่ละช่องทางทำหน้าที่ต่างกันและไม่มีข้อความซ้ำโดยไม่จำเป็น",
  "ผลลัพธ์ทุกส่วนผลิตต่อได้จริง ไม่ใช่เพียงแนวคิดกว้าง ๆ",
  "ไม่มีข้อมูลจริง โลโก้ QR Code ช่องทางติดต่อ หรือผลลัพธ์ที่ถูกแต่ง",
  "Production Plan ระบุสิ่งที่ต้องทำต่ออย่างชัดเจน"
])}`;
  };

  const reviewLenses = {
    image:["ลำดับสายตาและความอ่านง่าย", "ความถูกต้องของข้อความไทย", "ความเสี่ยงเรื่องภาพบุคคล/โลโก้/QR", "ความพร้อมของ Prompt ผลิตภาพ"],
    post:["ความชัดของสารในประโยคแรก", "โครงเรื่องและน้ำเสียง", "ข้อเท็จจริง/คำกล่าวอ้าง", "CTA และความเหมาะกับช่องทาง"],
    mc:["ลำดับพิธี", "ชื่อและตำแหน่ง", "ความลื่นเมื่ออ่านบนเวที", "Cue Card และ Stage Direction"],
    video:["Hook และ Retention", "เวลารวมแต่ละซีน", "ความสอดคล้องภาพ/VO/Text", "ความเป็นไปได้ในการถ่ายทำ"],
    voice:["เวลาพูด", "ความเป็นภาษาพูด", "คำอ่านชื่อเฉพาะ", "จังหวะและคำเน้น"],
    deck:["Story Arc", "หนึ่งสไลด์หนึ่งข้อสรุป", "หลักฐาน/ตัวเลข", "Speaker Notes และการตัดสินใจ"],
    kit:["Campaign Spine", "ความสอดคล้องข้ามช่องทาง", "บทบาทแต่ละสื่อ", "Production Plan"]
  };

  T.buildExpertReviewPrompt = function(tool, d = {}){
    return `EXPERT REVIEW MODE — ${String(tool || "งาน").toUpperCase()}

หน้าที่ของคุณคือวิจารณ์และยกระดับบรีฟก่อนผลิตจริง ยังไม่ต้องสร้างผลงานสุดท้าย

${truthContract(d, tool)}

ตรวจเฉพาะมุมต่อไปนี้:
${bullet(reviewLenses[tool] || ["ความชัดเจน", "ความถูกต้อง", "ความพร้อมผลิต"])}

ส่งออก 4 ส่วน:
1. จุดแข็งที่ควรรักษา
2. ช่องว่างที่กระทบคุณภาพจริง เรียงจากสำคัญที่สุด
3. คำถามที่ควรถามเพิ่มไม่เกิน 5 ข้อ
4. Brief ฉบับปรับปรุง โดยใช้ [ต้องระบุ: ...] แทนการเดาข้อมูล

ห้ามแต่งข้อเท็จจริง และไม่ต้องแสดงกระบวนการคิดภายใน`;
  };

  // Final routing: these functions intentionally do not share a generic prompt template.
  T.imagePrompt = (d = {}) => T.buildImageExpertPrompt(d);
  T.postPrompt = (d = {}) => T.buildPostExpertPrompt(d);
  T.mcPrompt = (d = {}) => T.buildMCExpertPrompt(d);
  T.videoPrompt = (d = {}, extra = {}) => T.buildVideoExpertPrompt(d, extra);
  T.voicePrompt = (d = {}, extra = {}) => T.buildVoiceExpertPrompt(d, extra);
  T.deckPrompt = (d = {}, extra = {}) => T.buildDeckExpertPrompt(d, extra);
  T.promptPack = (d = {}) => T.buildKitExpertPrompt(d);
  T.discussPrompt = (tool, d = {}) => T.buildExpertReviewPrompt(tool, d);
  T.executionPrompt = function(tool, d = {}, extra = {}){
    if(tool === "image") return T.buildImageExpertPrompt(d);
    if(tool === "post") return T.buildPostExpertPrompt(d);
    if(tool === "mc") return T.buildMCExpertPrompt(d);
    if(tool === "video") return T.buildVideoExpertPrompt(d, extra);
    if(tool === "voice") return T.buildVoiceExpertPrompt(d, extra);
    if(tool === "deck") return T.buildDeckExpertPrompt(d, extra);
    if(tool === "kit") return T.buildKitExpertPrompt(d);
    return T.buildPostExpertPrompt(d);
  };

  // Capture previously ignored menu-specific inputs and attachment metadata.
  const previousCommonData = T.commonData;
  T.commonData = function(prefix){
    const d = previousCommonData ? previousCommonData(prefix) : {};
    const field = id => clean(document.getElementById(`${prefix}-${id}`)?.value);
    d.extra = field("extra");
    d.expertAction = field("expertAction");
    d.expertKeyMessage = field("expertKeyMessage");
    d.expertAgenda = field("expertAgenda");
    d.expertAddress = field("expertAddress");
    d.expertPronunciation = field("expertPronunciation");
    d.expertCTA = field("expertCTA");
    d.expertAssets = field("expertAssets");
    d.expertPace = field("expertPace");
    d.expertDelivery = field("expertDelivery");
    d.expertGoal = field("expertGoal");
    d.expertEvidence = field("expertEvidence");
    d.expertVisual = field("expertVisual");
    d.expertCoreMessage = field("expertCoreMessage");
    d.expertCampaignTone = field("expertCampaignTone");
    const fileInput = document.getElementById(`${prefix}-photos`);
    const files = Array.from(fileInput?.files || []);
    d.attachmentCount = files.length;
    d.attachmentNames = files.map(file => file.name).join(", ");
    return d;
  };

  const expertFields = {
    post: `
      <div class="form-section expert-menu-section" data-expert-menu="post">
        <div class="section-title"><b>✍️</b><h4>คำถามเฉพาะงานเขียน</h4></div>
        <div class="form-grid">
          <label>อ่านจบแล้วอยากให้คนทำอะไร<input id="post-expertAction" placeholder="เช่น รับทราบ / สมัคร / เข้าร่วม / ติดต่อ / แชร์ต่อ"></label>
          <label>หนึ่งประโยคที่คนต้องจำ<input id="post-expertKeyMessage" placeholder="สารหลักที่ห้ามหลุดประเด็น"></label>
        </div>
      </div>`,
    mc: `
      <div class="form-section expert-menu-section" data-expert-menu="mc">
        <div class="section-title"><b>🎤</b><h4>คำถามเฉพาะงานเวที</h4></div>
        <div class="form-grid">
          <label class="full">ลำดับพิธีจริง<textarea id="mc-expertAgenda" placeholder="เรียงช่วงตามกำหนดการจริง ห้ามให้ AI สลับเอง"></textarea></label>
          <label>คำเรียกผู้ร่วมงาน<input id="mc-expertAddress" placeholder="เช่น ท่านประธาน แขกผู้มีเกียรติ ผู้เข้าร่วมอบรม"></label>
          <label>คำอ่านชื่อเฉพาะ<input id="mc-expertPronunciation" placeholder="ชื่อ — คำอ่าน (ถ้ามี)"></label>
        </div>
      </div>`,
    video: `
      <div class="form-section expert-menu-section" data-expert-menu="video">
        <div class="section-title"><b>🎬</b><h4>คำถามเฉพาะงานวิดีโอ</h4></div>
        <div class="form-grid">
          <label>CTA ตอนจบ<input id="video-expertCTA" placeholder="อยากให้คนดูทำอะไรต่อ"></label>
          <label>จังหวะคลิป<input id="video-expertPace" placeholder="เช่น เร็ว กระชับ / อบอุ่น / สารคดีสั้น"></label>
          <label class="full">ภาพหรือวัตถุดิบที่มี<textarea id="video-expertAssets" placeholder="เช่น ภาพลงพื้นที่ 12 คลิป, ภาพโดรน, บทสัมภาษณ์, โลโก้จริง"></textarea></label>
        </div>
      </div>`,
    voice: `
      <div class="form-section expert-menu-section" data-expert-menu="voice">
        <div class="section-title"><b>🎙️</b><h4>คำถามเฉพาะงานเสียง</h4></div>
        <div class="form-grid">
          <label>อารมณ์การส่งเสียง<input id="voice-expertDelivery" placeholder="เช่น อบอุ่น จริงใจ / เร่งด่วนแต่ไม่กดดัน"></label>
          <label>ความเร็วและจังหวะ<input id="voice-expertPace" placeholder="เช่น ช้า ชัด / ธรรมชาติ / กระชับ"></label>
          <label class="full">คำอ่านชื่อเฉพาะ<input id="voice-expertPronunciation" placeholder="ชื่อ — คำอ่าน (ถ้ามี)"></label>
        </div>
      </div>`,
    deck: `
      <div class="form-section expert-menu-section" data-expert-menu="deck">
        <div class="section-title"><b>📊</b><h4>คำถามเฉพาะงานนำเสนอ</h4></div>
        <div class="form-grid">
          <label>ต้องการให้ผู้ฟังตัดสินใจอะไร<input id="deck-expertGoal" placeholder="เช่น อนุมัติโครงการ / รับทราบผล / เห็นชอบแผน"></label>
          <label>ทิศทางภาพ<input id="deck-expertVisual" placeholder="เช่น Executive clean / ภาพจริง / data-driven"></label>
          <label class="full">ข้อมูล ตัวเลข หรือหลักฐานที่มี<textarea id="deck-expertEvidence" placeholder="ระบุเฉพาะข้อมูลจริง ถ้าไม่มีให้เว้นว่าง"></textarea></label>
        </div>
      </div>`,
    kit: `
      <div class="form-section expert-menu-section" data-expert-menu="kit">
        <div class="section-title"><b>🧩</b><h4>แกนกลางของแคมเปญ</h4></div>
        <div class="form-grid">
          <label>Core Message<input id="kit-expertCoreMessage" placeholder="หนึ่งประโยคที่ทุกสื่อต้องพูดตรงกัน"></label>
          <label>Campaign CTA<input id="kit-expertCTA" placeholder="การกระทำถัดไปที่ต้องการ"></label>
          <label class="full">Campaign Tone<input id="kit-expertCampaignTone" placeholder="เช่น ทางการแต่เข้าถึงง่าย / อบอุ่น จริงใจ / พรีเมียม"></label>
        </div>
      </div>`
  };

  const previousField = T.field;
  T.field = function(prefix, data){
    const base = previousField ? previousField(prefix, data) : "";
    return base + (expertFields[prefix] || "");
  };
})();

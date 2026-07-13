window.TANJAI = window.TANJAI || {};

/**
 * TANJAI Expert Prompt Engine
 * Final prompt layer: every menu has its own role, workflow, quality gate,
 * and output contract. Shared helpers only clean data and protect facts.
 */
(function(){
  const T = window.TANJAI;
  T.expertPromptVersion = "Expert Engine 1.9 — Simple Smart Form UX";

  const clean = (value = "", fallback = "") => {
    const result = String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return result || fallback;
  };

  const placeholderRe = /^(ไม่ระบุ|ยังไม่ได้ระบุ|หัวข้องาน|กลุ่มเป้าหมายหลัก|ให้ AI เลือกให้เหมาะสม|ให้ AI ช่วยเลือก.*|ให้ AI วิเคราะห์.*|กำหนดเอง)$/i;
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

  const imageContextProfile = d => {
    const source = clean([
      d.orgType, d.mainCategory, d.subCategory, d.workContext,
      d.imageType, d.title, d.detail
    ].filter(Boolean).join(" ")).toLowerCase();
    const orgSource = meaningful(d.orgType) ? clean(d.orgType).toLowerCase() : source;
    const taskSelection = [d.mainCategory, d.subCategory, d.workContext, d.imageType]
      .find(meaningful);
    const taskSource = meaningful(taskSelection)
      ? clean(taskSelection).toLowerCase()
      : clean([d.title, d.detail].filter(Boolean).join(" ")).toLowerCase();
    const findProfile = (profiles, fallback, target = source) => profiles.find(profile => profile.match.test(target)) || fallback;

    const orgFallback = {
      name:"วิเคราะห์จากรายละเอียด",
      trust:"ชัดเจน น่าเชื่อถือ และเข้าถึงง่าย",
      visual:"ใช้ภาษาภาพที่ตรงกับเนื้อหาและกลุ่มเป้าหมาย โดยไม่ยัดสัญลักษณ์องค์กรที่ไม่ได้ให้มา",
      guard:"ห้ามสร้างตรา โลโก้ เครื่องแบบ หรือภาพบุคคลเฉพาะขึ้นเอง"
    };
    const taskFallback = {
      name:"วิเคราะห์ชนิดงานจากบรีฟ",
      hierarchy:"สารหลัก 1 เรื่อง > ข้อมูลจำเป็น > เจ้าของงานหรือ CTA",
      layout:"เลือกโครงสร้างที่ทำให้เข้าใจได้ใน 3 วินาทีและอ่านต่อได้บนมือถือ",
      guard:"ตัดองค์ประกอบตกแต่งที่ไม่ช่วยการสื่อสาร"
    };

    const org = findProfile([
      {match:/เทศบาล|อบต\.|ราชการ|หน่วยงานรัฐ|บริการประชาชน/, name:"ภาครัฐ / บริการประชาชน", trust:"เป็นทางการพอดี โปร่งใส เชื่อถือได้ และประชาชนอ่านง่าย", visual:"Civic communication ที่สะอาด มีพื้นที่หายใจ ใช้สีองค์กรเมื่อมีข้อมูลจริง และเลี่ยงความหรูหราเกินบทบาท", guard:"ห้ามสร้างตราราชการ โลโก้ เครื่องแบบ ยศ หรือตำแหน่งขึ้นเอง"},
      {match:/โรงเรียน|นักเรียน|การศึกษา|ศูนย์พัฒนาเด็ก/, name:"การศึกษา", trust:"อบอุ่น ปลอดภัย ชัดเจน และเหมาะกับวัยของผู้รับสาร", visual:"ลำดับข้อมูลเป็นมิตร สีสดพอดี ตัวอักษรใหญ่ และใช้ภาพกิจกรรมจริงเมื่อมี", guard:"ห้ามทำภาพเด็กในลักษณะเสี่ยง ล้อเลียน หรือสร้างบุคคลจริงขึ้นเอง"},
      {match:/โรงพยาบาล|สาธารณสุข|คลินิก|สุขภาพ|แพทย์|พยาบาล/, name:"สุขภาพ / สาธารณสุข", trust:"สงบ น่าเชื่อถือ เข้าใจง่าย และไม่สร้างความตื่นตระหนก", visual:"Medical-clean visual system สีสบายตา แบ่งข้อมูลเป็นส่วน และใช้ไอคอนเท่าที่ช่วยความเข้าใจ", guard:"ห้ามวินิจฉัย อ้างผลรักษา สร้างสถิติ หรือใช้ภาพการแพทย์ชวนเข้าใจผิด"},
      {match:/วัด|ศาสนา|งานบุญ|วัฒนธรรม|ประเพณี/, name:"ศาสนา / วัฒนธรรม", trust:"สุภาพ สำรวม ให้เกียรติ และสอดคล้องกับพิธี", visual:"องค์ประกอบสมดุล ใช้พื้นที่ว่างและสีที่สงบ เลือกสัญลักษณ์เฉพาะเมื่อสัมพันธ์กับข้อมูลจริง", guard:"ห้ามผสมสัญลักษณ์ต่างศาสนา ใช้ภาพศักดิ์สิทธิ์ผิดบริบท หรือแต่งชื่อพิธี"},
      {match:/โรงงาน|อุตสาหกรรม|ความปลอดภัย|5ส|kaizen|lean/, name:"อุตสาหกรรม / ความปลอดภัย", trust:"ตรง ชัด เป็นระบบ และนำไปปฏิบัติได้", visual:"High-clarity operational design ใช้ลำดับขั้น ตัวเลข และคอนทราสต์ที่มองเห็นไกล", guard:"ห้ามแสดงขั้นตอน เครื่องจักร หรือ PPE ที่ไม่ปลอดภัยและขัดกับข้อมูลจริง"},
      {match:/ธนาคาร|การเงิน|สหกรณ์|สินเชื่อ|ดอกเบี้ย/, name:"การเงิน / สหกรณ์", trust:"มั่นคง โปร่งใส สุภาพ และไม่กดดัน", visual:"Clean trustworthy design เน้นตัวเลขจริง เงื่อนไข และ CTA ที่ตรวจสอบได้", guard:"ห้ามแต่งอัตรา ผลตอบแทน สิทธิประโยชน์ การรับรอง หรือเงื่อนไขทางการเงิน"},
      {match:/ร้านค้า|ธุรกิจ|สินค้า|บริการ|สมาชิก|ลูกค้า|โปรโมชัน|โปรโมชั่น/, name:"ธุรกิจ / บริการ", trust:"ชัดเจน น่าสนใจ และซื่อสัตย์ต่อข้อเสนอ", visual:"Brand-led commercial design ให้สินค้า/บริการหรือประโยชน์หลักเป็นจุดเด่น พร้อม CTA ที่เห็นง่าย", guard:"ห้ามแต่งราคา ส่วนลด รางวัล รีวิว การรับประกัน หรือโลโก้แบรนด์"},
      {match:/เพจ|ครีเอเตอร์|ยูทูบ|ศิลปิน|เพลง|ปกเพลง/, name:"ครีเอเตอร์ / งานสร้างสรรค์", trust:"มีบุคลิก จดจำได้ และยังสื่อสารสารหลักชัด", visual:"Editorial social design ที่กล้าขึ้นได้หนึ่งระดับ แต่ต้องคุมจุดเด่นและไม่รก", guard:"ห้ามเลียนแบบศิลปินมีชีวิต แบรนด์ หรืองานมีลิขสิทธิ์แบบระบุตัวตน"},
      {match:/ชุมชน|มูลนิธิ|อาสา/, name:"ชุมชน / สาธารณประโยชน์", trust:"จริงใจ เป็นมนุษย์ และเข้าถึงง่าย", visual:"ใช้ภาพผู้คนและบริบทจริงเมื่อมี เน้นความร่วมมือและผลลัพธ์ที่จับต้องได้", guard:"ห้ามทำภาพผู้รับความช่วยเหลือให้ด้อยศักดิ์ศรีหรือแต่งผลลัพธ์เกินจริง"}
    ], orgFallback, orgSource);

    const task = findProfile([
      {match:/ข่าวด่วน|แจ้งเตือน|ประกาศ|แจ้งข่าว|ปิดบริการ|เปลี่ยนเวลา/, name:"ประกาศ / แจ้งเตือน", hierarchy:"ข้อความประกาศ > สิ่งที่เปลี่ยนหรือสิ่งที่ต้องทำ > วันเวลา/ช่องทางติดต่อ", layout:"Headline-first layout คอนทราสต์สูง อ่านจบได้เร็ว ใช้สีเตือนเฉพาะจุด", guard:"ห้ามใช้ภาพตกแต่งกลบสาร และห้ามเพิ่มระดับความเร่งด่วนเกินข้อมูล"},
      {match:/รับสมัคร|ลงทะเบียน|เชิญ|ร่วมกิจกรรม/, name:"รับสมัคร / เชิญชวน", hierarchy:"เหตุผลที่ควรเข้าร่วม > ใครเข้าร่วมได้ > วันเวลา/สถานที่ > CTA", layout:"Invitation poster ที่มี visual hook หนึ่งจุดและเส้นทางสายตาลงสู่ CTA", guard:"ห้ามแต่งสิทธิประโยชน์ จำนวนรับ คุณสมบัติ หรือเส้นตาย"},
      {match:/รณรงค์|ตระหนัก|ป้องกัน|ความปลอดภัย/, name:"รณรงค์ / สร้างความตระหนัก", hierarchy:"ปัญหาหรือสารเตือน > การกระทำที่ทำได้ทันที > ผลลัพธ์หรือ CTA", layout:"Problem-to-action composition ใช้ภาพอารมณ์พอดีและคำสั่งที่ทำตามได้", guard:"ห้ามใช้ความกลัว ภาพรุนแรง หรือคำกล่าวอ้างเกินจริงเพื่อบังคับอารมณ์"},
      {match:/ขั้นตอน|วิธีใช้|วิธีใช้งาน|faq|ข้อมูลควรรู้|infographic|อินโฟกราฟิก|ให้ความรู้/, name:"ขั้นตอน / ให้ความรู้", hierarchy:"ผลลัพธ์ที่ผู้อ่านจะได้ > ขั้นตอนหรือประเด็นเรียงลำดับ > แหล่งอ้างอิง/CTA", layout:"Modular infographic แบ่ง 3–5 ส่วน ใช้เลข ไอคอน และสีช่วยนำทางอย่างสม่ำเสมอ", guard:"หนึ่งช่องต่อหนึ่งแนวคิด ห้ามย่อข้อมูลจนความหมายเปลี่ยน และห้ามสร้างตัวเลข"},
      {match:/โปรโม|ขาย|แคมเปญ|สินค้า|บริการ/, name:"โปรโมชัน / แคมเปญ", hierarchy:"ประโยชน์หลัก > สินค้าหรือบริการ > หลักฐาน/เงื่อนไขจริง > CTA", layout:"Commercial hero composition จุดขายเด่นหนึ่งเรื่อง มีพื้นที่ราคาและเงื่อนไขเมื่อผู้ใช้ให้มา", guard:"ห้ามสร้างราคา ส่วนลด รีวิว ดาวเรตติ้ง หรือ scarcity ปลอม"},
      {match:/สรุป|รายงานผล|ลงพื้นที่|ภาพกิจกรรม|ขอบคุณ/, name:"สรุปกิจกรรม / รายงานผล", hierarchy:"เกิดอะไรขึ้น > ใครเกี่ยวข้อง > ผลลัพธ์จริง > ขอบคุณหรือขั้นตอนถัดไป", layout:"Photo-led report card ใช้ภาพจริงเป็นหลัก ข้อความสรุปสั้น และรักษาศักดิ์ศรีผู้ปรากฏในภาพ", guard:"ห้ามแต่งจำนวนผู้ร่วม ผลลัพธ์ คำพูด หรือบุคคลที่ไม่ได้อยู่ในข้อมูล"},
      {match:/พิธี|วันสำคัญ|ต้อนรับ|ยินดี|อวยพร|ไว้อาลัย/, name:"พิธีการ / วันสำคัญ", hierarchy:"ชื่อพิธีหรือบุคคล > โอกาสสำคัญ > หน่วยงาน/วันเวลาเท่าที่มี", layout:"Formal balanced composition จังหวะสงบ พื้นที่ว่างมาก และรายละเอียดตกแต่งเท่าที่จำเป็น", guard:"ห้ามใช้ถ้อยคำ ตำแหน่ง เครื่องหมาย หรือสัญลักษณ์พิธีการที่ไม่ได้ยืนยัน"}
    ], taskFallback, taskSource);

    return {org, task};
  };

  T.buildImageExpertPrompt = function(d = {}){
    const a = analyze(d, "image");
    const context = imageContextProfile(d);
    const hasRealPhotos = Number(d.photoCount || 0) > 0;
    const mode = clean(d.useMode, "สร้างภาพใหม่ด้วย AI");
    const identityRules = hasRealPhotos || mode !== "สร้างภาพใหม่ด้วย AI" ? `
=== ORIGINAL PHOTO PROTOCOL ===
- มีภาพต้นฉบับ ${Number(d.photoCount || 0)} ภาพ: ${clean(d.photoNames, "ผู้ใช้จะแนบใน AI ปลายทาง")}
- ใช้ภาพจริงเป็นแหล่งอ้างอิงหลัก คงใบหน้า อัตลักษณ์ รูปร่าง ชุด ฉาก และบุคคลเดิม
- ห้าม face swap, facial reconstruction, beauty filter ที่เปลี่ยนคน, เพิ่มคนใหม่ หรือลบสาระสำคัญ
- อนุญาตเฉพาะสิ่งที่ผู้ใช้เลือก เช่น ปรับแสง สี ความคมชัด ครอป และวางกราฟิกโดยไม่บังใบหน้า` : "";

    return `EXPERT MODE: CREATIVE DIRECTOR / THAI POSTER DIRECTOR

ภารกิจ
สร้างงานภาพที่ “เข้าใจสารใน 3 วินาที อ่านได้บนมือถือ และผลิตต่อได้จริง” ไม่ใช่แค่ภาพสวยทั่วไป
โหมดงาน: ${mode}
ประเภทเนื้อหา: ${clean(d.contentType, "ให้ AI วิเคราะห์เอง")}
ประเภทภาพ: ${clean(d.imageType || d.workContext, "ให้วิเคราะห์จากบรีฟ")}
ขนาดปลายทาง: ${clean(d.size, "4:5 Facebook / Line 1080x1350")}

=== SMART CONTEXT BLUEPRINT ===
- บริบทองค์กร: ${context.org.name}
- บุคลิกความน่าเชื่อถือ: ${context.org.trust}
- ภาษาภาพที่เหมาะ: ${context.org.visual}
- ชนิดงาน: ${context.task.name}
- ลำดับสารเฉพาะงาน: ${context.task.hierarchy}
- โครงสร้างที่แนะนำ: ${context.task.layout}
- ข้อควรระวังตามบริบท: ${context.org.guard}; ${context.task.guard}
- ถ้าค่าตัวเลือกขัดกับรายละเอียดจริง ให้ยึดรายละเอียดจริงและอธิบายการตัดสินใจสั้น ๆ ใน Creative Decision

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
7. เขียน Visual Prompt เป็นภาษาอังกฤษที่กระชับและเป็นภาษาการผลิตภาพ แต่แยกข้อความไทยที่ต้องสะกดตรงไว้ใน TEXT LOCK ห้ามแปลหรือดัดแปลง
8. ตรวจตัวสะกดไทย ชื่อเฉพาะ ความอ่านง่ายที่ขนาดหน้าจอมือถือ และความสอดคล้องกับบริบทองค์กร

ทิศทางที่ผู้ใช้เลือก:
- Visual Preset: ${clean(d.visualPreset || d.style || a.design.style, "ให้ AI เลือกตามงาน")}
- Style Modifier: ${clean(d.styleModifiers, "ไม่มี / ให้ AI เลือกเท่าที่เหมาะ")}
- Style: ${clean(d.style || d.visualPreset || a.design.style, "Modern Premium Clean")}
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
- เขียน Master Visual Prompt ภาษาอังกฤษฉบับเดียวที่พร้อมใช้ โดยระบุ subject, composition, environment, lighting, color, typography zone, hierarchy, aspect ratio และคุณภาพงาน
- เลือกศัพท์กล้อง/เลนส์เฉพาะเมื่อเป็นภาพถ่ายหรือ photorealistic และช่วยผลลัพธ์จริง ห้ามยัดศัพท์เทคนิคในงานกราฟิก
- ใส่ TEXT LOCK แยกต่างหาก: ข้อความไทยทุกบรรทัดตามลำดับชั้น พร้อมคำสั่ง render verbatim, no translation, no paraphrase
- ระบุ safe zone, ระยะขอบ, พื้นที่โลโก้/QR เฉพาะเมื่อมีไฟล์จริง และจุดที่สามารถครอปเป็น 1:1 / 4:5 / 9:16 ได้โดยไม่เสียสารหลัก

D. NEGATIVE PROMPT / DO-NOT LIST
- ระบุสิ่งที่ห้ามเกิดเฉพาะงานนี้ รวมถึงตัวอักษรเพี้ยน โลโก้ปลอม QR ปลอม ข้อมูลปลอม และใบหน้าเปลี่ยน

E. TEXT-SAFE FALLBACK
- ถ้าเครื่องมือปลายทางสร้างข้อความไทยไม่แม่น ให้สร้างภาพพื้นหลัง/องค์ประกอบโดยเว้น Text Zone ตาม Layout เดิม แล้วส่งข้อความไทยที่ต้องวางพร้อมตำแหน่ง ห้ามปล่อยภาพที่มีคำเพี้ยน

F. PROFESSIONAL HANDOFF
- ส่ง A–E เป็น Prompt มืออาชีพสำหรับตรวจ แก้ หรือใช้กับเครื่องมือปลายทาง
- ส่วนนี้ไม่ใช่คำสั่งเรียกเครื่องมือสร้างภาพ และห้ามอ้างว่าสร้างภาพหรือไฟล์สำเร็จ

${silentQualityGate([
  "สารหลักเข้าใจได้ภายใน 3 วินาที",
  "ข้อความไทยทุกคำสะกดถูกและไม่มีข้อความที่ AI แต่งเป็นข้อเท็จจริง",
  "Contrast และขนาดตัวอักษรเหมาะกับมือถือ",
  "ภาพจริงไม่ถูกเปลี่ยนอัตลักษณ์",
  "Prompt มีรายละเอียดการผลิตครบแต่ไม่ขัดกันเอง"
])}`;
  };

  T.buildImageExecutionPromptLegacy = function(d = {}){
    const a = analyze(d, "image");
    const context = imageContextProfile(d);
    const selectedStyle = clean(d.style || a.design.style, "AI PR Creative Director — เลือกแนวให้อัตโนมัติ");
    const routingSignals = [
      selectedStyle, d.layout, d.workContext, d.imageType, d.qualityLevel,
      d.mainCategory, d.subCategory, d.title, d.detail, d.tone
    ].filter(Boolean).join(" ");
    const thaiPrPosterMode = /Thai PR Premium|Thai PR Poster Premium|High-Impact Thai PR Poster|โปสเตอร์ประชาสัมพันธ์ไทยสีสด|ภาพแน่นข้อมูล/i.test(routingSignals);
    const respectfulMode = /ไว้อาลัย|ถวายความอาลัย|แสดงความอาลัย|ข่าวเศร้า|มรณ|สูญเสีย|ลดสี|สุภาพ.*อ่อนไหว|พิธีการ.*อ่อนไหว/i.test(routingSignals);
    const photoLedMode = Number(d.photoCount || 0) > 0 || /ภาพจริง|ต้นฉบับ|รีทัช|photoreal|cinematic photo/i.test([
      d.useMode,d.style,d.imageType,d.focus
    ].filter(Boolean).join(" "));
    const thaiPrPosterProfile = thaiPrPosterMode && !respectfulMode && !photoLedMode ? `
=== THAI PR PREMIUM PROFILE ===
- สร้างงานต้นฉบับใหม่ที่ได้ DNA จากโปสเตอร์ประชาสัมพันธ์ไทยคุณภาพสูง ห้ามคัดลอกองค์ประกอบ ตรา ตัวละคร หรือรูปแบบเฉพาะของผลงานอื่น
- วางลำดับภาพ 5 ชั้น: (1) identity zone ด้านบนสำหรับโลโก้จริง (2) announcement ribbon (3) hero headline ใหญ่ 2–4 บรรทัด (4) action/deadline band (5) information cards และ footer
- Hero headline ต้องเป็นจุดเด่นที่สุด ใช้ตัวอักษรไทยหนาแบบ dimensional 3D, bevel, ขอบขาวหนา, เงานุ่ม และ contrast สูง โดยคงข้อความจาก TEXT LOCK เท่านั้น
- ใช้การ์ดมุมมน แถบริบบิ้น ป้ายทรง capsule หมายเลขขั้นตอน และ icon/ภาพประกอบแบบ sticker 3D ที่เกี่ยวข้องกับเรื่องจริง ทำให้ข้อมูลแน่นแต่แยกกลุ่มอ่านง่าย
- อนุญาตให้ใช้ burst background, spotlight rays, speed accents และ layered zones เพื่อเร่งพลังงานของภาพได้ แต่ต้องคุม contrast และพื้นที่หายใจไม่ให้รกหรืออ่านยาก
- อนุญาตให้ใช้ cartoon mascot หรือ character helper ได้เฉพาะเมื่อบริบทเหมาะ เช่น งานชุมชน งานเด็ก รณรงค์ หรือกิจกรรมที่ต้องการความเป็นมิตร ห้ามใช้กับงานไว้อาลัย ข่าวเศร้า หรือประกาศทางการที่อ่อนไหว
- ใช้สีอิ่มสดแบบ premium campaign, highlight สีทอง, white breathing space, rim light, soft glow และเงาหลายระดับ เพื่อสร้างมิติ ห้ามใช้เอฟเฟกต์จนข้อความอ่านยาก
- โลโก้ ตราหน่วยงาน ภาพบุคคล QR Code และ barcode ใช้ได้เฉพาะไฟล์จริงที่ผู้ใช้แนบมา และต้องคงรูปเดิม ห้ามวาดเลียนแบบหรือสร้างใหม่
- หากไม่มีไฟล์จริง ให้ตัดองค์ประกอบนั้นออกและจัดสมดุล Layout ใหม่ ห้ามใส่โลโก้หรือ QR จำลอง ห้ามพิมพ์ placeholder บนภาพ
- ภาพต้องอ่านตามลำดับ: เรื่องอะไร > ต้องทำอะไร > เมื่อไร > วิธีดำเนินการ/ช่องทาง > เจ้าของเรื่อง โดยแสดงเฉพาะข้อมูลจริงที่มี
- ตรวจความอ่านง่ายที่ขนาดมือถือ: หัวข้อเด่นทันที ตัวหนังสือรองไม่เล็กเกินไป ระยะขอบปลอดภัย และไม่มีข้อความชนหรือถูกตัด` : "";
    const productionProfile = photoLedMode ? `
=== PHOTO-LED PR PRODUCTION PROFILE ===
- ใช้ภาพจริงที่แนบเป็น hero visual และคงอัตลักษณ์เดิม แต่ยกระดับด้วยกรอบ แถบหัวข้อ custom shapes และ typography hierarchy แบบงานประชาสัมพันธ์
- ห้ามเปลี่ยนภาพจริงให้เป็นการ์ตูนหรือสร้างบุคคลใหม่ ห้ามใช้เอฟเฟกต์บังใบหน้าและสาระสำคัญ
- แม้ใช้ภาพถ่าย ผลลัพธ์ต้องดูเป็น PR key visual ที่ออกแบบเฉพาะงาน ไม่ใช่แค่ภาพถ่ายแปะข้อความ` : respectfulMode ? `
=== RESPECTFUL EDITORIAL PR PROFILE ===
- ใช้ Art Direction สุภาพ สงบ ให้เกียรติ ลด saturation และเอฟเฟกต์สนุกทั้งหมด
- จัดองค์ประกอบแบบ editorial ที่มีพื้นที่ว่างมาก ลำดับตัวอักษรชัด และใช้รายละเอียดเชิงสัญลักษณ์อย่างสำรวมเท่าที่จำเป็น
- ห้าม mascot, burst, speed line, sticker สนุก, สีฉูดฉาด และตัวอักษร 3D หนาเกินบริบท
- ยังต้องเป็นงานออกแบบเฉพาะบรีฟ ไม่ใช่พื้นดำสำเร็จรูปแปะข้อความ และห้ามสร้างบุคคล ตรา วันที่ หรือข้อมูลที่ไม่มีจริง` : thaiPrPosterMode ? `
=== HIGH-PRODUCTION THAI PR PROFILE — EXPLICIT SELECTION ===
- ใช้โปสเตอร์ประชาสัมพันธ์ไทยคุณภาพสูงแบบหลายชั้นเมื่อผู้ใช้เลือก Thai PR Premium หรือบรีฟเป็นงานข้อมูลแน่นที่เหมาะจริง
- สร้าง 5 ชั้นอย่างมีหน้าที่: atmospheric background, hero visual, dimensional headline, supporting motifs และ information/footer zones
- ใช้ 3D typography, ribbon, badge, custom cards, mascot หรือ burst เฉพาะองค์ประกอบที่ช่วยสื่อสาร ห้ามใส่ครบทุกอย่างจนรก
- สีต้องเกิดจากบริบท ไม่บังคับม่วง–ทองทุกงาน และต้องอ่านง่ายบนมือถือ
- หากข้อมูลจริงมีน้อย ให้เพิ่มเฉพาะ visual storytelling, สี, แสง, texture และสัญลักษณ์ ห้ามเพิ่มบุคคล โลโก้ QR ตัวเลข หรือข้อเท็จจริง` : `
=== BALANCED CREATIVE PR PROFILE — SMART DEFAULT ===
- ค่าเริ่มต้นเป็นงานประชาสัมพันธ์ไทยร่วมสมัยที่ดูมืออาชีพ มีความครีเอทีฟระดับกลาง และพร้อมใช้จริง ไม่บังคับให้เป็นโปสเตอร์ 3D หรือภาพข้อมูลแน่น
- เลือก Big Idea หนึ่งแนวและ signature visual device หนึ่งอย่างที่สัมพันธ์กับบรีฟ เช่น visual metaphor, hero object, custom frame, ฉากเล่าเรื่อง หรือเส้นนำสายตา
- ใช้โครงสร้าง 3–4 ชั้นที่พอดี: contextual background, hero visual, strong headline และ supporting/footer zone ตามปริมาณข้อมูลจริง
- Typography ต้องมีบุคลิกและลำดับชัด แต่ใช้ bevel, extrusion, ขอบหนา หรือเงาหนักเฉพาะเมื่อช่วยอารมณ์งาน ไม่ใช้โดยอัตโนมัติ
- หลีกเลี่ยงทั้งสองขั้ว: ไม่ใช่ stock photo ใบเดียวแปะข้อความ และไม่ใช่โปสเตอร์แน่นด้วย ribbon, badge, mascot, burst และกล่องข้อมูลโดยไม่จำเป็น
- ใช้สี แสง รูปทรง และ texture เพื่อให้หยุดสายตาแบบพอดี โดยเลือก palette จากเนื้อหาและองค์กร ไม่ยึดม่วง–ทอง
- ถ้าข้อมูลน้อย ให้เพิ่มความน่าสนใจด้วยองค์ประกอบทางภาพและสัญลักษณ์เท่านั้น ห้ามแต่งข้อความ ตัวเลข บุคคล โลโก้ หรือข้อเท็จจริงใหม่`;
    const hasRealPhotos = Number(d.photoCount || 0) > 0;
    const mode = clean(d.useMode, "สร้างภาพใหม่ด้วย AI");
    const confirmedFacts = unique(a.facts);
    const missing = unique(a.missing);
    const forbidden = unique(a.forbidden.concat(
      meaningful(d.brainNoInvent) ? clean(d.brainNoInvent).split(/[,\n]/g) : []
    ));
    const textLock = unique(a.textOnImage);
    const attachmentHandoff = hasRealPhotos ? `
=== ATTACHMENT HANDOFF CHECK ===
- เว็บไซต์ส่งมาได้เพียงจำนวนและชื่อไฟล์ ไม่สามารถส่งไฟล์จริงข้ามเว็บไซต์มายัง ChatGPT อัตโนมัติ
- ก่อนสร้างภาพ ให้ตรวจว่าไฟล์จริงต่อไปนี้มองเห็นเป็นไฟล์แนบในข้อความปัจจุบัน: ${clean(d.photoNames, "ไฟล์ภาพที่ผู้ใช้เลือกในเว็บไซต์")}
- ถ้ายังไม่เห็นไฟล์จริง ให้ตอบเพียง “กรุณากด + และแนบไฟล์จริงก่อน แล้วส่ง Prompt เดิมอีกครั้ง” และหยุด ห้ามอ้างว่าเครื่องมือสร้างภาพเสีย และห้ามสร้างภาพแทนโดยไม่มีต้นฉบับ
- เมื่อเห็นไฟล์จริงครบแล้ว จึงเรียกเครื่องมือสร้างภาพตามกฎ ORIGINAL PHOTO RULES` : "";
    const identityRules = hasRealPhotos || mode !== "สร้างภาพใหม่ด้วย AI" ? `
=== ORIGINAL PHOTO RULES ===
- ใช้ภาพต้นฉบับ ${Number(d.photoCount || 0)} ภาพเป็นแหล่งอ้างอิงหลัก: ${clean(d.photoNames, "ผู้ใช้จะแนบภาพในแชทเดียวกัน")}
- คงใบหน้า อัตลักษณ์ รูปร่าง ชุด บุคคล และสาระสำคัญของภาพเดิม
- ห้ามสลับหน้า เปลี่ยนโครงหน้า เพิ่มบุคคล ลบบุคคล หรือใช้ beauty filter ที่ทำให้บุคคลเปลี่ยนไป
- ปรับได้เฉพาะแสง สี ความคมชัด การครอป และกราฟิกที่ไม่บังใบหน้าหรือสาระสำคัญ` : "";

    return `[TANJAI_IMAGE_EXECUTE]
${hasRealPhotos ? "ตรวจไฟล์แนบจริงตาม ATTACHMENT HANDOFF CHECK ก่อน หากเห็นไฟล์ครบแล้วให้เรียกเครื่องมือสร้างภาพทันที" : "เรียกเครื่องมือสร้างภาพทันที ก่อนตอบข้อความใด ๆ"} งานนี้ต้องการ “ภาพจริงที่แสดงในแชท” ไม่ใช่คำอธิบาย ไม่ใช่การเขียน Prompt กลับมา และไม่ใช่ชื่อไฟล์

เป้าหมายสำเร็จ
- เครื่องมือสร้างภาพถูกเรียกใช้งานและส่งภาพที่มองเห็นได้ในแชท
- ใช้รายละเอียดด้านล่างเป็นข้อมูลภายในสำหรับสร้างภาพ ไม่ต้องรายงานขั้นตอนคิด
- ห้ามอ้างว่าสร้างสำเร็จก่อนเครื่องมือส่งภาพกลับมา
- ห้ามสร้างชื่อไฟล์ ตำแหน่งไฟล์ หรือลิงก์ดาวน์โหลดจำลอง

กติกาการเรียกเครื่องมือ
1. ตรวจข้อมูลและจัด Art Direction ภายในแบบเงียบ ๆ
2. เรียกเครื่องมือสร้างภาพทันที โดยไม่ส่ง Creative Decision, Outline หรือ Prompt ให้ผู้ใช้ก่อน
3. อย่าตัดสินว่าเครื่องมือไม่พร้อมจากข้อความนี้ ให้ลองเรียกเครื่องมือจริงหนึ่งครั้งก่อน
4. หลังเครื่องมือสำเร็จ ให้แสดงภาพและตอบสั้นที่สุด
5. เฉพาะเมื่อเครื่องมือคืนข้อผิดพลาดจริง ให้แจ้งว่า “ไม่สามารถเรียกเครื่องมือสร้างภาพในแชทนี้ได้” แล้วส่ง Image Prompt แบบย่อ โดยห้ามสร้างชื่อไฟล์หรือลิงก์ขึ้นเอง

=== IMAGE GENERATION SPEC ===
- ภารกิจ: สร้างภาพที่เข้าใจสารภายใน 3 วินาที อ่านง่ายบนมือถือ และพร้อมใช้จริง
- โหมดงาน: ${mode}
- ประเภทภาพ: ${clean(d.imageType || d.workContext, context.task.name)}
- ขนาดปลายทาง: ${clean(d.size, "4:5 Facebook / LINE 1080x1350")}
- กลุ่มเป้าหมาย: ${clean(d.audience, "ผู้ชมทั่วไป")}
- บริบทองค์กร: ${context.org.name}
- ชนิดงาน: ${context.task.name}
- บุคลิกความน่าเชื่อถือ: ${context.org.trust}
- ภาษาภาพ: ${context.org.visual}
- ลำดับสาร: ${context.task.hierarchy}
- โครงสร้างภาพ: ${context.task.layout}
- Style: ${selectedStyle}
- Color: ${clean(d.colorTone || a.design.color, "เหมาะกับบริบท")}
- Layout: ${clean(d.layout || a.design.layout, "อ่านง่าย มีลำดับชัด")}
- Density: ${clean(d.density, "สมดุล อ่านง่าย")}
- Production quality: ${clean(d.qualityLevel, "Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้")}
- จุดเน้น: ${clean(d.brainFocus || d.focus, a.design.hierarchy?.[0] || d.title || "สารหลัก")}

=== PR CREATIVE ROUTER — DEFAULT FOR EVERY IMAGE ===
- ผลลัพธ์เริ่มต้นของทันใจต้องเป็นภาพประชาสัมพันธ์หรือ Key Visual ที่ออกแบบเสร็จพร้อมใช้ ไม่ใช่ภาพประกอบทั่วไปและไม่ใช่เทมเพลตเปล่า
- วิเคราะห์บรีฟแล้วเลือก Art Direction ที่เหมาะที่สุดเพียงหนึ่งตระกูลโดยอัตโนมัติ:
  1) Civic Announcement — ข่าว ประกาศ แจ้งเตือน: หัวข้อทรงพลัง contrast สูง ข้อมูลสำคัญอ่านเร็ว
  2) Community Invitation — กิจกรรม ชุมชน การศึกษา: สดใส อบอุ่น มีฉากเล่าเรื่องและภาพประกอบเป็นมิตร
  3) Service Infographic — ขั้นตอน ความรู้ สุขภาพ: editorial infographic การ์ดข้อมูลและลำดับสายตาชัด
  4) Social Campaign — โปรโมชัน ผลงาน เพลง คำคม รณรงค์: งานร่วมสมัยที่มี hero metaphor และ emotional hook โดยเพิ่มความหนาแน่นหรือมิติเท่าที่โจทย์ต้องการ
  5) Formal & Respectful — พิธีการ ไว้อาลัย เรื่องอ่อนไหว: สุภาพ สงบ ลดสี ใช้พื้นที่ว่างและ typography อย่างให้เกียรติ
- ห้ามผสมหลายตระกูลจนภาพไร้ทิศทาง และห้ามใช้ม่วง–ทองหรือ Layout เดิมกับทุกงาน ให้สี รูปทรง และระดับเอฟเฟกต์เกิดจากความหมายของบรีฟ
- ทุกภาพต้องมี signature visual device เฉพาะเรื่องหนึ่งอย่าง เช่น visual metaphor, ฉากจำลอง, วัตถุฮีโร่, เส้นนำสายตา หรือกรอบข้อมูลที่ออกแบบเฉพาะงาน
- จัดลำดับแบบ Headline-first: ผู้ชมต้องรู้ภายใน 3 วินาทีว่าเรื่องอะไร สำคัญอย่างไร และควรทำอะไรต่อ จากนั้นจึงอ่านรายละเอียดรอง
- ยกระดับงานด้วย typography hierarchy, layered depth เท่าที่จำเป็น, custom shapes, controlled lighting, purposeful illustration และ mobile-safe spacing โดยคงความเป็นงานประชาสัมพันธ์ไทยร่วมสมัย
- สร้างงานต้นฉบับใหม่ทุกครั้ง ห้ามเลียนแบบ Layout ตรา ตัวละคร หรือองค์ประกอบเฉพาะจากผลงานของผู้อื่น
${productionProfile}

=== CREATIVE DIRECTOR MODE ===
- ล็อกเฉพาะข้อเท็จจริง แต่เปิดอิสระเต็มที่ในการสร้างฉาก แสง สี มุมมอง อารมณ์ สไตล์ จังหวะภาพ และ Layout
- คิดภายในแบบเงียบ ๆ แล้วเลือก Big Idea ที่แรงที่สุดเพียงหนึ่งแนว พร้อม Visual Metaphor ที่สื่อสารเรื่องนี้โดยเฉพาะ ห้ามรายงานขั้นตอนคิดก่อนสร้างภาพ
- สร้างภาพให้มีจุดนำสายตาชัด ลำดับ foreground / midground / background มีมิติ ใช้ negative space อย่างตั้งใจ และครอปต่อเป็น 1:1 / 4:5 / 9:16 ได้โดยไม่เสียสารหลัก
- ใช้แสง สี contrast texture และ scale เพื่อสร้าง emotional hook ให้ภาพหยุดสายตา แต่ยังน่าเชื่อถือและอ่านง่ายบนมือถือ
- ระดับความกล้าทางครีเอทีฟ: ${clean(d.creativityLevel, "คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์")}
- สร้างรายละเอียดเชิงภาพที่ไม่ใช่ข้อเท็จจริงได้ เช่น วัสดุ พื้นผิว บรรยากาศ ลำแสง ฉากนามธรรม และองค์ประกอบเชิงสัญลักษณ์

=== ANTI-GENERIC QUALITY BAR ===
- ผลลัพธ์ต้องดูเหมือนงานที่ออกแบบเฉพาะบรีฟนี้ ไม่ใช่ stock photo หรือ template สำเร็จรูป
- หลีกเลี่ยงทุกอย่างอยู่กึ่งกลาง, icon grid, กล่องข้อความเรียงสูตร, gradient ตกแต่งไร้เหตุผล, วัตถุลอยสุ่ม, คนยิ้มแบบโฆษณาทั่วไป และองค์ประกอบมากเกินไป
- ใช้เรื่องเล่าทางภาพหนึ่งแกน มี focal point เดียว และ motif สนับสนุนไม่เกินสองอย่าง
- ความครีเอทีฟห้ามเปลี่ยนข้อเท็จจริง ใบหน้า อัตลักษณ์ โลโก้ ข้อความ หรือตัวเลขที่ยืนยันแล้ว
${thaiPrPosterProfile}

=== SOURCE OF TRUTH ===
ข้อมูลที่ยืนยันแล้ว:
${bullet(confirmedFacts, "- จากข้อมูลเบื้องต้น มีข้อมูลจริงจำกัด ให้ใช้เฉพาะสิ่งที่ผู้ใช้ให้มา")}

ข้อมูลที่ยังไม่ระบุ:
${bullet(missing, "- ไม่พบข้อมูลจำเป็นที่ขาดชัดเจน")}

กติกาข้อเท็จจริง:
- ห้ามเดาชื่อบุคคล ตำแหน่ง หน่วยงาน สถานที่ วันที่ เวลา ราคา ตัวเลข เบอร์โทร ลิงก์ โลโก้ และ QR Code
- ข้อมูลที่ยังไม่ระบุให้เว้นพื้นที่สะอาดไว้เติมภายหลัง ห้ามพิมพ์ข้อความ placeholder ลงบนภาพ
- สร้างสรรค์ฉาก แสง สี สไตล์ อารมณ์ และ Layout ได้เต็มที่ ตราบใดที่ไม่สร้างบุคคล โลโก้ ตัวเลข หรือข้อมูลจริงปลอม

=== TEXT LOCK ===
ข้อความไทยที่อนุญาตให้ปรากฏบนภาพ:
${bullet(textLock, "- ไม่มีข้อความบังคับ ให้สร้างภาพแบบ text-safe และเว้นพื้นที่สำหรับใส่ข้อความภายหลัง")}
- ถ้ามีข้อความ ให้สะกดตามนี้ทุกตัวอักษร ห้ามแปล ห้ามถอดความ และห้ามเพิ่มข้อความใหม่
- ถ้าเครื่องมือสร้างตัวอักษรไทยไม่แม่น ให้สร้างภาพแบบไม่มีข้อความ แต่คง Text Zone และพื้นที่ว่างตามลำดับสาร

=== DO-NOT LIST ===
${bullet(forbidden, "- ห้ามสร้างข้อมูลจริงที่ผู้ใช้ไม่ได้ให้มา")}
- ห้ามโลโก้ปลอม QR Code ปลอม ลายน้ำ ข้อความเพี้ยน ตัวอักษรเกิน ภาพเบลอ องค์ประกอบรก และรายละเอียดที่อ่านไม่ได้บนมือถือ
- ข้อควรระวังตามบริบท: ${context.org.guard}; ${context.task.guard}
${attachmentHandoff}
${identityRules}

STOP RULE: เรียกเครื่องมือสร้างภาพตอนนี้ และอย่าส่งคำอธิบายก่อนภาพ`;
  };

  /**
   * Compact execution prompt for Custom GPT / image tools.
   * Permanent policy and the full creative review stay in the Expert Prompt;
   * this handoff contains only the dynamic brief and one resolved direction.
   */
  T.buildImageExecutionPrompt = function(d = {}){
    const a = analyze(d, "image");
    const context = imageContextProfile(d);
    const mode = clean(d.useMode, "สร้างภาพใหม่ด้วย AI");
    const facts = unique(a.facts);
    const textLock = unique(a.textOnImage);
    const userAvoid = meaningful(d.brainNoInvent)
      ? clean(d.brainNoInvent).split(/[,\n]/g)
      : [];
    const forbidden = unique(a.forbidden.concat(userAvoid));
    const photoCount = Number(d.photoCount || 0);
    const hasWebsiteFiles = photoCount > 0;
    const selectedStyle = clean(d.visualPreset || d.style || a.design.style, "ให้ AI เลือกตามบริบท");
    const signals = [
      d.contentType, d.visualPreset, d.styleModifiers, d.workContext, d.imageType, d.qualityLevel, d.layout, selectedStyle,
      d.mainCategory, d.subCategory, d.title, d.detail, d.tone
    ].filter(Boolean).join(" ");
    const respectful = /ไว้อาลัย|ถวายความอาลัย|แสดงความอาลัย|ข่าวเศร้า|มรณ|สูญเสีย|ลดสี|พิธีการ.*อ่อนไหว/i.test(signals);
    const premium = !respectful && /Thai PR Premium|Thai PR Poster Premium|High-Impact Thai PR Poster|โปสเตอร์ประชาสัมพันธ์ไทยสีสด|ภาพแน่นข้อมูล/i.test(signals);
    const infographic = !respectful && /Infographic|อินโฟกราฟิก|ขั้นตอนบริการ|วิธีใช้งาน|FAQ|ให้ความรู้/i.test(signals);
    const music = !respectful && /เพลง|ปกเพลง|ผลงานสร้างสรรค์|ศิลปิน|Cover Art/i.test(signals);
    const cartoon2d = !respectful && /การ์ตูน 2D|2D Cartoon|Cartoon 2D/i.test(signals);
    const mascot3d = !respectful && /มาสคอต 3D|Mascot 3D|คาแรกเตอร์/i.test(signals);
    const fantasy = !respectful && /แฟนตาซี|Fantasy/i.test(signals);
    const cinematic = !respectful && /โปสเตอร์หนัง|Cinematic Poster|ภาพยนตร์/i.test(signals);
    const commercial = !respectful && /สินค้า|Commercial Product|บริการ/i.test(signals);
    const realPhotoPreset = !respectful && /ภาพจริงแนวข่าวประชาสัมพันธ์|Photo-real PR|ข่าวประชาสัมพันธ์/i.test(signals);
    const realPhotoMode = hasWebsiteFiles || mode !== "สร้างภาพใหม่ด้วย AI";

    let direction = [
      "Balanced Creative PR — งานประชาสัมพันธ์ร่วมสมัย มี Big Idea หนึ่งแนวและจุดนำสายตาเดียว",
      "ใช้โครงสร้าง 3–4 ชั้นพอดี อ่านง่ายบนมือถือ และเลือกสีจากเนื้อหาหรือแบรนด์",
      "ไม่ทำเป็น stock photo แปะข้อความ และไม่ยัด ribbon, badge, mascot หรือเอฟเฟกต์โดยไม่จำเป็น"
    ];
    if(realPhotoMode){
      direction = [
        "Photo-led PR key visual — ใช้ภาพจริงเป็น hero visual แล้วเสริมกรอบ แถบหัวข้อ และ typography hierarchy เท่าที่จำเป็น",
        "คงใบหน้า อัตลักษณ์ รูปร่าง ชุด บุคคล และสาระสำคัญของภาพเดิม ห้าม face swap หรือ facial reconstruction",
        "ปรับได้เฉพาะแสง สี ความคมชัด ครอป และกราฟิกที่ไม่บังใบหน้าหรือสารสำคัญ"
      ];
    }else if(respectful){
      direction = [
        "Respectful Editorial PR — สุภาพ สงบ ให้เกียรติ ใช้พื้นที่ว่างและลำดับตัวอักษรชัด",
        "ลด saturation และงด mascot, burst, speed line, sticker สนุก และเอฟเฟกต์ฉูดฉาด",
        "ใช้สัญลักษณ์อย่างสำรวมเฉพาะที่สัมพันธ์กับข้อมูลจริง"
      ];
    }else if(premium){
      direction = [
        "Thai PR Premium — โปสเตอร์ประชาสัมพันธ์หลายชั้นที่หัวข้อเด่น อ่านเร็ว และพร้อมใช้จริง",
        "จัด identity zone, hero visual, headline, supporting zone และ footer ตามปริมาณข้อมูลจริง",
        "ใช้ 3D typography, ribbon, badge, custom card, glow หรือ burst เฉพาะสิ่งที่ช่วยสื่อสาร ห้ามใส่ครบจนรก"
      ];
    }else if(infographic){
      direction = [
        "Service Infographic — แบ่งข้อมูลเป็นกลุ่มและลำดับขั้นชัดเจน ใช้การ์ดหรือไอคอนเท่าที่ช่วยความเข้าใจ",
        "หัวข้อหลักเด่นที่สุด รายละเอียดรองอ่านได้บนมือถือ และไม่ทำข้อมูลแน่นจนหายใจไม่ออก",
        "ตัวเลข ขั้นตอน และสัญลักษณ์ต้องมาจากข้อมูลจริงเท่านั้น"
      ];
    }else if(music){
      direction = [
        "Music Campaign / Cover Art — ใช้อารมณ์เพลง ชื่อเพลง และภาพฮีโร่เป็นแกนหลัก",
        "สร้าง layered depth, controlled lighting และ signature visual ที่สัมพันธ์กับเพลง โดยไม่ยัดข้อมูลแบบอินโฟกราฟิก",
        "องค์ประกอบดนตรีเป็นภาพเชิงสร้างสรรค์ได้ แต่ห้ามสร้างชื่อศิลปิน โลโก้ รางวัล ยอดวิว หรือตัวเลขขึ้นเอง"
      ];
    }else if(cartoon2d){
      direction = [
        "2D Cartoon Poster — ภาพการ์ตูนอ่านง่าย สีชัด ตัวละคร/ฉากช่วยเล่าเรื่อง แต่ไม่ทำให้ข้อมูลจริงเพี้ยน",
        "ใช้เส้น รูปทรง และ expression ที่เป็นมิตร เหมาะกับเด็ก ชุมชน คอนเทนต์เบา หรือสื่อโซเชียล",
        "ข้อความไทยต้องยังเป็นพระเอกเมื่อเป็นงานประกาศหรือประชาสัมพันธ์"
      ];
    }else if(mascot3d){
      direction = [
        "3D Mascot / Character Key Visual — ใช้มาสคอตหรือคาแรกเตอร์เป็นผู้ช่วยเล่าเรื่องอย่างเป็นมิตร",
        "มาสคอตต้องไม่แย่งสารหลัก และห้ามเลียนแบบตัวละครมีลิขสิทธิ์หรือโลโก้จริงที่ผู้ใช้ไม่ได้ให้มา",
        "เหมาะกับแคมเปญ ชุมชน เด็ก ครอบครัว และแบรนด์ที่ต้องการความจำง่าย"
      ];
    }else if(fantasy){
      direction = [
        "Fantasy Visual — ใช้โลกจินตนาการ แสง สี และฉากเหนือจริงเพื่อสร้างอารมณ์ แต่ยังยึดหัวข้อจริง",
        "ห้ามเติมข้อเท็จจริงใหม่ เช่น วันเวลา สถานที่ รางวัล หรือบุคคลจริง",
        "เหมาะกับภาพคอนเซ็ปต์ เพลง ครีเอเตอร์ แคมเปญสร้างแรงบันดาลใจ และภาพศิลป์"
      ];
    }else if(cinematic){
      direction = [
        "Cinematic / Movie Poster — แสงภาพยนตร์ mood ชัด focal point เดียว typography แข็งแรงเหมือน key art",
        "ใช้ visual tension, dramatic lighting และ composition แบบโปสเตอร์หนัง โดยไม่ใส่เครดิตปลอมหรือข้อความเกินจริง",
        "เหมาะกับคลิปโปรโมท เพลง เปิดตัวงาน แคมเปญ หรือภาพที่ต้องการหยุดสายตา"
      ];
    }else if(commercial){
      direction = [
        "Commercial Product Visual — สินค้าหรือบริการเป็น hero ชัด มี value proposition และพื้นที่ CTA",
        "ใช้แสงสะอาด เงาสวย พื้นที่หายใจ และองค์ประกอบที่ขายของโดยไม่สร้างราคา โปรโมชัน หรือรีวิวปลอม",
        "เหมาะกับร้านค้า สินค้าชุมชน อาหาร OTOP และบริการท้องถิ่น"
      ];
    }else if(realPhotoPreset){
      direction = [
        "Photo-real PR / News Visual — ดูเหมือนงานข่าวประชาสัมพันธ์จริง สะอาด น่าเชื่อถือ และไม่แฟนตาซีเกิน",
        "ใช้ภาพจริงหรือฉากสมจริงเป็นแกนหลัก เสริมกรอบและตัวอักษรเท่าที่จำเป็น",
        "เหมาะกับหน่วยงาน งานลงพื้นที่ รายงานผล และข่าวสารที่ต้องการความน่าเชื่อถือ"
      ];
    }

    const attachmentLines = [
      "ถ้ามีภาพแนบในข้อความนี้ ให้ตรวจและวิเคราะห์หน้าที่ของแต่ละภาพเองอัตโนมัติ: โลโก้/ตราใช้เป็น identity asset; ภาพบุคคลหรือกิจกรรมใช้เป็น hero/reference",
      "ใช้เฉพาะไฟล์ที่มองเห็นจริงในแชท โลโก้ห้ามวาดใหม่ และภาพบุคคลต้องคงอัตลักษณ์เดิม",
      "ถ้าไม่มีภาพแนบ ให้ทำงานต่อจากข้อความได้ทันที โดยตัดโลโก้หรือบุคคลจริงที่ไม่มีต้นฉบับออกและจัด Layout ใหม่ ห้ามสร้างของปลอม"
    ];
    if(hasWebsiteFiles){
      attachmentLines.unshift(`เว็บไซต์ระบุภาพอ้างอิง ${photoCount} ไฟล์: ${clean(d.photoNames, "ไม่ระบุชื่อไฟล์")} — ใช้ได้เมื่อผู้ใช้แนบไฟล์จริงในแชทนี้แล้ว`);
    }

    const compactAvoid = forbidden.length
      ? forbidden.join(", ")
      : "ข้อมูลจริงที่ผู้ใช้ไม่ได้ให้มา";

    return `[TANJAI_IMAGE_EXECUTE]
เรียกเครื่องมือสร้างภาพทันทีและแสดงภาพจริงในแชท ไม่ต้องอธิบายขั้นตอน ไม่ต้องเขียน Prompt กลับมาก่อนภาพ

งาน
- ภารกิจ: สร้างภาพที่เข้าใจสารใน 3 วินาที อ่านง่ายบนมือถือ และพร้อมใช้จริง
- โหมด: ${mode}
- ประเภทเนื้อหา: ${clean(d.contentType, "ให้ AI วิเคราะห์เอง")}
- ประเภทภาพ: ${clean(d.imageType || d.workContext, context.task.name)}
- ขนาด: ${clean(d.size, "4:5 Facebook / LINE 1080x1350")}
- องค์กร/แบรนด์: ${clean(d.orgName, "ไม่ระบุ")}
- กลุ่มเป้าหมาย: ${clean(d.audience, "ให้ AI วิเคราะห์จากรายละเอียด")}
- จุดเน้น: ${clean(d.brainFocus || d.focus, a.design.hierarchy?.[0] || d.title || "สารหลัก")}

ข้อมูลจริงที่ใช้ได้
${bullet(facts, "- จากข้อมูลเบื้องต้น ให้ใช้เฉพาะข้อความที่ผู้ใช้ระบุ")}

ทิศทางภาพที่เลือกแล้ว
${bullet(direction)}
- Visual Preset: ${clean(d.visualPreset || selectedStyle, "ให้ AI เลือกตามงาน")}
- Style Modifier: ${clean(d.styleModifiers, "ไม่มี / ให้ AI เลือกเท่าที่เหมาะ")}
- Style: ${selectedStyle}
- Color: ${clean(d.colorTone || a.design.color, "ให้ AI เลือกตามอารมณ์และบริบท")}
- Layout: ${clean(d.layout || a.design.layout, "ให้ AI เลือก Layout ที่เหมาะที่สุด")}
- Density: ${clean(d.density, "สมดุล อ่านง่าย")}
- Creative level: ${clean(d.creativityLevel, "คิดสร้างสรรค์ระดับกลาง มี Big Idea แต่ไม่เว่อร์")}

ไฟล์แนบ — ไม่บังคับ
${bullet(attachmentLines)}

TEXT LOCK — ใส่เฉพาะข้อความเหล่านี้เท่านั้น
${bullet(textLock, "- ไม่มีข้อความบังคับ ให้สร้างภาพแบบ text-safe โดยไม่ใส่ข้อความเพิ่ม")}
- คำอย่าง “แนวภาพ”, “Visual Preset”, “โปสเตอร์หนัง”, “แฟนตาซี”, “3D Premium”, “Infographic” เป็นคำสั่งด้านสไตล์เท่านั้น ห้ามพิมพ์เป็นข้อความบนภาพ
- สะกดตามต้นฉบับทุกตัวอักษร ห้ามแปล ถอดความ หรือเพิ่มข้อความใหม่
- ถ้าตัวอักษรไทยไม่แม่น ให้ลดข้อความรองและรักษาหัวข้อหลัก ห้ามปล่อยคำเพี้ยนโดยตั้งใจ

คุณภาพระดับงานพิมพ์ — บังคับทุกภาพ
- สร้างที่ความละเอียดสูงสุดที่เครื่องมือรองรับ ภาพต้องคมชัดระดับนำไปขยายพิมพ์ต่อได้ (ป้ายไวนิล โปสเตอร์ สื่อสิ่งพิมพ์)
- เส้นขอบทุกองค์ประกอบคมกริบ ตัวอักษรขอบชัดไม่ฟุ้ง รูปทรงกราฟิกเรียบแบบ vector-style ที่ขยายแล้วไม่แตก
- หลีกเลี่ยง noise, grain, ลายเนื้อละเอียดยิบ และเอฟเฟกต์เบลอฟุ้ง ๆ ที่จะแตกเป็นเม็ดเมื่อขยายใหญ่
- ตัวหนังสือและองค์ประกอบสำคัญขนาดใหญ่พอ อ่านชัดแม้ย่อเหลือ 10% หรือขยายเป็นป้ายขนาดจริง
- คุม contrast ระหว่างตัวอักษรกับพื้นหลังให้สูง เผื่อการพิมพ์จริงที่สีจางกว่าหน้าจอ

ข้อห้ามและการตรวจสุดท้าย
- ห้ามแต่งชื่อบุคคล หน่วยงาน สถานที่ วันที่ เวลา ราคา ตัวเลข เบอร์โทร ลิงก์ โลโก้ QR Code หรือข้อเท็จจริงใหม่
- ข้อห้ามเฉพาะงาน: ${compactAvoid}
- สร้างสรรค์ฉาก แสง สี อารมณ์ สไตล์ และ Layout ได้เต็มที่โดยไม่เปลี่ยนข้อเท็จจริงหรืออัตลักษณ์
- ถ้าไม่มี CTA หรือข้อมูลรอง ห้ามสร้างกล่อง/แถบว่างและห้ามพิมพ์ placeholder ให้ใช้พื้นที่เป็น breathing space แทน
- ตรวจคำไทย ใบหน้า โลโก้ ความอ่านง่าย และระยะขอบก่อนส่งภาพ`;
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
    return `EXPERT MODE: THAI PR COPYWRITER & CONTENT STRATEGIST

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
    const format = clean(extra.format || d.format, "คลิปประชาสัมพันธ์");
    const platform = clean(extra.channel || d.channel, "Facebook / TikTok / Reels");
    const aspectRatio = clean(extra.aspectRatio || d.aspectRatio, "ให้ AI เลือกตามช่องทาง");
    const videoStyle = clean(extra.videoStyle || d.videoStyle || d.style, "ให้ AI เลือกตามงาน");
    const outputPack = clean(extra.outputPack || d.outputPack, "Production Pack ครบชุด");
    return `EXPERT MODE: SHORT-FORM VIDEO CREATIVE DIRECTOR & EDITOR

ภารกิจ
ออกแบบคลิปที่ถ่ายทำ/ตัดต่อได้จริง ภายใน ${length} โดยทุกซีนมีหน้าที่และเวลารวมต้องพอดีกับความยาวเป้าหมาย

${truthContract(d, "video", [
  line("รูปแบบคลิป", format),
  line("แพลตฟอร์ม", platform),
  line("สัดส่วนภาพ", aspectRatio),
  line("สไตล์วิดีโอ", videoStyle),
  line("ชุดผลลัพธ์", outputPack),
  line("CTA", d.expertCTA || d.brainGoal),
  line("วัตถุดิบภาพที่มี", d.expertAssets),
  line("เนื้อเพลง/บทพูด/ข้อความอ้างอิง", d.expertLyrics),
  line("จังหวะคลิป", d.expertPace),
  line("สารที่ต้องจำ", d.brainFocus),
  line("รายละเอียดเพิ่มเติม", d.extra)
])}

=== VIDEO WORKFLOW ===
1. สร้าง Core Message หนึ่งประโยคและ Viewer Promise หนึ่งประโยค
2. เลือก Hook ที่หยุดคนดูได้โดยไม่ clickbait หรือกล่าวเกินจริง
3. วาง Story Arc ให้เหมาะกับรูปแบบงาน: MV/Lyric เน้นจังหวะเพลง, นิทานเด็กเน้นช่วงเล่าเรื่อง, โฆษณาเน้นปัญหา-คุณค่า-CTA, สารคดีเน้นหลักฐานและภาพจริง
4. แบ่งซีนตามความยาว ${seconds} วินาที และตรวจให้ผลรวมเวลาทุกซีนเท่ากับ ${seconds} วินาที
5. แต่ละซีนต้องระบุ Visual, Shot/Movement, Voice Over, On-screen Text, Audio และ Transition
6. สำหรับ Lyric Video ให้แบ่งเนื้อเพลงเป็นบรรทัดอ่านทัน พร้อมจุดเข้าคำและ safe area ภาษาไทย
7. สำหรับ AI Video ให้เขียน Short Prompt รายช็อต ความยาวไม่เกิน 650 ตัวอักษรต่อช็อต เพื่อเอาไปวางทีละช็อต
8. แยก CapCut Voice/Lyric Clean Script ออกจาก Storyboard โดยห้ามมี timecode, SCENE, bullet, slash, prompt, transition หรือคำกำกับภาพ
9. ถ้าไม่มีภาพตามแผน ให้เสนอ B-roll ทางเลือกที่ไม่สร้างบุคคล/เหตุการณ์จริงปลอม

ค่ากำกับ:
- Format: ${format}
- Platform: ${platform}
- Aspect Ratio: ${aspectRatio}
- Style: ${videoStyle}
- Output Pack: ${outputPack}
- Pace: ${clean(d.expertPace, "กระชับ มีจังหวะหายใจ")}
- Tone: ${clean(d.tone, "สุภาพ ทันสมัย น่าเชื่อถือ")}

=== OUTPUT CONTRACT ===
A. Project Setup: format, platform, aspect ratio, tone, production goal
B. Core Message + Viewer Promise
C. Hook 3 แบบ พร้อมเหตุผลสั้น ๆ แล้วเลือก 1 แบบที่แนะนำ
D. Storyboard Table คอลัมน์: Timecode | Duration | Visual/Shot | Voice Over | On-screen Text | Audio/SFX | Transition | AI Video Prompt
E. Short Prompt รายช็อต โดยครอบด้วย [SHORT_SHOT_PROMPTS] และ [/SHORT_SHOT_PROMPTS] เท่านั้นในส่วนนั้น
F. CapCut Voice/Lyric Clean Script โดยครอบด้วย [CAPCUT_VOICE_SCRIPT] และ [/CAPCUT_VOICE_SCRIPT] เท่านั้นในส่วนนั้น
G. Shot List แยก Must-have / Nice-to-have / B-roll สำรอง
H. Editing Notes: subtitle, safe area, rhythm, color mood, transition, caption style
I. AI Video Prompt Pack รายช็อตแบบละเอียด สำหรับนำไปใช้กับเครื่องมือสร้างวิดีโอ
J. Fact/Asset Checklist ก่อนผลิต

ข้อกำชับของบล็อกคัดลอก:
- ใน [SHORT_SHOT_PROMPTS] ให้ใส่เฉพาะ Prompt สั้นรายช็อต รูปแบบ SHOT 01, SHOT 02, ... ห้ามใส่ Storyboard ทั้งก้อน
- Prompt สั้นแต่ละช็อตต้องไม่เกิน 650 ตัวอักษร และห้ามสั่งให้สร้างตัวหนังสือ โลโก้ QR Code เบอร์โทร หรือข้อมูลจริงปลอม
- ใน [CAPCUT_VOICE_SCRIPT] ให้ใส่เฉพาะคำพูด/เนื้อเพลงที่ให้เสียงหรือซับใช้จริง ประโยคสั้น อ่านง่าย ไม่มีคำเทคนิค
- แปลงคำอังกฤษสำคัญให้อ่านไทย เช่น AI=เอไอ, MV=เอ็มวี, TikTok=ติ๊กต็อก, Reels=รีลส์, YouTube=ยูทูบ, CapCut=แคปคัต, QR Code=คิวอาร์โค้ด

${silentQualityGate([
  `เวลารวมทุกซีนเท่ากับ ${seconds} วินาที`,
  "ภาพ เสียง และข้อความบนจอของแต่ละซีนสื่อสารเรื่องเดียวกัน",
  "Hook ดึงดูดแต่ไม่กล่าวเกินจริง",
  "ข้อความบนจอและเนื้อเพลงอ่านทันในสัดส่วนภาพที่เลือก",
  "Short Prompt รายช็อตไม่เกิน 650 ตัวอักษรต่อช็อต",
  "CapCut Voice Script ไม่มี timecode หรือคำกำกับภาพ",
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
  T.imagePrompt = (d = {}) => T.buildImageExecutionPrompt(d);
  T.postPrompt = (d = {}) => T.buildPostExpertPrompt(d);
  T.mcPrompt = (d = {}) => T.buildMCExpertPrompt(d);
  T.videoPrompt = (d = {}, extra = {}) => T.buildVideoExpertPrompt(d, extra);
  T.voicePrompt = (d = {}, extra = {}) => T.buildVoiceExpertPrompt(d, extra);
  T.deckPrompt = (d = {}, extra = {}) => T.buildDeckExpertPrompt(d, extra);
  T.promptPack = (d = {}) => T.buildKitExpertPrompt(d);
  T.discussPrompt = (tool, d = {}) => T.buildExpertReviewPrompt(tool, d);
  T.executionPrompt = function(tool, d = {}, extra = {}){
    if(tool === "image") return T.buildImageExecutionPrompt(d);
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
    d.expertLyrics = field("expertLyrics");
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

  // Quick Mode: one essential brief, one specialist choice, then generate.
  // Detailed controls remain available in a single native <details> panel.
  const optionHtml = values => (values || []).map(value => `<option>${value}</option>`).join("");
  const quickLabels = {
    image:{title:"หัวข้อ / ข้อความหลักบนภาพ", detail:"รายละเอียดจริงที่ต้องอยู่ในภาพ"},
    post:{title:"หัวข้อเรื่อง / ประเด็นที่จะเรียบเรียง", detail:"วางข้อมูลดิบที่ต้องการให้เรียบเรียงเป็นภาษาไทยพร้อมใช้"},
    mc:{title:"ชื่องาน / พิธี", detail:"บอกบริบท ลำดับงาน และข้อมูลจริงของพิธี"},
    video:{title:"หัวข้อคลิป / สารหลักของวิดีโอ", detail:"เล่าเนื้อหา วัตถุดิบภาพ และสารหลักของคลิป"},
    voice:{title:"หัวข้อเสียงพากย์ / สารหลัก", detail:"วางข้อมูลที่จะนำไปเขียนเป็นเสียงพากย์"},
    deck:{title:"หัวข้อนำเสนอ", detail:"วางข้อมูลและประเด็นที่จะนำเสนอ"},
    kit:{title:"หัวข้อแคมเปญ", detail:"วางข้อมูลจริงชุดเดียวสำหรับแตกเป็นหลายสื่อ"}
  };
  const quickSpecialistFields = {
    post:`
      <label>อ่านจบแล้วอยากให้คนทำอะไร<input id="post-expertAction" placeholder="รับทราบ / สมัคร / เข้าร่วม / ติดต่อ"></label>
      <label>หนึ่งประโยคที่คนต้องจำ<input id="post-expertKeyMessage" placeholder="สารหลักที่ห้ามหลุดประเด็น"></label>`,
    mc:`
      <label class="full">ลำดับพิธีจริง<textarea id="mc-expertAgenda" placeholder="เรียงช่วงตามกำหนดการจริง"></textarea></label>`,
    video:`
      <label>CTA ตอนจบ<input id="video-expertCTA" placeholder="อยากให้คนดูทำอะไรต่อ"></label>
      <label class="full">ภาพหรือวัตถุดิบที่มี<textarea id="video-expertAssets" placeholder="เช่น ภาพลงพื้นที่ คลิปสัมภาษณ์ โลโก้จริง"></textarea></label>
      <label class="full">เนื้อเพลง / บทพูด / ข้อความอ้างอิง<textarea id="video-expertLyrics" placeholder="ใช้กับ MV, Lyric Video, นิทาน, หนังสั้น หรือสคริปต์ที่มีข้อความเฉพาะ"></textarea></label>`,
    voice:`
      <label>อารมณ์การส่งเสียง<input id="voice-expertDelivery" placeholder="เช่น อบอุ่น จริงใจ / เร่งด่วนแต่ชัดเจน"></label>`,
    deck:`
      <label>ต้องการให้ผู้ฟังตัดสินใจอะไร<input id="deck-expertGoal" placeholder="อนุมัติ / รับทราบ / เห็นชอบ"></label>
      <label class="full">ข้อมูล ตัวเลข หรือหลักฐานที่มี<textarea id="deck-expertEvidence" placeholder="ระบุเฉพาะข้อมูลจริง"></textarea></label>`,
    kit:`
      <label>Core Message<input id="kit-expertCoreMessage" placeholder="หนึ่งประโยคที่ทุกสื่อต้องพูดตรงกัน"></label>
      <label>Campaign CTA<input id="kit-expertCTA" placeholder="อยากให้ผู้ชมทำอะไรต่อ"></label>`
  };
  const quickAdvancedFields = {
    mc:`
      <label>คำเรียกผู้ร่วมงาน<input id="mc-expertAddress" placeholder="ท่านประธาน / แขกผู้มีเกียรติ"></label>
      <label>คำอ่านชื่อเฉพาะ<input id="mc-expertPronunciation" placeholder="ชื่อ — คำอ่าน"></label>`,
    video:`<label>จังหวะคลิป<input id="video-expertPace" placeholder="เร็ว กระชับ / อบอุ่น / สารคดีสั้น"></label>`,
    voice:`
      <label>ความเร็วและจังหวะ<input id="voice-expertPace" placeholder="ช้า ชัด / ธรรมชาติ / กระชับ"></label>
      <label>คำอ่านชื่อเฉพาะ<input id="voice-expertPronunciation" placeholder="ชื่อ — คำอ่าน"></label>`,
    deck:`<label>ทิศทางภาพ<input id="deck-expertVisual" placeholder="Executive clean / ภาพจริง / data-driven"></label>`,
    kit:`<label class="full">Campaign Tone<input id="kit-expertCampaignTone" placeholder="ทางการแต่เข้าถึงง่าย / อบอุ่น / พรีเมียม"></label>`
  };

  T.field = function(prefix){
    const labels = quickLabels[prefix] || quickLabels.post;
    const audiences = T.categories?.audiences || ["ประชาชนทั่วไป"];
    const tones = T.categories?.tones || ["สุภาพ อ่านง่าย"];
    return `
      <div class="quick-mode-banner" role="note">
        <b>โหมดเร็ว</b>
        <span>กรอกหัวข้อ + รายละเอียด แล้วกดสร้างได้เลย ที่เหลือระบบเลือกค่าเหมาะสมให้</span>
      </div>
      <div class="form-section quick-brief-section" data-quick-step="1">
        <div class="section-title"><b>1</b><h4>บอกงานให้ชัด</h4></div>
        <div class="form-grid">
          <label>${labels.title}<input id="${prefix}-title" placeholder="${labels.title}"></label>
          <label>ชื่อองค์กร / แบรนด์<input id="${prefix}-orgName" placeholder="ไม่ใส่ก็ได้"></label>
          <label class="full">${labels.detail}<textarea id="${prefix}-detail" placeholder="ใส่ข้อมูลจริงเท่าที่มี ระบบจะไม่แต่งข้อมูลสำคัญเพิ่ม"></textarea></label>
          ${quickSpecialistFields[prefix] || ""}
        </div>
        <details class="quick-advanced">
          <summary><span>ปรับละเอียด</span><small>ไม่บังคับ</small></summary>
          <div class="quick-advanced-body">
            <div class="form-grid quick-advanced-grid">
              <label>กลุ่มเป้าหมาย<select id="${prefix}-audience">${optionHtml(audiences)}</select></label>
              <label>โทนภาษา<select id="${prefix}-tone">${optionHtml(tones)}</select></label>
              <label>วัน / เวลา<input id="${prefix}-dateTime" placeholder="ถ้ามี"></label>
              <label>สถานที่<input id="${prefix}-place" placeholder="ถ้ามี"></label>
              <label class="full">บุคคล / หน่วยงานที่เกี่ยวข้อง<input id="${prefix}-people" placeholder="ถ้ามี"></label>
              <label>เป้าหมายผลลัพธ์<input id="${prefix}-brainGoal" placeholder="อยากให้ผลงานทำหน้าที่อะไร"></label>
              <label>เน้นเด่นที่สุด<input id="${prefix}-brainFocus" placeholder="สารที่ห้ามหลุด"></label>
              ${quickAdvancedFields[prefix] || ""}
              <label class="full">ข้อมูลที่ห้าม AI แต่งเพิ่ม<input id="${prefix}-brainNoInvent" value="วันที่, เวลา, สถานที่, ตัวเลข, เบอร์ติดต่อ, QR Code, โลโก้"></label>
              <input id="${prefix}-brainEnabled" type="checkbox" checked hidden>
            </div>
          </div>
        </details>
      </div>`;
  };

  const ensureAdvanced = (form, label="ปรับละเอียด") => {
    let details = form.querySelector(":scope > .quick-advanced, .quick-brief-section > .quick-advanced");
    if(details) return details;
    details = document.createElement("details");
    details.className = "quick-advanced standalone-advanced";
    details.innerHTML = `<summary><span>${label}</span><small>ไม่บังคับ</small></summary><div class="quick-advanced-body"><div class="form-grid quick-advanced-grid"></div></div>`;
    form.insertBefore(details, form.querySelector(":scope > .button-row"));
    return details;
  };

  const moveLabels = (form, ids) => {
    const details = ensureAdvanced(form);
    const grid = details.querySelector(".quick-advanced-grid");
    ids.forEach(id => {
      const label = document.getElementById(id)?.closest("label");
      if(label && !details.contains(label)) grid.appendChild(label);
    });
  };

  const promoteLabels = (form, ids) => {
    const grid = form.querySelector(":scope > .quick-brief-section > .form-grid");
    if(!grid) return;
    ids.forEach(id => {
      const label = document.getElementById(id)?.closest("label");
      if(label && !grid.contains(label)) grid.appendChild(label);
    });
  };

  const moveSections = (form, titlePatterns) => {
    const details = ensureAdvanced(form);
    const body = details.querySelector(".quick-advanced-body");
    Array.from(form.querySelectorAll(":scope > .form-section")).forEach(section => {
      const title = section.querySelector(".section-title h4")?.textContent || "";
      if(titlePatterns.some(pattern => pattern.test(title))) body.appendChild(section);
    });
  };

  const renameSection = (form, title) => {
    const heading = form.querySelector(":scope > .form-section:not(.quick-brief-section) .section-title h4");
    if(heading) heading.textContent = title;
  };

  const renumberVisible = form => {
    let number = 1;
    Array.from(form.querySelectorAll(":scope > .form-section")).forEach(section => {
      if(section.hidden || section.closest("details")) return;
      const badge = section.querySelector(":scope > .section-title b");
      if(badge) badge.textContent = String(number++);
    });
  };

  T.simplifyExpertForms = function(){
    const image = document.getElementById("imageForm");
    if(image){
      promoteLabels(image,["image-orgType","image-mainCategory"]);
      moveLabels(image,["image-qualityLevel","image-creativityLevel"]);
      moveSections(image,[/โหมดการใช้ภาพ/,/การปกป้องภาพจริง/,/ประเภทงานและช่องทาง/,/แนวภาพและความสวย/]);
      renumberVisible(image);
    }

    const post = document.getElementById("postForm");
    if(post){
      moveLabels(post,["post-workType","post-length","post-mainCategory","post-photos"]);
      renameSection(post,"เลือกผลลัพธ์งานเขียน");
      renumberVisible(post);
    }

    const mc = document.getElementById("mcForm");
    if(mc){
      moveLabels(mc,["mc-workType","mc-length","mc-style","mc-photos"]);
      renameSection(mc,"เลือกชิ้นงานพิธีกร");
      renumberVisible(mc);
    }

    const video = document.getElementById("videoForm");
    if(video){
      moveLabels(video,["video-channel","video-mainCategory"]);
      renameSection(video,"เลือกความยาวและรูปแบบคลิป");
      renumberVisible(video);
    }

    const voice = document.getElementById("voiceForm");
    if(voice){
      moveLabels(voice,["voice-channel","voice-mainCategory"]);
      renameSection(voice,"เลือกความยาวและสไตล์เสียง");
      renumberVisible(voice);
    }

    const deck = document.getElementById("deckForm");
    if(deck){
      moveLabels(deck,["deck-mainCategory"]);
      renameSection(deck,"เลือกจำนวนและรูปแบบสไลด์");
      renumberVisible(deck);
    }

    const kit = document.getElementById("kitForm");
    if(kit){
      moveSections(kit,[/Campaign Director|ผู้กำกับชุดสื่อ/]);
      renumberVisible(kit);
    }

    const album = document.getElementById("albumForm");
    if(album){
      // v9.9: ไม่ย้ายช่องอัตโนมัติแล้ว — ฟอร์มอัลบั้มจัดกลุ่ม "ปรับละเอียด" เองใน app.js
      // (ข้อ 2 = เนื้อหางาน, ข้อ 3 = หน้าตาชุดภาพ)
      const banner = document.createElement("div");
      banner.className = "quick-mode-banner";
      banner.innerHTML = "<b>โหมดเร็ว</b><span>ใส่ภาพหลัก + ภาพรอง + หัวข้องาน แล้วสร้างชุดภาพได้เลย</span>";
      album.prepend(banner);
    }
  };
})();

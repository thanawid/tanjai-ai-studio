window.TANJAI = window.TANJAI || {};

/**
 * ===================================================
 * TANJAI AI Studio v9.1.6 — Professional Brief-to-Prompt Output
 * ===================================================
 * Purpose:
 * - Make the copy-ready output cleaner, stricter, and truly usable in ChatGPT/GPT tools.
 * - Keep analysis/reporting in advanced panels; keep the main copy as an execution prompt only.
 * - Separate user facts, missing facts, safe creative decisions, and hard prohibitions.
 */
(function(){
  const T = window.TANJAI;
  T.version = "v9.1.6";

  const clean = (value = "", fallback = "") => {
    const out = String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    if(!out) return fallback;
    return out;
  };

  const placeholderRe = /^(ยังไม่ได้ระบุ|ไม่ระบุ|หัวข้องาน|หัวข้องาน\s*\/\s*ประเภทงาน|กลุ่มเป้าหมายหลัก|ให้ AI เลือกให้เหมาะสม|ให้ AI ช่วยเลือกจากรายละเอียด|ให้ AI ช่วยเลือกตามบริบท|ไม่พบข้อมูล|กำหนดเอง)$/i;
  const hasMeaning = value => {
    const v = clean(value, "");
    return !!v && !placeholderRe.test(v);
  };

  const uniq = items => [...new Set((items || []).map(x => clean(x, "")).filter(Boolean))];
  const bullet = (items, fallback = "- ไม่มี") => {
    const list = uniq(items);
    return list.length ? list.map(x => `- ${x}`).join("\n") : fallback;
  };

  const valueLine = (label, value) => hasMeaning(value) ? `${label}: ${clean(value)}` : "";

  const toolLabels = {
    image: "ภาพประชาสัมพันธ์",
    post: "โพสต์ / แคปชั่น / ข้อความเผยแพร่",
    mc: "งานพิธีกร / คำกล่าว / ลำดับพิธี",
    video: "วิดีโอ / Storyboard / Voice Over",
    voice: "สคริปต์เสียงพากย์",
    deck: "สไลด์นำเสนอ",
    kit: "ชุดสื่อครบชุด"
  };

  const toolRoles = {
    image: "คุณคือ AI นักออกแบบภาพประชาสัมพันธ์มืออาชีพ สำหรับเทศบาล อบต. หน่วยงานราชการ ชุมชน เพจ และแบรนด์",
    post: "คุณคือ AI นักเขียนข่าวประชาสัมพันธ์และคอนเทนต์โซเชียลมืออาชีพ สำหรับหน่วยงานท้องถิ่นและเพจองค์กร",
    mc: "คุณคือ AI ผู้ช่วยเขียนสคริปต์พิธีกรและคำกล่าวภาษาไทยมืออาชีพ ใช้จริงบนเวทีได้",
    video: "คุณคือ AI Creative Producer สำหรับวางโครงคลิปประชาสัมพันธ์ Storyboard เสียงพากย์ และข้อความบนจอ",
    voice: "คุณคือ AI Voice Script Writer ภาษาไทย เขียนสคริปต์เสียงที่อ่านลื่น ชัดเจน และเป็นธรรมชาติ",
    deck: "คุณคือ AI Presentation Strategist สำหรับจัดโครงสไลด์ราชการ/องค์กร พร้อม Speaker Notes",
    kit: "คุณคือ AI Creative Director ที่แปลงบรีฟเดียวเป็นชุดสื่อครบระบบ โดยแยกข้อมูลจริงและสิ่งที่ห้ามแต่งอย่างเคร่งครัด"
  };

  const toolTasks = {
    image: "ให้สร้างภาพประชาสัมพันธ์จริงหรือ Prompt ภาพพร้อมใช้ทันทีจากข้อมูลด้านล่าง",
    post: "ให้เขียนโพสต์ Facebook / Line พร้อมแคปชั่นและข้อความพร้อมคัดลอกไปใช้งานทันที",
    mc: "ให้เขียนสคริปต์พิธีกร / คำกล่าว / คำเชื่อมช่วง พร้อมใช้อ่านจริงทันที",
    video: "ให้สร้างโครงคลิป Storyboard Voice Over และข้อความบนจอพร้อมนำไปถ่ายทำหรือตัดต่อทันที",
    voice: "ให้เขียนสคริปต์เสียงพากย์ภาษาไทยพร้อมอ่านทันที",
    deck: "ให้จัดโครงสไลด์พร้อมหัวข้อ Bullet และ Speaker Notes ทันที",
    kit: "ให้สร้างชุด Prompt พร้อมใช้สำหรับ ภาพ โพสต์ วิดีโอ เสียงพากย์ และสไลด์ จากข้อมูลเดียวกัน"
  };

  function toolKind(d = {}, tool = "image"){
    if(T.brainType) return T.brainType(d, tool);
    return "general-publicity";
  }

  function toolLabel(kind){
    return T.brainLabel ? T.brainLabel(kind) : "ประชาสัมพันธ์ทั่วไป";
  }

  function designFor(d, kind, tool){
    if(T.brainDesign) return T.brainDesign(d, kind, tool);
    return {style:"Modern Premium Clean", color:"ให้เหมาะกับงาน", layout:"หัวข้อเด่น อ่านง่าย", mood:"สุภาพ", visual:"ภาพประกอบตรงประเด็น", hierarchy:["หัวข้อหลัก","ชื่อหน่วยงาน","รายละเอียดจริง"]};
  }

  T.proBriefFacts = function(d = {}, tool = "image"){
    return [
      valueLine("ประเภทองค์กร / กลุ่มผู้ใช้งาน", d.orgType),
      valueLine("ชื่อองค์กร / แบรนด์ / หน่วยงาน", d.orgName),
      valueLine("หมวดงานหลัก", d.mainCategory),
      valueLine("หัวข้องาน / ประเภทงาน", d.title),
      valueLine("รายละเอียดจริงที่ผู้ใช้ให้มา", d.detail),
      valueLine("กลุ่มเป้าหมาย", d.audience),
      valueLine("ช่องทางใช้งาน", d.channel || d.format),
      valueLine("ขนาด / รูปแบบ", d.size || d.format),
      valueLine("วัน / เวลา", d.dateTime),
      valueLine("สถานที่", d.place),
      valueLine("บุคคล / หน่วยงานที่เกี่ยวข้อง", d.people),
      valueLine("ข้อห้าม / หมายเหตุจากผู้ใช้", d.avoid),
      valueLine("เป้าหมายผลลัพธ์", d.brainGoal),
      valueLine("สิ่งที่ต้องเน้นเด่นที่สุด", d.brainFocus || d.focus)
    ].filter(Boolean);
  };

  T.proBriefMissing = function(d = {}, tool = "image"){
    const kind = toolKind(d, tool);
    const missing = T.brainMissing ? T.brainMissing(d, kind, tool).slice() : [];
    const add = (label, value) => { if(!hasMeaning(value)) missing.push(label); };

    if(tool === "post" || tool === "voice" || tool === "video"){
      add("ประเด็นผลลัพธ์หรือประโยชน์ต่อประชาชน ถ้ามี", d.benefit);
    }
    if(tool === "mc"){
      missing.push("ลำดับพิธี / ชื่อประธาน / ตำแหน่งประธาน ถ้ายังไม่ได้ให้มา");
    }
    if(tool === "deck"){
      missing.push("จำนวนสไลด์จริง / วัตถุประสงค์การนำเสนอ / ผู้ฟัง ถ้ายังไม่ได้ให้มา");
    }
    if(tool === "image"){
      if(!hasMeaning(d.colorTone)) missing.push("โทนสีเฉพาะของงาน ถ้าต้องการล็อกสี");
      if(!hasMeaning(d.layout)) missing.push("Layout เฉพาะ ถ้าต้องการล็อกแบบ");
    }
    return uniq(missing);
  };

  T.proBriefCanThink = function(d = {}, tool = "image"){
    const kind = toolKind(d, tool);
    const items = T.brainAssumptions ? T.brainAssumptions(d, kind, tool).slice() : [];
    const design = designFor(d, kind, tool);
    items.push("เลือกกลุ่มเป้าหมายเชิงการสื่อสารได้ หากผู้ใช้ยังไม่ระบุชัด");
    items.push("จัดลำดับความสำคัญของข้อความและเนื้อหาให้อ่านง่าย");
    items.push("ปรับโทนภาษาให้เหมาะกับองค์กรและช่องทางเผยแพร่");
    if(tool === "image"){
      items.push(`เลือกโทนภาพ สี และ Layout ตาม Creative Direction: ${design.style}`);
      items.push("คิดภาพประกอบทั่วไปที่ไม่อ้างบุคคลจริงและไม่สร้างโลโก้/QR ปลอม");
      items.push("เว้นพื้นที่สำหรับข้อมูลที่ยังไม่ระบุ เช่น วันที่ เวลา สถานที่ ช่องทางติดต่อ");
    }
    if(tool === "post") items.push("เรียบเรียงประโยคเปิดโพสต์ แคปชั่นสั้น และข้อความ Line ให้พร้อมใช้");
    if(tool === "video") items.push("แบ่งซีน Hook / เนื้อหา / ปิดท้าย และกำหนดข้อความบนจอโดยไม่เพิ่มข้อเท็จจริงใหม่");
    if(tool === "voice") items.push("จัดจังหวะเว้นวรรค คำเน้นเสียง และความยาวให้เหมาะกับเวลา");
    if(tool === "deck") items.push("จัดหัวข้อสไลด์ ลำดับเรื่อง และ Speaker Notes จากข้อมูลที่มี");
    return uniq(items);
  };

  T.proBriefForbidden = function(d = {}, tool = "image"){
    const kind = toolKind(d, tool);
    const base = T.brainForbiddenFacts ? T.brainForbiddenFacts(d, kind) : ["ชื่อบุคคล","ตำแหน่ง","ชื่อหน่วยงาน","สถานที่","วันที่","เวลา","เบอร์ติดต่อ","QR Code","โลโก้"];
    const userAvoid = hasMeaning(d.avoid) ? clean(d.avoid).split(/[\n,]/g) : [];
    const identity = (tool === "image" || tool === "video" || tool === "kit") ? [
      "ใบหน้าและอัตลักษณ์ของบุคคลจริง",
      "facial reconstruction",
      "face replacement",
      "facial feature modification",
      "identity drift"
    ] : [];
    return uniq(base.concat(userAvoid).concat(identity));
  };

  T.proTextOnImage = function(d = {}, tool = "image"){
    const kind = toolKind(d, tool);
    if(T.brainTextOnImage) return T.brainTextOnImage(d, kind);
    return [d.title, d.detail, d.orgName].filter(hasMeaning);
  };

  T.proBriefAnalyze = function(d = {}, tool = "image"){
    const kind = toolKind(d, tool);
    const design = designFor(d, kind, tool);
    const facts = T.proBriefFacts(d, tool);
    const missing = T.proBriefMissing(d, tool);
    const canThink = T.proBriefCanThink(d, tool);
    const forbidden = T.proBriefForbidden(d, tool);
    const textOnImage = T.proTextOnImage(d, tool);
    const score = Math.max(35, Math.min(100, 100 - Math.min(55, missing.length * 5) - (facts.length < 3 ? 15 : 0)));
    const readiness = score >= 85 ? "พร้อมคัดลอกไปใช้จริง" : score >= 70 ? "ใช้ได้ แต่ควรตรวจข้อมูลจริงก่อนเผยแพร่" : "ข้อมูลยังบาง ระบบจะทำงานแบบ ‘จากข้อมูลเบื้องต้น’";
    return {tool, kind, label: toolLabel(kind), design, facts, missing, canThink, forbidden, textOnImage, score, readiness};
  };

  T.promptBrainReport = function(d = {}, tool = "image"){
    const a = T.proBriefAnalyze(d, tool);
    return `Professional Brief-to-Prompt Output v9.1.6

สถานะบรีฟ: ${a.readiness}
คะแนนความพร้อม: ${a.score}/100
ประเภทงานที่ระบบอ่านได้: ${a.label}
ชนิดผลลัพธ์: ${toolLabels[tool] || toolLabels.image}

ข้อมูลจริงที่พบ:
${bullet(a.facts, "- ยังมีข้อมูลจริงน้อยมาก")}

ข้อมูลที่ยังไม่ระบุและห้ามแต่งเอง:
${bullet(a.missing, "- ไม่พบข้อมูลจำเป็นที่ขาดชัดเจน")}

สิ่งที่ระบบคิดต่อได้อย่างปลอดภัย:
${bullet(a.canThink, "- คิดเฉพาะโทน ภาษา Layout และการจัดวาง")}

Creative Direction:
- Style: ${a.design.style}
- Color: ${a.design.color}
- Layout: ${a.design.layout}
- Mood: ${a.design.mood}
- Visual: ${a.design.visual}

ลำดับความสำคัญของสาร:
${bullet(a.design.hierarchy)}

ข้อความหลัก / ข้อความบนภาพที่แนะนำ:
${bullet(a.textOnImage)}

ข้อเท็จจริงที่ห้ามแต่งเพิ่ม:
${bullet(a.forbidden)}`;
  };

  T.proBriefBlock = function(d = {}, tool = "image"){
    const a = T.proBriefAnalyze(d, tool);
    return `[3] ข้อมูลจริงที่ผู้ใช้ให้มา
${bullet(a.facts, "- จากข้อมูลเบื้องต้น: ผู้ใช้ยังให้ข้อมูลจริงน้อย")}

[4] ข้อมูลที่ยังไม่ระบุ และห้ามแต่งเอง
${bullet(a.missing, "- ไม่มีข้อมูลจำเป็นที่ขาดชัดเจน")}

[5] สิ่งที่ AI ช่วยคิดต่อได้อย่างปลอดภัย
${bullet(a.canThink, "- คิดเฉพาะโทน ภาษา Layout และการจัดวางให้เหมาะสม")}

[6] Creative Direction
- ประเภทงานที่วิเคราะห์ได้: ${a.label}
- Style: ${a.design.style}
- Color Tone: ${a.design.color}
- Layout: ${a.design.layout}
- Mood: ${a.design.mood}
- Visual Guide: ${a.design.visual}`;
  };

  T.proGuardBlock = function(d = {}, tool = "image"){
    const a = T.proBriefAnalyze(d, tool);
    const imageGuard = (tool === "image" || tool === "video" || tool === "kit") ? `
- หากมีภาพบุคคลจริง ให้คงอัตลักษณ์เดิม 100% ห้ามเปลี่ยนใบหน้า ห้ามสลับหน้า ห้ามแก้โครงหน้า ห้าม facial reconstruction, face replacement, facial feature modification และ identity drift
- ห้ามสร้างโลโก้ปลอม ห้ามสร้าง QR Code ปลอม ห้ามสร้างเบอร์โทรหรือช่องทางติดต่อปลอม` : "";
    return `[8] ข้อห้ามและกติกาความถูกต้อง
- ห้ามแต่งข้อมูลจริงเพิ่มเองโดยเด็ดขาด
- ห้ามเปลี่ยนชื่อบุคคล หน่วยงาน สถานที่ วันที่ เวลา ชื่อโครงการ และตัวเลขสำคัญ
- หากข้อมูลไม่ครบ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น” หรือเว้นช่องเติมภายหลัง
- ห้ามเขียนเหมือนรายงานบรีฟ ให้ส่งผลงานพร้อมใช้ตามงานที่สั่ง
- ภาษาไทยต้องถูกต้อง อ่านง่าย ไม่สะกดผิด${imageGuard}

ข้อเท็จจริงที่ต้องระวังเป็นพิเศษ:
${bullet(a.forbidden)}`;
  };

  T.proExecutionHeader = function(tool = "image"){
    return `คำสั่งนี้เป็นคำสั่งให้ลงมือทำทันที

[1] บทบาทของ AI
${toolRoles[tool] || toolRoles.image}

[2] งานที่ต้องทำ
${toolTasks[tool] || toolTasks.image}
ห้ามตอบกลับมาเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
หากข้อมูลไม่พอ ให้ใช้ข้อมูลที่มีอย่างเหมาะสมและระบุว่า “จากข้อมูลเบื้องต้น”
หากเครื่องมือปลายทางทำงานนี้ไม่ได้ ให้บอกเหตุผลตรง ๆ แล้วส่งผลลัพธ์ทางเลือกที่ใกล้ที่สุดแทน`;
  };

  T.proOutputFormat = function(tool = "image", d = {}, extra = {}){
    const a = T.proBriefAnalyze(d, tool);
    if(tool === "image"){
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
- สร้างภาพจริงทันที ถ้าเครื่องมือรองรับการสร้างภาพ
- หากสร้างภาพจริงไม่ได้ ให้ส่ง Prompt ภาพพร้อมใช้แทนอย่างตรงไปตรงมา
- หลังสร้างภาพ ห้ามตอบกลับเป็นเพียง path ภายใน เช่น /mnt/data/xxx.png ต้องแนบภาพจริงหรือให้ลิงก์ดาวน์โหลดที่เปิดได้จริงเท่านั้น
- ขนาด / ช่องทาง: ${clean(d.size || d.channel || d.format, "Facebook / Line Post 4:5 หรือ 1:1")}
- ข้อความบนภาพที่แนะนำ:
${bullet(a.textOnImage)}
- ลำดับการจัดวางที่แนะนำ:
${bullet(a.design.hierarchy)}`;
    }
    if(tool === "post"){
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
1. โพสต์ Facebook พร้อมคัดลอกไปใช้งาน 1 เวอร์ชัน
2. แคปชั่นสั้น 1 เวอร์ชัน
3. ข้อความ Line แบบกระชับ 1 เวอร์ชัน
4. แฮชแท็กที่เหมาะสม เฉพาะชื่อหน่วยงาน/หัวข้อที่มีจริง

แนวทางเขียน:
- เปิดด้วยประโยคหลักที่คนเข้าใจทันที
- เรียงลำดับ ใคร / ทำอะไร / เพื่ออะไร / วันเวลา / สถานที่ เฉพาะที่มีจริง
- ไม่ต้องอธิบายขั้นตอนการคิด`;
    }
    if(tool === "mc"){
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
1. สคริปต์พิธีกรฉบับเต็ม
2. เวอร์ชันสั้นสำหรับถืออ่าน
3. คำเชิญประธาน / คำเชื่อมช่วง เฉพาะเมื่อมีข้อมูลจริง
4. ช่องเว้นชื่อประธาน ตำแหน่ง หรือกำหนดการที่ยังไม่ระบุ

แนวทางภาษา:
- สุภาพ อ่านออกเสียงง่าย ไม่แข็งเกินไป
- แยกช่วงพิธีให้ชัดเจน`;
    }
    if(tool === "video"){
      const length = extra.length || d.length || "60 วินาที";
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
- ความยาวเป้าหมาย: ${length}
1. Hook เปิดคลิป 3 แบบ
2. Storyboard แบ่ง Scene ตามความยาว
3. Voice Over ครบทั้งคลิป
4. ข้อความบนจอแต่ละ Scene
5. แนวภาพ / มุมกล้อง / จังหวะตัดต่อ
6. หมายเหตุสิ่งที่ห้ามแต่งเพิ่ม`;
    }
    if(tool === "voice"){
      const length = extra.length || d.length || "60 วินาที";
      const style = extra.style || d.tone || "สุภาพ ชัดเจน";
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
- ความยาวเป้าหมาย: ${length}
- สไตล์เสียง: ${style}
1. สคริปต์เสียงฉบับพร้อมอ่าน
2. เวอร์ชันเปิดคลิปสั้น 1 แบบ
3. จุดเว้นวรรค / จังหวะหายใจ
4. คำที่ควรเน้นเสียง`;
    }
    if(tool === "deck"){
      const count = extra.count || 8;
      return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
- จำนวนสไลด์เป้าหมาย: ${count}
1. Outline ครบตามจำนวนสไลด์
2. หัวข้อแต่ละสไลด์
3. Bullet สำคัญต่อสไลด์
4. Speaker Notes ภาษาไทย
5. คำแนะนำภาพประกอบต่อสไลด์ โดยไม่สร้างโลโก้/QR ปลอม`;
    }
    return `[9] รูปแบบผลลัพธ์ที่ต้องส่ง
- ส่งผลลัพธ์พร้อมใช้งานทันที
- แยกส่วนให้ชัดเจนและคัดลอกไปใช้งานต่อได้`;
  };

  T.proPrompt = function(tool = "image", d = {}, extra = {}){
    return `${T.proExecutionHeader(tool)}

งานเฉพาะ: ${toolLabels[tool] || toolLabels.image}

${T.proBriefBlock(d, tool)}

[7] แนวทางมืออาชีพในการทำงาน
- ให้จัดสารหลักก่อนความสวยงาม: คนอ่านต้องเข้าใจใน 3 วินาทีแรก
- ใช้ภาษาธรรมชาติ สุภาพ และเหมาะกับช่องทางเผยแพร่
- ทำงานจากข้อมูลจริงที่มี ไม่สร้างข้อเท็จจริงใหม่
- หากข้อมูลยังไม่ครบ ให้ทำงานแบบเว้นช่องเติมข้อมูลภายหลัง แทนการเดา
- ตรวจชื่อเฉพาะและคำไทยก่อนส่งคำตอบสุดท้าย

${T.proGuardBlock(d, tool)}

${T.proOutputFormat(tool, d, extra)}`;
  };

  T.imagePrompt = function(d = {}, outputMode = "gpt"){
    return T.proPrompt("image", d, {outputMode});
  };
  T.postPrompt = function(d = {}){
    return T.proPrompt("post", d);
  };
  T.videoPrompt = function(d = {}, extra = {}){
    return T.proPrompt("video", d, extra);
  };
  T.voicePrompt = function(d = {}, extra = {}){
    return T.proPrompt("voice", d, extra);
  };
  T.deckPrompt = function(d = {}, extra = {}){
    return T.proPrompt("deck", d, extra);
  };
  T.mcPrompt = function(d = {}){
    return T.proPrompt("mc", d);
  };
  T.promptPack = function(d = {}){
    return `Professional Brief-to-Prompt Pack v9.1.6

วิธีใช้: คัดลอกเฉพาะส่วนที่ต้องการไปวางใน AI ปลายทาง หรือใช้ทั้งชุดเมื่ออยากให้ AI ทำหลายสื่อจากบรีฟเดียว

========== 1) PROMPT ภาพ ==========
${T.imagePrompt(d)}

========== 2) PROMPT โพสต์ ==========
${T.postPrompt(d)}

========== 3) PROMPT วิดีโอ ==========
${T.videoPrompt(d, {length: d.length || "60 วินาที"})}

========== 4) PROMPT เสียงพากย์ ==========
${T.voicePrompt(d, {length: d.length || "60 วินาที", style: d.tone || "สุภาพ ชัดเจน"})}

========== 5) PROMPT สไลด์ ==========
${T.deckPrompt(d, {count: 8})}`;
  };

  T.discussPrompt = function(type, d = {}){
    return `[โหมดผู้ช่วยวิเคราะห์และยกระดับบรีฟ]
หน้าที่ของคุณคือช่วยตรวจบรีฟก่อนสั่ง AI ทำงานจริง โดยต้องแยกข้อมูลจริง / ข้อมูลที่ยังไม่ระบุ / สิ่งที่ AI ช่วยคิดได้ / สิ่งที่ห้ามแต่งเอง

${T.promptBrainReport(d, type)}

สิ่งที่ต้องช่วยตอบ:
1. บรีฟนี้พร้อมใช้แค่ไหน
2. จุดที่ควรถามเพิ่มก่อนเผยแพร่จริง
3. ความเสี่ยงเรื่องข้อมูลจริง ชื่อเฉพาะ ภาษาไทย และภาพบุคคล
4. Prompt ฉบับพร้อมใช้ที่สั้น คม และไม่ปนรายงานวิเคราะห์

ข้อห้าม:
- ยังไม่ต้องสร้างผลงานสุดท้าย
- ห้ามแต่งข้อมูลจริงเพิ่ม
- ถ้าข้อมูลไม่ครบ ให้เสนอช่องเว้นเติมภายหลัง`;
  };

  T.promptCritic = function(d = {}, tool = "image"){
    const a = T.proBriefAnalyze(d, tool);
    const level = a.score >= 85 ? "พร้อมมาก" : a.score >= 70 ? "ใช้ได้" : "ควรเติมข้อมูล";
    return `Professional Output Check v9.1.6

คะแนนความพร้อม: ${a.score}/100
สถานะ: ${level}
คำแนะนำ: ${a.readiness}

ข้อมูลจริงที่มี:
${bullet(a.facts, "- ยังมีข้อมูลจริงน้อย")}

ข้อมูลที่ควรถามเพิ่ม / ห้ามแต่งเอง:
${bullet(a.missing, "- ไม่พบจุดขาดสำคัญ")}

สิ่งที่ AI คิดแทนได้อย่างปลอดภัย:
${bullet(a.canThink, "- คิดเฉพาะโทนและการจัดวาง")}

กติกาห้ามพลาด:
${bullet(a.forbidden)}`;
  };

  // Keep router helpful but less noisy: recommend menu + practical next step.
  T.routerSuggest = function(query = ""){
    const q = String(query || "").toLowerCase();
    const has = re => re.test(q);
    let view = "image";
    let reason = "โจทย์นี้ต้องจัดสารหลักและภาพรวมให้ชัดก่อน จึงเหมาะกับเมนูสร้างภาพ";
    if(has(/ชุดสื่อ|ครบชุด|หลายสื่อ|ทำทั้งหมด|ภาพ.*โพสต์.*คลิป/)){ view = "kit"; reason = "ต้องการผลลัพธ์หลายแบบจากข้อมูลเดียว จึงเหมาะกับเมนูสร้างชุดสื่อ"; }
    else if(has(/โพสต์|แคปชั่น|caption|facebook|line|เรียบเรียง|ข่าวประชาสัมพันธ์/)){ view = "post"; reason = "โจทย์เน้นข้อความเผยแพร่ จึงเหมาะกับเมนูเรียบเรียงเนื้อหา"; }
    else if(has(/พิธีกร|ประธาน|กล่าวรายงาน|คำกล่าว|เวที/)){ view = "mc"; reason = "โจทย์เป็นงานเวที ต้องควบคุมภาษาและลำดับพิธี"; }
    else if(has(/วิดีโอ|วีดีโอ|คลิป|storyboard|reels|tiktok|ซีน|scene/)){ view = "video"; reason = "โจทย์ต้องแบ่งซีน ภาพ เสียง และข้อความบนจอ"; }
    else if(has(/เสียง|พากย์|voice|อ่าน|สคริปต์เสียง/)){ view = "voice"; reason = "โจทย์ต้องใช้ภาษาที่อ่านออกเสียงได้ลื่น"; }
    else if(has(/สไลด์|powerpoint|ppt|นำเสนอ|deck/)){ view = "deck"; reason = "โจทย์ต้องจัดโครงสไลด์และ Speaker Notes"; }
    else if(has(/อัลบั้ม|หลายภาพ|facebook album|zip|กรอบภาพ/)){ view = "album"; reason = "โจทย์เน้นชุดภาพหลายใบพร้อมกรอบและแคปชั่น"; }
    else if(has(/ภาพ|โปสเตอร์|อินโฟกราฟิก|infographic|ป้าย|ประชาสัมพันธ์|เดินวิ่ง|วิ่ง/)){ view = "image"; reason = "โจทย์เหมาะกับภาพประชาสัมพันธ์ ต้องจัดข้อความและ Visual Direction ให้ชัด"; }
    const labels = {image:"สร้างภาพ", kit:"สร้างชุดสื่อ", post:"เรียบเรียงเนื้อหา", mc:"งานพิธีกร", video:"ทำวิดีโอ", voice:"เสียงพากย์", deck:"ทำสไลด์", album:"ชุดภาพโพสต์ Facebook"};
    const pseudoData = {title: query, detail: query, orgType:"", orgName:""};
    const report = T.promptBrainReport(pseudoData, view);
    const text = `เมนูที่แนะนำ: ${labels[view] || "สร้างภาพ"}

เหตุผล:
${reason}

วิเคราะห์แบบย่อ:
${report}

ขั้นตอนต่อไป:
1. กด “ไปที่เมนูที่แนะนำ”
2. กรอกเฉพาะข้อมูลจริงที่มี
3. กดสร้าง Prompt
4. คัดลอก Prompt พร้อมใช้ไปวางใน AI ปลายทาง
5. ตรวจชื่อคน หน่วยงาน วันที่ สถานที่ก่อนเผยแพร่

หมายเหตุ: ระบบจะไม่แต่งข้อมูลจริงเพิ่มเอง ถ้าข้อมูลไม่ครบจะใช้ “จากข้อมูลเบื้องต้น” หรือเว้นช่องเติมภายหลัง`;
    return {view, text};
  };

})();

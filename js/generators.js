window.TANJAI = window.TANJAI || {};

/**
 * ===================================================
 * TANJAI AI Studio - Generators v9.1 (Refactored)
 * ===================================================
 * Consolidated prompt generation engine
 * - Removed duplicate function definitions
 * - Kept only V9.1 Creative Quality Architecture
 * - Optimized for maintainability
 */

TANJAI.$ = s => document.querySelector(s);
TANJAI.$$ = s => Array.from(document.querySelectorAll(s));

/**
 * Output Delivery Guard - ensures proper file delivery
 */
TANJAI.outputDeliveryGuard = function(type="ไฟล์") {
  if(String(type).includes("ภาพ")){
    return `
ข้อกำชับการส่งมอบภาพ:
- เรียกเครื่องมือสร้างภาพก่อนตอบข้อความ และถือว่าสำเร็จเมื่อเครื่องมือแนบภาพที่มองเห็นได้ในแชทเท่านั้น
- ห้ามสร้างชื่อไฟล์ ตำแหน่งไฟล์ หรือลิงก์ดาวน์โหลดจำลอง
- ห้ามอ้างว่าสร้างภาพสำเร็จก่อนเครื่องมือส่งภาพกลับมา
- หากเครื่องมือคืนข้อผิดพลาดจริง ให้บอกตรง ๆ ว่าไม่สามารถเรียกเครื่องมือสร้างภาพในแชทนี้ได้`;
  }
  return `
ข้อกำชับการส่งมอบไฟล์:
- หากมีการสร้าง${type} ไฟล์ภาพ ไฟล์เอกสาร ไฟล์สไลด์ ไฟล์เสียง ไฟล์วิดีโอ หรือไฟล์ ZIP ต้องแนบไฟล์จริงในแชทให้ผู้ใช้ดาวน์โหลดได้
- ห้ามตอบกลับมาเป็น path ภายในระบบอย่างเดียว เช่น /mnt/data/filename.png
- ต้องแสดงลิงก์ดาวน์โหลดแบบกดได้ เช่น [ดาวน์โหลดไฟล์](sandbox:/mnt/data/filename.png)
- หากเป็นภาพ ให้แสดงตัวอย่างภาพหรือแนบภาพจริงในแชทด้วย
- หากไม่สามารถแนบไฟล์ได้ ให้บอกตรง ๆ ว่าทำไม่ได้ พร้อมอธิบายสาเหตุสั้น ๆ`;
};

/**
 * Common Data Extractor - V9.1 with Creative Quality fields
 */
TANJAI.commonData = function(prefix) {
  const v = id => (TANJAI.$(`#${prefix}-${id}`)?.value || "").trim();
  const c = id => {
    const el = TANJAI.$(`#${prefix}-${id}`);
    return !!(el && (el.checked || el.value === "on" || el.value === "true"));
  };
  const multi = id => {
    const el = TANJAI.$(`#${prefix}-${id}`);
    if(!el) return "";
    if(el.multiple) return Array.from(el.selectedOptions || []).map(o => o.value || o.textContent).filter(Boolean).join(", ");
    return (el.value || "").trim();
  };

  const baseData = {
    title: v("title") || "หัวข้องาน",
    orgName: v("orgName") || "ยังไม่ได้ระบุ",
    orgType: v("orgType") || "ไม่ระบุ",
    audience: v("audience") || "กลุ่มเป้าหมายหลัก",
    tone: v("tone") || "ทางการ สุภาพ อ่านง่าย",
    mainCategory: v("mainCategory") || "ไม่ระบุ",
    subCategory: v("subCategory") || "ไม่ระบุ",
    workType: v("workType") || "",
    channel: v("channel") || "",
    format: v("format") || "",
    length: v("length") || "",
    detail: v("detail") || "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม",
    dateTime: v("dateTime") || "",
    place: v("place") || "",
    people: v("people") || "",
    contentType: v("contentType") || "ให้ AI วิเคราะห์เอง",
    visualPreset: v("visualPreset") || "",
    styleModifiers: multi("styleModifiers") || "",
    style: v("style") || v("visualPreset") || "Modern Premium Clean",
    layout: v("layout") || "Split Layout ซ้ายข้อความ ขวาภาพ",
    density: v("density") || "สมดุล อ่านง่าย",
    focus: v("focus") || "เน้นหัวข้อหลัก",
    colorTone: v("colorTone") || "ให้ AI เลือกให้เหมาะสม",
    size: v("size") || "4:5 Facebook / Line 1080x1350",
    avoid: v("avoid") || "ห้ามสร้าง QR Code ปลอม ห้ามวาดโลโก้ใหม่ ข้อความภาษาไทยต้องสะกดถูก",
    useMode: v("useMode") || "สร้างภาพใหม่ด้วย AI",
    originalityLevel: v("originalityLevel") || "",
    safeUseMain: c("safeUseMain"),
    safeFace: c("safeFace"),
    safeNewPerson: c("safeNewPerson"),
    safeLook: c("safeLook"),
    safeScene: c("safeScene"),
    safeAdjustOnly: c("safeAdjustOnly"),
    safeOverlay: c("safeOverlay"),
    safeNoCover: c("safeNoCover"),
    smartCoach: c("smartCoach"),
    smartThinking: v("smartThinking") || "ให้ AI ช่วยคิดต่ออัตโนมัติ",
    smartOutput: v("smartOutput") || "สรุปคำสั่ง + Prompt พร้อมส่งเข้า GPT",
    smartBackup: c("smartBackup"),
    smartConfirm: false,
    smartMunicipal: c("smartMunicipal"),
    // V9.1 Creative Quality fields
    workContext: v("workContext") || "",
    imageType: v("imageType") || "",
    qualityLevel: v("qualityLevel") || "Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้",
    creativityLevel: v("creativityLevel") || "คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์"
  };

  return baseData;
};

/**
 * Prompt Critic - evaluates data completeness
 */
TANJAI.promptCritic = function(d) {
  const hasMeaning = value => {
    const text = String(value || "").trim();
    return !!text && !/^(ไม่ระบุ|ยังไม่ได้ระบุ|หัวข้องาน|ให้ AI วิเคราะห์เอง|ให้ AI เลือก.*|กำหนดเอง)$/i.test(text);
  };
  const titleOk = hasMeaning(d.title);
  const detailOk = hasMeaning(d.detail) && String(d.detail || "").trim().length >= 12;
  const orgOk = hasMeaning(d.orgName);
  const typeText = `${d.contentType || ""} ${d.mainCategory || ""} ${d.subCategory || ""} ${d.workContext || ""} ${d.title || ""} ${d.detail || ""}`;
  const eventLike = /ประกาศ|แจ้งข่าว|เชิญ|กิจกรรม|ประชุม|พิธี|โครงการ|อบรม|ลงพื้นที่|รับสมัคร|เปิดลงทะเบียน|กำหนดการ|รณรงค์|รายงานผล/i.test(typeText);
  const conceptLike = /เพลง|ศิลปิน|สินค้า|บริการ|คำคม|แคปชั่น|คอนเซ็ปต์|ศิลป์|มาสคอต|คาแรกเตอร์|โลโก้|แบรนด์|Cover Art/i.test(typeText);
  const realMode = (d.useMode || "") !== "สร้างภาพใหม่ด้วย AI";
  const hasPhotos = Number(d.photoCount || 0) > 0;

  const good = [];
  const missing = [];
  const suggestions = [];
  const risks = [];

  if(titleOk) good.push("มีหัวข้อ / ข้อความหลักชัดเจน");
  else missing.push("ควรใส่หัวข้อหรือข้อความหลักที่จะใช้บนภาพ");

  if(detailOk) good.push("มีรายละเอียดจริงให้ระบบใช้ต่อ");
  else suggestions.push("เพิ่มรายละเอียดจริงเท่าที่มี เช่น ใคร ทำอะไร เพื่อใคร หรือสารที่ต้องการสื่อ");

  if(orgOk) good.push("มีชื่อองค์กร / แบรนด์");
  else suggestions.push("ใส่ชื่อองค์กรหรือแบรนด์ ถ้าต้องการให้ปรากฏในงาน");

  if(hasMeaning(d.contentType)) good.push(`ระบุประเภทเนื้อหา: ${d.contentType}`);
  else suggestions.push("เลือกประเภทเนื้อหา เพื่อให้ระบบเช็กข้อมูลจำเป็นได้แม่นขึ้น");

  if(hasMeaning(d.visualPreset)) good.push(`เลือกแนวภาพหลัก: ${d.visualPreset}`);
  else suggestions.push("เลือกแนวภาพหลัก หรือปล่อยให้ AI เลือกตามงาน");

  if(d.styleModifiers) good.push(`มีตัวเสริมภาพ: ${d.styleModifiers}`);

  if(eventLike && !conceptLike){
    if(hasMeaning(d.dateTime)) good.push("มีวัน/เวลาสำหรับงานที่เกี่ยวกับกิจกรรมหรือประกาศ");
    else suggestions.push("งานลักษณะนี้อาจควรเพิ่มวัน/เวลา หากต้องการให้แสดงในภาพ");
    if(hasMeaning(d.place)) good.push("มีสถานที่หรือพื้นที่เกี่ยวข้อง");
    else suggestions.push("งานลักษณะนี้อาจควรเพิ่มสถานที่ หากต้องการให้แสดงในภาพ");
  }else{
    good.push("งานประเภทนี้ไม่จำเป็นต้องบังคับวัน เวลา หรือสถานที่");
  }

  if(realMode){
    if(hasPhotos) good.push("เลือกใช้ภาพจริงและมีไฟล์แนบในเว็บ");
    else risks.push("เลือกโหมดใช้ภาพจริง แต่ยังไม่ได้เลือกไฟล์ในเว็บ");
  }else if(hasPhotos){
    suggestions.push("มีภาพแนบอยู่ หากต้องการคงภาพจริงให้เลือกโหมดใช้ภาพจริงเป็นต้นฉบับ");
  }

  let status = "พร้อมใช้";
  if(!titleOk) status = "ยังขาดข้อมูลสำคัญ";
  else if(missing.length || suggestions.length >= 3 || risks.length) status = "ควรเพิ่มข้อมูล";

  const icon = status === "พร้อมใช้" ? "✅" : status === "ควรเพิ่มข้อมูล" ? "⚠️" : "❌";
  const list = (arr, fallback) => arr.length ? arr.map(x => `- ${x.replace(/^- /, "")}`).join("\n") : `- ${fallback}`;

  return `${icon} สถานะ Prompt: ${status}

ข้อมูลที่ครบแล้ว:
${list(good, "มีข้อมูลตั้งต้นพอสำหรับให้ AI ช่วยจัดโครง")}

ข้อมูลที่ควรเพิ่ม:
${list(missing.concat(suggestions), "ไม่มีข้อมูลจำเป็นที่ต้องบังคับเพิ่ม")}

ความเสี่ยง:
${list(risks, "ไม่พบความเสี่ยงสำคัญ")}

หมายเหตุ:
- ระบบไม่บังคับวัน เวลา หรือสถานที่กับงานที่เป็นเพลง สินค้า คำคม คอนเซ็ปต์ มาสคอต โลโก้ หรือภาพศิลป์
- หากเป็นประกาศ กิจกรรม งานประชุม โครงการ หรืออบรม ระบบจะแนะนำวัน เวลา สถานที่แบบไม่บังคับ`;
};

/**
 * V9 Clean - Thai text normalization (อัปเดตการเว้นวรรค ไทย-อังกฤษ)
 */
TANJAI.v9Clean = function(text = "", fallback = "ไม่ระบุ") {
  const value = String(text || "")
    .replaceAll("ประชม", "ประชุม")
    .replaceAll("พ.ศ.2571-2575", "พ.ศ. 2571–2575")
    .replaceAll("พ.ศ. 2571-2575", "พ.ศ. 2571–2575")
    // เพิ่มการเว้นวรรคระหว่างอักษรไทยและอังกฤษ/ตัวเลข
    .replace(/([ก-๙])([a-zA-Z0-9])/g, '$1 $2')
    .replace(/([a-zA-Z0-9])([ก-๙])/g, '$1 $2')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return value || fallback;
};

/**
 * V9 List - array sanitizer
 */
TANJAI.v9List = function(items = []) {
  return items.map(x => String(x || "").trim()).filter(Boolean);
};

/**
 * V9 Detect Image Type - auto-detect based on content
 */
TANJAI.v9DetectImageType = function(d) {
  const text = `${d.title} ${d.detail} ${d.mainCategory} ${d.subCategory} ${d.workType}`.toLowerCase();
  if (/เพลง|single|ซิงเกิล|mv|music|ฟังได้แล้ว|โปรโมทเพลง|อัลบั้ม/.test(text)) return "ภาพโปรโมทเพลง / ผลงานสร้างสรรค์";
  if (/ขอเชิญ|เชิญร่วม|ขอเรียนเชิญ|ร่วมกิจกรรม|เปิดรับ|สมัคร/.test(text)) return "ภาพเชิญชวน / ประชาสัมพันธ์กิจกรรม";
  if (/แจ้งข่าว|ประกาศ|โปรดทราบ|เตือน|ระวัง|มิจฉาชีพ|ปิดถนน|ไฟดับ|หยุดให้บริการ/.test(text)) return "ภาพแจ้งข่าว / ประกาศ";
  if (/สรุปกิจกรรม|ลงพื้นที่|ประชุม|ร่วมประชุม|ตรวจงาน|ติดตาม|บรรยากาศ|กิจกรรม/.test(text)) return "ภาพสรุปกิจกรรม / ภาพโพสต์งาน";
  if (/ขั้นตอน|วิธี|ข้อมูลควรรู้|infographic|อินโฟกราฟิก|ข้อควรรู้|1\)|2\)|3\)/.test(text)) return "ภาพอินโฟกราฟิก";
  if (/เกษียณ|แสดงความยินดี|ขอบคุณ|มอบ|อาลัย|ไว้อาลัย|รำลึก/.test(text)) return "ภาพเชิงพิธี / บุคคล";
  if (/ภาษี|ชำระ|เอกสาร|ทะเบียน|บริการ|ขั้นตอนบริการ/.test(text)) return "ภาพให้ความรู้ / ขั้นตอนบริการ";
  return "ภาพประชาสัมพันธ์";
};

/**
 * V9 Purpose - generate purpose statement
 */
TANJAI.v9Purpose = function(type, d) {
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  if (type === "image") {
    const imageType = TANJAI.v9DetectImageType(d);
    if (/เพลง/.test(imageType)) return `โปรโมทผลงาน "${title}" ให้เหมาะกับโซเชียล`;
    if (/เชิญชวน/.test(imageType)) return `เชิญชวนกลุ่มเป้าหมายให้เข้าร่วมกิจกรรม "${title}"`;
    if (/แจ้งข่าว|ประกาศ/.test(imageType)) return `แจ้งข้อมูลสำคัญให้เข้าใจเร็วและอ่านง่าย`;
    if (/สรุปกิจกรรม/.test(imageType)) return `สรุปกิจกรรมให้เป็นภาพโพสต์ที่น่าเชื่อถือ`;
    if (/อินโฟกราฟิก|ขั้นตอนบริการ/.test(imageType)) return `อธิบายข้อมูลให้เป็นลำดับ เข้าใจง่าย`;
    return `ประชาสัมพันธ์เรื่อง "${title}" ให้ชัดเจนและพร้อมใช้งานจริง`;
  }
  if (type === "post") return `สรุปและเรียบเรียงข้อมูลให้เป็นข้อความพร้อมใช้`;
  if (type === "mc") return `สร้างสคริปต์พิธีกรและคำกล่าวที่อ่านได้จริงบนเวที`;
  if (type === "video") return `วางโครงคลิป/วิดีโอให้ถ่ายทำหรือตัดต่อได้ทันที`;
  if (type === "voice") return `เขียนสคริปต์เสียงพากย์ที่อ่านออกเสียงได้ลื่นไหล`;
  if (type === "deck") return `จัดโครงสไลด์และ Speaker Notes สำหรับนำเสนอ`;
  if (type === "album") return `จัดชุดภาพโพสต์ Facebook พร้อมแคปชั่นและลำดับภาพ`;
  return `สร้างผลลัพธ์พร้อมใช้งาน`;
};

/* ─────────────────────────────────────────────────────────
   SMART CONTEXT ENGINE v9.5 — AI รู้ใจ รู้บริบทองค์กร
   ─────────────────────────────────────────────────────────
   ตรวจบริบทอัตโนมัติจากชื่อหน่วยงาน + ประเภทงาน + เนื้อหา
   แล้วเพิ่ม instruction เฉพาะทางให้ prompt แม่นขึ้น
───────────────────────────────────────────────────────── */
TANJAI.smartContext = function(d = {}) {
  const orgName = (d.orgName || "").toLowerCase();
  const detail  = (d.detail || "").toLowerCase();
  const title   = (d.title || "").toLowerCase();
  const all     = `${orgName} ${title} ${detail}`;

  const ctx = {
    orgKind: "ทั่วไป",
    toneHint: "",
    audienceHint: "",
    safetyNote: "",
    styleHint: "",
    ctaHint: ""
  };

  // ตรวจประเภทองค์กร
  if (/เทศบาล|อบต|องค์การบริหาร/.test(all)) {
    ctx.orgKind = "ท้องถิ่น/ราชการ";
    ctx.toneHint = "ใช้ภาษาราชการที่อ่านง่าย ไม่ซับซ้อน เหมาะกับประชาชนทุกวัย";
    ctx.audienceHint = "ประชาชนในพื้นที่หลากหลายช่วงอายุ รวมถึงผู้สูงอายุ";
    ctx.styleHint = "โทนสีน้ำเงิน-ทอง หรือสีที่สื่อถึงความน่าเชื่อถือของรัฐ";
    ctx.ctaHint = "สอบถามเพิ่มเติมได้ที่สำนักงาน / Line Official";
    ctx.safetyNote = "ห้ามอ้างอิงตัวเลข งบประมาณ หรือข้อมูลที่ผู้ใช้ไม่ได้ระบุ";
  } else if (/โรงพยาบาล|สาธารณสุข|อนามัย|คลินิก/.test(all)) {
    ctx.orgKind = "สาธารณสุข";
    ctx.toneHint = "ใช้ภาษาเข้าใจง่าย ให้ความรู้สึกอุ่นใจ น่าเชื่อถือ";
    ctx.audienceHint = "ผู้ป่วย ผู้ดูแล และประชาชนทั่วไปที่ใส่ใจสุขภาพ";
    ctx.styleHint = "โทนสีเขียว-ขาว หรือน้ำเงิน-ขาว สะอาด มืออาชีพ";
    ctx.ctaHint = "ปรึกษาแพทย์ / ติดต่อเจ้าหน้าที่สาธารณสุข";
    ctx.safetyNote = "ห้ามระบุข้อมูลทางการแพทย์ที่ไม่ได้รับการยืนยัน";
  } else if (/โรงเรียน|มหาวิทยาลัย|วิทยาลัย|ศูนย์พัฒนาเด็ก/.test(all)) {
    ctx.orgKind = "การศึกษา";
    ctx.toneHint = "ใช้ภาษาอบอุ่น สร้างแรงบันดาลใจ เหมาะกับนักเรียนและผู้ปกครอง";
    ctx.audienceHint = "นักเรียน นักศึกษา ผู้ปกครอง และคณาจารย์";
    ctx.styleHint = "สีสดใส สะอาด สร้างสรรค์ ดูเป็นกันเอง";
    ctx.ctaHint = "ติดต่อสอบถามที่งานวิชาการ / ฝ่ายทะเบียน";
  } else if (/ตำรวจ|สถานี|ป้องกัน|อาชญากรรม/.test(all)) {
    ctx.orgKind = "ความมั่นคง";
    ctx.toneHint = "เน้นความชัดเจน รวดเร็ว น่าเชื่อถือ เป็นทางการ";
    ctx.audienceHint = "ประชาชนทั่วไปที่ต้องการความปลอดภัย";
    ctx.styleHint = "น้ำเงินเข้ม-ขาว สีตำรวจ ดูน่าเชื่อถือ";
    ctx.ctaHint = "แจ้งเหตุ 191 หรือสายด่วนท้องถิ่น";
  } else if (/ร้าน|บริษัท|ห้าง|สินค้า|โปรโมชั่น/.test(all)) {
    ctx.orgKind = "ธุรกิจ";
    ctx.toneHint = "ใช้ภาษาชวนซื้อ น่าสนใจ กระตุ้นการตัดสินใจ";
    ctx.audienceHint = "ลูกค้าเป้าหมายที่สนใจสินค้าหรือบริการ";
    ctx.styleHint = "สีสด Contrast สูง ดึงดูดสายตา";
    ctx.ctaHint = "สั่งซื้อเลย / ติดต่อ Line / DM ได้เลย";
  } else if (/เพจ|ครีเอเตอร์|ยูทูบ|TikTok|influencer/.test(all)) {
    ctx.orgKind = "โซเชียลมีเดีย";
    ctx.toneHint = "ใช้ภาษาเป็นกันเอง สนุก กระชับ เหมาะกับ Feed";
    ctx.audienceHint = "ผู้ติดตามเพจในโซเชียลมีเดีย";
    ctx.styleHint = "ทันสมัย Bold Typography เล่น contrast";
    ctx.ctaHint = "กดไลก์ แชร์ กดติดตาม";
  }

  // ตรวจบริบทเนื้อหาพิเศษ
  if (/ภาษี|ชำระ|กำหนดเส้นตาย|วันสุดท้าย|ด่วน/.test(all)) {
    ctx.urgencyHint = "มีกำหนดเวลาสำคัญ — เน้นวันที่และ deadline ให้ชัดเจนที่สุด";
  }
  if (/อบรม|สัมมนา|อบรม|workshop/.test(all)) {
    ctx.eventHint = "งานอบรม/สัมมนา — ระบุวัน เวลา สถานที่ และวิธีลงทะเบียนให้ครบ";
  }
  if (/รับสมัคร|เปิดรับ|สมัครได้/.test(all)) {
    ctx.recruitHint = "งานรับสมัคร — ต้องระบุคุณสมบัติ วิธีสมัคร และกำหนดยื่นให้ชัดเจน";
  }

  return ctx;
};

/* helper: แปลง smart context เป็น prompt instruction */
TANJAI.smartContextBlock = function(d = {}) {
  const ctx = TANJAI.smartContext(d);
  const lines = [`บริบทอัตโนมัติ (Smart Context v9.5):`];
  lines.push(`- ประเภทองค์กร: ${ctx.orgKind}`);
  if (ctx.toneHint)     lines.push(`- โทนภาษาที่เหมาะ: ${ctx.toneHint}`);
  if (ctx.audienceHint) lines.push(`- กลุ่มผู้รับสาร: ${ctx.audienceHint}`);
  if (ctx.styleHint)    lines.push(`- แนวทางสไตล์: ${ctx.styleHint}`);
  if (ctx.ctaHint)      lines.push(`- CTA ที่เหมาะสม: ${ctx.ctaHint}`);
  if (ctx.urgencyHint)  lines.push(`- ⚠️ ${ctx.urgencyHint}`);
  if (ctx.eventHint)    lines.push(`- 📅 ${ctx.eventHint}`);
  if (ctx.recruitHint)  lines.push(`- 📋 ${ctx.recruitHint}`);
  if (ctx.safetyNote)   lines.push(`- ⛔ ${ctx.safetyNote}`);
  return lines.join("\n");
};

/**
 * V9 Text On Image - extract text for image
 */
TANJAI.v9TextOnImage = function(d, imageType = "ภาพประชาสัมพันธ์") {
  const title = TANJAI.v9Clean(d.title, "");
  const org = TANJAI.v9Clean(d.orgName, "");
  const detail = TANJAI.v9Clean(d.detail, "");
  const dateTime = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const items = [];

  if (title) items.push(title);
  if (/เพลง/.test(imageType)) {
    if (org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org)) items.push(org);
    items.push("เพลงใหม่");
    items.push("ฟังได้แล้ววันนี้");
  } else {
    if (dateTime) items.push(dateTime);
    if (place) items.push(place);
    if (org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org) && !items.includes(org)) items.push(org);
  }

  if (items.length < 3 && detail && detail.length <= 80) items.push(detail);
  return [...new Set(items)].filter(Boolean).slice(0, 5);
};

/**
 * V9 Protected Block - safety guidelines
 */
TANJAI.v9ProtectedBlock = function(d, type = "general") {
  const safeFace = !!d.safeFace;
  const safeNoNew = !!d.safeNewPerson;
  const safeNoCover = !!d.safeNoCover;
  const safeScene = !!d.safeScene;

  let block = `ข้อกำชับความปลอดภัยและความถูกต้อง:
- ห้ามแต่งชื่อบุคคล ตำแหน่ง หน่วยงาน วันที่ เวลา หรือสถานที่ขึ้นเอง`;

  if (type === "image" || type === "album" || type === "video") {
    block += "\n- หากมีภาพบุคคลจริง ให้คงอัตลักษณ์เดิม 100%: ห้าม facial reconstruction, face replacement, facial feature modification และ identity drift";
    if (safeFace) block += "\n- ห้ามเปลี่ยนใบหน้าของบุคคลในภาพจริง";
    if (safeNoNew) block += "\n- ห้ามสร้างบุคคลใหม่ที่ไม่มีในภาพต้นฉบับ";
    if (safeNoCover) block += "\n- ห้ามบังหรือซ่อนใบหน้า";
    if (safeScene) block += "\n- ห้ามเปลี่ยนฉากหรือบรรยากาศเด็ดขาด";
  }

  block += `\n- ใช้ข้อมูลที่ผู้ใช้ให้มาเท่านั้น ไม่ตีความเกิน
- หากข้อมูลไม่ชัด ให้ใช้คำว่า "จากข้อมูลเบื้องต้น" และเว้นช่องให้เติมภายหลัง`;

  return block;
};

/**
 * V9 Execution Header
 */
TANJAI.v9ExecutionHeader = function(action) {
  return `ขอให้ดำเนินการดังนี้:
${action}

ข้อมูลพื้นฐาน:`;
};

/**
 * V9 Build Shared Brief - core brief builder
 */
TANJAI.buildSharedBrief = function(d = {}, type = "image") {
  const imageType = TANJAI.v9DetectImageType(d);
  const purpose = TANJAI.v9Purpose(type, d);
  const textOnImage = TANJAI.v9TextOnImage(d, imageType);

  return {
    title: TANJAI.v9Clean(d.title, "หัวข้องาน"),
    orgName: TANJAI.v9Clean(d.orgName, "ยังไม่ได้ระบุ"),
    orgType: d.orgType || "ไม่ระบุ",
    audience: d.audience || "กลุ่มเป้าหมายหลัก",
    tone: d.tone || "ทางการ สุภาพ อ่านง่าย",
    detail: TANJAI.v9Clean(d.detail, "ยังไม่ได้ระบุรายละเอียด"),
    purpose: purpose,
    imageType: imageType,
    textOnImage: textOnImage,
    keyFacts: [
      d.title ? `- ${d.title}` : "",
      d.dateTime ? `- วัน/เวลา: ${d.dateTime}` : "",
      d.place ? `- สถานที่: ${d.place}` : "",
      d.people ? `- บุคคล: ${d.people}` : ""
    ].filter(Boolean),
    channel: d.channel || "โซเชียลมีเดีย",
    size: d.size || "4:5 Facebook / Line 1080x1350",
    style: d.style || "Modern Premium Clean",
    layout: d.layout || "Split Layout ซ้ายข้อความ ขวาภาพ",
    density: d.density || "สมดุล อ่านง่าย",
    focus: d.focus || "เน้นหัวข้อหลัก",
    colorTone: d.colorTone || "ให้ AI เลือกให้เหมาะสม",
    attachmentGuide: TANJAI.v9AttachmentGuide(d, type),
    workContext: d.workContext || "",
    qualityLevel: d.qualityLevel || "Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้",
    creativityLevel: d.creativityLevel || "คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์"
  };
};

/**
 * V9 Attachment Guide
 */
TANJAI.v9AttachmentGuide = function(d, type = "image") {
  const count = Number(d.photoCount || 0);
  const hasPhotos = count > 0;
  const isRealMode = /ภาพจริง|ต้นฉบับ|รีทัช|ปรับภาพจริง/.test(d.useMode || "");

  let guide = "ไฟล์ที่ควรแนบ:\n";

  if (isRealMode && hasPhotos) {
    guide += `- ภาพถ่ายจริง ${count} รูป (ความละเอียดสูง)\n`;
  }

  if (/โลโก้|เทศบาล/.test(d.detail + d.orgName)) {
    guide += "- โลโก้องค์กรจริง\n";
  }

  if (/QR|LINE|QR Code/.test(d.detail)) {
    guide += "- QR Code จริง / LINE QR จริง\n";
  }

  if (!guide.includes("-")) {
    guide += "- ไม่มีไฟล์แนบจำเป็นเพิ่มเติม";
  }

  return guide;
};

/**
 * V9.1 Creative Preset - auto-map context to style
 */
TANJAI.v91CreativePreset = function(context = "", imageType = "", d = {}) {
  const text = `${context} ${imageType} ${d.title || ""} ${d.detail || ""} ${d.mainCategory || ""} ${d.subCategory || ""}`;
  const has = pattern => pattern.test(text);

  const base = {
    context: context || "ให้ AI ช่วยเลือกจากรายละเอียด",
    imageType: imageType || "ให้ AI ช่วยเลือกตามบริบท",
    style: "Modern Premium Clean",
    layout: "Poster Layout",
    density: "สมดุล อ่านง่าย",
    focus: "เน้นหัวข้อหลัก",
    colorTone: "ให้ AI เลือกให้เหมาะสม",
    visualTone: "สวยงาม อ่านง่าย เหมาะกับบริบทงาน",
    creativeDirection: "ออกแบบให้ดูมืออาชีพ ใช้งานจริง ไม่เว่อร์ และไม่เติมข้อมูลเกินจริง",
    textPolicy: "ใช้ข้อความเท่าที่จำเป็น หัวข้อหลักต้องอ่านง่าย",
    overdoGuard: "ห้ามเพิ่มองค์ประกอบเกินบริบท ห้ามใส่ข้อมูลปลอม และห้ามทำภาพรกเกินจำเป็น",
    cta: ""
  };

  if (has(/โปรโมทเพลง|เพลง|ผลงานสร้างสรรค์|ปกเพลง|music|single|mv/i)) {
    return {
      ...base,
      context: context || "โปรโมทเพลง / ผลงานสร้างสรรค์",
      imageType: imageType || "ปกเพลง / โปรโมทเพลง",
      style: "Emotional Music Poster / Modern Social Premium",
      layout: "Poster Focus / Hero Layout",
      density: "ปานกลางหรือโปร่ง ไม่แน่นแบบอินโฟกราฟิก",
      focus: "ชื่อเพลงเด่นที่สุด ภาพบุคคลหรือ mood เพลงเด่นรองลงมา",
      colorTone: "ให้ AI เลือกให้เข้ากับอารมณ์เพลง",
      visualTone: "มีอารมณ์เพลง ทันสมัย น่าฟัง ดูเป็นโปสเตอร์เพลงจริง",
      creativeDirection: "เน้นอารมณ์เพลงและการดึงดูดบนโซเชียล ไม่ทำเป็นเอกสารราชการ",
      textPolicy: "ใช้ข้อความน้อย ใหญ่ อ่านชัด เช่น ชื่อเพลง ชื่อศิลปิน และ CTA สั้น ๆ",
      overdoGuard: "ห้ามใส่วันเวลา/สถานที่ถ้าไม่ได้ระบุ ห้ามสร้าง QR หรือโลโก้ปลอม",
      cta: "เพลงใหม่ / ฟังได้แล้ววันนี้"
    };
  }

  if (has(/แจ้งข่าว|ประกาศ|ข่าวด่วน|เตือน|ระวัง/)) {
    return {
      ...base,
      context: context || "แจ้งข่าว / ประกาศ",
      imageType: imageType || "ภาพแจ้งข่าว",
      style: "Clean Announcement / Government Clean",
      layout: "Title First / Info Card",
      density: "ปานกลาง อ่านเร็ว",
      focus: "หัวข้อใหญ่และข้อมูลสำคัญชัดเจน",
      colorTone: "น้ำเงิน–ขาว ทางการ หรือสีที่เหมาะกับหน่วยงาน",
      visualTone: "น่าเชื่อถือ ชัดเจน ไม่ตกแต่งเกิน",
      creativeDirection: "เน้นให้ประชาชนอ่านเข้าใจเร็ว เห็นสารหลักทันที",
      textPolicy: "แยกหัวข้อ รายละเอียด วันเวลา/สถานที่ถ้ามีจริง",
      overdoGuard: "ห้ามใส่ข้อมูลเตือนภัยเกินจริง ห้ามเติมวันเวลา/สถานที่เอง"
    };
  }

  if (has(/เชิญชวน|ประชาสัมพันธ์|เชิญร่วม|กิจกรรม|โครงการ/)) {
    return {
      ...base,
      context: context || "เชิญชวน / ประชาสัมพันธ์",
      imageType: imageType || "ภาพเชิญชวนกิจกรรม",
      style: "Event Poster / Social Bright",
      layout: "Hero + Info Box",
      density: "สมดุล อ่านง่าย",
      focus: "ชื่องานเด่น พร้อมข้อมูลเข้าร่วมถ้ามี",
      visualTone: "สุภาพ เชิญชวน สดใสพอดี",
      creativeDirection: "สร้างบรรยากาศน่าเข้าร่วม แต่ไม่ใส่ข้อมูลที่ไม่มีจริง",
      textPolicy: "หัวข้อเด่น ตามด้วยวัน เวลา สถานที่ และผู้จัด หากผู้ใช้ระบุ",
      overdoGuard: "ห้ามเดาวันเวลา/สถานที่ ห้ามทำภาพรกจนข้อมูลสำคัญหาย"
    };
  }

  if (has(/ให้ความรู้|infographic|อินโฟกราฟิก|ขั้นตอน|วิธีใช้งาน|ข้อมูลควรรู้|บริการ/)) {
    return {
      ...base,
      context: context || "ให้ความรู้ / Infographic",
      imageType: imageType || "อินโฟกราฟิก",
      style: "Informative Clean / Modern Infographic",
      layout: "Infographic Grid / Step Layout",
      density: "แน่นแบบพอดี อ่านง่าย",
      focus: "ลำดับข้อมูลและข้อสำคัญ",
      visualTone: "ชัดเจน เป็นขั้นตอน เข้าใจง่าย",
      creativeDirection: "แปลงข้อมูลให้เป็นลำดับ ใช้กล่อง/ไอคอนช่วยโดยไม่ทำให้รก",
      textPolicy: "แบ่งข้อสั้น ๆ อ่านง่าย ใช้เลขข้อเมื่อเหมาะสม",
      overdoGuard: "ห้ามใส่ขั้นตอนที่ผู้ใช้ไม่ได้ระบุ ห้ามใช้ icon เยอะจนอ่านยาก"
    };
  }

  if (has(/สรุปกิจกรรม|รายงานผล|ลงพื้นที่|ประชุม|ร่วมประชุม|บรรยากาศ/)) {
    return {
      ...base,
      context: context || "สรุปกิจกรรม / รายงานผล",
      imageType: imageType || "ภาพสรุปกิจกรรม",
      style: "Photo Report / Municipal News",
      layout: "Photo + Caption Blocks",
      density: "ปานกลาง อ่านง่าย",
      focus: "ภาพจริงหรือบรรยากาศเด่น พร้อมสารสำคัญ",
      visualTone: "น่าเชื่อถือ อบอุ่น เป็นงานประชาสัมพันธ์จริง",
      creativeDirection: "เล่าให้เห็นว่าใคร ทำอะไร ที่ไหน และเกิดประโยชน์อะไร",
      textPolicy: "ข้อความสั้นเป็นข่าว/สรุป ไม่ยัดรายละเอียดทั้งหมดบนภาพ",
      overdoGuard: "ห้ามเติมผลลัพธ์เกินจริง ห้ามทำภาพเป็นพิธีการเกินบริบท"
    };
  }

  if (has(/ไว้อาลัย|อาลัย|ลดสี|สุภาพ|รำลึก/)) {
    return {
      ...base,
      context: context || "ไว้อาลัย / สุภาพ / ลดสี",
      imageType: imageType || "ภาพไว้อาลัย / สุภาพ",
      style: "Memorial Minimal / Formal Clean",
      layout: "Center Focus / Minimal Poster",
      density: "โปร่ง ข้อความน้อย",
      focus: "ข้อความหลักและความสำรวม",
      colorTone: "ขาว ดำ เทา ทองหม่น หรือโทนลดสี",
      visualTone: "สุภาพ สำรวม เรียบ ไม่ฉูดฉาด",
      creativeDirection: "ลดสี ลดเอฟเฟกต์ ให้เกียรติและเหมาะสมกับบริบท",
      textPolicy: "ใช้ข้อความน้อย อ่านง่าย ไม่ใช้คำหวือหวา",
      overdoGuard: "ห้ามใช้สีสด เอฟเฟกต์ไฟ แสงจัด หรือองค์ประกอบเว่อร์"
    };
  }

  return base;
};

/**
 * V9.1 Detect Image Type - with override support
 */
TANJAI.v91DetectImageType = function(d) {
  if (d.imageType && !/^ให้ AI ช่วยเลือก/.test(d.imageType)) return d.imageType;
  return TANJAI.v9DetectImageType(d);
};

/**
 * V9.1 Build Shared Brief - with Creative Quality
 */
TANJAI.v91BuildSharedBrief = function(d = {}, type = "image") {
  const b = TANJAI.buildSharedBrief(d, type);
  const preset = TANJAI.v91CreativePreset(d.workContext, d.imageType || b.imageType, d);
  
  b.workContext = d.workContext || preset.context;
  b.imageType = (d.imageType && !/^ให้ AI ช่วยเลือก/.test(d.imageType)) ? d.imageType : preset.imageType || b.imageType;
  b.qualityLevel = d.qualityLevel || "Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้";
  b.creativityLevel = d.creativityLevel || "คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์";
  b.creativeDirection = preset.creativeDirection;
  b.textPolicy = preset.textPolicy;
  b.overdoGuard = preset.overdoGuard;
  b.suggestedCTA = preset.cta || "";
  
  if (type === "image" || type === "album" || type === "video") {
    b.style = preset.style || b.style;
    b.layout = preset.layout || b.layout;
    b.density = preset.density || b.density;
    b.focus = preset.focus || b.focus;
    b.colorTone = preset.colorTone || b.colorTone;
    b.visualTone = preset.visualTone || b.visualTone;
  }
  
  return b;
};

/**
 * Image Prompt Generator - V9.1 (อัปเดตโครงสร้างและเพิ่ม Output Guard กัน GPT ตอบแค่ Path)
 */
TANJAI.imagePrompt = function(d, outputMode = "gpt") {
  const b = TANJAI.v91BuildSharedBrief(d, "image");
  
  return `${TANJAI.v9ExecutionHeader("ให้สร้างภาพตามข้อมูลด้านล่าง โดยแยกส่วนเนื้อหาและสไตล์ภาพออกจากกันอย่างชัดเจน")}

[1] ข้อมูลหลักของงาน (เนื้อหา):
- ประเภทภาพ: ${b.imageType}
- บริบทงาน: ${b.workContext}
- จุดประสงค์ของภาพ: ${b.purpose}
- กลุ่มเป้าหมาย: ${b.audience}
- หัวข้อหลัก: ${b.title}
- ข้อมูลจริงของงาน:
${b.keyFacts.length > 0 ? b.keyFacts.map(x => "  " + x).join("\n") : "  ไม่มีข้อมูลเพิ่มเติม"}

[2] ข้อความที่ต้องใส่ในภาพ (Text on Image):
${b.textOnImage.length > 0 ? b.textOnImage.map(x => `"${x}"`).join(", ") : "ไม่บังคับใส่ข้อความ"}

[3] แนวทางภาพและเทคนิค (Visual & Technical Specs):
- สไตล์และเทคนิคภาพ: ${b.style}
- โทนภาพรวม (Visual Tone): ${b.visualTone}
- โทนสี (Color Tone): ${b.colorTone}
- การจัดวาง (Layout): ${b.layout}
- ความหนาแน่น (Density): ${b.density}
- จุดเน้นของภาพ (Focus): ${b.focus}

[4] Creative Quality Direction:
- ระดับคุณภาพ: ${b.qualityLevel}
- ทิศทางสร้างสรรค์: ${b.creativeDirection}
- กฎข้อความบนภาพ: ${b.textPolicy}
- กฎกันเว่อร์ / กันมั่ว: ${b.overdoGuard}

[5] ไฟล์แนบ / ภาพอ้างอิง:
${b.attachmentGuide}

[6] Smart Context (บริบทที่ระบบตรวจจับอัตโนมัติ):
${TANJAI.smartContextBlock(d)}

${TANJAI.v9ProtectedBlock(d, "image")}

**⚠️ คำสั่งพิเศษสำหรับ AI สร้างภาพ:**
1. โปรดอ่านหมวด [3] แนวทางภาพและเทคนิคอย่างละเอียด หากในสไตล์ภาพมีการระบุสเปกอุปกรณ์ หรือเทคนิคการจัดแสง ให้นำไปใช้เป็น "พารามิเตอร์เพื่อเรนเดอร์ภาพ" เท่านั้น
2. ห้ามนำชื่อสเปกกล้อง เลนส์ หรือชื่อเทคนิคการจัดแสง ไปเขียนเป็นตัวอักษรลงบนภาพเด็ดขาด

${TANJAI.outputDeliveryGuard("ภาพ")}`; 
// ^^^ เพิ่มบรรทัดนี้เข้ามา เพื่อบังคับให้ AI ต้องแนบไฟล์หรือส่งลิงก์ดาวน์โหลดเสมอครับ
};



/**
 * V9.1.3 Multi-output Prompt Generators
 * แก้ปัญหาเมนูโพสต์/พิธีกร/วิดีโอ/เสียง/สไลด์ ส่งออกเป็น Prompt ภาพผิดประเภท
 */
TANJAI.compactFacts = function(d = {}) {
  const lines = [];
  const push = (label, value) => {
    const clean = TANJAI.v9Clean(value || "", "");
    if(clean && !/ยังไม่ได้ระบุ|ไม่ระบุ|หัวข้องาน/.test(clean)) lines.push(`- ${label}: ${clean}`);
  };
  push("หัวข้อ", d.title);
  push("หน่วยงาน/แบรนด์", d.orgName);
  push("รายละเอียด", d.detail);
  push("วัน/เวลา", d.dateTime);
  push("สถานที่", d.place);
  push("บุคคล/หน่วยงานที่เกี่ยวข้อง", d.people);
  return lines.length ? lines.join("\n") : "- จากข้อมูลเบื้องต้น: ยังมีข้อมูลไม่มาก ให้จัดผลลัพธ์แบบเว้นช่องเติมภายหลัง และห้ามแต่งข้อมูลจริงเพิ่ม";
};

TANJAI.promptTaskGuard = function(kind="งาน") {
  return `ข้อกำชับการทำงาน:\n- ลงมือสร้าง${kind}จริงทันที ไม่ตอบกลับเป็นเพียงการสรุปบรีฟ\n- หากข้อมูลไม่พอ ให้ใช้คำว่า "จากข้อมูลเบื้องต้น" และเว้นช่องให้เติมภายหลัง\n- ห้ามแต่งชื่อบุคคล หน่วยงาน สถานที่ วันที่ ตัวเลข หรือข้อเท็จจริงใหม่เอง\n- ใช้ภาษาไทยอ่านง่าย สุภาพ พร้อมคัดลอกไปใช้งาน`;
};

TANJAI.postText = function(d = {}) {
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  const org = TANJAI.v9Clean(d.orgName, "");
  const detail = TANJAI.v9Clean(d.detail, "จากข้อมูลเบื้องต้น");
  const date = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const people = TANJAI.v9Clean(d.people, "");
  const bits = [];
  bits.push(`📌 ${title}`);
  bits.push("");
  if(people) bits.push(`${people}`);
  bits.push(`${detail}`);
  if(date || place){
    bits.push("");
    if(date) bits.push(`📅 ${date}`);
    if(place) bits.push(`📍 ${place}`);
  }
  if(org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org)){
    bits.push("");
    bits.push(`${org} ขอประชาสัมพันธ์ข้อมูลดังกล่าวให้ประชาชนและผู้เกี่ยวข้องได้รับทราบ`);
  }
  return bits.join("\n");
};

TANJAI.postPrompt = function(d = {}) {
  const ch = d.channel || "โพสต์ Facebook";
  const len = d.length || "มาตรฐาน อ่านง่าย";
  const extra = d.extra || "";

  // กำหนด output ตามประเภทงานที่เลือก
  const outputMap = {
    "สรุปงาน": {
      header: "ให้เรียบเรียงข้อมูลเป็นสรุปงานพร้อมใช้ทันที",
      outputs: ["สรุปงาน 1 ฉบับ (ภาษาราชการ อ่านง่าย)", "ย่อหน้าสำหรับแนบในอีเมลหรือเอกสาร", "ประเด็นสำคัญ 3–5 ข้อ (bullet)"]
    },
    "เรียบเรียงข้อมูล": {
      header: "ให้เรียบเรียงข้อมูลดิบให้อ่านง่ายและใช้งานได้จริง",
      outputs: ["เนื้อหาเรียบเรียงแล้ว", "เวอร์ชันสั้นสำหรับ caption/โพสต์", "ประเด็นสำคัญที่ไม่ควรตัด"]
    },
    "ข่าวประชาสัมพันธ์": {
      header: "ให้เขียนข่าวประชาสัมพันธ์ในรูปแบบข่าวมืออาชีพทันที",
      outputs: ["ข่าว PR ฉบับสมบูรณ์ (Lede, Body, Quote, Boilerplate)", "หัวข่าวสั้น 3 แบบ", "ข้อความโพสต์โซเชียลจากข่าว"]
    },
    "โพสต์ Facebook": {
      header: "ให้เขียนโพสต์ Facebook พร้อมใช้ทันที ไม่ต้องปรับแก้เพิ่ม",
      outputs: ["โพสต์ Facebook ฉบับเต็ม", "เวอร์ชันสั้น (caption style)", "แฮชแท็กที่เหมาะสม (ไม่แต่งชื่อโครงการใหม่)"]
    },
    "ข้อความ Line": {
      header: "ให้เขียนข้อความ Line OA พร้อมส่งทันที",
      outputs: ["ข้อความ Line ฉบับหลัก (กระชับ อ่านง่ายบนมือถือ)", "เวอร์ชันสั้นมาก 1–3 บรรทัด", "Link preview text (ถ้ามี)"]
    },
    "แคปชั่น": {
      header: "ให้เขียนแคปชั่นพร้อมใช้สำหรับภาพและคลิปทันที",
      outputs: ["แคปชั่นสั้น (1–2 บรรทัด)", "แคปชั่นยาว (3–5 บรรทัด)", "แฮชแท็ก 5–8 อัน"]
    }
  };

  const cfg = outputMap[ch] || outputMap["โพสต์ Facebook"];
  const outputList = cfg.outputs.map((o,i) => `${i+1}. ${o}`).join("\n");

  return `${TANJAI.v9ExecutionHeader(cfg.header)}

[1] ข้อมูลจริงของงาน:
${TANJAI.compactFacts(d)}

[2] รูปแบบที่ต้องการ:
- ประเภทผลลัพธ์: ${ch}
- ความยาว: ${len}
- กลุ่มเป้าหมาย: ${d.audience || "ให้ AI เลือกให้เหมาะสม"}
- โทนภาษา: ${d.tone || "ทางการ สุภาพ อ่านง่าย"}
${extra ? `- สิ่งที่อยากเน้น: ${extra}` : ""}

[3] สิ่งที่ต้องส่งออก (ส่งออกครบทุกข้อทันที ไม่ถามก่อน):
${outputList}

${TANJAI.promptTaskGuard(ch)}`;
};

TANJAI.mcScriptSample = function(d = {}) {
  const title = TANJAI.v9Clean(d.title, "ชื่องาน / พิธีการ");
  const date = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const people = TANJAI.v9Clean(d.people, "");
  return `สคริปต์พิธีกร\n\nเรียน แขกผู้มีเกียรติทุกท่าน\n\nขอต้อนรับทุกท่านเข้าสู่ “${title}”${date ? ` ในวันที่ ${date}` : ""}${place ? ` ณ ${place}` : ""}\n\n${people ? `ในโอกาสนี้ได้รับเกียรติจาก ${people} เข้าร่วมกิจกรรม` : "จากข้อมูลเบื้องต้น ขอให้ผู้จัดเติมชื่อประธาน แขกผู้มีเกียรติ และลำดับพิธีให้ครบถ้วนก่อนใช้งานจริง"}\n\nลำดับต่อไป ขอเรียนเชิญผู้เกี่ยวข้องดำเนินการตามกำหนดการ\n\nขอบพระคุณครับ/ค่ะ`;
};

TANJAI.mcPrompt = function(d = {}) {
  const mcType = d.channel || "สคริปต์พิธีกรเต็ม";
  const workType = d.workType || "งานพิธีกร / ผู้ดำเนินรายการ";
  const extra = d.extra || "";

  // กำหนด output ตามประเภทที่เลือก
  const outputMap = {
    "สคริปต์พิธีกรเต็ม": ["สคริปต์เปิดงาน", "คำเชิญประธาน (ถ้ามีประธาน)", "คำเชิญผู้กล่าวรายงาน", "คำเชื่อมช่วงกิจกรรมแต่ละช่วง", "สคริปต์ปิดงาน / ขอบคุณ", "เวอร์ชันย่อถืออ่านบนเวที"],
    "คำเชิญประธาน": ["คำเชิญประธานกล่าวเปิดงาน (ทางการ)", "คำเชิญแบบสั้นสำหรับกล่าวก่อนมอบไมค์", "คำเรียก/ตำแหน่งที่ควรใช้"],
    "คำเชิญผู้กล่าวรายงาน": ["คำเชิญผู้กล่าวรายงาน", "ย่อหน้าสรุปผู้กล่าว", "สคริปต์หลังผู้กล่าวจบ"],
    "คำกล่าวรายงาน": ["คำกล่าวรายงานฉบับสมบูรณ์", "เวอร์ชันสั้น 3–5 นาที", "เวอร์ชันสั้นมาก 1–2 นาที"],
    "คำกล่าวประธาน": ["คำกล่าวประธานฉบับสมบูรณ์", "เวอร์ชันสั้น", "ประเด็นที่ควรกล่าวถึง"],
    "คำเชื่อมช่วง": ["คำเชื่อมแต่ละช่วงกิจกรรม", "คำกล่าวระหว่างรอ", "คำกล่าวก่อนและหลังมอบรางวัล"],
    "สคริปต์เปิด / ปิดงาน": ["สคริปต์เปิดงาน", "สคริปต์ปิดงาน / ขอบคุณ", "คำเชิญถ่ายภาพร่วมกัน"],
    "เวอร์ชันย่อถืออ่าน": ["บัตรคำพูดพิธีกร (1 หน้า A5)", "ลำดับพิธีสรุปสั้น", "คำสำคัญที่ต้องออกเสียงถูกต้อง"],
    "ครบชุดพิธีกร": ["สคริปต์เปิด", "คำเชิญประธาน", "คำเชิญผู้กล่าวรายงาน", "คำเชื่อมทุกช่วง", "สคริปต์ปิด", "เวอร์ชันย่อถืออ่าน"]
  };

  const outputs = outputMap[mcType] || outputMap["สคริปต์พิธีกรเต็ม"];
  const outputList = outputs.map((o,i) => `${i+1}. ${o}`).join("\n");

  return `${TANJAI.v9ExecutionHeader(`ให้เขียน${mcType} พร้อมใช้บนเวทีทันที — ห้ามแต่งชื่อบุคคลหรือตำแหน่งเอง`)}

[1] ข้อมูลจริงของงาน:
${TANJAI.compactFacts(d)}

[2] รูปแบบที่ต้องการ:
- ประเภทงาน: ${workType}
- สิ่งที่ต้องสร้าง: ${mcType}
- ความยาว: ${d.length || "มาตรฐาน ใช้บนเวที"}
- โทนภาษา: ${d.tone || "ทางการ สุภาพ อ่านง่าย"}
${extra ? `- ข้อมูลพิเศษ: ${extra}` : ""}

[3] สิ่งที่ต้องส่งออก (ส่งออกครบทุกข้อทันที ไม่ถามก่อน):
${outputList}

กฎการเขียนสคริปต์พิธีกร:
- ใช้ภาษาพูดที่อ่านออกเสียงได้ลื่น ไม่ติดขัด
- ห้ามใช้คำย่อที่อ่านออกเสียงยาก
- ถ้าไม่มีชื่อประธานหรือผู้กล่าวรายงาน ให้ใช้ [ชื่อ-ตำแหน่ง] เพื่อให้ผู้ใช้เติมเอง
- แยกสคริปต์แต่ละส่วนด้วยหัวข้อชัดเจน

${TANJAI.promptTaskGuard("สคริปต์พิธีกร")}`;
};

TANJAI.videoStoryboard = function(d = {}, length="60 วินาที") {
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  const detail = TANJAI.v9Clean(d.detail, "จากข้อมูลเบื้องต้น");
  const date = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const seconds = /15/.test(length) ? 15 : /30/.test(length) ? 30 : /90/.test(length) ? 90 : /3/.test(length) ? 180 : 60;
  const scenes = seconds <= 15 ? 3 : seconds <= 30 ? 4 : seconds <= 60 ? 6 : seconds <= 90 ? 7 : 8;
  const per = Math.max(3, Math.round(seconds / scenes));
  const rows = [];
  for(let i=1;i<=scenes;i++){
    let focus = i===1 ? `Hook เปิดเรื่อง: ${title}` : i===scenes ? "ปิดท้าย / Call to Action" : `สาระสำคัญช่วงที่ ${i-1}`;
    let vo = i===1 ? `วันนี้พามาดูเรื่อง ${title}` : i===scenes ? "ติดตามข้อมูลจากช่องทางประชาสัมพันธ์ของหน่วยงาน" : detail;
    if(i===scenes-1 && (date || place)) vo = `${date ? `วันที่ ${date}` : ""}${date && place ? " / " : ""}${place ? `สถานที่ ${place}` : ""}`;
    rows.push(`Scene ${i} (${per} วินาที)\n- ภาพ: ${focus}\n- เสียงพากย์: ${vo}\n- ข้อความบนจอ: ${i===1 ? title : focus}`);
  }
  return rows.join("\n\n");
};

TANJAI.videoPrompt = function(d = {}, extra = {}) {
  const length = extra.length || d.length || "60 วินาที";
  return `${TANJAI.v9ExecutionHeader("ให้สร้างโครงคลิป / Storyboard / Voice Over / ข้อความบนจอทันที")}

[1] ข้อมูลจริงของงาน:
${TANJAI.compactFacts(d)}

[2] รูปแบบวิดีโอ:
- ความยาว: ${length}
- รูปแบบคลิป: ${d.format || d.channel || "คลิปประชาสัมพันธ์"}
- กลุ่มเป้าหมาย: ${d.audience || "ให้ AI เลือกให้เหมาะสม"}
- โทนภาษา: ${d.tone || "ทางการ สุภาพ อ่านง่าย"}

[3] สิ่งที่ต้องส่งออก:
1. Hook เปิดคลิป 3 แบบ
2. Storyboard แบ่ง Scene ตามความยาว
3. Voice Over ครบทั้งคลิป
4. ข้อความบนจอแต่ละ Scene
5. แนวภาพ / มุมกล้อง / จังหวะตัดต่อ
6. คำเตือนสิ่งที่ห้ามแต่งเพิ่ม

${TANJAI.v9ProtectedBlock(d, "video")}

${TANJAI.promptTaskGuard("โครงวิดีโอ")}`;
};

TANJAI.voiceScript = function(d = {}, length="60 วินาที", style="ทางการ สุภาพ") {
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  const detail = TANJAI.v9Clean(d.detail, "จากข้อมูลเบื้องต้น");
  const date = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const org = TANJAI.v9Clean(d.orgName, "");
  return `${title}\n\n${detail}\n\n${date ? `กำหนดการ ${date}\n` : ""}${place ? `สถานที่ ${place}\n` : ""}${org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org) ? `\nประชาสัมพันธ์โดย ${org}` : ""}\n\nหมายเหตุเสียง: โทน ${style} ความยาวประมาณ ${length} อ่านชัด เว้นจังหวะธรรมชาติ`;
};

TANJAI.voicePrompt = function(d = {}, extra = {}) {
  const length = extra.length || d.length || "60 วินาที";
  const style = extra.style || "ทางการ สุภาพ";
  return `${TANJAI.v9ExecutionHeader("ให้เขียนสคริปต์เสียงพากย์ภาษาไทยพร้อมอ่านทันที")}

[1] ข้อมูลจริงของงาน:
${TANJAI.compactFacts(d)}

[2] รูปแบบเสียง:
- ความยาวเสียง: ${length}
- สไตล์เสียง: ${style}
- โทนภาษา: ${d.tone || "ทางการ สุภาพ อ่านง่าย"}
- ช่องทางใช้งาน: ${d.channel || "คลิปประชาสัมพันธ์ / โซเชียล"}

[3] สิ่งที่ต้องส่งออก:
1. สคริปต์เสียงฉบับพร้อมอ่าน
2. เวอร์ชันสั้นมากสำหรับเปิดคลิป
3. จุดเว้นวรรค / จังหวะหายใจ
4. คำที่ควรเน้นเสียง

${TANJAI.promptTaskGuard("สคริปต์เสียง")}`;
};

TANJAI.deckOutline = function(d = {}, count=8) {
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  const detail = TANJAI.v9Clean(d.detail, "จากข้อมูลเบื้องต้น");
  const baseSlides = [
    ["หน้าปก", title],
    ["ที่มาและความสำคัญ", detail],
    ["วัตถุประสงค์", "สรุปเป้าหมายของงานให้ชัดเจน"],
    ["กลุ่มเป้าหมาย", d.audience || "ผู้เกี่ยวข้อง"],
    ["รายละเอียดการดำเนินงาน", detail],
    ["วัน เวลา และสถานที่", [d.dateTime, d.place].filter(Boolean).join(" / ") || "เว้นช่องเติมข้อมูลตามจริง"],
    ["ผลที่คาดว่าจะได้รับ", "สรุปประโยชน์ต่อประชาชน / ผู้เข้าร่วม / องค์กร"],
    ["สรุปและข้อเสนอ", "ปิดท้ายด้วยประเด็นสำคัญและขั้นตอนต่อไป"]
  ];
  const slides = [];
  for(let i=0;i<count;i++){
    const src = baseSlides[i] || [`ภาคผนวก ${i-7}`, "ข้อมูลประกอบเพิ่มเติม"];
    slides.push(`Slide ${i+1}: ${src[0]}\n- เนื้อหา: ${src[1]}\n- Speaker Notes: อธิบายให้กระชับ เชื่อมโยงกับหัวข้องาน และไม่เติมข้อมูลที่ไม่มีจริง`);
  }
  return slides.join("\n\n");
};

TANJAI.deckPrompt = function(d = {}, extra = {}) {
  const count = extra.count || 8;
  return `${TANJAI.v9ExecutionHeader("ให้จัดโครงสไลด์พร้อม Speaker Notes ทันที")}

[1] ข้อมูลจริงของงาน:
${TANJAI.compactFacts(d)}

[2] รูปแบบสไลด์:
- จำนวนสไลด์: ${count}
- รูปแบบ: ${d.format || d.channel || "นำเสนอโครงการ / รายงานผล"}
- โทนภาษา: ${d.tone || "ทางการ สุภาพ อ่านง่าย"}

[3] สิ่งที่ต้องส่งออก:
1. Outline สไลด์ตามจำนวนที่ระบุ
2. หัวข้อแต่ละสไลด์
3. Bullet สำคัญต่อสไลด์
4. Speaker Notes ภาษาไทย
5. คำแนะนำภาพประกอบต่อสไลด์ โดยไม่สร้างโลโก้/QR ปลอม

${TANJAI.promptTaskGuard("โครงสไลด์")}

${TANJAI.outputDeliveryGuard("สไลด์")}`;
};

TANJAI.promptPack = function(d = {}) {
  return `Universal Execution Prompt Pack\n\n[ข้อมูลตั้งต้น]\n${TANJAI.compactFacts(d)}\n\n========== 1) PROMPT ภาพ ==========
${TANJAI.imagePrompt(d)}\n\n========== 2) PROMPT โพสต์ ==========
${TANJAI.postPrompt(d)}\n\n========== 3) PROMPT วิดีโอ ==========
${TANJAI.videoPrompt(d, {length: d.length || "60 วินาที"})}\n\n========== 4) PROMPT เสียงพากย์ ==========
${TANJAI.voicePrompt(d, {length: d.length || "60 วินาที", style: d.tone || "ทางการ สุภาพ"})}\n\n========== 5) PROMPT สไลด์ ==========
${TANJAI.deckPrompt(d, {count: 8})}`;
};


/**
 * Execution Prompt Router - dispatches to correct prompt generator
 */
TANJAI.executionPrompt = function(type, d, extra = {}) {
  if (type === "image") return TANJAI.imagePrompt(d, "gpt");
  if (type === "post") return TANJAI.postPrompt(d);
  if (type === "mc") return TANJAI.mcPrompt(d);
  if (type === "video") return TANJAI.videoPrompt(d, extra);
  if (type === "voice") return TANJAI.voicePrompt(d, extra);
  if (type === "deck") return TANJAI.deckPrompt(d, extra);
  if (type === "kit") return TANJAI.promptPack(d);
  return TANJAI.postPrompt(d);
};



/**
 * AI Router Suggestion - maps user intent to the best menu
 */
TANJAI.routerSuggest = function(query = "") {
  const q = String(query || "").toLowerCase();
  let view = "image";
  let reason = "โจทย์นี้เหมาะกับการเริ่มจาก Prompt ภาพ เพราะต้องจัดสารหลักและภาพรวมให้ชัดก่อน";
  const has = (re) => re.test(q);
  if(has(/ชุดสื่อ|ครบชุด|หลายสื่อ|all[- ]?in[- ]?one|ภาพ.*โพสต์.*คลิป|ทำทั้งหมด/)){
    view = "kit"; reason = "ต้องการผลลัพธ์หลายแบบจากข้อมูลเดียว จึงควรเริ่มที่เมนูสร้างชุดสื่อ";
  }else if(has(/โพสต์|แคปชั่น|caption|facebook|line|เรียบเรียง|สรุปงาน|ข่าวประชาสัมพันธ์/)){
    view = "post"; reason = "โจทย์เน้นข้อความพร้อมเผยแพร่ จึงควรใช้เมนูเรียบเรียงเนื้อหา";
  }else if(has(/พิธีกร|ประธาน|กล่าวรายงาน|คำกล่าว|ดำเนินรายการ|เวที/)){
    view = "mc"; reason = "โจทย์เกี่ยวกับงานเวทีและลำดับพิธี จึงควรใช้เมนูงานพิธีกร";
  }else if(has(/วิดีโอ|วีดีโอ|คลิป|storyboard|reels|tiktok|capcut|ซีน|scene/)){
    view = "video"; reason = "โจทย์ต้องจัดลำดับภาพ เสียง และข้อความบนจอ จึงควรใช้เมนูทำวิดีโอ";
  }else if(has(/เสียง|พากย์|voice|อ่าน|สคริปต์เสียง|บรรยาย/)){
    view = "voice"; reason = "โจทย์ต้องการภาษาสำหรับอ่านออกเสียง จึงควรใช้เมนูเสียงพากย์";
  }else if(has(/สไลด์|powerpoint|ppt|นำเสนอ|พรีเซนต์|deck|speaker notes/)){
    view = "deck"; reason = "โจทย์เป็นงานนำเสนอ จึงควรใช้เมนูทำสไลด์";
  }else if(has(/ชุดภาพ|อัลบั้ม|หลายภาพ|facebook album|zip|กรอบภาพ/)){
    view = "album"; reason = "โจทย์เน้นภาพจริงหลายใบพร้อมกรอบและแคปชั่น จึงควรใช้เมนูชุดภาพโพสต์ Facebook";
  }
  const labels = {image:"สร้างภาพ", kit:"สร้างชุดสื่อ", post:"เรียบเรียงเนื้อหา", mc:"งานพิธีกร", video:"ทำวิดีโอ", voice:"เสียงพากย์", deck:"ทำสไลด์", album:"ชุดภาพโพสต์ Facebook"};
  const text = `เมนูที่แนะนำ: ${labels[view] || "สร้างภาพ"}\n\nเหตุผล:\n${reason}\n\nขั้นตอนต่อไป:\n1. กด “ไปที่เมนูที่แนะนำ”\n2. กรอกหัวข้อ หน่วยงาน รายละเอียด วันเวลา และสถานที่ตามจริง\n3. กดสร้าง Prompt แล้วคัดลอกไปใช้กับเครื่องมือปลายทาง\n\nหมายเหตุ: ระบบจะไม่แต่งข้อมูลจริงเพิ่มเอง ถ้าข้อมูลไม่ครบให้ใช้คำว่า “จากข้อมูลเบื้องต้น”`;
  return { view, text };
};


/**
 * Discuss Prompt - for refinement and feedback (อัปเดตโครงสร้างแบบ Block ให้ AI ตรวจทานง่ายขึ้น)
 */
TANJAI.discussPrompt = function(type, d) {
  const b = TANJAI.v91BuildSharedBrief(d, type);
  const taskNames = {
    image: "ภาพประชาสัมพันธ์",
    album: "ชุดภาพโพสต์ Facebook",
    post: "เรียบเรียงเนื้อหา / สรุปงาน",
    mc: "สคริปต์พิธีกร / ผู้ดำเนินรายการ",
    video: "วิดีโอ / Storyboard",
    voice: "สคริปต์เสียง",
    deck: "สไลด์",
    kit: "Prompt Pack"
  };

  return `[โหมดผู้ช่วยคิดและตรวจทานคำสั่ง]
หน้าที่ของคุณตอนนี้คือ "ช่วยตรวจและปรับปรุงบรีฟ" สำหรับงานประเภท "${taskNames[type] || "สื่อประชาสัมพันธ์"}"
⚠️ **คำสั่งสำคัญ:** ยังไม่ต้องสร้างผลงานสุดท้ายออกมา แต่ให้ช่วยวิเคราะห์และวิจารณ์ข้อมูลบรีฟด้านล่างนี้ให้คมคายที่สุด เพื่อเตรียมความพร้อมก่อนนำไปใช้งานจริง

[1] ข้อมูลบรีฟเบื้องต้น (Raw Brief):
- หัวข้อหลัก: ${b.title}
- เจ้าของงาน: ${b.orgName}
- จุดประสงค์: ${b.purpose}
- กลุ่มเป้าหมาย: ${b.audience}
- ทิศทางงาน (Style/Tone): ${b.style} / ${b.tone}
- รายละเอียดเพิ่มเติม:
  ${b.detail}

[2] สิ่งที่คุณต้องช่วยวิเคราะห์และนำเสนอ (เรียงตามลำดับ):
1. จุดเด่นและจุดบอด: ข้อมูลในหมวด [1] มีจุดไหนที่ยังกว้างไป หรือควรระบุให้ชัดเจนขึ้นเพื่อผลลัพธ์ที่ดีที่สุด?
2. ข้อควรระวังในการสื่อสาร: มีคำศัพท์เฉพาะ การสะกดคำ หรือประเด็นละเอียดอ่อนใดที่ต้องระวังเป็นพิเศษหรือไม่?
3. ข้อเสนอแนะเชิงเทคนิค: (หากเป็นงานภาพหรือวิดีโอ) มีเทคนิคการจัดแสง สเปกกล้อง การจัดเลย์เอาต์ หรือวิธีการนำเสนอที่อยากแนะนำเพิ่มเติมให้เข้ากับหัวข้อหรือไม่?
4. ร่าง Prompt ฉบับปรับปรุง: เสนอชุดคำสั่ง (Prompt) ที่กระชับ ครอบคลุม และเรียบเรียงได้ดีกว่าเดิม 1 รูปแบบ เพื่อให้ผู้ใช้นำไปก๊อปปี้ใช้งานต่อได้ทันที

${TANJAI.v9ProtectedBlock(d, type)}`;
};

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = TANJAI;
}

/**
 * In-App Image Generator using Pollinations.ai
 * DNA: Keep the style consistent with high-quality tech aesthetics
 */
TANJAI.generateInAppImage = async function(d) {
  const prompt = TANJAI.imagePrompt(d); // ใช้ Prompt ที่คุณทำไว้ดีอยู่แล้ว
  const encodedPrompt = encodeURIComponent(prompt);
  
  // ใช้ Model FLUX ในการวาดภาพเพื่อความสมจริง
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random()*1000)}`;
  
  return imageUrl;
};

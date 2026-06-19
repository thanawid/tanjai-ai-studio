window.TANJAI = window.TANJAI || {};
TANJAI.$ = s => document.querySelector(s);
TANJAI.$$ = s => Array.from(document.querySelectorAll(s));


TANJAI.outputDeliveryGuard = function(type="ไฟล์"){
  return `

ข้อกำชับการส่งมอบไฟล์:
- หากมีการสร้าง${type} ไฟล์ภาพ ไฟล์เอกสาร ไฟล์สไลด์ ไฟล์เสียง ไฟล์วิดีโอ หรือไฟล์ ZIP ต้องแนบไฟล์จริงในแชทให้ผู้ใช้ดาวน์โหลดได้
- ห้ามตอบกลับมาเป็น path ภายในระบบอย่างเดียว เช่น /mnt/data/filename.png
- ต้องแสดงลิงก์ดาวน์โหลดแบบกดได้ เช่น [ดาวน์โหลดไฟล์](sandbox:/mnt/data/filename.png)
- หากเป็นภาพ ให้แสดงตัวอย่างภาพหรือแนบภาพจริงในแชทด้วย
- หากไม่สามารถแนบไฟล์ได้ ให้บอกตรง ๆ ว่าทำไม่ได้ พร้อมอธิบายสาเหตุสั้น ๆ`;
};

TANJAI.commonData = function(prefix){
  const v = id => (TANJAI.$(`#${prefix}-${id}`)?.value || "").trim();
  const c = id => { const el = TANJAI.$(`#${prefix}-${id}`); return !!(el && (el.checked || el.value === "on" || el.value === "true")); };
  return {
    title: v("title") || "หัวข้องาน",
    orgName: v("orgName") || "ทันใจ AI Studio",
    orgType: v("orgType") || "ไม่ระบุ",
    audience: v("audience") || "กลุ่มเป้าหมายหลัก",
    tone: v("tone") || "ทางการ สุภาพ อ่านง่าย",
    mainCategory: v("mainCategory") || "ไม่ระบุ",
    subCategory: v("subCategory") || "ไม่ระบุ",
    workType: v("workType") || "",
    channel: v("channel") || "",
    length: v("length") || "",
    detail: v("detail") || "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม",
    dateTime: v("dateTime") || "",
    place: v("place") || "",
    people: v("people") || "",
    style: v("style") || "Modern Premium Clean",
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
    smartMunicipal: c("smartMunicipal")
  };

};

TANJAI.promptCritic = function(d){
  const mode = d.useMode || "สร้างภาพใหม่ด้วย AI";
  const photoCount = Number(d.photoCount || 0);
  const isRealMode = mode !== "สร้างภาพใหม่ด้วย AI";
  const hasPhotos = photoCount > 0;
  const titleOk = !!(d.title && d.title !== "หัวข้องาน");
  const orgOk = !!(d.orgName && d.orgName !== "ทันใจ AI Studio");
  const detailOk = !!(d.detail && d.detail !== "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม" && d.detail.length >= 20);
  const hasDate = !!d.dateTime;
  const hasPlace = !!d.place;
  const hasPeople = !!d.people;
  const hasAvoid = !!d.avoid;
  const hasSize = !!d.size;
  const safeFace = !!d.safeFace;
  const safeNoNew = !!d.safeNewPerson;
  const safeNoCover = !!d.safeNoCover;
  const outputGuard = typeof TANJAI.outputDeliveryGuard === "function";

  let score = 35;
  const good = [];
  const missing = [];
  const risks = [];
  const suggestions = [];
  const attach = [];

  if(titleOk){ score += 10; good.push("มีหัวข้องานชัดเจน"); } else { missing.push("หัวข้องานยังไม่ชัด ควรระบุชื่อเรื่องหลักของภาพ"); }
  if(orgOk){ score += 8; good.push("มีชื่อองค์กร/แบรนด์"); } else { missing.push("ชื่อองค์กรยังไม่ชัด ควรระบุหน่วยงานเจ้าของงาน"); }
  if(detailOk){ score += 14; good.push("มีรายละเอียดงานเพียงพอ"); } else { missing.push("รายละเอียดงานยังน้อย ควรเพิ่มว่า ใคร / ทำอะไร / ที่ไหน / เมื่อไหร่ / ต้องการให้กลุ่มเป้าหมายทำอะไร"); }
  if(hasSize){ score += 5; good.push("กำหนดขนาดหรือช่องทางใช้งานแล้ว"); }
  if(hasDate){ score += 6; good.push("มีวัน/เวลา"); } else { suggestions.push("ถ้างานมีเส้นตายหรือกิจกรรม ควรเพิ่มวัน/เวลาเพื่อให้ภาพครบถ้วน"); }
  if(hasPlace){ score += 5; good.push("มีสถานที่"); } else { suggestions.push("ถ้างานมีสถานที่จริง ควรเพิ่มสถานที่เพื่อให้กลุ่มเป้าหมายเข้าใจทันที"); }
  if(hasPeople){ score += 4; good.push("มีบุคคลหรือหน่วยงานที่เกี่ยวข้อง"); } else { suggestions.push("ถ้ามีผู้บริหาร/หน่วยงานรับผิดชอบ ควรใส่ชื่อให้สะกดถูก"); }
  if(hasAvoid){ score += 4; good.push("มีข้อห้าม/หมายเหตุ"); }
  if(outputGuard){ score += 4; good.push("มี Output Delivery Guard กันปัญหาไฟล์โหลดไม่ได้"); }

  if(isRealMode){
    if(hasPhotos){ score += 8; good.push("เลือกโหมดภาพจริงและมีภาพแนบ"); }
    else { risks.push("เลือกโหมดภาพจริง แต่ยังไม่มีภาพแนบ อาจทำให้ GPT ไม่สามารถคงบุคคล/ฉากเดิมได้"); score -= 5; }
    if(safeFace && safeNoNew && safeNoCover){ score += 8; good.push("เปิดระบบกันหน้าเพี้ยนครบถ้วน"); }
    else { risks.push("ระบบกันหน้าเพี้ยนยังไม่ครบ ควรเปิดห้ามเปลี่ยนใบหน้า / ห้ามสร้างบุคคลใหม่ / ห้ามบังใบหน้า"); }
  }else{
    if(hasPhotos){ risks.push("มีภาพแนบแต่เลือกสร้างภาพใหม่ บุคคลหรือฉากอาจเปลี่ยนจากต้นฉบับ"); score -= 7; }
    else { score += 3; good.push("โหมดสร้างใหม่เหมาะกับงานที่ไม่มีภาพจริงต้องคงต้นฉบับ"); }
  }

  if((d.avoid || "").includes("QR") || (d.detail || "").includes("QR") || (d.detail || "").includes("LINE")){
    attach.push("QR Code จริง / LINE QR จริง");
  }
  if((d.detail || "").includes("โลโก้") || (d.avoid || "").includes("โลโก้") || (d.orgName || "").includes("เทศบาล")){
    attach.push("โลโก้องค์กรจริง");
  }
  if(isRealMode || hasPhotos){
    attach.push("ภาพถ่ายจริงความละเอียดสูง");
  }
  if((d.detail || "").includes("ภาษี") || (d.title || "").includes("ภาษี")){
    suggestions.push("งานภาษีควรเน้นวันครบกำหนด ช่องทางชำระ และหน่วยงานรับผิดชอบให้เด่นที่สุด");
  }
  if((d.title || "").includes("แจ้ง") || (d.mainCategory || "").includes("แจ้งข่าว")){
    suggestions.push("งานแจ้งข่าวควรจัดลำดับ: หัวข้อด่วน / พื้นที่ได้รับผลกระทบ / ระยะเวลา / ช่องทางสอบถาม");
  }

  score = Math.max(0, Math.min(100, score));
  const level = score >= 90 ? "พร้อมมาก" : score >= 75 ? "พร้อมใช้งาน" : score >= 60 ? "พอใช้ แต่ควรเติมข้อมูล" : "ยังควรปรับก่อนส่ง";
  const verdict = score >= 85 ? "ใช้ส่งเข้า GPT ได้เลย" : score >= 70 ? "ใช้ได้ แต่เติมข้อมูลอีกนิดจะดีขึ้น" : "ควรเติมข้อมูลก่อนส่งเข้า GPT";
  const scoreIcon = score >= 90 ? "🟢" : score >= 75 ? "🟡" : score >= 60 ? "🟠" : "🔴";

  const list = (arr, fallback) => arr.length ? arr.map(x => `- ${x.replace(/^- /,"")}`).join("\n") : `- ${fallback}`;

  return `${scoreIcon} คะแนนความพร้อม: ${score}/100
สถานะ: ${level}
คำแนะนำสั้น: ${verdict}

ข้อมูลที่ครบแล้ว:
${list(good, "ยังไม่มีข้อมูลเด่นชัดมากพอ")}

ข้อมูลที่ยังควรเพิ่ม:
${list(missing, "ไม่มีข้อมูลจำเป็นที่ขาดชัดเจน")}

ความเสี่ยงที่ควรระวัง:
${list(risks, "ไม่พบความเสี่ยงสำคัญ")}

ข้อเสนอแนะเพื่อให้งานดูมืออาชีพขึ้น:
${list(suggestions, "โครง Prompt พร้อมใช้งานแล้ว")}

ไฟล์ที่ควรแนบก่อนส่งเข้า GPT:
${list([...new Set(attach)], "ไม่มีไฟล์แนบจำเป็นเพิ่มเติม")}

Checklist ก่อนกดเปิด ทันใจ GPT:
- ตรวจสะกดชื่อหน่วยงาน / ชื่อบุคคล / วันที่
- แนบโลโก้จริงหากต้องใช้โลโก้
- แนบ QR Code จริง ห้ามให้ AI สร้าง QR ปลอม
- ถ้ามีภาพบุคคลจริง ให้ใช้โหมดภาพจริงและเปิดระบบกันหน้าเพี้ยน
- หลัง GPT สร้างไฟล์ ต้องให้แนบลิงก์ดาวน์โหลด ไม่ตอบเป็น /mnt/data/... เฉย ๆ`;
};

TANJAI.imagePrompt = function(d, outputMode="gpt"){
  const hasPhotos = Number(d.photoCount || 0) > 0;
  const photoCount = Number(d.photoCount || 0);
  const photoNames = d.photoNames || "";
  const mode = d.useMode || (hasPhotos ? "ใช้ภาพจริงเป็นต้นฉบับ" : "สร้างภาพใหม่ด้วย AI");
  const level = d.originalityLevel || "สูงสุด — คงคน คงฉาก คงองค์ประกอบเดิมมากที่สุด";

  const fixThaiTypos = (text="") => String(text)
    .replaceAll("ประชม", "ประชุม")
    .replaceAll("พ.ศ.2571-2575", "พ.ศ. 2571–2575")
    .replaceAll("พ.ศ. 2571-2575", "พ.ศ. 2571–2575");

  const clean = (text, fallback="ไม่ระบุ") => {
    const value = fixThaiTypos(text || "").trim();
    return value || fallback;
  };

  const title = clean(d.title, "หัวข้องาน");
  const orgName = clean(d.orgName, "ทันใจ AI Studio");
  const detail = clean(d.detail, "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม");
  const dateTime = clean(d.dateTime, "ไม่ระบุ ให้เว้นพื้นที่สำหรับเติมภายหลัง");
  const place = clean(d.place, "ไม่ระบุ ให้เว้นพื้นที่สำหรับเติมภายหลัง");
  const people = clean(d.people, "ไม่ระบุ ให้ใช้ชื่อองค์กรหลักแทน");
  const size = clean(d.size, "4:5 Facebook / Line 1080x1350");
  const style = clean(d.style, "Modern Premium Clean");
  const colorTone = clean(d.colorTone, "ม่วง–ทอง พรีเมียม");
  const density = clean(d.density, "สมดุล อ่านง่าย");
  const focus = clean(d.focus, "เน้นหัวข้อหลัก");
  const tone = clean(d.tone, "โปรโมทแบบทันสมัย");
  const layout = clean(d.layout, "Infographic Layout");
  const orgType = clean(d.orgType, "ไม่ระบุ");
  const mainCategory = clean(d.mainCategory, "ภาพประชาสัมพันธ์");
  const subCategory = clean(d.subCategory, "ไม่ระบุ");
  const audience = clean(d.audience, "กลุ่มเป้าหมายหลัก");

  const photoLine = hasPhotos ? `มีภาพแนบ ${photoCount} รูป (${photoNames})` : "ไม่มี";
  const imageModeLine = hasPhotos
    ? `- โหมดการใช้ภาพ: ${mode}\n- ระดับการคงต้นฉบับ: ${level}`
    : `- โหมดการใช้ภาพ: สร้างภาพใหม่ด้วย AI`;

  const textOnImage = `ข้อความหลัก:
${title}

ข้อความรอง / รายละเอียด:
${detail}`;

  const extraNotes = [
    d.dateTime ? `วัน / เวลา: ${clean(d.dateTime)}` : "วัน / เวลา: ยังไม่ระบุ ให้เว้นพื้นที่สำหรับเติมภายหลัง",
    d.place ? `สถานที่: ${clean(d.place)}` : "สถานที่: ยังไม่ระบุ ให้เว้นพื้นที่สำหรับเติมภายหลัง",
    d.people ? `บุคคล / หน่วยงานที่เกี่ยวข้อง: ${clean(d.people)}` : "บุคคล / หน่วยงานที่เกี่ยวข้อง: ไม่ระบุ ให้ใช้ชื่อองค์กรหลักแทน",
    hasPhotos ? `ภาพแนบ: ใช้อ้างอิงจากไฟล์แนบในแชทนี้ (${photoNames})` : "ภาพแนบ: ไม่มี"
  ].join("\n- ");

  const realPhotoRules = hasPhotos ? `
- ใช้ภาพแนบเป็น reference ตามคำสั่งผู้ใช้
- หากมีภาพบุคคล ให้คงอัตลักษณ์เดิม ห้ามเปลี่ยนใบหน้า
- ห้ามสร้างบุคคลใหม่แทนบุคคลในภาพจริง` : "";

  const importantRules = `- สร้างภาพประชาสัมพันธ์ภาษาไทยให้ดูเป็นงานมืออาชีพ
- ใช้ visual hierarchy ชัดเจน หัวข้อหลักเด่นมาก รายละเอียดรองอ่านง่าย
- จัดองค์ประกอบให้เหมาะกับสัดส่วน ${size}
- ใช้สไตล์ ${style}
- ใช้โทนสี ${colorTone}
- ใช้ Layout: ${layout}
- ความหนาแน่น: ${density}
- จุดเด่นของภาพ: ${focus}
- อารมณ์ภาพ: ${tone}
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- ข้อความภาษาไทยต้องสะกดถูก${realPhotoRules}`;

  const summary = `- ประเภทองค์กร: ${orgType}
- ชื่อองค์กร / รายละเอียด: ${orgName}
- ประเภทภาพ: ${mainCategory}
- หัวข้องานย่อย: ${subCategory}
- กลุ่มเป้าหมาย: ${audience}
- ช่องทางใช้งาน / ขนาดภาพ: ${size}
${imageModeLine}
- โทนภาพ: ${style}
- โทนสี: ${colorTone}
- แนวภาพ / Layout: ${layout}
- ความหนาแน่น: ${density}
- สิ่งที่คนดูควรรู้: ${detail}
- อารมณ์ที่ภาพควรสื่อ: ${tone}, อ่านง่าย น่าเชื่อถือ และเหมาะกับงานประชาสัมพันธ์
- วัน / เวลา: ${dateTime}
- สถานที่: ${place}
- บุคคล / หน่วยงานที่เกี่ยวข้อง: ${people}
- ภาพแนบ: ${photoLine}`;

  const gptDestination = `คำสั่งปลายทาง:
กรุณาสร้างภาพประชาสัมพันธ์จริงทันทีจากข้อมูลนี้ สำหรับ ${orgName} ในขนาด ${size} โดยใช้สไตล์ ${style} โทนสี ${colorTone} และจัดวางให้เหมาะกับงานประชาสัมพันธ์ไทย หากมีโลโก้ QR Code หรือภาพแนบในแชทนี้ ให้ใช้อ้างอิงจากไฟล์แนบดังกล่าว`;

  const promptDestination = `คำสั่งปลายทาง:
กรุณาจัด Prompt สำหรับสร้างภาพจากข้อมูลนี้ให้พร้อมใช้งาน โดยยังไม่ต้องสร้างภาพจริง`;

  if(outputMode === "prompt"){
    return `Prompt สำหรับสร้างภาพ

สร้างภาพประชาสัมพันธ์ภาษาไทยสำหรับ “${orgName}”
หัวข้อหลักคือ “${title}”

รายละเอียดงาน:
${detail}

รูปแบบภาพ:
- ขนาด: ${size}
- สไตล์: ${style}
- โทนสี: ${colorTone}
- Layout: ${layout}
- ความหนาแน่น: ${density}
- อารมณ์ภาพ: ${tone}
- กลุ่มเป้าหมาย: ${audience}

ข้อความบนภาพ:
${textOnImage}

หมายเหตุ:
- ${extraNotes}
- หากมีโลโก้หรือ QR Code ให้ใช้ไฟล์จริงเท่านั้น
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- ข้อความภาษาไทยต้องสะกดถูก

${promptDestination}`;
  }

  return `คำสั่งพร้อมใช้สำหรับทันใจ GPT

สรุปข้อมูลที่ใช้:
${summary}

ข้อความบนภาพที่แนะนำ:
${textOnImage}

หมายเหตุเพิ่มเติม:
- ${extraNotes}
- หากต้องใส่โลโก้หรือ QR Code ให้ใช้ไฟล์จริงเท่านั้น

เงื่อนไขสำคัญ:
${importantRules}

${gptDestination}`;
};



TANJAI.postText = function(d){
  return `📌 ${d.title}

${d.detail}

${d.dateTime ? "📅 " + d.dateTime + "\\n" : ""}${d.place ? "📍 " + d.place + "\\n" : ""}${d.people ? "\\n" + d.people + "\\n" : ""}
${d.orgName} ขอประชาสัมพันธ์ข้อมูลดังกล่าวให้ ${d.audience} ได้รับทราบ

#${d.orgName.replaceAll(" ","")} #ประชาสัมพันธ์ #ทันใจAIStudio`;
};

TANJAI.mcScriptSample = function(d){
  return `สคริปต์พิธีกร: ${d.title}

ช่วงเปิดงาน:
เรียน ท่านประธานในพิธี คณะผู้บริหาร แขกผู้มีเกียรติ และผู้เข้าร่วมงานทุกท่าน
ขอต้อนรับทุกท่านเข้าสู่งาน “${d.title}” จัดโดย ${d.orgName}

คำเชิญประธาน:
ลำดับต่อไป ขอเรียนเชิญ [เติมชื่อประธานในพิธี] ขึ้นกล่าวเปิดงาน
ขอเรียนเชิญครับ/ค่ะ

คำเชื่อมช่วง:
ขอขอบพระคุณท่านประธานเป็นอย่างสูง
ลำดับต่อไปเป็นช่วง [เติมกิจกรรมถัดไป]

ช่วงปิดงาน:
ในนามของผู้จัดงาน ขอขอบพระคุณทุกท่านที่ให้เกียรติเข้าร่วมกิจกรรมในครั้งนี้
ขอให้ทุกท่านเดินทางกลับโดยสวัสดิภาพ ขอบคุณครับ/ค่ะ`;
};


TANJAI.videoStoryboard = function(d, length="60 วินาที"){
  return `Storyboard วิดีโอ: ${d.title}
ความยาว: ${length}
โทน: ${d.tone}

Scene 1: เปิดคลิป / Hook
ภาพ: หัวข้อใหญ่ + ภาพประกอบที่เกี่ยวข้อง
ข้อความบนจอ: ${d.title}
เสียงพากย์: เรื่องสำคัญที่ควรรู้จาก ${d.orgName}

Scene 2: อธิบายรายละเอียด
ภาพ: ภาพกิจกรรม / motion graphic / ภาพประกอบ
ข้อความบนจอ: รายละเอียดสำคัญ
เสียงพากย์: ${d.detail}

Scene 3: วันเวลา / สถานที่ / สิ่งที่ต้องทำ
ภาพ: กล่องข้อมูลอ่านง่าย
ข้อความบนจอ: ${d.dateTime || "ระบุวันเวลา"} / ${d.place || "ระบุสถานที่"}
เสียงพากย์: ขอให้ติดตามรายละเอียดและดำเนินการตามข้อมูลดังกล่าว

Scene 4: ปิดคลิป
ภาพ: โลโก้และชื่อหน่วยงาน
ข้อความบนจอ: ${d.orgName}
เสียงพากย์: ด้วยความห่วงใยจาก ${d.orgName}${TANJAI.outputDeliveryGuard("วิดีโอหรือไฟล์ประกอบ")}`;
};

TANJAI.voiceScript = function(d, length="60 วินาที", style="ทางการ สุภาพ"){
  const fixThaiTypos = (text="") => String(text)
    .replaceAll("ประชม", "ประชุม")
    .replaceAll("พ.ศ.2571-2575", "พ.ศ. 2571–2575")
    .replaceAll("พ.ศ. 2571-2575", "พ.ศ. 2571–2575")
    .replaceAll("\\n", "\n");

  const clean = (text, fallback="") => {
    const value = fixThaiTypos(text || "").trim();
    return value || fallback;
  };

  const org = clean(d.orgName, "ชื่อหน่วยงาน / แบรนด์");
  const title = clean(d.title, "ข้อมูลประชาสัมพันธ์");
  const detail = clean(d.detail, "");
  const dateTime = clean(d.dateTime, "");
  const place = clean(d.place, "");
  const people = clean(d.people, "");
  const audience = clean(d.audience, "กลุ่มเป้าหมายหลัก");
  const isShort = String(length).includes("15");
  const isThirty = String(length).includes("30");

  // แยกข้อมูลจากรายละเอียดให้เป็นย่อหน้าอ่านออกเสียงได้จริง
  const detailLines = detail
    .split(/\n+/)
    .map(x => clean(x))
    .filter(Boolean);

  const hasPeopleInDetail = people || /นาย|นาง|คณะผู้บริหาร|ผู้บริหาร|เจ้าหน้าที่|กำนัน|ผู้ใหญ่บ้าน/.test(detail);
  const hasPlaceInDetail = place || /ณ |บริเวณ|พื้นที่|หมู่ที่|ตำบล|อำเภอ|ศูนย์|ห้องประชุม/.test(detail);
  const hasDateInDetail = dateTime || /วันที่|วันจันทร์|วันอังคาร|วันพุธ|วันพฤหัสบดี|วันศุกร์|วันเสาร์|วันอาทิตย์/.test(detail);

  const opening = `${org} ขอประชาสัมพันธ์ข่าวสารให้กลุ่มเป้าหมายได้รับทราบ`;

  const dateBlock = dateTime ? `${dateTime}` : "";
  const peopleBlock = people ? `${people}` : "";
  const titleBlock = title && title !== "ข้อมูลประชาสัมพันธ์" ? title : "";

  let missionBlock = "";
  if(detailLines.length){
    missionBlock = detailLines.join("\n");
  }else{
    const parts = [];
    if(dateBlock) parts.push(`วันที่ ${dateBlock}`);
    if(peopleBlock) parts.push(peopleBlock);
    if(titleBlock) parts.push(titleBlock);
    missionBlock = parts.join("\n");
  }

  let locationBlock = "";
  if(place){
    locationBlock = `การดำเนินงานดังกล่าวจัดขึ้น ณ ${place}`;
  }

  let benefitBlock = "";
  if(/เตรียมความพร้อม|ประชุม|ร่วมประชุม|ประชาคม|กิจกรรม|โครงการ|พัฒนา|ชุมชน|ช่วยเหลือ|ตรวจสอบ/.test(detail + title)){
    benefitBlock = "เพื่อเตรียมความพร้อมในการดำเนินงาน ส่งเสริมการพัฒนาชุมชน และสนับสนุนการให้บริการกลุ่มเป้าหมายอย่างต่อเนื่อง";
  }else{
    benefitBlock = "เพื่อให้กลุ่มเป้าหมายได้รับทราบข้อมูลข่าวสาร และสามารถติดตามการดำเนินงานของหน่วยงานได้อย่างต่อเนื่อง";
  }

  const closing = `${org} ขอประชาสัมพันธ์ข้อมูลดังกล่าวให้${audience}ได้รับทราบ`;
  const signature = `${org}\nสโลแกน / ข้อความปิดท้าย / แฮชแท็ก / คำเชิญชวน`;

  if(isShort){
    return `${opening}

${titleBlock || missionBlock}

${dateTime ? `วันที่ ${dateTime}` : ""}${place ? `\nณ ${place}` : ""}

${closing}`.replace(/\n{3,}/g, "\n\n").trim();
  }

  if(isThirty){
    return `${opening}

${dateTime ? `วันที่ ${dateTime}` : ""}
${peopleBlock ? peopleBlock : ""}
${titleBlock ? titleBlock : detailLines.slice(0, 2).join("\n")}

${place ? `การดำเนินงานดังกล่าวจัดขึ้น ณ ${place}` : ""}
${benefitBlock}

${closing}`.replace(/\n{3,}/g, "\n\n").trim();
  }

  // 60 วินาทีขึ้นไป: จัดเป็นสคริปต์ประกาศข่าวท้องถิ่น มีจังหวะหายใจ
  const mainParagraph = [
    dateTime ? `วันที่ ${dateTime}` : "",
    peopleBlock,
    detailLines.length ? detailLines.join("\n") : titleBlock
  ].filter(Boolean).join("\n");

  return `${opening}

${mainParagraph}

${locationBlock}

${benefitBlock}

${closing}

${signature}`.replace(/\n{3,}/g, "\n\n").trim();
};

TANJAI.deckOutline = function(d, count=8){
  const heads = ["หน้าปก","ที่มาและความสำคัญ","วัตถุประสงค์","กลุ่มเป้าหมาย","รายละเอียดกิจกรรม/โครงการ","ขั้นตอนดำเนินงาน","ผลที่คาดว่าจะได้รับ","สรุปและข้อเสนอ","ภาพประกอบ","ถาม-ตอบ"];
  let out = `Outline สไลด์: ${d.title}
หน่วยงาน: ${d.orgName}
กลุ่มผู้ฟัง: ${d.audience}

`;
  for(let i=0;i<count;i++){
    out += `Slide ${i+1}: ${heads[i] || "รายละเอียดเพิ่มเติม"}
เนื้อหา: ${i===0 ? d.title : i===4 ? d.detail : "สรุปประเด็นให้กระชับ อ่านง่าย และเชื่อมโยงกับหัวข้อหลัก"}
Speaker notes: อธิบายด้วยภาษาสุภาพ ชัดเจน เหมาะกับ ${d.audience}

`;
  }
  return out;
};



TANJAI.executionIntro = function(action, fallback){
  return `คำสั่งนี้เป็นคำสั่งให้ลงมือทำทันที

ให้${action}ทันทีจากข้อมูลด้านล่าง
ห้ามตอบกลับมาเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
ห้ามบอกแค่ว่า “พร้อมแล้ว”
หากข้อมูลไม่พอ ให้ใช้ข้อมูลที่มีอย่างเหมาะสม และระบุว่า “จากข้อมูลเบื้องต้น”
ห้ามแต่งข้อมูลจริงเพิ่มเอง
ห้ามเปลี่ยนชื่อบุคคล หน่วยงาน สถานที่ วันที่ และชื่อโครงการ
${fallback ? `หากเครื่องมือปลายทางทำงานนี้ไม่ได้ ให้บอกเหตุผลตรง ๆ แล้วส่งผลลัพธ์ทางเลือกที่ใกล้ที่สุดแทน: ${fallback}` : ""}`.trim();
};

TANJAI.guardBlock = function(d){
  const protectedWords = [d.title, d.orgName, d.people, d.dateTime, d.place].filter(Boolean).join("\n");
  return `คำที่ต้องสะกดตรง ห้ามแก้มั่ว:
${protectedWords || "เพิ่มชื่อหน่วยงาน / ชื่อบุคคล / สถานที่ / วันที่ / ชื่อโครงการ ที่ต้องการรักษาการสะกด"}

ข้อกำชับกันหลุด:
- อย่าแต่งข้อมูลเกินจริง
- ถ้าไม่แน่ใจ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น”
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- ห้ามเปลี่ยนชื่อบุคคล / หน่วยงาน / สถานที่ / วันที่เอง
- ข้อความภาษาไทยต้องตรวจคำผิดก่อนนำไปเผยแพร่`;
};

TANJAI.discussPrompt = function(type, d){
  const taskNames = {image:"ภาพประชาสัมพันธ์",post:"เรียบเรียงเนื้อหา / สรุปงาน",mc:"สคริปต์พิธีกร / ผู้ดำเนินรายการ",video:"วิดีโอ / Storyboard",voice:"สคริปต์เสียง",deck:"สไลด์",kit:"Prompt Pack"};
  return `Prompt สำหรับแก้ / คุยต่อ

ช่วยตรวจและปรับงานประเภท “${taskNames[type] || "สื่อประชาสัมพันธ์"}” จากข้อมูลนี้ โดยยังไม่ต้องลงมือสร้างผลงานสุดท้าย

ข้อมูลหลัก:
หัวข้องาน: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
กลุ่มเป้าหมาย: ${d.audience}
โทนภาษา: ${d.tone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
บุคคล / หน่วยงานที่เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}

ช่วยเสนอ:
1) จุดที่ควรปรับให้ดีขึ้น
2) คำที่ควรระวัง
3) โครงคำสั่งที่เหมาะกว่า
4) เวอร์ชันพร้อมใช้แบบสั้น

${TANJAI.guardBlock(d)}`;
};

TANJAI.executionPrompt = function(type, d, extra={}){
  if(type === "image"){
    return `${TANJAI.executionIntro("สร้างภาพประชาสัมพันธ์จริง", "แจ้งว่าเครื่องมือนี้ยังไม่สามารถสร้างภาพได้โดยตรง และส่ง Prompt ภาพพร้อมใช้แทน")}

งานเฉพาะ: ภาพ
- ให้สร้างภาพทันทีจากรายละเอียดนี้
- หากมีรูปแนบ ให้ใช้รูปแนบเป็น reference
- หากมีภาพบุคคลจริง ให้คงอัตลักษณ์เดิม ห้ามเปลี่ยนใบหน้า
- ห้ามสรุปบรีฟแล้วจบ
- ห้ามตอบว่า “ถ้าโอเคให้พิมพ์สร้างภาพได้เลย”

${TANJAI.imagePrompt(d, "gpt")}

${TANJAI.guardBlock(d)}`;
  }
  if(type === "post"){
    const target = d.channel || "สรุปงาน";
    const workType = d.workType || "ไม่ระบุ";
    return `${TANJAI.executionIntro("เรียบเรียงเนื้อหา / สรุปงานพร้อมใช้", "ส่งข้อความเรียบเรียงพร้อมใช้แทน")}

งานเฉพาะ: เรียบเรียงเนื้อหา
ให้สรุปและเรียบเรียงเนื้อหาทันทีจากข้อมูลด้านล่าง
ห้ามตอบเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
หากมีรูปเอกสารแนบ ให้อ่านข้อความจากภาพเอกสารก่อน แล้วค่อยสรุป
หากอ่านข้อความจากภาพไม่ชัด ห้ามเดา ให้ระบุว่า “ข้อความส่วนนี้อ่านไม่ชัด”

ข้อมูล:
หัวข้องาน: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
ประเภทงาน: ${workType}
ต้องการเรียบเรียงเป็น: ${target}
กลุ่มเป้าหมาย: ${d.audience}
โทนภาษา: ${d.tone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด:
${d.detail}

ขอผลลัพธ์พร้อมใช้:
1) สรุปงาน / ใจความสำคัญ
2) โพสต์ Facebook / Line
3) แคปชั่นสั้น
4) สคริปต์เสียงบรรยาย
5) สคริปต์คลิปวิดีโอสั้น
6) ข้อความสำหรับทำภาพประชาสัมพันธ์
7) Bullet สำหรับนำไปทำสไลด์
8) คำที่ต้องตรวจสอบก่อนเผยแพร่

${TANJAI.guardBlock(d)}`;
  }
  if(type === "mc"){
    const target = d.channel || "สคริปต์พิธีกรเต็ม";
    const workType = d.workType || "งานพิธีกร / ผู้ดำเนินรายการ";
    const style = d.style || d.tone || "ทางการ สุภาพ อ่านง่าย";
    return `${TANJAI.executionIntro("เขียนสคริปต์พิธีกร / ผู้ดำเนินรายการ", "ส่งสคริปต์พิธีกรพร้อมใช้แทน")}

งานเฉพาะ: สคริปต์พิธีกร / ผู้ดำเนินรายการ
ให้เขียนสคริปต์พิธีกรทันทีจากข้อมูลด้านล่าง
ห้ามตอบเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
หากข้อมูลไม่พอ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น” และเว้นช่องให้เติมภายหลัง
ห้ามแต่งชื่อบุคคล หน่วยงาน วันที่ เวลา สถานที่ หรือชื่อตำแหน่งขึ้นเอง

ข้อมูล:
ชื่องาน / หัวข้อ: ${d.title}
หน่วยงาน / ผู้จัด: ${d.orgName}
ประเภทงาน: ${workType}
รูปแบบที่ต้องการ: ${target}
กลุ่มผู้ฟัง / ผู้ร่วมงาน: ${d.audience}
โทนภาษา / สไตล์พิธีกร: ${style}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ประธาน / ผู้กล่าวรายงาน / ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด / กำหนดการ / ลำดับพิธี:
${d.detail}

ขอผลลัพธ์เป็นภาษาไทยพร้อมใช้บนเวที:
1) สคริปต์พิธีกรเต็ม แบ่งเป็นช่วงชัดเจน
2) คำเชิญประธานในพิธี
3) คำเชิญผู้กล่าวรายงาน
4) คำกล่าวรายงาน หากข้อมูลเพียงพอ
5) คำกล่าวประธาน หากข้อมูลเพียงพอ
6) คำพูดเชื่อมช่วงกิจกรรม / มอบรางวัล / ถ่ายภาพ / พักเบรก
7) สคริปต์เปิดงาน / ปิดงาน
8) เวอร์ชันย่อสำหรับพิธีกรถืออ่าน 1 หน้า
9) หมายเหตุสำหรับพิธีกร เช่น จุดเว้นจังหวะ น้ำเสียง และคำที่ต้องออกเสียงชัด

รูปแบบการเขียน:
- ใช้ภาษาไทยสุภาพ ทางการ อ่านออกเสียงง่าย
- แยกช่วงด้วยหัวข้อชัดเจน
- ใส่ [เว้นจังหวะ] หรือ [รอประธานขึ้นเวที] เมื่อจำเป็น
- หากข้อมูลใดไม่ชัด ให้เขียนเป็น [เติมชื่อ...] ไม่เดาเอง

${TANJAI.guardBlock(d)}`;
  }
  if(type === "video"){
    const length = extra.length || "60 วินาที";
    return `${TANJAI.executionIntro("สร้าง Storyboard / Prompt วิดีโอ", "ส่ง Storyboard และ Prompt วิดีโอพร้อมใช้แทน")}

งานเฉพาะ: วิดีโอ
ให้สร้าง Storyboard วิดีโอทันที ไม่ต้องสรุปแนวทางเฉย ๆ

ข้อมูล:
หัวข้อ: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
ความยาว: ${length}
กลุ่มเป้าหมาย: ${d.audience}
โทนภาษา: ${d.tone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}

ขอผลลัพธ์:
1) Hook เปิดคลิป 3 แบบ
2) Storyboard 6–8 ซีน
3) Voice Over รายซีน
4) ข้อความบนจอรายซีน
5) แนวเพลง / mood เสียงประกอบ
6) Prompt วิดีโอสำหรับ Runway / Kling / เครื่องมือวิดีโอ
7) คำแนะนำตัดต่อสำหรับ CapCut

${TANJAI.guardBlock(d)}`;
  }
  if(type === "voice"){
    const length = extra.length || "60 วินาที";
    const style = extra.style || "ทางการ สุภาพ อ่านง่าย";
    return `${TANJAI.executionIntro("เขียนสคริปต์เสียงบรรยาย", "ส่งสคริปต์พร้อมอ่านแทน")}

งานเฉพาะ: เสียงบรรยาย
ให้เขียนสคริปต์เสียงทันที จัดจังหวะอ่าน เว้นวรรค และโทนเสียงให้เหมาะกับงาน

ข้อมูล:
หัวข้อ: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
ความยาว: ${length}
สไตล์เสียง: ${style}
กลุ่มเป้าหมาย: ${d.audience}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}

ขอผลลัพธ์:
1) สคริปต์เสียงพร้อมอ่าน
2) จุดเว้นหายใจ
3) น้ำหนักคำที่ควรเน้น
4) เวอร์ชันสั้นสำหรับคลิป 30 วินาที

${TANJAI.guardBlock(d)}`;
  }
  if(type === "deck"){
    const count = extra.count || 8;
    return `${TANJAI.executionIntro("สร้าง Outline สไลด์", "ส่งโครงสไลด์พร้อมใช้แทน")}

งานเฉพาะ: สไลด์
ให้สร้าง Outline สไลด์ทันที ขอหัวข้อแต่ละสไลด์ Bullet สำคัญ และ Speaker Notes

ข้อมูล:
หัวข้อ: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
จำนวนสไลด์: ${count}
กลุ่มผู้ฟัง: ${d.audience}
โทนภาษา: ${d.tone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}

ขอผลลัพธ์:
1) Outline ${count} สไลด์
2) Bullet สำคัญแต่ละสไลด์
3) Speaker Notes
4) ข้อความหน้าปก
5) ข้อเสนอภาพประกอบแต่ละสไลด์

${TANJAI.guardBlock(d)}`;
  }
  return `${TANJAI.executionIntro("สร้างผลลัพธ์ตามโจทย์", "ส่ง Prompt พร้อมใช้แทน")}

${TANJAI.guardBlock(d)}`;
};

TANJAI.promptPack = function(d){
  const protectedWords = [
    d.orgName,
    d.people,
    d.place,
    d.dateTime,
    d.title
  ].filter(Boolean).join("\n");

  const imagePrompt = TANJAI.imagePrompt({
    ...d,
    size: d.size || "4:5 Facebook / Line 1080x1350",
    style: d.style || "Modern Premium Clean",
    layout: d.layout || "Infographic Layout",
    density: d.density || "สมดุล อ่านง่าย"
  }, "prompt");

  const universalMasterPrompt = `คุณคือ AI ผู้ช่วยผลิตสื่อประชาสัมพันธ์มืออาชีพ
ให้ใช้ข้อมูลด้านล่างนี้เป็นข้อมูลจริง ห้ามแต่งข้อมูลเกินจริง และห้ามเปลี่ยนชื่อบุคคล หน่วยงาน สถานที่ วันที่ หรือชื่อโครงการเอง

งานที่ต้องทำ:
ช่วยแปลงข้อมูลนี้เป็นสื่อพร้อมใช้งาน แยกตามประเภทงาน ได้แก่ ภาพประชาสัมพันธ์ โพสต์โซเชียล ชุดภาพ Facebook วิดีโอ เสียงบรรยาย และสไลด์ โดยใช้ภาษาไทยสุภาพ อ่านง่าย เหมาะกับกลุ่มเป้าหมาย

ข้อมูลหลัก:
หัวข้องาน: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
ประเภทงาน: ${d.mainCategory || "ไม่ระบุ"} / ${d.subCategory || "ไม่ระบุ"}
กลุ่มเป้าหมาย: ${d.audience}
โทนภาษา: ${d.tone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
บุคคล / หน่วยงานที่เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}

ข้อกำชับ:
- อย่าแต่งข้อมูลใหม่เอง
- ถ้าข้อมูลไม่พอ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น”
- ตรวจคำผิดภาษาไทยก่อนตอบ
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- ห้ามเปลี่ยนชื่อบุคคล หน่วยงาน สถานที่ วันที่ และชื่อโครงการ`;

  const facebookAlbumPrompt = `สร้าง Prompt สำหรับชุดภาพโพสต์ Facebook จากข้อมูลนี้

เป้าหมาย:
ทำชุดภาพที่เล่าเรื่องครบในโพสต์เดียว โดยภาพแรกเป็นภาพปกขายเรื่อง และภาพรองใช้เล่าเนื้อหา / บรรยากาศ / ผลลัพธ์

ข้อมูล:
หัวข้องาน: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
กลุ่มเป้าหมาย: ${d.audience}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}
รายละเอียด: ${d.detail}
โทนภาษา: ${d.tone}
โทนภาพ: ${d.colorTone || "ให้เหมาะสมกับองค์กร"}

โครงชุดภาพ:
- ภาพปกหลัก: หัวข้อใหญ่ + ข้อมูลสำคัญ + ภาพขายเรื่อง
- ภาพรอง 1: สรุปสาระสำคัญ
- ภาพรอง 2: บรรยากาศ / ผู้เกี่ยวข้อง
- ภาพรอง 3: ผลลัพธ์ / ข้อความปิดท้าย
- ภาพเพิ่มเติม: ใช้เมื่อมีภาพเสริม โดยให้กรอบบางมาก

กติกาดีไซน์:
- ภาพปกต้องเด่นที่สุด
- ภาพรองต้องเบา อ่านง่าย ไม่แย่งภาพ
- ห้ามใส่เลขลำดับบนภาพจริง
- ห้ามใส่ hashtag บนภาพจริง
- ข้อความภาษาไทยต้องสะกดถูก
- อย่าวาดโลโก้ใหม่ หากต้องใช้โลโก้ให้เว้นพื้นที่หรือใช้ไฟล์โลโก้จริง`;

  const videoPrompt = `สร้าง Prompt สำหรับวิดีโอ / คลิป จากข้อมูลนี้

หัวข้อ: ${d.title}
หน่วยงาน: ${d.orgName}
กลุ่มเป้าหมาย: ${d.audience}
รายละเอียด: ${d.detail}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}

ขอผลลัพธ์:
- Hook เปิดคลิป 3 ตัวเลือก
- Storyboard 6–8 ซีน
- Voice Over ภาษาไทย อ่านลื่น
- ข้อความบนจอแต่ละซีน
- แนวเพลง / mood เสียงประกอบ
- คำแนะนำการตัดต่อสำหรับ CapCut หรือโปรแกรมตัดต่อ
- Prompt สำหรับใช้ต่อกับเครื่องมือวิดีโอ เช่น Runway / Kling โดยใช้ภาพจริงเป็น reference หากมี`;

  const universalUse = `วิธีใช้ Universal Prompt Pack:
1. คัดลอกทั้งชุด ถ้าต้องการให้ AI เข้าใจบริบทครบ
2. คัดลอกเฉพาะส่วน “Prompt สร้างภาพ” เมื่อต้องการเจนภาพ
3. คัดลอกเฉพาะส่วน “Prompt วิดีโอ” เมื่อต้องการทำคลิป
4. คัดลอกเฉพาะส่วน “Caption” เมื่อต้องการโพสต์
5. แนบรูปจริงเพิ่มใน AI ปลายทาง หากต้องการให้วิเคราะห์จากภาพ
6. ตรวจคำสำคัญในหัวข้อ “คำที่ต้องสะกดตรง” ก่อนเผยแพร่

ชุดนี้ออกแบบให้ใช้ต่อได้กว้างกับ ChatGPT / Gemini / Claude / Canva / CapCut / Runway / Kling โดยไม่ต้องเลือก AI ก่อน`;

  return `UNIVERSAL EXECUTION PROMPT PACK — ทันใจ AI Studio
กรอกครั้งเดียว ใช้ต่อได้หลาย AI พร้อมโหมดสั่งทำทันที

==============================
1) PROMPT สำหรับสั่ง AI ทำงานทันที
==============================
คำสั่งนี้เป็นคำสั่งให้ลงมือทำทันที
ให้สร้างผลลัพธ์ตามประเภทงานด้านล่างทันที
ห้ามตอบกลับมาเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
ห้ามบอกแค่ว่า “พร้อมแล้ว”
หากเครื่องมือปลายทางทำงานนั้นไม่ได้ ให้บอกเหตุผลตรง ๆ แล้วส่ง Prompt พร้อมใช้แทน

==============================
2) PROMPT กลางพร้อมใช้ทุก AI
==============================
${universalMasterPrompt}

==============================
3) SMART BRIEF
==============================
หัวข้องาน: ${d.title}
หน่วยงาน / แบรนด์: ${d.orgName}
ประเภทงาน: ${d.mainCategory || "ไม่ระบุ"} / ${d.subCategory || "ไม่ระบุ"}
ช่องทางใช้งาน: ${d.channel || "หลายช่องทาง"}
กลุ่มเป้าหมาย: ${d.audience}
โทนภาษา: ${d.tone}
สไตล์ภาพ: ${d.style}
Layout: ${d.layout}
ความหนาแน่น: ${d.density}
จุดเน้น: ${d.focus}
โทนสี: ${d.colorTone}
วัน / เวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
ผู้เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}

รายละเอียด:
${d.detail}

==============================
4) PROMPT สร้างภาพประชาสัมพันธ์
==============================
${imagePrompt}

==============================
5) PROMPT ชุดภาพ Facebook
==============================
${facebookAlbumPrompt}

==============================
6) CAPTION พร้อมโพสต์
==============================
${TANJAI.postText(d)}

==============================
7) PROMPT วิดีโอ / Storyboard
==============================
${videoPrompt}

==============================
8) สคริปต์เสียงบรรยาย
==============================
${TANJAI.voiceScript(d, "60 วินาที", "ทางการ สุภาพ อ่านง่าย")}

==============================
9) Outline สไลด์
==============================
${TANJAI.deckOutline(d, 8)}

==============================
10) ข้อความบนภาพ / ปกคลิป
==============================
หัวข้อหลัก:
${d.title}

ข้อความรอง:
${d.detail ? String(d.detail).split(/[.\n]/)[0].slice(0,140) : "สรุปประเด็นสำคัญของงาน"}

ข้อมูลประกอบ:
${d.dateTime ? `วันที่ ${d.dateTime}` : "วันที่: ไม่ระบุ"}
${d.place ? `สถานที่ ${d.place}` : "สถานที่: ไม่ระบุ"}

ข้อความปิดท้าย:
${d.orgName}

==============================
11) คำที่ต้องสะกดตรง ห้ามแก้มั่ว
==============================
${protectedWords || "เพิ่มชื่อหน่วยงาน / ชื่อบุคคล / สถานที่ / วันที่ / ชื่อโครงการ ที่ต้องการรักษาการสะกด"}

==============================
12) วิธีใช้ต่อ
==============================
${universalUse}

==============================
13) PROMPT สำหรับแก้ / คุยต่อ
==============================
ใช้เมื่อต้องการให้ AI ช่วยปรับโทน เพิ่ม ลด ตรวจคำผิด หรือจัดรูปแบบใหม่ โดยยังไม่ต้องสร้างงานสุดท้าย

ช่วยตรวจและปรับชุดสื่อจากข้อมูลด้านบน โดยให้เสนอ:
1) จุดที่ควรปรับ
2) เวอร์ชันที่กระชับขึ้น
3) เวอร์ชันที่เป็นทางการขึ้น
4) เวอร์ชันที่ดูว้าวขึ้น แต่ไม่แต่งข้อมูลจริงเพิ่ม

==============================
14) ข้อกำชับกันหลุด
==============================
- อย่าแต่งข้อมูลเกินจริง
- ถ้าไม่แน่ใจ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น”
- ห้ามสร้าง QR Code ปลอม
- ห้ามวาดโลโก้ใหม่
- ห้ามเปลี่ยนชื่อบุคคล / หน่วยงาน / สถานที่เอง
- ห้ามใส่ hashtag บนภาพจริง
- ห้ามใส่เลขลำดับบนภาพจริง
- ข้อความภาษาไทยต้องตรวจคำผิดก่อนนำไปเผยแพร่`;
};

TANJAI.routerSuggest = function(text){
  const q = (text || "").toLowerCase();
  let tool = "สร้างภาพ", view = "image", why = "โจทย์นี้เหมาะกับการสร้าง Prompt ภาพหรืองานออกแบบ";
  if(/โพสต์|แคปชั่น|caption|facebook|line|ข้อความ/.test(q)){ tool="เขียนโพสต์"; view="post"; why="โจทย์นี้เน้นข้อความสำหรับเผยแพร่บนโซเชียล"; }
  if(/วิดีโอ|วีดีโอ|คลิป|storyboard|สตอรี่|capcut|hook/.test(q)){ tool="ทำวิดีโอ"; view="video"; why="โจทย์นี้ต้องการโครงคลิป ฉาก และข้อความบนจอ"; }
  if(/เสียง|พากย์|voice|tts|อ่าน/.test(q)){ tool="เสียงพากย์"; view="voice"; why="โจทย์นี้เหมาะกับการทำสคริปต์เสียงและ"; }
  if(/สไลด์|powerpoint|presentation|นำเสนอ/.test(q)){ tool="ทำสไลด์"; view="deck"; why="โจทย์นี้ต้องการโครงนำเสนอและ speaker notes"; }
  if(/ครบชุด|แคมเปญ|ทั้งหมด|ภาพ.*โพสต์|โพสต์.*วิดีโอ/.test(q)){ tool="สร้างชุดสื่อ"; view="kit"; why="โจทย์นี้เหมาะกับการแตกงานออกเป็นหลายสื่อจากข้อมูลเดียว"; }
  const dest = view === "video" || view === "voice" ? "CapCut / เครื่องมือ Voice Tool / ChatGPT" : view === "image" ? "ChatGPT / Canva / เครื่องมือสร้างภาพ" : view === "deck" ? "Canva / PowerPoint / ChatGPT" : "ChatGPT / Canva";
  return { view, text: `คำแนะนำจาก AI Router

โจทย์ของพี่:
${text}

เมนูที่แนะนำ:
${tool}

เหตุผล:
${why}

ผลลัพธ์ที่ควรสร้าง:
${tool === "สร้างภาพ" ? "Prompt ภาพ + คำสั่งนักออกแบบ" : tool === "เขียนโพสต์" ? "โพสต์หลัก + แคปชั่นสั้น + ข้อความ Line" : tool === "ทำวิดีโอ" ? "Hook + Storyboard + Voice Over + ข้อความบนจอ" : tool === "เสียงพากย์" ? "สคริปต์เสียง + ข้อความสำหรับ Voice Tool + จังหวะอ่าน" : tool === "ทำสไลด์" ? "Outline + Speaker Notes" : "ภาพ + โพสต์ + วิดีโอ + เสียง + สไลด์"}

เครื่องมือปลายทางที่เหมาะ:
${dest}

ขั้นตอนต่อไป:
1. กดปุ่ม “ไปที่เมนูที่แนะนำ”
2. กรอกข้อมูลจริงของงาน
3. กดสร้าง
4. คัดลอกผลลัพธ์ไปใช้ต่อ` };
};


TANJAI.workSummaryScript = function(d){
  const photoPart = d.photoCount && d.photoCount > 0
    ? `มีรูปภาพแนบจำนวน ${d.photoCount} รูป: ${d.photoNames || "รูปภาพประกอบ"}\nให้ AI วิเคราะห์จากภาพร่วมกับข้อมูลที่กรอก เช่น เห็นใคร ทำอะไร อยู่ที่ไหน บรรยากาศเป็นอย่างไร และมีประเด็นใดควรสื่อสาร`
    : `ยังไม่มีรูปภาพแนบ หากมีภาพประกอบ ให้แนบรูปพร้อมคำสั่งนี้เพื่อให้ AI วิเคราะห์ภาพร่วมด้วย`;

  return `เขียนสคริปต์สรุปงานภาษาไทย จากข้อมูลและภาพประกอบต่อไปนี้
หัวข้องาน: ${d.title}
หน่วยงาน/ผู้เกี่ยวข้อง: ${d.orgName}
ประเภทงาน: ${d.workType || "ลงพื้นที่ / กิจกรรม / ภารกิจ"}
สถานที่: ${d.place || "ให้สรุปจากข้อมูลหรือภาพแนบ"}
วันเวลา: ${d.dateTime || "ไม่ระบุ"}
บุคคลสำคัญ/ผู้ลงพื้นที่: ${d.people || "ไม่ระบุ"}
กลุ่มเป้าหมาย: ${d.audience}
รายละเอียดที่ทราบ: ${d.detail}

ข้อมูลรูปภาพ:
${photoPart}

โจทย์:
ช่วยสรุปว่า “ไปที่ไหน / ไปทำอะไร / ทำอย่างไร / มีใครเกี่ยวข้อง / ผลหรือประโยชน์คืออะไร” โดยใช้ภาษาทางการ สุภาพ อ่านง่าย เหมาะกับงานประชาสัมพันธ์ท้องถิ่น

ขอผลลัพธ์แยกเป็น 5 ส่วน:
1) สรุปสั้น 3-5 บรรทัด สำหรับผู้บริหาร
2) สคริปต์เล่าเรื่องสำหรับทำคลิป 45-60 วินาที
3) ข้อความโพสต์ Facebook/Line พร้อมแคปชั่น
4) Bullet สำหรับทำสไลด์นำเสนอ 5-7 ข้อ
5) ข้อความสั้นบนภาพ/ปกคลิป 3 ตัวเลือก

ข้อกำชับ:
- อย่าแต่งข้อมูลเกินจริง หากไม่แน่ใจให้ใช้คำว่า “จากภาพ/จากข้อมูลเบื้องต้น”
- เขียนให้ดูมืออาชีพ ไม่เว่อร์เกินไป
- หากเป็นภาพนายกลงพื้นที่ ให้เน้นการติดตาม รับฟังปัญหา ตรวจสอบ และประสานการช่วยเหลืออย่างเหมาะสม
- เว้นชื่อ/ตำแหน่งให้สะกดตามข้อมูลที่ให้มา`;
};



/* =========================================================
   V9 Prompt Architecture Engine
   Core เดียว / Output หลายโหมด
   - Shared Brief
   - Auto Detect
   - Mode Adapter
   - No internal form metadata in final prompts
========================================================= */

TANJAI.v9Clean = function(text="", fallback="ไม่ระบุ"){
  const value = String(text || "")
    .replaceAll("ประชม", "ประชุม")
    .replaceAll("พ.ศ.2571-2575", "พ.ศ. 2571–2575")
    .replaceAll("พ.ศ. 2571-2575", "พ.ศ. 2571–2575")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return value || fallback;
};

TANJAI.v9List = function(items=[]){
  return items.map(x => String(x || "").trim()).filter(Boolean);
};

TANJAI.v9DetectImageType = function(d){
  const text = `${d.title} ${d.detail} ${d.mainCategory} ${d.subCategory} ${d.workType}`.toLowerCase();
  if(/เพลง|single|ซิงเกิล|mv|music|ฟังได้แล้ว|โปรโมทเพลง|อัลบั้ม/.test(text)) return "ภาพโปรโมทเพลง / ผลงานสร้างสรรค์";
  if(/ขอเชิญ|เชิญร่วม|ขอเรียนเชิญ|ร่วมกิจกรรม|เปิดรับ|สมัคร/.test(text)) return "ภาพเชิญชวน / ประชาสัมพันธ์กิจกรรม";
  if(/แจ้งข่าว|ประกาศ|โปรดทราบ|เตือน|ระวัง|มิจฉาชีพ|ปิดถนน|ไฟดับ|หยุดให้บริการ/.test(text)) return "ภาพแจ้งข่าว / ประกาศ";
  if(/สรุปกิจกรรม|ลงพื้นที่|ประชุม|ร่วมประชุม|ตรวจงาน|ติดตาม|บรรยากาศ|กิจกรรม/.test(text)) return "ภาพสรุปกิจกรรม / ภาพโพสต์งาน";
  if(/ขั้นตอน|วิธี|ข้อมูลควรรู้|infographic|อินโฟกราฟิก|ข้อควรรู้|流程|1\)|2\)|3\)/.test(text)) return "ภาพอินโฟกราฟิก";
  if(/เกษียณ|แสดงความยินดี|ขอบคุณ|มอบ|อาลัย|ไว้อาลัย|รำลึก/.test(text)) return "ภาพเชิงพิธี / บุคคล";
  if(/ภาษี|ชำระ|เอกสาร|ทะเบียน|บริการ|ขั้นตอนบริการ/.test(text)) return "ภาพให้ความรู้ / ขั้นตอนบริการ";
  return "ภาพประชาสัมพันธ์";
};

TANJAI.v9Purpose = function(type, d){
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  if(type === "image"){
    const imageType = TANJAI.v9DetectImageType(d);
    if(/เพลง/.test(imageType)) return `โปรโมทผลงาน “${title}” ให้เหมาะกับโซเชียล`;
    if(/เชิญชวน/.test(imageType)) return `เชิญชวนกลุ่มเป้าหมายให้รับทราบและเข้าร่วมกิจกรรม “${title}”`;
    if(/แจ้งข่าว|ประกาศ/.test(imageType)) return `แจ้งข้อมูลสำคัญให้เข้าใจเร็วและอ่านง่าย`;
    if(/สรุปกิจกรรม/.test(imageType)) return `สรุปกิจกรรมหรือเหตุการณ์ให้เป็นภาพโพสต์ที่น่าเชื่อถือ`;
    if(/อินโฟกราฟิก|ขั้นตอนบริการ/.test(imageType)) return `อธิบายข้อมูลให้เป็นลำดับ เข้าใจง่าย`;
    return `ประชาสัมพันธ์เรื่อง “${title}” ให้ชัดเจนและพร้อมใช้งานจริง`;
  }
  if(type === "post") return `สรุปและเรียบเรียงข้อมูลให้เป็นข้อความพร้อมใช้`;
  if(type === "mc") return `สร้างสคริปต์พิธีกรและคำกล่าวที่อ่านได้จริงบนเวที`;
  if(type === "video") return `วางโครงคลิป/วิดีโอให้ถ่ายทำหรือตัดต่อได้ทันที`;
  if(type === "voice") return `เขียนสคริปต์เสียงพากย์ที่อ่านออกเสียงได้ลื่นไหล`;
  if(type === "deck") return `จัดโครงสไลด์และ Speaker Notes สำหรับนำเสนอ`;
  if(type === "album") return `จัดชุดภาพโพสต์ Facebook พร้อมแคปชั่นและลำดับภาพ`;
  return `สร้างผลลัพธ์พร้อมใช้งาน`;
};

TANJAI.v9TextOnImage = function(d, imageType="ภาพประชาสัมพันธ์"){
  const title = TANJAI.v9Clean(d.title, "");
  const org = TANJAI.v9Clean(d.orgName, "");
  const detail = TANJAI.v9Clean(d.detail, "");
  const dateTime = TANJAI.v9Clean(d.dateTime, "");
  const place = TANJAI.v9Clean(d.place, "");
  const items = [];

  if(title) items.push(title);
  if(/เพลง/.test(imageType)){
    if(org) items.push(org);
    items.push("เพลงใหม่");
    items.push("ฟังได้แล้ววันนี้");
  }else{
    if(dateTime) items.push(dateTime);
    if(place) items.push(place);
    if(org && !items.includes(org)) items.push(org);
  }

  if(items.length < 3 && detail && detail.length <= 80) items.push(detail);
  return [...new Set(items)].filter(Boolean).slice(0, 5);
};

TANJAI.v9AttachmentGuide = function(d, type="image"){
  const count = Number(d.photoCount || 0);
  const names = TANJAI.v9Clean(d.photoNames, "");
  const mode = TANJAI.v9Clean(d.useMode, "");
  const hasPhotos = count > 0 || !!names;
  const isRealMode = /ภาพจริง|ต้นฉบับ|รีทัช|ปรับภาพจริง|reference|อ้างอิง/.test(`${mode} ${d.detail} ${d.extraFocus || ""}`);
  const hasPerson = !!d.safeFace || /บุคคล|ผู้บริหาร|นายก|ประธาน|คน|ภาพถ่าย|รูปถ่าย|หน้า/.test(`${d.detail} ${d.people} ${mode}`);

  if(!hasPhotos && type !== "post" && type !== "mc") return "ไม่มีไฟล์แนบ หรือยังไม่ได้ระบุไฟล์แนบ";
  if(type === "post") return "หากมีรูปเอกสารแนบ ให้อ่านข้อมูลจากภาพก่อน แล้วค่อยสรุป หากอ่านไม่ชัดให้ระบุว่า “ข้อความส่วนนี้อ่านไม่ชัด”";
  if(type === "mc") return "หากมีภาพกำหนดการหรือเอกสารพิธี ให้ใช้เพื่อสกัดลำดับพิธี ชื่อบุคคล ตำแหน่ง และช่วงกิจกรรม โดยไม่เดาข้อมูลที่อ่านไม่ชัด";

  const lines = [];
  if(hasPhotos){
    lines.push(`มีภาพแนบ ${count || "หลาย"} รูป${names ? `: ${names}` : ""}`);
    lines.push("ให้ใช้ภาพแนบเป็น reference หรือภาพอ้างอิงหลักตามบริบทของงาน");
  }
  if(isRealMode || hasPerson){
    lines.push("หากมีบุคคลจริงในภาพ ให้คงอัตลักษณ์เดิม ห้ามเปลี่ยนใบหน้า");
    lines.push("สามารถปรับแสง สี ความคมชัด และจัดองค์ประกอบได้ แต่ห้ามสร้างบุคคลใหม่แทนต้นฉบับ");
  }
  return lines.join("\n");
};

TANJAI.buildSharedBrief = function(d={}, type="image"){
  const title = TANJAI.v9Clean(d.title, "หัวข้องาน");
  const orgName = TANJAI.v9Clean(d.orgName, "หน่วยงาน / แบรนด์");
  const detail = TANJAI.v9Clean(d.detail, "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม");
  const imageType = TANJAI.v9DetectImageType(d);
  const purpose = TANJAI.v9Purpose(type, d);
  const textOnImage = TANJAI.v9TextOnImage(d, imageType);
  const keyFacts = TANJAI.v9List([
    detail,
    d.dateTime ? `วัน / เวลา: ${d.dateTime}` : "",
    d.place ? `สถานที่: ${d.place}` : "",
    d.people ? `ผู้เกี่ยวข้อง: ${d.people}` : ""
  ]);

  return {
    type,
    title,
    orgName,
    workType: TANJAI.v9Clean(d.workType || d.mainCategory || imageType, imageType),
    audience: TANJAI.v9Clean(d.audience, "กลุ่มเป้าหมายหลัก"),
    tone: TANJAI.v9Clean(d.tone, "ทางการ สุภาพ อ่านง่าย"),
    visualTone: TANJAI.v9Clean(d.visualTone || d.tone, "ให้ AI เลือกให้เหมาะสมตามงาน"),
    detail,
    dateTime: TANJAI.v9Clean(d.dateTime, ""),
    place: TANJAI.v9Clean(d.place, ""),
    people: TANJAI.v9Clean(d.people, ""),
    channel: TANJAI.v9Clean(d.channel, d.size || "ช่องทางใช้งานตามที่กำหนด"),
    size: TANJAI.v9Clean(d.size, "4:5 Facebook / Line 1080x1350"),
    style: TANJAI.v9Clean(d.style, "Modern Premium Clean"),
    layout: TANJAI.v9Clean(d.layout, "Layout อ่านง่าย เหมาะกับงาน"),
    density: TANJAI.v9Clean(d.density, "สมดุล อ่านง่าย"),
    focus: TANJAI.v9Clean(d.focus, "เน้นหัวข้อหลักและข้อมูลสำคัญ"),
    colorTone: TANJAI.v9Clean(d.colorTone, "ให้ AI เลือกให้เหมาะสม"),
    imageType,
    purpose,
    textOnImage,
    keyFacts,
    attachmentGuide: TANJAI.v9AttachmentGuide(d, type),
    avoid: TANJAI.v9Clean(d.avoid, "ห้ามแต่งข้อมูลจริงเพิ่มเอง")
  };
};

TANJAI.v9ProtectedBlock = function(d, type="general"){
  const words = TANJAI.v9List([d.title, d.orgName, d.people, d.dateTime, d.place]).join("\n");
  const base = [
    "ห้ามแต่งชื่อบุคคล หน่วยงาน วันที่ เวลา สถานที่ หรือชื่อโครงการขึ้นเอง",
    "หากข้อมูลไม่ครบ ให้ระบุว่า “จากข้อมูลเบื้องต้น” หรือเว้นช่องให้เติม",
    "ตรวจคำไทยก่อนส่งออก",
  ];
  if(type === "image" || type === "album" || type === "video"){
    base.push("ห้ามสร้าง QR Code ปลอม");
    base.push("ห้ามวาดโลโก้ใหม่ ให้ใช้ไฟล์โลโก้จริงเท่านั้นหากมีการแนบ");
    base.push("หากมีบุคคลจริงในภาพแนบ ต้องคงอัตลักษณ์เดิม ห้ามเปลี่ยนใบหน้า");
  }
  return `คำที่ต้องสะกดตรง ห้ามแก้มั่ว:
${words || "ยังไม่มีคำเฉพาะที่ระบุ"}

ข้อห้ามสำคัญ:
${base.map(x => "- " + x).join("\n")}`;
};

TANJAI.v9ExecutionHeader = function(action){
  return `คำสั่งนี้เป็นคำสั่งให้ลงมือทำทันที

${action}
ห้ามตอบกลับมาเป็นเพียงการสรุปบรีฟ
ห้ามถามยืนยันก่อน
หากข้อมูลไม่พอ ให้ใช้ข้อมูลที่มีอย่างเหมาะสม และระบุว่า “จากข้อมูลเบื้องต้น”`;
};

TANJAI.imagePrompt = function(d, outputMode="gpt"){
  const b = TANJAI.buildSharedBrief(d, "image");
  return `${TANJAI.v9ExecutionHeader("ให้สร้างภาพประชาสัมพันธ์จริงทันทีจากข้อมูลด้านล่าง")}

ประเภทภาพ: ${b.imageType}
จุดประสงค์ของภาพ: ${b.purpose}
กลุ่มเป้าหมาย: ${b.audience}
ช่องทางใช้งาน: ${b.channel}
ขนาดภาพ: ${b.size}

หัวข้อหลัก:
${b.title}

ข้อมูลจริงของงาน:
${b.keyFacts.map(x => "- " + x).join("\n")}

ข้อความที่ควรมีบนภาพ:
${b.textOnImage.map(x => "- " + x).join("\n")}

ไฟล์แนบ / ภาพอ้างอิง:
${b.attachmentGuide}

แนวทางภาพ:
- สไตล์: ${b.style}
- โทนภาพ: ${b.visualTone}
- โทนสี: ${b.colorTone}
- Layout: ${b.layout}
- ความหนาแน่น: ${b.density}
- จุดเด่นของภาพ: ${b.focus}
- โทนภาษา: ${b.tone}

${TANJAI.v9ProtectedBlock(d, "image")}

ให้สร้างภาพทันทีตามข้อมูลข้างต้น
หากเครื่องมือปลายทางไม่สามารถสร้างภาพได้โดยตรง ให้บอกเหตุผลตรง ๆ และส่ง Prompt พร้อมใช้กลับมาแทน`;
};

TANJAI.v9AlbumPrompt = function(d){
  const b = TANJAI.buildSharedBrief(d, "album");
  return `${TANJAI.v9ExecutionHeader("ให้สร้างแนวทางชุดภาพโพสต์ Facebook จากข้อมูลด้านล่าง")}

หัวข้อชุดโพสต์:
${b.title}

ข้อมูลสำคัญ:
${b.keyFacts.map(x => "- " + x).join("\n")}

ไฟล์แนบ / ภาพจริง:
${b.attachmentGuide}

ให้จัดผลลัพธ์เป็น:
1) ภาพปกโพสต์
2) ภาพรอง 3–6 ภาพ
3) ข้อความบนแต่ละภาพ
4) Caption พร้อมโพสต์
5) คำแนะนำการเรียงภาพในอัลบั้ม

แนวทางภาพ:
- โทน: ${b.visualTone}
- สไตล์: ${b.style}
- Layout: Facebook Album Clean
- ข้อความอ่านง่าย
- ไม่ใส่ข้อมูลที่ไม่ได้ระบุ

${TANJAI.v9ProtectedBlock(d, "album")}

ให้สร้างชุดคำสั่งพร้อมใช้งานทันที`;
};

TANJAI.v9VideoPrompt = function(d, extra={}){
  const b = TANJAI.buildSharedBrief(d, "video");
  const duration = extra.length || d.length || "60 วินาที";
  return `${TANJAI.v9ExecutionHeader("ให้สร้าง Storyboard วิดีโอจากข้อมูลด้านล่าง")}

หัวข้อวิดีโอ:
${b.title}

รายละเอียดสำคัญ:
${b.keyFacts.map(x => "- " + x).join("\n")}

ความยาวเป้าหมาย:
${duration}

ช่องทางใช้งาน:
${b.channel}

ไฟล์แนบ:
${b.attachmentGuide}

ให้จัดผลลัพธ์เป็น:
1) Hook เปิดคลิป
2) Storyboard แยกซีน
3) ภาพ/ฟุตเทจที่ควรใช้ในแต่ละซีน
4) ข้อความบนจอ
5) เสียงพากย์
6) คำแนะนำจังหวะตัดต่อ
7) CTA ปิดคลิป

${TANJAI.v9ProtectedBlock(d, "video")}

ให้สร้าง Storyboard พร้อมใช้งานทันที`;
};

TANJAI.v9VoicePrompt = function(d, extra={}){
  const b = TANJAI.buildSharedBrief(d, "voice");
  const duration = extra.length || d.length || "60 วินาที";
  const style = extra.style || d.style || b.tone;
  return `${TANJAI.v9ExecutionHeader("ให้เขียนสคริปต์เสียงพากย์จากข้อมูลด้านล่าง")}

หัวข้อ:
${b.title}

ข้อมูลสำคัญ:
${b.keyFacts.map(x => "- " + x).join("\n")}

ความยาวเสียง:
${duration}

โทนเสียง:
${style}

กลุ่มเป้าหมาย:
${b.audience}

ให้เขียนเป็นสคริปต์อ่านออกเสียงจริง:
- เปิดเรื่องให้น่าสนใจ
- เรียบเรียงลื่นไหล
- ภาษาไทยชัดเจน
- ไม่มีประโยคยาวเกินไป
- ปิดท้ายชัดเจน

${TANJAI.v9ProtectedBlock(d, "voice")}

ให้เขียนสคริปต์เสียงทันที`;
};

TANJAI.v9DeckPrompt = function(d, extra={}){
  const b = TANJAI.buildSharedBrief(d, "deck");
  const count = extra.count || d.count || "8";
  return `${TANJAI.v9ExecutionHeader("ให้สร้างโครงสไลด์จากข้อมูลด้านล่าง")}

หัวข้อสไลด์:
${b.title}

รายละเอียดสำคัญ:
${b.keyFacts.map(x => "- " + x).join("\n")}

จำนวนสไลด์:
${count}

กลุ่มผู้ฟัง:
${b.audience}

ให้จัดผลลัพธ์เป็น:
1) ชื่อสไลด์แต่ละหน้า
2) Bullet สำคัญ
3) Speaker Notes
4) ภาพประกอบที่แนะนำ
5) สไลด์สรุปปิดท้าย

${TANJAI.v9ProtectedBlock(d, "deck")}

ให้สร้าง Outline สไลด์ทันที`;
};

TANJAI.v9ContentPrompt = function(d){
  const b = TANJAI.buildSharedBrief(d, "post");
  const output = d.channel || "สรุปงาน";
  return `${TANJAI.v9ExecutionHeader("ให้สรุปและเรียบเรียงเนื้อหาจากข้อมูลด้านล่าง")}

หากมีรูปเอกสารแนบ ให้อ่านข้อมูลจากภาพก่อน แล้วค่อยสรุป
หากอ่านข้อความจากภาพไม่ชัด ห้ามเดา ให้ระบุว่า “ข้อความส่วนนี้อ่านไม่ชัด”

หัวข้องาน:
${b.title}

หน่วยงาน / เจ้าของงาน:
${b.orgName}

รายละเอียด:
${b.detail}

วัน / เวลา:
${b.dateTime || "ไม่ระบุ"}

สถานที่:
${b.place || "ไม่ระบุ"}

บุคคล / หน่วยงานที่เกี่ยวข้อง:
${b.people || "ไม่ระบุ"}

ต้องการเรียบเรียงเป็น:
${output}

ขอผลลัพธ์พร้อมใช้:
1) สรุปงาน
2) โพสต์ Facebook / Line
3) แคปชั่นสั้น
4) สคริปต์เสียง
5) สคริปต์คลิป
6) ข้อความสำหรับทำสื่อ
7) คำที่ต้องตรวจสอบก่อนเผยแพร่

${TANJAI.v9ProtectedBlock(d, "post")}

ให้เรียบเรียงเนื้อหาทันที`;
};

TANJAI.v9MCPrompt = function(d){
  const b = TANJAI.buildSharedBrief(d, "mc");
  const output = d.channel || "สคริปต์พิธีกรเต็ม";
  const style = d.style || b.tone || "ทางการ สุภาพ อ่านง่าย";
  return `${TANJAI.v9ExecutionHeader("ให้เขียนสคริปต์พิธีกร / ผู้ดำเนินรายการจากข้อมูลด้านล่าง")}

หากข้อมูลไม่พอ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น” และเว้นช่องให้เติมภายหลัง
ห้ามแต่งชื่อบุคคล ตำแหน่ง หน่วยงาน วันที่ เวลา หรือสถานที่ขึ้นเอง

ชื่องาน:
${b.title}

หน่วยงาน / ผู้จัด:
${b.orgName}

วัน / เวลา:
${b.dateTime || "ไม่ระบุ"}

สถานที่:
${b.place || "ไม่ระบุ"}

ประธาน / ผู้กล่าวรายงาน / ผู้เกี่ยวข้อง:
${b.people || "ไม่ระบุ"}

กำหนดการ / ลำดับพิธี:
${b.detail}

ต้องการสร้าง:
${output}

สไตล์พิธีกร:
${style}

ไฟล์แนบ:
${b.attachmentGuide}

ขอผลลัพธ์พร้อมใช้บนเวที:
1) สคริปต์พิธีกรเต็ม
2) คำเชิญประธาน
3) คำเชิญผู้กล่าวรายงาน
4) คำกล่าวรายงาน
5) คำกล่าวประธาน
6) คำเชื่อมช่วง
7) สคริปต์เปิด / ปิดงาน
8) เวอร์ชันย่อถืออ่าน
9) หมายเหตุสำหรับพิธีกร

รูปแบบภาษา:
- สุภาพ
- อ่านออกเสียงง่าย
- แยกช่วงชัดเจน
- ใส่ [เว้นจังหวะ] เมื่อจำเป็น
- หากข้อมูลไม่ชัด ให้ใช้ [เติมชื่อ...] แทนการเดา

${TANJAI.v9ProtectedBlock(d, "mc")}

ให้เขียนสคริปต์พิธีกรทันที`;
};

TANJAI.discussPrompt = function(type, d){
  const b = TANJAI.buildSharedBrief(d, type);
  const taskNames = {
    image:"ภาพประชาสัมพันธ์",
    album:"ชุดภาพโพสต์ Facebook",
    post:"เรียบเรียงเนื้อหา / สรุปงาน",
    mc:"สคริปต์พิธีกร / ผู้ดำเนินรายการ",
    video:"วิดีโอ / Storyboard",
    voice:"สคริปต์เสียง",
    deck:"สไลด์",
    kit:"Prompt Pack"
  };
  return `Prompt สำหรับแก้ / คุยต่อ

ช่วยตรวจและปรับงานประเภท “${taskNames[type] || "สื่อประชาสัมพันธ์"}”
ยังไม่ต้องสร้างผลงานสุดท้าย ให้ช่วยเกลาคำสั่งให้คมขึ้น

ข้อมูลกลาง:
- หัวข้อ: ${b.title}
- เจ้าของงาน: ${b.orgName}
- จุดประสงค์: ${b.purpose}
- กลุ่มเป้าหมาย: ${b.audience}
- รายละเอียด: ${b.detail}

ช่วยเสนอ:
1) จุดที่ควรปรับให้ชัดขึ้น
2) คำที่ควรระวังหรือควรสะกดให้ตรง
3) เวอร์ชัน Prompt ที่กระชับกว่า
4) ข้อควรตรวจสอบก่อนนำไปใช้จริง

${TANJAI.v9ProtectedBlock(d, type)}`;
};

TANJAI.executionPrompt = function(type, d, extra={}){
  if(type === "image") return TANJAI.imagePrompt(d, "gpt");
  if(type === "album") return TANJAI.v9AlbumPrompt(d);
  if(type === "post") return TANJAI.v9ContentPrompt(d);
  if(type === "mc") return TANJAI.v9MCPrompt(d);
  if(type === "video") return TANJAI.v9VideoPrompt(d, extra);
  if(type === "voice") return TANJAI.v9VoicePrompt(d, extra);
  if(type === "deck") return TANJAI.v9DeckPrompt(d, extra);
  if(type === "kit") return TANJAI.promptPack ? TANJAI.promptPack(d) : TANJAI.v9ContentPrompt(d);
  return TANJAI.v9ContentPrompt(d);
};

TANJAI.videoStoryboard = function(d, length="60 วินาที"){
  return TANJAI.v9VideoPrompt(d, {length});
};

TANJAI.deckOutline = function(d, count=8){
  return TANJAI.v9DeckPrompt(d, {count});
};


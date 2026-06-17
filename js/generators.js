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
    audience: v("audience") || "ประชาชนทั่วไป",
    tone: v("tone") || "ทางการ สุภาพ อ่านง่าย",
    mainCategory: v("mainCategory") || "ไม่ระบุ",
    subCategory: v("subCategory") || "ไม่ระบุ",
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
  if(detailOk){ score += 14; good.push("มีรายละเอียดงานเพียงพอ"); } else { missing.push("รายละเอียดงานยังน้อย ควรเพิ่มว่า ใคร / ทำอะไร / ที่ไหน / เมื่อไหร่ / ต้องการให้ประชาชนทำอะไร"); }
  if(hasSize){ score += 5; good.push("กำหนดขนาดหรือช่องทางใช้งานแล้ว"); }
  if(hasDate){ score += 6; good.push("มีวัน/เวลา"); } else { suggestions.push("ถ้างานมีเส้นตายหรือกิจกรรม ควรเพิ่มวัน/เวลาเพื่อให้ภาพครบถ้วน"); }
  if(hasPlace){ score += 5; good.push("มีสถานที่"); } else { suggestions.push("ถ้างานมีสถานที่จริง ควรเพิ่มสถานที่เพื่อให้ประชาชนเข้าใจทันที"); }
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
  const mode = d.useMode || "สร้างภาพใหม่ด้วย AI";
  const level = d.originalityLevel || (mode === "ปรับภาพจริง + ใส่กราฟิก" ? "สมดุล" : mode === "สร้างภาพใหม่ด้วย AI" ? "ไม่บังคับ" : "สูงสุด");
  const photoCount = Number(d.photoCount || 0);
  const hasPhotos = photoCount > 0;
  const photoNames = d.photoNames || "ภาพแนบ";
  const smartOn = !!d.smartCoach;

  const guardItems = [];
  if(mode !== "สร้างภาพใหม่ด้วย AI"){
    if(d.safeUseMain) guardItems.push("- ใช้ภาพที่แนบเป็นภาพหลักจริง");
    if(d.safeFace) guardItems.push("- ห้ามเปลี่ยนใบหน้า");
    if(d.safeNewPerson) guardItems.push("- ห้ามสร้างบุคคลใหม่");
    if(d.safeLook) guardItems.push("- ห้ามเปลี่ยนทรงผม / ชุด / รูปร่าง");
    if(d.safeScene) guardItems.push("- ห้ามเปลี่ยนฉากหลัก");
    if(d.safeAdjustOnly) guardItems.push("- อนุญาตเฉพาะการปรับแสง สี ความคมชัด และการครอป");
    if(d.safeOverlay) guardItems.push("- อนุญาตให้ใส่ข้อความ / กรอบ / กล่องข้อความ / กราฟิกเสริม");
    if(d.safeNoCover) guardItems.push("- ห้ามบังใบหน้าหรือรายละเอียดสำคัญ");
  }
  const guardText = guardItems.length ? guardItems.join("\n") : (mode === "สร้างภาพใหม่ด้วย AI" ? "- ไม่มีข้อบังคับคงต้นฉบับ เน้นสร้างภาพใหม่ตามโจทย์" : "- คงภาพจริงเป็นหลักและหลีกเลี่ยงการวาดใหม่");

  let modePrompt = "";
  if(mode === "ใช้ภาพจริงเป็นต้นฉบับ"){
    modePrompt = `ใช้ภาพที่แนบเป็นภาพจริงต้นฉบับ

ข้อสำคัญ:
- ห้ามสร้างบุคคลใหม่
- ห้ามเปลี่ยนใบหน้า อัตลักษณ์ ทรงผม รูปร่าง หรือชุด
- ห้ามเปลี่ยนสถานที่จริงในภาพ
- ให้ปรับได้เฉพาะแสง สี ความคมชัด การครอป และความเรียบร้อยของภาพ
- หากมีการเพิ่มองค์ประกอบกราฟิก ให้เป็นองค์ประกอบเสริมเท่านั้น
- ห้ามทำให้ภาพดูเป็นภาพวาดใหม่
- ผลลัพธ์ต้องยังคงเป็นภาพถ่ายจริงของบุคคลและสถานที่เดิม`;
  }else if(mode === "ปรับภาพจริง + ใส่กราฟิก"){
    modePrompt = `ใช้ภาพที่แนบเป็นภาพจริงต้นฉบับสำหรับงานประชาสัมพันธ์

ข้อสำคัญ:
- ห้ามสร้างบุคคลใหม่
- ห้ามเปลี่ยนใบหน้า อัตลักษณ์ ทรงผม รูปร่าง หรือชุด
- ห้ามเปลี่ยนฉากหลักของภาพ
- ปรับได้เฉพาะแสง สี ความคมชัด และองค์ประกอบภาพ
- สามารถเพิ่มหัวข้อ ข้อความ กล่องข้อความ กราฟิกประกอบ ไอคอน และกรอบได้
- กราฟิกต้องไม่บังใบหน้า หรือรายละเอียดสำคัญของภาพ
- ผลลัพธ์ต้องดูเป็นงานกราฟิกประชาสัมพันธ์จากภาพจริง ไม่ใช่การวาดภาพใหม่`;
  }else if(mode === "รีทัชภาพจริง"){
    modePrompt = `ใช้ภาพที่แนบเป็นภาพจริงต้นฉบับ

ให้รีทัชภาพเท่านั้น โดย:
- ห้ามเปลี่ยนใบหน้า บุคคล ชุด ทรงผม รูปร่าง และฉาก
- ปรับเฉพาะแสง สี โทนผิว ความคมชัด white balance contrast และการครอป
- ลบรอยรบกวนเล็กน้อยได้ หากไม่กระทบตัวบุคคล
- ห้ามทำให้ภาพกลายเป็นภาพสร้างใหม่`;
  }else{
    modePrompt = `สร้างภาพใหม่ด้วย AI ตามโจทย์ที่กำหนด${hasPhotos ? " โดยใช้ภาพแนบเป็น reference หรือแรงบันดาลใจเท่านั้น ไม่จำเป็นต้องคงบุคคลหรือฉากเดิม" : ""}`;
  }

  const title = d.title || "หัวข้องาน";
  const orgName = d.orgName || "ทันใจ AI Studio";
  const detail = d.detail || "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม";
  const secondaryLines = [
    d.dateTime ? `วันเวลา: ${d.dateTime}` : "",
    d.place ? `สถานที่: ${d.place}` : "",
    d.people ? `ผู้เกี่ยวข้อง: ${d.people}` : ""
  ].filter(Boolean);

  const missing = [];
  if(!d.dateTime) missing.push("- วัน / เวลา: ไม่ระบุ ให้ใช้เฉพาะเมื่อจำเป็น หรือเว้นช่องให้เติมภายหลัง");
  if(!d.place) missing.push("- สถานที่: ไม่ระบุ ให้หลีกเลี่ยงการแต่งสถานที่ขึ้นเอง");
  if(!d.people) missing.push("- บุคคล / หน่วยงานที่เกี่ยวข้อง: ไม่ระบุ ให้ใช้ชื่อองค์กรหลักแทน");
  if(!hasPhotos && mode !== "สร้างภาพใหม่ด้วย AI") missing.push("- ภาพแนบ: ยังไม่มีภาพจริง หากต้องการคงคน/ฉากเดิม ต้องแนบภาพก่อนใช้ Prompt นี้");

  const systemDecisions = [
    `- ขนาดภาพที่จะทำก่อน: ${d.size || "4:5 Facebook / Line 1080x1350"}`,
    `- เน้นเด่นที่สุด: ${title}`,
    `- แนวภาพ: ${d.style}, ${d.colorTone}, ${d.density}`,
    `- อารมณ์ที่ภาพควรสื่อ: ${d.tone}, อ่านง่าย เหมาะกับ${d.orgType || "กลุ่มเป้าหมาย"}`,
    `- ภาพแนบ: ${hasPhotos ? `ใช้ ${photoCount} รูป (${photoNames})` : "ไม่มีภาพแนบ"}`
  ];

  const briefSummary = `ประเภทองค์กร: ${d.orgType || "ไม่ระบุ"}
ชื่อองค์กร / รายละเอียด: ${orgName}
ประเภทภาพ: ${d.mainCategory || "ภาพประชาสัมพันธ์"}
หัวข้องานย่อย: ${d.subCategory || "ไม่ระบุ"}
กลุ่มเป้าหมาย: ${d.audience}
ช่องทางใช้งาน: ${d.size}
โหมดการใช้ภาพ: ${mode}
ระดับการคงต้นฉบับ: ${level}
โทนภาพ: ${d.style}
โทนสีที่ใช้: ${d.colorTone}
สิ่งที่คนดูควรรู้: ${detail}
อารมณ์ที่ภาพควรสื่อ: ${d.tone} อ่านง่าย น่าเชื่อถือ และเหมาะกับงานประชาสัมพันธ์`;

  const textOnImage = `ข้อความหลัก:
${title}

ข้อความรอง / รายละเอียด:
${detail}

${secondaryLines.length ? secondaryLines.join("\n") : "รายละเอียดวันเวลา / สถานที่ / ผู้เกี่ยวข้อง: ไม่ระบุ หรือให้เว้นพื้นที่เติมภายหลัง"}`;

  const creativeDirection = `แนวภาพโดยรวม:
ออกแบบภาพประชาสัมพันธ์ภาษาไทยให้ดูเป็นงานมืออาชีพ ใช้ visual hierarchy ชัดเจน หัวข้อหลักเด่นมาก รายละเอียดรองอ่านง่าย ไม่รก ใช้พื้นที่ว่างเหมาะสม จัดวางองค์ประกอบให้เหมาะกับ ${d.size}
สไตล์: ${d.style}
Layout: ${d.layout}
โทนสี: ${d.colorTone}
ความหนาแน่น: ${d.density}
จุดเด่นของภาพ: ${d.focus}
ข้อห้าม / หมายเหตุ: ${d.avoid}`;

  const backupCommand = d.smartBackup ? `

คำสั่งสำรองหลังได้ภาพ:
ช่วยสร้างภาพเดิมแบบไม่มีข้อความ โดยคงพื้นหลัง กราฟิก กล่องข้อความ ไอคอน สี แสง บรรยากาศ และองค์ประกอบทั้งหมดให้เหมือนภาพล่าสุดมากที่สุด ลบเฉพาะตัวอักษรออกเท่านั้น ห้ามลบกล่องข้อความ ห้ามลบไอคอน ห้ามเปลี่ยนพื้นหลัง ห้ามเปลี่ยนองค์ประกอบหลัก และห้ามออกแบบใหม่

คำสั่งแก้เฉพาะจุด:
หากต้องแก้ ให้แก้เฉพาะข้อความ สี ขนาดตัวอักษร หรือการจัดวาง โดยห้ามเปลี่ยนภาพหลัก ห้ามเปลี่ยนบุคคล และห้ามออกแบบใหม่ทั้งหมด` : "";

  const autoCriticNote = d.criticSummary ? `

Auto Prompt Critic:
ระบบตรวจความพร้อมหลังบ้านแล้ว ให้นำข้อควรระวังต่อไปนี้ไปปรับงานโดยอัตโนมัติ ไม่ต้องตอบเป็นรายงานแยก:
${d.criticSummary}` : "";

  const confirmLine = d.smartConfirm ? `

ถ้าข้อมูลถูกต้องแล้ว พิมพ์ว่า “สร้างภาพได้เลย”` : "";

  const promptDestination = `

คำสั่งปลายทาง:
กรุณาจัด Prompt สำหรับสร้างภาพจากข้อมูลนี้ให้พร้อมใช้งาน โดยยังไม่ต้องสร้างภาพจริง`;

  const gptDestination = `

คำสั่งปลายทาง:
กรุณาสร้างภาพประชาสัมพันธ์จริงทันทีจากข้อมูลนี้ หากมีโลโก้ QR Code หรือภาพแนบในแชทนี้ ให้ใช้อ้างอิงจากไฟล์แนบดังกล่าว`;

  if(outputMode === "gpt"){
    return `คำสั่งพร้อมใช้สำหรับทันใจ GPT

ข้อมูลที่ระบบคัดเลือกและจัดให้เหมาะที่สุด:
${missing.length ? missing.join("\n") : "- ไม่มีข้อมูลจำเป็นที่ต้องรอเพิ่มเติมแล้ว"}
${systemDecisions.join("\n")}

สรุปคำสั่งก่อนสร้างภาพ:
${briefSummary}

ข้อความบนภาพที่จะใช้:
${textOnImage}

ไฟล์ที่ควรแนบ ถ้ามี:
${hasPhotos ? `ใช้ภาพแนบจริงจำนวน ${photoCount} รูป: ${photoNames}` : "- หากมีโลโก้จริง / QR Code จริง / ภาพถ่ายกิจกรรมจริง ให้แนบไปพร้อม Prompt นี้"}

ข้อห้ามสำหรับภาพจริง:
${guardText}

คำสั่งออกแบบพร้อมส่งเข้า GPT:
บทบาทของ AI:
คุณคือ Creative Director และ Graphic Designer สำหรับงานประชาสัมพันธ์ภาษาไทย ช่วยออกแบบภาพให้สวย ทันสมัย อ่านง่าย และพร้อมใช้ในงานจริง

เป้าหมายงาน:
สร้างภาพประชาสัมพันธ์ภาษาไทย หัวข้อ “${title}” สำหรับ ${orgName}

โหมดการใช้ภาพ:
- ${mode}
- ระดับการคงต้นฉบับ: ${level}
- ภาพแนบ: ${hasPhotos ? `${photoCount} รูป (${photoNames})` : "ไม่มี"}

Prompt Guard:
${modePrompt}

ข้อมูลจริง:
${briefSummary}

ข้อความบนภาพ:
${textOnImage}

Creative Direction:
${creativeDirection}
${backupCommand}${autoCriticNote}${TANJAI.outputDeliveryGuard("ภาพ")}${confirmLine}${gptDestination}`;
  }

  return `Prompt สำหรับสร้างภาพ

โหมดการใช้ภาพ
- ${mode}
- ระดับการคงต้นฉบับ: ${level}
- ภาพแนบ: ${hasPhotos ? `${photoCount} รูป (${photoNames})` : "ไม่มี"}

ข้อห้ามสำหรับภาพจริง
${guardText}
- ข้อห้ามเพิ่มเติม: ${d.avoid}

คำสั่งออกแบบ
${modePrompt}

สร้างภาพประชาสัมพันธ์ภาษาไทย หัวข้อ “${title}” สำหรับ ${orgName} โดยเน้นงานออกแบบที่สวย ทันสมัย อ่านง่าย มี visual hierarchy ชัดเจน หัวข้อหลักเด่น รายละเอียดรองอ่านง่าย ไม่รก ใช้พื้นที่ว่างเหมาะสม และดูเหมือนงานกราฟิกดีไซเนอร์มืออาชีพ

รายละเอียดงาน
- ชื่อองค์กร / แบรนด์: ${orgName}
- ประเภทองค์กร: ${d.orgType || "ไม่ระบุ"}
- หมวดงานหลัก: ${d.mainCategory || "ไม่ระบุ"}
- หัวข้องานย่อย: ${d.subCategory || "ไม่ระบุ"}
- กลุ่มเป้าหมาย: ${d.audience}
- รายละเอียดสำคัญ: ${detail}
- วันเวลา: ${d.dateTime || "ไม่ระบุ"}
- สถานที่: ${d.place || "ไม่ระบุ"}
- บุคคล/หน่วยงานที่เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}

ขนาด / ช่องทาง
- ขนาดภาพ: ${d.size}

โทนภาพ
- สไตล์ภาพ: ${d.style}
- Layout: ${d.layout}
- โทนสี: ${d.colorTone}
- ความหนาแน่น: ${d.density}
- จุดเด่นของภาพ: ${d.focus}
- โทนภาษา: ${d.tone}

ข้อความบนภาพถ้ามี
- ${[title, ...secondaryLines].join("\n- ") || "ให้ AI จัดหัวข้อและข้อความบนภาพตามความเหมาะสม"}${backupCommand}${autoCriticNote}${TANJAI.outputDeliveryGuard("ภาพ")}${promptDestination}`;
};



TANJAI.postText = function(d){
  return `📌 ${d.title}

${d.detail}

${d.dateTime ? "📅 " + d.dateTime + "\\n" : ""}${d.place ? "📍 " + d.place + "\\n" : ""}${d.people ? "\\n" + d.people + "\\n" : ""}
${d.orgName} ขอประชาสัมพันธ์ข้อมูลดังกล่าวให้ ${d.audience} ได้รับทราบ

#${d.orgName.replaceAll(" ","")} #ประชาสัมพันธ์ #ทันใจAIStudio`;
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
  const opener = style.includes("เร่งด่วน") ? "ขอแจ้งข่าวสำคัญให้ประชาชนได้รับทราบ" : "ขอประชาสัมพันธ์ข้อมูลสำคัญให้ทุกท่านได้รับทราบ";
  const middle = d.detail;
  const close = `ติดตามข่าวสารเพิ่มเติมได้ทางช่องทางประชาสัมพันธ์ของ ${d.orgName}`;
  if(length === "15 วินาที"){
    return `${opener}

${d.title}

${middle}

${close}`;
  }
  if(length === "30 วินาที"){
    return `${opener}

${d.title}

${middle}

${d.dateTime ? "กำหนดการ: " + d.dateTime + "\\n" : ""}${d.place ? "สถานที่: " + d.place + "\\n" : ""}

${close}`;
  }
  return `${opener}

วันนี้ ${d.orgName} มีข้อมูลประชาสัมพันธ์ เรื่อง “${d.title}”

${middle}

${d.dateTime ? "วันและเวลา: " + d.dateTime + "\\n" : ""}${d.place ? "สถานที่: " + d.place + "\\n" : ""}${d.people ? "ผู้เกี่ยวข้อง: " + d.people + "\\n" : ""}

ขอให้ประชาชนและผู้เกี่ยวข้องติดตามข้อมูลดังกล่าว และดำเนินการตามรายละเอียดที่แจ้งไว้

${close}`;
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

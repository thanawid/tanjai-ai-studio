window.TANJAI = window.TANJAI || {};

/**
 * ===================================================
 * TANJAI AI Studio v9.1.4 — Prompt Brain Engine
 * ===================================================
 * Purpose:
 * - Turn raw form answers into professional, safe, complete execution prompts.
 * - Separate facts from assumptions.
 * - Infer creative direction without inventing dates, places, people, fees, contacts, QR codes, or project names.
 */
(function(){
  const T = window.TANJAI;
  T.version = "v9.1.4";

  const clean = (value = "", fallback = "") => {
    if (T.v9Clean) return T.v9Clean(value, fallback);
    const out = String(value || "").replace(/\n{3,}/g, "\n\n").trim();
    return out || fallback;
  };

  const hasMeaning = value => {
    const v = clean(value, "");
    return !!v && !/^(ยังไม่ได้ระบุ|ไม่ระบุ|หัวข้องาน|กลุ่มเป้าหมายหลัก|ให้ AI เลือกให้เหมาะสม)$/i.test(v);
  };

  const uniq = items => [...new Set((items || []).map(x => clean(x, "")).filter(Boolean))];
  const bullet = (items, fallback = "- ไม่มี") => {
    const list = uniq(items);
    return list.length ? list.map(x => `- ${x}`).join("\n") : fallback;
  };
  const safeLine = (label, value) => hasMeaning(value) ? `${label}: ${clean(value)}` : "";

  T.brainType = function(d = {}, tool = "image"){
    const text = `${d.title || ""} ${d.detail || ""} ${d.mainCategory || ""} ${d.subCategory || ""} ${d.workType || ""} ${d.workContext || ""} ${d.imageType || ""}`.toLowerCase();
    const re = pattern => pattern.test(text);
    if(re(/เดิน\s*วิ่ง|วิ่ง|มินิมาราธอน|marathon|fun run|charity run|การกุศล/)) return "charity-run";
    if(re(/ประชาคม|รับฟังความคิดเห็น|เสนอปัญหา|แผนพัฒนาท้องถิ่น/)) return "civic-meeting";
    if(re(/ภาษี|ชำระ|ค่าธรรมเนียม|ทะเบียน|บริการ|ขั้นตอน/)) return "service-info";
    if(re(/เตือน|ระวัง|มิจฉาชีพ|ฉุกเฉิน|ไฟดับ|ปิดถนน|ประกาศ/)) return "announcement";
    if(re(/ประชุม|ร่วมประชุม|ลงพื้นที่|ตรวจงาน|ติดตาม|สรุปกิจกรรม|รายงานผล/)) return "activity-report";
    if(re(/อบรม|สัมมนา|ให้ความรู้|รณรงค์|ป้องกัน|สุขภาพ/)) return "education-campaign";
    if(re(/เพลง|single|ซิงเกิล|mv|music|ปกเพลง/)) return "music-promo";
    if(re(/ไว้อาลัย|อาลัย|รำลึก|ลดสี/)) return "memorial";
    if(tool === "post") return "social-post";
    if(tool === "video") return "video-plan";
    if(tool === "voice") return "voice-script";
    if(tool === "deck") return "deck";
    return "general-publicity";
  };

  T.brainLabel = function(kind){
    const map = {
      "charity-run":"เดินวิ่ง / วิ่งเพื่อการกุศล",
      "civic-meeting":"ประชุมประชาคม / รับฟังความคิดเห็น",
      "service-info":"ข้อมูลบริการ / ขั้นตอนบริการ",
      "announcement":"แจ้งข่าว / ประกาศ / เตือนภัย",
      "activity-report":"สรุปกิจกรรม / รายงานผล / ลงพื้นที่",
      "education-campaign":"รณรงค์ / อบรม / ให้ความรู้",
      "music-promo":"โปรโมทเพลง / ผลงานสร้างสรรค์",
      "memorial":"ไว้อาลัย / สุภาพ / ลดสี",
      "social-post":"โพสต์ประชาสัมพันธ์",
      "video-plan":"วิดีโอ / Storyboard",
      "voice-script":"สคริปต์เสียงพากย์",
      "deck":"สไลด์นำเสนอ",
      "general-publicity":"ประชาสัมพันธ์ทั่วไป"
    };
    return map[kind] || map["general-publicity"];
  };

  T.brainFacts = function(d = {}){
    return [
      safeLine("ประเภทองค์กร / กลุ่มผู้ใช้งาน", d.orgType),
      safeLine("ชื่อองค์กร / รายละเอียด", d.orgName),
      safeLine("หมวดงานหลัก", d.mainCategory),
      safeLine("หัวข้องาน / ประเภทงาน", d.title),
      safeLine("รายละเอียดที่ให้มา", d.detail),
      safeLine("กลุ่มเป้าหมาย", d.audience),
      safeLine("ช่องทางใช้งาน", d.channel || d.format),
      safeLine("ขนาด / รูปแบบ", d.size || d.format),
      safeLine("วัน / เวลา", d.dateTime),
      safeLine("สถานที่", d.place),
      safeLine("บุคคล / หน่วยงานที่เกี่ยวข้อง", d.people)
    ].filter(Boolean);
  };

  T.brainMissing = function(d = {}, kind = "general-publicity", tool = "image"){
    const missing = [];
    const add = (label, value) => { if(!hasMeaning(value)) missing.push(label); };
    if(!hasMeaning(d.title)) missing.push("หัวข้องานหลัก");
    if(!hasMeaning(d.orgName)) missing.push("ชื่อหน่วยงาน / แบรนด์เจ้าของงาน");
    if(!hasMeaning(d.detail)) missing.push("รายละเอียดหลักของงาน");

    if(["charity-run", "civic-meeting", "education-campaign"].includes(kind)){
      add("วันที่", d.dateTime);
      add("เวลา", d.dateTime);
      add("สถานที่", d.place);
      if(kind === "charity-run"){
        missing.push("ระยะทาง / ประเภทการวิ่ง ถ้ามี");
        missing.push("ค่าสมัคร / วิธีสมัคร / ช่องทางติดต่อ ถ้ามี");
      }
    }
    if(kind === "activity-report"){
      add("วันเวลาที่จัดกิจกรรม", d.dateTime);
      add("สถานที่จัดกิจกรรม", d.place);
      if(!hasMeaning(d.people)) missing.push("ผู้เข้าร่วม / ผู้บริหาร / หน่วยงานที่เกี่ยวข้อง");
    }
    if(kind === "announcement"){
      if(!hasMeaning(d.dateTime)) missing.push("ช่วงเวลาที่ประกาศมีผล / วันที่เกี่ยวข้อง");
      if(!hasMeaning(d.place)) missing.push("พื้นที่หรือสถานที่ที่เกี่ยวข้อง");
    }
    if(tool === "image"){
      if(!hasMeaning(d.size)) missing.push("ขนาดภาพปลายทาง");
      if(/เทศบาล|อบต|หน่วยงาน|ราชการ/.test(`${d.orgType || ""} ${d.orgName || ""}`)) missing.push("โลโก้จริงของหน่วยงาน ถ้าต้องใส่");
    }
    return uniq(missing);
  };

  T.brainAssumptions = function(d = {}, kind = "general-publicity", tool = "image"){
    const items = [];
    const isGov = /เทศบาล|อบต|องค์การบริหาร|ราชการ|ชุมชน/.test(`${d.orgType || ""} ${d.orgName || ""}`);
    if(!hasMeaning(d.audience)) items.push(isGov ? "ตั้งกลุ่มเป้าหมายเชิงการสื่อสารเป็นประชาชนทั่วไปและชุมชนในพื้นที่" : "ตั้งกลุ่มเป้าหมายเชิงการสื่อสารเป็นผู้ติดตามทั่วไป");
    if(kind === "charity-run"){
      items.push("ใช้ภาพสื่อสุขภาพ ความร่วมมือ และการกุศลได้ แต่ห้ามอ้างจำนวนผู้ร่วมงานหรือรายละเอียดสมัครที่ไม่ได้ให้มา");
      items.push("ใช้ภาพคนเดิน–วิ่งทั่วไปแบบไม่ระบุตัวตนได้ หากไม่มีภาพบุคคลจริงแนบมา");
    }
    if(tool === "image") items.push("เลือกโทนภาพและ Layout ให้เหมาะกับบริบทได้ เพราะเป็นการตัดสินใจด้านดีไซน์ ไม่ใช่ข้อเท็จจริงใหม่");
    return uniq(items);
  };

  T.brainForbiddenFacts = function(d = {}, kind = "general-publicity"){
    const fixed = ["ชื่อบุคคล", "ตำแหน่ง", "ชื่อหน่วยงาน", "ชื่อโครงการ", "สถานที่", "วันที่", "เวลา", "ตัวเลข", "ค่าสมัคร", "เบอร์ติดต่อ", "QR Code", "โลโก้"];
    const extra = clean(d.brainNoInvent || "", "");
    return uniq(extra ? fixed.concat(extra.split(/[,/\n]+/)) : fixed);
  };

  T.brainDesign = function(d = {}, kind = "general-publicity", tool = "image"){
    const isGov = /เทศบาล|อบต|องค์การบริหาร|ราชการ|ชุมชน/.test(`${d.orgType || ""} ${d.orgName || ""}`);
    const base = {
      style:"Modern Premium Clean",
      color:"ให้ AI เลือกให้เหมาะสมกับงาน",
      layout:"หัวข้อหลักเด่น + กล่องข้อมูลรอง + พื้นที่เว้นสำหรับรายละเอียดที่ยังไม่ระบุ",
      mood:"สุภาพ อ่านง่าย ใช้งานจริง",
      visual:"ภาพประกอบสอดคล้องกับหัวข้องาน ไม่ใช้โลโก้ปลอม ไม่สร้าง QR ปลอม",
      hierarchy:["หัวข้อหลัก", "ชื่อหน่วยงาน", "รายละเอียดที่มีจริง", "พื้นที่เว้นเติมข้อมูลภายหลัง"]
    };
    if(kind === "charity-run") return {
      style:"Modern Active Community Charity Poster / Clean Sport Infographic",
      color:isGov ? "เขียว–เหลือง–ขาว สะอาด สดใส เหมาะกับหน่วยงานท้องถิ่น" : "เขียวสด ฟ้า ขาว หรือโทนสุขภาพที่ให้พลังบวก",
      layout:"Hero วิ่งการกุศล + หัวข้อใหญ่กลางภาพ + กล่องข้อมูลกิจกรรมด้านล่าง + เว้นช่องวันที่/สถานที่/สมัคร",
      mood:"มีพลัง อบอุ่น เพื่อชุมชน สุขภาพดี ไม่ขายฝันเกินจริง",
      visual:"ประชาชนร่วมเดิน–วิ่งในบรรยากาศชุมชน เส้นทางสะอาด แสงเช้า องค์ประกอบเคลื่อนไหวแบบสุภาพ ไม่เน้นใบหน้าบุคคลจริง",
      hierarchy:["ขอเชิญร่วมวิ่งการกุศล", d.orgName || "ชื่อหน่วยงาน", "จากข้อมูลเบื้องต้น", "ช่องเว้น: วันที่ / เวลา / สถานที่ / สมัคร"]
    };
    if(kind === "announcement") return {
      style:"Government Clean Announcement",
      color:"น้ำเงิน–ขาว หรือสีทางการที่อ่านชัด",
      layout:"หัวข้อเตือน/ประกาศเด่นที่สุด + รายละเอียดสั้น + ช่องทางติดต่อถ้ามีจริง",
      mood:"ชัดเจน เร่งด่วนพอดี น่าเชื่อถือ",
      visual:"ไอคอนประกาศ/แจ้งเตือนแบบเรียบ ไม่ตกใจเกินเหตุ",
      hierarchy:["หัวข้อประกาศ", "ผลกระทบ/รายละเอียดจริง", "วันเวลา/พื้นที่ถ้ามี", "หน่วยงาน"]
    };
    if(kind === "activity-report") return {
      style:"Municipal Photo Report / Clean News Card",
      color:"สีองค์กรหรือโทนสุภาพ",
      layout:"ภาพกิจกรรมเด่น + หัวข้อข่าว + 3 ประเด็นสรุป",
      mood:"น่าเชื่อถือ อบอุ่น เห็นการทำงานจริง",
      visual:"ใช้ภาพจริงเป็นหลัก หากมีภาพแนบ ห้ามเปลี่ยนอัตลักษณ์บุคคล",
      hierarchy:["หัวข้อกิจกรรม", "ใครทำอะไร", "ที่ไหน/เมื่อไหร่", "ประโยชน์ต่อประชาชน"]
    };
    if(kind === "service-info") return {
      style:"Modern Infographic / Step Layout",
      color:isGov ? "เขียว–เหลือง–ขาว หรือ น้ำเงิน–ขาว อ่านง่าย" : "สีแบรนด์อ่านง่าย",
      layout:"เลขขั้นตอน 1-2-3 + กล่องข้อมูล + ไอคอนน้อยแต่ชัด",
      mood:"เป็นระบบ เข้าใจเร็ว ไม่รก",
      visual:"ไอคอนบริการ เอกสาร หรือประชาชนใช้บริการแบบเรียบง่าย",
      hierarchy:["หัวข้อบริการ", "ขั้นตอน", "เอกสาร/ช่องทางที่มีจริง", "ข้อควรทราบ"]
    };
    if(kind === "memorial") return {
      style:"Formal Memorial Minimal",
      color:"ขาว ดำ เทา ทองหม่น หรือโทนลดสี",
      layout:"จัดกลาง โปร่ง ข้อความน้อย",
      mood:"สำรวม ให้เกียรติ ไม่ฉูดฉาด",
      visual:"พื้นหลังเรียบ แสงนุ่ม ไม่มีเอฟเฟกต์เว่อร์",
      hierarchy:["ข้อความหลัก", "ชื่อ/หน่วยงานตามจริง", "ข้อความรอง"]
    };
    return base;
  };

  T.brainTextOnImage = function(d = {}, kind = "general-publicity"){
    const title = clean(d.title, "");
    const detail = clean(d.detail, "");
    const org = clean(d.orgName, "");
    const date = clean(d.dateTime, "");
    const place = clean(d.place, "");
    const items = [];
    if(kind === "charity-run"){
      if(/ขอเชิญ|ร่วมวิ่ง|วิ่งการกุศล/.test(detail)) items.push(detail.length <= 40 ? detail : "ขอเชิญร่วมวิ่งการกุศล");
      else if(title) items.push(title);
      else items.push("ขอเชิญร่วมวิ่งการกุศล");
      if(org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org)) items.push(org);
      if(date) items.push(date);
      if(place) items.push(place);
      if(!date || !place) items.push("จากข้อมูลเบื้องต้น");
      return uniq(items).slice(0, 6);
    }
    if(title) items.push(title);
    if(detail && detail.length <= 70 && !items.includes(detail)) items.push(detail);
    if(date) items.push(date);
    if(place) items.push(place);
    if(org && !/ยังไม่ได้ระบุ|ไม่ระบุ/.test(org)) items.push(org);
    if(items.length < 2) items.push("จากข้อมูลเบื้องต้น");
    return uniq(items).slice(0, 6);
  };

  T.promptBrainAnalyze = function(d = {}, tool = "image"){
    const kind = T.brainType(d, tool);
    const design = T.brainDesign(d, kind, tool);
    const facts = T.brainFacts(d);
    const missing = T.brainMissing(d, kind, tool);
    const assumptions = T.brainAssumptions(d, kind, tool);
    const forbidden = T.brainForbiddenFacts(d, kind);
    const textOnImage = T.brainTextOnImage(d, kind);
    const scoreBase = 100 - Math.min(50, missing.length * 6) - (facts.length < 3 ? 12 : 0);
    const score = Math.max(35, Math.min(100, scoreBase));
    const readiness = score >= 85 ? "พร้อมสั่งทำทันที" : score >= 70 ? "ใช้ได้ แต่ควรตรวจข้อมูลจริงก่อนเผยแพร่" : "ข้อมูลยังบาง ระบบจะทำงานแบบจากข้อมูลเบื้องต้น";
    return {kind, label:T.brainLabel(kind), design, facts, missing, assumptions, forbidden, textOnImage, score, readiness};
  };

  T.promptBrainReport = function(d = {}, tool = "image"){
    const a = T.promptBrainAnalyze(d, tool);
    return `Prompt Brain Engine v9.1.4\n\nสถานะบรีฟ: ${a.readiness}\nคะแนนความพร้อม: ${a.score}/100\nประเภทงานที่ระบบอ่านได้: ${a.label}\n\nข้อมูลจริงที่พบ:\n${bullet(a.facts, "- ยังมีข้อมูลจริงน้อยมาก")}\n\nข้อมูลที่ยังไม่ระบุและห้ามแต่งเอง:\n${bullet(a.missing, "- ไม่พบข้อมูลจำเป็นที่ขาดชัดเจน")}\n\nสิ่งที่ระบบคิดต่อได้อย่างปลอดภัย:\n${bullet(a.assumptions, "- เลือกเฉพาะโทนและการจัดวางให้เหมาะสม")}\n\nCreative Direction:\n- Style: ${a.design.style}\n- Color: ${a.design.color}\n- Layout: ${a.design.layout}\n- Mood: ${a.design.mood}\n- Visual: ${a.design.visual}\n\nลำดับความสำคัญบนงาน:\n${bullet(a.design.hierarchy)}\n\nข้อความบนภาพ / ข้อความหลักที่แนะนำ:\n${bullet(a.textOnImage)}\n\nข้อเท็จจริงที่ห้ามแต่งเพิ่ม:\n${bullet(a.forbidden)}`;
  };

  T.brainBriefBlock = function(d = {}, tool = "image"){
    const a = T.promptBrainAnalyze(d, tool);
    return `[Prompt Brain Engine v9.1.4]\n- ประเภทงานที่วิเคราะห์ได้: ${a.label}\n- สถานะบรีฟ: ${a.readiness}\n- คะแนนความพร้อม: ${a.score}/100\n\nข้อมูลจริงที่ให้มา:\n${bullet(a.facts, "- จากข้อมูลเบื้องต้น: ยังมีข้อมูลจริงไม่มาก")}\n\nข้อมูลที่ยังไม่ระบุ ห้ามแต่งเอง:\n${bullet(a.missing, "- ไม่มีข้อมูลจำเป็นที่ขาดชัดเจน")}\n\nสิ่งที่ AI คิดต่อได้อย่างปลอดภัย:\n${bullet(a.assumptions, "- คิดเฉพาะโทน สี Layout และการจัดวางให้เหมาะสม")}\n\nทิศทางออกแบบ / การสื่อสาร:\n- Style: ${a.design.style}\n- Color Tone: ${a.design.color}\n- Layout: ${a.design.layout}\n- Mood: ${a.design.mood}\n- Visual Guide: ${a.design.visual}`;
  };

  T.brainExecutionHeader = function(taskName){
    return `คำสั่งนี้เป็นคำสั่งให้ลงมือทำทันที\n\nให้${taskName}จากข้อมูลด้านล่าง\nห้ามตอบกลับมาเป็นเพียงการสรุปบรีฟ\nห้ามถามยืนยันก่อน\nหากข้อมูลไม่พอ ให้ใช้ข้อมูลที่มีอย่างเหมาะสม และระบุว่า “จากข้อมูลเบื้องต้น”\nห้ามแต่งข้อมูลจริงเพิ่มเอง\nห้ามเปลี่ยนชื่อบุคคล หน่วยงาน สถานที่ วันที่ และชื่อโครงการ\nหากเครื่องมือปลายทางทำงานนี้ไม่ได้ ให้บอกเหตุผลตรง ๆ แล้วส่งผลลัพธ์ทางเลือกที่ใกล้ที่สุดแทน`;
  };

  // UI hook: add Prompt Brain controls to every common form.
  const originalField = T.field;
  T.field = function(prefix, data){
    const base = originalField ? originalField(prefix, data) : "";
    return base + `
      <div class="form-section brain-engine-section-v914">
        <div class="section-title"><b>🧠</b><h4>Prompt Brain Engine</h4></div>
        <p class="mini-note">ระบบจะวิเคราะห์บรีฟ แยกข้อมูลจริง/ข้อมูลที่ห้ามแต่ง และช่วยคิด Creative Direction ให้อัตโนมัติ</p>
        <div class="form-grid">
          <label>เป้าหมายผลลัพธ์<input id="${prefix}-brainGoal" placeholder="เช่น อยากให้คนสนใจเข้าร่วม / อ่านแล้วเข้าใจเร็ว / ใช้เป็นภาพทางการ"></label>
          <label>เน้นเด่นที่สุด<input id="${prefix}-brainFocus" placeholder="เช่น ชื่องาน / วันที่ / สถานที่ / ข้อความเตือน"></label>
          <label class="full">ข้อมูลที่ห้าม AI แต่งเพิ่ม<input id="${prefix}-brainNoInvent" value="วันที่, เวลา, สถานที่, ค่าสมัคร, เบอร์ติดต่อ, QR Code, โลโก้"></label>
          <label class="checkline full"><input id="${prefix}-brainEnabled" type="checkbox" checked> เปิดระบบวิเคราะห์บรีฟแบบมืออาชีพ</label>
        </div>
      </div>`;
  };

  const originalCommonData = T.commonData;
  T.commonData = function(prefix){
    const d = originalCommonData ? originalCommonData(prefix) : {};
    const $ = T.$ || (s => document.querySelector(s));
    const v = id => ($(`#${prefix}-${id}`)?.value || "").trim();
    const checked = id => !!$(`#${prefix}-${id}`)?.checked;
    d.brainGoal = v("brainGoal");
    d.brainFocus = v("brainFocus");
    d.brainNoInvent = v("brainNoInvent");
    d.brainEnabled = checked("brainEnabled");
    if(d.brainFocus && (!d.focus || d.focus === "เน้นหัวข้อหลัก")) d.focus = d.brainFocus;
    return d;
  };

  // Improve critic with Brain Engine report.
  const oldPromptCritic = T.promptCritic;
  T.promptCritic = function(d = {}, tool = "image"){
    const brain = T.promptBrainReport(d, tool);
    const old = oldPromptCritic ? oldPromptCritic(d) : "";
    return `${brain}\n\n---\nAuto Prompt Critic:\n${old}`;
  };

  T.imagePrompt = function(d = {}, outputMode = "gpt"){
    const a = T.promptBrainAnalyze(d, "image");
    const protectedBlock = T.v9ProtectedBlock ? T.v9ProtectedBlock(d, "image") : "";
    const delivery = T.outputDeliveryGuard ? T.outputDeliveryGuard("ภาพ") : "";
    return `${T.brainExecutionHeader("สร้างภาพประชาสัมพันธ์จริงทันที")}\nหากงานเป็นภาพ และเครื่องมือสามารถสร้างภาพได้ ให้สร้างภาพจริงทันที\nหากเครื่องมือไม่สามารถสร้างภาพได้โดยตรง ให้บอกเหตุผลตรง ๆ แล้วส่ง Prompt ภาพพร้อมใช้แทน\nหลังสร้างภาพ ห้ามตอบกลับเป็นเพียง path ภายใน เช่น /mnt/data/xxx.png ต้องแนบภาพจริงหรือให้ลิงก์ดาวน์โหลดที่เปิดได้จริงเท่านั้น\n\nงานเฉพาะ: ภาพประชาสัมพันธ์\n\n${T.brainBriefBlock(d, "image")}\n\nข้อความที่ควรวางบนภาพ:\n${bullet(a.textOnImage)}\n\nลำดับการจัดวางที่แนะนำ:\n${bullet(a.design.hierarchy)}\n\nข้อกำหนดภาพ:\n- ช่องทาง/ขนาด: ${clean(d.size || d.channel || d.format, "Facebook / Line Post 4:5 หรือ 1:1")}\n- โทนภาษา: ${clean(d.tone, "สุภาพ อ่านง่าย เหมาะกับประชาชนทั่วไป")}\n- ความหนาแน่น: ${clean(d.density, "สมดุล อ่านง่าย")}\n- จุดเน้น: ${clean(d.brainFocus || d.focus, a.design.hierarchy[0] || "หัวข้อหลัก")}\n- ถ้าไม่มีโลโก้จริง ให้เว้นพื้นที่สำหรับใส่โลโก้ภายหลัง ห้ามสร้างโลโก้ปลอม\n- ถ้ายังไม่มีวันที่ เวลา สถานที่ หรือรายละเอียดสมัคร ให้เว้นพื้นที่เติมภายหลัง ไม่ต้องใส่ข้อมูลปลอม\n\nข้อห้ามเฉพาะงานนี้:\n${bullet(a.forbidden)}\n\n${protectedBlock}\n\nข้อกำชับด้านภาษาและงานออกแบบ:\n- ภาษาไทยต้องถูกต้อง อ่านง่าย ไม่สะกดผิด\n- หัวข้อหลักต้องเด่นที่สุดและอ่านได้บนมือถือ\n- ห้ามนำคำอธิบายเทคนิค เช่น ชื่อกล้อง เลนส์ แสง หรือคำว่า Prompt ไปเขียนบนภาพ\n- ห้ามใส่ QR Code ปลอม เบอร์โทรปลอม หรือวันเวลาที่ไม่ได้ให้มา\n- องค์ประกอบต้องพร้อมใช้ประชาสัมพันธ์จริง ไม่ใช่ภาพทดลอง\n\n${delivery}`;
  };

  T.postPrompt = function(d = {}){
    return `${T.brainExecutionHeader("เขียนโพสต์ Facebook / Line พร้อมแคปชั่นทันที")}\n\nงานเฉพาะ: โพสต์ประชาสัมพันธ์\n\n${T.brainBriefBlock(d, "post")}\n\nสิ่งที่ต้องส่งออก:\n1. โพสต์ Facebook พร้อมคัดลอกไปใช้งาน 1 เวอร์ชัน\n2. แคปชั่นสั้น 1 เวอร์ชัน\n3. ข้อความ Line แบบกระชับ 1 เวอร์ชัน\n4. แฮชแท็กที่เหมาะสม เฉพาะชื่อหน่วยงาน/หัวข้อที่มีจริง\n\nแนวทางเขียน:\n- เปิดด้วยประโยคหลักที่คนเข้าใจทันที\n- เรียงลำดับ ใคร / ทำอะไร / เพื่ออะไร / วันเวลา / สถานที่ เฉพาะที่มีจริง\n- หากข้อมูลไม่ครบ ให้ใช้คำว่า “จากข้อมูลเบื้องต้น”\n- ห้ามสร้างผลลัพธ์หรือจำนวนผู้เข้าร่วมที่ไม่ได้ให้มา\n- ภาษาไทยต้องสุภาพ อ่านง่าย เหมาะกับหน่วยงานและประชาชนทั่วไป`;
  };

  T.videoPrompt = function(d = {}, extra = {}){
    const length = extra.length || d.length || "60 วินาที";
    return `${T.brainExecutionHeader("สร้างโครงคลิป / Storyboard / Voice Over / ข้อความบนจอทันที")}\n\nงานเฉพาะ: วิดีโอประชาสัมพันธ์\n\n${T.brainBriefBlock(d, "video")}\n\nรูปแบบวิดีโอ:\n- ความยาว: ${length}\n- ช่องทาง: ${clean(d.channel || d.format, "Facebook / Line / TikTok ตามการใช้งาน")}\n- โทนภาษา: ${clean(d.tone, "สุภาพ อ่านง่าย")}
\nสิ่งที่ต้องส่งออก:\n1. Hook เปิดคลิป 3 แบบ\n2. Storyboard แบ่ง Scene ตามความยาว\n3. Voice Over ครบทั้งคลิป\n4. ข้อความบนจอแต่ละ Scene\n5. แนวภาพ / มุมกล้อง / จังหวะตัดต่อ\n6. คำเตือนสิ่งที่ห้ามแต่งเพิ่ม\n\nข้อกำชับ:\n- ถ้ามีภาพบุคคลจริง ต้องคงอัตลักษณ์เดิม ห้ามเปลี่ยนหน้า\n- ห้ามใส่วัน เวลา สถานที่ หรือผลลัพธ์ที่ไม่มีในข้อมูล\n- ถ้าข้อมูลยังไม่ครบ ให้ทำ Storyboard แบบเว้นช่องเติมรายละเอียดภายหลัง`;
  };

  T.voicePrompt = function(d = {}, extra = {}){
    const length = extra.length || d.length || "60 วินาที";
    const style = extra.style || d.tone || "สุภาพ ชัดเจน";
    return `${T.brainExecutionHeader("เขียนสคริปต์เสียงพากย์ภาษาไทยพร้อมอ่านทันที")}\n\nงานเฉพาะ: สคริปต์เสียงพากย์\n\n${T.brainBriefBlock(d, "voice")}\n\nรูปแบบเสียง:\n- ความยาว: ${length}\n- สไตล์เสียง: ${style}\n\nสิ่งที่ต้องส่งออก:\n1. สคริปต์เสียงฉบับพร้อมอ่าน\n2. เวอร์ชันเปิดคลิปสั้น 1 แบบ\n3. จุดเว้นวรรค / จังหวะหายใจ\n4. คำที่ควรเน้นเสียง\n\nข้อกำชับ:\n- อ่านแล้วต้องลื่น ไม่แข็งเหมือนอ่านระเบียบราชการทั้งเล่ม\n- ห้ามแต่งข้อมูลจริงเพิ่ม\n- หากข้อมูลไม่ครบ ให้ใช้ “จากข้อมูลเบื้องต้น” และเลี่ยงการระบุรายละเอียดปลอม`;
  };

  T.deckPrompt = function(d = {}, extra = {}){
    const count = extra.count || 8;
    return `${T.brainExecutionHeader("จัดโครงสไลด์พร้อม Speaker Notes ทันที")}\n\nงานเฉพาะ: สไลด์นำเสนอ\n\n${T.brainBriefBlock(d, "deck")}\n\nรูปแบบสไลด์:\n- จำนวนสไลด์: ${count}\n- รูปแบบ: ${clean(d.format || d.channel, "นำเสนอโครงการ / รายงานผล")}\n\nสิ่งที่ต้องส่งออก:\n1. Outline ครบตามจำนวนสไลด์\n2. หัวข้อแต่ละสไลด์\n3. Bullet สำคัญต่อสไลด์\n4. Speaker Notes ภาษาไทย\n5. คำแนะนำภาพประกอบต่อสไลด์ โดยไม่สร้างโลโก้/QR ปลอม\n\nข้อกำชับ:\n- แยกข้อมูลจริงกับข้อเสนอแนะให้ชัด\n- ห้ามแต่งวันที่ สถานที่ งบประมาณ ตัวเลข หรือผลลัพธ์ที่ไม่ได้ระบุ\n\n${T.outputDeliveryGuard ? T.outputDeliveryGuard("สไลด์") : ""}`;
  };

  const oldMCPrompt = T.mcPrompt;
  T.mcPrompt = function(d = {}){
    const original = oldMCPrompt ? oldMCPrompt(d) : "";
    return `${T.brainExecutionHeader("เขียนสคริปต์พิธีกร / คำกล่าว / คำเชื่อมช่วง พร้อมใช้บนเวทีทันที")}\n\nงานเฉพาะ: งานพิธีกร\n\n${T.brainBriefBlock(d, "mc")}\n\nสิ่งที่ต้องส่งออก:\n1. สคริปต์พิธีกรฉบับเต็ม\n2. เวอร์ชันสั้นสำหรับถืออ่าน\n3. คำเชิญประธาน / คำเชื่อมช่วง\n4. ช่องเว้นชื่อประธานและตำแหน่ง หากยังไม่ระบุ\n\nข้อกำชับ:\n- ภาษาสุภาพ อ่านออกเสียงง่าย\n- ห้ามแต่งชื่อประธาน แขกผู้มีเกียรติ หรือลำดับพิธีที่ไม่ได้ให้มา\n\n${original ? `โครงเดิมที่ใช้ตรวจอ้างอิง:\n${original}` : ""}`;
  };

  T.promptPack = function(d = {}){
    return `Universal Execution Prompt Pack — Prompt Brain Engine v9.1.4\n\n${T.promptBrainReport(d, "kit")}\n\n========== 1) PROMPT ภาพ ==========${"\n"}${T.imagePrompt(d)}\n\n========== 2) PROMPT โพสต์ ==========${"\n"}${T.postPrompt(d)}\n\n========== 3) PROMPT วิดีโอ ==========${"\n"}${T.videoPrompt(d, {length: d.length || "60 วินาที"})}\n\n========== 4) PROMPT เสียงพากย์ ==========${"\n"}${T.voicePrompt(d, {length: d.length || "60 วินาที", style: d.tone || "ทางการ สุภาพ"})}\n\n========== 5) PROMPT สไลด์ ==========${"\n"}${T.deckPrompt(d, {count: 8})}`;
  };

  T.discussPrompt = function(type, d = {}){
    return `[โหมดผู้ช่วยคิดและตรวจทานคำสั่ง]\nหน้าที่ของคุณคือช่วยตรวจบรีฟและยกระดับ Prompt ให้คมขึ้น ก่อนสั่ง AI ทำงานจริง\n\n${T.promptBrainReport(d, type)}\n\nสิ่งที่ต้องช่วยตอบ:\n1. จุดเด่นของบรีฟนี้\n2. จุดที่ยังขาดและควรถามผู้ใช้เพิ่ม\n3. ความเสี่ยงเรื่องข้อมูลจริง/ชื่อเฉพาะ/ภาษาไทย\n4. Prompt ฉบับปรับปรุงที่พร้อมคัดลอกไปใช้งาน\n\nข้อห้าม:\n- ยังไม่ต้องสร้างผลงานสุดท้าย\n- ห้ามแต่งข้อมูลจริงเพิ่ม\n- ถ้าข้อมูลไม่ครบ ให้เสนอช่องเว้นเติมภายหลัง`;
  };

  T.routerSuggest = function(query = ""){
    const q = String(query || "").toLowerCase();
    const has = re => re.test(q);
    let view = "image";
    let reason = "โจทย์นี้ต้องเริ่มจากการจัดสารหลัก ภาพรวม และข้อความสำคัญให้ชัดก่อน";
    if(has(/ชุดสื่อ|ครบชุด|หลายสื่อ|ทำทั้งหมด|ภาพ.*โพสต์.*คลิป/)){ view = "kit"; reason = "ต้องการหลายผลลัพธ์จากข้อมูลเดียว จึงควรใช้เมนูสร้างชุดสื่อ"; }
    else if(has(/โพสต์|แคปชั่น|caption|facebook|line|เรียบเรียง|ข่าวประชาสัมพันธ์/)){ view = "post"; reason = "โจทย์เน้นข้อความเผยแพร่ จึงควรใช้เมนูเรียบเรียงเนื้อหา"; }
    else if(has(/พิธีกร|ประธาน|กล่าวรายงาน|คำกล่าว|เวที/)){ view = "mc"; reason = "โจทย์เป็นงานเวที ต้องควบคุมภาษาและลำดับพิธี"; }
    else if(has(/วิดีโอ|วีดีโอ|คลิป|storyboard|reels|tiktok|ซีน|scene/)){ view = "video"; reason = "โจทย์ต้องแบ่งซีน ภาพ เสียง และข้อความบนจอ"; }
    else if(has(/เสียง|พากย์|voice|อ่าน|สคริปต์เสียง/)){ view = "voice"; reason = "โจทย์ต้องใช้ภาษาที่อ่านออกเสียงได้ลื่น"; }
    else if(has(/สไลด์|powerpoint|ppt|นำเสนอ|deck/)){ view = "deck"; reason = "โจทย์ต้องจัดโครงสไลด์และ Speaker Notes"; }
    else if(has(/อัลบั้ม|หลายภาพ|facebook album|zip|กรอบภาพ/)){ view = "album"; reason = "โจทย์เน้นชุดภาพหลายใบพร้อมกรอบและแคปชั่น"; }
    else if(has(/ภาพ|โปสเตอร์|อินโฟกราฟิก|infographic|ป้าย|ประชาสัมพันธ์|เดินวิ่ง|วิ่ง/)){ view = "image"; reason = "โจทย์เหมาะกับภาพประชาสัมพันธ์ ต้องจัดข้อความและ Visual Direction ให้ชัด"; }
    const labels = {image:"สร้างภาพ", kit:"สร้างชุดสื่อ", post:"เรียบเรียงเนื้อหา", mc:"งานพิธีกร", video:"ทำวิดีโอ", voice:"เสียงพากย์", deck:"ทำสไลด์", album:"ชุดภาพโพสต์ Facebook"};
    const pseudoData = {title: query, detail: query, orgType:"", orgName:""};
    const report = T.promptBrainReport(pseudoData, view);
    const text = `เมนูที่แนะนำ: ${labels[view] || "สร้างภาพ"}\n\nเหตุผล:\n${reason}\n\nBrain อ่านโจทย์ได้ว่า:\n${report}\n\nขั้นตอนต่อไป:\n1. กด “ไปที่เมนูที่แนะนำ”\n2. กรอกข้อมูลจริงเท่าที่มี\n3. กดสร้าง Prompt\n4. ตรวจชื่อคน หน่วยงาน วันที่ สถานที่ก่อนเผยแพร่\n\nหมายเหตุ: ระบบจะไม่แต่งข้อมูลจริงเพิ่มเอง ถ้าข้อมูลไม่ครบจะใช้คำว่า “จากข้อมูลเบื้องต้น”`;
    return {view, text};
  };

})();

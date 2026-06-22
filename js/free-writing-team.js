/* Tanjai AI Studio V9.4
 * Direct, zero-API writing outputs. Shared Content Brain + specialist writers + Fact Guard.
 */
(function(root){
  "use strict";
  const T = root.TANJAI = root.TANJAI || {};

  const DEFAULTS = /^(หัวข้องาน|ชื่องาน \/ พิธีการ|ยังไม่ได้ระบุ|ยังไม่ได้ระบุรายละเอียดเพิ่มเติม|ไม่ระบุ|กลุ่มเป้าหมายหลัก)$/;
  const clean = value => String(value || "").replace(/\r/g, "").trim();
  const real = value => {
    const text = clean(value);
    return text && !DEFAULTS.test(text) ? text : "";
  };
  const titleOf = d => real(d.title) || "[เติมหัวข้องาน]";
  const detailOf = d => real(d.detail) || "จากข้อมูลเบื้องต้น ยังไม่มีรายละเอียดเนื้อหา กรุณาเติมข้อมูลจริงก่อนเผยแพร่";
  const orgOf = d => real(d.orgName);
  const splitPoints = value => clean(value).split(/\n+|(?<=[.!?。])\s+|\s*[•▪●]\s*/).map(clean).filter(Boolean);
  const hash = value => clean(value).replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, "");
  const line = (label, value) => real(value) ? `${label}${real(value)}` : "";
  const joinNonEmpty = (items, separator="\n") => items.filter(Boolean).join(separator);
  const placeholder = label => `[เติม${label}ตามข้อมูลจริง]`;

  function contentBrain(d={}){
    return {
      title: titleOf(d),
      org: orgOf(d),
      detail: detailOf(d),
      points: splitPoints(real(d.detail)),
      date: real(d.dateTime),
      place: real(d.place),
      people: real(d.people),
      audience: real(d.audience),
      tone: real(d.tone) || "สุภาพ อ่านง่าย",
      action: real(d.expertAction) || real(d.expertCTA),
      keyMessage: real(d.expertKeyMessage) || real(d.expertCoreMessage),
      extra: real(d.extra),
      agenda: splitPoints(real(d.expertAgenda)),
      attachmentCount: Number(d.attachmentCount || 0)
    };
  }

  function factGuard(d={}){
    const b = contentBrain(d);
    const confirmed = [
      real(d.title) && `หัวข้อ: ${real(d.title)}`,
      b.org && `หน่วยงาน: ${b.org}`,
      real(d.detail) && "รายละเอียด: มีข้อมูลที่ผู้ใช้กรอก",
      b.date && `วัน/เวลา: ${b.date}`,
      b.place && `สถานที่: ${b.place}`,
      b.people && `บุคคล/ตำแหน่ง: ${b.people}`
    ].filter(Boolean);
    const missing = [
      !real(d.title) && "หัวข้องาน",
      !real(d.detail) && "รายละเอียดเนื้อหา",
      !b.org && "ชื่อหน่วยงาน/เจ้าของงาน",
      !b.date && "วัน/เวลา (หากเกี่ยวข้อง)",
      !b.place && "สถานที่ (หากเกี่ยวข้อง)"
    ].filter(Boolean);
    return `FACT GUARD — ตรวจข้อมูลก่อนเผยแพร่\n\nข้อมูลที่ระบบนำมาใช้\n${confirmed.length ? confirmed.map(x=>`✓ ${x}`).join("\n") : "- ยังไม่มีข้อมูลจริงเพียงพอ"}\n\nข้อมูลที่ยังควรตรวจหรือเติม\n${missing.map(x=>`• ${x}`).join("\n") || "✓ ไม่พบช่องข้อมูลหลักที่ขาด"}${b.attachmentCount ? `\n\nหมายเหตุไฟล์แนบ: พบ ${b.attachmentCount} ไฟล์ ระบบฟรีไม่อ่านข้อความในภาพอัตโนมัติ จึงไม่เดาข้อมูลจากไฟล์ กรุณากรอกสาระสำคัญในช่องรายละเอียด` : ""}\n\nกฎที่ใช้: ไม่สร้างชื่อบุคคล หน่วยงาน สถานที่ วันที่ ตัวเลข หรือข้อเท็จจริงใหม่เอง`;
  }

  function captionWriter(d={}){
    const b = contentBrain(d);
    const channel = real(d.channel) || "โพสต์ Facebook";
    const length = real(d.length) || "มาตรฐาน อ่านง่าย";
    const lead = b.keyMessage || b.title;
    const body = b.points.length ? b.points.join("\n\n") : b.detail;
    const cta = b.action || (b.org ? `ติดตามข้อมูลเพิ่มเติมจาก ${b.org}` : "ติดตามรายละเอียดเพิ่มเติมจากช่องทางที่เผยแพร่");
    const tags = [hash(b.org), hash(b.title), channel.includes("Line") ? "ประชาสัมพันธ์" : "ข่าวประชาสัมพันธ์"].filter(Boolean).slice(0,4).map(x=>`#${x}`).join(" ");
    if(channel === "แคปชั่น"){
      return `แคปชั่นพร้อมใช้\n\n📌 ${lead}\n\n${body}\n\n${joinNonEmpty([line("📅 ", b.date), line("📍 ", b.place)])}\n\n${cta}${tags ? `\n\n${tags}` : ""}`.replace(/\n{3,}/g,"\n\n");
    }
    if(channel === "ข้อความ Line"){
      return `ข้อความ LINE พร้อมส่ง\n\n${lead}\n\n${body}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place)])}\n\n${cta}`.replace(/\n{3,}/g,"\n\n");
    }
    if(channel === "บทความ" || channel === "ข่าวประชาสัมพันธ์") return articleWriter(d);
    if(channel === "สรุปงาน" || channel === "เรียบเรียงข้อมูล"){
      const points = b.points.length ? b.points : [b.detail];
      return `เนื้อหาเรียบเรียงพร้อมใช้\n\nเรื่อง ${b.title}\n\n${b.org ? `${b.org} ` : ""}${points.join("\n\n")}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place), line("ผู้เกี่ยวข้อง: ", b.people)])}\n\nประเด็นสำคัญ\n${points.map((x,i)=>`${i+1}. ${x}`).join("\n")}`.replace(/\n{3,}/g,"\n\n");
    }
    const extended = /ยาว|ละเอียด/.test(length) && b.extra ? `\n\n${b.extra}` : "";
    return `โพสต์ Facebook พร้อมใช้\n\n📣 ${lead}\n\n${body}${extended}\n\n${joinNonEmpty([line("📅 ", b.date), line("📍 ", b.place)])}\n\n${cta}${tags ? `\n\n${tags}` : ""}`.replace(/\n{3,}/g,"\n\n");
  }

  function articleWriter(d={}){
    const b = contentBrain(d);
    const points = b.points.length ? b.points : [b.detail];
    const opening = `${b.org ? `${b.org} ` : ""}${points[0]}`;
    const body = points.slice(1).map(x=>`     ${x}`).join("\n\n");
    return `บทความ / ข่าวประชาสัมพันธ์พร้อมใช้\n\n${b.title}\n\n     ${opening}${body ? `\n\n${body}` : ""}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place), line("ผู้เกี่ยวข้อง: ", b.people)])}\n\n${b.action || (b.org ? `สอบถามหรือติดตามข้อมูลเพิ่มเติมได้จาก ${b.org}` : "โปรดตรวจสอบช่องทางติดต่อจริงก่อนเผยแพร่")}`.replace(/\n{3,}/g,"\n\n");
  }

  function mcWriter(d={}){
    const b = contentBrain(d);
    const address = real(d.expertAddress) || "ท่านประธาน แขกผู้มีเกียรติ และผู้เข้าร่วมงานทุกท่าน";
    const president = b.people || placeholder("ชื่อและตำแหน่งประธาน");
    const agenda = b.agenda.length ? b.agenda : ["กล่าวต้อนรับ", "ดำเนินกิจกรรมตามกำหนดการจริง", "กล่าวขอบคุณและปิดงาน"];
    return `สคริปต์พิธีกรพร้อมใช้\n\n[ตรวจไมโครโฟนและลำดับพิธีก่อนเริ่ม]\n\nเรียน ${address}\n\nขณะนี้ได้เวลาอันสมควรแล้ว ขอต้อนรับทุกท่านเข้าสู่ “${b.title}”${b.date ? ` ซึ่งจัดขึ้นในวันที่ ${b.date}` : ""}${b.place ? ` ณ ${b.place}` : ""}\n\n${b.org ? `จัดโดย ${b.org}` : "จากข้อมูลเบื้องต้น กรุณาเติมชื่อหน่วยงานผู้จัดก่อนใช้งานจริง"}\n\nลำดับพิธี\n${agenda.map((item,i)=>`${i+1}. ${item}\n   คำเชื่อม: ลำดับต่อไป ขอเรียนเชิญผู้เกี่ยวข้องดำเนินการในช่วง “${item}”`).join("\n\n")}\n\nคำเชิญประธาน\nลำดับต่อไป ขอเรียนเชิญ ${president} กรุณากล่าวต่อผู้เข้าร่วมงาน ขอเรียนเชิญครับ/ค่ะ\n\nคำกล่าวปิด\nบัดนี้ การดำเนินงาน “${b.title}” ได้เสร็จสิ้นตามลำดับที่กำหนด ในนามผู้จัดงาน ขอขอบพระคุณทุกท่านที่ให้เกียรติเข้าร่วม และขอให้ทุกท่านเดินทางกลับโดยสวัสดิภาพ ขอบคุณครับ/ค่ะ\n\nบัตรเตือนพิธีกร\n• ตรวจชื่อและตำแหน่ง: ${president}\n• คำอ่านชื่อเฉพาะ: ${real(d.expertPronunciation) || placeholder("คำอ่านชื่อเฉพาะ")}\n• ห้ามสลับลำดับพิธีโดยไม่ได้รับการยืนยันจากผู้จัด`;
  }

  function videoWriter(d={}, length="60 วินาที"){
    const b = contentBrain(d);
    const seconds = /15/.test(length) ? 15 : /30/.test(length) ? 30 : /90/.test(length) ? 90 : /3\s*นาที/.test(length) ? 180 : 60;
    const count = seconds <= 15 ? 3 : seconds <= 30 ? 4 : seconds <= 60 ? 6 : 8;
    const per = Math.max(3, Math.round(seconds/count));
    const points = b.points.length ? b.points : [b.detail];
    const scenes = Array.from({length:count}, (_,idx)=>{
      const first = idx===0, last=idx===count-1;
      const message = first ? (b.keyMessage || b.title) : last ? (b.action || "ติดตามข้อมูลเพิ่มเติมจากช่องทางประชาสัมพันธ์") : points[(idx-1)%points.length];
      const visual = first ? `ภาพเปิดที่สื่อถึง “${b.title}”` : last ? "ภาพปิดพร้อมช่องทางจริงของหน่วยงาน" : `เลือกภาพจริงที่ตรงกับสาร: ${message}`;
      return `SCENE ${idx+1} — ประมาณ ${per} วินาที\nภาพ: ${visual}\nข้อความบนจอ: ${message}\nบทพากย์: ${message}`;
    }).join("\n\n");
    return `บทวิดีโอพร้อมผลิต — ${length}\n\nHOOK\n${b.keyMessage || b.title}\n\n${scenes}\n\nบทพากย์ต่อเนื่อง\n${[b.keyMessage || b.title, ...points, b.date && `กำหนดการ ${b.date}`, b.place && `สถานที่ ${b.place}`, b.action || "ติดตามรายละเอียดเพิ่มเติมจากช่องทางที่เผยแพร่"].filter(Boolean).join(" ")}\n\nหมายเหตุกองตัดต่อ\n• ใช้เฉพาะภาพจริงที่ตรงกับข้อความแต่ละช่วง\n• ตรวจชื่อ วันที่ สถานที่ และตัวเลขกับ Fact Guard ก่อนขึ้นข้อความบนจอ\n• ไม่สร้างโลโก้ บุคคล หรือข้อมูลจริงเพิ่ม`;
  }

  function voiceWriter(d={}, length="60 วินาที", style="ทางการ สุภาพ"){
    const b = contentBrain(d);
    return `สคริปต์เสียงพร้อมอ่าน\n\n[โทน ${style} | ความยาวเป้าหมาย ${length}]\n\n[เปิด — ชัดเจน]\n${b.keyMessage || b.title}\n\n[ดำเนินเรื่อง — เป็นธรรมชาติ]\n${b.detail}\n\n${joinNonEmpty([b.date && `[เว้นจังหวะ] กำหนดการ ${b.date}`, b.place && `สถานที่ ${b.place}`, b.people && `ผู้เกี่ยวข้อง ${b.people}`])}\n\n[ปิด — เน้นคำสำคัญ]\n${b.action || (b.org ? `ติดตามข้อมูลเพิ่มเติมจาก ${b.org}` : "ติดตามรายละเอียดเพิ่มเติมจากช่องทางที่เผยแพร่")}\n\nคำกำกับการอ่าน\n• เน้น: ${b.keyMessage || b.title}\n• คำอ่านชื่อเฉพาะ: ${real(d.expertPronunciation) || placeholder("คำอ่านชื่อเฉพาะ")}\n• เว้นจังหวะก่อนวัน เวลา สถานที่ และข้อความปิด`;
  }

  function slideWriter(d={}, count=8){
    const b = contentBrain(d);
    const points = b.points.length ? b.points : [b.detail];
    const slides = [
      [b.title, b.org || placeholder("ชื่อหน่วยงาน"), "เกริ่นหัวข้อและวัตถุประสงค์ของการนำเสนอ"],
      ["ที่มาและบริบท", points[0], "อธิบายเฉพาะข้อมูลที่ได้รับ"],
      ["ประเด็นสำคัญ", points.slice(0,4).map(x=>`• ${x}`).join("\n"), "ขยายทีละประเด็นโดยไม่เติมข้อเท็จจริง"],
      ["กลุ่มเป้าหมาย", b.audience || placeholder("กลุ่มเป้าหมาย"), "อธิบายว่าข้อมูลนี้เกี่ยวข้องกับใคร"],
      ["รายละเอียดการดำเนินงาน", points.join("\n"), "เรียงลำดับตามข้อมูลจริง"],
      ["วัน เวลา และสถานที่", joinNonEmpty([b.date || placeholder("วันและเวลา"), b.place || placeholder("สถานที่")], "\n"), "ตรวจข้อมูลอีกครั้งก่อนนำเสนอ"],
      ["สิ่งที่ต้องดำเนินการต่อ", b.action || placeholder("ขั้นตอนหรือคำเชิญชวน"), "สรุปสิ่งที่ต้องการให้ผู้ฟังทำ"],
      ["สรุป", b.keyMessage || b.title, "ย้ำสารสำคัญเพียงประโยคเดียว"]
    ];
    while(slides.length < count) slides.splice(slides.length-1,0,[`ข้อมูลประกอบ ${slides.length-6}`, placeholder("ข้อมูลประกอบ"), "ใช้เฉพาะหลักฐานหรือข้อมูลจริง"]);
    return `โครงสไลด์พร้อมเนื้อหาและ Speaker Notes\n\n${slides.slice(0,count).map((s,i)=>`SLIDE ${i+1} — ${s[0]}\nเนื้อหาบนสไลด์:\n${s[1]}\n\nSpeaker Notes:\n${s[2]}`).join("\n\n---\n\n")}`;
  }

  T.freeWritingTeam = {contentBrain, factGuard, captionWriter, articleWriter, mcWriter, videoWriter, voiceWriter, slideWriter};
  if(typeof module !== "undefined" && module.exports) module.exports = T.freeWritingTeam;
})(typeof globalThis !== "undefined" ? globalThis : window);

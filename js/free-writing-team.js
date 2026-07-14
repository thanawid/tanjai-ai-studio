/* Tanjai AI Studio V9.9.0
 * Specialist Output Engine — zero-API, rule-based specialist writers.
 * Goal: transform raw brief into usable outputs, not merely restate user text.
 */
(function(root){
  "use strict";
  const T = root.TANJAI = root.TANJAI || {};

  const DEFAULTS = /^(หัวข้องาน|ชื่องาน \/ พิธีการ|ยังไม่ได้ระบุ|ยังไม่ได้ระบุรายละเอียดเพิ่มเติม|ไม่ระบุ|กลุ่มเป้าหมายหลัก|ให้ AI วิเคราะห์เอง|ให้ AI เลือก.*|กำหนดเอง)$/i;
  const clean = value => String(value || "").replace(/\r/g, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  const real = value => {
    const text = clean(value);
    return text && !DEFAULTS.test(text) ? text : "";
  };
  const safe = (value, fallback) => real(value) || fallback;
  const titleOf = d => safe(d.title, "[เติมหัวข้องาน]");
  const detailOf = d => safe(d.detail, "[เติมรายละเอียดจริงของงาน]");
  const orgOf = d => real(d.orgName);
  const hash = value => clean(value).replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, "");
  const line = (label, value) => real(value) ? `${label}${real(value)}` : "";
  const joinNonEmpty = (items, sep="\n") => items.filter(Boolean).join(sep);
  const placeholder = label => `[เติม${label}ตามข้อมูลจริง]`;
  const clamp = (text, max=220) => clean(text).length > max ? clean(text).slice(0, max).replace(/\s+\S*$/, "") + "…" : clean(text);

  function splitPoints(value){
    const text = clean(value);
    if(!text) return [];
    return text
      .split(/\n+|[•▪●]|(?:\s+-\s+)|(?:\s*[0-9]+[.)]\s*)/g)
      .map(x => clean(x.replace(/^[-–—]+\s*/, "")))
      .filter(Boolean)
      .slice(0, 8);
  }

  function contentBrain(d={}){
    const detail = detailOf(d);
    const points = splitPoints(real(d.detail));
    const title = titleOf(d);
    return {
      title,
      org: orgOf(d),
      detail,
      points: points.length ? points : (real(d.detail) ? [clamp(detail, 260)] : []),
      date: real(d.dateTime),
      place: real(d.place),
      people: real(d.people),
      audience: real(d.audience),
      tone: real(d.tone) || "สุภาพ อ่านง่าย",
      channel: real(d.channel),
      contentType: real(d.contentType) || real(d.mainCategory) || real(d.workType),
      visualPreset: real(d.visualPreset) || real(d.style),
      action: real(d.expertAction) || real(d.expertCTA) || real(d.brainGoal),
      keyMessage: real(d.expertKeyMessage) || real(d.expertCoreMessage) || real(d.brainFocus),
      extra: real(d.extra),
      agenda: splitPoints(real(d.expertAgenda)),
      delivery: real(d.expertDelivery),
      pronunciation: real(d.expertPronunciation),
      address: real(d.expertAddress),
      attachmentCount: Number(d.attachmentCount || 0)
    };
  }

  function detectIntent(d={}, tool="post"){
    const b = contentBrain(d);
    const text = `${b.title} ${b.detail} ${b.contentType} ${d.mainCategory || ""} ${d.subCategory || ""} ${d.workContext || ""}`;
    if(/ไว้อาลัย|อาลัย|เสียชีวิต|รำลึก|ถวายความอาลัย/.test(text)) return "respectful";
    if(/ประเพณี|แห่เทียน|เทียนพรรษา|เข้าพรรษา|ออกพรรษา|กฐิน|ผ้าป่า|สงกรานต์|ลอยกระทง|บุญบั้งไฟ|ทำบุญ|ตักบาตร|เวียนเทียน|วิสาขบูชา|มาฆบูชา|อาสาฬหบูชา|สวดมนต์|ปฏิบัติธรรม|ไหว้พระ|ทอดถวาย|บรรพชา|อุปสมบท|สรงน้ำ|รดน้ำดำหัว/.test(text)) return "tradition";
    if(/เพลง|ศิลปิน|ซิงเกิล|อัลบั้ม|MV|มิวสิก|Cover Art/i.test(text)) return "music";
    if(/สินค้า|บริการ|โปรโมชัน|โปรโมชั่น|ร้าน|อาหาร|OTOP|ขาย/.test(text)) return "commercial";
    if(/ประชุม|ประชาคม|ประชุมสภา|สัมมนา|อบรม|โครงการ|กิจกรรม|เชิญ|ขอเชิญ|เปิดรับ|รับสมัคร/.test(text)) return "invitation";
    if(/แจ้ง|ประกาศ|งด|ปิด|หยุด|เตือน|ระวัง|ไฟดับ|ปิดถนน|มิจฉาชีพ/.test(text)) return "announcement";
    if(/ลงพื้นที่|รายงานผล|สรุปผล|สรุปกิจกรรม|ติดตาม|ตรวจงาน|มอบ|ช่วยเหลือ/.test(text)) return "report";
    if(/ขั้นตอน|วิธี|ข้อมูลควรรู้|FAQ|อินโฟกราฟิก|infographic/i.test(text)) return "education";
    if(/พิธี|ประธาน|กล่าวรายงาน|เปิดงาน|ปิดงาน|ต้อนรับ/.test(text)) return "ceremony";
    if(/โลโก้|แบรนด์|มาสคอต|คาแรกเตอร์|คำคม|คอนเซ็ปต์|ศิลป์/.test(text)) return "concept";
    return "general";
  }

  function benefitLine(b, intent){
    if(intent === "invitation" && /ประชาคม|แผนพัฒนา|ท้องถิ่น/.test(`${b.title} ${b.detail}`)){
      return "เปิดโอกาสให้ประชาชนร่วมเสนอความคิดเห็น เพื่อนำข้อมูลจากพื้นที่ไปประกอบการวางแผนพัฒนาท้องถิ่นอย่างเป็นระบบ";
    }
    if(intent === "tradition") return "ร่วมสืบสานประเพณีอันดีงามของท้องถิ่น เสริมสร้างความเป็นสิริมงคล และส่งต่อวัฒนธรรมสู่รุ่นลูกหลาน";
    if(intent === "invitation") return "เปิดโอกาสให้กลุ่มเป้าหมายเข้ามามีส่วนร่วม รับรู้ข้อมูล และร่วมขับเคลื่อนกิจกรรมให้เกิดประโยชน์จริง";
    if(intent === "announcement") return "ช่วยให้ผู้เกี่ยวข้องรับทราบข้อมูลสำคัญได้รวดเร็ว ลดความสับสน และเตรียมตัวได้ถูกต้อง";
    if(intent === "report") return "สะท้อนการดำเนินงานและความต่อเนื่องในการดูแล แก้ไข หรือพัฒนางานให้เห็นเป็นรูปธรรม";
    if(intent === "education") return "ทำให้ข้อมูลเข้าใจง่ายขึ้น เห็นขั้นตอนชัด และนำไปปฏิบัติได้จริง";
    if(intent === "music") return "ส่งอารมณ์ของผลงานให้คนจำชื่อเพลงหรือศิลปินได้ตั้งแต่แรกเห็น";
    if(intent === "commercial") return "สื่อสารคุณค่า จุดเด่น และเหตุผลที่ผู้ชมควรสนใจสินค้า หรือบริการนี้";
    return "สื่อสารสาระสำคัญให้ชัดเจน เข้าใจง่าย และพร้อมนำไปใช้ต่อได้ทันที";
  }

  function extractHighlights(b){
    const source = `${b.title} ${b.detail}`;
    const items = [];
    if(/แห่เทียน|เทียนพรรษา/.test(source)) items.push("กิจกรรมสำคัญคือการร่วมขบวนแห่เทียนพรรษา และถวายเทียนพรรษาแด่พระภิกษุสงฆ์ เพื่อความเป็นสิริมงคลแก่ตนเองและครอบครัว");
    if(/สวดมนต์|ปฏิบัติธรรม/.test(source)) items.push("ผู้ร่วมงานจะได้ร่วมสวดมนต์และปฏิบัติธรรม เพื่อความสงบของจิตใจและเสริมสิริมงคลในชีวิต");
    if(/เข้าพรรษา|อาสาฬหบูชา/.test(source)) items.push("งานนี้จัดขึ้นเนื่องในวันสำคัญทางพระพุทธศาสนา ซึ่งพุทธศาสนิกชนถือปฏิบัติสืบต่อกันมาแต่โบราณ");
    if(/แผนพัฒนาท้องถิ่น/.test(source)) items.push("การประชุมครั้งนี้มีเป้าหมายเพื่อรวบรวมความคิดเห็นและข้อเสนอจากพื้นที่ สำหรับใช้ประกอบการจัดทำแผนพัฒนาท้องถิ่น");
    const years = source.match(/พ\.ศ\.?\s*([0-9๐-๙]{4}).{0,12}?พ\.ศ\.?\s*([0-9๐-๙]{4})/);
    if(years) items.push(`กรอบแผนที่เกี่ยวข้องครอบคลุมช่วงปี พ.ศ. ${years[1]} ถึง พ.ศ. ${years[2]}`);
    if(/นายก|ผู้บริหาร|สมาชิกสภา|กำนัน|ผู้ใหญ่บ้าน|ผู้นำชุมชน|หัวหน้าส่วนราชการ|ประชาชน/.test(source)) items.push("การมีส่วนร่วมของผู้บริหารท้องถิ่น สมาชิกสภา ผู้นำชุมชน หัวหน้าส่วนราชการ และประชาชน เป็นส่วนสำคัญของกระบวนการนี้");
    if(/อบรม|ฝึกอบรม/.test(source)) items.push("สาระสำคัญคือการเพิ่มความรู้ ความเข้าใจ และทักษะที่นำไปใช้ได้จริง");
    if(/AED|เครื่องกระตุกไฟฟ้า|หัวใจ/.test(source)) items.push("เนื้อหาควรสื่อสารเรื่องความปลอดภัย การช่วยชีวิตเบื้องต้น และการใช้เครื่องมืออย่างถูกต้อง");
    if(/มิจฉาชีพ|หลอกลวง|เตือนภัย/.test(source)) items.push("สารหลักคือการเตือนให้ประชาชนระมัดระวัง ตรวจสอบข้อมูล และไม่หลงเชื่อผู้แอบอ้าง");
    if(/เพลง|ศิลปิน|ซิงเกิล|อัลบั้ม/.test(source)) items.push("ควรดึงอารมณ์ของผลงานและชื่อเพลงให้เด่น เพื่อให้ผู้ชมจดจำและอยากฟังต่อ");
    if(b.date) items.push(`กำหนดการที่เกี่ยวข้องคือ ${b.date}`);
    if(b.place) items.push(`สถานที่หรือพื้นที่ดำเนินงานคือ ${b.place}`);
    return [...new Set(items)].slice(0,5);
  }

  function rewriteCore(d={}, tool="post"){
    const b = contentBrain(d);
    const intent = detectIntent(d, tool);
    const org = b.org ? `${b.org}` : "หน่วยงานผู้จัด";
    const subject = b.title;
    const benefit = benefitLine(b, intent);
    const firstPoint = b.points[0] || b.detail;

    const details = [];
    if(intent === "tradition"){
      details.push(`${org} ขอเชิญพุทธศาสนิกชนและประชาชนทุกท่าน ร่วม “${subject}” เพื่อความเป็นสิริมงคลและร่วมสืบสานประเพณีอันดีงามให้คงอยู่สืบไป`);
      details.push(benefit);
    }else if(intent === "invitation"){
      details.push(`${org} ขอเชิญผู้เกี่ยวข้องเข้าร่วม “${subject}” เพื่อรับฟังข้อมูล แลกเปลี่ยนความคิดเห็น และร่วมเป็นส่วนหนึ่งของการขับเคลื่อนงานครั้งนี้`);
      details.push(benefit);
    }else if(intent === "announcement"){
      details.push(`${org} แจ้งประชาสัมพันธ์เรื่อง “${subject}” เพื่อให้ผู้เกี่ยวข้องรับทราบและปฏิบัติตามข้อมูลที่ถูกต้อง`);
      details.push(benefit);
    }else if(intent === "report"){
      details.push(`${org} ดำเนินงาน “${subject}” โดยมุ่งติดตามผล แก้ไขปัญหา และสื่อสารความคืบหน้าให้ประชาชนรับทราบ`);
      details.push(benefit);
    }else if(intent === "education"){
      details.push(`ขอแนะนำข้อมูลสำคัญเรื่อง “${subject}” โดยสรุปให้เข้าใจง่าย เห็นประเด็นหลัก และนำไปใช้ได้จริง`);
      details.push(benefit);
    }else if(intent === "music"){
      details.push(`ผลงาน “${subject}” ถูกนำเสนอด้วยอารมณ์ที่ชัดเจน เพื่อให้ผู้ฟังสัมผัสเรื่องราวและจดจำตัวตนของศิลปินได้มากขึ้น`);
      details.push(benefit);
    }else if(intent === "commercial"){
      details.push(`พบกับ “${subject}” ที่ออกแบบมาเพื่อตอบโจทย์การใช้งานจริง พร้อมสื่อสารจุดเด่นให้เข้าใจง่ายในเวลาอันสั้น`);
      details.push(benefit);
    }else{
      details.push(`ประเด็นสำคัญของ “${subject}” คือการสื่อสารข้อมูลให้เข้าใจง่าย ชัดเจน และพร้อมนำไปใช้ต่อ`);
      if(real(firstPoint)) details.push(`จากข้อมูลที่ให้มา สารหลักคือ ${clamp(firstPoint, 180)}`);
    }

    extractHighlights(b).forEach(item => details.push(item));
    if(b.people && !/นายก|ผู้บริหาร|สมาชิกสภา|กำนัน|ผู้ใหญ่บ้าน|ผู้นำชุมชน|หัวหน้าส่วนราชการ|ประชาชน/.test(`${b.title} ${b.detail}`)) details.push(`ผู้เกี่ยวข้อง: ${b.people}`);
    return [...new Set(details.filter(Boolean))];
  }

  function factGuard(d={}){
    const b = contentBrain(d);
    const intent = detectIntent(d);
    const confirmed = [
      real(d.title) && `หัวข้อ: ${real(d.title)}`,
      b.org && `หน่วยงาน/แบรนด์: ${b.org}`,
      real(d.detail) && "รายละเอียด: มีข้อมูลจริงที่ผู้ใช้กรอก",
      b.date && `วัน/เวลา: ${b.date}`,
      b.place && `สถานที่: ${b.place}`,
      b.people && `บุคคล/ตำแหน่ง: ${b.people}`,
      b.visualPreset && `แนวภาพ/สไตล์: ${b.visualPreset}`
    ].filter(Boolean);
    const eventLike = ["invitation","announcement","report","ceremony","education","tradition"].includes(intent);
    const missing = [
      !real(d.title) && "หัวข้องาน / ข้อความหลัก",
      !real(d.detail) && "รายละเอียดเนื้อหา",
      !b.org && "ชื่อหน่วยงาน/เจ้าของงาน ถ้าต้องการให้แสดง",
      eventLike && !b.date && "วัน/เวลา หากงานนี้ต้องแสดงกำหนดการ",
      eventLike && !b.place && "สถานที่ หากงานนี้มีสถานที่จริง"
    ].filter(Boolean);
    return `FACT GUARD — ตรวจข้อมูลก่อนเผยแพร่\n\nข้อมูลที่ระบบนำมาใช้\n${confirmed.length ? confirmed.map(x=>`✓ ${x}`).join("\n") : "- ยังไม่มีข้อมูลจริงเพียงพอ"}\n\nข้อมูลที่ยังควรตรวจหรือเติม\n${missing.map(x=>`• ${x}`).join("\n") || "✓ ไม่พบช่องข้อมูลหลักที่ต้องบังคับเพิ่ม"}${b.attachmentCount ? `\n\nหมายเหตุไฟล์แนบ: พบ ${b.attachmentCount} ไฟล์ ระบบฟรีไม่อ่านข้อความในภาพอัตโนมัติ จึงไม่เดาข้อมูลจากไฟล์ กรุณากรอกสาระสำคัญในช่องรายละเอียด` : ""}\n\nกฎที่ใช้: ไม่สร้างชื่อบุคคล หน่วยงาน สถานที่ วันที่ ตัวเลข เบอร์โทร QR Code หรือข้อเท็จจริงใหม่เอง`;
  }

  function captionWriter(d={}){
    const b = contentBrain(d);
    const intent = detectIntent(d, "post");
    const channel = real(d.channel) || "โพสต์ Facebook";
    const lines = rewriteCore(d, "post");
    const hookMap = {
      tradition:"ขอเชิญร่วมสืบสานประเพณีอันดีงาม",
      invitation:"ขอเชิญร่วมเป็นส่วนหนึ่งของการพัฒนา",
      announcement:"แจ้งข้อมูลสำคัญ โปรดตรวจสอบรายละเอียด",
      report:"สรุปความคืบหน้าและการดำเนินงาน",
      education:"ข้อมูลสำคัญที่ควรรู้",
      music:"ปล่อยอารมณ์เพลงให้คนฟังจดจำ",
      commercial:"จุดเด่นที่อยากให้รู้จัก",
      respectful:"ด้วยความเคารพและระลึกถึง",
      general:"สื่อสารเรื่องสำคัญให้เข้าใจง่าย"
    };
    const hook = b.keyMessage || hookMap[intent] || hookMap.general;
    const cta = b.action || (intent === "tradition" ? "ขอเชิญชวนทุกท่านร่วมงานตามวันเวลาและสถานที่ที่ประกาศ ร่วมกันสืบสานประเพณีให้คงอยู่คู่ท้องถิ่นสืบไป" : intent === "invitation" ? "ผู้สนใจสามารถติดตามรายละเอียดและเข้าร่วมตามข้อมูลที่ประกาศ" : b.org ? `ติดตามข้อมูลเพิ่มเติมจาก ${b.org}` : "โปรดตรวจสอบช่องทางติดต่อจริงก่อนเผยแพร่");
    const tags = [hash(b.org), hash(b.title), intent === "music" ? "เพลงใหม่" : "ประชาสัมพันธ์"].filter(Boolean).slice(0,4).map(x=>`#${x}`).join(" ");

    if(/Line/.test(channel)){
      return `ข้อความ LINE พร้อมส่ง\n\n${hook}\n\n${lines.slice(0,3).join("\n\n")}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place)])}\n\n${cta}`.replace(/\n{3,}/g,"\n\n");
    }
    if(/ข่าว|บทความ|เรียบเรียง/.test(channel)) return articleWriter(d);

    return `โพสต์พร้อมเผยแพร่ — Thai PR Copywriter\n\n${hook}\n\n${lines.join("\n\n")}\n\n${joinNonEmpty([line("📅 ", b.date), line("📍 ", b.place)])}\n\n${cta}${tags ? `\n\n${tags}` : ""}`.replace(/\n{3,}/g,"\n\n");
  }

  function articleWriter(d={}){
    const b = contentBrain(d);
    const lines = rewriteCore(d, "post");
    const headline = `${b.title}${b.org ? ` โดย ${b.org}` : ""}`;
    const body = lines.map((x, i) => i === 0 ? `     ${x}` : `     ${x}`).join("\n\n");
    return `ข่าวประชาสัมพันธ์พร้อมเผยแพร่\n\n${headline}\n\n${body}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place), line("ผู้เกี่ยวข้อง: ", b.people)])}\n\n${b.action || "หมายเหตุ: กรุณาตรวจสอบข้อมูลวัน เวลา สถานที่ และช่องทางติดต่อก่อนเผยแพร่จริง"}`.replace(/\n{3,}/g,"\n\n");
  }

  function mcWriter(d={}){
    const b = contentBrain(d);
    const address = b.address || "ท่านประธาน แขกผู้มีเกียรติ และผู้เข้าร่วมงานทุกท่าน";
    const president = b.people || placeholder("ชื่อและตำแหน่งประธาน");
    const agenda = b.agenda.length ? b.agenda : ["กล่าวต้อนรับ", "ดำเนินกิจกรรมตามกำหนดการจริง", "กล่าวขอบคุณและปิดงาน"];
    const contextLine = rewriteCore(d, "mc")[0] || `ขอต้อนรับทุกท่านเข้าสู่ “${b.title}”`;
    return `สคริปต์พิธีกรพร้อมใช้ — Ceremony Script Director\n\n[ก่อนเริ่ม] ตรวจไมโครโฟน ลำดับพิธี ชื่อประธาน และคำอ่านชื่อเฉพาะ\n\nเรียน ${address}\n\nขณะนี้ได้เวลาอันสมควรแล้ว ขอต้อนรับทุกท่านเข้าสู่ “${b.title}”${b.date ? ` ซึ่งจัดขึ้นในวันที่ ${b.date}` : ""}${b.place ? ` ณ ${b.place}` : ""}\n\n${contextLine}\n\n${b.org ? `การจัดงานครั้งนี้ดำเนินการโดย ${b.org}` : "[เติมชื่อหน่วยงานผู้จัดตามข้อมูลจริง]"}\n\nลำดับพิธีและคำเชื่อม\n${agenda.map((item,i)=>`${i+1}. ${item}\n   คำเชื่อม: ลำดับต่อไป ขอเรียนเชิญผู้เกี่ยวข้องดำเนินการในช่วง “${item}” ขอเรียนเชิญครับ/ค่ะ`).join("\n\n")}\n\nคำเชิญประธาน\nลำดับต่อไป ขอเรียนเชิญ ${president} กรุณากล่าวต่อผู้เข้าร่วมงาน ขอเรียนเชิญครับ/ค่ะ\n\nคำกล่าวปิด\nบัดนี้ การดำเนินงาน “${b.title}” ได้เสร็จสิ้นตามลำดับที่กำหนด ในนามผู้จัดงาน ขอขอบพระคุณทุกท่านที่ให้เกียรติเข้าร่วม และขอให้ทุกท่านเดินทางกลับโดยสวัสดิภาพ ขอบคุณครับ/ค่ะ\n\nบัตรเตือนพิธีกร\n• ตรวจชื่อและตำแหน่ง: ${president}\n• คำอ่านชื่อเฉพาะ: ${b.pronunciation || placeholder("คำอ่านชื่อเฉพาะ")}\n• ห้ามสลับลำดับพิธีโดยไม่ได้รับการยืนยันจากผู้จัด`;
  }

  function videoWriter(d={}, length="60 วินาที"){
    const b = contentBrain(d);
    const intent = detectIntent(d, "video");
    const format = real(d.format) || "คลิปประชาสัมพันธ์";
    const platform = real(d.channel) || "TikTok / Reels / Facebook";
    const aspectRatio = real(d.aspectRatio) || "ให้ AI เลือกตามช่องทาง";
    const videoStyle = real(d.videoStyle) || real(d.style) || "ให้ AI เลือกตามงาน";
    const outputPack = real(d.outputPack) || "แพ็กผลิตวิดีโอครบชุด";
    const voiceMode = real(d.videoVoiceMode) || real(d.voiceMode) || "บรรยาย + บทพูดตัวละคร (แนะนำ)";
    const assets = real(d.expertAssets);
    const lyricLines = splitPoints(real(d.expertLyrics));
    const textMode = /lyric|เนื้อเพลง|mv|music|เพลง|นิทาน|หนังสั้น|series|ซีรีส์/i.test(`${format} ${b.title} ${b.detail}`);
    const seconds = /15/.test(length) ? 15 : /30/.test(length) ? 30 : /90/.test(length) ? 90 : /3\s*นาที/.test(length) ? 180 : 60;
    const count = seconds <= 15 ? 3 : seconds <= 30 ? 4 : seconds <= 60 ? 6 : 8;
    const base = Math.floor(seconds / count);
    const extra = seconds % count;
    const core = rewriteCore(d, "video");
    const cta = b.action || (b.org ? `ติดตามข้อมูลเพิ่มเติมจาก ${b.org}` : "ติดตามรายละเอียดจากช่องทางที่เผยแพร่");
    const hook = b.keyMessage || (intent === "music" ? `ฟังอารมณ์ของ “${b.title}” ตั้งแต่วินาทีแรก` : intent === "commercial" ? `เหตุผลที่ควรรู้จัก “${b.title}” ภายในไม่กี่วินาที` : intent === "tradition" ? `ร่วมสืบสานประเพณี “${b.title}” ให้คงอยู่คู่ท้องถิ่น` : intent === "invitation" ? `ร่วมกำหนดทิศทางของ “${b.title}”` : intent === "announcement" ? `เรื่องสำคัญที่ควรรู้: ${b.title}` : b.title);
    const sceneLabels = textMode ? ["Hook / Mood", "Verse / Setup", "Key Line", "Emotion Beat", "Payoff", "CTA / End Card", "Extra Beat", "End Card"] : ["เปิดเรื่อง", "ปูบริบท", "สารหลัก", "รายละเอียด", "ประโยชน์", "ปิดท้าย", "CTA", "End Card"];
    const timecode = value => `${String(Math.floor(value/60)).padStart(2,"0")}:${String(value%60).padStart(2,"0")}`;
    const ttsLine = value => clamp(clean(value)
      .replace(/\bAI\b/gi, "เอไอ")
      .replace(/\bMV\b/gi, "เอ็มวี")
      .replace(/TikTok/gi, "ติ๊กต็อก")
      .replace(/Reels/gi, "รีลส์")
      .replace(/YouTube Shorts/gi, "ยูทูบ ชอร์ตส์")
      .replace(/YouTube/gi, "ยูทูบ")
      .replace(/CapCut/gi, "แคปคัต")
      .replace(/QR\s*Code/gi, "คิวอาร์โค้ด")
      .replace(/\bCTA\b/gi, "ซีทีเอ")
      .replace(/[|/]/g, " ")
      .replace(/\s+/g, " "), 140);
    const wantsLyricOnly = /เนื้อเพลง|Lyric/i.test(voiceMode);
    const wantsDialogue = !wantsLyricOnly && /ตัวละคร|นิทาน|หนัง|ซีรีส์|การ์ตูน|บรรยาย \+ บทพูด/i.test(`${voiceMode} ${format}`);
    const wantsNarration = !/เฉพาะบทพูดตัวละคร/.test(voiceMode);
    const dialogueFor = (message, idx) => {
      if(!wantsDialogue) return "";
      const promise = b.keyMessage || benefitLine(b, intent);
      const lines = [
        `เรื่องนี้เกี่ยวกับ ${b.title} ใช่ไหม`,
        `ใช่ เราจะเล่าให้เข้าใจง่าย และไม่แต่งข้อมูลเกินจริง`,
        `สิ่งสำคัญคือ ${promise}`,
        `แล้วคนดูควรจำอะไรจากเรื่องนี้`,
        `จำไว้ว่า ${message}`,
        cta
      ];
      return ttsLine(lines[idx % lines.length]);
    };
    let cursor = 0;
    const sceneObjects = Array.from({length:count}, (_,idx)=>{
      const duration = base + (idx < extra ? 1 : 0);
      const start = cursor;
      const end = cursor + duration;
      cursor = end;
      const first = idx===0, last=idx===count-1;
      const lyricLine = lyricLines[idx % Math.max(lyricLines.length, 1)];
      const message = first ? hook : last ? cta : (textMode && lyricLine ? lyricLine : (core[(idx-1)%core.length] || b.title));
      const visual = first
        ? `ภาพเปิดที่ทำให้รู้ทันทีว่าเรื่องคือ “${b.title}” ในสไตล์ ${videoStyle}`
        : last
          ? "ภาพปิด โลโก้จริง/ช่องทางจริงเฉพาะเมื่อมีไฟล์หรือข้อมูลยืนยัน"
          : textMode
            ? `ภาพตามอารมณ์หรือเหตุการณ์ของบรรทัด: ${clamp(message,90)}`
            : `ภาพประกอบหรือภาพจริงที่สื่อสารประเด็น: ${clamp(message,90)}`;
      const movement = first ? "push in / quick reveal" : last ? "hold / clean end card" : (idx % 2 ? "slow pan / cut on beat" : "medium shot + detail cutaway");
      const audio = textMode ? "ใช้จังหวะเพลงหรือเสียงบรรยายให้ตรงคำสำคัญ" : "เสียงพากย์ชัด + ดนตรีรองเบา ไม่กลบข้อความ";
      const transition = idx === count - 1 ? "fade out" : (textMode ? "cut on beat" : "clean cut");
      const aiPrompt = `สร้างช็อตวิดีโอ ${aspectRatio} สไตล์ ${videoStyle}: ${visual}. กล้อง ${movement}. ห้ามสร้างโลโก้ QR Code เบอร์โทร บุคคลจริง หรือข้อมูลที่ไม่มีในบรีฟ`;
      const characterDialogue = dialogueFor(message, idx);
      return {idx, duration, start, end, message, visual, movement, audio, transition, aiPrompt, characterDialogue};
    });
    const shortPromptFor = scene => clamp(`SHOT ${String(scene.idx+1).padStart(2,"0")} | ${scene.duration} วินาที | ${aspectRatio} | ภาพ: ${scene.visual} | กล้อง: ${scene.movement} | สไตล์: ${videoStyle} | อารมณ์: ${textMode ? "ตามจังหวะเพลง/เนื้อเรื่อง" : "ชัดเจน น่าเชื่อถือ"} | ห้ามใส่ตัวหนังสือ โลโก้ คิวอาร์โค้ด เบอร์โทร บุคคลจริง หรือข้อมูลปลอม`, 650);
    const shortPromptBlocks = sceneObjects.map(scene => shortPromptFor(scene)).join("\n\n");
    const scenes = sceneObjects.map(scene => `SCENE ${scene.idx+1} — ${sceneLabels[scene.idx] || "เล่าเรื่องต่อ"} / ${timecode(scene.start)}-${timecode(scene.end)} (${scene.duration} วินาที)
Visual/Shot: ${scene.visual}
Movement: ${scene.movement}
Voice Over / Lyric: ${scene.message}
Character Dialogue: ${scene.characterDialogue || "[ใช้เฉพาะเมื่อเลือกโหมดบทพูดตัวละคร]"}
On-screen Text: ${clamp(scene.message,70)}
Audio/SFX: ${scene.audio}
Transition: ${scene.transition}
AI Video Prompt: ${scene.aiPrompt}`).join("\n\n");
    const continuousScript = textMode && lyricLines.length ? lyricLines.join("\n") : [hook, ...core, b.date && `กำหนดการ ${b.date}`, b.place && `สถานที่ ${b.place}`, cta].filter(Boolean).join(" ");
    const narrationScript = (textMode && lyricLines.length ? lyricLines : [hook, ...core.slice(0, Math.max(2, count - 2)), cta])
      .map(ttsLine)
      .filter(Boolean)
      .join("\n\n");
    const characterDialogueScript = sceneObjects.map(scene => scene.characterDialogue).filter(Boolean).join("\n\n");
    const capCutVoiceScript = wantsLyricOnly
      ? narrationScript
      : wantsDialogue && !wantsNarration
        ? characterDialogueScript
        : wantsDialogue
          ? [narrationScript, characterDialogueScript].filter(Boolean).join("\n\n")
          : narrationScript;
    const mustHave = [
      `หัวข้อ/ชื่อเรื่องจริง: ${b.title}`,
      b.org && `ชื่อหน่วยงาน/แบรนด์จริง: ${b.org}`,
      assets && `วัตถุดิบที่มี: ${assets}`,
      b.date && `วันเวลา: ${b.date}`,
      b.place && `สถานที่: ${b.place}`
    ].filter(Boolean).map(x=>`• ${x}`).join("\n");
    return `Video Production Pack — Tanjai Video Studio / ${length}

Project Setup
รูปแบบงาน: ${format}
ช่องทาง: ${platform}
สัดส่วนภาพ: ${aspectRatio}
สไตล์วิดีโอ: ${videoStyle}
ชุดผลลัพธ์: ${outputPack}
เสียงใน CapCut: ${voiceMode}
กลุ่มเป้าหมาย: ${b.audience || "ให้ระบบเลือกตามบริบท"}

Core Message
${b.keyMessage || benefitLine(b, intent)}

Hook แนะนำ
${hook}

วิธีใช้เร็ว
• ใช้ Short Prompt รายช็อตไปสร้างวิดีโอทีละช็อต ไม่ต้องวางทั้งแพ็ก
• ใช้ CapCut Voice/Lyric Clean Script เฉพาะกับเสียงพากย์หรือซับ
• ถ้าต้องการให้ตัวละครพูด ให้ใช้บล็อก Character Dialogue แล้วคัดลอกทีละบรรทัดไปใส่เสียงของตัวละครนั้น
• เนื้อเพลง ข้อความบนจอ และเสียง ให้ใส่ใน CapCut ทีหลัง เพื่อเลี่ยงตัวอักษรเกินและอ่านเพี้ยน

Short Prompt รายช็อต (คัดลอกทีละช็อต / ไม่เกิน 650 ตัวอักษรต่อช็อต)
[SHORT_SHOT_PROMPTS]
${shortPromptBlocks}
[/SHORT_SHOT_PROMPTS]

CapCut Voice/Lyric Clean Script
[CAPCUT_VOICE_SCRIPT]
${capCutVoiceScript || "[เติมบทพูดหรือเนื้อเพลงที่ต้องการให้ CapCut อ่าน]"}
[/CAPCUT_VOICE_SCRIPT]

CapCut Character Dialogue Clean Script (คัดลอกทีละบรรทัดให้ตัวละครพูด)
[CAPCUT_CHARACTER_DIALOGUE]
${characterDialogueScript || "[เติมบทพูดตัวละครแบบสั้น ๆ ทีละประโยค ห้ามใส่คำกำกับภาพ]"}
[/CAPCUT_CHARACTER_DIALOGUE]

Storyboard พร้อมผลิต
${scenes}

Voice Over / Lyric Timing
${continuousScript || "[เติมเนื้อเพลง บทพูด หรือข้อความบรรยายตามข้อมูลจริง]"}

Shot List
Must-have
${mustHave || "• หัวข้อจริงของงาน\n• ภาพหรือวัตถุดิบจริงที่ผู้ใช้มี\n• CTA หรือช่องทางจริงที่ได้รับการยืนยัน"}

Nice-to-have
• ภาพเปิดที่หยุดสายตาใน 1-3 วินาทีแรก
• B-roll รายละเอียดมือ วัตถุ สถานที่ หรือบรรยากาศที่ตรงกับบรีฟ
• End Card สะอาด อ่านง่าย และไม่ใส่ข้อมูลปลอม

AI Video Prompt Pack แบบละเอียด
${sceneObjects.map(scene => `Shot ${scene.idx+1}: ${scene.aiPrompt}`).join("\n")}

CapCut / Editing Notes
• ตั้งโปรเจกต์เป็น ${aspectRatio}
• ใส่ Subtitle หรือ Lyric ให้อยู่ใน safe area และอ่านทันในแต่ละซีน
• ตัดภาพตาม timecode ด้านบน แล้วปรับจังหวะจริงตามเพลงหรือเสียงพากย์
• ใช้ฟอนต์ไทยอ่านง่าย หลีกเลี่ยงข้อความยาวบนจอมือถือ

Fact/Asset Checklist ก่อนผลิต
• ตรวจชื่อ วันที่ สถานที่ ตัวเลข ช่องทางติดต่อ และโลโก้ก่อนขึ้นจอ
• ใช้เฉพาะภาพจริงหรือภาพที่ผู้ใช้อนุญาต
• ห้ามสร้างโลโก้ บุคคล QR Code เบอร์โทร หรือเหตุการณ์จริงเพิ่มเอง`;
  }

  function voiceWriter(d={}, length="60 วินาที", style="ทางการ สุภาพ"){
    const b = contentBrain(d);
    const intent = detectIntent(d, "voice");
    const core = rewriteCore(d, "voice");
    const open = intent === "tradition"
      ? `ขอเชิญพุทธศาสนิกชนและพี่น้องประชาชนทุกท่าน ร่วม “${b.title}” เพื่อความเป็นสิริมงคล และร่วมกันสืบสานประเพณีอันดีงามของท้องถิ่นเรา`
      : intent === "invitation"
      ? `ขอเชิญพี่น้องประชาชนและผู้เกี่ยวข้อง ร่วมรับฟังและมีส่วนร่วมใน “${b.title}”`
      : intent === "announcement"
        ? `ขอแจ้งประชาสัมพันธ์เรื่อง “${b.title}” เพื่อให้ทุกท่านรับทราบข้อมูลอย่างถูกต้อง`
        : intent === "report"
          ? `ขอสรุปการดำเนินงานเรื่อง “${b.title}” ให้ทุกท่านได้รับทราบ`
          : `ขอนำเสนอเรื่อง “${b.title}”`;
    const bodyCore = core.slice(1,6).join("\n\n") || benefitLine(b, intent);
    const bridgeText = intent === "tradition"
      ? "ประเพณีที่สืบทอดกันมา คือสายใยที่เชื่อมคนในชุมชนเข้าด้วยกัน การได้มาร่วมงานพร้อมหน้ากัน ทั้งผู้เฒ่าผู้แก่ ลูกหลาน และเยาวชน คือการส่งต่อคุณค่าอันดีงามนี้ให้คงอยู่คู่ท้องถิ่นของเราตลอดไป"
      : "การมีส่วนร่วมของทุกฝ่ายช่วยให้ข้อมูลที่นำไปใช้วางแผนหรือสื่อสารต่อ มีความใกล้เคียงกับความต้องการจริงของพื้นที่มากขึ้น และช่วยให้การดำเนินงานเกิดประโยชน์ต่อประชาชนอย่างเป็นรูปธรรม";
    const extendedBridge = /3\s*นาที|90/.test(length) ? `\n\n[ขยายความ — ใช้น้ำเสียงต่อเนื่อง]\n${bridgeText}` : "";
    const datePlace = joinNonEmpty([b.date && `กำหนดการที่เกี่ยวข้อง คือ ${b.date}`, b.place && `สถานที่ ${b.place}`], "\n");
    const close = b.action || (b.org ? `ติดตามข้อมูลเพิ่มเติมได้จาก ${b.org}` : "ติดตามรายละเอียดเพิ่มเติมจากช่องทางประชาสัมพันธ์ที่ถูกต้อง");
    return `สคริปต์เสียงพร้อมอ่าน — Voice Script Director\n\n[โทน ${style} | ความยาวเป้าหมาย ${length}]\n\n[เปิด — ชัดเจน / ดึงความสนใจ]\n${open}\n\n[เนื้อหา — เล่าให้เข้าใจง่าย]\n${bodyCore}${extendedBridge}\n\n${datePlace ? `[ข้อมูลสำคัญ — อ่านให้ช้าและชัด]\n${datePlace}\n\n` : ""}[ปิด — ย้ำประโยชน์และการมีส่วนร่วม]\n${close}\n\nคำกำกับการอ่าน\n• เว้นจังหวะหลังหัวข้อ “${b.title}”\n• เน้นคำสำคัญ: ${b.keyMessage || benefitLine(b, intent)}\n• คำอ่านชื่อเฉพาะ: ${b.pronunciation || placeholder("คำอ่านชื่อเฉพาะ")}\n• ตรวจวัน เวลา สถานที่ และชื่อหน่วยงานก่อนบันทึกเสียงจริง`;
  }

  function slideWriter(d={}, count=8){
    const b = contentBrain(d);
    const core = rewriteCore(d, "deck");
    const slides = [
      [b.title, b.org || placeholder("ชื่อหน่วยงาน"), "เปิดด้วยภาพรวมและเหตุผลที่ต้องนำเสนอเรื่องนี้"],
      ["เป้าหมายของงาน", b.keyMessage || benefitLine(b, detectIntent(d,"deck")), "อธิบายเป้าหมายให้ชัดใน 1 นาที"],
      ["บริบทและความสำคัญ", core.slice(0,2).join("\n"), "เล่าที่มาโดยไม่เพิ่มข้อเท็จจริงนอกเหนือจากบรีฟ"],
      ["ข้อมูลจริงที่มี", (b.points.length ? b.points : [b.detail]).map(x=>`• ${x}`).join("\n"), "ชี้ให้เห็นข้อมูลยืนยันที่มีอยู่"],
      ["แนวทางดำเนินงาน", core.slice(1,4).map(x=>`• ${x}`).join("\n") || placeholder("แนวทางดำเนินงาน"), "เชื่อมข้อมูลกับสิ่งที่จะทำต่อ"],
      ["กำหนดการและพื้นที่", joinNonEmpty([b.date || placeholder("วันและเวลา"), b.place || placeholder("สถานที่")], "\n"), "ตรวจความถูกต้องก่อนนำเสนอ"],
      ["สิ่งที่ต้องการให้ผู้ฟังรับทราบ/ตัดสินใจ", b.action || placeholder("ข้อเสนอ / CTA / สิ่งที่ต้องการให้เห็นชอบ"), "ปิดด้วยคำขอหรือข้อสรุปที่ชัดเจน"],
      ["สรุป", b.keyMessage || b.title, "ย้ำสารสำคัญและขอบคุณผู้ฟัง"]
    ];
    while(slides.length < count) slides.splice(slides.length-1,0,[`ข้อมูลประกอบ ${slides.length-6}`, placeholder("ข้อมูลประกอบ"), "ใช้เฉพาะข้อมูลจริงหรือหลักฐานที่มี"]);
    return `โครงสไลด์พร้อมเนื้อหา — Presentation Strategist\n\n${slides.slice(0,count).map((s,i)=>`SLIDE ${i+1} — ${s[0]}\nเนื้อหาบนสไลด์:\n${s[1]}\n\nSpeaker Notes:\n${s[2]}`).join("\n\n---\n\n")}`;
  }

  function imageDirector(d={}){
    const b = contentBrain(d);
    const intent = detectIntent(d,"image");
    const style = b.visualPreset || "ให้ AI เลือกตามงาน";
    const core = rewriteCore(d,"image");
    return `Creative Direction — Thai Poster Director\n\nBig Idea\n${b.keyMessage || benefitLine(b,intent)}\n\nข้อความหลักบนภาพ\n${b.title}\n\nสารรองที่ควรใส่ถ้ามีพื้นที่\n${core.slice(0,3).map(x=>`• ${x}`).join("\n")}\n\nแนวภาพ\n${style}\n\nPrompt พร้อมใช้\nสร้างภาพประชาสัมพันธ์ที่สื่อสารเรื่อง “${b.title}” ให้เข้าใจภายใน 3 วินาที ใช้แนว ${style} จัดลำดับหัวข้อเด่น รายละเอียดรอง และพื้นที่โลโก้/หน่วยงานเฉพาะเมื่อมีไฟล์หรือข้อมูลจริง ห้ามสร้างวัน เวลา สถานที่ เบอร์โทร QR Code หรือโลโก้ปลอม\n\nText Lock\n${b.title}${b.org ? `\n${b.org}` : ""}\n\nตรวจสุดท้าย\n• ข้อความไทยต้องอ่านง่ายบนมือถือ\n• Visual Preset เป็นสไตล์ ไม่ใช่ข้อความบนภาพ\n• ไม่สร้างข้อมูลจริงที่ผู้ใช้ไม่ได้ให้มา`;
  }

  function kitProducer(d={}){
    const b = contentBrain(d);
    const intent = detectIntent(d,"kit");
    const core = rewriteCore(d,"kit");
    return `ชุดสื่อพร้อมใช้ — Campaign Producer\n\nCampaign Spine\nหัวข้อหลัก: ${b.title}\nCore Message: ${b.keyMessage || benefitLine(b,intent)}\nเจ้าของงาน: ${b.org || placeholder("ชื่อหน่วยงาน / แบรนด์")}\nกลุ่มเป้าหมาย: ${b.audience || "ให้ระบบเลือกตามบริบท"}\n\n1) ภาพประชาสัมพันธ์\n- ข้อความหลักบนภาพ: ${b.title}\n- แนวภาพ: ${b.visualPreset || "ให้ AI เลือกตามงาน"}\n- จุดเน้น: ${b.keyMessage || "หัวข้อหลักและประโยชน์ของงาน"}\n\n2) โพสต์ Facebook / Line\n${captionWriter(d)}\n\n3) บทวิดีโอสั้น\n${videoWriter(d, "30 วินาที")}\n\n4) เสียงพากย์\n${voiceWriter(d, "30 วินาที", "สุภาพ ชัดเจน") }\n\n5) โครงสไลด์ย่อ\n${slideWriter(d, 5)}\n\nFact Guard รวม\n${factGuard(d)}`;
  }

  T.freeWritingTeam = {
    contentBrain,
    detectIntent,
    rewriteCore,
    factGuard,
    captionWriter,
    articleWriter,
    mcWriter,
    videoWriter,
    voiceWriter,
    slideWriter,
    imageDirector,
    kitProducer
  };
  if(typeof module !== "undefined" && module.exports) module.exports = T.freeWritingTeam;
})(typeof globalThis !== "undefined" ? globalThis : window);

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
      .split(/\n+|[•▪●]|(?:\s+-\s+)|(?:^|\n)\s*[0-9]+[.)]\s+/g)
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
      pronunciation: real(d.pronunciation) || real(d.expertPronunciation),
      lockedFacts: real(d.lockedFacts),
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
    if(/ขอเชิญ|เชิญชวน|เปิดรับ|รับสมัคร|ลงทะเบียน|กำหนดจัด|จะจัด/.test(text)) return "invitation";
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

  function safeExpansion(b){
    const source = `${b.title} ${b.detail}`;
    const ideas = [];
    if(/ยุงลาย|ไข้เลือดออก|แหล่งเพาะพันธุ์ยุง/.test(source)){
      ideas.push("การป้องกันเริ่มได้จากการช่วยกันดูแลสภาพแวดล้อมรอบบ้านและชุมชน ไม่ให้มีภาชนะหรือจุดที่อาจกลายเป็นแหล่งน้ำขัง");
      ideas.push("ความร่วมมืออย่างต่อเนื่องของทุกครัวเรือนช่วยลดจุดเสี่ยงใกล้ตัว และทำให้ชุมชนน่าอยู่ยิ่งขึ้น");
    }
    if(/ขยะ|ความสะอาด|คัดแยก|สิ่งปฏิกูล/.test(source)){
      ideas.push("การจัดการตั้งแต่ต้นทางและการรักษาความสะอาดอย่างสม่ำเสมอ ช่วยลดผลกระทบต่อพื้นที่ส่วนรวมและสิ่งแวดล้อม");
      ideas.push("ทุกคนสามารถมีส่วนร่วมได้จากการดูแลพื้นที่ของตนเองและปฏิบัติตามแนวทางของชุมชน");
    }
    if(/ถนน|จราจร|หมวกนิรภัย|อุบัติเหตุ|ความปลอดภัย/.test(source)){
      ideas.push("การตระหนักถึงความปลอดภัยและเคารพกติกาในพื้นที่ร่วมกัน ช่วยลดความเสี่ยงที่อาจเกิดขึ้นกับตนเองและผู้อื่น");
    }
    if(/ต้นไม้|สิ่งแวดล้อม|พื้นที่สีเขียว|คลอง|น้ำเสีย/.test(source)){
      ideas.push("การดูแลทรัพยากรและสภาพแวดล้อมในพื้นที่อย่างต่อเนื่อง เป็นส่วนหนึ่งของการสร้างคุณภาพชีวิตที่ดีให้ชุมชนในระยะยาว");
    }
    if(/ผู้สูงอายุ|ผู้สูงวัย|สุขภาพ/.test(source) && !/ยุงลาย|ไข้เลือดออก/.test(source)){
      ideas.push("กิจกรรมด้านสุขภาพมุ่งส่งเสริมให้ประชาชนเห็นความสำคัญของการดูแลตนเอง และนำแนวทางที่เหมาะสมไปใช้ในชีวิตประจำวัน");
    }
    if(/ออกกำลังกาย|แอโรบิก|แอโรบิค|เต้น|สุขภาพ/.test(source) && !/ยุงลาย|ไข้เลือดออก/.test(source)){
      ideas.push("การขยับร่างกายอย่างสม่ำเสมอช่วยสร้างเสริมสุขภาพ และทำให้การออกกำลังกายเป็นกิจกรรมที่สนุกเมื่อได้ทำร่วมกัน");
    }
    if(/อบรม|ฝึกอบรม|ให้ความรู้/.test(source)){
      ideas.push("สาระของกิจกรรมเน้นความเข้าใจที่นำไปปฏิบัติได้จริง และเปิดโอกาสให้ผู้เข้าร่วมเชื่อมโยงความรู้กับบริบทของตนเอง");
    }
    if(/ฝึกซ้อม.*ป้องกัน|ป้องกันและบรรเทาสาธารณภัย|แผนฉุกเฉิน|สาธารณภัย/.test(source)){
      ideas.push("การฝึกซ้อมช่วยให้ผู้เกี่ยวข้องเข้าใจบทบาท ลำดับการประสานงาน และแนวทางปฏิบัติเมื่อเกิดเหตุฉุกเฉินได้ชัดเจนขึ้น");
      ideas.push("การทบทวนแผนร่วมกันช่วยลดความสับสน เสริมความพร้อม และทำให้การรับมือสถานการณ์จริงเป็นระบบมากขึ้น");
    }
    return [...new Set(ideas)].slice(0,3);
  }

  function postStage(b){
    const source=`${b.title} ${b.detail}`;
    if(/เมื่อวันที่|ที่ผ่านมา|ได้จัด|ดำเนินการแล้ว|เป็นประธานเปิด|ร่วมกิจกรรม|ลงพื้นที่|สรุปผล|ผลการดำเนินงาน/.test(source)) return "completed";
    if(/ขอเชิญ|จะจัด|กำหนดจัด|เปิดรับ|รับสมัคร/.test(source)) return "upcoming";
    if(/แจ้ง|ประกาศ|งด|ปิด|หยุด|เตือน/.test(source)) return "announcement";
    return "general";
  }

  function creativeLevel(d={}){
    return real(d.creativity) || "ช่วยคิดและแต่งให้สมบูรณ์";
  }

  function postIntent(d={}){
    const selected=real(d.workContext);
    if(/เชิญชวน|ก่อนจัดงาน/.test(selected)) return "invitation";
    if(/สรุป.*กิจกรรม|ดำเนินงานแล้ว|รายงานความคืบหน้า|รายงานผล/.test(selected)) return "report";
    if(/แจ้งข่าว|ประกาศ/.test(selected)) return "announcement";
    if(/ให้ความรู้|รณรงค์/.test(selected)) return "education";
    const b=contentBrain(d);
    const stage=postStage(b);
    if(stage === "announcement") return "announcement";
    if(stage === "completed") return "report";
    if(stage === "upcoming") return "invitation";
    return detectIntent(d,"post");
  }

  function compactComparable(value=""){
    return clean(value).toLowerCase().replace(/ประจำปี\s*[0-9๐-๙]{4}/g, "").replace(/[^\u0E00-\u0E7Fa-z0-9]/g, "");
  }

  function isSparsePostBrief(d={}){
    const title=compactComparable(real(d.title));
    const detail=compactComparable(real(d.detail));
    const meaningfulPoints=splitPoints(real(d.detail)).filter(point=>{
      const normalized=compactComparable(point);
      return normalized && normalized !== title && !normalized.startsWith(title) && !title.startsWith(normalized);
    });
    return !meaningfulPoints.length && (!detail || detail === title || detail.startsWith(title) || title.startsWith(detail));
  }

  function projectFoundationWriter(d={}){
    const b=contentBrain(d);
    const suppliedDetail=real(d.detail);
    const displayTitle=suppliedDetail && compactComparable(suppliedDetail).startsWith(compactComparable(b.title)) && suppliedDetail.length <= b.title.length + 40 ? suppliedDetail : b.title;
    const ideas=editorialExpansion(b,"general",creativeLevel(d));
    const purpose=/ฝึกซ้อม.*ป้องกัน|ป้องกันและบรรเทาสาธารณภัย|แผนฉุกเฉิน|สาธารณภัย/.test(`${b.title} ${b.detail}`)
      ? "มุ่งเตรียมความพร้อมให้ผู้เกี่ยวข้องเข้าใจบทบาท การประสานงาน และแนวทางปฏิบัติเมื่อเกิดเหตุฉุกเฉิน"
      : benefitLine(b,"general");
    const lines=[
      `${b.org ? `${b.org} ให้ความสำคัญกับ` : "แนวทางของ"} “${displayTitle}” ซึ่ง${purpose}`,
      ...ideas,
      "เมื่อมีรายละเอียดครบ เนื้อหานี้สามารถปรับต่อเป็นโพสต์เชิญชวน ข่าวประชาสัมพันธ์ บทพากย์ หรือสรุปผลหลังจบงานได้ทันที"
    ];
    return `เนื้อหาตั้งต้นสำหรับโครงการ\n\n${[...new Set(lines.filter(Boolean))].join("\n\n")}`;
  }

  function resolvePostOutput(d={}, options={}){
    const requested=real(options.channel) || real(d.channel) || "ให้ AI วิเคราะห์และเลือกผลงาน";
    if(!/ให้ AI วิเคราะห์/.test(requested)) return requested;
    const merged={...d, workContext:real(options.purpose) || real(d.workContext)};
    const purpose=real(options.purpose);
    const platform=real(options.platform);
    if(/เสียงตามสาย|รถประชาสัมพันธ์/.test(`${platform} ${purpose}`)) return "สคริปต์เสียงตามสายและรถประชาสัมพันธ์";
    if(/YouTube|Reels|TikTok|วิดีโอ|วีดีโอ|คลิป/.test(`${platform} ${merged.title || ""} ${merged.detail || ""}`)) return "สคริปต์วิดีโอประชาสัมพันธ์";
    if(isSparsePostBrief(merged) && /ให้ AI วิเคราะห์|สร้างการรับรู้ทั่วไป|^$/.test(purpose)) return "เนื้อหาตั้งต้นสำหรับโครงการ";
    if(/สรุป.*กิจกรรม|รายงาน.*ผล|ดำเนินงานแล้ว/.test(purpose)) return "สรุปกิจกรรมพร้อมเผยแพร่";
    if(/แจ้งข่าว|ประกาศ/.test(purpose)) return "ข่าวประชาสัมพันธ์";
    return "โพสต์ Facebook พร้อมเผยแพร่";
  }

  function editorialExpansion(b, intent, level="ช่วยคิดและแต่งให้สมบูรณ์"){
    if(/รักษาข้อมูลเป็นหลัก/.test(level)) return [];
    const topicIdeas=safeExpansion(b);
    const ideas=[...topicIdeas];
    if(!ideas.length){
      if(intent === "report") ideas.push("เบื้องหลังการดำเนินงานคือความร่วมมือของผู้เกี่ยวข้อง เพื่อให้งานเดินหน้าอย่างต่อเนื่องและตอบโจทย์พื้นที่ได้ชัดเจนขึ้น");
      else if(intent === "invitation") ideas.push("การเข้าร่วมไม่เพียงช่วยให้ได้รับข้อมูลที่ครบถ้วน แต่ยังเปิดพื้นที่ให้เกิดการเรียนรู้และความร่วมมือระหว่างผู้เกี่ยวข้อง");
      else if(intent === "announcement") ideas.push("การรับทราบข้อมูลล่วงหน้าช่วยลดความสับสน และทำให้ผู้เกี่ยวข้องสามารถเตรียมตัวได้เหมาะสม");
      else if(intent === "education") ideas.push("เมื่อเข้าใจประเด็นสำคัญอย่างถูกต้อง ทุกคนจะสามารถนำข้อมูลไปปรับใช้และตัดสินใจได้เหมาะกับบริบทของตนเอง");
      else ideas.push("เนื้อหานี้มุ่งทำให้เรื่องที่อาจดูซับซ้อนเข้าใจง่ายขึ้น และเชื่อมโยงกับสิ่งที่ผู้รับสารนำไปใช้ได้จริง");
    }
    if(/สร้างสรรค์มากขึ้น/.test(level)){
      ideas.push("เพราะการเปลี่ยนแปลงที่เห็นผล มักเริ่มจากความเข้าใจเล็ก ๆ และการลงมือทำร่วมกันอย่างต่อเนื่อง");
    }
    return [...new Set(ideas)].slice(0,/สร้างสรรค์มากขึ้น/.test(level) ? 3 : 2);
  }

  function safePostClosing(b, intent, level="ช่วยคิดและแต่งให้สมบูรณ์"){
    if(b.action) return b.action;
    if(/รักษาข้อมูลเป็นหลัก/.test(level)) return "";
    const source=`${b.title} ${b.detail}`;
    if(/ยุงลาย|ไข้เลือดออก/.test(source)) return "มาร่วมกันสำรวจและลดจุดเสี่ยงรอบตัว เพื่อให้บ้านและชุมชนปลอดภัยยิ่งขึ้น";
    if(/ขยะ|คัดแยก|ความสะอาด/.test(source)) return "เริ่มได้จากสิ่งใกล้ตัว ร่วมกันดูแลพื้นที่ของเราให้สะอาดและน่าอยู่อย่างต่อเนื่อง";
    if(/ออกกำลังกาย|แอโรบิก|แอโรบิค|เต้น|สุขภาพ/.test(source) && intent === "invitation") return "ชวนคนที่คุณรักมาขยับร่างกาย สนุกไปด้วยกัน และเริ่มดูแลสุขภาพจากก้าวเล็ก ๆ ในวันนี้";
    if(intent === "invitation") return "ขอเชิญผู้สนใจร่วมเป็นส่วนหนึ่งของกิจกรรม และร่วมสร้างประโยชน์ไปด้วยกัน";
    if(intent === "announcement") return "โปรดอ่านรายละเอียดให้ครบถ้วน และเตรียมตัวให้เหมาะสมกับข้อมูลที่ประกาศ";
    if(intent === "report") return "ทุกความร่วมมือคือแรงสำคัญที่ทำให้งานเดินหน้าต่อไปได้อย่างมีความหมาย";
    if(intent === "education") return "ลองนำแนวทางที่เหมาะสมไปปรับใช้ แล้วเริ่มต้นจากสิ่งที่ทำได้ใกล้ตัว";
    return "ร่วมทำความเข้าใจ และนำข้อมูลนี้ไปใช้ให้เกิดประโยชน์ในชีวิตประจำวัน";
  }

  function creativeHook(b,intent){
    const source=`${b.title} ${b.detail}`;
    if(/ยุงลาย|ไข้เลือดออก/.test(source)) return "จุดเสี่ยงเล็ก ๆ รอบบ้าน อาจกลายเป็นแหล่งเพาะพันธุ์ยุงลายได้โดยไม่ทันสังเกต";
    if(/ขยะ|คัดแยก|ความสะอาด/.test(source)) return "เมืองที่น่าอยู่ เริ่มจากการจัดการสิ่งใกล้ตัวให้ถูกวิธี";
    if(/ออกกำลังกาย|แอโรบิค|สุขภาพ/.test(source)) return "สุขภาพที่ดีเริ่มต้นได้จากการขยับร่างกาย และกำลังใจที่ส่งต่อถึงกัน";
    if(/สิ่งแวดล้อม|พื้นที่สีเขียว|คลอง|น้ำเสีย/.test(source)) return "ทุกพื้นที่ที่ได้รับการดูแล คือคุณภาพชีวิตที่ดีขึ้นของคนในชุมชน";
    if(/ประชาคม|แผนพัฒนา/.test(source)) return "ทุกความคิดเห็นจากพื้นที่ มีความหมายต่อทิศทางการพัฒนาท้องถิ่น";
    if(intent === "announcement") return `เรื่อง “${b.title}” มีรายละเอียดสำคัญที่ผู้เกี่ยวข้องควรทราบ`;
    if(intent === "invitation") return `มาร่วมเป็นส่วนหนึ่งของ “${b.title}” และเปลี่ยนความสนใจให้เป็นการลงมือทำ`;
    if(intent === "report") return `อีกหนึ่งความเคลื่อนไหวของ “${b.title}” ที่สะท้อนการทำงานร่วมกันในพื้นที่`;
    if(intent === "education") return `เรื่อง “${b.title}” เข้าใจได้ง่ายขึ้น เมื่อเริ่มจากประเด็นที่เกี่ยวข้องกับชีวิตประจำวัน`;
    return `เรื่อง “${b.title}” อาจใกล้ตัวและเกี่ยวข้องกับเรามากกว่าที่คิด`;
  }

  function postCreativeLines(d={}){
    const b=contentBrain(d);
    const intent=postIntent(d);
    const stage=postStage(b);
    const level=creativeLevel(d);
    const org=b.org || "หน่วยงานผู้จัด";
    const factual=b.points.filter(Boolean).map(point=>clamp(point,360));
    const intro=stage === "completed"
      ? `${org} ถ่ายทอดเรื่องราวของ “${b.title}” จากการดำเนินงานที่เกิดขึ้น พร้อมสื่อสารสาระสำคัญให้ประชาชนเข้าใจได้ง่าย`
      : stage === "upcoming"
        ? `${org} ขอเชิญชวนผู้สนใจร่วม “${b.title}” และร่วมเป็นส่วนหนึ่งของกิจกรรมที่เชื่อมโยงผู้คนกับประโยชน์ของส่วนรวม`
        : stage === "announcement"
          ? `${org} ขอแจ้งประชาสัมพันธ์เรื่อง “${b.title}” เพื่อให้ผู้เกี่ยวข้องรับทราบข้อมูลอย่างชัดเจนและเตรียมตัวได้ถูกต้อง`
          : `${org} นำเสนอเรื่อง “${b.title}” เพื่อถ่ายทอดประเด็นสำคัญให้เข้าใจง่ายและนำไปใช้ประโยชน์ได้จริง`;
    return [...new Set([intro,...factual,...editorialExpansion(b,intent,level)].filter(Boolean))];
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
    safeExpansion(b).forEach(item => details.push(item));
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
      ,b.lockedFacts && `ข้อมูลที่ห้ามเปลี่ยน: ${b.lockedFacts}`
      ,b.pronunciation && `คำอ่านชื่อเฉพาะ: ${b.pronunciation}`
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
    const intent = d._postStrict ? postIntent(d) : detectIntent(d, "post");
    const channel = real(d.channel) || "โพสต์ Facebook";
    const lines = d._postStrict ? postCreativeLines(d).filter(line=>compactComparable(line) !== compactComparable(b.title)) : rewriteCore(d, "post");
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
    const hook = b.keyMessage || (d._postStrict ? creativeHook(b,intent) : (hookMap[intent] || hookMap.general));
    const cta = d._postStrict ? safePostClosing(b,intent,creativeLevel(d)) : (b.action || (intent === "tradition" ? "ขอเชิญชวนทุกท่านร่วมงานตามวันเวลาและสถานที่ที่ประกาศ ร่วมกันสืบสานประเพณีให้คงอยู่คู่ท้องถิ่นสืบไป" : intent === "invitation" ? "ผู้สนใจสามารถติดตามรายละเอียดและเข้าร่วมตามข้อมูลที่ประกาศ" : b.org ? `ติดตามข้อมูลเพิ่มเติมจาก ${b.org}` : "โปรดตรวจสอบช่องทางติดต่อจริงก่อนเผยแพร่"));
    const topicTag=/สาธารณภัย|ป้องกัน.*ภัย/.test(`${b.title} ${b.detail}`) ? "ป้องกันและบรรเทาสาธารณภัย" : hash(b.title).slice(0,36);
    const tags = [hash(b.org), topicTag, intent === "music" ? "เพลงใหม่" : "ประชาสัมพันธ์"].filter(Boolean).slice(0,3).map(x=>`#${x}`).join(" ");

    if(/Line/.test(channel)){
      return `ข้อความ LINE พร้อมส่ง\n\n${hook}\n\n${lines.slice(0,3).join("\n\n")}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place)])}\n\n${cta}`.replace(/\n{3,}/g,"\n\n");
    }
    if(/ข่าว|บทความ|เรียบเรียง/.test(channel)) return articleWriter(d);

    return `โพสต์พร้อมเผยแพร่ — Thai PR Copywriter\n\n${hook}\n\n${lines.join("\n\n")}\n\n${joinNonEmpty([line("📅 ", b.date), line("📍 ", b.place)])}\n\n${cta}${tags ? `\n\n${tags}` : ""}`.replace(/\n{3,}/g,"\n\n");
  }

  function articleWriter(d={}){
    const b = contentBrain(d);
    const lines = d._postStrict ? postCreativeLines(d) : rewriteCore(d, "post");
    const headline = `${b.title}${b.org ? ` โดย ${b.org}` : ""}`;
    const body = lines.map((x, i) => i === 0 ? `     ${x}` : `     ${x}`).join("\n\n");
    return `ข่าวประชาสัมพันธ์พร้อมเผยแพร่\n\n${headline}\n\n${body}\n\n${joinNonEmpty([line("วัน/เวลา: ", b.date), line("สถานที่: ", b.place), line("ผู้เกี่ยวข้อง: ", b.people)])}\n\n${d._postStrict ? safePostClosing(b,postIntent(d),creativeLevel(d)) : (b.action || "หมายเหตุ: กรุณาตรวจสอบข้อมูลวัน เวลา สถานที่ และช่องทางติดต่อก่อนเผยแพร่จริง")}`.replace(/\n{3,}/g,"\n\n");
  }

  function clipCaptionWriter(d={}){
    const b = contentBrain(d);
    const intent = d._postStrict ? postIntent(d) : detectIntent(d, "post");
    const hook = b.keyMessage || benefitLine(b, intent);
    const action = d._postStrict ? safePostClosing(b,intent,creativeLevel(d)) : (b.action || (b.org ? `ติดตามรายละเอียดเพิ่มเติมจาก ${b.org}` : "ติดตามรายละเอียดจากช่องทางประชาสัมพันธ์ที่ถูกต้อง"));
    const tags = [hash(b.org), hash(b.title), "คลิปประชาสัมพันธ์"].filter(Boolean).slice(0,5).map(x=>`#${x}`).join(" ");
    return `ชุดข้อความประกอบคลิปพร้อมใช้\n\nชื่อคลิป / YouTube Title\n${b.title}\n\nคำโปรยสั้นสำหรับ Reels / TikTok\n${hook}\n\nคำอธิบายคลิป\n${rewriteCore(d,"post").slice(0,4).join("\n\n")}\n\n${action}${tags ? `\n\n${tags}` : ""}`;
  }

  function targetSeconds(length="60 วินาที"){
    if(/15/.test(length)) return 15;
    if(/30/.test(length)) return 30;
    if(/90/.test(length)) return 90;
    if(/2\s*นาที/.test(length)) return 120;
    if(/3/.test(length)) return 180;
    if(/4/.test(length)) return 240;
    if(/5/.test(length)) return 300;
    return 60;
  }

  function spokenSeconds(text=""){
    return Math.max(1, Math.round(clean(text).replace(/\s/g, "").length / 10));
  }

  function postVoiceWriter(d={}, length="60 วินาที", style="สุภาพ เป็นธรรมชาติ อ่านง่าย", publicAddress=false){
    const b=contentBrain(d);
    const intent=postIntent(d);
    const sourceText=`${real(d.title)} ${real(d.detail)} ${real(d.workContext)}`;
    const completedWork=/เมื่อวันที่|ที่ผ่านมา|ได้จัด|ดำเนินการแล้ว|เป็นประธานเปิด|ร่วมกิจกรรม|สรุปผล|ผลการดำเนินงาน/.test(sourceText);
    const upcomingWork=/ขอเชิญ|จะจัด|กำหนดจัด|เปิดรับ|รับสมัคร/.test(sourceText);
    const rawPoints=splitPoints(real(d.detail));
    const facts=[...rawPoints];
    if(!facts.length && real(d.detail)) facts.push(real(d.detail));
    const opening=publicAddress
      ? `ประกาศประชาสัมพันธ์จาก${b.org || "[ต้องระบุ: ชื่อหน่วยงาน]"} เรื่อง “${b.title}”`
      : completedWork || intent === "report"
        ? `เรื่องราวของ “${b.title}” สะท้อนการดำเนินงานจากข้อมูลจริงที่เกิดขึ้น`
        : intent === "announcement"
          ? `${b.org ? `${b.org} ` : ""}ขอแจ้งเรื่อง “${b.title}”`
          : upcomingWork || intent === "invitation"
            ? `${b.org ? `${b.org} ` : ""}ขอเชิญชวนร่วม “${b.title}”`
            : `ขอนำเสนอเรื่อง “${b.title}”`;
    const factualBody=facts.map(point=>clamp(point,320));
    const safeIdeas=editorialExpansion(b,intent,creativeLevel(d));
    const datePlace=[b.date && `วันและเวลา ${b.date}`,b.place && `สถานที่ ${b.place}`].filter(Boolean);
    const closing=b.action ? b.action : "";
    const blocks=[opening,...factualBody,...safeIdeas,...datePlace,closing].filter(Boolean);
    let speech=blocks.join("\n\n");
    const target=targetSeconds(length);
    const actual=spokenSeconds(speech);
    const timing=`เวลาอ่านโดยประมาณ ${actual} วินาที${Math.abs(actual-target) <= Math.max(8,target*.2) ? ` • ใกล้เป้าหมาย ${target} วินาที` : ""}`;
    const pronunciation=b.pronunciation ? `\n\nคำอ่านชื่อเฉพาะ\n${b.pronunciation}` : "";
    return `${publicAddress ? "ข้อความประชาสัมพันธ์พร้อมอ่าน" : "บทพากย์พร้อมบันทึกเสียง"}\n\nน้ำเสียง: ${style}\n\n${speech}${pronunciation}\n\n${timing}`.replace(/\n{3,}/g,"\n\n");
  }

  function postVideoScriptWriter(d={}, length="60 วินาที"){
    const b=contentBrain(d);
    const intent=postIntent(d);
    const facts=splitPoints(real(d.detail));
    const ideas=editorialExpansion(b,intent,creativeLevel(d));
    const opening=creativeHook(b,intent);
    const body=[...(facts.length ? facts : [b.detail]),...ideas].filter(Boolean).join(" ");
    const close=safePostClosing(b,intent,creativeLevel(d));
    const duration=targetSeconds(length);
    return `สคริปต์วิดีโอพร้อมนำไปผลิต\n\nความยาวเป้าหมาย: ${length}\n\nช่วงเปิด 0–${Math.min(5,duration)} วินาที\nภาพ: ภาพเปิดที่สื่อหัวข้อ “${b.title}” ได้ทันที\nบทพากย์: ${opening}\nข้อความบนจอ: ${b.title}\n\nช่วงเนื้อหา\nภาพ: ภาพกิจกรรมหรือภาพประกอบตามข้อมูลจริง เรียงจากภาพรวมสู่รายละเอียด\nบทพากย์: ${body}\nข้อความบนจอ: ${[b.date,b.place].filter(Boolean).join(" • ") || "ใช้เฉพาะข้อมูลสำคัญที่ยืนยันแล้ว"}\n\nช่วงปิด\nภาพ: ภาพสรุปบรรยากาศหรือภาพหน่วยงาน\nบทพากย์: ${close}\nข้อความบนจอ: ${b.org || b.title}`.replace(/\n{3,}/g,"\n\n");
  }

  function prWriter(d={}, options={}){
    const mode = real(options.channel) || real(d.channel) || "โพสต์ Facebook พร้อมเผยแพร่";
    const merged = Object.assign({}, d, {
      _postStrict:true,
      channel: real(options.platform) || real(d.channel),
      tone: real(options.delivery) || real(d.tone),
      workContext: real(options.purpose) || real(d.workContext),
      lockedFacts: real(options.lockedFacts) || real(d.lockedFacts),
      pronunciation: real(options.pronunciation) || real(d.pronunciation)
      ,creativity: real(options.creativity) || real(d.creativity) || "ช่วยคิดและแต่งให้สมบูรณ์"
    });
    const length = real(options.length) || "60 วินาที";
    if(/ให้ AI วิเคราะห์/.test(mode)){
      const resolved=resolvePostOutput(merged,options);
      if(resolved === "เนื้อหาตั้งต้นสำหรับโครงการ") return projectFoundationWriter(merged);
      const intent = detectIntent(merged, "post");
      const detail = `${merged.title || ""} ${merged.detail || ""} ${merged.workContext || ""}`;
      const platform=`${real(options.platform)} ${real(options.purpose)}`;
      const wantsAudio=/เสียงตามสาย|รถประชาสัมพันธ์|ประกาศเสียง|หอกระจายข่าว/.test(`${detail} ${platform}`);
      const wantsVideo=/YouTube|Reels|TikTok|วิดีโอ|วีดีโอ|คลิป/.test(`${detail} ${platform}`);
      const isCompleted=/สรุป|ผลการดำเนิน|ดำเนินงาน|ประธานเปิด|ร่วมกิจกรรม|เมื่อวันที่|ลงพื้นที่/.test(detail) || intent === "report";
      const isInvitation=/เชิญ|สมัคร|เข้าร่วม|เปิดรับ|กำหนดจัด/.test(detail) || intent === "invitation";
      if(wantsAudio) return postVoiceWriter(merged, length === "ให้ AI กำหนด" ? "60 วินาที" : length, "ประกาศชัดเจน ฟังเข้าใจในครั้งเดียว และวนซ้ำได้", true);
      if(wantsVideo && (isCompleted || isInvitation)) return postVideoScriptWriter(merged, length === "ให้ AI กำหนด" ? "60 วินาที" : length);
      if(resolved === "ข่าวประชาสัมพันธ์") return articleWriter(merged);
      return captionWriter(merged);
    }
    if(/สคริปต์วิดีโอ/.test(mode)) return postVideoScriptWriter(merged, length);
    if(/เสียงตามสาย|รถประชาสัมพันธ์/.test(mode)) return postVoiceWriter(merged, length, "ประกาศชัดเจน ฟังเข้าใจในครั้งเดียว และวนซ้ำได้", true);
    if(/บทพากย์|ทำเสียง/.test(mode)) return postVoiceWriter(merged, length, real(options.delivery) || "สุภาพ เป็นธรรมชาติ อ่านง่าย");
    if(/ข่าวประชาสัมพันธ์/.test(mode)) return articleWriter(merged);
    if(/แคปชั่น YouTube|Reels|TikTok/.test(mode)) return clipCaptionWriter(merged);
    if(/ครบชุด/.test(mode)){
      return `ชุดงานเขียนประชาสัมพันธ์พร้อมใช้\n\n=== 1. โพสต์ Facebook ===\n${captionWriter(merged)}\n\n=== 2. ข่าวประชาสัมพันธ์ ===\n${articleWriter(merged)}\n\n=== 3. บทพากย์ ===\n${postVoiceWriter(merged, length, real(options.delivery) || "สุภาพ เป็นธรรมชาติ อ่านง่าย")}\n\n=== 4. แคปชั่นคลิป ===\n${clipCaptionWriter(merged)}`;
    }
    return captionWriter(merged);
  }

  function supportingVariant(d={}, options={}){
    const mode = real(options.channel) || "";
    if(/สคริปต์วิดีโอ/.test(mode)) return clipCaptionWriter(d);
    if(/บทพากย์/.test(mode)) return captionWriter(d);
    if(/Facebook/.test(mode)) return postVoiceWriter(d, "30 วินาที", real(options.delivery) || "สุภาพ เป็นธรรมชาติ");
    if(/ข่าวประชาสัมพันธ์/.test(mode)) return captionWriter(d);
    return articleWriter(d);
  }

  function reviseWriting(text="", revision=""){
    const source = clean(text);
    if(!source) return "ยังไม่มีผลงานให้ปรับ กรุณาสร้างผลงานก่อน";
    if(revision === "shorter"){
      const paragraphs = source.split(/\n\s*\n/).filter(Boolean);
      return paragraphs.filter((_,i)=>i < 8).map(x=>clamp(x,220)).join("\n\n");
    }
    if(revision === "formal") return `ฉบับปรับเป็นทางการ\n\n${source.replace(/ครับ|ค่ะ|นะครับ|นะคะ/g, "").replace(/อยากให้/g,"ขอให้").replace(/ทุกคน/g,"ทุกท่าน")}`;
    if(revision === "natural") return `ฉบับอ่านเป็นธรรมชาติ\n\n${source.replace(/ดำเนินการ/g,"ทำ").replace(/ประชาชนทุกท่าน/g,"ทุกท่าน").replace(/ดังกล่าว/g,"นี้")}`;
    if(revision === "hook") return `ประโยคเปิดแนะนำ\nเรื่องสำคัญนี้เกี่ยวข้องกับคุณอย่างไร — อ่านรายละเอียดให้ครบก่อนตัดสินใจ\n\n${source}`;
    if(revision === "expand") return `${source}\n\nข้อมูลที่ควรเติมเพื่อขยายงานโดยไม่แต่งข้อเท็จจริง\n• สิ่งที่เกิดขึ้นหรือขั้นตอนของงาน\n• ผู้เกี่ยวข้องและบทบาทตามข้อมูลจริง\n• ผลที่เกิดขึ้นหรือประโยชน์ที่ตรวจสอบได้\n• วัน เวลา สถานที่ และช่องทางดำเนินการ หากเกี่ยวข้อง`;
    if(revision === "variant"){
      const paragraphs=source.split(/\n\s*\n/).filter(Boolean);
      return `อีกฉบับสำหรับเลือกใช้\n\n${paragraphs.length > 2 ? [paragraphs[1],paragraphs[0],...paragraphs.slice(2)].join("\n\n") : source}`;
    }
    if(revision === "thirtySeconds") return `ฉบับย่อประมาณ 30 วินาที\n\n${source.split(/\n\s*\n/).filter(Boolean).slice(0,5).map(x=>clamp(x,150)).join("\n\n")}`;
    if(revision === "threeMinutes") return `${source}\n\n[ช่วงขยายความ]\nเรียบเรียงคำเชื่อมและรายละเอียดจากข้อมูลจริงข้างต้นให้ต่อเนื่อง โดยตรวจชื่อ วัน เวลา สถานที่ และตัวเลขก่อนนำไปใช้`;
    if(revision === "toVoice") return `บทพากย์พร้อมอ่าน\n\n${source.replace(/\[(?:ภาพ|ข้อความบนจอ|เวลา)[^\]]*\][^\n]*/g,"").replace(/\n{3,}/g,"\n\n")}`;
    if(revision === "toCaption") return `แคปชั่นจากชิ้นงาน\n\n${source.split(/\n\s*\n/).filter(Boolean).slice(0,5).map(x=>clamp(x,180)).join("\n\n")}`;
    if(revision === "proofread") return `ฉบับตรวจทานภาษาแล้ว\n\n${source.replace(/[ \t]+\n/g,"\n").replace(/\s+([,.!?])/g,"$1").replace(/\n{3,}/g,"\n\n")}`;
    return source;
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
    const destination = real(d.videoDestination) || real(d.destination) || "ให้ AI เลือกตามงาน";
    const isCapCut = /capcut|แคปคัต/i.test(destination);
    const isVeo = /veo|flow/i.test(destination);
    const isRunway = /runway/i.test(destination);
    const isLuma = /luma/i.test(destination);
    const isHeyGen = /heygen/i.test(destination);
    const isPika = /pika/i.test(destination);
    const isKlingSeedance = /kling|seedance/i.test(destination);
    const destinationGuide = isVeo
      ? "Google Veo / Flow: ใช้ Short Prompt รายช็อตเป็นหลัก ใส่ภาพ การเคลื่อนไหว เสียงบรรยากาศ และบทพูดสั้นในช็อตเดียวได้"
      : isRunway
        ? "Runway: เน้นคุณภาพภาพ มุมกล้อง motion และ mood ให้ชัด เสียงพูด/ซับ/เพลงควรแยกไปทำใน CapCut"
        : isLuma
          ? "Luma: เหมาะกับทดลองหลายโมเดลและต่อช็อต ใช้ prompt สั้นชัด พร้อมภาพอ้างอิงถ้ามี แล้วแยกเสียงภายหลัง"
          : isHeyGen
            ? "HeyGen: ใช้ Character Dialogue เป็นสคริปต์ให้ avatar หรือ talking photo พูด ส่วน Short Prompt ใช้ทำ B-roll หรือฉากประกอบ"
            : isPika
              ? "Pika: เหมาะกับคลิปสั้น เอฟเฟกต์ และ social hook ให้ prompt กระชับมากและมี action เดียวต่อช็อต"
              : isKlingSeedance
                ? "Kling / Seedance: ใช้ prompt รายช็อตที่ชัดเรื่องตัวแบบ กล้อง และ motion เสียง/บทพูดควรแยกไปทำทีหลัง"
                : isCapCut
                  ? "CapCut: ใช้เป็นจุดรวมงาน ตัดต่อ ใส่เสียง ซับ เนื้อเพลง และบทพูดตัวละครจากบล็อกที่แยกไว้"
                  : "ให้ AI เลือกตามงาน: ถ้าเน้นภาพยนตร์ใช้แนว Runway/Luma, ถ้าต้องมีเสียงในฉากลอง Veo/Flow, ถ้าเป็นคนพูดเลือก HeyGen, แล้วจบงานใน CapCut";
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
      const characterDialogue = dialogueFor(message, idx);
      const destinationPrompt = isVeo
        ? `. เสียงในฉาก: ${characterDialogue || ttsLine(message)}. ambient audio สมจริง ไม่ใส่ข้อความบนภาพ`
        : isHeyGen
          ? `. ทำเป็นฉากพูด/ภาพประกอบสำหรับ avatar หรือ talking photo. สคริปต์พูด: ${characterDialogue || ttsLine(message)}`
          : isRunway
            ? ". สร้างเฉพาะภาพและ motion คุณภาพสูง ไม่ต้องสร้างเสียง ไม่ใส่ข้อความบนภาพ"
            : isLuma
              ? ". motion ชัด ต่อเนื่อง ใช้ภาพอ้างอิงถ้ามี ไม่ใส่ข้อความบนภาพ"
              : isPika
                ? ". action เดียวชัด ๆ จังหวะไว เหมาะคลิปสั้น ไม่ใส่ข้อความบนภาพ"
                : isKlingSeedance
                  ? ". ระบุ subject, camera, motion ชัด ใช้สำหรับ video generation รายช็อต ไม่ต้องสร้างเสียง"
                  : ". ใช้ภาพจากช็อตนี้ แล้วนำเสียง/ซับ/ข้อความไปใส่ในขั้นตัดต่อ";
      const aiPrompt = `สร้างช็อตวิดีโอ ${aspectRatio} สำหรับ ${destination} สไตล์ ${videoStyle}: ${visual}. กล้อง ${movement}${destinationPrompt}. ห้ามสร้างโลโก้ QR Code เบอร์โทร บุคคลจริง หรือข้อมูลที่ไม่มีในบรีฟ`;
      return {idx, duration, start, end, message, visual, movement, audio, transition, aiPrompt, characterDialogue};
    });
    const shortPromptFor = scene => {
      const destinationHint = isVeo
        ? ` | เสียงในช็อต: ${scene.characterDialogue || ttsLine(scene.message)}`
        : isHeyGen
          ? ` | ใช้คู่กับสคริปต์พูด: ${scene.characterDialogue || ttsLine(scene.message)}`
          : isRunway
            ? " | visual only, no generated speech"
            : isLuma
              ? " | motion ต่อเนื่อง ใช้ภาพอ้างอิงถ้ามี"
              : isPika
                ? " | action เดียว จังหวะไว"
                : isKlingSeedance
                  ? " | subject + camera + motion ชัด"
                  : "";
      return clamp(`SHOT ${String(scene.idx+1).padStart(2,"0")} | ปลายทาง: ${destination} | ${scene.duration} วินาที | ${aspectRatio} | ภาพ: ${scene.visual} | กล้อง: ${scene.movement} | สไตล์: ${videoStyle}${destinationHint} | ห้ามใส่ตัวหนังสือ โลโก้ คิวอาร์โค้ด เบอร์โทร บุคคลจริง หรือข้อมูลปลอม`, 650);
    };
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
ปลายทาง AI วิดีโอ: ${destination}
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

ปลายทางที่เลือก
• ${destinationGuide}

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
    clipCaptionWriter,
    prWriter,
    resolvePostOutput,
    isSparsePostBrief,
    projectFoundationWriter,
    supportingVariant,
    reviseWriting,
    mcWriter,
    videoWriter,
    voiceWriter,
    slideWriter,
    imageDirector,
    kitProducer
  };
  if(typeof module !== "undefined" && module.exports) module.exports = T.freeWritingTeam;
})(typeof globalThis !== "undefined" ? globalThis : window);

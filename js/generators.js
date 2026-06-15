window.TANJAI = window.TANJAI || {};
TANJAI.$ = s => document.querySelector(s);
TANJAI.$$ = s => Array.from(document.querySelectorAll(s));

TANJAI.commonData = function(prefix){
  const v = id => (TANJAI.$(`#${prefix}-${id}`)?.value || "").trim();
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
    avoid: v("avoid") || "ห้ามสร้าง QR Code ปลอม ห้ามวาดโลโก้ใหม่ ข้อความภาษาไทยต้องสะกดถูก"
  };
};

TANJAI.imagePrompt = function(d){
  return `สร้างภาพประชาสัมพันธ์ภาษาไทย หัวข้อ “${d.title}” สำหรับ ${d.orgName}
กลุ่มเป้าหมาย: ${d.audience}
ขนาดภาพ: ${d.size}
รายละเอียดสำคัญ: ${d.detail}
วันเวลา: ${d.dateTime || "ไม่ระบุ"}
สถานที่: ${d.place || "ไม่ระบุ"}
บุคคล/หน่วยงานที่เกี่ยวข้อง: ${d.people || "ไม่ระบุ"}

แนวภาพ: ${d.style}, โทน ${d.tone}, อ่านง่าย ทันสมัย มี visual hierarchy ชัดเจน หัวข้อหลักต้องเด่น รายละเอียดรองอ่านง่าย ไม่รก ใช้พื้นที่ว่างเหมาะสม เหมือนงานกราฟิกดีไซเนอร์มืออาชีพ

ข้อห้าม: ${d.avoid}`;
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
เสียงพากย์: ด้วยความห่วงใยจาก ${d.orgName}`;
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
  if(/เสียง|พากย์|voice|tts|อ่าน/.test(q)){ tool="เสียงพากย์"; view="voice"; why="โจทย์นี้เหมาะกับการทำสคริปต์เสียงและทดลองอ่าน"; }
  if(/สไลด์|powerpoint|presentation|นำเสนอ/.test(q)){ tool="ทำสไลด์"; view="deck"; why="โจทย์นี้ต้องการโครงนำเสนอและ speaker notes"; }
  if(/ครบชุด|แคมเปญ|ทั้งหมด|ภาพ.*โพสต์|โพสต์.*วิดีโอ/.test(q)){ tool="สร้างชุดสื่อ"; view="kit"; why="โจทย์นี้เหมาะกับการแตกงานออกเป็นหลายสื่อจากข้อมูลเดียว"; }
  const dest = view === "video" || view === "voice" ? "CapCut / เครื่องมือ TTS / ChatGPT" : view === "image" ? "ChatGPT / Canva / เครื่องมือสร้างภาพ" : view === "deck" ? "Canva / PowerPoint / ChatGPT" : "ChatGPT / Canva";
  return { view, text: `คำแนะนำจาก AI Router

โจทย์ของพี่:
${text}

เมนูที่แนะนำ:
${tool}

เหตุผล:
${why}

ผลลัพธ์ที่ควรสร้าง:
${tool === "สร้างภาพ" ? "Prompt ภาพ + คำสั่งนักออกแบบ" : tool === "เขียนโพสต์" ? "โพสต์หลัก + แคปชั่นสั้น + ข้อความ Line" : tool === "ทำวิดีโอ" ? "Hook + Storyboard + Voice Over + ข้อความบนจอ" : tool === "เสียงพากย์" ? "สคริปต์เสียง + ข้อความสำหรับ TTS + จังหวะอ่าน" : tool === "ทำสไลด์" ? "Outline + Speaker Notes" : "ภาพ + โพสต์ + วิดีโอ + เสียง + สไลด์"}

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

const TOOL_RULES = {
  image: "สร้าง Prompt ภาพและคำสั่งผลิตภาพประชาสัมพันธ์ที่พร้อมใช้ โดยแยกข้อความจริงบนภาพ ข้อห้าม และสิ่งที่ต้องให้ผู้ใช้เติม",
  post: "สร้างงานเขียนหรือโพสต์พร้อมเผยแพร่ตามช่องทางที่เลือก มีหัวเรื่อง เนื้อหา และคำเชิญชวนที่เหมาะสม",
  mc: "สร้างสคริปต์พิธีกรพร้อมอ่าน จัดลำดับพิธี คำเชื่อม จังหวะหยุด และคำกำกับเวทีอย่างชัดเจน",
  video: "สร้าง Video Production Pack พร้อมผลิต แบ่งฉาก ระบุภาพ บทพากย์ ข้อความบนจอ จังหวะเวลา Shot List และ AI Video Prompt รายช็อต",
  voice: "สร้างสคริปต์เสียงพากย์พร้อมอ่าน จัดจังหวะ เว้นวรรค คำเน้น อารมณ์ และควบคุมความยาว",
  deck: "สร้างโครงสไลด์ตามจำนวนหน้า ระบุหัวข้อ เนื้อหาบนสไลด์ และ Speaker Notes"
};

const SMART_FILL_POLICY = `V10 Smart AI Layer:
- ถ้าผู้ใช้กรอกข้อมูลน้อย ให้สร้างงานที่ใช้ต่อได้ทันทีจากบริบททั่วไปของงาน โดยไม่บ่นว่าข้อมูลน้อย
- AI เติมได้: hook, โครงเรื่อง, สำนวน, ประโยชน์ทั่วไป, มุมภาพ, mood, CTA แบบกลาง, ลำดับเนื้อหา, คำเชื่อม และตัวอย่างข้อความที่ไม่ใช่ข้อเท็จจริงเฉพาะ
- AI ห้ามเดา: ชื่อบุคคล ตำแหน่ง วัน เวลา สถานที่ ตัวเลข ราคา เบอร์โทร QR Code URL ชื่อหน่วยงานจริง โลโก้จริง ผลลัพธ์/สถิติ หรือข้อมูลราชการเฉพาะ
- ถ้าข้อมูลจริงที่จำเป็นขาด ให้ใส่ [กรุณาเติมข้อมูล...] เฉพาะจุดนั้น และยังต้องส่งงานฉบับพร้อมแก้ต่อ
- แยกส่วน "AI เติมให้อย่างปลอดภัย" และ "ข้อมูลที่ต้องยืนยัน" เมื่อเหมาะสม
- งานต้องดูขายได้ ใช้จริงได้ ภาษาไทยเป็นธรรมชาติ ไม่เหมือนคำตอบทดลอง`;

function json(data, status=200, origin=""){
  const headers = {"Content-Type":"application/json; charset=utf-8", "Vary":"Origin"};
  if(origin){
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
  }
  return new Response(JSON.stringify(data), {status, headers});
}

function allowedOrigin(request, env){
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "https://thanawid.github.io")
    .split(",").map(x=>x.trim()).filter(Boolean);
  return allowed.includes(origin) ? origin : "";
}

async function usageAllowed(request, env){
  if(!env.USAGE_KV) return {ok:true};
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const hash = [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,24);
  const day = new Date().toISOString().slice(0,10);
  const key = `usage:${day}:${hash}`;
  const used = Number(await env.USAGE_KV.get(key) || 0);
  const limit = Math.max(1, Number(env.DAILY_LIMIT || 10));
  if(used >= limit) return {ok:false, limit};
  await env.USAGE_KV.put(key, String(used + 1), {expirationTtl:172800});
  return {ok:true, remaining:Math.max(0, limit-used-1)};
}

function buildVideoPrompt(data = {}, options = {}){
  const destination = options.destination || data.videoDestination || data.destination || "ให้ AI เลือกตามงาน";
  const destinationGuide = /veo|flow/i.test(destination)
    ? "Google Veo / Flow: ให้ Short Prompt รวมภาพ การเคลื่อนไหว เสียงบรรยากาศ และบทพูดสั้นได้ในช็อตเดียว แต่ยังต้องแยกบล็อกเสียงไว้ใช้ต่อ"
    : /runway/i.test(destination)
      ? "Runway: ให้เน้น visual, camera, motion, lighting, style และแยกเสียง/ซับไปทำใน CapCut"
      : /luma/i.test(destination)
        ? "Luma: ให้ prompt รายช็อตสั้น ชัด ใช้ภาพอ้างอิงถ้ามี และแยกเสียงภายหลัง"
        : /heygen/i.test(destination)
          ? "HeyGen: ให้ Character Dialogue เป็นสคริปต์พูดของ avatar/talking photo และให้ Short Prompt เป็นฉากหรือ B-roll ประกอบ"
          : /pika/i.test(destination)
            ? "Pika: ให้ prompt กระชับมาก มี action เดียว เหมาะคลิปสั้นหรือเอฟเฟกต์ social"
            : /kling|seedance/i.test(destination)
              ? "Kling / Seedance: ให้ระบุ subject, camera, motion ชัดเจน และแยกเสียง/บทพูดไปทำทีหลัง"
              : /capcut|แคปคัต/i.test(destination)
                ? "CapCut: ให้แยก prompt ภาพ เสียงบรรยาย บทพูดตัวละคร และโน้ตตัดต่อให้ชัด"
                : "ให้ AI เลือกตามงาน: ถ้างานต้องการเสียงในฉากให้จัดแบบ Veo/Flow, ถ้าเน้นภาพให้จัดแบบ Runway/Luma, ถ้าคนพูดให้จัดแบบ HeyGen";
  return `คุณคือ Tanjai Video Studio: AI Video Creative Director, Storyboard Artist, Thai Copywriter และ Video Editor

ภารกิจ:
สร้าง Video Production Pack ภาษาไทยที่พร้อมนำไปผลิตต่อใน CapCut, ทีมตัดต่อ หรือเครื่องมือ AI Video

ข้อมูลตั้งต้น:
${JSON.stringify(data || {}, null, 2)}

ตัวเลือกงานวิดีโอ:
${JSON.stringify(options || {}, null, 2)}

ปลายทาง AI วิดีโอ:
${destination}

กติกาตามปลายทาง:
${destinationGuide}

กติกาสำคัญ:
- ห้ามแต่งชื่อบุคคล ตำแหน่ง วัน เวลา สถานที่ ตัวเลข โลโก้ QR Code เบอร์โทร หรือข้อเท็จจริงที่ผู้ใช้ไม่ได้ให้
- ถ้าข้อมูลสำคัญขาด ให้ใช้ [กรุณาเติมข้อมูล] เฉพาะจุดนั้น ไม่ต้องเดา
- ทุกซีนต้องมีหน้าที่ชัดเจนและเวลารวมพอดีกับความยาวที่เลือก
- ข้อความบนจอต้องสั้น อ่านทัน และเหมาะกับ safe area ของสัดส่วนภาพที่เลือก
- ถ้าเป็น MV เพลงหรือ Lyric Video ให้จัดจังหวะเนื้อเพลง/ข้อความตาม timecode และเน้นอ่านง่าย
- ถ้าเป็นนิทานเด็ก หนังสั้น หรือซีรีส์สั้น ให้มีโครงเรื่อง ต้น-กลาง-จบ และอารมณ์ของฉาก
- ถ้าเป็นโฆษณาหรือรีวิวสินค้า ให้ชัดเรื่องปัญหา คุณค่า หลักฐานที่มี และ CTA โดยไม่กล่าวเกินจริง
- ต้องมีบล็อก [SHORT_SHOT_PROMPTS] สำหรับคัดลอก prompt รายช็อตไปใช้ทีละช็อต โดยแต่ละช็อตไม่เกิน 650 ตัวอักษร
- ใน [SHORT_SHOT_PROMPTS] ให้ขึ้นต้นแต่ละช็อตด้วยปลายทางที่เลือก และปรับ prompt ให้เหมาะกับเครื่องมือนั้น
- ต้องมีบล็อก [CAPCUT_VOICE_SCRIPT] สำหรับคัดลอกเสียงพากย์/เนื้อเพลงไปใช้กับ CapCut โดยไม่มี timecode, SCENE, bullet, prompt, slash หรือคำกำกับภาพ
- ต้องมีบล็อก [CAPCUT_CHARACTER_DIALOGUE] สำหรับบทพูดตัวละครเท่านั้น ถ้าไม่มีตัวละครให้ใส่บทสนทนาสั้นแบบคนถาม-คนตอบตามบรีฟ ห้ามใส่คำกำกับภาพ และควรคัดลอกทีละบรรทัดไปใส่เสียงตัวละคร
- แปลงคำอังกฤษในบล็อกเสียงให้อ่านไทย เช่น AI=เอไอ, MV=เอ็มวี, TikTok=ติ๊กต็อก, Reels=รีลส์, YouTube=ยูทูบ, CapCut=แคปคัต, QR Code=คิวอาร์โค้ด
- ส่งกลับเฉพาะผลงานสุดท้าย ห้ามใช้ Markdown code fence

รูปแบบผลลัพธ์ที่ต้องส่งออก:
1. Project Setup: รูปแบบงาน ช่องทาง สัดส่วนภาพ สไตล์ ความยาว ปลายทาง AI วิดีโอ และเป้าหมาย
2. Core Message + Viewer Promise
3. Hook 3 แบบ พร้อมเลือก 1 แบบที่แนะนำ
4. Short Prompt รายช็อต ครอบด้วย [SHORT_SHOT_PROMPTS] และ [/SHORT_SHOT_PROMPTS]
5. CapCut Voice/Lyric Clean Script ครอบด้วย [CAPCUT_VOICE_SCRIPT] และ [/CAPCUT_VOICE_SCRIPT]
6. CapCut Character Dialogue Clean Script ครอบด้วย [CAPCUT_CHARACTER_DIALOGUE] และ [/CAPCUT_CHARACTER_DIALOGUE]
7. Storyboard Table คอลัมน์: Timecode | Duration | Visual/Shot | Voice Over หรือ Lyric | Character Dialogue | On-screen Text | Audio/SFX | Transition | AI Video Prompt
8. Shot List: Must-have / Nice-to-have / B-roll สำรอง
9. CapCut / Editing Notes: subtitle, safe area, rhythm, color mood, transition
10. AI Video Prompt Pack รายช็อตแบบละเอียด
11. Fact/Asset Checklist ก่อนผลิต`;
}

function buildPrompt(tool, data, options){
  if(tool === "video") return buildVideoPrompt(data, options);
  const job = TOOL_RULES[tool];
  return `คุณคือทีมบรรณาธิการภาษาไทยมืออาชีพของทันใจ AI Studio

ภารกิจ: ${job}

${SMART_FILL_POLICY}

กติกาสำคัญ:
- วิเคราะห์ข้อมูลคร่าว ๆ แล้วเรียบเรียงเป็นผลงานสำเร็จพร้อมใช้ ไม่ต้องอธิบายวิธีคิด
- ใช้ภาษาไทยเป็นธรรมชาติ เหมาะกับผู้ฟังและช่องทาง
- ห้ามแต่งชื่อบุคคล ตำแหน่ง วัน เวลา สถานที่ ตัวเลข หรือข้อเท็จจริงที่ผู้ใช้ไม่ได้ให้
- หากข้อมูลสำคัญขาด ให้ใส่ [กรุณาเติมข้อมูล] เฉพาะจุดนั้น
- ปฏิบัติตามความยาว รูปแบบ โทน และสิ่งที่ต้องการเน้นจากตัวเลือก
- ส่งกลับเฉพาะผลงานสุดท้าย ห้ามใช้ Markdown code fence

ประเภทงาน: ${tool}
ตัวเลือกของผู้ใช้:
${JSON.stringify(options || {}, null, 2)}

ข้อมูลที่ผู้ใช้กรอก:
${JSON.stringify(data || {}, null, 2)}`;
}

function buildImageGenerationPrompt(body = {}){
  const data = body.data || {};
  const prompt = String(body.prompt || data.prompt || "").trim();
  const title = data.title || data.topic || "";
  const detail = data.detail || "";
  const size = body.options?.size || data.size || data.channel || "Facebook / Line Post";
  const style = data.visualPreset || data.style || "Thai PR Premium, clean, readable";
  const textOnImage = data.textOnImage || title || "[กรุณาเติมหัวข้อจริง]";
  return `สร้างภาพประชาสัมพันธ์พร้อมใช้สำหรับ Tanjai AI Studio

${SMART_FILL_POLICY}

โจทย์ภาพ:
- หัวข้อ: ${title || "[กรุณาเติมหัวข้อจริง]"}
- รายละเอียด: ${detail || "ให้ AI จัดองค์ประกอบทั่วไปที่ไม่เดาข้อเท็จจริงเฉพาะ"}
- ช่องทาง/ขนาด: ${size}
- แนวภาพ: ${style}
- ข้อความหลักบนภาพ: ${textOnImage}

Prompt จากหน้าเว็บ:
${prompt || "[ใช้โจทย์ภาพด้านบนเป็นหลัก]"}

ข้อกำชับ:
- ภาพต้องเป็นงานประชาสัมพันธ์ที่ดูพร้อมใช้งานจริง ไม่ใช่ mockup ลอย ๆ
- ถ้าไม่มีโลโก้จริง ให้เว้นพื้นที่สำหรับโลโก้ ห้ามสร้างโลโก้ปลอม
- ห้ามใส่ QR Code เบอร์โทร URL วันเวลา สถานที่ หรือชื่อคนที่ผู้ใช้ไม่ได้ให้
- ภาษาไทยบนภาพต้องอ่านง่าย สั้น และไม่สะกดผิด
- องค์ประกอบต้องเหมาะกับมือถือ มีพื้นที่หายใจ ไม่แน่นเกินไป`;
}

function imageResponseFormat(body = {}){
  const text = `${body.options?.size || body.data?.size || body.data?.channel || ""}`;
  let aspect = "1:1";
  if(/9:16|แนวตั้ง|story|reels|tiktok|shorts/i.test(text)) aspect = "9:16";
  else if(/16:9|แนวนอน|youtube|banner/i.test(text)) aspect = "16:9";
  else if(/4:5|โพสต์|feed/i.test(text)) aspect = "4:5";
  return {type:"image", mime_type:"image/jpeg", aspect_ratio:aspect, image_size:"2K"};
}

function findGeneratedImage(value){
  if(!value || typeof value !== "object") return null;
  const direct = value.output_image || value.outputImage || value.generated_image || value.generatedImage;
  if(direct?.data) return {data:direct.data, mimeType:direct.mime_type || direct.mimeType || "image/jpeg"};
  if(value.data && (value.mime_type || value.mimeType || value.type === "image")){
    return {data:value.data, mimeType:value.mime_type || value.mimeType || "image/jpeg"};
  }
  for(const key of Object.keys(value)){
    const found = findGeneratedImage(value[key]);
    if(found) return found;
  }
  return null;
}

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    if(request.method === "GET" && url.pathname === "/") return json({ok:true, service:"Tanjai AI Worker"});

    const origin = allowedOrigin(request, env);
    if(request.method === "OPTIONS"){
      return origin ? new Response(null, {status:204, headers:{
        "Access-Control-Allow-Origin":origin,
        "Access-Control-Allow-Headers":"Content-Type",
        "Access-Control-Allow-Methods":"POST, OPTIONS",
        "Access-Control-Max-Age":"86400",
        "Vary":"Origin"
      }}) : json({error:"Origin ไม่ได้รับอนุญาต"}, 403);
    }
    const isGenerate = request.method === "POST" && url.pathname === "/generate";
    const isGenerateImage = request.method === "POST" && url.pathname === "/generate-image";
    if(!isGenerate && !isGenerateImage) return json({error:"Not found"}, 404, origin);
    if(!origin) return json({error:"เว็บไซต์นี้ไม่ได้รับอนุญาตให้เรียก AI"}, 403);
    if(!env.GEMINI_API_KEY) return json({error:"ยังไม่ได้ตั้งค่า GEMINI_API_KEY"}, 503, origin);

    const length = Number(request.headers.get("Content-Length") || 0);
    if(length > (isGenerateImage ? 200000 : 40000)) return json({error:"ข้อมูลยาวเกินกำหนด"}, 413, origin);

    let body;
    try{ body = await request.json(); }
    catch(_){ return json({error:"รูปแบบข้อมูลไม่ถูกต้อง"}, 400, origin); }

    const usage = await usageAllowed(request, env);
    if(!usage.ok) return json({error:`ครบโควตา AI ${usage.limit} ครั้งต่อวันแล้ว กรุณาลองใหม่วันพรุ่งนี้`}, 429, origin);

    if(isGenerateImage){
      const imageModel = String(env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image");
      const imageResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method:"POST",
        headers:{"Content-Type":"application/json", "x-goog-api-key":env.GEMINI_API_KEY},
        body:JSON.stringify({
          model:imageModel,
          input:[{type:"text", text:buildImageGenerationPrompt(body)}],
          response_format:imageResponseFormat(body)
        })
      });
      const imageResult = await imageResponse.json().catch(()=>({}));
      if(!imageResponse.ok){
        console.error("Gemini image error", imageResponse.status, imageResult?.error?.message || "unknown");
        return json({error:"AI สร้างภาพยังไม่พร้อมใช้งาน กรุณาใช้ Prompt ภาพแทนก่อน"}, 502, origin);
      }
      const generated = findGeneratedImage(imageResult);
      if(!generated?.data) return json({error:"AI ไม่ได้ส่งไฟล์ภาพกลับมา"}, 502, origin);
      return json({
        imageBase64:generated.data,
        mimeType:generated.mimeType || "image/jpeg",
        source:"gemini-image",
        model:imageModel,
        remaining:usage.remaining
      }, 200, origin);
    }

    const tool = String(body.tool || "");
    if(!TOOL_RULES[tool]) return json({error:"ไม่รองรับประเภทงานนี้"}, 400, origin);

    const model = String(env.GEMINI_MODEL || "gemini-2.5-flash-lite");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const aiResponse = await fetch(apiUrl, {
      method:"POST",
      headers:{"Content-Type":"application/json", "x-goog-api-key":env.GEMINI_API_KEY},
      body:JSON.stringify({
        contents:[{role:"user", parts:[{text:buildPrompt(tool, body.data, body.options)}]}],
        generationConfig:{temperature:0.55, maxOutputTokens:4096}
      })
    });
    const result = await aiResponse.json().catch(()=>({}));
    if(!aiResponse.ok){
      console.error("Gemini error", aiResponse.status, result?.error?.message || "unknown");
      return json({error:"AI ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง"}, 502, origin);
    }
    const text = (result.candidates?.[0]?.content?.parts || []).map(part=>part.text || "").join("").trim();
    if(!text) return json({error:"AI ไม่ได้ส่งผลงานกลับมา"}, 502, origin);
    return json({text, source:"gemini", remaining:usage.remaining}, 200, origin);
  }
};

const TOOL_RULES = {
  post: `สร้างงานเขียนหรือโพสต์พร้อมเผยแพร่ตามช่องทางที่เลือก
โครงสร้าง: พาดหัวที่ดึงดูดและตรงกับเนื้องานจริง → เนื้อหาที่เล่าจากข้อมูลที่ให้มา → รายละเอียดสำคัญ (วัน เวลา สถานที่ ถ้ามี) → คำเชิญชวนที่เหมาะกับประเภทงาน
- โพสต์ Facebook ของหน่วยงานท้องถิ่น: ภาษาอบอุ่น เป็นกันเอง แต่น่าเชื่อถือ ใส่อีโมจิพอประมาณถ้าโทนอนุญาต
- แฮชแท็กให้สร้างจากชื่องานและพื้นที่จริงเท่านั้น`,
  mc: `สร้างสคริปต์พิธีกรพร้อมอ่านออกเสียงจริงบนเวที
โครงสร้าง: เกริ่นต้อนรับ → แจ้งกำหนดการ → เชื่อมแต่ละช่วง → ปิดท้าย
- ระบุ [จังหวะหยุด] [รอเสียงปรบมือ] และคำกำกับเวทีในวงเล็บเหลี่ยม
- ภาษาพูดที่ไหลลื่นเมื่ออ่านออกเสียง ไม่ใช่ภาษาเขียน
- งานพิธีทางศาสนาหรือพิธีการ ให้ใช้ระดับภาษาที่ถูกต้องตามธรรมเนียม เช่น คำราชาศัพท์เมื่อจำเป็น คำเรียกพระสงฆ์ที่ถูกต้อง (นิมนต์ ไม่ใช่ เชิญ)`,
  video: `สร้างบทวิดีโอพร้อมส่งกองถ่ายหรือคนตัดต่อ
โครงสร้าง: Hook 3 วินาทีแรกที่หยุดนิ้วคนดูได้ → แบ่งฉากพร้อมระบุ [ภาพที่เห็น] [บทพากย์] [ข้อความบนจอ] [ความยาวโดยประมาณ] ของแต่ละฉาก → ฉากปิดพร้อม Call-to-action
- Hook ต้องมาจากจุดเด่นจริงของงานนั้น ไม่ใช่ประโยคกลาง ๆ ที่ใช้กับงานไหนก็ได้`,
  voice: `สร้างสคริปต์เสียงพากย์ที่อ่านออกเสียงได้ทันที
- จัดจังหวะด้วยการเว้นวรรคและขึ้นบรรทัดตามลมหายใจคนอ่านจริง
- ระบุ [เน้นเสียง] [เว้นจังหวะ] ตรงจุดที่ต้องการ
- เขียนคำอ่านกำกับตัวเลข วันที่ และคำเฉพาะ เช่น 27 ก.ค. → "ยี่สิบเจ็ดกรกฎาคม"
- ความยาวต้องสอดคล้องเวลาที่กำหนด (พูดปกติ ~150 คำ/นาที)
- โทนเสียงต้องตรงประเภทงาน: งานบุญ = อบอุ่นศรัทธา, งานราชการ = สุภาพหนักแน่น, งานอีเวนต์ = สดใสมีพลัง`,
  deck: `สร้างโครงสไลด์ตามจำนวนหน้าที่กำหนดเป๊ะ ๆ
แต่ละหน้า: หมายเลขหน้า → หัวข้อสั้นกระชับ → Bullet เนื้อหาบนสไลด์ (ไม่เกิน 5 ข้อ ข้อละไม่เกิน 12 คำ) → Speaker Notes เป็นภาษาพูดสำหรับผู้บรรยาย
- เรียงลำดับเรื่องให้มีตรรกะ: เปิดประเด็น → เนื้อหา → สรุป/ขั้นตอนถัดไป`,
  album: `สร้างแคปชั่นโพสต์ Facebook สำหรับอัลบั้มภาพ จำนวน 3 แบบให้เลือก
กติกาเฉพาะงานนี้ (สำคัญมาก):
- ส่งกลับ 3 แคปชั่น คั่นแต่ละแบบด้วยบรรทัดที่มีเพียง ----- (ขีด 5 ตัว) เท่านั้น ห้ามใส่หัวข้อ "แบบที่ 1" หรือคำอธิบายใด ๆ
- แบบที่ 1: ตามสไตล์ที่ผู้ใช้เลือก (ดูใน options.captionStyle) ครบประเด็น พร้อมโพสต์
- แบบที่ 2: อบอุ่น เข้าถึงง่าย เหมือนแอดมินเพจคุยกับลูกเพจ
- แบบที่ 3: สั้นกระชับ ไม่เกิน 3-4 บรรทัด เน้นประเด็นเดียวที่แรงที่สุด
- ทุกแบบ: ใส่วัน เวลา สถานที่ (ถ้ามีข้อมูล) ใช้อีโมจินำหน้าอย่างเหมาะสมกับประเภทงาน ปิดท้ายด้วยแฮชแท็กจากชื่องาน/หน่วยงาน/พื้นที่จริงเท่านั้น 2-4 แท็ก
- ห้ามบรรยายรูปภาพที่มองไม่เห็น ห้ามแต่งข้อเท็จจริงเพิ่ม`
};

const CONTEXT_INTELLIGENCE = `ขั้นตอนที่ 1 — วิเคราะห์ประเภทงานก่อนเขียน (ห้ามข้าม):
อ่านข้อมูลที่ผู้ใช้กรอกแล้วระบุให้ได้ว่างานนี้คืองานประเภทไหน แล้วปรับภาษา คำเชิญชวน และมุมมองให้ตรงประเภทนั้น:
- งานบุญ/ประเพณี/ศาสนา (เช่น แห่เทียนพรรษา ทอดกฐิน สงกรานต์ ลอยกระทง): เชิญชวน "ร่วมสืบสานประเพณี" "ร่วมทำบุญ" "ร่วมขบวนแห่" ใช้คำที่ถูกต้องตามพุทธศาสนา เช่น ถวายเทียนพรรษา เวียนเทียน ฟังพระธรรมเทศนา — ห้ามใช้ภาษาประชุมราชการอย่าง "รับฟังข้อมูล" "ร่วมขับเคลื่อนกิจกรรม" กับงานประเภทนี้เด็ดขาด
- งานราชการ/ประชุม/ประชาคม: ภาษาทางการ ชัดเจน เน้นสิทธิและประโยชน์ที่ประชาชนจะได้รับ
- งานอีเวนต์/เทศกาล/ตลาดนัด: ภาษาสนุก มีพลัง เน้นสิ่งที่จะได้เจอในงาน
- งานขาย/โปรโมทสินค้า: เน้นจุดเด่น ราคา โปรโมชัน และการตัดสินใจซื้อ
- งานแจ้งข่าว/ประกาศ: กระชับ ตรงประเด็น ใครต้องทำอะไร เมื่อไหร่ ที่ไหน

ขั้นตอนที่ 2 — เขียนโดยยึดข้อมูลจริง:
ทุกประโยคต้องเชื่อมโยงกับข้อมูลที่ผู้ใช้กรอกมาจริง ห้ามใช้ประโยคสำเร็จรูปที่นำไปแปะงานไหนก็ได้ ถ้าประโยคใดลบชื่องานออกแล้วยังใช้กับงานอื่นได้ทุกงาน แปลว่าประโยคนั้นกว้างเกินไป ให้เขียนใหม่`;

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

async function tryOpenRouter(prompt, env){
  // AI สำรองต่างค่าย — ทำงานเฉพาะเมื่อตั้ง OPENROUTER_API_KEY ไว้ ถ้ายังไม่ตั้งจะข้ามเงียบ ๆ
  if(!env.OPENROUTER_API_KEY) return null;
  try{
    const model = String(env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free");
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":"https://thanawid.github.io",
        "X-Title":"Tanjai AI Studio"
      },
      body:JSON.stringify({model, messages:[{role:"user", content:prompt}], max_tokens:4096, temperature:0.7})
    });
    if(!resp.ok){
      const err = await resp.json().catch(()=>({}));
      console.error("OpenRouter error", resp.status, err?.error?.message || "unknown");
      return null;
    }
    const data = await resp.json().catch(()=>null);
    const text = String(data?.choices?.[0]?.message?.content || "").trim();
    return text || null;
  }catch(e){
    console.error("OpenRouter fetch failed");
    return null;
  }
}

function buildPrompt(tool, data, options){
  const job = TOOL_RULES[tool];
  return `คุณคือทีมครีเอทีฟและบรรณาธิการภาษาไทยมืออาชีพของทันใจ AI Studio เชี่ยวชาญงานสื่อสารของหน่วยงานท้องถิ่น งานประเพณีไทย งานราชการ และงานธุรกิจ

${CONTEXT_INTELLIGENCE}

ภารกิจของงานชิ้นนี้:
${job}

กติกาสำคัญ:
- ส่งกลับเฉพาะผลงานสำเร็จพร้อมใช้ ไม่ต้องอธิบายวิธีคิด ไม่ต้องบอกว่าวิเคราะห์ได้ประเภทไหน
- ห้ามแต่งชื่อบุคคล ตำแหน่ง วัน เวลา สถานที่ ตัวเลข หรือข้อเท็จจริงที่ผู้ใช้ไม่ได้ให้
- หากข้อมูลสำคัญขาด ให้ใส่ [กรุณาเติมข้อมูล] เฉพาะจุดนั้น
- ปฏิบัติตามความยาว รูปแบบ โทน และสิ่งที่ต้องการเน้นจากตัวเลือกของผู้ใช้อย่างเคร่งครัด
- ห้ามใช้ Markdown code fence

ประเภทงาน: ${tool}
ตัวเลือกของผู้ใช้:
${JSON.stringify(options || {}, null, 2)}

ข้อมูลที่ผู้ใช้กรอก:
${JSON.stringify(data || {}, null, 2)}`;
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
    if(request.method !== "POST" || url.pathname !== "/generate") return json({error:"Not found"}, 404, origin);
    if(!origin) return json({error:"เว็บไซต์นี้ไม่ได้รับอนุญาตให้เรียก AI"}, 403);
    if(!env.GEMINI_API_KEY) return json({error:"ยังไม่ได้ตั้งค่า GEMINI_API_KEY"}, 503, origin);

    const length = Number(request.headers.get("Content-Length") || 0);
    if(length > 40000) return json({error:"ข้อมูลยาวเกินกำหนด"}, 413, origin);

    let body;
    try{ body = await request.json(); }
    catch(_){ return json({error:"รูปแบบข้อมูลไม่ถูกต้อง"}, 400, origin); }
    const tool = String(body.tool || "");
    if(!TOOL_RULES[tool]) return json({error:"ไม่รองรับประเภทงานนี้"}, 400, origin);

    const usage = await usageAllowed(request, env);
    if(!usage.ok) return json({error:`ครบโควตา AI ${usage.limit} ครั้งต่อวันแล้ว กรุณาลองใหม่วันพรุ่งนี้`}, 429, origin);

    const primaryModel = String(env.GEMINI_MODEL || "gemini-2.5-flash");
    const fallbackModel = String(env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite");
    const fallbackModel2 = String(env.GEMINI_FALLBACK_MODEL_2 || "gemini-2.0-flash");
    // ลำดับการลอง: โมเดลหลัก 2 ครั้ง → สำรอง 1 → สำรอง 2 (กัน 503 ช่วงคนใช้เยอะ)
    const attempts = [primaryModel, primaryModel, fallbackModel, fallbackModel, fallbackModel2];
    const prompt = buildPrompt(tool, body.data, body.options);

    let result = {}, aiResponse = null, lastStatus = 0;
    for(let i = 0; i < attempts.length; i++){
      const model = attempts[i];
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      aiResponse = await fetch(apiUrl, {
        method:"POST",
        headers:{"Content-Type":"application/json", "x-goog-api-key":env.GEMINI_API_KEY},
        body:JSON.stringify({
          contents:[{role:"user", parts:[{text:prompt}]}],
          generationConfig:{temperature:0.7, maxOutputTokens:4096}
        })
      });
      result = await aiResponse.json().catch(()=>({}));
      if(aiResponse.ok) break;
      lastStatus = aiResponse.status;
      console.error(`Gemini error (model=${model}, attempt=${i+1})`, aiResponse.status, result?.error?.message || "unknown");
      // 503 = โมเดลคนใช้เยอะชั่วคราว, 429 = ติด rate limit ชั่วคราว → รอสั้น ๆ แล้วลองตัวถัดไป
      if(aiResponse.status === 503 || aiResponse.status === 429){
        if(i < attempts.length - 1) await new Promise(r => setTimeout(r, 700));
        continue;
      }
      break; // error อื่น (เช่น key ผิด) ลองซ้ำไปก็ไม่หาย หยุดเลย
    }
    if(!aiResponse || !aiResponse.ok){
      // ด่านสุดท้าย: AI สำรองผ่าน OpenRouter (คนละค่าย คนละโควตากับ Google)
      const orText = await tryOpenRouter(prompt, env);
      if(orText) return json({text:orText, source:"openrouter", remaining:usage.remaining}, 200, origin);
      const busy = lastStatus === 503 || lastStatus === 429;
      return json({error: busy ? "AI มีผู้ใช้หนาแน่นชั่วคราว กรุณาลองใหม่ในอีกสักครู่" : "AI ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง"}, 502, origin);
    }
    const text = (result.candidates?.[0]?.content?.parts || []).map(part=>part.text || "").join("").trim();
    if(!text) return json({error:"AI ไม่ได้ส่งผลงานกลับมา"}, 502, origin);
    return json({text, source:"gemini", remaining:usage.remaining}, 200, origin);
  }
};


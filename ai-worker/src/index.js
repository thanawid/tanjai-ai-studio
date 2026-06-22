const TOOL_RULES = {
  post: "สร้างงานเขียนหรือโพสต์พร้อมเผยแพร่ตามช่องทางที่เลือก มีหัวเรื่อง เนื้อหา และคำเชิญชวนที่เหมาะสม",
  mc: "สร้างสคริปต์พิธีกรพร้อมอ่าน จัดลำดับพิธี คำเชื่อม จังหวะหยุด และคำกำกับเวทีอย่างชัดเจน",
  video: "สร้างบทวิดีโอพร้อมผลิต แบ่งฉาก ระบุภาพ บทพากย์ ข้อความบนจอ และจังหวะเวลา",
  voice: "สร้างสคริปต์เสียงพากย์พร้อมอ่าน จัดจังหวะ เว้นวรรค คำเน้น อารมณ์ และควบคุมความยาว",
  deck: "สร้างโครงสไลด์ตามจำนวนหน้า ระบุหัวข้อ เนื้อหาบนสไลด์ และ Speaker Notes"
};

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

function buildPrompt(tool, data, options){
  const job = TOOL_RULES[tool];
  return `คุณคือทีมบรรณาธิการภาษาไทยมืออาชีพของทันใจ AI Studio

ภารกิจ: ${job}

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


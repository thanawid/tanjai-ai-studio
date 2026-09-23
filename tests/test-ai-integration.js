const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {pathToFileURL} = require("url");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const client = fs.readFileSync(path.join(root, "js", "ai-client.js"), "utf8");
const worker = fs.readFileSync(path.join(root, "ai-worker", "src", "index.js"), "utf8");
const ui = fs.readFileSync(path.join(root, "js", "ui.js"), "utf8");

assert.match(index, /js\/ai-config\.js/);
assert.match(index, /js\/ai-client\.js/);
for(const tool of ["post", "mc", "video", "voice", "deck"]){
  assert.match(app, new RegExp(`tool:"${tool}"`));
}
assert.match(client, /\/generate/);
assert.match(client, /\/generate-image/);
assert.match(client, /generateImageWithAI/);
assert.match(client, /source:"fallback"/);
assert.match(worker, /GEMINI_API_KEY/);
assert.match(worker, /GEMINI_IMAGE_MODEL/);
assert.match(worker, /ALLOWED_ORIGINS/);
assert.match(worker, /USAGE_KV/);
assert.match(worker, /นโยบายช่วยคิดอย่างปลอดภัย/);
assert.match(worker, /ผู้กำกับศิลป์และนักออกแบบสื่อประชาสัมพันธ์/);
assert.match(worker, /นักเขียนบทพิธีกรและผู้กำกับเวที/);
assert.match(worker, /นักเขียนบทเสียงและผู้กำกับการอ่านภาษาไทย/);
assert.match(worker, /นักวางโครงเรื่องงานนำเสนอและบรรณาธิการสไลด์/);
assert.match(worker, /ผู้อำนวยการสื่อสารและหัวหน้าทีมผู้เชี่ยวชาญ/);
assert.match(worker, /AI เติมได้/);
assert.match(worker, /AI ห้ามเดา/);
assert.match(worker, /\/generate-image/);
assert.match(worker, /generativelanguage\.googleapis\.com\/v1beta\/interactions/);
assert.match(worker, /gemini-3\.1-flash-image/);
assert.match(worker, /output_image/);
assert.match(worker, /CAPCUT_CHARACTER_DIALOGUE/);
assert.match(worker, /ปลายทาง AI วิดีโอ/);
assert.match(worker, /Google Veo \/ Flow/);
assert.match(worker, /OPENROUTER_API_KEY/);
assert.match(worker, /openrouter\/auto/);
assert.match(worker, /tryOpenRouterAttachments/);
assert.match(worker, /openrouter-file-analysis/);
assert.match(worker, /ระบบบริบทของทันใจ/);
assert.match(worker, /currentTask_over_projectContext|บริบทงานปัจจุบันมีลำดับสูงสุด/);
assert.match(ui, /บริบทโครงการร่วม/);
assert.match(app, /tanjaiSharedProjectContextV1263/);
assert.match(app, /data\.sharedContext/);
assert.match(app, /ไม่เชื่อมเข้ากับเมนูสร้างภาพและแต่งภาพ/);
assert.doesNotMatch(index, /GEMINI_API_KEY\s*=/);
assert.doesNotMatch(client, /AIza[0-9A-Za-z_-]{20,}/);

(async()=>{
  const moduleUrl = `${pathToFileURL(path.join(root, "ai-worker", "src", "index.js")).href}?fallback-test=1`;
  const workerModule = await import(moduleUrl);
  const originalFetch = global.fetch;
  global.fetch = async (url, init={}) => {
    if(String(url).includes("generativelanguage.googleapis.com")){
      return new Response(JSON.stringify({error:{message:"quota"}}), {status:429, headers:{"Content-Type":"application/json"}});
    }
    const body = JSON.parse(String(init.body || "{}"));
    const content = body.messages?.[0]?.content;
    const text = Array.isArray(content)
      ? JSON.stringify({title:"หัวข้อจริง",organization:"",dateTime:"",place:"",people:[],summary:"ข้อมูลจริง",schedule:[],lockedFacts:["หัวข้อจริง"],uncertain:[]})
      : "ผลงานจากระบบสำรอง";
    return new Response(JSON.stringify({choices:[{message:{content:text}}]}), {status:200, headers:{"Content-Type":"application/json"}});
  };
  const env = {GEMINI_API_KEY:"test", OPENROUTER_API_KEY:"test", ALLOWED_ORIGINS:"https://thanawid.github.io"};
  try{
    const writingRequest = new Request("https://worker.example/generate", {
      method:"POST", headers:{"Origin":"https://thanawid.github.io","Content-Type":"application/json"},
      body:JSON.stringify({tool:"post",data:{title:"หัวข้อจริง"},options:{}})
    });
    const writingResponse = await workerModule.default.fetch(writingRequest, env);
    const writingPayload = await writingResponse.json();
    assert.strictEqual(writingResponse.status, 200);
    assert.strictEqual(writingPayload.source, "openrouter");

    const fileRequest = new Request("https://worker.example/analyze-post-attachments", {
      method:"POST", headers:{"Origin":"https://thanawid.github.io","Content-Type":"application/json"},
      body:JSON.stringify({attachments:[{name:"facts.txt",mimeType:"text/plain",text:"หัวข้อจริง"}]})
    });
    const fileResponse = await workerModule.default.fetch(fileRequest, env);
    const filePayload = await fileResponse.json();
    assert.strictEqual(fileResponse.status, 200);
    assert.strictEqual(filePayload.source, "openrouter-file-analysis");
    assert.strictEqual(filePayload.analysis.title, "หัวข้อจริง");
  }finally{
    global.fetch = originalFetch;
  }
  console.log(JSON.stringify({tools:5, secureWorker:true, imageRoute:true, smartLayer:true, providerFallback:true, fallbackExecution:true, sharedContext:true, status:"PASS"}, null, 2));
})().catch(error=>{ console.error(error); process.exitCode=1; });

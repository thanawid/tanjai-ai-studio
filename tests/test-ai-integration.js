const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const client = fs.readFileSync(path.join(root, "js", "ai-client.js"), "utf8");
const worker = fs.readFileSync(path.join(root, "ai-worker", "src", "index.js"), "utf8");

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
assert.match(worker, /V10 Smart AI Layer/);
assert.match(worker, /AI เติมได้/);
assert.match(worker, /AI ห้ามเดา/);
assert.match(worker, /\/generate-image/);
assert.match(worker, /generativelanguage\.googleapis\.com\/v1beta\/interactions/);
assert.match(worker, /gemini-3\.1-flash-image/);
assert.match(worker, /output_image/);
assert.match(worker, /CAPCUT_CHARACTER_DIALOGUE/);
assert.match(worker, /ปลายทาง AI วิดีโอ/);
assert.match(worker, /Google Veo \/ Flow/);
assert.doesNotMatch(index, /GEMINI_API_KEY\s*=/);
assert.doesNotMatch(client, /AIza[0-9A-Za-z_-]{20,}/);

console.log(JSON.stringify({tools:5, secureWorker:true, imageRoute:true, smartLayer:true, fallback:true, status:"PASS"}, null, 2));

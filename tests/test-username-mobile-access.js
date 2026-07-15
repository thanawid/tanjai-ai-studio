const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root,"index.html"),"utf8");
const app = fs.readFileSync(path.join(root,"js","app.js"),"utf8");
const proofread = fs.readFileSync(path.join(root,"js","proofread.js"),"utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));

assert.strictEqual(pkg.version, "10.0.0");
assert.match(index, /V10\.0\.0/);
assert.match(index, /v=10\.0\.0/);
assert.match(index, /id="sidebarLogoutBtn"/);
assert.match(index, /id="openProofreadNav"/);
assert.match(app, /<select id="image-specialist" hidden/);
assert.doesNotMatch(app, /<label>ผู้เชี่ยวชาญ AI<select id="image-specialist"/);
assert.match(app, /syncImageSpecialist\(false\);\n\s*const d=TANJAI\.commonData\("image"\)/);
assert.match(proofread, /openProofreadTop/);
assert.match(proofread, /openProofreadNav/);
assert.match(proofread, /make\[A-Z\]/);
assert.match(proofread, /พ\.ศ\. \$1/);

console.log(JSON.stringify({version:"10.0.0",hiddenSpecialist:true,proofreadNav:true,status:"PASS"},null,2));

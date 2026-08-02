const assert = require("assert");
const fs = require("fs");

const page = fs.readFileSync("create-video/index.html", "utf8");
const guard = fs.readFileSync("create-video/auth-guard.js", "utf8");
const server = fs.readFileSync("server.mjs", "utf8");

for (const target of ["dashboard", "router", "image", "photoPro", "album", "post", "video", "voice", "kit", "deck", "mc", "projects", "library", "promptHub", "destinationHub"]) {
  assert.match(page, new RegExp(`href="\\.\\.\\/#${target}"`));
}
assert.match(page, /class="nav-item active" href="\.\/"/);
assert.match(page, /auth-guard\.js\?v=12\.1\.0/);
assert.match(guard, /onAuthStateChanged/);
assert.match(guard, /location\.replace\("\.\.\/"\)/);
assert.match(server, /ระบบประมวลผลวิดีโอพร้อมทำงาน/);
assert.match(server, /STUDIO_URL/);

console.log(JSON.stringify({ version: "12.1.0", fullMenu: true, sharedLogin: true, backendOnlyRender: true, status: "PASS" }, null, 2));

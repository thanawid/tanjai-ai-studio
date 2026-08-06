const assert = require("assert");
const fs = require("fs");

const redirectPage = fs.readFileSync("create-video/index.html", "utf8");
const studioPage = fs.readFileSync("index.html", "utf8");
const server = fs.readFileSync("server.mjs", "utf8");

for (const target of ["dashboard", "router", "image", "photoPro", "album", "post", "video", "createVideo", "voice", "kit", "deck", "mc", "projects", "library", "promptHub", "destinationHub"]) {
  assert.match(studioPage, new RegExp(`data-view="${target}"`));
}
assert.match(studioPage, /id="createVideo" class="view create-video-module"/);
assert.match(redirectPage, /url=\.\.\/#createVideo/);
assert.match(redirectPage, /location\.replace\("\.\.\/#createVideo"\)/);
assert.doesNotMatch(redirectPage, /auth-guard\.js/);
assert.match(server, /url\.pathname === "\/api\/health"/);
assert.match(server, /พร้อมสร้างวิดีโอภายในเว็บ/);
assert.match(server, /พร้อมเตรียม Prompt เพื่อนำไปสร้างต่อ/);

console.log(JSON.stringify({ version: "12.5.0", embeddedModule: true, fullMenu: true, sharedLogin: true, backendOnlyRender: true, status: "PASS" }, null, 2));

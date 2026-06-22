const assert = require("assert");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root,"index.html"),"utf8");
const app = fs.readFileSync(path.join(root,"js","app.js"),"utf8");
const css = fs.readFileSync(path.join(root,"css","style.css"),"utf8");

assert.match(index, /ชื่อผู้ใช้หรืออีเมล/);
assert.match(index, /placeholder="teamtanjai หรือ email@example\.com"/);
assert.match(index, /id="sidebarLogoutBtn"/);
assert.match(index, /V9\.3\.15 · Username & Mobile Access/);
assert.match(app, /return `\$\{raw\}@tanjai\.local`/);
assert.match(app, /if\(raw\.includes\("@"\)\) return raw/);
assert.match(app, /TANJAI\.normalizeLoginIdentifier = normalizeLoginIdentifier/);
assert.match(app, /\[logoutBtn, sidebarLogoutBtn\]/);
assert.match(css, /\.mobile-quick-nav\{display:none !important\}/);
assert.match(css, /\.sidebar-logout/);
assert.match(css, /min-height:100dvh/);
assert.match(css, /@media\(max-width:360px\)/);

console.log(JSON.stringify({usernameAlias:"@tanjai.local",ownerEmail:true,sidebarLogout:true,mobileNavDeduplicated:true,status:"PASS"},null,2));

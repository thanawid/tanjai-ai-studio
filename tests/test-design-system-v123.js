const assert = require("assert");
const fs = require("fs");

const page = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/style.css", "utf8");

assert.match(page, /V12\.5\.0/);
assert.match(page, /class="hero-card sales-dashboard-hero">/);
assert.doesNotMatch(page, /class="hero-card sales-dashboard-hero" style=/);
assert.match(page, /class="user-profile-top">/);
assert.match(css, /V12\.3 — Unified Studio design system/);
assert.match(css, /font-family:"Noto Sans Thai","Sarabun"/);
assert.match(css, /--sidebar:#11182a/);
assert.match(css, /@media\(max-width:1180px\)/);
assert.match(css, /@media\(max-width:720px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(css, /\.topbar\{[\s\S]*?backdrop-filter:blur\(18px\)/);
assert.match(css, /:focus-visible\{outline:3px/);

console.log(JSON.stringify({
  version: "12.5.0",
  thaiTypography: true,
  unifiedNavigation: true,
  desktopTabletMobile: true,
  keyboardFocus: true,
  reducedMotion: true,
  status: "PASS"
}, null, 2));

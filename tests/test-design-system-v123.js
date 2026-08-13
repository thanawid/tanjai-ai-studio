const assert = require("assert");
const fs = require("fs");

const page = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("css/style.css", "utf8");

assert.match(page, /V12\.5\.3/);
assert.match(page, /css\/style\.css\?v=12\.5\.3-post-creative/);
assert.match(page, /class="hero-card sales-dashboard-hero">/);
assert.doesNotMatch(page, /class="hero-card sales-dashboard-hero" style=/);
assert.match(page, /class="user-profile-top">/);
assert.match(page, /<footer class="owner-footer"/);
assert.doesNotMatch(page, /class="owner-watermark"/);
assert.match(css, /V12\.3 — Unified Studio design system/);
assert.match(css, /font-family:"Noto Sans Thai","Sarabun"/);
assert.match(css, /--sidebar:#11182a/);
assert.doesNotMatch(css, /\.owner-watermark/);
assert.match(css, /@media\(max-width:1180px\)/);
assert.match(css, /@media\(max-width:720px\)/);
assert.match(css, /\.studio-layout\{display:grid;grid-template-columns:minmax\(0,1\.03fr\) minmax\(440px,\.97fr\)/);
assert.doesNotMatch(css, /not\(\.has-output\)[^\{]*\.result-panel\{display:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(css, /\.topbar\{[\s\S]*?backdrop-filter:blur\(18px\)/);
assert.match(css, /:focus-visible\{outline:3px/);

console.log(JSON.stringify({
  version: "12.5.3",
  thaiTypography: true,
  unifiedNavigation: true,
  desktopTabletMobile: true,
  keyboardFocus: true,
  reducedMotion: true,
  status: "PASS"
}, null, 2));

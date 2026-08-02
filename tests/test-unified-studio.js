const assert = require("assert");
const fs = require("fs");

const main = fs.readFileSync("index.html", "utf8");
const video = fs.readFileSync("create-video/index.html", "utf8");
const app = fs.readFileSync("create-video/app.js", "utf8");
const server = fs.readFileSync("server.mjs", "utf8");
const dockerignore = fs.readFileSync(".dockerignore", "utf8");

assert.match(main, /href="create-video\/"/);
assert.doesNotMatch(main, /tanjai-video-studio\.onrender\.com/);
assert.doesNotMatch(video, /location\.replace/);
assert.match(video, /href="\.\.\/#video"/);
assert.match(app, /const API_BASE = location\.hostname\.endsWith\("github\.io"\)/);
assert.match(app, /version: "12\.1\.0"/);
assert.match(server, /Access-Control-Allow-Origin/);
assert.match(server, /req\.method === "OPTIONS"/);
assert.match(server, /\/api\/storyboard/);
assert.match(server, /\/api\/produce/);
assert.match(dockerignore, /^\.env$/m);

console.log(JSON.stringify({ version: "12.1.0", oneRepository: true, internalVideoPage: true, renderApiBridge: true, status: "PASS" }, null, 2));

(() => {
  "use strict";
  const moduleRoot = document.querySelector("#createVideo");
  if (!moduleRoot) return;
  const $ = (selector, root = moduleRoot) => root.querySelector(selector);
  const STORAGE_KEY = "tanjai-ai-video-projects-v4";
  const ACTIVE_JOB_KEY = "tanjai-ai-video-active-job";
  const APP_META = { version: "12.4.0" };
  const API_BASE = location.hostname.endsWith("github.io") ? "https://tanjai-video-studio.onrender.com" : "";
  const steps = ["ข้อมูลงาน", "บทและฉาก", "เลือกวิธีสร้าง", "สร้างคลิปต่อ"];
  const state = {
    id: crypto.randomUUID(), step: 0, name: "", updatedAt: Date.now(),
    data: { genre: "ให้ AI วิเคราะห์จากรายละเอียด", aspect: "16:9 แนวนอน", duration: "30 วินาที", language: "ภาษาไทย · ให้ AI เลือกเสียง", visual: "ให้ AI เลือกตามงาน", tone: "ให้ AI เลือกให้เหมาะสม", movement: "ให้ AI แนะนำ", scenes: [], method: "prompt" }
  };
  let serviceReady = false;
  const sceneFiles = new Map();

  const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  const readProjects = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
  function save(showTime = true) {
    state.updatedAt = Date.now();
    const projects = readProjects().filter((item) => item.id !== state.id);
    projects.unshift(structuredClone(state));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 30)));
    if (showTime && $("#saveState")) $("#saveState").textContent = `บันทึกร่างแล้ว ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  }
  const fields = (content) => `<div class="form-grid">${content}</div>`;
  const options = (items) => items.map((item) => `<option>${item}</option>`).join("");
  function trendChoices() {
    const items = [
      ["ให้ AI เลือกตามงาน", "วิเคราะห์เรื่องและเลือกแนวที่เหมาะที่สุด", "✨", "แนะนำ"],
      ["ราชการ / PR Premium", "สุภาพ ทันสมัย น่าเชื่อถือ", "📣", "ยอดนิยม"],
      ["Documentary Real", "ภาพจริง เล่าเรื่องชุมชนและกิจกรรม", "🎥", "กำลังนิยม"],
      ["Cinematic AI", "แสงและมิติแบบภาพยนตร์", "🎬", "กำลังนิยม"],
      ["Social Media Modern", "กระชับ เด่นบนมือถือ", "📱", "ยอดนิยม"],
      ["Micro Story", "เรื่องสั้น ดึงความสนใจตั้งแต่ต้น", "⚡", "กำลังนิยม"],
      ["MV เพลง", "ภาพตามอารมณ์และจังหวะดนตรี", "🎵", "ยอดนิยม"],
      ["นิทาน / แอนิเมชัน", "เหมาะกับเด็กและเรื่องสร้างสรรค์", "🧸", ""],
      ["3D Miniature World", "โลกจำลองสามมิติ สีสันสะดุดตา", "🏙️", "กำลังนิยม"],
      ["กำหนดแนวเอง", "ผสมแนวหรือบอกภาพในแบบของคุณ", "⚙️", ""]
    ];
    return `<div class="video-style-grid">${items.map(([title, detail, icon, badge]) => `<label class="video-style"><input type="radio" name="visual" data-key="visual" value="${title}" ${state.data.visual === title ? "checked" : ""}><span class="style-icon">${icon}</span><b>${title}</b><small>${detail}</small>${badge ? `<em>${badge}</em>` : ""}</label>`).join("")}</div>`;
  }
  function showMessage(message, type = "error") {
    const box = $("#storyboardStatus") || $("#apiResult");
    if (box) { box.hidden = false; box.className = `api-result ${type}`; box.textContent = message; }
  }
  async function requestJson(path, options) {
    let response;
    try { response = await fetch(`${API_BASE}${path}`, options); }
    catch { throw new Error("เชื่อมต่อระบบสร้างวิดีโอไม่ได้ กรุณารอสักครู่แล้วกดตรวจสถานะอีกครั้ง"); }
    const type = response.headers.get("content-type") || "";
    if (!type.includes("application/json")) throw new Error("ระบบตอบกลับไม่ครบ กรุณาลองใหม่หลังระบบออนไลน์แล้ว");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "ยังทำรายการไม่สำเร็จ กรุณาลองอีกครั้ง");
    return result;
  }
  async function checkService() {
    try {
      const health = await requestJson("/api/health"); serviceReady = Boolean(health.ready); state.data.plannerReady = Boolean(health.plannerReady);
    } catch { serviceReady = false; }
    return serviceReady;
  }
  function extractBlock(text, name) {
    const match = String(text || "").match(new RegExp(`\\[${name}\\]([\\s\\S]*?)\\[\\/${name}\\]`, "i"));
    return match ? match[1].trim() : "";
  }
  function cleanPromptLine(line) {
    return String(line || "").replace(/^\s*(?:[-*•]|\d+[.)]|ฉาก(?:ที่)?\s*\d+\s*[:：-]?|shot\s*\d+\s*[:：-]?)\s*/i, "").trim();
  }
  const compact = (value, max = 260) => { const text = String(value || "").replace(/\s+/g, " ").trim(); return text.length > max ? `${text.slice(0, max).trim()}…` : text; };
  function durationPlan(totalSeconds, count) {
    const base = Math.floor(totalSeconds / count); const extra = totalSeconds % count;
    return Array.from({ length: count }, (_, index) => base + (index < extra ? 1 : 0));
  }
  function flowPromptFor(scene, index) {
    const aspect = String(state.data.aspect || "").startsWith("9:16") ? "vertical 9:16" : String(state.data.aspect || "").startsWith("4:5") ? "vertical 4:5" : String(state.data.aspect || "").startsWith("1:1") ? "square 1:1" : "landscape 16:9";
    return [`Create a ${scene.duration || 8}-second realistic cinematic video, ${aspect}.`, `Scene ${index + 1}: ${compact(scene.visual, 220)}`, `Action: ${compact(scene.motion, 130)}`, `Camera: ${compact(scene.camera, 120)}`, "Natural movement, realistic lighting, clean composition.", "No on-screen text, no generated logos, no watermark, no distorted hands.", "Do not reconstruct, replace, modify, or drift the identity of any real person."].join("\n");
  }
  function normaliseScenes(scenes) {
    const total = Number.parseInt(state.data.duration, 10) || 30;
    const list = Array.isArray(scenes) && scenes.length ? scenes : [];
    const durations = durationPlan(total, Math.max(1, list.length));
    return list.map((scene, index) => {
      const ready = { ...scene, id: scene.id || crypto.randomUUID(), order: index + 1, duration: durations[index] };
      ready.flowPrompt = flowPromptFor(ready, index);
      ready.uploadedName = "";
      return ready;
    });
  }
  function packToStoryboard(text) {
    const seconds = Number.parseInt(state.data.duration, 10) || 30;
    const count = Math.max(3, Math.min(12, Math.round(seconds / 8)));
    const durations = durationPlan(seconds, count);
    const promptBlock = extractBlock(text, "SHORT_SHOT_PROMPTS");
    const voiceBlock = extractBlock(text, "CAPCUT_VOICE_SCRIPT");
    let prompts = promptBlock.split(/\n{2,}|\n(?=\s*(?:[-*•]|\d+[.)]|ฉาก|shot))/i).map(cleanPromptLine).filter((line) => line.length > 20);
    if (!prompts.length) prompts = String(text || "").split(/\n{2,}/).map(cleanPromptLine).filter((line) => line.length > 40).slice(0, count);
    const narration = voiceBlock.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const factParts = String(state.data.facts || state.data.topic || "").split(/\n|\s*[|•]\s*/).map((line) => compact(line, 130)).filter(Boolean);
    const fallbackPrompt = `สร้างคลิปตามเรื่อง ${state.data.topic || state.name || "วิดีโอใหม่"} แนว ${state.data.visual} สัดส่วน ${state.data.aspect} ภาพเคลื่อนไหวเป็นธรรมชาติ แสงสวย ไม่มีโลโก้และลายน้ำ`;
    return {
      projectTitle: state.name || String(state.data.topic || "วิดีโอใหม่").split(/[\n.!?]/)[0].slice(0, 70),
      summary: `แผนวิดีโอ ${count} ฉาก พร้อมบทพากย์และ Prompt สำหรับนำไปสร้างต่อ`,
      productionPack: text,
      planner: "tanjai-gemini",
      scenes: Array.from({ length: count }, (_, index) => {
        const prompt = compact(prompts[index] || prompts[index % Math.max(prompts.length, 1)] || fallbackPrompt, 420);
        const factLine = factParts[index % Math.max(1, factParts.length)] || compact(state.data.topic, 120);
        return {
          title: `ฉากที่ ${index + 1}`,
          duration: durations[index],
          visual: prompt,
          motion: "การเคลื่อนไหวต่อเนื่องเป็นธรรมชาติ เหมาะกับสารของฉาก",
          camera: index === 0 ? "เปิดด้วยภาพที่ดึงความสนใจ แล้วเคลื่อนกล้องอย่างนุ่มนวล" : "เลือกมุมและการเคลื่อนกล้องให้ต่อเนื่องจากฉากก่อนหน้า",
          onScreenText: index === 0 ? compact(state.name || state.data.topic, 54) : compact(factLine, 58),
          narration: narration[index] || compact(factLine, 145),
          imagePrompt: prompt,
          prompt,
          negativePrompt: "ห้ามสร้างใบหน้าใหม่ ห้ามเปลี่ยนใบหน้า ห้ามดัดแปลงบุคคลจริง ห้ามสร้างโลโก้ ตัวอักษร หรือลายน้ำผิดเพี้ยน"
        };
      })
    };
  }
  function starterStoryboard() {
    const seconds = Number.parseInt(state.data.duration, 10) || 30;
    const count = Math.max(3, Math.min(10, Math.round(seconds / 8)));
    const durations = durationPlan(seconds, count);
    const topic = String(state.data.topic || state.name || "วิดีโอใหม่").trim();
    const facts = String(state.data.facts || "").trim();
    const beats = [
      ["เปิดเรื่อง", "เปิดด้วยภาพที่สื่อสารหัวข้อได้ทันทีและดึงความสนใจภายใน 3 วินาที", "ค่อย ๆ เคลื่อนกล้องเข้าหาจุดสำคัญ", "เกริ่นประเด็นสำคัญของเรื่อง"],
      ["ที่มา", "แสดงบรรยากาศ สถานที่ หรือภาพกิจกรรมที่เกี่ยวข้องกับเรื่อง", "เคลื่อนภาพอย่างนุ่มนวลและเป็นธรรมชาติ", "เล่าที่มาและเหตุผลสำคัญ"],
      ["สารสำคัญ", "นำเสนอรายละเอียดหลักจากข้อมูลจริงอย่างชัดเจน", "สลับภาพกว้างและภาพรายละเอียด", "อธิบายข้อมูลสำคัญโดยไม่แต่งข้อเท็จจริงเพิ่ม"],
      ["ผู้คนและบรรยากาศ", "ใช้ภาพกิจกรรมหรือภาพสื่อความหมาย โดยคงอัตลักษณ์บุคคลจริง", "แพนกล้องช้า ๆ ให้เห็นบรรยากาศ", "เชื่อมโยงเรื่องกับผู้ชม"],
      ["รายละเอียด", "เน้นวัน เวลา สถานที่ หน่วยงาน หรือตัวเลขที่มีอยู่ในข้อมูลจริง", "เน้นจุดสำคัญทีละส่วน อ่านง่าย", "ย้ำรายละเอียดที่ผู้ชมควรรู้"],
      ["ประโยชน์", "แสดงผลลัพธ์หรือประโยชน์ที่ผู้ชมจะได้รับ", "เคลื่อนไหวต่อเนื่องในจังหวะอบอุ่น", "สรุปประโยชน์อย่างกระชับ"],
      ["เชิญชวน", "ภาพเชิญชวนที่เป็นมิตร พร้อมพื้นที่วางข้อความบนจอ", "ค่อย ๆ ดันกล้องเข้าหาจุดสนใจ", "เชิญชวนให้ผู้ชมดำเนินการตามวัตถุประสงค์"],
      ["ปิดเรื่อง", "ปิดด้วยภาพบรรยากาศที่น่าจดจำและข้อมูลติดต่อที่ผู้ใช้ให้มาเท่านั้น", "จบภาพอย่างนุ่มนวล", "ทิ้งท้ายด้วยสารหลักของวิดีโอ"]
    ];
    return {
      projectTitle: state.name || topic.split(/[\n.!?]/)[0].slice(0, 70),
      summary: `โครงวิดีโอ ${count} ฉาก พร้อมแก้ไขและนำ Prompt ไปสร้างต่อได้`,
      productionPack: "",
      planner: "starter",
      scenes: Array.from({ length: count }, (_, index) => {
        const [title, visual, motion, narration] = beats[Math.round(index * (beats.length - 1) / Math.max(count - 1, 1))];
        const factParts = facts.split(/\n|(?<=[.!?।])\s+|\s*[|•]\s*/).map((part) => part.trim()).filter(Boolean);
        const factLine = factParts[index % Math.max(1, factParts.length)] || compact(topic, 110);
        const spoken = index === 0 ? compact(topic, 135) : index === count - 1 ? `ขอเชิญชวนทุกท่านติดตามรายละเอียดและร่วมกิจกรรมตามวัน เวลา และสถานที่ที่กำหนด` : compact(factLine, 145);
        const screenText = index === 0 ? compact(state.name || topic, 54) : compact(factLine, 58);
        const prompt = `${visual} เรื่อง ${compact(topic, 120)} แนว ${state.data.visual} อารมณ์ ${state.data.tone} ภาพสมจริง การเคลื่อนไหวเป็นธรรมชาติ ไม่มีข้อความและลายน้ำ`;
        return { title: `${title} · ฉากที่ ${index + 1}`, duration: durations[index], visual, motion, camera: index === 0 ? "เปิดด้วยภาพเด่นแล้วเคลื่อนกล้องเข้าอย่างนุ่มนวล" : "เลือกมุมที่ต่อเนื่องจากฉากก่อนหน้า", onScreenText: screenText, narration: spoken || narration, imagePrompt: prompt, prompt, negativePrompt: "ห้ามสร้างใบหน้าใหม่ ห้ามเปลี่ยนใบหน้า ห้ามดัดแปลงลักษณะบุคคลจริง ห้ามแต่งข้อมูลสำคัญ ห้ามสร้างโลโก้ ตัวอักษร หรือลายน้ำผิดเพี้ยน" };
      })
    };
  }
  async function storyboardFromStudioAI() {
    const endpoint = String(window.TANJAI_AI_CONFIG?.endpoint || "").trim().replace(/\/$/, "");
    if (!/^https:\/\//i.test(endpoint)) throw new Error("ยังไม่ได้เชื่อมระบบวางแผนวิดีโอ");
    const response = await fetch(`${endpoint}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: "video",
        data: { title: state.name, detail: state.data.topic, facts: state.data.facts, audience: state.data.audience },
        options: { videoFormat: state.data.genre, videoAspectRatio: state.data.aspect, videoStyle: state.data.visual, duration: state.data.duration, voiceMode: state.data.language, destination: "ให้ AI เลือกตามงาน", customStyle: state.data.customStyle, tone: state.data.tone }
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.text) throw new Error(payload.error || "ระบบวางแผนวิดีโอยังไม่พร้อม");
    return packToStoryboard(payload.text);
  }
  async function buildStoryboard() {
    if (!state.data.topic?.trim()) return showMessage("กรุณาเล่าเรื่องที่ต้องการทำก่อนครับ");
    const button = $("#buildStoryboard");
    if (button) { button.disabled = true; button.textContent = "กำลังเขียนบทและวางฉาก…"; }
    showMessage("ทันใจกำลังเรียบเรียงบท แบ่งฉาก และเตรียม Prompt", "loading");
    try {
      let result;
      try { result = await storyboardFromStudioAI(); }
      catch {
        try { result = await requestJson("/api/storyboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: state.name, ...state.data }) }); }
        catch { result = starterStoryboard(); }
      }
      state.name ||= result.projectTitle; state.data.summary = result.summary;
      state.data.productionPack = result.productionPack || "";
      state.data.planner = result.planner || "ai";
      state.data.method = "prompt";
      sceneFiles.clear();
      state.data.scenes = normaliseScenes(result.scenes);
      state.step = 1; save(); render();
    } catch (error) { if (button) { button.disabled = false; button.textContent = "วิเคราะห์และวางแผนวิดีโอ"; } showMessage(error.message); }
  }
  function briefPanel() {
    const genres = ["ให้ AI วิเคราะห์จากรายละเอียด", "ข่าว / รายงานกิจกรรม", "เชิญชวน / ประชาสัมพันธ์", "สารคดี / เรื่องเล่าองค์กร", "โฆษณาสินค้าและบริการ", "MV / เพลง", "นิทานเด็ก", "หนังสั้น", "ท่องเที่ยว", "กำหนดเอง"];
    return `<section class="form-section"><div class="section-heading"><div><h3>เล่าเรื่องที่ต้องการ</h3><p>ใส่ข้อมูลเท่าที่มี ระบบจะช่วยวิเคราะห์โดยไม่แต่งข้อมูลสำคัญเพิ่ม</p></div></div>${fields(`<div class="field full lead-field"><label>เรื่องหรือข้อมูลสำหรับทำวิดีโอ <b>*</b></label><textarea data-key="topic" placeholder="วางเรื่อง ข้อมูลดิบ หรือรายละเอียดทั้งหมดที่ต้องการนำไปทำวิดีโอ">${escapeHtml(state.data.topic || "")}</textarea></div><div class="field full"><label>ข้อมูลจริงที่ห้ามเปลี่ยน</label><textarea class="short" data-key="facts" placeholder="ระบุชื่อ วัน เวลา สถานที่ หน่วยงาน และตัวเลขที่ต้องใช้ตามต้นฉบับ">${escapeHtml(state.data.facts || "")}</textarea></div><div class="field"><label>ชื่อวิดีโอ <small>ไม่ใส่ก็ได้ ให้ AI ช่วยตั้งชื่อ</small></label><input data-key="name" value="${escapeHtml(state.name)}" placeholder="ตั้งชื่อเอง หรือเว้นว่างให้ AI ช่วยตั้ง"></div><div class="field"><label>ประเภทงาน</label><select data-key="genre">${options(genres)}</select></div><div class="field"><label>กลุ่มผู้ชม</label><input data-key="audience" value="${escapeHtml(state.data.audience || "")}" placeholder="ระบุกลุ่มคนที่ต้องการสื่อสารด้วย"></div><div class="field"><label>ความยาวโดยประมาณ</label><select data-key="duration">${options(["30 วินาที", "60 วินาที", "90 วินาที"])}</select></div><div class="field"><label>ขนาดวิดีโอ</label><select data-key="aspect">${options(["16:9 แนวนอน", "9:16 แนวตั้ง", "1:1 จัตุรัส", "4:5 โพสต์โซเชียล"])}</select></div><div class="field"><label>เสียงพากย์</label><select data-key="language">${options(["ภาษาไทย · ให้ AI เลือกเสียง", "ภาษาไทย · ผู้ชาย", "ภาษาไทย · ผู้หญิง", "ภาษาอังกฤษ", "ไม่มีเสียงพากย์"])}</select></div>`)}</section><details class="advanced-options"><summary><span><b>ปรับแนววิดีโอเพิ่มเติม</b><small>ค่าเริ่มต้นให้ AI เลือกแนวที่เหมาะกับงาน</small></span><i>＋</i></summary><div class="advanced-body">${trendChoices()}${fields(`<div class="field"><label>อารมณ์และจังหวะ</label><select data-key="tone">${options(["ให้ AI เลือกให้เหมาะสม", "สุภาพและเป็นทางการ", "สดใส เป็นกันเอง", "อบอุ่นและประทับใจ", "สนุกและกระฉับกระเฉง", "จริงจังและน่าเชื่อถือ", "ลึกลับและน่าติดตาม"])}</select></div><div class="field"><label>รายละเอียดแนวเพิ่มเติม</label><input data-key="customStyle" value="${escapeHtml(state.data.customStyle || "")}" placeholder="อธิบายอารมณ์ภาพ แสง สี และจังหวะที่ต้องการเพิ่มเติม"></div>`)}</div></details><div class="identity-note"><b>คงอัตลักษณ์บุคคลจริง</b><span>ระบบจะไม่สร้างใบหน้าใหม่ ไม่เปลี่ยนใบหน้า และไม่ดัดแปลงลักษณะบุคคล โดยจะใช้ภาพต้นฉบับ ภาพกิจกรรม สถานที่ หรือภาพสื่อความหมายที่เหมาะสมแทน</span></div><button class="primary build-main" id="buildStoryboard" type="button">✨ วิเคราะห์และวางแผนวิดีโอ</button><div class="api-result" id="storyboardStatus" hidden></div>`;
  }
  function storyboardPanel() {
    if (!state.data.scenes.length) return `<div class="empty-storyboard"><span>🎬</span><h3>ยังไม่มีฉาก</h3><p>ย้อนกลับไปเล่าเรื่อง แล้วให้ทันใจช่วยเขียนบทและแบ่งฉากให้ครับ</p></div>`;
    const starterNote = state.data.planner === "starter" ? `<div class="gentle-notice"><b>เตรียมโครงเริ่มต้นให้แล้ว</b><span>ระบบวิเคราะห์อัตโนมัติกำลังพักชั่วคราว คุณยังแก้บทและ Prompt ชุดนี้แล้วนำไปสร้างต่อได้ทันที</span></div>` : "";
    const total = state.data.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
    return `<div class="storyboard-head"><div><h3>ตรวจบทและฉาก</h3><small>${state.data.scenes.length} ฉาก · รวม ${total} วินาที · ทุกช่องขยายตามเนื้อหาและบันทึกอัตโนมัติ</small></div><button class="ghost compact" id="buildStoryboard" type="button">วิเคราะห์ใหม่</button></div>${starterNote}<div class="api-result" id="storyboardStatus" hidden></div><div class="storyboard-grid">${state.data.scenes.map((scene, index) => `<article class="scene-card compact-scene"><header class="scene-card-head"><div><span>ฉาก ${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(scene.title || `ฉากที่ ${index + 1}`)}</b></div><label>เวลา <input type="number" min="3" max="20" data-scene="${scene.id}" data-scene-key="duration" value="${Number(scene.duration || 8)}"> วินาที</label></header><div class="scene-core"><label>ภาพที่ต้องเห็น<textarea data-autogrow data-scene="${scene.id}" data-scene-key="visual">${escapeHtml(scene.visual)}</textarea></label><label>เสียงพากย์พร้อมอ่าน<textarea data-autogrow data-scene="${scene.id}" data-scene-key="narration">${escapeHtml(scene.narration)}</textarea></label><label class="wide">ข้อความบนจอ <small>ใส่ข้อความจริงภายหลัง ไม่ให้ AI วาดตัวอักษรลงในคลิป</small><textarea data-autogrow data-scene="${scene.id}" data-scene-key="onScreenText">${escapeHtml(scene.onScreenText || "")}</textarea></label></div><details class="scene-details"><summary><span>รายละเอียดและ Prompt</span><small>การเคลื่อนไหว · มุมกล้อง · Prompt สำหรับ Flow · ข้อห้าม</small></summary><div class="scene-detail-grid"><label>การเคลื่อนไหว<textarea data-autogrow data-scene="${scene.id}" data-scene-key="motion">${escapeHtml(scene.motion)}</textarea></label><label>มุมกล้อง<textarea data-autogrow data-scene="${scene.id}" data-scene-key="camera">${escapeHtml(scene.camera || "ให้ AI เลือกมุมที่เหมาะสม")}</textarea></label><label class="wide prompt-field"><span>Prompt สำหรับ Google Flow <button class="copy-scene" type="button" data-copy-flow="${scene.id}">คัดลอก Prompt</button></span><textarea data-autogrow data-scene="${scene.id}" data-scene-key="flowPrompt">${escapeHtml(scene.flowPrompt || flowPromptFor(scene, index))}</textarea></label><label>Prompt สร้างภาพ<textarea data-autogrow data-scene="${scene.id}" data-scene-key="imagePrompt">${escapeHtml(scene.imagePrompt || scene.visual)}</textarea></label><label>ข้อห้ามในการสร้าง<textarea data-autogrow data-scene="${scene.id}" data-scene-key="negativePrompt">${escapeHtml(scene.negativePrompt || "ห้ามสร้างหรือเปลี่ยนใบหน้าบุคคลจริง ห้ามสร้างข้อความและโลโก้ผิดเพี้ยน")}</textarea></label></div></details></article>`).join("")}</div>`;
  }
  function methodPanel() {
    const count = state.data.scenes.length; const total = state.data.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0);
    if (!serviceReady && state.data.method !== "prompt") state.data.method = "prompt";
    const method = state.data.method;
    return `<div class="method-intro"><h3>เลือกวิธีสร้างวิดีโอที่สะดวกสำหรับคุณ</h3><p>เส้นทาง Prompt ใช้งานได้เสมอ ส่วนการสร้างในเว็บจะเปิดให้เลือกเมื่อระบบพร้อมจริง</p></div><div class="choice-grid method-grid"><label class="choice choice-recommended"><input type="radio" name="method" data-key="method" value="prompt" ${method === "prompt" ? "checked" : ""}><i>📋</i><b>สร้างต่อด้วย Google Flow หรือเครื่องมืออื่น</b><span>คัดลอก Prompt ทีละฉาก แล้วนำคลิปที่ได้กลับเข้าเว็บ</span><em>แนะนำ</em></label><label class="choice ${serviceReady ? "" : "choice-disabled"}"><input type="radio" name="method" data-key="method" value="preview" ${method === "preview" ? "checked" : ""} ${serviceReady ? "" : "disabled"}><i>🧪</i><b>ทดลองสร้างฉากแรกในเว็บ</b><span>${serviceReady ? "ตรวจผลงานหนึ่งฉากก่อนสร้างทั้งหมด" : "ยังไม่พร้อมใช้งานในขณะนี้"}</span></label><label class="choice ${serviceReady ? "" : "choice-disabled"}"><input type="radio" name="method" data-key="method" value="full" ${method === "full" ? "checked" : ""} ${serviceReady ? "" : "disabled"}><i>🎬</i><b>สร้างวิดีโอทั้งหมดในเว็บ</b><span>${serviceReady ? `${count} ฉาก · รวม ${total} วินาที` : "ยังไม่พร้อมใช้งานในขณะนี้"}</span></label></div><div class="method-note soft">บทและ Prompt ถูกบันทึกไว้ ไม่ว่าคุณจะเลือกสร้างด้วยวิธีใด</div>`;
  }
  function productionPanel() {
    const promptOnly = state.data.method === "prompt";
    if (!promptOnly) {
      const scenes = state.data.method === "preview" ? 1 : state.data.scenes.length;
      return `<div class="production-summary"><h3>บทและฉากพร้อมสร้างในเว็บ</h3><div class="summary-list"><div><small>ชื่อโครงการ</small><b>${escapeHtml(state.name || "ยังไม่ได้ตั้งชื่อ")}</b></div><div><small>จำนวนฉาก</small><b>${scenes} ฉาก</b></div></div><div class="production-actions"><button class="primary" id="startProduction" type="button" ${serviceReady ? "" : "disabled"}>${state.data.method === "preview" ? "ทดลองสร้างฉากแรก" : "สร้างวิดีโอทั้งหมด"}</button></div></div><div class="api-result" id="apiResult" hidden></div><div id="videoResult"></div>`;
    }
    const ready = state.data.scenes.filter((scene) => sceneFiles.has(scene.id)).length;
    const allReady = ready === state.data.scenes.length && ready > 0;
    return `<div class="production-summary handoff-summary"><div><small>เส้นทางสร้างคลิป</small><h3>${escapeHtml(state.name || "วิดีโอใหม่")}</h3><p>คัดลอก Prompt ไปสร้างทีละฉาก แล้วอัปโหลดคลิปที่ได้กลับมาตรงฉากเดิม</p></div><strong>${ready}/${state.data.scenes.length}<small>คลิปพร้อม</small></strong></div><div class="flow-mini-steps"><span><i>1</i> คัดลอก Prompt</span><span><i>2</i> เปิด Flow และเลือก Video</span><span><i>3</i> ตรวจสัดส่วนแล้วกด Generate</span><span><i>4</i> ดาวน์โหลดและอัปโหลดกลับ</span></div><div class="destination-actions handoff-tools"><button class="ghost" id="copyAllPrompts" type="button">คัดลอก Prompt ทั้งชุด</button><button class="ghost" id="downloadPrompts" type="button">ดาวน์โหลดชุด Prompt</button><a class="btn primary" href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener">เปิด Google Flow ↗</a></div><div class="clip-handoff-list">${state.data.scenes.map((scene, index) => { const file = sceneFiles.get(scene.id); return `<article class="clip-handoff ${file ? "ready" : ""}"><header><div><span>ฉาก ${String(index + 1).padStart(2, "0")} · ${scene.duration} วินาที</span><b>${escapeHtml(scene.title || `ฉากที่ ${index + 1}`)}</b></div><em>${file ? "คลิปพร้อม ✓" : "รอคลิป"}</em></header><div class="flow-prompt-preview">${escapeHtml(scene.flowPrompt || flowPromptFor(scene, index))}</div><div class="clip-handoff-actions"><button class="ghost compact" type="button" data-copy-flow="${scene.id}">คัดลอก Prompt ฉากนี้</button><a class="btn secondary" href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener">เปิด Flow</a><label class="btn ${file ? "secondary" : "primary"}">${file ? "เปลี่ยนคลิป" : "อัปโหลดคลิปที่ได้"}<input type="file" accept="video/*" data-scene-upload="${scene.id}" hidden></label></div>${file ? `<div class="uploaded-clip"><span>🎞️</span><div><b>${escapeHtml(file.name)}</b><small>${(file.size / 1048576).toFixed(1)} MB · พร้อมส่งไปแต่งวิดีโอ</small></div><button type="button" data-remove-upload="${scene.id}">นำออก</button></div>` : ""}</article>`; }).join("")}</div><div class="handoff-finish"><div><b>${allReady ? "คลิปครบแล้ว พร้อมไปแต่งวิดีโอ" : `เหลืออีก ${state.data.scenes.length - ready} คลิป`}</b><span>${allReady ? "ระบบจะส่งคลิปทั้งหมดเข้าเมนูแต่งวิดีโอให้ตามลำดับฉาก" : "สร้างและอัปโหลดคลิปให้ครบทุกฉากก่อน"}</span></div><button class="primary" id="handoffToEditor" type="button" ${allReady ? "" : "disabled"}>นำคลิปทั้งหมดไปแต่งวิดีโอ</button></div><div class="api-result" id="apiResult" hidden></div>`;
  }
  const panels = [briefPanel, storyboardPanel, methodPanel, productionPanel];
  function briefResult() {
    return `<div class="result-card featured"><small>ผลการวิเคราะห์</small><h3>ทันใจ Smart Video</h3><p>บทพากย์ แผนฉาก และ Prompt จะแสดงที่นี่หลังระบบวิเคราะห์ข้อมูล</p></div><div class="result-empty"><span>🎞️</span><b>${state.name ? escapeHtml(state.name) : "ผลการวิเคราะห์จะแสดงที่นี่"}</b><p>${state.data.topic ? "ข้อมูลพร้อมแล้ว กดวิเคราะห์และวางแผนวิดีโอได้เลย" : "เล่าเรื่องหรือใส่ข้อมูลที่มี เริ่มได้แม้ไม่รู้ศัพท์งานวิดีโอ"}</p></div><div class="quick-guide"><b>ระบบจะช่วยจัดการ</b><span>✓ เขียนบทพากย์</span><span>✓ แบ่งฉากและกำหนดภาพ</span><span>✓ วางการเคลื่อนไหวและ Prompt</span><span>✓ ประมาณค่าใช้จ่ายก่อนสร้างจริง</span></div>`;
  }
  function sceneResult() {
    const scene = state.data.scenes[0];
    return `<div class="result-card featured"><small>ภาพรวมวิดีโอ</small><h3>${escapeHtml(state.name || "วิดีโอใหม่")}</h3><p>${escapeHtml(state.data.summary || "ตรวจแก้ฉากทางซ้ายก่อนเลือกวิธีสร้าง")}</p></div><div class="preview-frame"><span>🎬</span><b>${state.data.scenes.length} ฉาก · ${escapeHtml(state.data.duration)}</b><small>${escapeHtml(state.data.visual)} / ${escapeHtml(state.data.tone)}</small></div>${scene ? `<div class="prompt-preview"><small>ตัวอย่าง Prompt ฉากแรก</small><p>${escapeHtml(scene.prompt)}</p><button class="ghost compact" data-copy-scene="${scene.id}" type="button">คัดลอก Prompt</button></div>` : ""}`;
  }
  function resultForStep() { return state.step === 2 ? `<div class="result-card featured"><small>พร้อมเลือกเส้นทาง</small><h3>${escapeHtml(state.name || "วิดีโอใหม่")}</h3><p>${state.data.scenes.length} ฉาก · ${escapeHtml(state.data.duration)} · ${escapeHtml(state.data.aspect)}</p></div><div class="path-preview"><b>แนะนำ: สร้างต่อด้วย Prompt</b><span>สร้างคลิปทีละฉาก แล้วนำไฟล์กลับเข้ามารวมในเว็บได้</span></div>${sceneResult()}` : ""; }
  function render() {
    state.data.scenes ||= [];
    if (state.step >= 2 && !serviceReady) state.data.method = "prompt";
    state.data.scenes.forEach((scene, index) => { scene.id ||= crypto.randomUUID(); scene.order = index + 1; scene.flowPrompt ||= flowPromptFor(scene, index); });
    $("#stepper").innerHTML = steps.map((label, index) => `<div class="step ${index === state.step ? "active" : index < state.step ? "done" : ""}"><i>${index < state.step ? "✓" : index + 1}</i><span>${label}</span></div>`).join("");
    $("#stepPanel").innerHTML = panels[state.step](); $("#resultPanel").innerHTML = resultForStep();
    $(".video-studio-layout").classList.toggle("full-mode", state.step !== 2);
    $("#resultPanel").hidden = state.step !== 2;
    $("#createVideoTitle").textContent = state.name || "สร้างวิดีโอด้วย AI";
    $("#prevStep").hidden = state.step === 0; $("#nextStep").hidden = state.step === 0 || state.step === steps.length - 1;
    $("#nextStep").disabled = state.step === 1 && !state.data.scenes.length;
    $("#nextStep").textContent = state.step === 1 ? "ถัดไป: เลือกวิธีสร้าง" : "ถัดไป: สร้างคลิปต่อ";
    $("#stepPanel").querySelectorAll("[data-key]").forEach((control) => { const key = control.dataset.key; const value = key === "name" ? state.name : state.data[key]; if (value && control.tagName === "SELECT") control.value = value; });
    bindPanel();
  }
  function promptText() { return [`ทันใจ AI Studio — ชุดสร้างวิดีโอ`, `ชื่อโครงการ: ${state.name || "วิดีโอใหม่"}`, `แนว: ${state.data.visual}`, `รูปแบบ: ${state.data.aspect}`, `ความยาวรวม: ${state.data.scenes.reduce((sum, scene) => sum + Number(scene.duration || 0), 0)} วินาที`, "", ...state.data.scenes.flatMap((scene, index) => [`ฉากที่ ${index + 1} (${scene.duration} วินาที)`, `ภาพ: ${scene.visual}`, `ข้อความบนจอ (ใส่ตอนตัดต่อ): ${scene.onScreenText || "ไม่มี"}`, `เสียงพากย์: ${scene.narration}`, `PROMPT สำหรับ GOOGLE FLOW:`, scene.flowPrompt || flowPromptFor(scene, index), `ข้อห้าม: ${scene.negativePrompt || "ห้ามสร้างหรือเปลี่ยนใบหน้าบุคคลจริง ห้ามสร้างข้อความและโลโก้ผิดเพี้ยน"}`, ""] )].join("\n"); }
  async function copyText(text, button) { try { await navigator.clipboard.writeText(text); const old = button.textContent; button.textContent = "คัดลอกแล้ว ✓"; setTimeout(() => button.textContent = old, 1800); } catch { showMessage("คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกอีกครั้ง"); } }
  function bindPanel() {
    $("#stepPanel").querySelectorAll("[data-key]").forEach((control) => {
      const apply = () => { const key = control.dataset.key; if (key === "name") state.name = control.value; else state.data[key] = control.value; save(); if (control.type === "radio") render(); };
      control.addEventListener("change", apply); if (control.type !== "radio") control.addEventListener("input", apply);
    });
    moduleRoot.querySelectorAll("[data-scene]").forEach((control) => control.addEventListener("input", () => { const scene = state.data.scenes.find((item) => item.id === control.dataset.scene); if (scene) { const key = control.dataset.sceneKey; scene[key] = key === "duration" ? Number(control.value) : control.value; if (key === "flowPrompt") scene.flowCustom = true; else if (!scene.flowCustom && ["visual", "motion", "camera", "duration"].includes(key)) scene.flowPrompt = flowPromptFor(scene, state.data.scenes.indexOf(scene)); } save(); if (control.matches("textarea[data-autogrow]")) autoGrow(control); }));
    moduleRoot.querySelectorAll("[data-copy-scene]").forEach((button) => button.addEventListener("click", () => { const scene = state.data.scenes.find((item) => item.id === button.dataset.copyScene); if (scene) copyText(scene.prompt, button); }));
    moduleRoot.querySelectorAll("[data-copy-flow]").forEach((button) => button.addEventListener("click", () => { const scene = state.data.scenes.find((item) => item.id === button.dataset.copyFlow); if (scene) copyText(scene.flowPrompt || flowPromptFor(scene, state.data.scenes.indexOf(scene)), button); }));
    moduleRoot.querySelectorAll("textarea[data-autogrow]").forEach(autoGrow);
    moduleRoot.querySelectorAll("[data-scene-upload]").forEach((input) => input.addEventListener("change", () => { const file = input.files?.[0]; const scene = state.data.scenes.find((item) => item.id === input.dataset.sceneUpload); if (!file || !scene) return; sceneFiles.set(scene.id, file); scene.uploadedName = file.name; save(); render(); }));
    moduleRoot.querySelectorAll("[data-remove-upload]").forEach((button) => button.addEventListener("click", () => { const scene = state.data.scenes.find((item) => item.id === button.dataset.removeUpload); sceneFiles.delete(button.dataset.removeUpload); if (scene) scene.uploadedName = ""; save(); render(); }));
    $("#handoffToEditor")?.addEventListener("click", handoffToEditor);
    $("#buildStoryboard")?.addEventListener("click", buildStoryboard); $("#startProduction")?.addEventListener("click", startProduction);
    $("#copyAllPrompts")?.addEventListener("click", (event) => copyText(promptText(), event.currentTarget));
    $("#downloadPrompts")?.addEventListener("click", () => { const blob = new Blob([promptText()], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${(state.name || "tanjai-video").replace(/[\\/:*?"<>|]+/g, "-")}-prompts.txt`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    $("#openDestinations")?.addEventListener("click", () => { const list = $("#destinationList"); list.hidden = !list.hidden; });
    $("#usePromptInstead")?.addEventListener("click", () => { state.data.method = "prompt"; save(); render(); });
  }
  function autoGrow(textarea) { textarea.style.height = "auto"; textarea.style.height = `${Math.max(68, textarea.scrollHeight + 2)}px`; }
  function handoffToEditor() {
    const files = state.data.scenes.map((scene) => sceneFiles.get(scene.id)).filter(Boolean);
    if (files.length !== state.data.scenes.length) return showMessage("กรุณาอัปโหลดคลิปให้ครบทุกฉากก่อนครับ");
    const input = document.querySelector("#videoFootageInput");
    if (!input) return showMessage("ยังเปิดพื้นที่แต่งวิดีโอไม่ได้ กรุณาลองใหม่อีกครั้ง");
    const transfer = new DataTransfer(); files.forEach((file) => transfer.items.add(file)); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true })); TANJAI.switchView("video");
  }
  async function startProduction() {
    const box = $("#apiResult"), button = $("#startProduction"); if (!box || !button) return;
    if (!serviceReady && !(await checkService())) { box.hidden = false; box.className = "api-result gentle"; box.textContent = "ขณะนี้ยังไม่สามารถเริ่มสร้างวิดีโอภายในเว็บได้ แต่ Prompt ของคุณยังพร้อมนำไปสร้างต่อได้ตามปกติ"; return; }
    box.hidden = false; box.className = "api-result loading"; box.textContent = "กำลังส่งงานเข้าสู่ระบบ กรุณาอย่ากดสร้างซ้ำ…"; button.disabled = true;
    try { const result = await requestJson("/api/produce", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: state.name, ...state.data, scope: state.data.method }) }); localStorage.setItem(ACTIVE_JOB_KEY, result.jobId); pollJob(result.jobId); }
    catch (error) { box.className = "api-result error"; box.textContent = error.message; button.disabled = false; button.textContent = "ลองอีกครั้ง"; }
  }
  async function pollJob(jobId, retryCount = 0) {
    const box = $("#apiResult"), button = $("#startProduction"); if (!box) return;
    try {
      const job = await requestJson(`/api/jobs/${encodeURIComponent(jobId)}`); box.hidden = false; box.className = `api-result ${job.status === "failed" ? "error" : job.status === "completed" ? "success" : "loading"}`; box.textContent = `${job.message || "กำลังสร้างวิดีโอ"}${job.progress != null ? ` · ${job.progress}%` : ""}`;
      if (job.status === "completed") { localStorage.removeItem(ACTIVE_JOB_KEY); if (button) button.textContent = "สร้างเรียบร้อย"; const url = `${API_BASE}${job.downloadUrl}`; $("#videoResult").innerHTML = `<video class="result-video" controls playsinline src="${escapeHtml(url)}"></video><a class="primary result-download" href="${escapeHtml(url)}" download>ดาวน์โหลดวิดีโอ MP4</a>`; return; }
      if (job.status === "failed") { localStorage.removeItem(ACTIVE_JOB_KEY); if (button) { button.disabled = false; button.textContent = "ลองอีกครั้ง"; } return; }
      setTimeout(() => pollJob(jobId, 0), 5000);
    } catch (error) {
      box.className = "api-result error";
      if (String(error.message).includes("ไม่พบงานนี้")) {
        localStorage.removeItem(ACTIVE_JOB_KEY);
        box.textContent = "ระบบเริ่มทำงานใหม่และไม่พบงานเดิม กรุณากลับไปสร้างอีกครั้ง";
        if (button) { button.disabled = false; button.textContent = "สร้างอีกครั้ง"; }
        return;
      }
      if (retryCount < 4) {
        box.className = "api-result loading";
        box.textContent = `การเชื่อมต่อสะดุด กำลังเชื่อมต่อใหม่ครั้งที่ ${retryCount + 1}…`;
        setTimeout(() => pollJob(jobId, retryCount + 1), 5000);
        return;
      }
      box.innerHTML = `ยังเชื่อมต่อระบบไม่ได้ แต่งานอาจกำลังทำต่ออยู่ <button class="ghost compact" id="retryStatus" type="button">ตรวจสถานะอีกครั้ง</button>`;
      $("#retryStatus")?.addEventListener("click", () => pollJob(jobId, 0));
    }
  }
  function renderProjects() {
    const items = readProjects(); $("#projectList", document).innerHTML = items.length ? items.map((item) => `<button class="video-project-item" type="button" data-project="${item.id}"><span><b>${escapeHtml(item.name || "งานไม่มีชื่อ")}</b><small>${escapeHtml(item.data?.visual || "วิดีโอ")}</small></span><small>${new Date(item.updatedAt).toLocaleString("th-TH")}</small></button>`).join("") : `<div class="empty-projects">ยังไม่มีงานที่บันทึกไว้</div>`;
    $("#projectList", document).querySelectorAll("[data-project]").forEach((button) => button.addEventListener("click", () => { const item = items.find((project) => project.id === button.dataset.project); Object.assign(state, item); $("#videoProjectDialog", document).close(); render(); }));
  }
  $("#prevStep").addEventListener("click", () => { if (state.step > 0) { state.step--; render(); scrollTo({ top: 0, behavior: "smooth" }); } });
  $("#nextStep").addEventListener("click", () => { if (state.step === 0 && !state.data.scenes.length) return buildStoryboard(); if (state.step < steps.length - 1) { state.step++; save(); render(); scrollTo({ top: 0, behavior: "smooth" }); } });
  $("#saveProject").addEventListener("click", (event) => { save(); const old = event.currentTarget.textContent; event.currentTarget.textContent = "บันทึกแล้ว ✓"; setTimeout(() => event.currentTarget.textContent = old, 1600); });
  $("#openProjects").addEventListener("click", () => { renderProjects(); $("#videoProjectDialog", document).showModal(); });
  $("#closeProjects", document).addEventListener("click", () => $("#videoProjectDialog", document).close());
  render(); checkService().then(() => { const jobId = localStorage.getItem(ACTIVE_JOB_KEY); if (jobId) { state.step = 3; render(); const box = $("#apiResult"); box.hidden = false; box.className = "api-result loading"; box.textContent = "พบงานเดิม กำลังตรวจสถานะต่อ…"; pollJob(jobId); } });
})();

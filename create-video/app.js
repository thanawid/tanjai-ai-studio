(() => {
  "use strict";
  const moduleRoot = document.querySelector("#createVideo");
  if (!moduleRoot) return;
  const $ = (selector, root = moduleRoot) => root.querySelector(selector);
  const STORAGE_KEY = "tanjai-ai-video-projects-v4";
  const ACTIVE_JOB_KEY = "tanjai-ai-video-active-job";
  const APP_META = { version: "12.2.1" };
  const API_BASE = location.hostname.endsWith("github.io") ? "https://tanjai-video-studio.onrender.com" : "";
  const steps = ["ข้อมูลงาน", "บทและฉาก", "ตรวจและสร้าง", "ผลงาน"];
  const state = {
    id: crypto.randomUUID(), step: 0, name: "", updatedAt: Date.now(),
    data: { genre: "ให้ AI วิเคราะห์จากรายละเอียด", aspect: "16:9 แนวนอน", duration: "30 วินาที", language: "ภาษาไทย · ให้ AI เลือกเสียง", visual: "ให้ AI เลือกตามงาน", tone: "ให้ AI เลือกให้เหมาะสม", movement: "ให้ AI แนะนำ", scenes: [], method: "preview" }
  };
  let serviceReady = false;

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
      const health = await requestJson("/api/health"); serviceReady = Boolean(health.ready);
    } catch { serviceReady = false; }
    return serviceReady;
  }
  async function buildStoryboard() {
    if (!state.data.topic?.trim()) return showMessage("กรุณาเล่าเรื่องที่ต้องการทำก่อนครับ");
    const button = $("#buildStoryboard");
    if (button) { button.disabled = true; button.textContent = "กำลังเขียนบทและวางฉาก…"; }
    showMessage("ทันใจกำลังเรียบเรียงบท แบ่งฉาก และเตรียม Prompt", "loading");
    try {
      const result = await requestJson("/api/storyboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: state.name, ...state.data }) });
      state.name ||= result.projectTitle; state.data.summary = result.summary;
      state.data.scenes = result.scenes.map((scene, index) => ({ ...scene, id: crypto.randomUUID(), order: index + 1 }));
      state.step = 1; save(); render();
    } catch (error) { if (button) { button.disabled = false; button.textContent = "วิเคราะห์และวางแผนวิดีโอ"; } showMessage(error.message); }
  }
  function briefPanel() {
    const genres = ["ให้ AI วิเคราะห์จากรายละเอียด", "ข่าว / รายงานกิจกรรม", "เชิญชวน / ประชาสัมพันธ์", "สารคดี / เรื่องเล่าองค์กร", "โฆษณาสินค้าและบริการ", "MV / เพลง", "นิทานเด็ก", "หนังสั้น", "ท่องเที่ยว", "กำหนดเอง"];
    return `<section class="form-section"><div class="section-heading"><div><h3>เล่าเรื่องที่ต้องการ</h3><p>ใส่ข้อมูลเท่าที่มี ระบบจะช่วยวิเคราะห์โดยไม่แต่งข้อมูลสำคัญเพิ่ม</p></div></div>${fields(`<div class="field full lead-field"><label>เรื่องหรือข้อมูลสำหรับทำวิดีโอ <b>*</b></label><textarea data-key="topic" placeholder="เช่น ทำวิดีโอเชิญชวนประชาชนร่วมออกกำลังกาย ทุกวันพุธและศุกร์ เวลา 17.00–19.00 น. ความยาวประมาณ 30 วินาที">${escapeHtml(state.data.topic || "")}</textarea></div><div class="field full"><label>ข้อมูลจริงที่ห้ามเปลี่ยน</label><textarea class="short" data-key="facts" placeholder="ชื่อบุคคล วัน เวลา สถานที่ หน่วยงาน และตัวเลขสำคัญ">${escapeHtml(state.data.facts || "")}</textarea></div><div class="field"><label>ชื่อวิดีโอ <small>ไม่ใส่ก็ได้ ให้ AI ช่วยตั้งชื่อ</small></label><input data-key="name" value="${escapeHtml(state.name)}" placeholder="เช่น เชิญชวนร่วมกิจกรรมออกกำลังกาย"></div><div class="field"><label>ประเภทงาน</label><select data-key="genre">${options(genres)}</select></div><div class="field"><label>กลุ่มผู้ชม</label><input data-key="audience" value="${escapeHtml(state.data.audience || "")}" placeholder="เช่น ประชาชนทั่วไป"></div><div class="field"><label>ความยาวโดยประมาณ</label><select data-key="duration">${options(["30 วินาที", "60 วินาที", "90 วินาที"])}</select></div><div class="field"><label>ขนาดวิดีโอ</label><select data-key="aspect">${options(["16:9 แนวนอน", "9:16 แนวตั้ง", "1:1 จัตุรัส", "4:5 โพสต์โซเชียล"])}</select></div><div class="field"><label>เสียงพากย์</label><select data-key="language">${options(["ภาษาไทย · ให้ AI เลือกเสียง", "ภาษาไทย · ผู้ชาย", "ภาษาไทย · ผู้หญิง", "ภาษาอังกฤษ", "ไม่มีเสียงพากย์"])}</select></div>`)}</section><details class="advanced-options"><summary><span><b>ปรับแนววิดีโอเพิ่มเติม</b><small>ค่าเริ่มต้นให้ AI เลือกแนวที่เหมาะกับงาน</small></span><i>＋</i></summary><div class="advanced-body">${trendChoices()}${fields(`<div class="field"><label>อารมณ์และจังหวะ</label><select data-key="tone">${options(["ให้ AI เลือกให้เหมาะสม", "สุภาพและเป็นทางการ", "สดใส เป็นกันเอง", "อบอุ่นและประทับใจ", "สนุกและกระฉับกระเฉง", "จริงจังและน่าเชื่อถือ", "ลึกลับและน่าติดตาม"])}</select></div><div class="field"><label>รายละเอียดแนวเพิ่มเติม</label><input data-key="customStyle" value="${escapeHtml(state.data.customStyle || "")}" placeholder="เช่น ภาพจริง อบอุ่น จังหวะไม่เร็วเกินไป"></div>`)}</div></details><div class="identity-note"><b>คงอัตลักษณ์บุคคลจริง</b><span>ระบบจะไม่สร้างใบหน้าใหม่ ไม่เปลี่ยนใบหน้า และไม่ดัดแปลงลักษณะบุคคล โดยจะใช้ภาพต้นฉบับ ภาพกิจกรรม สถานที่ หรือภาพสื่อความหมายที่เหมาะสมแทน</span></div><button class="primary build-main" id="buildStoryboard" type="button">✨ วิเคราะห์และวางแผนวิดีโอ</button><div class="api-result" id="storyboardStatus" hidden></div>`;
  }
  function storyboardPanel() {
    if (!state.data.scenes.length) return `<div class="empty-storyboard"><span>🎬</span><h3>ยังไม่มีฉาก</h3><p>ย้อนกลับไปเล่าเรื่อง แล้วให้ทันใจช่วยเขียนบทและแบ่งฉากให้ครับ</p></div>`;
    return `<div class="storyboard-head"><div><h3>ตรวจบทและฉาก</h3><small>แก้เฉพาะจุดที่ต้องการ ทุกช่องบันทึกอัตโนมัติ</small></div><button class="ghost compact" id="buildStoryboard" type="button">วางฉากใหม่</button></div><div class="api-result" id="storyboardStatus" hidden></div><div class="storyboard-grid">${state.data.scenes.map((scene, index) => `<article class="scene-card"><div class="scene-number">${String(index + 1).padStart(2, "0")}<small>${scene.duration} วิ</small></div><div class="scene-body"><label>ภาพในฉาก<textarea data-scene="${scene.id}" data-scene-key="visual">${escapeHtml(scene.visual)}</textarea></label><label>การเคลื่อนไหว<textarea data-scene="${scene.id}" data-scene-key="motion">${escapeHtml(scene.motion)}</textarea></label><label>เสียงพากย์<textarea data-scene="${scene.id}" data-scene-key="narration">${escapeHtml(scene.narration)}</textarea></label><label>Prompt สำหรับสร้างคลิป<textarea data-scene="${scene.id}" data-scene-key="prompt">${escapeHtml(scene.prompt)}</textarea><button class="copy-scene" type="button" data-copy-scene="${scene.id}">คัดลอก Prompt ฉากนี้</button></label></div></article>`).join("")}</div>`;
  }
  function methodPanel() {
    const count = state.data.scenes.length; const method = state.data.method;
    return `<div class="method-intro"><h3>ตรวจและเลือกวิธีสร้าง</h3><p>ค่าใช้จ่ายคำนวณจาก Sora 2 ที่ $0.10 ต่อวินาที และอาจมีค่าเขียนบทหรือเสียงพากย์เพิ่มเติมเล็กน้อย</p></div><div class="choice-grid method-grid"><label class="choice"><input type="radio" name="method" data-key="method" value="preview" ${method === "preview" ? "checked" : ""}><i>🧪</i><b>ทดลองสร้าง 1 ฉาก</b><span>คลิป 8 วินาที · ประมาณ $0.80</span></label><label class="choice"><input type="radio" name="method" data-key="method" value="full" ${method === "full" ? "checked" : ""}><i>🎬</i><b>สร้างวิดีโอทั้งหมด</b><span>${count} ฉาก · ${count * 8} วินาที · ประมาณ $${(Math.max(count, 1) * 0.8).toFixed(2)}</span></label><label class="choice"><input type="radio" name="method" data-key="method" value="prompt" ${method === "prompt" ? "checked" : ""}><i>📋</i><b>ดูและคัดลอก Prompt</b><span>อ่าน แก้ คัดลอก หรือดาวน์โหลดข้อความ โดยยังไม่สร้างคลิป</span></label></div><div class="method-note">ระบบจะไม่เริ่มสร้างคลิปจนกว่าคุณจะยืนยันในขั้นถัดไป</div>`;
  }
  function productionPanel() {
    const promptOnly = state.data.method === "prompt"; const scenes = state.data.method === "preview" ? Math.min(1, state.data.scenes.length) : state.data.scenes.length;
    return `<div class="production-summary"><h3>${promptOnly ? "Prompt พร้อมใช้" : "พร้อมสร้างคลิปเคลื่อนไหว"}</h3><div class="summary-list"><div><small>ชื่อโครงการ</small><b>${escapeHtml(state.name || "ยังไม่ได้ตั้งชื่อ")}</b></div><div><small>รูปแบบ</small><b>${escapeHtml(state.data.visual)} · ${escapeHtml(state.data.aspect)}</b></div><div><small>จำนวนฉาก</small><b>${scenes} ฉาก</b></div><div><small>สิ่งที่จะได้รับ</small><b>${promptOnly ? "Prompt แบบข้อความ แยกตามฉาก" : "วิดีโอ MP4 พร้อมเสียงพากย์"}</b></div></div></div><div class="production-actions"><button class="ghost" id="copyAllPrompts" type="button">คัดลอก Prompt ทั้งหมด</button><button class="ghost" id="downloadPrompts" type="button">ดาวน์โหลดข้อความ (.txt)</button>${promptOnly ? "" : `<button class="primary" id="startProduction" type="button" ${state.data.scenes.length ? "" : "disabled"}>${state.data.method === "preview" ? "ทดลองสร้าง 1 ฉาก" : "สร้างวิดีโอทั้งหมด"}</button>`}</div><div class="api-result" id="apiResult" hidden></div><div id="videoResult"></div>`;
  }
  const panels = [briefPanel, storyboardPanel, methodPanel, productionPanel];
  function briefResult() {
    return `<div class="result-card featured"><small>ผลการวิเคราะห์</small><h3>ทันใจ Smart Video</h3><p>บทพากย์ แผนฉาก และ Prompt จะแสดงที่นี่หลังระบบวิเคราะห์ข้อมูล</p></div><div class="result-empty"><span>🎞️</span><b>${state.name ? escapeHtml(state.name) : "ผลการวิเคราะห์จะแสดงที่นี่"}</b><p>${state.data.topic ? "ข้อมูลพร้อมแล้ว กดวิเคราะห์และวางแผนวิดีโอได้เลย" : "เล่าเรื่องหรือใส่ข้อมูลที่มี เริ่มได้แม้ไม่รู้ศัพท์งานวิดีโอ"}</p></div><div class="quick-guide"><b>ระบบจะช่วยจัดการ</b><span>✓ เขียนบทพากย์</span><span>✓ แบ่งฉากและกำหนดภาพ</span><span>✓ วางการเคลื่อนไหวและ Prompt</span><span>✓ ประมาณค่าใช้จ่ายก่อนสร้างจริง</span></div>`;
  }
  function sceneResult() {
    const scene = state.data.scenes[0];
    return `<div class="result-card featured"><small>ภาพรวมวิดีโอ</small><h3>${escapeHtml(state.name || "วิดีโอใหม่")}</h3><p>${escapeHtml(state.data.summary || "ตรวจแก้ฉากทางซ้ายก่อนเลือกวิธีสร้าง")}</p></div><div class="preview-frame"><span>🎬</span><b>${state.data.scenes.length} ฉาก · ${escapeHtml(state.data.duration)}</b><small>${escapeHtml(state.data.visual)} / ${escapeHtml(state.data.tone)}</small></div>${scene ? `<div class="prompt-preview"><small>ตัวอย่าง Prompt ฉากแรก</small><p>${escapeHtml(scene.prompt)}</p><button class="ghost compact" data-copy-scene="${scene.id}" type="button">คัดลอก Prompt</button></div>` : ""}`;
  }
  function resultForStep() { return state.step === 0 ? briefResult() : state.step === 1 ? sceneResult() : state.step === 2 ? `<div class="result-card featured"><small>สรุปก่อนสร้าง</small><h3>${escapeHtml(state.name || "วิดีโอใหม่")}</h3><p>${state.data.scenes.length} ฉาก · ${escapeHtml(state.data.aspect)} · ${escapeHtml(state.data.language)}</p></div><div class="cost-preview"><b>ค่าใช้จ่ายโดยประมาณ</b><strong>$${(Math.max(state.data.scenes.length, 1) * 0.8).toFixed(2)}</strong><small>ทดลองหนึ่งฉากประมาณ $0.80</small></div>${sceneResult()}` : sceneResult(); }
  function render() {
    $("#stepper").innerHTML = steps.map((label, index) => `<div class="step ${index === state.step ? "active" : index < state.step ? "done" : ""}"><i>${index < state.step ? "✓" : index + 1}</i><span>${label}</span></div>`).join("");
    $("#stepPanel").innerHTML = panels[state.step](); $("#resultPanel").innerHTML = resultForStep();
    $(".video-studio-layout").classList.toggle("brief-mode", state.step === 0);
    $("#resultPanel").hidden = state.step === 0;
    $("#createVideoTitle").textContent = state.name || "สร้างวิดีโอด้วย AI";
    $("#prevStep").hidden = state.step === 0; $("#nextStep").hidden = state.step === 0 || state.step === steps.length - 1;
    $("#nextStep").disabled = state.step === 1 && !state.data.scenes.length;
    $("#nextStep").textContent = state.step === 1 ? "ถัดไป: ตรวจและสร้าง" : "ถัดไป: ผลงาน";
    $("#stepPanel").querySelectorAll("[data-key]").forEach((control) => { const key = control.dataset.key; const value = key === "name" ? state.name : state.data[key]; if (value && control.tagName === "SELECT") control.value = value; });
    bindPanel();
  }
  function promptText() { return [`ทันใจ AI Studio — ชุด Prompt วิดีโอ`, `ชื่อโครงการ: ${state.name || "วิดีโอใหม่"}`, `แนว: ${state.data.visual}`, `รูปแบบ: ${state.data.aspect}`, "", ...state.data.scenes.flatMap((scene, index) => [`ฉากที่ ${index + 1} (${scene.duration} วินาที)`, `ภาพ: ${scene.visual}`, `การเคลื่อนไหว: ${scene.motion}`, `เสียงพากย์: ${scene.narration}`, `Prompt: ${scene.prompt}`, ""] )].join("\n"); }
  async function copyText(text, button) { try { await navigator.clipboard.writeText(text); const old = button.textContent; button.textContent = "คัดลอกแล้ว ✓"; setTimeout(() => button.textContent = old, 1800); } catch { showMessage("คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกอีกครั้ง"); } }
  function bindPanel() {
    $("#stepPanel").querySelectorAll("[data-key]").forEach((control) => {
      const apply = () => { const key = control.dataset.key; if (key === "name") state.name = control.value; else state.data[key] = control.value; save(); if (control.type === "radio") render(); };
      control.addEventListener("change", apply); if (control.type !== "radio") control.addEventListener("input", apply);
    });
    moduleRoot.querySelectorAll("[data-scene]").forEach((control) => control.addEventListener("input", () => { const scene = state.data.scenes.find((item) => item.id === control.dataset.scene); if (scene) scene[control.dataset.sceneKey] = control.value; save(); }));
    moduleRoot.querySelectorAll("[data-copy-scene]").forEach((button) => button.addEventListener("click", () => { const scene = state.data.scenes.find((item) => item.id === button.dataset.copyScene); if (scene) copyText(scene.prompt, button); }));
    $("#buildStoryboard")?.addEventListener("click", buildStoryboard); $("#startProduction")?.addEventListener("click", startProduction);
    $("#copyAllPrompts")?.addEventListener("click", (event) => copyText(promptText(), event.currentTarget));
    $("#downloadPrompts")?.addEventListener("click", () => { const blob = new Blob([promptText()], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${(state.name || "tanjai-video").replace(/[\\/:*?"<>|]+/g, "-")}-prompts.txt`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  }
  async function startProduction() {
    const box = $("#apiResult"), button = $("#startProduction"); if (!box || !button) return;
    if (!serviceReady && !(await checkService())) { box.hidden = false; box.className = "api-result error"; box.textContent = "ระบบสร้างวิดีโอยังไม่พร้อม กรุณารอสักครู่แล้วลองใหม่"; return; }
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

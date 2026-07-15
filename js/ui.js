window.TANJAI = window.TANJAI || {};
const TANJAI_CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio";
TANJAI.openCustomGPT = function(){ window.open(TANJAI_CUSTOM_GPT_URL, "_blank", "noopener,noreferrer"); };
TANJAI.$ = s => document.querySelector(s);
TANJAI.$$ = s => Array.from(document.querySelectorAll(s));
TANJAI.escapeHTML = function(value){
  return String(value || "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[ch]));
};

TANJAI.toast = function(msg){
  const t = TANJAI.$("#toast");
  if(!t){ console.log("TANJAI:", msg); return; }
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2600);
};

TANJAI.copyText = async function(text){
  const value = String(text || "");
  if(!value.trim()){
    TANJAI.toast("ยังไม่มีผลลัพธ์ให้คัดลอก — กรุณากดสร้างก่อน");
    return false;
  }
  try{
    if(navigator.clipboard && window.isSecureContext !== false){
      await navigator.clipboard.writeText(value);
    }else{
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    TANJAI.toast("คัดลอกแล้ว — เปิดเครื่องมือที่ต้องการ แล้วกด Ctrl+V เพื่อวาง");
    return true;
  }catch(err){
    console.warn("Copy failed", err);
    TANJAI.toast("คัดลอกอัตโนมัติไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกเอง");
    return false;
  }
};

TANJAI.downloadText = function(text, filename){
  const blob = new Blob([text || ""], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "tanjai-output.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

TANJAI.validViews = ["dashboard","router","image","photoPro","album","post","mc","video","voice","deck","kit","promptHub","destinationHub","projects","library","guide"];

TANJAI.switchView = function(id, options = {}){
  if(!TANJAI.validViews.includes(id)) id = "dashboard";
  TANJAI.state = TANJAI.state || {};
  TANJAI.state.currentView = id;

  TANJAI.$$(".view").forEach(v => {
    const active = v.id === id;
    v.classList.toggle("active", active);
    v.setAttribute("aria-hidden", active ? "false" : "true");
  });

  TANJAI.$$(".nav-link, .mobile-tabbar [data-view], #mobileQuickNav [data-view]").forEach(b => {
    const active = b.dataset.view === id;
    b.classList.toggle("active", active);
    if(active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });

  const names = {
    dashboard:"สวัสดีครับ! 👋",
    router:"AI Router",
    image:"สร้างภาพ",
    photoPro:"AI Photo Pro",
    album:"ชุดภาพโพสต์ Facebook",
    post:"เรียบเรียงเนื้อหา",
    mc:"งานพิธีกร",
    video:"ทำวิดีโอ",
    voice:"เสียงพากย์",
    deck:"ทำสไลด์",
    kit:"สร้างชุดสื่อ",
    promptHub:"คลัง Prompt",
    destinationHub:"เครื่องมือปลายทาง",
    projects:"โปรเจกต์",
    library:"ตัวอย่างงาน",
    guide:"คู่มือระบบ"
  };
  const tabNames = {
    ...names,
    dashboard:"หน้าหลัก"
  };
  const title = TANJAI.$("#pageTitle");
  if(title) title.textContent = names[id] || "ทันใจ AI Studio";
  document.title = `${tabNames[id] || "ทันใจ AI Studio"} | ทันใจ AI Studio`;

  if(id === "projects") TANJAI.renderProjects?.();

  if(options.push !== false){
    const nextHash = "#" + id;
    if(location.hash !== nextHash){
      history.pushState({view:id}, "", nextHash);
    }
  }

  if(options.scroll !== false){
    window.scrollTo({top:0, behavior: options.smooth === false ? "auto" : "smooth"});
  }
};

TANJAI.currentViewFromHash = function(){
  const id = (location.hash || "#dashboard").replace("#","");
  return TANJAI.validViews.includes(id) ? id : "dashboard";
};

TANJAI.goBackView = function(){
  if(location.hash && location.hash !== "#dashboard" && history.length > 1){
    history.back();
  }else{
    TANJAI.switchView("dashboard");
  }
};

TANJAI.setupNavigationHistory = function(){
  window.addEventListener("hashchange", () => {
    TANJAI.switchView(TANJAI.currentViewFromHash(), {push:false, smooth:false});
  });

  document.addEventListener("click", e => {
    const backBtn = e.target.closest("[data-nav-back], #topBackBtn");
    if(backBtn){
      e.preventDefault();
      TANJAI.goBackView();
    }
  }, true);

  TANJAI.switchView(TANJAI.currentViewFromHash(), {push:false, smooth:false});
};

TANJAI.field = function(prefix, data){
  const c = TANJAI.categories;
  const opts = arr => arr.map(x=>`<option>${x}</option>`).join("");

  // label ต่างกันตาม tool เพื่อไม่ให้งง
  const titleLabels = {
    image: "หัวข้องาน / ชื่อเรื่อง",
    post:  "หัวข้องาน / ชื่อเรื่อง",
    mc:    "ชื่องาน / พิธี / กิจกรรม",
    video: "หัวข้อคลิป / ชื่อเรื่อง",
    voice: "หัวข้อเสียงพากย์",
    deck:  "ชื่อ Presentation / หัวข้อสไลด์",
    kit:   "หัวข้องาน / ชื่อโปรเจกต์"
  };
  const titleHints = {
    image: "(ข้อความนี้จะปรากฏบนภาพ — ใส่ชื่องานจริง)",
    post:  "(หัวข้อหลักที่ต้องการสื่อสาร)",
    mc:    "(ชื่องานที่พิธีกรจะใช้อ้างอิงตลอดงาน)",
    video: "(ใช้ตั้ง Hook และ Thumbnail คลิป)",
    voice: "(ใช้เป็นจุดเริ่มต้นสคริปต์)",
    deck:  "(จะเป็นชื่อ Slide แรกและชื่อไฟล์)",
    kit:   "(ใช้สร้าง Prompt ครบชุดทุกสื่อ)"
  };
  const titlePlaceholders = {
    image: "เช่น  ประชาสัมพันธ์ภาษีที่ดินและสิ่งปลูกสร้าง / เชิญร่วมกิจกรรมวันเด็ก 2569 / แจ้งปิดถนนชั่วคราว",
    post:  "เช่น  สรุปผลการประชุมสภา / ประกาศรับสมัครงาน / แจ้งผลการคัดเลือก",
    mc:    "เช่น  พิธีเปิดโครงการ... / งานมอบรางวัล... / การประชุมสัมมนา...",
    video: "เช่น  แนะนำบริการงานทะเบียน / สรุปกิจกรรมวันเด็ก / ขั้นตอนการชำระภาษี",
    voice: "เช่น  ประชาสัมพันธ์โครงการ... / แจ้งกำหนดชำระภาษี / เชิญร่วมกิจกรรม...",
    deck:  "เช่น  รายงานผลการดำเนินงานปี 2568 / แผนพัฒนา 5 ปี / สรุปโครงการ...",
    kit:   "เช่น  งานวันเด็กแห่งชาติ 2569 / โครงการปลูกต้นไม้ / กิจกรรมประจำปี..."
  };

  const titleLabel    = titleLabels[prefix]    || "หัวข้องาน / ชื่อเรื่อง";
  const titleHint     = titleHints[prefix]     || "(จะใช้เป็นหัวข้อหลักใน Prompt)";
  const titlePh       = titlePlaceholders[prefix] || "เช่น ชื่องาน / ประกาศ / กิจกรรม / แคมเปญ";

  return `
    <div class="form-section">
      <div class="section-title"><b>1</b><h4>บอกงานให้ชัด</h4></div>
      <div class="form-grid">
        <label class="full">
          ${titleLabel}
          <small class="field-hint">${titleHint}</small>
          <input id="${prefix}-title" placeholder="${titlePh}">
        </label>
        <label>
          ชื่อหน่วยงาน / องค์กร / แบรนด์
          <input id="${prefix}-orgName" placeholder="เช่น  เทศบาลเมืองบางรักน้อย / โรงพยาบาล... / ร้าน... / เพจ...">
        </label>
        <label>กลุ่มเป้าหมาย<select id="${prefix}-audience">${opts(c.audiences)}</select></label>
        <label>โทนภาษา<select id="${prefix}-tone">${opts(c.tones)}</select></label>
        <label class="full">
          รายละเอียดงาน
          <small class="field-hint">(ใส่ข้อมูลจริงเท่าที่มี — ระบบจะไม่แต่งข้อมูลเพิ่มเอง)</small>
          <textarea id="${prefix}-detail" placeholder="เช่น  ใคร ทำอะไร ที่ไหน เมื่อไหร่ มีวัตถุประสงค์อะไร / ข้อความที่ต้องการสื่อ / ขั้นตอน / ช่องทางติดต่อ"></textarea>
        </label>
        <label>วัน / เวลา<input id="${prefix}-dateTime" placeholder="เช่น  30 มิถุนายน 2569 / ทุกวันจันทร์–ศุกร์ 08.30–16.30 น."></label>
        <label>สถานที่<input id="${prefix}-place" placeholder="เช่น  ห้องประชุมสำนักงานเทศบาล / ออนไลน์ผ่าน Zoom"></label>
        <label class="full">บุคคล / หน่วยงานที่เกี่ยวข้อง<input id="${prefix}-people" placeholder="เช่น  นายกเทศมนตรี / คณะกรรมการ / วิทยากร / ผู้ประสานงาน (ถ้ามี)"></label>
      </div>
    </div>`;
};

TANJAI.resultShell = function(tool, recommended, desc, bodyId, buttons=""){
  return `
    <div class="result-action stable-output-head">
      <div class="result-title-block">
        <small>ผลลัพธ์</small>
        <h4 id="${tool}ResultTitle">${recommended}</h4>
        <p id="${tool}ResultDesc">${desc}</p>
      </div>
      <div class="result-buttons stable-result-buttons">
        ${buttons || `<button class="btn primary compact-action" data-copybox="${bodyId}">คัดลอกผลลัพธ์</button>`}
      </div>
    </div>
    <div id="${bodyId}" class="result-box stable-empty">กดปุ่มสร้าง แล้วผลลัพธ์จะแสดงตรงนี้</div>
  `;
};

TANJAI.getToolDestinations = function(tool){
  const GPT = TANJAI.customGptUrl || TANJAI_CUSTOM_GPT_URL;
  const map = {
    image:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Canva", url:"https://www.canva.com/"}],
    photoPro:[{label:"แต่งภาพในเว็บ", url:"#photoPro"}],
    album:[{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด ทันใจ GPT", url:GPT}],
    mc:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Notebook Tool", url:"https://notebooklm.google.com/"},{label:"เปิด Canva", url:"https://www.canva.com/"}],
    post:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Notebook Tool", url:"https://notebooklm.google.com/"},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"}],
    video:[
      {label:"เปิด ทันใจ GPT", url:GPT},
      {label:"เปิด Google Flow", url:"https://flow.google/"},
      {label:"เปิด Runway", url:"https://runwayml.com/"},
      {label:"เปิด Luma", url:"https://lumalabs.ai/"},
      {label:"เปิด HeyGen", url:"https://www.heygen.com/"},
      {label:"เปิด Pika", url:"https://pika.art/"},
      {label:"เปิด CapCut", url:"https://www.capcut.com/"}
    ],
    voice:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Voice Tool", url:"https://aistudio.google.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"}],
    deck:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Slide Tool", url:"https://gamma.app/"},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด Notebook Tool", url:"https://notebooklm.google.com/"}],
    kit:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"},{label:"เปิด Voice Tool", url:"https://aistudio.google.com/"},{label:"เปิด Slide Tool", url:"https://gamma.app/"}]
  };
  return map[tool] || [{label:"เปิด ทันใจ GPT", url:GPT}];
};

TANJAI.primaryActionButtons = function(tool, bodyId){
  const GPT = TANJAI.customGptUrl || TANJAI_CUSTOM_GPT_URL;
  const btn = (label, attrs, cls="secondary")=>`<button class="btn ${cls}" ${attrs}>${label}</button>`;
  if(tool === "image"){
    const imageGenerateButton = window.TANJAI_AI_CONFIG?.imageGenerationEnabled
      ? btn("สร้างภาพในเว็บ", `data-generate-image="imageOut"`)
      : "";
    return btn("คัดลอก Prompt", `data-copy-image="execute"`, "primary") + imageGenerateButton + btn("เปิด ทันใจ GPT", `data-open="${GPT}"`);
  }
  if(tool === "album") return btn("ดาวน์โหลดทั้งหมด", `id="albumDownloadAllTop"`, "primary") + btn("ล้างรูป", `id="albumClearTop"`);
  if(tool === "post") return btn("คัดลอกงานเขียน", `data-copybox="${bodyId}"`, "primary");
  if(tool === "mc") return btn("คัดลอกสคริปต์พิธีกร", `data-copybox="${bodyId}"`, "primary");
  if(tool === "video") return btn("Shot Prompts", `data-copy-video-section="shots" data-copy-source="${bodyId}" aria-label="คัดลอก Shot Prompts"`, "primary") + btn("บทพูดตัวละคร", `data-copy-video-section="dialogue" data-copy-source="${bodyId}" aria-label="คัดลอกบทพูดตัวละคร"`) + btn("ทั้งแพ็ก", `data-copybox="${bodyId}" aria-label="คัดลอกทั้งแพ็ก"`) + `<details class="video-more-actions"><summary class="btn secondary">เพิ่มเติม</summary><div class="video-more-actions-menu">${btn("เสียง CapCut", `data-copy-video-section="voice" data-copy-source="${bodyId}" aria-label="คัดลอกเสียง CapCut"`)}${btn("เปิด CapCut", `data-open="https://www.capcut.com/"`)}</div></details>`;
  if(tool === "voice") return btn("คัดลอกสคริปต์เสียง", `data-copybox="${bodyId}"`, "primary") + btn("เปิด Voice Tool", `data-open="https://aistudio.google.com/"`);
  if(tool === "deck") return btn("คัดลอกเนื้อหาสไลด์", `data-copybox="${bodyId}"`, "primary") + btn("เปิด Slide Tool", `data-open="https://gamma.app/"`);
  if(tool === "kit") return btn("คัดลอก Prompt Pack พร้อมใช้", `data-copybox="${bodyId}"`, "primary") + btn("เปิด ทันใจ GPT", `data-open="${GPT}"`);
  return btn("คัดลอกผลลัพธ์", `data-copybox="${bodyId}"`, "primary");
};

TANJAI.editableWritingTools = new Set(["post", "mc", "video", "voice", "deck"]);

TANJAI.outputEditor = function(tool, bodyId){
  if(!TANJAI.editableWritingTools.has(tool)){
    return `<div id="${bodyId}" class="result-box stable-empty">กดปุ่มสร้าง แล้วผลลัพธ์พร้อมใช้จะแสดงตรงนี้</div>`;
  }
  return `
    <div class="output-editor-wrap" data-output-editor="${tool}">
      <div class="output-editor-bar">
        <span class="output-editor-status" id="${tool}EditStatus">✏️ แก้ไขข้อความในกล่องด้านล่างได้ทันที</span>
        <button class="btn ghost output-reset-btn" type="button" data-reset-output="${bodyId}" hidden>คืนค่าฉบับที่สร้าง</button>
      </div>
      <div id="${bodyId}" class="result-box stable-empty editable-result-box" contenteditable="true" role="textbox" aria-multiline="true" aria-label="ผลลัพธ์ที่แก้ไขได้" spellcheck="true" data-editable-output="${tool}">กดปุ่มสร้าง แล้วแก้ไข เพิ่ม หรือตัดข้อความได้ตรงนี้</div>
    </div>`;
};

TANJAI.readyOutputShell = function(tool, recommended, desc, bodyId){
  const destinations = TANJAI.getToolDestinations(tool).map(item => `<button class="btn ghost" data-open="${item.url}">${item.label}</button>`).join("");
  return `
    <div class="result-action stable-output-head ready-output-head">
      <div class="result-title-block">
        <small>ผลลัพธ์พร้อมใช้</small>
        <h4 id="${tool}ResultTitle">${recommended}</h4>
        <p id="${tool}ResultDesc">${desc}</p>
      </div>
      <div class="result-buttons stable-result-buttons primary-first-actions" data-primary-actions="${tool}">
        ${TANJAI.primaryActionButtons(tool, bodyId)}
      </div>
    </div>
    ${TANJAI.outputEditor(tool, bodyId)}
    <details class="advanced-output-wrap" id="${tool}AdvancedWrap">
      <summary>ดูรายละเอียดเพิ่มเติม</summary>
      <div class="advanced-output-grid">
        <section class="advanced-output-card" id="${tool}AdvancedSection1" hidden>
          <h5 id="${tool}AdvancedTitle1">รายละเอียดเพิ่มเติม</h5>
          <div id="${tool}Advanced1" class="result-box advanced-result-box">ยังไม่มีข้อมูลเพิ่มเติม</div>
        </section>
        <section class="advanced-output-card" id="${tool}AdvancedSection2" hidden>
          <h5 id="${tool}AdvancedTitle2">ตัวช่วยเพิ่มเติม</h5>
          <div id="${tool}Advanced2" class="result-box advanced-result-box">ยังไม่มีข้อมูลเพิ่มเติม</div>
        </section>
        <section class="advanced-output-card">
          <h5>เครื่องมือที่แนะนำ</h5>
          <div class="advanced-tools-list">${destinations}</div>
        </section>
      </div>
    </details>
  `;
};

TANJAI.setReadyOutput = function(tool, options={}){
  const mainEl = TANJAI.$(`#${tool}Out`);
  const titleEl = TANJAI.$(`#${tool}ResultTitle`);
  const descEl = TANJAI.$(`#${tool}ResultDesc`);
  const a1Wrap = TANJAI.$(`#${tool}AdvancedSection1`);
  const a2Wrap = TANJAI.$(`#${tool}AdvancedSection2`);
  const a1Title = TANJAI.$(`#${tool}AdvancedTitle1`);
  const a2Title = TANJAI.$(`#${tool}AdvancedTitle2`);
  const a1El = TANJAI.$(`#${tool}Advanced1`);
  const a2El = TANJAI.$(`#${tool}Advanced2`);
  if(mainEl){
    mainEl.textContent = options.main || "";
    mainEl.classList.toggle("stable-empty", !(options.main || "").trim());
    if(mainEl.dataset.editableOutput){
      mainEl.dataset.generatedText = options.main || "";
      mainEl.dataset.edited = "false";
      const resetButton = document.querySelector(`[data-reset-output="${mainEl.id}"]`);
      const status = TANJAI.$(`#${tool}EditStatus`);
      if(resetButton) resetButton.hidden = true;
      if(status) status.textContent = "✏️ แก้ไข เพิ่ม หรือตัดข้อความในกล่องได้ทันที";
    }
  }
  if(titleEl && options.title) titleEl.textContent = options.title;
  if(descEl && options.desc) descEl.textContent = options.desc;
  const sectionSets = [
    [a1Wrap, a1Title, a1El, options.advancedTitle1, options.advanced1],
    [a2Wrap, a2Title, a2El, options.advancedTitle2, options.advanced2]
  ];
  sectionSets.forEach(([wrap,title,el,newTitle,newText])=>{
    const has = !!(newText && String(newText).trim());
    if(wrap) wrap.hidden = !has;
    if(title && newTitle) title.textContent = newTitle;
    if(el){
      el.textContent = newText || "";
      el.classList.toggle("stable-empty", !has);
    }
  });
};

TANJAI.extractMarkedBlock = function(text, marker){
  const value = String(text || "");
  const start = `[${marker}]`;
  const end = `[/${marker}]`;
  const startIndex = value.indexOf(start);
  const endIndex = value.indexOf(end);
  if(startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return "";
  return value.slice(startIndex + start.length, endIndex).trim();
};

document.addEventListener("input", function(event){
  const output = event.target.closest?.("[data-editable-output]");
  if(!output) return;
  output.dataset.edited = "true";
  const tool = output.dataset.editableOutput;
  const resetButton = document.querySelector(`[data-reset-output="${output.id}"]`);
  const status = TANJAI.$(`#${tool}EditStatus`);
  if(resetButton) resetButton.hidden = output.textContent === (output.dataset.generatedText || "");
  if(status) status.textContent = "บันทึกการแก้ไขในหน้าเว็บแล้ว — ปุ่มคัดลอกและบันทึกจะใช้ข้อความนี้";
});

document.addEventListener("click", function(event){
  const generateImageButton = event.target.closest?.("[data-generate-image]");
  if(generateImageButton){
    event.preventDefault();
    TANJAI.generateCurrentImage?.(generateImageButton);
    return;
  }
  const sectionButton = event.target.closest?.("[data-copy-video-section]");
  if(sectionButton){
    event.preventDefault();
    const source = TANJAI.$(`#${sectionButton.dataset.copySource || "videoOut"}`);
    const text = source?.textContent || "";
    const section = sectionButton.dataset.copyVideoSection;
    const marker = section === "voice" ? "CAPCUT_VOICE_SCRIPT" : section === "dialogue" ? "CAPCUT_CHARACTER_DIALOGUE" : "SHORT_SHOT_PROMPTS";
    const label = section === "voice" ? "สคริปต์เสียง CapCut" : section === "dialogue" ? "บทพูดตัวละคร" : "Prompt รายช็อต";
    const block = TANJAI.extractMarkedBlock(text, marker);
    TANJAI.copyText(block || text);
    if(block) TANJAI.toast?.(`คัดลอก${label}แล้ว`);
    return;
  }
  const resetButton = event.target.closest?.("[data-reset-output]");
  if(!resetButton) return;
  const output = TANJAI.$(`#${resetButton.dataset.resetOutput}`);
  if(!output) return;
  output.textContent = output.dataset.generatedText || "";
  output.dataset.edited = "false";
  resetButton.hidden = true;
  const tool = output.dataset.editableOutput;
  const status = TANJAI.$(`#${tool}EditStatus`);
  if(status) status.textContent = "คืนค่าฉบับที่สร้างแล้ว — ยังแก้ไขต่อได้ทันที";
  TANJAI.toast?.("คืนค่าฉบับที่สร้างแล้ว");
});

TANJAI.applyTemplate = function(key, targetView){
  const t = TANJAI.templates[key]; if(!t) return;
  const current = TANJAI.state.currentView === "dashboard" || TANJAI.state.currentView === "library" ? (t.primaryView || "kit") : TANJAI.state.currentView;
  const view = targetView || current;
  TANJAI.switchView(view);
  const prefix = view === "kit" ? "kit" : view;
  ["title","orgName","audience","detail","dateTime","place","people"].forEach(k=>{
    const el = TANJAI.$(`#${prefix}-${k}`);
    if(el) el.value = t[k] || "";
  });
  const orgType = TANJAI.$(`#${prefix}-orgType`);
  if(orgType && t.orgType) orgType.value = t.orgType;
  TANJAI.toast?.("ใส่ตัวอย่างให้แล้ว — ตรวจข้อมูลจริงก่อนกดสร้าง Prompt");
};

TANJAI.renderLibrary = function(){
  const el = TANJAI.$("#libraryGrid"); if(!el) return;
  el.innerHTML = Object.entries(TANJAI.templates).map(([key,t])=>`
    <article class="library-card sales-example-card-v877">
      <span class="tag">${t.tag || "ตัวอย่าง"}</span>
      <b>${t.icon} ${t.name}</b>
      <h4>${t.title}</h4>
      <p>${t.detail}</p>
      <div class="example-mini-meta-v877">
        <small>เหมาะกับ: ${t.orgType || "หลายประเภทงาน"}</small>
        <small>เริ่มที่เมนู: ${t.primaryView === "kit" ? "สร้าง Prompt ครบชุด" : (t.primaryView || "image")}</small>
      </div>
      <div class="button-row">
        <button class="btn primary" data-template="${key}" data-template-view="${t.primaryView || "kit"}">ใช้ตัวอย่างนี้</button>
        <button class="btn secondary" data-template="${key}" data-template-view="kit">สร้าง Prompt ครบชุด</button>
      </div>
    </article>
  `).join("");
};

TANJAI.renderPromptHub = function(){
  const el=TANJAI.$("#promptGrid"); if(!el) return;
  el.innerHTML=(TANJAI.promptHub||[]).map((p,i)=>`<article class="library-card"><span class="tag">${p.tool}</span><b>${p.name}</b><p>${p.text}</p><div class="button-row"><button class="btn secondary" data-copy-prompt="${i}">คัดลอก</button></div></article>`).join("");
  TANJAI.$$("[data-copy-prompt]").forEach(btn=>btn.onclick=()=>TANJAI.copyText(TANJAI.promptHub[btn.dataset.copyPrompt].text));
};
TANJAI.renderDestinations = function(){
  const el=TANJAI.$("#destinationGrid"); if(!el) return;
  el.innerHTML=(TANJAI.destinations||[]).map((d,i)=>{
    const name = d.name || d.title || "เครื่องมือ";
    const group = d.group || d.category || d.tag || "ปลายทาง";
    const desc = d.desc || d.description || "";
    const url = d.url || "#";
    return `<article class="library-card"><span class="tag">${group}</span><b>${name}</b><p>${desc}</p><div class="button-row"><button class="btn secondary" data-open="${url}">เปิดใช้งาน</button></div></article>`;
  }).join("");
};


/* v9.1.3 startup-safe utilities */
if(!TANJAI.setupNavigationHistory){
  TANJAI.setupNavigationHistory = function(){};
}

TANJAI.showImageResult = function(imageUrl, meta={}) {
  const box = document.getElementById("imageOut");
  if(!box || !imageUrl) return;
  const prompt = TANJAI.escapeHTML?.(meta.prompt || TANJAI.state?.lastImageGPT || "") || "";
  box.dataset.edited = "false";
  box.innerHTML = `
    <figure class="generated-image-card-v10">
      <img src="${imageUrl}" alt="ภาพที่สร้างด้วย AI ในเว็บ">
      <figcaption>
        <b>ภาพที่สร้างในเว็บพร้อมใช้งาน</b>
        <span>${meta.model ? `โมเดล: ${TANJAI.escapeHTML(meta.model)}` : "สร้างผ่าน AI Worker หลังบ้าน"}</span>
      </figcaption>
      <div class="button-row">
        <a href="${imageUrl}" download="tanjai-ai-image.jpg" class="btn primary">ดาวน์โหลดภาพ</a>
        <button class="btn secondary" data-copy-image="execute" type="button">คัดลอก Prompt</button>
      </div>
      ${prompt ? `<details class="generated-image-prompt-v10"><summary>ดู Prompt ที่ใช้สร้าง</summary><pre>${prompt}</pre></details>` : ""}
    </figure>`;
};

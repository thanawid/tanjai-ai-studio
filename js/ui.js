window.TANJAI = window.TANJAI || {};
const TANJAI_CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio";
TANJAI.openCustomGPT = function(){ window.open(TANJAI_CUSTOM_GPT_URL, "_blank", "noopener,noreferrer"); };
TANJAI.$ = s => document.querySelector(s);
TANJAI.$$ = s => Array.from(document.querySelectorAll(s));

TANJAI.toast = function(msg){
  const t = TANJAI.$("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 2600);
};

TANJAI.copyText = function(text){
  navigator.clipboard.writeText(text || "").then(()=>TANJAI.toast("คัดลอกแล้ว — เปิดเครื่องมือที่ต้องการ แล้วกด Ctrl+V เพื่อวาง"));
};

TANJAI.downloadText = function(text, filename){
  const blob = new Blob([text || ""], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "tanjai-output.txt";
  a.click();
  URL.revokeObjectURL(a.href);
};

TANJAI.validViews = ["dashboard","router","image","post","video","voice","deck","kit","promptHub","destinationHub","projects","library","guide"];

TANJAI.switchView = function(id, options = {}){
  if(!TANJAI.validViews.includes(id)) id = "dashboard";

  TANJAI.$$(".view").forEach(v => v.classList.remove("active"));
  TANJAI.$("#"+id)?.classList.add("active");
  TANJAI.$$(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === id));

  const names = {
    dashboard:"สวัสดีครับ! 👋",
    router:"AI Router",
    image:"สร้างภาพ",
    post:"สคริปต์สรุปงาน",
    video:"ทำวิดีโอ",
    voice:"เสียงพากย์",
    deck:"ทำสไลด์",
    kit:"สร้างชุดสื่อ",
    promptHub:"Prompt Hub",
    destinationHub:"Destination Hub",
    projects:"โปรเจกต์",
    library:"ตัวอย่างงาน",
    guide:"คู่มือระบบ"
  };
  const title = TANJAI.$("#pageTitle");
  if(title) title.textContent = names[id] || "ทันใจ AI Studio";

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
  return `
    <div class="form-section">
      <div class="section-title"><b>1</b><h4>ข้อมูลพื้นฐาน</h4></div>
      <div class="form-grid">
        <label>หัวข้องาน<input id="${prefix}-title" placeholder="เช่น แจ้งข่าวสำคัญ / โปรโมชัน / โครงการ"></label>
        <label>ชื่อองค์กร / แบรนด์<input id="${prefix}-orgName" placeholder="เช่น เทศบาลเมืองบางรักน้อย"></label>
        <label>กลุ่มเป้าหมาย<select id="${prefix}-audience">${opts(c.audiences)}</select></label>
        <label>โทนภาษา<select id="${prefix}-tone">${opts(c.tones)}</select></label>
        <label class="full">รายละเอียด<textarea id="${prefix}-detail" placeholder="ใส่เนื้อหาที่ต้องการให้ระบบช่วยคิด"></textarea></label>
        <label>วัน / เวลา<input id="${prefix}-dateTime" placeholder="ถ้ามี"></label>
        <label>สถานที่<input id="${prefix}-place" placeholder="ถ้ามี"></label>
        <label class="full">บุคคล / หน่วยงานที่เกี่ยวข้อง<input id="${prefix}-people" placeholder="ถ้ามี"></label>
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
        ${buttons}
        <button class="btn primary compact-action" data-copyopen="${bodyId}">ส่งเข้า GPT</button>
      </div>
    </div>
    <div id="${bodyId}" class="result-box stable-empty">กดปุ่มสร้าง แล้วผลลัพธ์จะแสดงตรงนี้</div>
  `;
};

TANJAI.getToolDestinations = function(tool){
  const GPT = TANJAI.customGptUrl || TANJAI_CUSTOM_GPT_URL;
  const map = {
    image:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Canva", url:"https://www.canva.com/"}],
    post:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Notebook Tool", url:"https://notebooklm.google.com/"},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"}],
    video:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด CapCut", url:"https://www.capcut.com/"}],
    voice:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Voice Tool", url:"https://aistudio.google.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"}],
    deck:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Slide Tool", url:"https://gamma.app/"},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด Notebook Tool", url:"https://notebooklm.google.com/"}],
    kit:[{label:"เปิด ทันใจ GPT", url:GPT},{label:"เปิด Canva", url:"https://www.canva.com/"},{label:"เปิด CapCut", url:"https://www.capcut.com/"},{label:"เปิด Voice Tool", url:"https://aistudio.google.com/"},{label:"เปิด Slide Tool", url:"https://gamma.app/"}]
  };
  return map[tool] || [{label:"เปิด ทันใจ GPT", url:GPT}];
};

TANJAI.primaryActionButtons = function(tool, bodyId){
  const GPT = TANJAI.customGptUrl || TANJAI_CUSTOM_GPT_URL;
  const btn = (label, attrs, cls="secondary")=>`<button class="btn ${cls}" ${attrs}>${label}</button>`;
  if(tool === "image") return btn("คัดลอก Prompt", `data-copybox="${bodyId}"`, "primary") + btn("เปิด ทันใจ GPT", `data-open="${GPT}"`);
  if(tool === "post") return btn("คัดลอกข้อความ", `data-copybox="${bodyId}"`, "primary") + btn("เปิด ทันใจ GPT", `data-open="${GPT}"`);
  if(tool === "video") return btn("คัดลอก Storyboard", `data-copybox="${bodyId}"`, "primary") + btn("เปิด CapCut", `data-open="https://www.capcut.com/"`);
  if(tool === "voice") return btn("คัดลอกสคริปต์", `data-copybox="${bodyId}"`, "primary") + btn("เปิด Voice Tool", `data-open="https://aistudio.google.com/"`);
  if(tool === "deck") return btn("คัดลอก Outline", `data-copybox="${bodyId}"`, "primary") + btn("เปิด Slide Tool", `data-open="https://gamma.app/"`);
  if(tool === "kit") return btn("คัดลอกชุดสื่อ", `data-copybox="${bodyId}"`, "primary") + btn("เปิด ทันใจ GPT", `data-open="${GPT}"`);
  return btn("คัดลอกผลลัพธ์", `data-copybox="${bodyId}"`, "primary");
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
      <div class="result-buttons stable-result-buttons primary-first-actions">
        ${TANJAI.primaryActionButtons(tool, bodyId)}
      </div>
    </div>
    <div id="${bodyId}" class="result-box stable-empty">กดปุ่มสร้าง แล้วผลลัพธ์พร้อมใช้จะแสดงตรงนี้</div>
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

TANJAI.applyTemplate = function(key){
  const t = TANJAI.templates[key]; if(!t) return;
  const view = TANJAI.state.currentView === "dashboard" ? "image" : TANJAI.state.currentView;
  TANJAI.switchView(view);
  const prefix = view === "kit" ? "kit" : view;
  ["title","orgName","audience","detail","dateTime","place","people"].forEach(k=>{
    const el = TANJAI.$(`#${prefix}-${k}`);
    if(el) el.value = t[k] || "";
  });
};

TANJAI.renderLibrary = function(){
  const el = TANJAI.$("#libraryGrid"); if(!el) return;
  el.innerHTML = Object.entries(TANJAI.templates).map(([key,t])=>`
    <article class="library-card">
      <b>${t.icon} ${t.name}</b>
      <p>${t.title}<br>${t.detail}</p>
      <button class="btn secondary" data-template="${key}">ใช้ตัวอย่างนี้</button>
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


/* v6.2.8 fallback setupNavigationHistory */
if(!TANJAI.setupNavigationHistory){
  TANJAI.setupNavigationHistory = function(){};
}

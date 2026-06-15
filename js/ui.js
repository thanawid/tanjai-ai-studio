window.TANJAI = window.TANJAI || {};
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

TANJAI.switchView = function(id){
  TANJAI.$$(".view").forEach(v => v.classList.remove("active"));
  TANJAI.$("#"+id)?.classList.add("active");
  TANJAI.$$(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === id));
  const names = {dashboard:"สวัสดีครับ! 👋",image:"สร้างภาพ",post:"เขียนโพสต์",video:"ทำวิดีโอ",voice:"เสียงพากย์",deck:"ทำสไลด์",kit:"สร้างชุดสื่อ",projects:"โปรเจกต์",library:"ตัวอย่างงาน",guide:"คู่มือระบบ"};
  TANJAI.$("#pageTitle").textContent = names[id] || "ทันใจ AI Studio";
  if(id === "projects") TANJAI.renderProjects();
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
    <div class="result-action">
      <div><small>ผลลัพธ์ที่แนะนำ</small><h4>${recommended}</h4><p>${desc}</p></div>
      ${buttons}
    </div>
    <div class="destination-actions">
      <button class="btn secondary" data-open="https://chatgpt.com/">เปิด ChatGPT</button>
      <button class="btn secondary" data-open="https://www.canva.com/">เปิด Canva</button>
      <button class="btn secondary" data-open="https://www.capcut.com/">เปิด CapCut</button>
    </div>
    <div id="${bodyId}" class="result-box">กดปุ่มสร้าง แล้วผลลัพธ์จะแสดงตรงนี้</div>
  `;
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
  el.innerHTML=(TANJAI.destinations||[]).map((d,i)=>`<article class="library-card"><span class="tag">${d.group}</span><b>${d.name}</b><p>${d.desc}</p><div class="button-row"><button class="btn secondary" data-open="${d.url}">เปิดใช้งาน</button></div></article>`).join("");
};

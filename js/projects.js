window.TANJAI = window.TANJAI || {};
TANJAI.getProjects = () => JSON.parse(localStorage.getItem("tanjaiV5Projects") || "[]");
TANJAI.saveProjects = items => localStorage.setItem("tanjaiV5Projects", JSON.stringify(items.slice(0,80)));

TANJAI.saveProject = function(title, text, tool){
  const items = TANJAI.getProjects();
  items.unshift({title, text, tool, date:new Date().toLocaleString("th-TH")});
  TANJAI.saveProjects(items);
  TANJAI.renderProjects();
  TANJAI.toast("บันทึกโปรเจกต์แล้ว");
};

TANJAI.renderProjects = function(){
  const el = TANJAI.$("#projectsList");
  if(!el) return;
  const items = TANJAI.getProjects();
  if(!items.length){ el.innerHTML = `<div class="rights-box">ยังไม่มีโปรเจกต์ที่บันทึก</div>`; return; }
  el.innerHTML = items.map((p,i)=>`
    <article class="project-card">
      <b>${p.title}</b>
      <span>${p.tool} • ${p.date}</span>
      <div class="button-row">
        <button class="btn secondary" data-copy-project="${i}">คัดลอก</button>
        <button class="btn secondary" data-del-project="${i}">ลบ</button>
      </div>
    </article>
  `).join("");
  TANJAI.$$("[data-copy-project]").forEach(btn=>btn.onclick=()=>TANJAI.copyText(items[btn.dataset.copyProject].text));
  TANJAI.$$("[data-del-project]").forEach(btn=>btn.onclick=()=>{items.splice(Number(btn.dataset.delProject),1);TANJAI.saveProjects(items);TANJAI.renderProjects();});
};

window.TANJAI = window.TANJAI || {};

/**
 * HTML Escape function to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML text
 */
TANJAI.escapeHtml = function(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text || '').replace(/[&<>"']/g, char => map[char]);
};

// Firebase Integrated Projects Module
TANJAI.isCloudAuth = function(){
  const user = window.TANJAI_AUTH && window.TANJAI_AUTH.getCurrentUser && window.TANJAI_AUTH.getCurrentUser();
  return !!(user && user.uid && user.mode !== "local-fallback");
};

TANJAI.readLocalProjects = function(){
  try{
    const value = JSON.parse(localStorage.getItem("tanjaiV5Projects") || "[]");
    return Array.isArray(value) ? value : [];
  }catch(_error){
    localStorage.removeItem("tanjaiV5Projects");
    TANJAI.toast?.("ข้อมูลโปรเจกต์เดิมเสียหาย ระบบเริ่มรายการใหม่ให้แล้ว");
    return [];
  }
};

TANJAI.saveProjectLocal = function(title, text, tool){
  const items = TANJAI.readLocalProjects();
  items.unshift({
    title: String(title || "").trim(),
    text: String(text || "").trim(),
    tool: String(tool || "").trim(),
    date: new Date().toLocaleString("th-TH")
  });
  localStorage.setItem("tanjaiV5Projects", JSON.stringify(items.slice(0, 80)));
  TANJAI.renderProjects();
  TANJAI.toast("บันทึกโปรเจกต์ (Local) แล้ว");
};

TANJAI.saveProject = function(title, text, tool) {
  if(!String(text || "").trim()){
    TANJAI.toast("ยังไม่มีผลลัพธ์ให้บันทึก — กรุณากดสร้างก่อน");
    return;
  }
  if (TANJAI.isCloudAuth() && window.TANJAI_AUTH && window.TANJAI_AUTH.saveProjectToCloud) {
    window.TANJAI_AUTH.saveProjectToCloud(title, text, tool);
  } else {
    TANJAI.saveProjectLocal(title, text, tool);
  }
};

TANJAI.renderProjects = async function() {
  const el = TANJAI.$("#projectsList");
  if (!el) return;
  const clearButton = TANJAI.$("#clearProjects");
  if(clearButton) clearButton.hidden = TANJAI.isCloudAuth();
  
  let items = [];
  if (TANJAI.isCloudAuth() && window.TANJAI_AUTH && window.TANJAI_AUTH.getProjectsFromCloud) {
    el.innerHTML = `<div class="empty-state"><b>กำลังโหลดงานจาก Cloud...</b></div>`;
    items = await window.TANJAI_AUTH.getProjectsFromCloud();
  } else {
    items = TANJAI.readLocalProjects();
  }
  
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><b>ยังไม่มีโปรเจกต์ที่บันทึกไว้</b><span>เมื่อสร้างงานแล้วกดบันทึก งานจะมาอยู่ตรงนี้</span></div>`;
    return;
  }
  
  el.innerHTML = items.map((p, i) => `
    <article class="project-card">
      <b>${TANJAI.escapeHtml(p.title)}</b>
      <span>${TANJAI.escapeHtml(p.tool)} • ${TANJAI.escapeHtml(p.date ? (String(p.date).includes('T') ? new Date(p.date).toLocaleString('th-TH') : p.date) : '')}</span>
      <div class="button-row">
        ${String(p.text||'').includes('##TANJAI_ALBUM##') ? `<button class="btn primary" data-load-album="${i}">ใช้เป็นต้นแบบ</button>` : ''}
        <button class="btn secondary" data-copy-project="${i}">คัดลอก</button>
        <button class="btn secondary" data-del-project="${i}" data-id="${TANJAI.escapeHtml(p.id || '')}">ลบ</button>
      </div>
    </article>
  `).join("");
  
  TANJAI.$$("[data-copy-project]").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.copyProject);
      if (items[idx] && items[idx].text) {
        TANJAI.copyText(String(items[idx].text).split('##TANJAI_ALBUM##')[0].trim());
      }
    };
  });
  
  TANJAI.$$("[data-load-album]").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.loadAlbum);
      const raw = items[idx] && items[idx].text ? String(items[idx].text) : '';
      const mark = raw.indexOf('##TANJAI_ALBUM##');
      if(mark < 0) return;
      try{
        const snap = JSON.parse(raw.slice(mark + 16));
        TANJAI.applyAlbumTemplate?.(snap);
      }catch(_){ TANJAI.toast?.('ข้อมูลต้นแบบเสียหาย'); }
    };
  });

  TANJAI.$$("[data-del-project]").forEach(btn => {
    btn.onclick = async () => {
      const idx = Number(btn.dataset.delProject);
      const projectId = btn.dataset.id;
      
      if (confirm("คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?")) {
        if (projectId && TANJAI.isCloudAuth() && window.TANJAI_AUTH) {
          await window.TANJAI_AUTH.deleteProjectFromCloud(projectId);
        } else {
          items.splice(idx, 1);
          localStorage.setItem("tanjaiV5Projects", JSON.stringify(items));
          TANJAI.renderProjects();
        }
      }
    };
  });
};

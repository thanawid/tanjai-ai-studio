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

TANJAI.saveProjectLocal = function(title, text, tool){
  const items = JSON.parse(localStorage.getItem("tanjaiV5Projects") || "[]");
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
  if (TANJAI.isCloudAuth() && window.TANJAI_AUTH && window.TANJAI_AUTH.saveProjectToCloud) {
    window.TANJAI_AUTH.saveProjectToCloud(title, text, tool);
  } else {
    TANJAI.saveProjectLocal(title, text, tool);
  }
};

TANJAI.renderProjects = async function() {
  const el = TANJAI.$("#projectsList");
  if (!el) return;
  
  let items = [];
  if (TANJAI.isCloudAuth() && window.TANJAI_AUTH && window.TANJAI_AUTH.getProjectsFromCloud) {
    el.innerHTML = `<div class="empty-state"><b>กำลังโหลดงานจาก Cloud...</b></div>`;
    items = await window.TANJAI_AUTH.getProjectsFromCloud();
  } else {
    items = JSON.parse(localStorage.getItem("tanjaiV5Projects") || "[]");
  }
  
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><b>ยังไม่มีโปรเจกต์ที่บันทึกไว้</b><span>เมื่อสร้างงานแล้วกดบันทึก งานจะมาอยู่ตรงนี้</span></div>`;
    return;
  }
  
  el.innerHTML = items.map((p, i) => `
    <article class="project-card">
      <b>${TANJAI.escapeHtml(p.title)}</b>
      <span>${TANJAI.escapeHtml(p.tool)} • ${p.date ? (p.date.includes('T') ? new Date(p.date).toLocaleString('th-TH') : p.date) : ''}</span>
      <div class="button-row">
        <button class="btn secondary" data-copy-project="${i}">คัดลอก</button>
        <button class="btn secondary" data-del-project="${i}" data-id="${p.id || ''}">ลบ</button>
      </div>
    </article>
  `).join("");
  
  TANJAI.$$("[data-copy-project]").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.copyProject);
      if (items[idx] && items[idx].text) {
        TANJAI.copyText(items[idx].text);
      }
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

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

TANJAI.getProjects = () => JSON.parse(localStorage.getItem("tanjaiV5Projects") || "[]");
TANJAI.saveProjects = items => localStorage.setItem("tanjaiV5Projects", JSON.stringify(items.slice(0, 80)));

TANJAI.saveProject = function(title, text, tool) {
  const items = TANJAI.getProjects();
  items.unshift({
    title: String(title || "").trim(),
    text: String(text || "").trim(),
    tool: String(tool || "").trim(),
    date: new Date().toLocaleString("th-TH")
  });
  TANJAI.saveProjects(items);
  TANJAI.renderProjects();
  TANJAI.toast("บันทึกโปรเจกต์แล้ว");
};

TANJAI.renderProjects = function() {
  const el = TANJAI.$("#projectsList");
  if (!el) return;
  
  const items = TANJAI.getProjects();
  
  if (!items.length) {
    el.innerHTML = `<div class="empty-state"><b>ยังไม่มีโปรเจกต์ที่บันทึกไว้</b><span>เมื่อสร้างงานแล้วกดบันทึก งานจะมาอยู่ตรงนี้</span></div>`;
    return;
  }
  
  el.innerHTML = items.map((p, i) => `
    <article class="project-card">
      <b>${TANJAI.escapeHtml(p.title)}</b>
      <span>${TANJAI.escapeHtml(p.tool)} • ${TANJAI.escapeHtml(p.date)}</span>
      <div class="button-row">
        <button class="btn secondary" data-copy-project="${i}">คัดลอก</button>
        <button class="btn secondary" data-del-project="${i}">ลบ</button>
      </div>
    </article>
  `).join("");
  
  TANJAI.$$("[data-copy-project]").forEach(btn => {
    btn.onclick = () => {
      const projectIndex = Number(btn.dataset.copyProject);
      if (items[projectIndex] && items[projectIndex].text) {
        TANJAI.copyText(items[projectIndex].text);
      }
    };
  });
  
  TANJAI.$$("[data-del-project]").forEach(btn => {
    btn.onclick = () => {
      const projectIndex = Number(btn.dataset.delProject);
      if (projectIndex >= 0 && projectIndex < items.length) {
        items.splice(projectIndex, 1);
        TANJAI.saveProjects(items);
        TANJAI.renderProjects();
      }
    };
  });
};

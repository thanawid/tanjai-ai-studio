window.TANJAI = window.TANJAI || {};

(() => {
  const state = {
    mode: 'editor', clips: [], activeClipId: null, busy: false,
    look: { preset: 'auto', brightness: 100, contrast: 100, saturation: 100, warmth: 0 },
    audio: { normalize: true, noiseReduce: true },
    destination: 'short'
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v = '') => String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid = () => `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fmtTime = (sec = 0) => { const s = Math.max(0, Math.round(sec || 0)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  const fmtSize = bytes => bytes < 1048576 ? `${Math.max(1, Math.round(bytes/1024))} KB` : `${(bytes/1048576).toFixed(1)} MB`;
  const clipById = id => state.clips.find(c => c.id === id);
  const activeClip = () => clipById(state.activeClipId);

  function install() {
    const form = $('#videoForm');
    const result = $('#videoResult');
    if (!form || !result || $('#videoEditorWorkspace')) return;

    const originalForm = document.createElement('div');
    originalForm.id = 'videoScriptMode';
    while (form.firstChild) originalForm.appendChild(form.firstChild);

    form.appendChild(document.createRange().createContextualFragment(`
      <div class="video-mode-switch" role="tablist">
        <button type="button" class="video-mode-btn" data-video-mode="script">✨ เริ่มจากไอเดีย</button>
        <button type="button" class="video-mode-btn active" data-video-mode="editor">🎬 ใช้คลิปที่มี</button>
      </div>`));
    form.appendChild(originalForm);

    const workspace = document.createElement('div');
    workspace.id = 'videoEditorWorkspace';
    workspace.innerHTML = editorHTML();
    form.appendChild(workspace);

    const originalResult = document.createElement('div');
    originalResult.id = 'videoScriptResultMode';
    while (result.firstChild) originalResult.appendChild(result.firstChild);
    result.appendChild(originalResult);

    const editorResult = document.createElement('div');
    editorResult.id = 'videoEditorResultMode';
    editorResult.innerHTML = resultHTML();
    result.appendChild(editorResult);

    bind();
    setMode('editor');
    render();
  }

  function editorHTML() {
    return `
      <section class="vprep-card vprep-intro">
        <div>
          <small>ขั้นตอนที่ 1</small>
          <h3>โยนคลิปเข้ามา</h3>
          <p>AI จะตรวจภาพ แสง สี และเสียง แล้วปรับคลิปให้พร้อมใช้ทันที</p>
        </div>
        <span class="vprep-status" id="vprepStatus">รอคลิป</span>
      </section>

      <label class="video-dropzone vprep-drop" id="videoDropzone">
        <input id="videoFootageInput" type="file" accept="video/*" multiple hidden>
        <span class="video-drop-icon">☁️</span>
        <strong>ลากคลิปมาวาง หรือคลิกเลือกไฟล์</strong>
        <small>รองรับ MP4, MOV, AVI, MKV และเลือกหลายคลิปได้</small>
        <button class="btn primary" type="button" id="pickFootageBtn">เลือกคลิป</button>
      </label>

      <div class="vprep-upload-head">
        <div><b>คลิปที่อัปโหลด</b><small id="videoUploadSummary">ยังไม่มีคลิป</small></div>
        <button class="btn secondary" id="clearFootageBtn" type="button">ล้างคลิป</button>
      </div>
      <div class="vprep-clip-list" id="videoClipGrid"></div>

      <div class="vprep-auto-note" id="vprepAutoNote">
        <span>✨</span><div><b>AI ปรับคลิปให้อัตโนมัติ</b><small>เมื่อเพิ่มคลิป ระบบจะเลือกค่าที่เหมาะสมให้ก่อน และคุณยังเลือกแนวอื่นได้เอง</small></div>
      </div>`;
  }

  function resultHTML() {
    return `
      <section class="vprep-adjust" id="videoLookPanel">
        <header class="vprep-adjust-head">
          <div><small>ขั้นตอนที่ 2</small><h3>AI แต่งคลิปให้</h3><p>เลือกแนวที่ต้องการ หรือปรับเองแบบเมนูแต่งภาพ AI</p></div>
          <button class="btn primary" id="autoLookBtn" type="button">✨ แนะนำอัตโนมัติ</button>
        </header>

        <div class="vprep-tabs" role="tablist">
          <button type="button" class="active" data-adjust-tab="look">☀ แสง & สี</button>
          <button type="button" data-adjust-tab="audio">🔊 เสียง</button>
          <button type="button" data-adjust-tab="advanced">⚙ ปรับเอง</button>
        </div>

        <div class="vprep-main-grid">
          <div class="vprep-controls">
            <div class="vprep-pane active" data-adjust-pane="look">
              <div class="vprep-preset-grid" id="lookPresets">
                <button type="button" data-look="auto" class="active"><span class="preset-thumb preset-auto">✨</span><b>อัตโนมัติ</b><small>AI เลือกให้เหมาะสม</small></button>
                <button type="button" data-look="natural"><span class="preset-thumb preset-natural">🌿</span><b>ธรรมชาติ</b><small>สีจริง ดูสบายตา</small></button>
                <button type="button" data-look="bright"><span class="preset-thumb preset-bright">☀️</span><b>สดใส</b><small>สว่าง สีเด่น</small></button>
                <button type="button" data-look="warm"><span class="preset-thumb preset-warm">🌅</span><b>อบอุ่น</b><small>นุ่มนวล เป็นมิตร</small></button>
                <button type="button" data-look="cinema"><span class="preset-thumb preset-cinema">🎬</span><b>ภาพยนตร์</b><small>เข้ม มีมิติ</small></button>
                <button type="button" data-look="news"><span class="preset-thumb preset-news">📺</span><b>ข่าว / งานกิจกรรม</b><small>คม ชัด น่าเชื่อถือ</small></button>
              </div>
              <div class="vprep-ai-summary" id="lookSummary">เพิ่มคลิปเพื่อให้ AI แนะนำแนวภาพ</div>
            </div>

            <div class="vprep-pane" data-adjust-pane="audio">
              <label class="vprep-toggle"><input id="audioNormalize" type="checkbox" checked><span><b>ปรับระดับเสียงอัตโนมัติ</b><small>ช่วยให้เสียงดังสม่ำเสมอและฟังชัดขึ้น</small></span></label>
              <label class="vprep-toggle"><input id="audioNoise" type="checkbox" checked><span><b>ลดเสียงรบกวน</b><small>ลดเสียงลม เสียงฮัม และเสียงพื้นหลังเบื้องต้น</small></span></label>
              <div class="vprep-info-note">การดูตัวอย่างจะแสดงภาพที่ปรับทันที ส่วนการประมวลผลไฟล์จะทำเมื่อกดดาวน์โหลด</div>
            </div>

            <div class="vprep-pane" data-adjust-pane="advanced">
              <div class="vprep-sliders">
                <label><span>ความสว่าง</span><input id="lookBrightness" type="range" min="65" max="140" value="100"><output>0</output></label>
                <label><span>คอนทราสต์</span><input id="lookContrast" type="range" min="65" max="145" value="100"><output>0</output></label>
                <label><span>ความอิ่มสี</span><input id="lookSaturation" type="range" min="50" max="160" value="100"><output>0</output></label>
                <label><span>อุณหภูมิสี</span><input id="lookWarmth" type="range" min="-30" max="30" value="0"><output>0</output></label>
              </div>
              <button class="btn secondary" id="resetLookBtn" type="button">↶ รีเซ็ต</button>
            </div>
          </div>

          <div class="vprep-preview-column">
            <div class="vprep-preview-head"><b>ตัวอย่างหลังปรับ</b><small id="previewPresetLabel">อัตโนมัติ</small></div>
            <div class="editor-preview-stage" id="editorPreviewStage"></div>
            <div class="vprep-clip-meta" id="activeClipMeta"></div>
          </div>
        </div>
      </section>

      <section class="vprep-destination" id="vprepDestination">
        <header><div><small>ขั้นตอนที่ 3</small><h3>เลือกว่าจะนำคลิปไปทางไหน</h3></div><span>คลิปที่ปรับแล้วพร้อมใช้งาน</span></header>
        <div class="vprep-destination-grid">
          <article class="vprep-action-card download">
            <span>⬇</span><div><b>ดาวน์โหลดคลิปที่ปรับแล้ว</b><small>นำไปตัดต่อเองใน CapCut, Premiere หรือโปรแกรมที่ถนัด</small></div>
            <button class="btn primary" id="downloadAdjustedBtn" type="button">ดาวน์โหลดคลิปนี้</button>
          </article>
          <article class="vprep-action-card ai">
            <span>✨</span><div><b>ให้ AI ทำต่อ</b><small>เลือกแนวทางนำเสนอ แล้วให้ AI ช่วยวางโครงและคัดช่วงคลิป</small></div>
            <button class="btn primary" id="showAiDestinationsBtn" type="button">เลือกแนวทางนำเสนอ</button>
          </article>
        </div>
        <div class="vprep-ai-destinations" id="aiDestinations" hidden>
          <div class="vprep-ai-recommend"><span>AI แนะนำ</span><b id="aiRecommendedText">คลิปสั้นสรุปกิจกรรม</b><small id="aiRecommendedReason">เหมาะกับคลิปที่อัปโหลดและความยาวรวม</small></div>
          <div class="vprep-destination-options">
            <button type="button" class="active" data-destination="short"><b>คลิปสั้น</b><small>Reels / TikTok / Shorts</small></button>
            <button type="button" data-destination="summary"><b>สรุปกิจกรรม</b><small>เล่าเรื่องครบ กระชับ</small></button>
            <button type="button" data-destination="highlight"><b>ไฮไลต์</b><small>รวมช่วงเด่นและบรรยากาศ</small></button>
            <button type="button" data-destination="news"><b>ข่าวประชาสัมพันธ์</b><small>ทางการ ชัดเจน น่าเชื่อถือ</small></button>
          </div>
          <button class="btn primary vprep-continue-btn" id="continueAiBtn" type="button">ให้ AI วางโครงคลิปนี้ต่อ →</button>
        </div>
      </section>

      <div class="vprep-render-progress" id="renderProgress" hidden><b>กำลังสร้างคลิปที่ปรับแล้ว</b><div><i id="renderProgressBar"></i></div><small id="renderProgressText">กำลังเตรียม...</small></div>`;
  }

  function bind() {
    $$('[data-video-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.videoMode)));
    $('#pickFootageBtn')?.addEventListener('click', e => { e.preventDefault(); $('#videoFootageInput')?.click(); });
    $('#videoFootageInput')?.addEventListener('change', e => addFiles(e.target.files));
    $('#clearFootageBtn')?.addEventListener('click', clearFiles);

    const dz = $('#videoDropzone');
    ['dragenter','dragover'].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragging'); }));
    ['dragleave','drop'].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragging'); }));
    dz?.addEventListener('drop', e => addFiles(e.dataTransfer.files));

    $$('[data-adjust-tab]').forEach(btn => btn.addEventListener('click', () => setAdjustTab(btn.dataset.adjustTab)));
    $$('[data-look]').forEach(btn => btn.addEventListener('click', () => applyPreset(btn.dataset.look, true)));
    $('#autoLookBtn')?.addEventListener('click', () => suggestLook(true));
    $('#resetLookBtn')?.addEventListener('click', () => applyPreset('auto', true));

    const sliders = { lookBrightness:'brightness', lookContrast:'contrast', lookSaturation:'saturation', lookWarmth:'warmth' };
    Object.entries(sliders).forEach(([id,key]) => $('#'+id)?.addEventListener('input', e => {
      state.look[key] = Number(e.target.value); state.look.preset = 'custom'; updateLookUI(); applyPreview();
    }));
    $('#audioNormalize')?.addEventListener('change', e => state.audio.normalize = e.target.checked);
    $('#audioNoise')?.addEventListener('change', e => state.audio.noiseReduce = e.target.checked);

    $('#downloadAdjustedBtn')?.addEventListener('click', renderAndDownloadActive);
    $('#showAiDestinationsBtn')?.addEventListener('click', () => {
      const box = $('#aiDestinations'); box.hidden = !box.hidden;
      if (!box.hidden) recommendDestination();
    });
    $$('[data-destination]').forEach(btn => btn.addEventListener('click', () => {
      state.destination = btn.dataset.destination;
      $$('[data-destination]').forEach(x => x.classList.toggle('active', x === btn));
    }));
    $('#continueAiBtn')?.addEventListener('click', continueWithAI);
  }

  function setMode(mode) {
    state.mode = mode;
    $('#videoScriptMode').hidden = mode !== 'script';
    $('#videoEditorWorkspace').hidden = mode !== 'editor';
    $('#videoScriptResultMode').hidden = mode !== 'script';
    $('#videoEditorResultMode').hidden = mode !== 'editor';
    $$('[data-video-mode]').forEach(b => b.classList.toggle('active', b.dataset.videoMode === mode));
  }

  function setAdjustTab(tab) {
    $$('[data-adjust-tab]').forEach(b => b.classList.toggle('active', b.dataset.adjustTab === tab));
    $$('[data-adjust-pane]').forEach(p => p.classList.toggle('active', p.dataset.adjustPane === tab));
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name));
    if (!files.length) { TANJAI.toast?.('กรุณาเลือกไฟล์วิดีโอ'); return; }
    for (const file of files) {
      const clip = { id: uid(), file, name:file.name, size:file.size, url:URL.createObjectURL(file), duration:0, width:0, height:0, thumbnail:'', brightness:null, status:'loading' };
      state.clips.push(clip);
      if (!state.activeClipId) state.activeClipId = clip.id;
      inspectClip(clip);
    }
    render();
    TANJAI.toast?.(`เพิ่ม ${files.length} คลิปแล้ว — AI กำลังปรับให้`);
  }

  function inspectClip(clip) {
    const v = document.createElement('video');
    v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = clip.url;
    v.onloadedmetadata = () => {
      clip.duration = Number(v.duration) || 0; clip.width = v.videoWidth || 0; clip.height = v.videoHeight || 0;
      const seek = Math.min(Math.max(.1, clip.duration * .22), Math.max(.1, clip.duration - .1));
      try { v.currentTime = seek; } catch (_) { clip.status = 'ready'; render(); }
    };
    v.onseeked = () => {
      try {
        const w = 320, h = Math.max(180, Math.round(w * ((v.videoHeight || 180)/(v.videoWidth || 320))));
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const ctx = c.getContext('2d', {willReadFrequently:true}); ctx.drawImage(v,0,0,w,h);
        clip.thumbnail = c.toDataURL('image/jpeg', .76);
        const d = ctx.getImageData(0,0,w,h).data; let lum = 0;
        for (let i=0;i<d.length;i+=4) lum += .299*d[i]+.587*d[i+1]+.114*d[i+2];
        clip.brightness = lum/(d.length/4);
      } catch (_) {}
      clip.status = 'ready';
      if (clip.id === state.activeClipId) suggestLook(false);
      render();
    };
    v.onerror = () => { clip.status = 'error'; render(); };
  }

  function presetValues(name) {
    return ({
      auto:{brightness:104,contrast:106,saturation:106,warmth:1},
      natural:{brightness:102,contrast:103,saturation:101,warmth:0},
      bright:{brightness:112,contrast:108,saturation:118,warmth:2},
      warm:{brightness:106,contrast:103,saturation:108,warmth:15},
      cinema:{brightness:94,contrast:124,saturation:90,warmth:7},
      news:{brightness:106,contrast:116,saturation:108,warmth:0}
    })[name] || {brightness:100,contrast:100,saturation:100,warmth:0};
  }

  function suggestLook(notify = false) {
    const clip = activeClip();
    let preset = 'natural';
    if (clip?.brightness != null) {
      if (clip.brightness < 82) preset = 'bright';
      else if (clip.brightness > 190) preset = 'cinema';
      else preset = 'news';
    }
    applyPreset(preset, false);
    if (notify) TANJAI.toast?.(`AI แนะนำแนว “${presetName(preset)}”`);
  }

  function applyPreset(name, notify = false) {
    state.look = { preset:name, ...presetValues(name) };
    updateLookUI(); applyPreview();
    if (notify) TANJAI.toast?.(`ใช้แนว ${presetName(name)} แล้ว`);
  }

  function presetName(name) {
    return ({auto:'อัตโนมัติ',natural:'ธรรมชาติ',bright:'สดใส',warm:'อบอุ่น',cinema:'ภาพยนตร์',news:'ข่าว / งานกิจกรรม',custom:'ปรับเอง'})[name] || name;
  }

  function filterString() {
    const l = state.look;
    const sepia = Math.max(0,l.warmth) * .45;
    const hue = l.warmth < 0 ? l.warmth * .55 : 0;
    return `brightness(${l.brightness}%) contrast(${l.contrast}%) saturate(${l.saturation}%) sepia(${sepia}%) hue-rotate(${hue}deg)`;
  }

  function canvasFilterString() {
    const l = state.look;
    return `brightness(${l.brightness}%) contrast(${l.contrast}%) saturate(${l.saturation}%) sepia(${Math.max(0,l.warmth)*.45}%) hue-rotate(${l.warmth<0?l.warmth*.55:0}deg)`;
  }

  function updateLookUI() {
    const map = {lookBrightness:'brightness',lookContrast:'contrast',lookSaturation:'saturation',lookWarmth:'warmth'};
    Object.entries(map).forEach(([id,key]) => {
      const input = $('#'+id); if (!input) return;
      input.value = state.look[key];
      const base = key === 'warmth' ? 0 : 100; const value = state.look[key]-base;
      const out = input.closest('label')?.querySelector('output'); if (out) out.textContent = `${value>0?'+':''}${value}`;
    });
    $$('[data-look]').forEach(b => b.classList.toggle('active', b.dataset.look === state.look.preset));
    const name = presetName(state.look.preset);
    if ($('#previewPresetLabel')) $('#previewPresetLabel').textContent = name;
    if ($('#lookSummary')) $('#lookSummary').innerHTML = `<b>AI ปรับให้แล้ว:</b> ${name} • สว่าง ${state.look.brightness-100>=0?'+':''}${state.look.brightness-100} • คอนทราสต์ ${state.look.contrast-100>=0?'+':''}${state.look.contrast-100} • สี ${state.look.saturation-100>=0?'+':''}${state.look.saturation-100}`;
  }

  function applyPreview() {
    const video = $('#editorPreviewStage video'); if (video) video.style.filter = filterString();
  }

  function render() {
    renderClips(); renderPreview(); updateLookUI();
    const status = $('#vprepStatus');
    if (status) status.textContent = !state.clips.length ? 'รอคลิป' : state.clips.some(c=>c.status==='loading') ? 'AI กำลังตรวจคลิป' : 'AI ปรับให้แล้ว';
    const btn = $('#downloadAdjustedBtn'); if (btn) btn.disabled = !activeClip() || state.busy;
  }

  function renderClips() {
    const grid = $('#videoClipGrid'); if (!grid) return;
    const total = state.clips.reduce((s,c)=>s+c.size,0), duration = state.clips.reduce((s,c)=>s+c.duration,0);
    $('#videoUploadSummary').textContent = state.clips.length ? `${state.clips.length} คลิป • ${fmtSize(total)} • รวม ${fmtTime(duration)}` : 'ยังไม่มีคลิป';
    grid.innerHTML = state.clips.length ? state.clips.map(c => `
      <article class="vprep-clip ${c.id===state.activeClipId?'active':''}" data-select-clip="${c.id}">
        <div class="vprep-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:'<span>🎞️</span>'}<small>${fmtTime(c.duration)}</small></div>
        <div><b title="${esc(c.name)}">${esc(c.name)}</b><small>${c.width&&c.height?`${c.width}×${c.height} • `:''}${fmtSize(c.size)}</small><em>${c.status==='loading'?'AI กำลังตรวจ...':c.status==='error'?'เปิดคลิปไม่ได้':'พร้อมปรับและดาวน์โหลด'}</em></div>
        <button type="button" class="clip-remove" data-remove-clip="${c.id}" aria-label="ลบ">×</button>
      </article>`).join('') : `<div class="vprep-empty-list">เมื่อเพิ่มคลิป รายการจะอยู่ตรงนี้</div>`;
    $$('[data-select-clip]',grid).forEach(el => el.addEventListener('click', e => { if(e.target.closest('[data-remove-clip]')) return; state.activeClipId=el.dataset.selectClip; suggestLook(false); render(); }));
    $$('[data-remove-clip]',grid).forEach(btn => btn.addEventListener('click', () => removeClip(btn.dataset.removeClip)));
  }

  function renderPreview() {
    const stage = $('#editorPreviewStage'); const meta = $('#activeClipMeta'); if (!stage || !meta) return;
    const c = activeClip();
    if (!c) {
      stage.innerHTML = `<div class="editor-empty-preview"><span>🎬</span><b>เพิ่มคลิปเพื่อดูตัวอย่าง</b><small>AI จะแต่งคลิปให้ทันทีหลังอัปโหลด</small></div>`;
      meta.innerHTML = `<div><span>ชื่อไฟล์</span><b>—</b></div><div><span>ความยาว</span><b>—</b></div><div><span>ความละเอียด</span><b>—</b></div>`;
      return;
    }
    stage.innerHTML = `<video src="${c.url}" controls playsinline preload="metadata" style="filter:${filterString()}"></video>`;
    meta.innerHTML = `<div><span>ชื่อไฟล์</span><b title="${esc(c.name)}">${esc(c.name)}</b></div><div><span>ความยาว</span><b>${fmtTime(c.duration)}</b></div><div><span>ความละเอียด</span><b>${c.width&&c.height?`${c.width}×${c.height}`:'กำลังอ่าน...'}</b></div>`;
  }

  function removeClip(id) {
    const c = clipById(id); if (c) URL.revokeObjectURL(c.url);
    state.clips = state.clips.filter(x=>x.id!==id);
    if (state.activeClipId===id) state.activeClipId=state.clips[0]?.id||null;
    render();
  }

  function clearFiles() {
    state.clips.forEach(c=>URL.revokeObjectURL(c.url)); state.clips=[]; state.activeClipId=null; render(); TANJAI.toast?.('ล้างคลิปแล้ว');
  }

  function recommendDestination() {
    const total = state.clips.reduce((s,c)=>s+c.duration,0);
    let dest='short', text='คลิปสั้นสรุปกิจกรรม', reason='เหมาะกับการเผยแพร่บน Facebook, Reels และ TikTok';
    if (state.clips.length >= 5 || total > 120) { dest='summary'; text='สรุปกิจกรรมแบบกระชับ'; reason='มีหลายคลิปและเนื้อหาเพียงพอสำหรับเรียงเรื่อง'; }
    if (state.look.preset === 'news') { dest='news'; text='ข่าวประชาสัมพันธ์'; reason='แนวภาพและลักษณะคลิปเหมาะกับงานสื่อสารองค์กร'; }
    state.destination=dest;
    $$('[data-destination]').forEach(b=>b.classList.toggle('active',b.dataset.destination===dest));
    $('#aiRecommendedText').textContent=text; $('#aiRecommendedReason').textContent=reason;
  }

  function continueWithAI() {
    if (!state.clips.length) { TANJAI.toast?.('กรุณาเพิ่มคลิปก่อน'); return; }
    const names={short:'คลิปสั้น',summary:'สรุปกิจกรรม',highlight:'ไฮไลต์',news:'ข่าวประชาสัมพันธ์'};
    TANJAI.toast?.(`AI รับคลิปที่ปรับแล้วไปวางโครง “${names[state.destination]}” ต่อให้แล้ว`);
    const event = new CustomEvent('tanjai:video-continue', {detail:{destination:state.destination,clips:state.clips,look:state.look}});
    document.dispatchEvent(event);
  }

  function mimeType() {
    const options=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    return options.find(x=>window.MediaRecorder?.isTypeSupported?.(x)) || '';
  }

  async function renderAndDownloadActive() {
    const clip = activeClip();
    if (!clip || state.busy) return;
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      TANJAI.toast?.('เบราว์เซอร์นี้ยังไม่รองรับการสร้างไฟล์วิดีโอ กรุณาใช้ Chrome รุ่นล่าสุด'); return;
    }
    state.busy=true; render();
    const progress=$('#renderProgress'), bar=$('#renderProgressBar'), text=$('#renderProgressText'); progress.hidden=false;
    try {
      const video=document.createElement('video'); video.src=clip.url; video.preload='auto'; video.playsInline=true; video.crossOrigin='anonymous';
      await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error('เปิดคลิปไม่ได้'));});
      const maxW=1280, scale=Math.min(1,maxW/(video.videoWidth||maxW));
      const canvas=document.createElement('canvas'); canvas.width=Math.max(2,Math.round((video.videoWidth||1280)*scale)); canvas.height=Math.max(2,Math.round((video.videoHeight||720)*scale));
      const ctx=canvas.getContext('2d'); const stream=canvas.captureStream(30);
      let audioCtx, source, destination;
      try {
        audioCtx=new (window.AudioContext||window.webkitAudioContext)(); source=audioCtx.createMediaElementSource(video); destination=audioCtx.createMediaStreamDestination();
        let node=source;
        if(state.audio.noiseReduce){const high=audioCtx.createBiquadFilter(),low=audioCtx.createBiquadFilter();high.type='highpass';high.frequency.value=80;low.type='lowpass';low.frequency.value=15000;node.connect(high);high.connect(low);node=low;}
        if(state.audio.normalize){const gain=audioCtx.createGain();gain.gain.value=1.08;node.connect(gain);node=gain;}
        node.connect(destination); destination.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
      } catch(_) {}
      const chunks=[], type=mimeType(); const recorder=new MediaRecorder(stream,type?{mimeType:type,videoBitsPerSecond:5000000}:undefined);
      recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
      const stopped=new Promise(resolve=>recorder.onstop=resolve);
      recorder.start(500); await video.play();
      const draw=()=>{if(video.paused||video.ended)return;ctx.save();ctx.filter=canvasFilterString();ctx.drawImage(video,0,0,canvas.width,canvas.height);ctx.restore();const pct=video.duration?Math.min(100,(video.currentTime/video.duration)*100):0;bar.style.width=`${pct}%`;text.textContent=`กำลังสร้าง ${Math.round(pct)}%`;requestAnimationFrame(draw)}; draw();
      await new Promise(resolve=>video.onended=resolve); recorder.stop(); await stopped;
      if(audioCtx) await audioCtx.close().catch(()=>{});
      const blob=new Blob(chunks,{type:type||'video/webm'}); const base=clip.name.replace(/\.[^.]+$/,'').replace(/[\\/:*?"<>|]/g,'_'); downloadBlob(blob,`${base}-tanjai-${state.look.preset}.webm`);
      TANJAI.toast?.('สร้างและดาวน์โหลดคลิปที่ปรับแล้วเรียบร้อย');
    } catch(err) {
      console.error(err); TANJAI.toast?.('สร้างคลิปไม่สำเร็จ กรุณาลองคลิปขนาดสั้นลงหรือใช้ Chrome รุ่นล่าสุด');
    } finally {
      state.busy=false; progress.hidden=true; bar.style.width='0%'; render();
    }
  }

  function downloadBlob(blob,name) { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500); }

  document.addEventListener('DOMContentLoaded', install);
  TANJAI.videoEditorState = state;
})();

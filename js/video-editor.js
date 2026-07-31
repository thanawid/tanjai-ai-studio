window.TANJAI = window.TANJAI || {};

(() => {
  const state = {
    mode: 'editor', clips: [], activeClipId: null, busy: false,
    look: { preset: 'auto', brightness: 100, contrast: 100, saturation: 100, warmth: 0 },
    lookMode: 'auto',
    audio: { normalize: true, noiseReduce: true },
    destination: 'short', selectedClipIds: new Set(),
    queue: { active: 0, waiting: 0, completed: 0, failed: 0, total: 0, concurrency: 3, paused: false, cancelled: false },
    activeJobs: new Set()
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v = '') => String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid = () => `clip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fmtTime = (sec = 0) => { const s = Math.max(0, Math.round(sec || 0)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  const fmtSize = bytes => bytes < 1048576 ? `${Math.max(1, Math.round(bytes/1024))} KB` : `${(bytes/1048576).toFixed(1)} MB`;
  const clipById = id => state.clips.find(c => c.id === id);
  const activeClip = () => clipById(state.activeClipId);
  const selectedClips = () => state.clips.filter(c => state.selectedClipIds.has(c.id));

  function install() {
    const form = $('#videoForm');
    const result = $('#videoResult');
    if (!form || !result || $('#videoEditorWorkspace')) return;

    const originalForm = document.createElement('div');
    originalForm.id = 'videoScriptMode';
    while (form.firstChild) originalForm.appendChild(form.firstChild);

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
          <h3>อัปโหลดคลิป</h3>
          <p>เลือกหรือลากคลิปมาวาง แล้วให้ AI ปรับภาพและเสียงให้พร้อมใช้งาน</p>
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
        <div class="vprep-upload-actions">
          <button class="btn secondary" id="selectAllClipsBtn" type="button">เลือกทั้งหมด</button>
          <button class="btn secondary" id="clearSelectionBtn" type="button">ยกเลิกที่เลือก</button>
          <button class="btn secondary" id="clearFootageBtn" type="button">ล้างคลิป</button>
        </div>
      </div>
      <div class="vprep-selection-summary" id="videoSelectionSummary">ยังไม่ได้เลือกคลิป</div>
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
        <header><div><small>ขั้นตอนที่ 3</small><h3>ดาวน์โหลดคลิปที่ปรับแล้ว</h3></div><span>พร้อมนำไปตัดต่อในโปรแกรมที่คุณถนัด</span></header>
        <div class="vprep-destination-grid vprep-download-only">
          <article class="vprep-action-card download">
            <span>⬇</span><div><b>ดาวน์โหลดคลิปที่ปรับแล้ว</b><small>เลือกโหลดคลิปปัจจุบัน คลิปที่เลือก หรือรวมทั้งหมดเป็น ZIP</small></div>
            <div class="vprep-download-actions">
              <button class="btn primary" id="downloadAdjustedBtn" type="button">ดาวน์โหลดคลิปนี้</button>
              <button class="btn secondary" id="downloadSelectedBtn" type="button">ดาวน์โหลดที่เลือก</button>
              <button class="btn secondary" id="downloadAllZipBtn" type="button">ดาวน์โหลดทั้งหมด (.ZIP)</button>
            </div>
          </article>
        </div>
      </section>

      <div class="vprep-render-progress" id="renderProgress" hidden>
        <div class="vprep-progress-head"><b id="renderProgressTitle">กำลังประมวลผลวิดีโอ</b><strong id="renderOverallPercent">0%</strong></div>
        <div class="vprep-overall-track"><i id="renderProgressBar"></i></div>
        <small id="renderProgressText">กำลังเตรียม...</small>
        <small id="renderQueueText"></small>
        <div class="vprep-queue-actions">
          <button class="btn secondary" id="pauseRenderBtn" type="button">⏸ พักงาน</button>
          <button class="btn secondary danger" id="cancelRenderBtn" type="button">ยกเลิก</button>
        </div>
      </div>`;
  }

  function bind() {
    $$('[data-video-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.videoMode)));
    $('#pickFootageBtn')?.addEventListener('click', e => { e.preventDefault(); $('#videoFootageInput')?.click(); });
    $('#videoFootageInput')?.addEventListener('change', e => addFiles(e.target.files));
    $('#clearFootageBtn')?.addEventListener('click', clearFiles);
    $('#selectAllClipsBtn')?.addEventListener('click', () => { state.clips.forEach(c => state.selectedClipIds.add(c.id)); render(); });
    $('#clearSelectionBtn')?.addEventListener('click', () => { state.selectedClipIds.clear(); render(); });

    const dz = $('#videoDropzone');
    ['dragenter','dragover'].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('dragging'); }));
    ['dragleave','drop'].forEach(ev => dz?.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('dragging'); }));
    dz?.addEventListener('drop', e => addFiles(e.dataTransfer.files));

    $$('[data-adjust-tab]').forEach(btn => btn.addEventListener('click', () => setAdjustTab(btn.dataset.adjustTab)));
    $$('[data-look]').forEach(btn => btn.addEventListener('click', () => applyPreset(btn.dataset.look, true, true)));
    $('#autoLookBtn')?.addEventListener('click', () => suggestLook(true));
    $('#resetLookBtn')?.addEventListener('click', () => applyPreset('auto', true, true));

    const sliders = { lookBrightness:'brightness', lookContrast:'contrast', lookSaturation:'saturation', lookWarmth:'warmth' };
    Object.entries(sliders).forEach(([id,key]) => $('#'+id)?.addEventListener('input', e => {
      state.look[key] = Number(e.target.value);
      state.look.preset = 'custom';
      state.lookMode = 'manual';
      updateLookUI();
      applyPreview();
    }));
    $('#audioNormalize')?.addEventListener('change', e => state.audio.normalize = e.target.checked);
    $('#audioNoise')?.addEventListener('change', e => state.audio.noiseReduce = e.target.checked);

    $('#downloadAdjustedBtn')?.addEventListener('click', renderAndDownloadActive);
    $('#downloadSelectedBtn')?.addEventListener('click', () => renderAndDownloadBatch(selectedClips(), false));
    $('#downloadAllZipBtn')?.addEventListener('click', () => renderAndDownloadBatch([...state.clips], true));
    $('#pauseRenderBtn')?.addEventListener('click', toggleQueuePause);
    $('#cancelRenderBtn')?.addEventListener('click', cancelQueue);
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
      state.selectedClipIds.add(clip.id);
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
      if (clip.id === state.activeClipId && state.lookMode === 'auto') suggestLook(false);
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
    applyPreset(preset, false, false);
    if (notify) TANJAI.toast?.(`AI แนะนำแนว “${presetName(preset)}”`);
  }

  function applyPreset(name, notify = false, manual = true) {
    state.look = { preset:name, ...presetValues(name) };
    state.lookMode = manual ? 'manual' : 'auto';
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

  function canvasFilterString(look = state.look) {
    const l = look;
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
    if ($('#lookSummary')) $('#lookSummary').innerHTML = `<b>${state.lookMode === 'manual' ? 'ค่าที่คุณเลือก:' : 'AI แนะนำ:'}</b> ${name} • สว่าง ${state.look.brightness-100>=0?'+':''}${state.look.brightness-100} • คอนทราสต์ ${state.look.contrast-100>=0?'+':''}${state.look.contrast-100} • สี ${state.look.saturation-100>=0?'+':''}${state.look.saturation-100}`;
  }

  function applyPreview() {
    const video = $('#editorPreviewStage video');
    if (video) video.style.setProperty('filter', filterString(), 'important');
  }

  function render() {
    renderClips(); renderPreview(); updateLookUI();
    const status = $('#vprepStatus');
    if (status) status.textContent = !state.clips.length ? 'รอคลิป' : state.clips.some(c=>c.status==='loading') ? 'AI กำลังตรวจคลิป' : 'AI ปรับให้แล้ว';
    const btn = $('#downloadAdjustedBtn'); if (btn) btn.disabled = !activeClip() || state.busy;
    const selectedBtn = $('#downloadSelectedBtn'); if (selectedBtn) selectedBtn.disabled = !selectedClips().length || state.busy;
    const allBtn = $('#downloadAllZipBtn'); if (allBtn) allBtn.disabled = !state.clips.length || state.busy;
    const selectAllBtn = $('#selectAllClipsBtn'); if (selectAllBtn) selectAllBtn.disabled = !state.clips.length || state.busy;
    const clearSelectionBtn = $('#clearSelectionBtn'); if (clearSelectionBtn) clearSelectionBtn.disabled = !selectedClips().length || state.busy;
    const footageInput = $('#videoFootageInput'); if (footageInput) footageInput.disabled = state.busy;
    const pickBtn = $('#pickFootageBtn'); if (pickBtn) pickBtn.disabled = state.busy;
    $$('button,input', $('#videoLookPanel') || document.createElement('div')).forEach(control => control.disabled = state.busy);
    const selectionSummary = $('#videoSelectionSummary');
    if (selectionSummary) selectionSummary.textContent = state.clips.length
      ? `เลือกไว้ ${selectedClips().length} จาก ${state.clips.length} คลิป`
      : 'ยังไม่ได้เลือกคลิป';
  }

  function renderClips() {
    const grid = $('#videoClipGrid'); if (!grid) return;
    const total = state.clips.reduce((s,c)=>s+c.size,0), duration = state.clips.reduce((s,c)=>s+c.duration,0);
    $('#videoUploadSummary').textContent = state.clips.length ? `${state.clips.length} คลิป • ${fmtSize(total)} • รวม ${fmtTime(duration)}` : 'ยังไม่มีคลิป';
    grid.innerHTML = state.clips.length ? state.clips.map(c => `
      <article class="vprep-clip ${c.id===state.activeClipId?'active':''} ${state.selectedClipIds.has(c.id)?'selected':''}" data-select-clip="${c.id}">
        <label class="vprep-clip-check" title="เลือกคลิปนี้">
          <input type="checkbox" data-check-clip="${c.id}" ${state.selectedClipIds.has(c.id)?'checked':''}>
          <span></span>
        </label>
        <div class="vprep-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:'<span>🎞️</span>'}<small>${fmtTime(c.duration)}</small></div>
        <div><b title="${esc(c.name)}">${esc(c.name)}</b><small>${c.width&&c.height?`${c.width}×${c.height} • `:''}${fmtSize(c.size)}</small><em data-clip-status="${c.id}" class="clip-status-${c.exportStatus||'ready'}">${clipStatusText(c)}</em><i class="vprep-clip-progress" data-clip-progress-wrap="${c.id}" ${c.exportStatus==='processing'?'':'hidden'}><span data-clip-progress="${c.id}" style="width:${c.exportProgress||0}%"></span></i></div>
        <button type="button" class="clip-remove" data-remove-clip="${c.id}" aria-label="นำคลิปนี้ออก" title="นำคลิปนี้ออกจากรายการ">🗑 <span>ลบ</span></button>
      </article>`).join('') : `<div class="vprep-empty-list">เมื่อเพิ่มคลิป รายการจะอยู่ตรงนี้</div>`;
    $$('[data-select-clip]',grid).forEach(el => el.addEventListener('click', e => {
      if (e.target.closest('[data-remove-clip]') || e.target.closest('[data-check-clip]')) return;
      state.activeClipId=el.dataset.selectClip;
      if (state.lookMode === 'auto') suggestLook(false);
      render();
    }));
    $$('[data-check-clip]',grid).forEach(input => input.addEventListener('change', e => {
      e.stopPropagation();
      if (input.checked) state.selectedClipIds.add(input.dataset.checkClip);
      else state.selectedClipIds.delete(input.dataset.checkClip);
      render();
    }));
    $$('[data-remove-clip]',grid).forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      removeClip(btn.dataset.removeClip);
    }));
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
    if (state.busy) { TANJAI.toast?.('กรุณารอให้งานปัจจุบันเสร็จ หรือกดยกเลิกก่อน'); return; }
    const c = clipById(id);
    if (c && !window.confirm(`นำ “${c.name}” ออกจากรายการหรือไม่?\nไฟล์ต้นฉบับในเครื่องจะไม่ถูกลบ`)) return;
    if (c) URL.revokeObjectURL(c.url);
    state.clips = state.clips.filter(x=>x.id!==id);
    state.selectedClipIds.delete(id);
    if (state.activeClipId===id) state.activeClipId=state.clips[0]?.id||null;
    render();
    TANJAI.toast?.('ลบคลิปออกจากรายการแล้ว');
  }

  function clearFiles() {
    if (state.busy) { TANJAI.toast?.('กรุณารอให้งานปัจจุบันเสร็จ หรือกดยกเลิกก่อน'); return; }
    state.clips.forEach(c=>URL.revokeObjectURL(c.url));
    state.clips=[]; state.activeClipId=null; state.selectedClipIds.clear();
    render(); TANJAI.toast?.('ล้างคลิปแล้ว');
  }

  function recommendDestination() {
    const total = state.clips.reduce((s,c)=>s+c.duration,0);
    let dest='short', text='คลิปสั้นสรุปกิจกรรม', reason='เหมาะกับการเผยแพร่บน Facebook, Reels และ TikTok';
    if (state.clips.length >= 5 || total > 120) { dest='summary'; text='สรุปกิจกรรมแบบกระชับ'; reason='มีหลายคลิปและเนื้อหาเพียงพอสำหรับเรียงเรื่อง'; }
    if (state.look.preset === 'news') { dest='news'; text='ข่าวประชาสัมพันธ์'; reason='แนวภาพและลักษณะคลิปเหมาะกับงานสื่อสารองค์กร'; }
    state.destination=dest;
    return {destination:dest, destinationName:text, reason};
  }

  async function continueWithAI() {
    if (!state.clips.length) { TANJAI.toast?.('กรุณาเพิ่มคลิปก่อน'); return; }
    if (state.busy) return;
    const mediaStore = window.TanjaiVideoMediaStore;
    if (!mediaStore) { TANJAI.toast?.('ยังเปิดคลังคลิปร่วมไม่ได้ กรุณารีเฟรชหน้าเว็บ'); return; }
    const names={short:'คลิปสั้น',summary:'สรุปกิจกรรม',highlight:'ไฮไลต์',news:'ข่าวประชาสัมพันธ์'};
    const recommendation = recommendDestination();
    const chosen = selectedClips().length ? selectedClips() : state.clips;
    const projectId = `tv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
    const totalSize = chosen.reduce((sum, clip) => sum + (clip.file?.size || 0), 0);
    const totalDuration = chosen.reduce((sum, clip) => sum + (clip.duration || 0), 0);
    const estimatedOutput = Math.max(totalSize * 1.35, totalDuration * 1100000);
    const storage = await mediaStore.storageStatus(estimatedOutput);
    if (storage.quota && storage.available < estimatedOutput) {
      TANJAI.toast?.(`พื้นที่เก็บคลิปไม่พอ ต้องการประมาณ ${fmtSize(estimatedOutput)} แต่เหลือ ${fmtSize(storage.available)}`);
      return;
    }
    const proceed = window.confirm(
      `ส่ง ${chosen.length} คลิปไปตัดต่อโดยไม่อัปโหลดซ้ำ\n\n` +
      `ระบบจะปรับคลิปตามค่าที่เลือกและเก็บไว้ในเบราว์เซอร์ประมาณ ${fmtSize(estimatedOutput)} ` +
      `จากนั้นเปิด Tanjai Video Studio ให้อัตโนมัติ\n\nต้องการเริ่มหรือไม่?`
    );
    if (!proceed) return;
    const handoff = {
      projectId,
      source:'tanjai-ai-studio',
      createdAt:Date.now(),
      status:'preparing',
      storageMode:'indexeddb-v1',
      destination:state.destination,
      destinationName:names[state.destination],
      recommendation,
      look:{...state.look},
      clipCount:chosen.length,
      clips:[]
    };
    chosen.forEach(clip => { clip.exportStatus = 'queued'; clip.exportProgress = 0; });
    state.busy = true;
    render();
    try {
      await mediaStore.deleteProject(projectId).catch(() => {});
      await mediaStore.putProject(handoff);
      const settings = exportSettings();
      const concurrency = queueConcurrency(chosen.length);
      const records = await processRenderQueue(chosen, concurrency, settings, async (result, clip, index) => {
        const record = {
          name:result.name,
          sourceName:clip.name,
          type:result.blob.type || clip.file?.type || 'video/mp4',
          size:result.blob.size,
          duration:clip.duration,
          width:clip.width,
          height:clip.height,
          lastModified:Date.now(),
          fallback:!!result.fallback,
          look:{...settings.look},
          audio:{...settings.audio},
          blob:result.blob
        };
        await mediaStore.putClip(projectId, index, record);
        return { ...record, blob:undefined };
      });
      handoff.status = 'ready';
      handoff.readyAt = Date.now();
      handoff.clips = records;
      handoff.clipCount = records.length;
      await mediaStore.putProject(handoff);
      try { localStorage.setItem(`tanjai-video-handoff:${projectId}`, JSON.stringify(handoff)); } catch {}
      TANJAI.toast?.(`เตรียม ${records.length} คลิปแล้ว กำลังเปิด Tanjai Video Studio`);
      document.dispatchEvent(new CustomEvent('tanjai:video-continue', {detail:handoff}));
      setTimeout(()=>{ window.location.href=`https://thanawid.github.io/tanjai-video-studio/?source=tanjai-ai-studio&projectId=${encodeURIComponent(projectId)}`; },350);
    } catch (err) {
      console.error(err);
      await mediaStore.deleteProject(projectId).catch(() => {});
      TANJAI.toast?.(err?.message === 'QUEUE_CANCELLED'
        ? 'ยกเลิกการส่งคลิปแล้ว'
        : 'เตรียมคลิปไปตัดต่อไม่สำเร็จ กรุณาลดจำนวนคลิปหรือตรวจพื้นที่ว่าง');
    } finally {
      chosen.forEach(clip => {
        if (clip.exportStatus === 'queued' || clip.exportStatus === 'processing') clip.exportStatus = state.queue.cancelled ? 'cancelled' : 'ready';
      });
      state.busy = false;
      hideRenderProgress();
      render();
    }
  }

  function recordingFormat() {
    const formats = [
      { mimeType:'video/mp4;codecs=avc1.424028,mp4a.40.2', extension:'mp4' },
      { mimeType:'video/mp4;codecs=avc1.42E01E,mp4a.40.2', extension:'mp4' },
      { mimeType:'video/mp4;codecs=avc1,mp4a.40.2', extension:'mp4' },
      { mimeType:'video/mp4', extension:'mp4' },
      { mimeType:'video/webm;codecs=vp9,opus', extension:'webm' },
      { mimeType:'video/webm;codecs=vp8,opus', extension:'webm' },
      { mimeType:'video/webm', extension:'webm' }
    ];
    return formats.find(format => window.MediaRecorder?.isTypeSupported?.(format.mimeType)) || { mimeType:'', extension:'webm' };
  }

  async function renderAndDownloadActive() {
    const clip = activeClip();
    if (!clip || state.busy) return;
    state.busy = true; render();
    try {
      const settings = exportSettings();
      const result = await renderClipToBlob(clip, 1, 1, settings);
      downloadBlob(result.blob, result.name);
      TANJAI.toast?.(result.fallback
        ? 'ไฟล์นี้ใช้ตัวเข้ารหัสที่เบราว์เซอร์ปรับภาพไม่ได้ จึงดาวน์โหลด MP4 ต้นฉบับเพื่อป้องกันไฟล์มีแต่เสียง'
        : `ดาวน์โหลด ${result.extension.toUpperCase()} พร้อมนำไปตัดต่อเรียบร้อย`);
    } catch (err) {
      console.error(err);
      TANJAI.toast?.('สร้างคลิปไม่สำเร็จ กรุณาลองคลิปขนาดสั้นลงหรือใช้ Chrome รุ่นล่าสุด');
    } finally {
      state.busy = false; hideRenderProgress(); render();
    }
  }

  async function renderAndDownloadBatch(clips, allMode) {
    clips = (clips || []).filter(Boolean);
    if (!clips.length || state.busy) {
      TANJAI.toast?.(allMode ? 'ยังไม่มีคลิปให้ดาวน์โหลด' : 'กรุณาเลือกคลิปก่อน');
      return;
    }
    const totalSize = clips.reduce((sum, clip) => sum + clip.size, 0);
    const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);
    const tempSize = totalSize * 2.2;
    const proceed = window.confirm(
      `กำลังประมวลผล ${clips.length} คลิป • ${fmtSize(totalSize)} • ความยาวรวม ${fmtTime(totalDuration)}\n\n` +
      `ควรมีพื้นที่ว่างชั่วคราวประมาณ ${fmtSize(tempSize)} และอาจใช้เวลาหลายนาที ` +
      `ระบบจะทำพร้อมกัน 3–5 คลิป\n\nต้องการเริ่มหรือไม่?`
    );
    if (!proceed) return;
    clips.forEach(clip => { clip.exportStatus = 'queued'; clip.exportProgress = 0; });
    state.busy = true; render();
    try {
      const settings = exportSettings();
      const concurrency = queueConcurrency(clips.length);
      const results = await processRenderQueue(clips, concurrency, settings);
      if (state.queue.cancelled) throw new Error('QUEUE_CANCELLED');
      const files = results.map(result => ({ name: result.name, blob: result.blob }));
      const fallbackCount = results.filter(result => result.fallback).length;
      updateRenderProgress(99, 'กำลังรวมไฟล์เป็น ZIP...');
      const zipBlob = await makeZip(files);
      const stamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
      downloadBlob(zipBlob, `Tanjai-Video-${allMode?'all':'selected'}-${stamp}.zip`);
      TANJAI.toast?.(fallbackCount
        ? `ดาวน์โหลด ZIP แล้ว • ${fallbackCount} คลิปใช้ไฟล์ MP4 ต้นฉบับเพื่อป้องกันอาการมีแต่เสียง`
        : `ดาวน์โหลด ZIP ${clips.length} คลิปเรียบร้อย`);
    } catch (err) {
      console.error(err);
      TANJAI.toast?.(err?.message === 'QUEUE_CANCELLED'
        ? 'ยกเลิกการประมวลผลแล้ว'
        : 'สร้างไฟล์ ZIP ไม่สำเร็จ กรุณาลดจำนวนคลิปแล้วลองใหม่');
    } finally {
      clips.forEach(clip => {
        if (clip.exportStatus === 'queued' || clip.exportStatus === 'processing') clip.exportStatus = state.queue.cancelled ? 'cancelled' : 'ready';
      });
      state.busy = false; hideRenderProgress(); render();
    }
  }

  function exportSettings() {
    return {
      look: { ...state.look },
      audio: { ...state.audio }
    };
  }

  function queueConcurrency(total) {
    const cores = Number(navigator.hardwareConcurrency) || 4;
    return Math.min(total, Math.max(3, Math.min(5, Math.floor(cores / 2) || 3)));
  }

  async function processRenderQueue(clips, concurrency, settings, onResult = null) {
    const results = new Array(clips.length);
    let nextIndex = 0;
    state.queue = { active: 0, waiting: clips.length, completed: 0, failed: 0, total: clips.length, concurrency, paused: false, cancelled: false };
    updateQueueProgress();

    async function worker() {
      while (nextIndex < clips.length && !state.queue.cancelled) {
        await waitWhilePaused();
        if (state.queue.cancelled) break;
        const index = nextIndex++;
        const clip = clips[index];
        state.queue.waiting--;
        state.queue.active++;
        clip.exportStatus = 'processing';
        clip.exportProgress = 0;
        renderClips();
        updateQueueProgress();
        try {
          const rendered = await renderClipToBlob(clip, index + 1, clips.length, settings);
          results[index] = onResult ? await onResult(rendered, clip, index) : rendered;
          if (state.queue.cancelled) throw new Error('QUEUE_CANCELLED');
          clip.exportStatus = 'done';
          clip.exportProgress = 100;
          state.queue.completed++;
        } catch (err) {
          if (err?.message === 'QUEUE_CANCELLED') {
            clip.exportStatus = 'cancelled';
            return;
          } else {
            clip.exportStatus = 'error';
            state.queue.failed++;
          }
        } finally {
          state.queue.active--;
          renderClips();
          updateQueueProgress();
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, clips.length) }, () => worker()));
    if (state.queue.cancelled) throw new Error('QUEUE_CANCELLED');
    if (state.queue.failed) throw new Error(`RENDER_FAILED:${state.queue.failed}`);
    return results;
  }

  function updateQueueProgress() {
    const q = state.queue;
    const finished = q.completed + q.failed;
    const percent = q.total ? Math.round((finished / q.total) * 100) : 0;
    const bar = $('#renderProgressBar'), percentEl = $('#renderOverallPercent');
    if (bar) bar.style.width = `${percent}%`;
    if (percentEl) percentEl.textContent = `${percent}%`;
    const el = $('#renderQueueText');
    if (el) el.textContent = q.total
      ? `${q.paused?'พักงานอยู่ • ':''}กำลังทำ ${q.active} • รอคิว ${q.waiting} • เสร็จ ${q.completed}/${q.total}${q.failed?` • ผิดพลาด ${q.failed}`:''}`
      : '';
    const allBtn = $('#downloadAllZipBtn');
    if (allBtn) allBtn.textContent = state.busy && q.total
      ? `กำลังประมวลผล… ${q.completed}/${q.total}`
      : `ดาวน์โหลดทั้งหมด (.ZIP)`;
    const text = $('#renderProgressText');
    if (text && q.total) text.textContent = `ประมวลผลพร้อมกันสูงสุด ${q.concurrency} คลิป`;
  }

  function clipStatusText(clip) {
    if (clip.status === 'loading') return 'AI กำลังตรวจ...';
    if (clip.status === 'error') return 'เปิดคลิปไม่ได้';
    return ({
      queued:'รอคิว',
      processing:`กำลังประมวลผล ${Math.round(clip.exportProgress||0)}%`,
      done:'เสร็จแล้ว พร้อมดาวน์โหลด',
      error:'ไม่สำเร็จ กรุณาลองใหม่',
      cancelled:'ยกเลิกแล้ว',
      ready:'พร้อมปรับและดาวน์โหลด'
    })[clip.exportStatus || 'ready'];
  }

  function updateClipProgress(clip, percent) {
    clip.exportProgress = Math.max(0, Math.min(100, Number(percent) || 0));
    const status = $(`[data-clip-status="${clip.id}"]`);
    const wrap = $(`[data-clip-progress-wrap="${clip.id}"]`);
    const bar = $(`[data-clip-progress="${clip.id}"]`);
    if (status) status.textContent = clipStatusText(clip);
    if (status) status.className = `clip-status-${clip.exportStatus || 'ready'}`;
    if (wrap) wrap.hidden = false;
    if (bar) bar.style.width = `${clip.exportProgress}%`;
  }

  async function waitWhilePaused() {
    while (state.queue.paused && !state.queue.cancelled) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  function toggleQueuePause() {
    if (!state.busy || state.queue.cancelled) return;
    state.queue.paused = !state.queue.paused;
    state.activeJobs.forEach(job => {
      try {
        if (state.queue.paused) {
          job.video.pause();
          if (job.recorder?.state === 'recording') job.recorder.pause();
        } else {
          if (job.recorder?.state === 'paused') job.recorder.resume();
          job.video.play().catch(() => {});
        }
      } catch (_) {}
    });
    const btn = $('#pauseRenderBtn');
    if (btn) btn.textContent = state.queue.paused ? '▶ ทำต่อ' : '⏸ พักงาน';
    updateQueueProgress();
  }

  function cancelQueue() {
    if (!state.busy || state.queue.cancelled) return;
    if (!window.confirm('ต้องการยกเลิกการประมวลผลชุดนี้หรือไม่? คลิปต้นฉบับจะไม่ถูกลบ')) return;
    state.queue.cancelled = true;
    state.queue.paused = false;
    state.queue.waiting = 0;
    state.activeJobs.forEach(job => {
      try { job.video.pause(); } catch (_) {}
    });
    updateQueueProgress();
  }

  async function renderClipToBlob(clip, itemIndex = 1, itemTotal = 1, settings = exportSettings()) {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      throw new Error('Browser video export is not supported');
    }
    updateRenderProgress(0, `กำลังเตรียมคลิป ${itemIndex}/${itemTotal}: ${clip.name}`);

    const video = document.createElement('video');
    video.src = clip.url;
    video.preload = 'auto';
    video.playsInline = true;
    video.muted = false;
    video.crossOrigin = 'anonymous';

    await new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => {
        if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration)) {
          reject(new Error('อ่าน video stream ไม่สำเร็จ'));
          return;
        }
        resolve();
      }, { once:true });
      video.addEventListener('error', () => reject(new Error('เปิดคลิปไม่ได้')), { once:true });
      video.load();
    });

    await new Promise(resolve => {
      if (video.readyState >= 3) return resolve();
      video.addEventListener('canplay', resolve, { once:true });
      setTimeout(resolve, 2500);
    });

    const maxW = 1280;
    const scale = Math.min(1, maxW / (video.videoWidth || maxW));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(2, Math.round((video.videoWidth || 1280) * scale));
    canvas.height = Math.max(2, Math.round((video.videoHeight || 720) * scale));
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    const stream = canvas.captureStream(30);

    let audioCtx, source, destination;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      source = audioCtx.createMediaElementSource(video);
      destination = audioCtx.createMediaStreamDestination();
      let node = source;
      if (settings.audio.noiseReduce) {
        const high = audioCtx.createBiquadFilter(), low = audioCtx.createBiquadFilter();
        high.type = 'highpass'; high.frequency.value = 80;
        low.type = 'lowpass'; low.frequency.value = 15000;
        node.connect(high); high.connect(low); node = low;
      }
      if (settings.audio.normalize) {
        const gain = audioCtx.createGain(); gain.gain.value = 1.08;
        node.connect(gain); node = gain;
      }
      node.connect(destination);
      destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    } catch (_) {}

    const requestedFormat = recordingFormat();
    const recorderOptions = requestedFormat.mimeType
      ? { mimeType:requestedFormat.mimeType, videoBitsPerSecond:8000000, audioBitsPerSecond:192000 }
      : undefined;
    const chunks = [];
    const recorder = new MediaRecorder(stream, recorderOptions);
    const activeJob = { video, recorder };
    state.activeJobs.add(activeJob);
    const actualMimeType = recorder.mimeType || requestedFormat.mimeType || 'video/webm';
    const actualIsMp4 = /video\/mp4/i.test(actualMimeType);
    const extension = actualIsMp4 ? 'mp4' : 'webm';
    recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
    const stopped = new Promise(resolve => recorder.onstop = resolve);

    let frameCount = 0;
    let visibleFrameCount = 0;
    let ended = false;
    const drawFrame = () => {
      if (ended) return;
      try {
        ctx.save();
        ctx.filter = canvasFilterString(settings.look);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        frameCount++;
        if (frameCount <= 8 || frameCount % 30 === 0) {
          const sx = Math.max(0, Math.floor(canvas.width * .35));
          const sy = Math.max(0, Math.floor(canvas.height * .35));
          const sw = Math.max(1, Math.floor(canvas.width * .3));
          const sh = Math.max(1, Math.floor(canvas.height * .3));
          const data = ctx.getImageData(sx, sy, sw, sh).data;
          let lum = 0;
          for (let i = 0; i < data.length; i += 16) lum += data[i] + data[i+1] + data[i+2];
          const avg = lum / Math.max(1, data.length / 16) / 3;
          if (avg > 2.5) visibleFrameCount++;
        }
      } catch (_) {}
      const pct = video.duration ? Math.min(98, (video.currentTime / video.duration) * 98) : 0;
      updateClipProgress(clip, pct);
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(drawFrame);
      else requestAnimationFrame(drawFrame);
    };

    try {
      video.currentTime = 0;
      await new Promise(resolve => {
        if (video.readyState >= 2) return resolve();
        video.addEventListener('loadeddata', resolve, { once:true });
        setTimeout(resolve, 1800);
      });
      drawFrame();
      recorder.start(500);
      await video.play();
      await new Promise(resolve => {
        let cancelCheck;
        const finish = () => {
          clearInterval(cancelCheck);
          resolve();
        };
        video.addEventListener('ended', finish, { once:true });
        video.addEventListener('error', finish, { once:true });
        cancelCheck = setInterval(() => {
          if (state.queue.cancelled) {
            finish();
          }
        }, 150);
      });
      ended = true;
      if (recorder.state !== 'inactive') recorder.stop();
      await stopped;
      if (state.queue.cancelled) throw new Error('QUEUE_CANCELLED');
    } finally {
      ended = true;
      video.pause();
      video.removeAttribute('src');
      video.load();
      stream.getTracks().forEach(track => track.stop());
      destination?.stream?.getTracks().forEach(track => track.stop());
      source?.disconnect?.();
      destination?.disconnect?.();
      if (audioCtx) await audioCtx.close().catch(() => {});
      canvas.width = 1;
      canvas.height = 1;
      state.activeJobs.delete(activeJob);
    }

    const sourceWasVisible = (clip.brightness == null || clip.brightness > 4) && !!clip.thumbnail;
    const renderedLooksBlank = sourceWasVisible && visibleFrameCount === 0;
    const blob = new Blob(chunks, { type:actualMimeType });
    const suspiciouslySmall = blob.size < Math.max(15000, clip.duration * 12000);

    if (renderedLooksBlank || suspiciouslySmall) {
      const fallbackName = safeFileName(clip.name.replace(/\.[^.]+$/, '')) + '-original.mp4';
      return { blob:clip.file, name:fallbackName, extension:'mp4', fallback:true };
    }

    const base = safeFileName(clip.name.replace(/\.[^.]+$/, ''));
    return {
      blob,
      name:`${base}-tanjai-${settings.look.preset}.${extension}`,
      extension,
      fallback:false
    };
  }

  function updateRenderProgress(percent, message) {
    const progress = $('#renderProgress'), bar = $('#renderProgressBar'), text = $('#renderProgressText');
    if (progress) progress.hidden = false;
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, Number(percent) || 0))}%`;
    if ($('#renderOverallPercent')) $('#renderOverallPercent').textContent = `${Math.round(Math.max(0, Math.min(100, Number(percent) || 0)))}%`;
    if (text) text.textContent = message || 'กำลังเตรียม...';
  }

  function hideRenderProgress() {
    const progress = $('#renderProgress'), bar = $('#renderProgressBar');
    if (progress) progress.hidden = true;
    if (bar) bar.style.width = '0%';
    state.queue = { active: 0, waiting: 0, completed: 0, failed: 0, total: 0, concurrency: 3, paused: false, cancelled: false };
    state.activeJobs.clear();
    if ($('#pauseRenderBtn')) $('#pauseRenderBtn').textContent = '⏸ พักงาน';
    updateQueueProgress();
  }

  function safeFileName(name) {
    return String(name || 'clip').replace(/[\\/:*?"<>|]/g, '_').trim() || 'clip';
  }

  async function makeZip(files) {
    let offset = 0;
    const localParts = [];
    const centralParts = [];

    for (const file of files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const data = new Uint8Array(await file.blob.arrayBuffer());
      const crc = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length);
      const lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(6, 0, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint16(12, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, nameBytes.length, true);
      lv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + nameBytes.length);
      const cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, 0, true);
      cv.setUint16(14, 0, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, nameBytes.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      central.set(nameBytes, 46);
      centralParts.push(central);
      offset += local.length + data.length;
    }

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(4, 0, true);
    ev.setUint16(6, 0, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    ev.setUint16(20, 0, true);

    return new Blob([...localParts, ...centralParts, end], { type:'application/zip' });
  }

  function crc32(bytes) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function downloadBlob(blob,name) {
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),2500);
  }

  document.addEventListener('DOMContentLoaded', install);
  TANJAI.videoEditorState = state;
})();

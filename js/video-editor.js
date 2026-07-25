window.TANJAI = window.TANJAI || {};

(() => {
  const state = {
    clips: [],
    timeline: [],
    activeClipId: null,
    mode: 'editor'
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const uid = () => `clip-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const fmtTime = (sec=0) => {
    const s = Math.max(0, Math.round(Number(sec)||0));
    const m = Math.floor(s/60);
    return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  };
  const fmtSize = bytes => {
    const n = Number(bytes)||0;
    if(n < 1024*1024) return `${(n/1024).toFixed(0)} KB`;
    return `${(n/1024/1024).toFixed(1)} MB`;
  };
  const esc = v => TANJAI.escapeHTML ? TANJAI.escapeHTML(v) : String(v||'');

  function install(){
    const form = $('#videoForm');
    const result = $('#videoResult');
    if(!form || !result || $('#videoEditorWorkspace')) return;

    const original = document.createElement('div');
    original.id = 'videoScriptMode';
    while(form.firstChild) original.appendChild(form.firstChild);

    form.appendChild(document.createRange().createContextualFragment(`
      <div class="video-mode-switch" role="tablist" aria-label="เลือกโหมดทำวิดีโอ">
        <button type="button" class="video-mode-btn" data-video-mode="script">📝 สร้างบทและ Storyboard</button>
        <button type="button" class="video-mode-btn active" data-video-mode="editor">✂️ ตัดต่อฟุตเทจด้วย AI</button>
      </div>
    `));
    form.appendChild(original);

    const editor = document.createElement('div');
    editor.id = 'videoEditorWorkspace';
    editor.innerHTML = editorHTML();
    form.appendChild(editor);

    const originalResult = document.createElement('div');
    originalResult.id = 'videoScriptResultMode';
    while(result.firstChild) originalResult.appendChild(result.firstChild);
    result.appendChild(originalResult);

    const editorResult = document.createElement('div');
    editorResult.id = 'videoEditorResultMode';
    editorResult.innerHTML = resultHTML();
    result.appendChild(editorResult);

    bind();
    setMode('editor');
    renderAll();
  }

  function editorHTML(){
    return `
      <div class="form-note video-editor-note"><b>AI Smart Editor</b> — ใส่ฟุตเทจหลายคลิป ระบบจะสร้างตัวอย่าง ตรวจคุณภาพ คัดช่วงเด่น และจัด Timeline ร่างให้ก่อน</div>

      <div class="form-section">
        <div class="section-title"><b>1</b><h4>เพิ่มฟุตเทจ</h4></div>
        <label class="video-dropzone" id="videoDropzone">
          <input id="videoFootageInput" type="file" accept="video/*" multiple hidden>
          <span class="video-drop-icon">🎞️</span>
          <strong>ลากคลิปมาวาง หรือกดเลือกหลายคลิป</strong>
          <small>รองรับ MP4, MOV, WebM และไฟล์วิดีโอที่เบราว์เซอร์เปิดได้</small>
          <button class="btn primary" type="button" id="pickFootageBtn">เลือกฟุตเทจ</button>
        </label>
        <div class="video-upload-summary" id="videoUploadSummary">ยังไม่มีฟุตเทจ</div>
        <div class="video-clip-grid" id="videoClipGrid"></div>
      </div>

      <div class="form-section">
        <div class="section-title"><b>2</b><h4>ตั้งค่าวิดีโอร่าง</h4></div>
        <div class="form-grid">
          <label>รูปแบบงาน<select id="editPurpose"><option>ข่าวกิจกรรม / งานประชาสัมพันธ์</option><option>ไฮไลต์กิจกรรม</option><option>คลิปสั้น Reels / TikTok / Shorts</option><option>สารคดีสั้น</option><option>MV / ตัดตามจังหวะเพลง</option><option>สรุปประชุม / สัมภาษณ์</option></select></label>
          <label>ความยาวเป้าหมาย<select id="editTargetLength"><option value="30">30 วินาที</option><option value="60" selected>1 นาที</option><option value="180">3 นาที</option><option value="300">5 นาที</option><option value="0">ให้ AI เลือกตามฟุตเทจ</option></select></label>
          <label>สัดส่วน<select id="editAspect"><option value="16:9">แนวนอน 16:9</option><option value="9:16">แนวตั้ง 9:16</option><option value="4:5">แนวตั้ง 4:5</option><option value="1:1">จัตุรัส 1:1</option><option value="source">ตามคลิปต้นฉบับ</option></select></label>
          <label>รูปแบบเสียง<select id="editAudioMode"><option>ใช้เสียงหน้างาน + เพลงเบา</option><option>เสียงพากย์ไทย + เพลง</option><option>ใช้เสียงหน้างานเท่านั้น</option><option>เพลงประกอบเท่านั้น</option></select></label>
          <label class="full">เพลงประกอบ (ไม่บังคับ)<input id="editMusicInput" type="file" accept="audio/*"></label>
          <label class="full">คำสั่งเพิ่มเติม<textarea id="editInstruction" placeholder="เช่น ทำข่าวเทศบาล 3 นาที เปิดด้วยภาพคนร่วมกิจกรรม ตัดภาพสั่นออก ใส่ซับไทย และจบด้วยภาพหมู่"></textarea></label>
        </div>
        <div class="button-row">
          <button class="btn primary" id="analyzeFootageBtn" type="button">✨ วิเคราะห์และจัดวิดีโอร่าง</button>
          <button class="btn secondary" id="clearFootageBtn" type="button">ล้างฟุตเทจ</button>
        </div>
      </div>

      <div class="form-section video-cloud-capabilities">
        <div class="section-title"><b>3</b><h4>ระบบ AI ออนไลน์</h4></div>
        <div class="capability-grid">
          <article><span>🇹🇭</span><b>ถอดเสียงไทย</b><small>สร้าง Transcript และ SRT</small><em>รอเชื่อม Speech-to-Text API</em></article>
          <article><span>🧠</span><b>เข้าใจเหตุการณ์</b><small>พิธีเปิด มอบรางวัล ภาพหมู่</small><em>รอเชื่อม Video AI API</em></article>
          <article><span>🎬</span><b>เรนเดอร์ MP4</b><small>รวมภาพ เสียง เพลง และซับ</small><em>รอเชื่อม Render Server</em></article>
        </div>
      </div>`;
  }

  function resultHTML(){
    return `
      <div class="editor-result-head">
        <div><small>AI SMART EDITOR</small><h3>วิดีโอร่างจากฟุตเทจ</h3><p id="editorResultStatus">เพิ่มฟุตเทจเพื่อเริ่มวิเคราะห์</p></div>
        <span class="editor-status-pill" id="editorStatusPill">รอไฟล์</span>
      </div>
      <div class="editor-stats" id="editorStats">
        <article><small>คลิปทั้งหมด</small><b>0</b></article><article><small>พร้อมใช้</small><b>0</b></article><article><small>ควรตรวจ</small><b>0</b></article><article><small>Timeline</small><b>00:00</b></article>
      </div>
      <div class="editor-preview-stage" id="editorPreviewStage">
        <div class="editor-empty-preview"><span>🎬</span><b>ตัวอย่างวิดีโอจะอยู่ตรงนี้</b><small>เลือกคลิปจาก Timeline เพื่อดูตัวอย่าง</small></div>
      </div>
      <div class="timeline-toolbar">
        <div><b>Timeline ร่าง</b><small>เรียงใหม่ ลบ หรือเลือกดูแต่ละคลิปได้</small></div>
        <button class="btn secondary" id="autoArrangeBtn" type="button">จัดใหม่อัตโนมัติ</button>
      </div>
      <div class="smart-timeline" id="smartTimeline"></div>
      <div class="editor-command-box">
        <label>สั่งแก้ด้วยข้อความ<textarea id="editorCommand" placeholder="เช่น เอาคลิปมืดออก / ให้คลิปแนวตั้งขึ้นก่อน / ลดเหลือ 30 วินาที"></textarea></label>
        <button class="btn primary" id="applyEditorCommandBtn" type="button">ใช้คำสั่งกับ Timeline</button>
      </div>
      <div class="editor-export-box">
        <div><b>ส่งออกงาน</b><small>ดาวน์โหลดแผนตัดต่อได้ทันที ส่วน MP4 ต้องเชื่อมระบบเรนเดอร์</small></div>
        <div class="button-row">
          <button class="btn secondary" id="downloadEditPlanBtn" type="button">ดาวน์โหลดแผนตัดต่อ</button>
          <button class="btn secondary" id="downloadSrtBtn" type="button">ดาวน์โหลด SRT</button>
          <button class="btn primary" id="exportMp4Btn" type="button">ส่งออก MP4</button>
        </div>
      </div>`;
  }

  function bind(){
    $$('[data-video-mode]').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.videoMode)));
    $('#pickFootageBtn')?.addEventListener('click', () => $('#videoFootageInput')?.click());
    $('#videoFootageInput')?.addEventListener('change', e => addFiles(e.target.files));
    const dz = $('#videoDropzone');
    ['dragenter','dragover'].forEach(type => dz?.addEventListener(type, e => {e.preventDefault(); dz.classList.add('dragging');}));
    ['dragleave','drop'].forEach(type => dz?.addEventListener(type, e => {e.preventDefault(); dz.classList.remove('dragging');}));
    dz?.addEventListener('drop', e => addFiles(e.dataTransfer.files));
    $('#clearFootageBtn')?.addEventListener('click', clearFiles);
    $('#analyzeFootageBtn')?.addEventListener('click', analyzeAll);
    $('#autoArrangeBtn')?.addEventListener('click', autoArrange);
    $('#applyEditorCommandBtn')?.addEventListener('click', applyCommand);
    $('#downloadEditPlanBtn')?.addEventListener('click', downloadPlan);
    $('#downloadSrtBtn')?.addEventListener('click', downloadSrt);
    $('#exportMp4Btn')?.addEventListener('click', () => TANJAI.toast('การรวมเป็น MP4 ต้องเชื่อม Render Server ก่อน — ตอนนี้ดาวน์โหลดแผนตัดต่อได้แล้ว'));
  }

  function setMode(mode){
    state.mode = mode;
    const script = $('#videoScriptMode');
    const editor = $('#videoEditorWorkspace');
    const scriptResult = $('#videoScriptResultMode');
    const editorResult = $('#videoEditorResultMode');
    if(script) script.hidden = mode !== 'script';
    if(editor) editor.hidden = mode !== 'editor';
    if(scriptResult) scriptResult.hidden = mode !== 'script';
    if(editorResult) editorResult.hidden = mode !== 'editor';
    $$('[data-video-mode]').forEach(b => b.classList.toggle('active', b.dataset.videoMode === mode));
  }

  async function addFiles(fileList){
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('video/'));
    if(!files.length){ TANJAI.toast('กรุณาเลือกไฟล์วิดีโอ'); return; }
    const remaining = Math.max(0, 60 - state.clips.length);
    for(const file of files.slice(0, remaining)){
      const clip = {id:uid(), file, name:file.name, size:file.size, url:URL.createObjectURL(file), duration:0, width:0, height:0, orientation:'กำลังอ่าน', thumbnail:'', brightness:null, blur:null, audioLevel:null, flags:[], score:50, status:'loading'};
      state.clips.push(clip);
      inspectMetadata(clip);
    }
    renderAll();
    TANJAI.toast(`เพิ่มฟุตเทจ ${Math.min(files.length, remaining)} คลิปแล้ว`);
  }

  function inspectMetadata(clip){
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.src = clip.url;
    video.onloadedmetadata = () => {
      clip.duration = Number(video.duration)||0;
      clip.width = video.videoWidth||0;
      clip.height = video.videoHeight||0;
      clip.orientation = clip.width === clip.height ? 'จัตุรัส' : clip.width > clip.height ? 'แนวนอน' : 'แนวตั้ง';
      clip.status = 'ready';
      if(clip.duration < 2) clip.flags.push('สั้นเกินไป');
      captureFrame(clip, Math.min(Math.max(clip.duration*0.25, .1), Math.max(.1, clip.duration-.1)));
      renderAll();
    };
    video.onerror = () => {clip.status='error'; clip.flags.push('เปิดไฟล์ไม่ได้'); renderAll();};
  }

  function captureFrame(clip, time){
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = clip.url;
    video.onloadedmetadata = () => { try{ video.currentTime = time; }catch(_){ } };
    video.onseeked = () => {
      try{
        const maxW = 320;
        const ratio = video.videoWidth ? video.videoHeight/video.videoWidth : .5625;
        const canvas = document.createElement('canvas');
        canvas.width = maxW; canvas.height = Math.max(180, Math.round(maxW*ratio));
        const ctx = canvas.getContext('2d', {willReadFrequently:true});
        ctx.drawImage(video,0,0,canvas.width,canvas.height);
        clip.thumbnail = canvas.toDataURL('image/jpeg', .72);
        const metrics = imageMetrics(ctx.getImageData(0,0,canvas.width,canvas.height), canvas.width, canvas.height);
        clip.brightness = metrics.brightness;
        clip.blur = metrics.blur;
        clip.flags = clip.flags.filter(x => !['มืด','อาจเบลอ'].includes(x));
        if(metrics.brightness < 42) clip.flags.push('มืด');
        if(metrics.blur < 8) clip.flags.push('อาจเบลอ');
        updateScore(clip);
      }catch(e){ console.warn('frame analysis failed', e); }
      renderAll();
    };
  }

  function imageMetrics(imageData,w,h){
    const d = imageData.data;
    let lum=0, edges=0, count=0;
    const gray = new Float32Array(w*h);
    for(let i=0,p=0;i<d.length;i+=4,p++){
      const g=.299*d[i]+.587*d[i+1]+.114*d[i+2]; gray[p]=g; lum+=g;
    }
    for(let y=1;y<h-1;y+=2){
      for(let x=1;x<w-1;x+=2){
        const p=y*w+x;
        edges += Math.abs(gray[p-1]-gray[p+1]) + Math.abs(gray[p-w]-gray[p+w]);
        count++;
      }
    }
    return {brightness:lum/(w*h), blur:count?edges/count:0};
  }

  function updateScore(c){
    let score=78;
    if(c.duration < 2) score-=35;
    else if(c.duration < 4) score-=10;
    if(c.flags.includes('มืด')) score-=25;
    if(c.flags.includes('อาจเบลอ')) score-=18;
    if(c.status==='error') score=0;
    c.score=Math.max(0,Math.min(100,Math.round(score)));
  }

  async function analyzeAll(){
    if(!state.clips.length){ TANJAI.toast('กรุณาเพิ่มฟุตเทจก่อน'); return; }
    const btn=$('#analyzeFootageBtn');
    if(btn){btn.disabled=true;btn.textContent='กำลังวิเคราะห์ฟุตเทจ...';}
    $('#editorStatusPill').textContent='กำลังวิเคราะห์';
    $('#editorResultStatus').textContent='กำลังตรวจคุณภาพและเลือกช่วงที่เหมาะสม';
    await Promise.all(state.clips.map(analyzeAudio));
    state.clips.forEach(updateScore);
    autoArrange(false);
    if(btn){btn.disabled=false;btn.textContent='✨ วิเคราะห์และจัดวิดีโอร่าง';}
    $('#editorStatusPill').textContent='สร้างร่างแล้ว';
    $('#editorResultStatus').textContent='ตรวจสอบ Timeline แล้วสลับหรือลบคลิปได้ทันที';
    renderAll();
    TANJAI.toast('วิเคราะห์และสร้าง Timeline ร่างแล้ว');
  }

  async function analyzeAudio(clip){
    if(clip.status==='error') return;
    try{
      const buf = await clip.file.arrayBuffer();
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      const ac = new AC();
      const decoded = await ac.decodeAudioData(buf.slice(0));
      let sum=0,n=0;
      for(let ch=0;ch<decoded.numberOfChannels;ch++){
        const data=decoded.getChannelData(ch); const step=Math.max(1,Math.floor(data.length/20000));
        for(let i=0;i<data.length;i+=step){sum+=data[i]*data[i];n++;}
      }
      const rms=n?Math.sqrt(sum/n):0;
      clip.audioLevel=rms;
      clip.flags=clip.flags.filter(x=>x!=='เสียงเบามาก / เงียบ');
      if(rms < .006) clip.flags.push('เสียงเบามาก / เงียบ');
      await ac.close();
    }catch(_){ clip.audioLevel=null; }
  }

  function autoArrange(notify=true){
    const target=Number($('#editTargetLength')?.value||60);
    const aspect=$('#editAspect')?.value||'16:9';
    let list=state.clips.filter(c=>c.status!=='error' && c.score>=35);
    list.sort((a,b)=>{
      const orientationBonus = c => aspect==='source' ? 0 : ((aspect==='16:9'&&c.orientation==='แนวนอน')||(aspect!=='16:9'&&c.orientation==='แนวตั้ง') ? 12:0);
      return (b.score+orientationBonus(b))-(a.score+orientationBonus(a));
    });
    const chosen=[]; let total=0;
    for(const c of list){
      if(target && total>=target) break;
      const maxUse = $('#editPurpose')?.value.includes('คลิปสั้น') ? 4 : 8;
      const use=Math.min(c.duration||0,maxUse,target?Math.max(1,target-total):maxUse);
      if(use>.5){ chosen.push({clipId:c.id,start:0,end:use,duration:use}); total+=use; }
    }
    state.timeline=chosen;
    state.activeClipId=chosen[0]?.clipId||null;
    renderAll();
    if(notify) TANJAI.toast('จัด Timeline ใหม่อัตโนมัติแล้ว');
  }

  function applyCommand(){
    const cmd=String($('#editorCommand')?.value||'').trim();
    if(!cmd){TANJAI.toast('กรุณาพิมพ์คำสั่งแก้ไข');return;}
    let changed=false;
    if(/มืด|เบลอ|เสีย|คุณภาพต่ำ/.test(cmd)){
      const bad=new Set(state.clips.filter(c=>c.score<55||c.flags.some(f=>/มืด|เบลอ|เปิดไฟล์ไม่ได้/.test(f))).map(c=>c.id));
      state.timeline=state.timeline.filter(t=>!bad.has(t.clipId)); changed=true;
    }
    if(/แนวตั้ง.*ก่อน|ขึ้นก่อน.*แนวตั้ง/.test(cmd)){
      state.timeline.sort((a,b)=>(clipById(a.clipId)?.orientation==='แนวตั้ง'?-1:1)-(clipById(b.clipId)?.orientation==='แนวตั้ง'?-1:1)); changed=true;
    }
    if(/แนวนอน.*ก่อน|ขึ้นก่อน.*แนวนอน/.test(cmd)){
      state.timeline.sort((a,b)=>(clipById(a.clipId)?.orientation==='แนวนอน'?-1:1)-(clipById(b.clipId)?.orientation==='แนวนอน'?-1:1)); changed=true;
    }
    const m=cmd.match(/(?:เหลือ|ความยาว|ลดเหลือ)\s*(\d+)\s*(วินาที|นาที)?/);
    if(m){
      const limit=Number(m[1])*(m[2]==='นาที'?60:1); let total=0;
      state.timeline=state.timeline.flatMap(t=>{if(total>=limit)return[];const d=Math.min(t.duration,limit-total);total+=d;return[{...t,end:t.start+d,duration:d}];}); changed=true;
    }
    if(/สั้น.*ก่อน|เรียง.*สั้น/.test(cmd)){state.timeline.sort((a,b)=>a.duration-b.duration);changed=true;}
    if(/ยาว.*ก่อน|เรียง.*ยาว/.test(cmd)){state.timeline.sort((a,b)=>b.duration-a.duration);changed=true;}
    renderAll();
    TANJAI.toast(changed?'ใช้คำสั่งกับ Timeline แล้ว':'คำสั่งนี้ยังต้องใช้ AI ออนไลน์ — ลองคำสั่ง เช่น “เอาคลิปมืดออก”');
  }

  function clipById(id){return state.clips.find(c=>c.id===id);}
  function removeClip(id){
    const c=clipById(id); if(c) URL.revokeObjectURL(c.url);
    state.clips=state.clips.filter(c=>c.id!==id); state.timeline=state.timeline.filter(t=>t.clipId!==id);
    if(state.activeClipId===id) state.activeClipId=state.timeline[0]?.clipId||null;
    renderAll();
  }
  function removeTimeline(index){state.timeline.splice(index,1);state.activeClipId=state.timeline[0]?.clipId||null;renderAll();}
  function moveTimeline(index,dir){const ni=index+dir;if(ni<0||ni>=state.timeline.length)return;[state.timeline[index],state.timeline[ni]]=[state.timeline[ni],state.timeline[index]];renderAll();}
  function clearFiles(){
    state.clips.forEach(c=>URL.revokeObjectURL(c.url));state.clips=[];state.timeline=[];state.activeClipId=null;
    const input=$('#videoFootageInput');if(input)input.value='';renderAll();TANJAI.toast('ล้างฟุตเทจแล้ว');
  }

  function renderAll(){renderClips();renderStats();renderTimeline();renderPreview();}
  function renderClips(){
    const grid=$('#videoClipGrid'); if(!grid)return;
    const totalSize=state.clips.reduce((s,c)=>s+c.size,0);
    const summary=$('#videoUploadSummary');
    if(summary) summary.textContent=state.clips.length?`${state.clips.length} คลิป • ${fmtSize(totalSize)} • แนวนอน ${state.clips.filter(c=>c.orientation==='แนวนอน').length} • แนวตั้ง ${state.clips.filter(c=>c.orientation==='แนวตั้ง').length}`:'ยังไม่มีฟุตเทจ';
    grid.innerHTML=state.clips.map(c=>`<article class="video-clip-card ${c.score<55?'warning':''}">
      <div class="clip-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:`<span>🎞️</span>`}<small>${fmtTime(c.duration)}</small></div>
      <div class="clip-card-body"><b title="${esc(c.name)}">${esc(c.name)}</b><span>${c.orientation} • ${c.width||'-'}×${c.height||'-'} • ${fmtSize(c.size)}</span>
      <div class="clip-quality"><i style="width:${c.score}%"></i></div><small>คะแนนใช้งาน ${c.score}/100</small>
      <div class="clip-flags">${c.flags.length?c.flags.map(f=>`<em>${esc(f)}</em>`).join(''):'<em class="ok">พร้อมใช้</em>'}</div></div>
      <button class="clip-remove" type="button" data-remove-clip="${c.id}" aria-label="ลบคลิป">×</button>
    </article>`).join('');
    $$('[data-remove-clip]',grid).forEach(b=>b.onclick=()=>removeClip(b.dataset.removeClip));
  }
  function renderStats(){
    const usable=state.clips.filter(c=>c.score>=55).length;
    const review=state.clips.filter(c=>c.score<55).length;
    const total=state.timeline.reduce((s,t)=>s+t.duration,0);
    const stats=$('#editorStats');if(stats)stats.innerHTML=`<article><small>คลิปทั้งหมด</small><b>${state.clips.length}</b></article><article><small>พร้อมใช้</small><b>${usable}</b></article><article><small>ควรตรวจ</small><b>${review}</b></article><article><small>Timeline</small><b>${fmtTime(total)}</b></article>`;
    const pill=$('#editorStatusPill');if(pill&&!state.clips.length)pill.textContent='รอไฟล์';else if(pill&&!state.timeline.length)pill.textContent='พร้อมวิเคราะห์';
  }
  function renderTimeline(){
    const el=$('#smartTimeline');if(!el)return;
    if(!state.timeline.length){el.innerHTML='<div class="timeline-empty">ยังไม่มี Timeline — กด “วิเคราะห์และจัดวิดีโอร่าง”</div>';return;}
    el.innerHTML=state.timeline.map((t,i)=>{const c=clipById(t.clipId);if(!c)return'';return `<article class="timeline-item ${state.activeClipId===c.id?'active':''}" data-select-timeline="${c.id}">
      <div class="timeline-index">${i+1}</div><div class="timeline-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:'🎞️'}</div>
      <div class="timeline-info"><b>${esc(c.name)}</b><span>${fmtTime(t.start)}–${fmtTime(t.end)} • ${t.duration.toFixed(1)} วินาที</span></div>
      <div class="timeline-actions"><button type="button" data-move="-1" data-index="${i}">↑</button><button type="button" data-move="1" data-index="${i}">↓</button><button type="button" data-remove-timeline="${i}">×</button></div>
    </article>`;}).join('');
    $$('[data-select-timeline]',el).forEach(x=>x.onclick=e=>{if(e.target.closest('button'))return;state.activeClipId=x.dataset.selectTimeline;renderAll();});
    $$('[data-move]',el).forEach(b=>b.onclick=()=>moveTimeline(Number(b.dataset.index),Number(b.dataset.move)));
    $$('[data-remove-timeline]',el).forEach(b=>b.onclick=()=>removeTimeline(Number(b.dataset.removeTimeline)));
  }
  function renderPreview(){
    const stage=$('#editorPreviewStage');if(!stage)return;
    const c=clipById(state.activeClipId);
    if(!c){stage.innerHTML='<div class="editor-empty-preview"><span>🎬</span><b>ตัวอย่างวิดีโอจะอยู่ตรงนี้</b><small>เลือกคลิปจาก Timeline เพื่อดูตัวอย่าง</small></div>';return;}
    const t=state.timeline.find(x=>x.clipId===c.id);
    stage.innerHTML=`<video src="${c.url}#t=${t?.start||0},${t?.end||c.duration}" controls playsinline preload="metadata"></video><div class="preview-caption"><b>${esc(c.name)}</b><span>${c.orientation} • คะแนน ${c.score}/100</span></div>`;
  }

  function downloadPlan(){
    if(!state.timeline.length){TANJAI.toast('ยังไม่มี Timeline ให้ดาวน์โหลด');return;}
    const data={app:'Tanjai AI Studio',version:'10.1.0',createdAt:new Date().toISOString(),settings:{purpose:$('#editPurpose')?.value,targetLength:$('#editTargetLength')?.value,aspect:$('#editAspect')?.value,audioMode:$('#editAudioMode')?.value,instruction:$('#editInstruction')?.value},clips:state.timeline.map((t,i)=>{const c=clipById(t.clipId);return{order:i+1,fileName:c?.name,start:t.start,end:t.end,duration:t.duration,orientation:c?.orientation,qualityScore:c?.score,flags:c?.flags};})};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});downloadBlob(blob,'tanjai-edit-plan.json');
  }
  function downloadSrt(){
    if(!state.timeline.length){TANJAI.toast('ยังไม่มี Timeline');return;}
    let cursor=0;const rows=state.timeline.map((t,i)=>{const c=clipById(t.clipId);const st=srtTime(cursor);cursor+=t.duration;return `${i+1}\n${st} --> ${srtTime(cursor)}\n[รอถอดเสียงไทย: ${c?.name||'คลิป'}]\n`;}).join('\n');
    downloadBlob(new Blob([rows],{type:'text/plain;charset=utf-8'}),'tanjai-subtitles-draft.srt');
  }
  function srtTime(sec){const ms=Math.round(sec*1000);const h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),x=ms%1000;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(x).padStart(3,'0')}`;}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}

  document.addEventListener('DOMContentLoaded', install);
  TANJAI.videoEditorState = state;
})();

window.TANJAI = window.TANJAI || {};

(() => {
  const state = {
    clips: [], timeline: [], activeClipId: null, mode: 'editor',
    analysis: null, storyOptions: [], selectedStory: 0, voiceScript: '',
    look: {preset:'auto',brightness:100,contrast:100,saturation:100,warmth:0,sharpness:0},
    camera:{crop:'source',stabilize:true,autoFrame:true}, audio:{noiseReduce:true,normalize:true,musicDuck:false}, overlay:{title:'',subtitle:true,logo:false}
  };
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const uid = () => `clip-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const esc = v => TANJAI.escapeHTML ? TANJAI.escapeHTML(v) : String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmtTime = (sec=0) => { const s=Math.max(0,Math.round(Number(sec)||0)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
  const fmtSize = bytes => { const n=Number(bytes)||0; return n<1048576?`${Math.round(n/1024)} KB`:`${(n/1048576).toFixed(1)} MB`; };
  const clipById = id => state.clips.find(c=>c.id===id);

  function install(){
    const form=$('#videoForm'), result=$('#videoResult');
    if(!form||!result||$('#videoEditorWorkspace')) return;
    const original=document.createElement('div'); original.id='videoScriptMode'; while(form.firstChild) original.appendChild(form.firstChild);
    form.appendChild(document.createRange().createContextualFragment(`<div class="video-mode-switch" role="tablist"><button type="button" class="video-mode-btn" data-video-mode="script">📝 เริ่มจากไอเดีย</button><button type="button" class="video-mode-btn active" data-video-mode="editor">🎬 ใช้คลิปที่มี</button></div>`));
    form.appendChild(original);
    const editor=document.createElement('div'); editor.id='videoEditorWorkspace'; editor.innerHTML=editorHTML(); form.appendChild(editor);
    const originalResult=document.createElement('div'); originalResult.id='videoScriptResultMode'; while(result.firstChild) originalResult.appendChild(result.firstChild); result.appendChild(originalResult);
    const editorResult=document.createElement('div'); editorResult.id='videoEditorResultMode'; editorResult.innerHTML=resultHTML(); result.appendChild(editorResult);
    bind(); setMode('editor'); renderAll();
  }

  function editorHTML(){return `
    <section class="ref-video-left">
      <div class="ref-mode-intro"><h2>ใช้คลิปที่มี</h2><p>โยนคลิปเข้า → AI ปรับให้ → เอางานกลับไปใช้ หรือให้ AI ทำต่อ</p></div>
      <div class="ref-stepper">
        <div class="ref-step active"><b>1</b><span><strong>โยนคลิปเข้า</strong><small>อัปโหลดคลิปที่คุณมี</small></span></div>
        <div class="ref-step"><b>2</b><span><strong>AI ปรับให้</strong><small>AI ปรับแสง สี เสียง และแนวภาพ</small></span></div>
        <div class="ref-step"><b>3</b><span><strong>เลือกปลายทาง</strong><small>ดาวน์โหลด หรือให้ AI ทำต่อ</small></span></div>
      </div>
      <label class="video-dropzone ref-dropzone" id="videoDropzone"><input id="videoFootageInput" type="file" accept="video/*" multiple hidden><span class="video-drop-icon">☁</span><strong>ลากคลิปมาวาง หรือคลิกเลือกไฟล์</strong><small>รองรับ MP4, MOV, AVI, MKV (แนะนำ 1080p ขึ้นไป)</small><button class="btn primary" type="button" id="pickFootageBtn">เลือกไฟล์</button></label>
      <div class="ref-upload-head"><b>คลิปที่อัปโหลด</b><span id="videoUploadSummary">ยังไม่มีคลิป</span></div>
      <div class="video-clip-grid ref-clip-list" id="videoClipGrid"></div>
      <div class="ref-left-actions"><button class="btn primary" id="analyzeFootageBtn" type="button">ถัดไป: AI ปรับให้ →</button><button class="btn secondary" id="clearFootageBtn" type="button">ล้างคลิป</button></div>
      <div class="ai-work-progress" id="aiWorkProgress" hidden><b>กำลังเตรียมวิดีโอ</b><div class="ai-progress-bar"><i id="aiProgressFill"></i></div><div id="aiProgressText">กำลังเตรียมงาน...</div></div>
    </section>
    <div class="ref-hidden-context" hidden>
      <select id="editPurpose"><option>ข่าวประชาสัมพันธ์เทศบาล</option></select><select id="editTone"><option>ทางการ กระชับ น่าเชื่อถือ</option></select><select id="editTargetLength"><option value="180">3 นาที</option></select><select id="editAspect"><option value="16:9">แนวนอน 16:9</option></select><textarea id="editContext"></textarea><textarea id="editInstruction"></textarea><input id="autoEnhance" type="checkbox" checked>
    </div>`;}

  function resultHTML(){return `
    <section class="video-adjust-workspace ref-adjust-workspace" id="videoLookPanel">
      <div class="video-adjust-head"><div><h3>AI ปรับให้</h3><p>ปรับแต่งตามสไตล์ที่คุณต้องการ</p></div><button class="btn primary" id="autoLookBtn" type="button">✨ แนะนำอัตโนมัติ</button></div>
      <div class="video-adjust-tabs" role="tablist">
        <button type="button" class="active" data-adjust-tab="light">☀ แสง & สี</button><button type="button" data-adjust-tab="style">▣ แนวภาพ / สไตล์</button><button type="button" data-adjust-tab="camera">▣ กล้อง / มุมมอง</button><button type="button" data-adjust-tab="audio">🔊 เสียง</button><button type="button" data-adjust-tab="text">T ข้อความ / โลโก้</button>
      </div>
      <div class="video-adjust-body ref-adjust-body">
        <div class="video-adjust-controls">
          <div class="adjust-pane active" data-adjust-pane="light">
            <div class="look-presets ref-presets" id="lookPresets">
              <button type="button" data-look="auto" class="active">อัตโนมัติ<small>AI ปรับให้เหมาะสม</small></button><button type="button" data-look="bright">สดใส<small>สว่าง สีสดใส</small></button><button type="button" data-look="warm">อบอุ่น<small>โทนนุ่ม น่ามอง</small></button><button type="button" data-look="cinema">ภาพยนตร์<small>เข้ม มีมิติ</small></button><button type="button" data-look="cool">เย็น<small>โทนเย็น สะอาด</small></button>
            </div>
            <div class="look-controls ref-sliders"><label>ความสว่าง <input id="lookBrightness" type="range" min="60" max="145" value="100"><output>0</output></label><label>คอนทราสต์ <input id="lookContrast" type="range" min="60" max="145" value="100"><output>0</output></label><label>ความอิ่มตัวสี <input id="lookSaturation" type="range" min="40" max="160" value="100"><output>0</output></label><label>ความคมชัด <input id="lookSharpness" type="range" min="0" max="30" value="0"><output>0</output></label><input id="lookWarmth" type="range" min="-30" max="30" value="0" hidden></div>
            <div class="look-panel-foot"><button class="btn secondary" id="resetLookBtn" type="button">↶ รีเซ็ต</button><span id="lookSummary"></span></div>
          </div>
          <div class="adjust-pane" data-adjust-pane="style"><div class="adjust-choice-grid"><button class="active">ธรรมชาติ</button><button>สดใส</button><button>อบอุ่น</button><button>ภาพยนตร์</button></div></div>
          <div class="adjust-pane" data-adjust-pane="camera"><div class="adjust-choice-grid"><button type="button" class="active" data-camera-crop="source">ตามต้นฉบับ</button><button type="button" data-camera-crop="16:9">16:9</button><button type="button" data-camera-crop="9:16">9:16</button><button type="button" data-camera-crop="1:1">1:1</button></div><label class="adjust-toggle"><input id="cameraAutoFrame" type="checkbox" checked><span><b>จัดเฟรมอัตโนมัติ</b></span></label><label class="adjust-toggle"><input id="cameraStabilize" type="checkbox" checked><span><b>ลดภาพสั่น</b></span></label></div>
          <div class="adjust-pane" data-adjust-pane="audio"><label class="adjust-toggle"><input id="audioNoiseReduce" type="checkbox" checked><span><b>ลดเสียงรบกวน</b></span></label><label class="adjust-toggle"><input id="audioNormalize" type="checkbox" checked><span><b>ปรับระดับเสียงให้สม่ำเสมอ</b></span></label><label class="adjust-toggle"><input id="audioMusicDuck" type="checkbox"><span><b>ลดเพลงเมื่อมีเสียงพูด</b></span></label></div>
          <div class="adjust-pane" data-adjust-pane="text"><label class="adjust-field">ข้อความเปิดเรื่อง<input id="overlayTitle" type="text"></label><label class="adjust-toggle"><input id="overlaySubtitle" type="checkbox" checked><span><b>คำบรรยายอัตโนมัติ</b></span></label><label class="adjust-toggle"><input id="overlayLogo" type="checkbox"><span><b>เว้นพื้นที่สำหรับโลโก้</b></span></label></div>
        </div>
        <div class="video-preview-column ref-preview-column"><div class="preview-label"><b>ตัวอย่างก่อนปรับ</b></div><div class="editor-preview-stage" id="editorPreviewStage"><div class="editor-empty-preview"><span>🎬</span><b>เพิ่มคลิปเพื่อดูตัวอย่าง</b></div></div><div class="ref-clip-info"><b>ข้อมูลคลิป</b><dl><dt>ชื่อไฟล์</dt><dd id="refClipName">—</dd><dt>ความยาว</dt><dd id="refClipDuration">—</dd><dt>ขนาด</dt><dd id="refClipSize">—</dd><dt>ความละเอียด</dt><dd id="refClipResolution">—</dd></dl></div></div>
      </div>
      <div class="ref-save-row"><div><b>บันทึกเป็นสไตล์โปรด</b><small>บันทึกการตั้งค่านี้ไว้ใช้ครั้งต่อไป</small></div><button class="btn secondary" type="button">＋ บันทึกสไตล์</button></div>
      <div class="editor-export-box ref-export-box" id="editorExportBox"><button class="ref-download" id="downloadSelectedClipsBtn" type="button"><span>⇩</span><b>ดาวน์โหลดงานที่ AI ปรับให้</b><small>รับไฟล์กลับไปใช้งาน</small></button><button class="ref-continue" id="prepareAutoEditBtn" type="button"><span>✨</span><b>ให้ AI ทำต่อ</b><small>ให้ AI ตัดต่อ ใส่เพลง ใส่ข้อความ เพิ่มเอฟเฟกต์</small></button><button id="downloadClipListBtn" hidden></button><button id="downloadEditPlanBtn" hidden></button></div>
    </section>
    <div hidden><div id="editorStats"></div><span id="editorStatusPill"></span><p id="editorResultStatus"></p><details id="footageInsightDetails"><section id="footageInsightPanel"></section></details><section id="storyOptionsSection"><div id="storyOptionGrid"></div></section><section id="voiceScriptSection"><textarea id="voiceScriptText"></textarea><button id="copyVoiceScriptBtn"></button></section><section id="selectedClipsSection"><div id="smartTimeline"></div><button id="autoArrangeBtn"></button></section></div>`;}

  function bind(){
    $$('[data-video-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.videoMode)));
    $('#pickFootageBtn')?.addEventListener('click',()=>$('#videoFootageInput')?.click());
    $('#videoFootageInput')?.addEventListener('change',e=>addFiles(e.target.files));
    const dz=$('#videoDropzone'); ['dragenter','dragover'].forEach(t=>dz?.addEventListener(t,e=>{e.preventDefault();dz.classList.add('dragging')})); ['dragleave','drop'].forEach(t=>dz?.addEventListener(t,e=>{e.preventDefault();dz.classList.remove('dragging')})); dz?.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
    $('#clearFootageBtn')?.addEventListener('click',clearFiles); $('#analyzeFootageBtn')?.addEventListener('click',analyzeAll); $('#autoArrangeBtn')?.addEventListener('click',()=>autoArrange(true));
    $('#copyVoiceScriptBtn')?.addEventListener('click',async()=>{const text=$('#voiceScriptText')?.value||''; try{await navigator.clipboard.writeText(text);TANJAI.toast('คัดลอกสคริปต์แล้ว')}catch(_){TANJAI.toast('เลือกข้อความแล้วกดคัดลอกได้เลย')}});
    $('#downloadEditPlanBtn')?.addEventListener('click',downloadPlan); $('#downloadClipListBtn')?.addEventListener('click',downloadClipList); $('#downloadSelectedClipsBtn')?.addEventListener('click',downloadSelectedClipsZip);
    $('#prepareAutoEditBtn')?.addEventListener('click',()=>TANJAI.toast('เตรียมชุดงานพร้อมค่าปรับภาพสำหรับทำวิดีโอต่อแล้ว'));
    $('#autoLookBtn')?.addEventListener('click',suggestLook); $('#resetLookBtn')?.addEventListener('click',()=>applyLookPreset('auto',true));
    $$('[data-adjust-tab]').forEach(b=>b.addEventListener('click',()=>setAdjustTab(b.dataset.adjustTab)));
    $$('[data-look]').forEach(b=>b.addEventListener('click',()=>applyLookPreset(b.dataset.look,true)));
    $$('[data-camera-crop]').forEach(b=>b.addEventListener('click',()=>{state.camera.crop=b.dataset.cameraCrop;$$('[data-camera-crop]').forEach(x=>x.classList.toggle('active',x===b));TANJAI.toast('ตั้งค่าสัดส่วนภาพแล้ว')}));
    [['cameraAutoFrame','camera','autoFrame'],['cameraStabilize','camera','stabilize'],['audioNoiseReduce','audio','noiseReduce'],['audioNormalize','audio','normalize'],['audioMusicDuck','audio','musicDuck'],['overlaySubtitle','overlay','subtitle'],['overlayLogo','overlay','logo']].forEach(([id,group,key])=>$('#'+id)?.addEventListener('change',e=>state[group][key]=e.target.checked));
    $('#overlayTitle')?.addEventListener('input',e=>state.overlay.title=e.target.value);
    [['lookBrightness','brightness'],['lookContrast','contrast'],['lookSaturation','saturation'],['lookWarmth','warmth'],['lookSharpness','sharpness']].forEach(([id,key])=>$('#'+id)?.addEventListener('input',e=>{state.look[key]=Number(e.target.value);state.look.preset='custom';updateLookUI();applyPreviewLook()}));
  }
  function setAdjustTab(tab){$$('[data-adjust-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adjustTab===tab));$$('[data-adjust-pane]').forEach(p=>p.classList.toggle('active',p.dataset.adjustPane===tab));}
  function setMode(mode){state.mode=mode; $('#videoScriptMode').hidden=mode!=='script'; $('#videoEditorWorkspace').hidden=mode!=='editor'; $('#videoScriptResultMode').hidden=mode!=='script'; $('#videoEditorResultMode').hidden=mode!=='editor'; $$('[data-video-mode]').forEach(b=>b.classList.toggle('active',b.dataset.videoMode===mode));}

  async function addFiles(fileList){
    const files=Array.from(fileList||[]).filter(f=>f.type.startsWith('video/')); if(!files.length){TANJAI.toast('กรุณาเลือกไฟล์วิดีโอ');return;}
    const remaining=Math.max(0,100-state.clips.length);
    files.slice(0,remaining).forEach(file=>{const clip={id:uid(),file,name:file.name,size:file.size,url:URL.createObjectURL(file),duration:0,width:0,height:0,orientation:'กำลังอ่าน',thumbnail:'',brightness:null,sharpness:null,audioLevel:null,flags:[],score:50,status:'loading',category:'กำลังวิเคราะห์',reason:'รอวิเคราะห์'};state.clips.push(clip);inspectMetadata(clip)});
    state.analysis=null; if(!state.activeClipId)state.activeClipId=state.clips[0]?.id||null; renderAll(); TANJAI.toast(`เพิ่มฟุตเทจ ${Math.min(files.length,remaining)} คลิปแล้ว`);
  }
  function inspectMetadata(clip){const v=document.createElement('video');v.preload='metadata';v.muted=true;v.src=clip.url;v.onloadedmetadata=()=>{clip.duration=Number(v.duration)||0;clip.width=v.videoWidth||0;clip.height=v.videoHeight||0;clip.orientation=clip.width===clip.height?'จัตุรัส':clip.width>clip.height?'แนวนอน':'แนวตั้ง';clip.status='ready';if(clip.duration<2)clip.flags.push('สั้นเกินไป');captureFrame(clip,Math.min(Math.max(clip.duration*.28,.1),Math.max(.1,clip.duration-.1)));renderAll()};v.onerror=()=>{clip.status='error';clip.flags.push('เปิดไฟล์ไม่ได้');updateScore(clip);renderAll()};}
  function captureFrame(clip,time){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.src=clip.url;v.onloadedmetadata=()=>{try{v.currentTime=time}catch(_){}};v.onseeked=()=>{try{const w=320,h=Math.max(180,Math.round(w*(v.videoHeight/v.videoWidth||.5625))),c=document.createElement('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});c.width=w;c.height=h;ctx.drawImage(v,0,0,w,h);clip.thumbnail=c.toDataURL('image/jpeg',.72);const m=imageMetrics(ctx.getImageData(0,0,w,h),w,h);clip.brightness=m.brightness;clip.sharpness=m.sharpness;if(m.brightness<45)clip.flags.push('แสงน้อย');else if(m.brightness>210)clip.flags.push('สว่างเกิน');if(m.sharpness<9)clip.flags.push('อาจไม่คม');updateScore(clip)}catch(e){console.warn(e)}renderAll()};}
  function imageMetrics(img,w,h){const d=img.data,g=new Float32Array(w*h);let lum=0,edge=0,n=0;for(let i=0,p=0;i<d.length;i+=4,p++){g[p]=.299*d[i]+.587*d[i+1]+.114*d[i+2];lum+=g[p]}for(let y=1;y<h-1;y+=2)for(let x=1;x<w-1;x+=2){const p=y*w+x;edge+=Math.abs(g[p-1]-g[p+1])+Math.abs(g[p-w]-g[p+w]);n++}return{brightness:lum/(w*h),sharpness:n?edge/n:0};}
  function updateScore(c){let s=82;if(c.duration<2)s-=38;else if(c.duration<4)s-=10;if(c.flags.includes('แสงน้อย'))s-=17;if(c.flags.includes('สว่างเกิน'))s-=12;if(c.flags.includes('อาจไม่คม'))s-=18;if(c.flags.includes('เสียงเบามาก / เงียบ'))s-=10;if(c.status==='error')s=0;c.score=Math.max(0,Math.min(100,Math.round(s)));}
  async function analyzeAudio(c){if(c.status==='error')return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const ac=new AC(),buf=await c.file.arrayBuffer(),decoded=await ac.decodeAudioData(buf.slice(0));let sum=0,n=0;for(let ch=0;ch<decoded.numberOfChannels;ch++){const data=decoded.getChannelData(ch),step=Math.max(1,Math.floor(data.length/16000));for(let i=0;i<data.length;i+=step){sum+=data[i]*data[i];n++}}c.audioLevel=n?Math.sqrt(sum/n):0;if(c.audioLevel<.006)c.flags.push('เสียงเบามาก / เงียบ');await ac.close()}catch(_){c.audioLevel=null}updateScore(c);}

  async function analyzeAll(){
    if(!state.clips.length){TANJAI.toast('กรุณาเพิ่มฟุตเทจก่อน');return;}
    const btn=$('#analyzeFootageBtn');btn.disabled=true; const steps=['กำลังอ่านข้อมูลคลิปทั้งหมด','กำลังตรวจแสง สี ความคม และเสียง','กำลังแยกกลุ่มเหตุการณ์','กำลังเลือกช็อตที่เหมาะกับเรื่อง','กำลังสร้างแนวเล่าเรื่องและบทพากย์'];
    $('#aiWorkProgress').hidden=false; $('#editorStatusPill').textContent='AI กำลังทำงาน';
    for(let i=0;i<steps.length;i++){setProgress(i+1,steps.length,steps[i]);if(i===1)await Promise.all(state.clips.map(analyzeAudio));else await wait(320)}
    categorizeClips(); autoArrange(false); buildAnalysis(); buildStoryOptions(); selectStory(0); setProgress(steps.length,steps.length,'เสร็จแล้ว');
    if($('#autoEnhance')?.checked) suggestLook(false);
    btn.disabled=false;btn.textContent='✨ วิเคราะห์ใหม่อีกครั้ง';$('#editorStatusPill').textContent='พร้อมใช้งาน';$('#editorResultStatus').textContent='AI แยกคลิป เลือกช็อต และเตรียมแนวเล่าเรื่องแล้ว'; renderAll(); TANJAI.toast('วิเคราะห์ฟุตเทจเรียบร้อยแล้ว'); setTimeout(()=>{$('#aiWorkProgress').hidden=true},900);
  }
  const wait=ms=>new Promise(r=>setTimeout(r,ms)); function setProgress(now,total,text){$('#aiProgressFill').style.width=`${now/total*100}%`;$('#aiProgressText').textContent=`${text} (${now}/${total})`;}
  function categorizeClips(){
    const purpose=$('#editPurpose').value;
    state.clips.forEach((c,i)=>{const name=c.name.toLowerCase();let cat='ภาพบรรยากาศ';if(/open|intro|sign|logo|banner|ป้าย|เปิด/.test(name)||i===0)cat='ภาพเปิดเรื่อง';else if(/speech|talk|interview|สัมภาษณ์|กล่าว|ประธาน|นายก/.test(name)||(c.audioLevel||0)>.025)cat='ช่วงพูด / สัมภาษณ์';else if(/group|photo|รวม|หมู่|award|มอบ/.test(name)||i===state.clips.length-1)cat='ภาพสรุป / ปิดเรื่อง';else if(c.duration<6)cat='ช็อตเสริม';else if(purpose.includes('ประชุม'))cat='การประชุม';else if(purpose.includes('MV'))cat='ภาพตามจังหวะเพลง';else if(i%4===1)cat='กิจกรรมหลัก';else if(i%4===2)cat='ประชาชน / ผู้ร่วมงาน';c.category=cat;c.reason=c.score>=75?`ภาพคุณภาพดี เหมาะใช้ในช่วง${cat}`:c.score>=55?`ใช้ได้ แนะนำตรวจช่วงต้นและท้าย`:c.flags.join(', ')||'ควรตรวจเพิ่มเติม';});
  }
  function buildAnalysis(){const groups={};state.clips.forEach(c=>groups[c.category]=(groups[c.category]||0)+1);state.analysis={total:state.clips.length,usable:state.clips.filter(c=>c.score>=60).length,review:state.clips.filter(c=>c.score<60).length,totalDuration:state.clips.reduce((s,c)=>s+c.duration,0),groups};}
  function buildStoryOptions(){const purpose=$('#editPurpose').value,tone=$('#editTone').value,target=Number($('#editTargetLength').value||180);const d=target||Math.min(180,Math.max(45,state.analysis.totalDuration*.35));state.storyOptions=[
    {title:'เล่าเรื่องครบ กระชับ',badge:'แนะนำ',duration:d,structure:['ภาพเปิดที่ดึงความสนใจ','แนะนำงานและวัตถุประสงค์','กิจกรรมสำคัญและผู้เข้าร่วม','ช่วงเด่น / คำกล่าว','สรุปผลและภาพปิด'],focus:'ครบข้อมูล ใช้งานประชาสัมพันธ์ได้ทันที'},
    {title:'เน้นบรรยากาศและความรู้สึก',badge:'อบอุ่น',duration:Math.min(d,90),structure:['รอยยิ้มหรือช็อตเด่น','ภาพกิจกรรมต่อเนื่อง','ประชาชนมีส่วนร่วม','คำพูดสั้นที่มีความหมาย','ภาพรวมและความประทับใจ'],focus:`เหมาะกับโทน ${tone}`},
    {title:'ไฮไลต์เร็วสำหรับโซเชียล',badge:'คลิปสั้น',duration:Math.min(45,d),structure:['ช็อตเด่นใน 3 วินาทีแรก','กิจกรรมสลับเร็ว','ข้อความสำคัญบนจอ','ภาพคนและปฏิกิริยา','จบด้วยชื่อหน่วยงาน / ช่องทาง'],focus:'เหมาะกับ Reel, TikTok และ Shorts'}
  ];}
  function selectStory(index){state.selectedStory=index;const story=state.storyOptions[index];if(!story)return;state.voiceScript=generateVoiceScript(story);autoArrange(false,story.duration);renderAll();}
  function generateVoiceScript(story){const context=($('#editContext').value||'กิจกรรมครั้งนี้').trim(),purpose=$('#editPurpose').value,tone=$('#editTone').value,groups=state.analysis?.groups||{};const groupText=Object.entries(groups).slice(0,4).map(([k,v])=>`${k} ${v} คลิป`).join(', ');return `เปิดเรื่อง\n${context}\n\nบทพากย์\n${purpose} จัดขึ้นเพื่อสื่อสารเรื่องราวและบรรยากาศสำคัญให้ประชาชนได้รับทราบอย่างทั่วถึง ภายในงานมีทั้งกิจกรรมหลัก การมีส่วนร่วมของผู้เข้าร่วม และช่วงเวลาที่สะท้อนถึงความตั้งใจของผู้จัดงาน\n\nจากฟุตเทจที่ตรวจพบ ระบบได้คัดเลือก ${groupText || 'ภาพเหตุการณ์สำคัญ'} เพื่อนำมาเรียบเรียงให้เรื่องราวต่อเนื่อง เข้าใจง่าย และมีอารมณ์แบบ${tone}\n\nตลอดกิจกรรม ผู้เข้าร่วมได้ร่วมกันสร้างบรรยากาศที่มีคุณค่า พร้อมสะท้อนถึงความร่วมมือและผลลัพธ์ที่เกิดขึ้นจริง\n\nปิดเรื่อง\n${context} อีกหนึ่งกิจกรรมที่ช่วยเชื่อมโยงหน่วยงานกับประชาชน และสร้างประโยชน์ร่วมกันอย่างเป็นรูปธรรม`;} 

  function autoArrange(notify=true,forcedDuration){
    const target=forcedDuration??Number($('#editTargetLength').value||180),aspect=$('#editAspect').value,purpose=$('#editPurpose').value;
    let list=state.clips.filter(c=>c.status!=='error'&&c.score>=45);
    const catOrder={'ภาพเปิดเรื่อง':0,'ภาพบรรยากาศ':1,'ช่วงพูด / สัมภาษณ์':2,'กิจกรรมหลัก':3,'ประชาชน / ผู้ร่วมงาน':4,'การประชุม':4,'ภาพตามจังหวะเพลง':4,'ช็อตเสริม':6,'ภาพสรุป / ปิดเรื่อง':9};
    const purposeBoost=(c)=>{
      if(/สัมภาษณ์|ผู้บริหาร/.test(purpose)&&c.category==='ช่วงพูด / สัมภาษณ์')return 16;
      if(/ประชุม|ประชาคม/.test(purpose)&&c.category==='การประชุม')return 14;
      if(/ไฮไลต์|คลิปสั้น|MV/.test(purpose)&&['กิจกรรมหลัก','ภาพตามจังหวะเพลง','ประชาชน / ผู้ร่วมงาน'].includes(c.category))return 12;
      return 0;
    };
    const orientBoost=(c)=>aspect==='source'?0:((aspect==='16:9'&&c.orientation==='แนวนอน')||(aspect!=='16:9'&&c.orientation==='แนวตั้ง')?8:-3);
    list.sort((a,b)=>((catOrder[a.category]??5)-(catOrder[b.category]??5))||((b.score+purposeBoost(b)+orientBoost(b))-(a.score+purposeBoost(a)+orientBoost(a))));
    const chosen=[],usedCategory=new Map();let total=0;
    for(const c of list){
      if(target&&total>=target)break;
      const seen=usedCategory.get(c.category)||0;
      if(seen>=3&&list.length>8)continue;
      const maxUse=state.selectedStory===2?4:(c.category==='ช่วงพูด / สัมภาษณ์'?12:8);
      const use=Math.min(c.duration||0,maxUse,target?Math.max(1,target-total):maxUse);
      if(use>.5){
        const safeStart=(c.duration>use+2&&c.category!=='ภาพเปิดเรื่อง')?Math.min(Math.max(0,c.duration*.08),c.duration-use):0;
        chosen.push({clipId:c.id,start:safeStart,end:safeStart+use,duration:use,reason:c.reason});
        usedCategory.set(c.category,seen+1);total+=use;
      }
    }
    state.timeline=chosen;state.activeClipId=chosen[0]?.clipId||null;
    if(notify){renderAll();TANJAI.toast('เตรียมคลิปใหม่แล้ว')}
  }

  function lookValues(preset){return ({auto:{brightness:100,contrast:100,saturation:100,warmth:0,sharpness:0},natural:{brightness:102,contrast:103,saturation:102,warmth:1,sharpness:5},bright:{brightness:112,contrast:106,saturation:118,warmth:2,sharpness:8},warm:{brightness:106,contrast:101,saturation:108,warmth:16,sharpness:4},cinema:{brightness:94,contrast:122,saturation:88,warmth:6,sharpness:12},cool:{brightness:101,contrast:108,saturation:96,warmth:-16,sharpness:7}})[preset]||null}
  function applyLookPreset(name,notify=false){const v=lookValues(name)||lookValues('auto');state.look={preset:name,...v};updateLookUI();applyPreviewLook();if(notify)TANJAI.toast(`ใช้แนวภาพ ${name==='auto'?'อัตโนมัติ':$(`[data-look="${name}"] small`)?.parentElement?.childNodes[0]?.textContent?.trim()||name} แล้ว`)}
  function suggestLook(notify=true){const clips=state.clips.filter(c=>c.brightness!=null),avg=clips.length?clips.reduce((s,c)=>s+c.brightness,0)/clips.length:128;let preset='natural';if(avg<88)preset='bright';else if(avg>180)preset='cinema';else if($('#editTone')?.value.includes('อบอุ่น'))preset='warm';else if($('#editTone')?.value.includes('ทันสมัย'))preset='cool';applyLookPreset(preset,false);state.look.preset='auto';updateLookUI();if(notify)TANJAI.toast('AI แนะนำแสง สี และแนวภาพให้แล้ว')}
  function updateLookUI(){const map={lookBrightness:'brightness',lookContrast:'contrast',lookSaturation:'saturation',lookWarmth:'warmth',lookSharpness:'sharpness'};Object.entries(map).forEach(([id,key])=>{const input=$('#'+id);if(!input)return;input.value=state.look[key];const out=input.parentElement.querySelector('output'),base=['warmth','sharpness'].includes(key)?0:100,val=state.look[key]-base;if(out)out.textContent=(val>0?'+':'')+val});$$('[data-look]').forEach(b=>b.classList.toggle('active',state.look.preset===b.dataset.look));const sum=$('#lookSummary');if(sum)sum.textContent=`สว่าง ${state.look.brightness-100>=0?'+':''}${state.look.brightness-100} • คอนทราสต์ ${state.look.contrast-100>=0?'+':''}${state.look.contrast-100} • สี ${state.look.saturation-100>=0?'+':''}${state.look.saturation-100} • อุณหภูมิ ${state.look.warmth>=0?'+':''}${state.look.warmth}`}
  function previewFilter(){const l=state.look;return `brightness(${l.brightness}%) contrast(${l.contrast}%) saturate(${l.saturation}%) sepia(${Math.max(0,l.warmth)*.35}%) hue-rotate(${l.warmth<0?l.warmth*.45:0}deg)`}
  function applyPreviewLook(){const v=$('#editorPreviewStage video');if(v)v.style.filter=previewFilter();updateLookUI()}
  function renderAll(){renderClips();renderStats();renderInsights();renderStories();renderTimeline();renderPreview();updateLookUI();}
  function renderClips(){const grid=$('#videoClipGrid');if(!grid)return;const totalSize=state.clips.reduce((s,c)=>s+c.size,0);$('#videoUploadSummary').textContent=state.clips.length?`${state.clips.length} คลิป • ${fmtSize(totalSize)} • ความยาวรวม ${fmtTime(state.clips.reduce((s,c)=>s+c.duration,0))}`:'ยังไม่มีคลิป';grid.innerHTML=state.clips.map(c=>`<article class="video-clip-card ${c.score<60?'warning':''}"><div class="clip-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:'<span>🎞️</span>'}<small>${fmtTime(c.duration)}</small></div><div class="clip-card-body"><b title="${esc(c.name)}">${esc(c.name)}</b><span>${c.orientation} • ${fmtSize(c.size)}</span><div class="clip-quality"><i style="width:${c.score}%"></i></div><small>${c.category} • คะแนน ${c.score}/100</small><div class="clip-flags">${c.flags.length?c.flags.map(f=>`<em>${esc(f)}</em>`).join(''):'<em class="ok">พร้อมใช้</em>'}</div></div><button class="clip-remove" type="button" data-remove-clip="${c.id}">×</button></article>`).join('');$$('[data-remove-clip]',grid).forEach(b=>b.onclick=()=>removeClip(b.dataset.removeClip));}
  function renderStats(){const a=state.analysis||{total:state.clips.length,usable:state.clips.filter(c=>c.score>=60).length,review:state.clips.filter(c=>c.score<60).length,totalDuration:state.clips.reduce((s,c)=>s+c.duration,0)};$('#editorStats').innerHTML=`<article><small>คลิปทั้งหมด</small><b>${a.total}</b></article><article><small>AI เลือกให้</small><b>${state.timeline.length}</b></article><article><small>ควรตรวจ</small><b>${a.review}</b></article><article><small>ความยาวรวม</small><b>${fmtTime(a.totalDuration)}</b></article>`;if(!state.clips.length)$('#editorStatusPill').textContent='รอคลิป';else if(!state.analysis)$('#editorStatusPill').textContent='พร้อมวิเคราะห์';}
  function renderInsights(){const panel=$('#footageInsightPanel'),details=$('#footageInsightDetails');if(!panel||!details)return;if(!state.analysis){details.hidden=true;panel.innerHTML='';return;}details.hidden=false;const groups=Object.entries(state.analysis.groups).sort((a,b)=>b[1]-a[1]);panel.innerHTML=`<div class="insight-summary"><h4>สรุปคลิป</h4><p>พร้อมใช้ <b>${state.analysis.usable}</b> คลิป • ควรตรวจ <b>${state.analysis.review}</b> คลิป</p></div><div class="clip-group-grid">${groups.map(([g,n])=>`<article><b>${n}</b><span>${esc(g)}</span></article>`).join('')}</div><div class="director-note"><b>คำแนะนำเพิ่มเติม</b><p>${state.analysis.usable>=6?'มีคลิปเพียงพอสำหรับทำเรื่องได้หลายรูปแบบ':'คลิปที่พร้อมใช้ยังมีไม่มาก เหมาะกับวิดีโอสั้นหรือควรเพิ่มภาพบรรยากาศ'}</p></div>`;}
  function renderStories(){const sec=$('#storyOptionsSection'),voice=$('#voiceScriptSection'),selected=$('#selectedClipsSection'),exp=$('#editorExportBox');if(!state.analysis){sec.hidden=voice.hidden=selected.hidden=true;exp.hidden=false;const lp=$('#videoLookPanel');if(lp)lp.hidden=false;return;}sec.hidden=voice.hidden=selected.hidden=exp.hidden=false;const lp=$('#videoLookPanel');if(lp)lp.hidden=false;$('#storyOptionGrid').innerHTML=state.storyOptions.map((s,i)=>`<button type="button" class="story-option ${i===state.selectedStory?'active':''}" data-story="${i}"><small>${s.badge}</small><b>${s.title}</b><span>${fmtTime(s.duration)} • ${s.focus}</span><ol>${s.structure.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></button>`).join('');$$('[data-story]').forEach(b=>b.onclick=()=>selectStory(Number(b.dataset.story)));$('#voiceScriptText').value=state.voiceScript;}
  function renderTimeline(){const el=$('#smartTimeline');if(!el)return;if(!state.timeline.length){el.innerHTML='<div class="timeline-empty">ยังไม่มีคลิปที่เตรียมไว้</div>';return;}el.innerHTML=state.timeline.map((t,i)=>{const c=clipById(t.clipId);return c?`<article class="timeline-item ${state.activeClipId===c.id?'active':''}" data-select-timeline="${c.id}"><div class="timeline-index">${i+1}</div><div class="timeline-thumb">${c.thumbnail?`<img src="${c.thumbnail}" alt="">`:'🎞️'}</div><div class="timeline-info"><b>${esc(c.name)}</b><span>${c.category} • ${fmtTime(t.start)}–${fmtTime(t.end)}</span><small>${esc(c.reason)}</small></div><div class="timeline-actions"><button type="button" data-move="-1" data-index="${i}">↑</button><button type="button" data-move="1" data-index="${i}">↓</button><button type="button" data-remove-timeline="${i}">×</button></div></article>`:''}).join('');$$('[data-select-timeline]',el).forEach(x=>x.onclick=e=>{if(e.target.closest('button'))return;state.activeClipId=x.dataset.selectTimeline;renderPreview();$$('.timeline-item').forEach(y=>y.classList.toggle('active',y===x))});$$('[data-move]',el).forEach(b=>b.onclick=()=>moveTimeline(Number(b.dataset.index),Number(b.dataset.move)));$$('[data-remove-timeline]',el).forEach(b=>b.onclick=()=>removeTimeline(Number(b.dataset.removeTimeline)));}
  function renderPreview(){const stage=$('#editorPreviewStage'),c=clipById(state.activeClipId)||state.clips[0];if(!c){stage.innerHTML='<div class="editor-empty-preview"><span>🎬</span><b>เพิ่มคลิปเพื่อดูตัวอย่าง</b></div>';['refClipName','refClipDuration','refClipSize','refClipResolution'].forEach(id=>{const e=$('#'+id);if(e)e.textContent='—'});return;}const t=state.timeline.find(x=>x.clipId===c.id);stage.innerHTML=`<video style="filter:${previewFilter()}" src="${c.url}#t=${t?.start||0},${t?.end||c.duration}" controls playsinline preload="metadata"></video>`;const vals={refClipName:c.name,refClipDuration:fmtTime(c.duration),refClipSize:fmtSize(c.size),refClipResolution:(c.width&&c.height)?`${c.width}×${c.height}`:'กำลังอ่าน'};Object.entries(vals).forEach(([id,v])=>{const e=$('#'+id);if(e)e.textContent=v});}
  function moveTimeline(i,d){const n=i+d;if(n<0||n>=state.timeline.length)return;[state.timeline[i],state.timeline[n]]=[state.timeline[n],state.timeline[i]];renderTimeline()} function removeTimeline(i){state.timeline.splice(i,1);state.activeClipId=state.timeline[0]?.clipId||null;renderAll()}
  function removeClip(id){const c=clipById(id);if(c)URL.revokeObjectURL(c.url);state.clips=state.clips.filter(x=>x.id!==id);state.timeline=state.timeline.filter(x=>x.clipId!==id);state.analysis=null;renderAll()}
  function clearFiles(){state.clips.forEach(c=>URL.revokeObjectURL(c.url));state.clips=[];state.timeline=[];state.analysis=null;state.storyOptions=[];state.voiceScript='';state.activeClipId=null;const input=$('#videoFootageInput');if(input)input.value='';renderAll();TANJAI.toast('ล้างคลิปแล้ว')}

  function sanitizeFileName(name='file'){return String(name).replace(/[\\/:*?"<>|]/g,'_').replace(/\s+/g,' ').trim()||'file'}
  function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
  function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
  function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
  function joinBytes(parts){const len=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
  function dosDateTime(d=new Date()){let year=Math.max(1980,d.getFullYear());return {time:(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date:((year-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()}}
  async function makeStoreZip(entries){const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;for(const e of entries){const name=enc.encode(e.name),data=e.data instanceof Uint8Array?e.data:new Uint8Array(await e.data.arrayBuffer()),crc=crc32(data),dt=dosDateTime(e.date||new Date());const local=joinBytes([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(dt.time),u16(dt.date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);locals.push(local);const central=joinBytes([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(dt.time),u16(dt.date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);centrals.push(central);offset+=local.length}const centralSize=centrals.reduce((n,p)=>n+p.length,0),end=joinBytes([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralSize),u32(offset),u16(0)]);return new Blob([...locals,...centrals,end],{type:'application/zip'})}
  async function downloadSelectedClipsZip(){if(!state.timeline.length){TANJAI.toast('ยังไม่มีคลิปที่เตรียมไว้');return}const btn=$('#downloadSelectedClipsBtn'),old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='กำลังรวมคลิป...'}try{const entries=[],used=new Map();for(let i=0;i<state.timeline.length;i++){const t=state.timeline[i],c=clipById(t.clipId);if(!c?.file)continue;let base=sanitizeFileName(c.name),key=base.toLowerCase(),count=(used.get(key)||0)+1;used.set(key,count);if(count>1){const dot=base.lastIndexOf('.');base=dot>0?`${base.slice(0,dot)}-${count}${base.slice(dot)}`:`${base}-${count}`}entries.push({name:`คลิปที่เลือก/${String(i+1).padStart(2,'0')}-${base}`,data:c.file,date:new Date(c.file.lastModified||Date.now())})}const csv=['ลำดับ,ชื่อไฟล์,กลุ่ม,เริ่ม,จบ,คะแนน,เหตุผล',...state.timeline.map((t,i)=>{const c=clipById(t.clipId);return `${i+1},"${(c?.name||'').replace(/"/g,'""')}","${c?.category||''}",${t.start.toFixed(1)},${t.end.toFixed(1)},${c?.score||0},"${(c?.reason||'').replace(/"/g,'""')}"`})].join('\n');entries.push({name:'แผนงาน/รายชื่อคลิป.csv',data:new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})});entries.push({name:'แผนงาน/สคริปต์เสียงพากย์.txt',data:new Blob([($('#voiceScriptText')?.value||state.voiceScript||'')],{type:'text/plain;charset=utf-8'})});entries.push({name:'อ่านก่อนใช้.txt',data:new Blob(['ชุดนี้คือคลิปต้นฉบับที่ AI เลือกและเรียงลำดับให้แล้ว\nไฟล์ยังไม่ถูกตัดช่วงหรือปรับสีลงในไฟล์จริง จึงสามารถนำไปตัดต่อใน Premiere, CapCut หรือโปรแกรมอื่นได้โดยไม่เสียคุณภาพ\nดูเวลาเริ่ม-จบที่แนะนำในไฟล์ แผนงาน/รายชื่อคลิป.csv'],{type:'text/plain;charset=utf-8'})});const zip=await makeStoreZip(entries);downloadBlob(zip,`tanjai-selected-footage-${new Date().toISOString().slice(0,10)}.zip`);TANJAI.toast(`ดาวน์โหลดคลิปที่เตรียมไว้ ${entries.length-3} คลิปแล้ว`)}catch(err){console.error(err);TANJAI.toast('รวมไฟล์ไม่สำเร็จ ลองลดจำนวนคลิปหรือขนาดไฟล์')}finally{if(btn){btn.disabled=false;btn.textContent=old}}}

  function downloadPlan(){if(!state.analysis){TANJAI.toast('กรุณาให้ AI เตรียมคลิปก่อน');return;}const story=state.storyOptions[state.selectedStory];const data={app:'Tanjai AI Studio',version:'11.3.0',createdAt:new Date().toISOString(),context:{purpose:$('#editPurpose').value,tone:$('#editTone').value,details:$('#editContext').value,instruction:$('#editInstruction').value,aspect:$('#editAspect').value,look:state.look},analysis:state.analysis,story,voiceScript:$('#voiceScriptText').value,selectedClips:state.timeline.map((t,i)=>{const c=clipById(t.clipId);return{order:i+1,fileName:c?.name,category:c?.category,start:t.start,end:t.end,duration:t.duration,qualityScore:c?.score,reason:c?.reason,flags:c?.flags}})};downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'tanjai-video-project-v11.3.0.json')}
  function downloadClipList(){if(!state.timeline.length){TANJAI.toast('ยังไม่มีคลิปที่เลือก');return;}const lines=['ลำดับ,ชื่อไฟล์,กลุ่ม,เริ่ม,จบ,คะแนน,เหตุผล',...state.timeline.map((t,i)=>{const c=clipById(t.clipId);return `${i+1},"${(c?.name||'').replace(/"/g,'""')}","${c?.category||''}",${t.start.toFixed(1)},${t.end.toFixed(1)},${c?.score||0},"${(c?.reason||'').replace(/"/g,'""')}"`})];downloadBlob(new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),'tanjai-selected-clips.csv')}
  function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

  document.addEventListener('DOMContentLoaded',install); TANJAI.videoEditorState=state;
})();

window.TANJAI = window.TANJAI || {};

(() => {
  const state = {
    clips: [],
    activeId: null,
    aspect: '16:9',
    title: '',
    showTitle: true,
    exporting: false,
    dragId: null
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v = '') => String(v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const uid = () => `edit-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const fmt = sec => {
    const value = Math.max(0, Number(sec) || 0);
    return `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(Math.floor(value % 60)).padStart(2,'0')}`;
  };
  const active = () => state.clips.find(c => c.id === state.activeId);
  const totalDuration = () => state.clips.reduce((sum,c) => sum + Math.max(0,(c.trimEnd || c.duration) - c.trimStart), 0);

  function install() {
    const root = $('#tanjaiVideoEditor');
    if (!root || root.dataset.ready) return;
    root.dataset.ready = 'true';
    root.innerHTML = html();
    bind(root);
    render();
  }

  function html() {
    return `
      <section class="te-shell">
        <header class="te-head">
          <div><small>TANJAI VIDEO EDITOR</small><h3>✂️ ตัดต่อวิดีโอ</h3><p>เรียงคลิป ตัดหัว–ท้าย ใส่ชื่อเรื่อง และส่งออกเป็นวิดีโอเดียว</p></div>
          <div class="te-head-actions">
            <button class="btn secondary" id="teBackToPrep" type="button">← กลับไปเตรียมคลิป</button>
            <button class="btn primary" id="teAiArrange" type="button">✨ AI เรียงฉบับร่าง</button>
          </div>
        </header>

        <div class="te-toolbar">
          <label class="btn secondary te-upload">+ เพิ่มคลิป<input id="teFileInput" type="file" accept="video/*,.mp4,.mov,.avi,.mkv,.webm" multiple hidden></label>
          <label>สัดส่วน
            <select id="teAspect"><option>16:9</option><option>9:16</option><option>1:1</option></select>
          </label>
          <label class="te-title-field">ชื่อเรื่อง
            <input id="teTitle" type="text" placeholder="เช่น สรุปกิจกรรมเทศบาลเมืองบางรักน้อย">
          </label>
          <label class="te-check"><input id="teShowTitle" type="checkbox" checked> แสดงชื่อเรื่องบนวิดีโอ</label>
        </div>

        <div class="te-workspace">
          <section class="te-preview-card">
            <div class="te-preview-head"><b>ตัวอย่าง</b><span id="teAspectLabel">16:9</span></div>
            <div class="te-stage aspect-16-9" id="teStage"></div>
            <div class="te-play-tools">
              <button class="btn secondary" id="tePrevClip" type="button">← คลิปก่อนหน้า</button>
              <span id="teActiveMeta">ยังไม่มีคลิป</span>
              <button class="btn secondary" id="teNextClip" type="button">คลิปถัดไป →</button>
            </div>
          </section>

          <aside class="te-inspector">
            <div><small>คลิปที่เลือก</small><h4 id="teClipName">—</h4></div>
            <label>เริ่มต้น <output id="teTrimStartOut">00:00</output><input id="teTrimStart" type="range" min="0" max="1" step="0.1" value="0"></label>
            <label>สิ้นสุด <output id="teTrimEndOut">00:00</output><input id="teTrimEnd" type="range" min="0" max="1" step="0.1" value="1"></label>
            <div class="te-trim-summary" id="teTrimSummary">เลือกคลิปเพื่อกำหนดช่วงใช้งาน</div>
            <button class="btn danger" id="teRemoveClip" type="button">นำคลิปออกจาก Timeline</button>
          </aside>
        </div>

        <section class="te-timeline-card">
          <header><div><small>TIMELINE</small><h4>ลากคลิปเพื่อจัดลำดับ</h4></div><span id="teTimelineSummary">0 คลิป • 00:00</span></header>
          <div class="te-timeline" id="teTimeline"></div>
        </section>

        <section class="te-export-card">
          <div><b>พร้อมนำไปใช้งาน</b><small>บันทึกแผนตัดต่อเป็น JSON หรือรวม Timeline เป็นวิดีโอหนึ่งไฟล์</small></div>
          <div class="te-export-actions">
            <button class="btn secondary" id="teDownloadPlan" type="button">ดาวน์โหลดแผนตัดต่อ</button>
            <button class="btn primary" id="teExportVideo" type="button">ส่งออกวิดีโอ</button>
          </div>
          <div class="te-export-progress" id="teExportProgress" hidden><span><b id="teExportText">กำลังเตรียม...</b><strong id="teExportPercent">0%</strong></span><i><em id="teExportBar"></em></i></div>
          <p class="te-export-note">หมายเหตุ: รูปแบบ MP4 ขึ้นอยู่กับ Codec ที่เบราว์เซอร์รองรับ หากเครื่องไม่รองรับ ระบบจะส่งออก WebM แทน</p>
        </section>
      </section>`;
  }

  function bind(root) {
    $('#teBackToPrep',root).addEventListener('click', () => TANJAI.switchView?.('video'));
    $('#teAiArrange',root).addEventListener('click', arrangeDraft);
    $('#teFileInput',root).addEventListener('change', e => addFiles(e.target.files));
    $('#teAspect',root).addEventListener('change', e => { state.aspect=e.target.value; renderPreview(); });
    $('#teTitle',root).addEventListener('input', e => { state.title=e.target.value; renderPreview(); });
    $('#teShowTitle',root).addEventListener('change', e => { state.showTitle=e.target.checked; renderPreview(); });
    $('#teTrimStart',root).addEventListener('input', e => setTrim('start', Number(e.target.value)));
    $('#teTrimEnd',root).addEventListener('input', e => setTrim('end', Number(e.target.value)));
    $('#teRemoveClip',root).addEventListener('click', removeActive);
    $('#tePrevClip',root).addEventListener('click', () => moveActive(-1));
    $('#teNextClip',root).addEventListener('click', () => moveActive(1));
    $('#teDownloadPlan',root).addEventListener('click', downloadPlan);
    $('#teExportVideo',root).addEventListener('click', exportVideo);
    document.addEventListener('tanjai:video-continue', e => importPrepared(e.detail));
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(f.name));
    for (const file of files) {
      const clip = {id:uid(),name:file.name,file,url:URL.createObjectURL(file),duration:0,width:0,height:0,trimStart:0,trimEnd:0,ownedUrl:true,look:null};
      state.clips.push(clip);
      await inspect(clip);
    }
    if (!state.activeId) state.activeId = state.clips[0]?.id || null;
    render();
    TANJAI.toast?.(`เพิ่ม ${files.length} คลิปใน Timeline แล้ว`);
  }

  function importPrepared(detail = {}) {
    const incoming = Array.from(detail.clips || []);
    incoming.forEach(source => {
      if (state.clips.some(c => c.sourceId === source.id)) return;
      state.clips.push({
        id:uid(), sourceId:source.id, name:source.name, file:source.file, url:source.url,
        duration:source.duration || 0, width:source.width || 0, height:source.height || 0,
        trimStart:0, trimEnd:source.duration || 0, ownedUrl:false, look:{...(detail.look || {})}
      });
    });
    if (!state.activeId) state.activeId = state.clips[0]?.id || null;
    render();
  }

  function inspect(clip) {
    return new Promise(resolve => {
      const video=document.createElement('video');
      video.preload='metadata'; video.src=clip.url;
      video.onloadedmetadata=()=>{clip.duration=Number(video.duration)||0;clip.trimEnd=clip.duration;clip.width=video.videoWidth;clip.height=video.videoHeight;resolve();};
      video.onerror=()=>resolve();
    });
  }

  function render() {
    renderTimeline();
    renderPreview();
    renderInspector();
    const disabled = !state.clips.length || state.exporting;
    $('#teAiArrange').disabled=disabled; $('#teExportVideo').disabled=disabled; $('#teDownloadPlan').disabled=!state.clips.length;
    $('#teTimelineSummary').textContent=`${state.clips.length} คลิป • ${fmt(totalDuration())}`;
  }

  function renderTimeline() {
    const timeline=$('#teTimeline');
    timeline.innerHTML=state.clips.length ? state.clips.map((c,i)=>`
      <article class="te-clip ${c.id===state.activeId?'active':''}" draggable="true" data-te-id="${c.id}">
        <span>${String(i+1).padStart(2,'0')}</span>
        <div><b title="${esc(c.name)}">${esc(c.name)}</b><small>${fmt(c.trimStart)}–${fmt(c.trimEnd||c.duration)} • ${fmt((c.trimEnd||c.duration)-c.trimStart)}</small></div>
      </article>`).join('') : `<div class="te-empty">เพิ่มคลิปจากเครื่อง หรือส่งมาจากหน้า “เตรียมคลิป”</div>`;
    $$('[data-te-id]',timeline).forEach(card=>{
      card.addEventListener('click',()=>{state.activeId=card.dataset.teId;render();});
      card.addEventListener('dragstart',()=>{state.dragId=card.dataset.teId;card.classList.add('dragging');});
      card.addEventListener('dragend',()=>{state.dragId=null;card.classList.remove('dragging');});
      card.addEventListener('dragover',e=>e.preventDefault());
      card.addEventListener('drop',e=>{e.preventDefault();reorder(state.dragId,card.dataset.teId);});
    });
  }

  function renderPreview() {
    const clip=active(), stage=$('#teStage');
    stage.className=`te-stage aspect-${state.aspect.replace(':','-')}`;
    $('#teAspectLabel').textContent=state.aspect;
    if(!clip){stage.innerHTML='<div class="te-stage-empty"><span>🎞️</span><b>ยังไม่มีคลิปใน Timeline</b></div>';$('#teActiveMeta').textContent='ยังไม่มีคลิป';return;}
    const title=state.showTitle&&state.title.trim()?`<div class="te-title-overlay">${esc(state.title)}</div>`:'';
    stage.innerHTML=`<video src="${clip.url}" controls playsinline preload="metadata"></video>${title}`;
    const video=$('video',stage);
    video.addEventListener('loadedmetadata',()=>{try{video.currentTime=clip.trimStart;}catch(_){}});
    video.addEventListener('timeupdate',()=>{if(video.currentTime>=clip.trimEnd){video.pause();video.currentTime=clip.trimStart;}});
    $('#teActiveMeta').textContent=`${clip.name} • ${fmt(clip.trimEnd-clip.trimStart)}`;
  }

  function renderInspector() {
    const clip=active(), controls=[$('#teTrimStart'),$('#teTrimEnd'),$('#teRemoveClip')];
    controls.forEach(x=>x.disabled=!clip||state.exporting);
    $('#teClipName').textContent=clip?.name||'—';
    if(!clip){$('#teTrimStartOut').textContent='00:00';$('#teTrimEndOut').textContent='00:00';$('#teTrimSummary').textContent='เลือกคลิปเพื่อกำหนดช่วงใช้งาน';return;}
    const start=$('#teTrimStart'),end=$('#teTrimEnd');
    start.max=Math.max(.1,clip.duration-.1);end.max=clip.duration;start.value=clip.trimStart;end.value=clip.trimEnd;
    $('#teTrimStartOut').textContent=fmt(clip.trimStart);$('#teTrimEndOut').textContent=fmt(clip.trimEnd);
    $('#teTrimSummary').textContent=`ใช้ช่วง ${fmt(clip.trimStart)}–${fmt(clip.trimEnd)} • ความยาว ${fmt(clip.trimEnd-clip.trimStart)}`;
  }

  function setTrim(which,value) {
    const clip=active();if(!clip)return;
    if(which==='start')clip.trimStart=Math.min(value,clip.trimEnd-.1);
    else clip.trimEnd=Math.max(value,clip.trimStart+.1);
    renderTimeline();renderInspector();
    const video=$('#teStage video');if(video){video.currentTime=clip.trimStart;}
  }

  function reorder(fromId,toId) {
    if(!fromId||fromId===toId)return;
    const from=state.clips.findIndex(c=>c.id===fromId),to=state.clips.findIndex(c=>c.id===toId);
    if(from<0||to<0)return;
    const [item]=state.clips.splice(from,1);state.clips.splice(to,0,item);render();
  }

  function removeActive() {
    const clip=active();if(!clip)return;
    if(!confirm(`นำ “${clip.name}” ออกจาก Timeline หรือไม่?\nไฟล์ต้นฉบับจะไม่ถูกลบ`))return;
    if(clip.ownedUrl)URL.revokeObjectURL(clip.url);
    const index=state.clips.indexOf(clip);state.clips.splice(index,1);state.activeId=state.clips[Math.min(index,state.clips.length-1)]?.id||null;render();
  }

  function moveActive(direction) {
    const index=state.clips.findIndex(c=>c.id===state.activeId);if(index<0)return;
    state.activeId=state.clips[(index+direction+state.clips.length)%state.clips.length].id;render();
  }

  function arrangeDraft() {
    if(state.clips.length<2)return;
    const original=new Map(state.clips.map((c,i)=>[c.id,i]));
    state.clips.sort((a,b)=>{
      const aLandscape=a.width>=a.height?0:1,bLandscape=b.width>=b.height?0:1;
      if(aLandscape!==bLandscape)return aLandscape-bLandscape;
      const aShort=(a.trimEnd-a.trimStart)<=8?0:1,bShort=(b.trimEnd-b.trimStart)<=8?0:1;
      return aShort-bShort || original.get(a.id)-original.get(b.id);
    });
    render();TANJAI.toast?.('AI เรียงฉบับร่างให้แล้ว — ยังลากสลับได้ตามต้องการ');
  }

  function downloadPlan() {
    const plan={version:'11.6.8',title:state.title,aspect:state.aspect,totalDuration:totalDuration(),clips:state.clips.map((c,i)=>({order:i+1,name:c.name,trimStart:c.trimStart,trimEnd:c.trimEnd,look:c.look}))};
    TANJAI.downloadText?.(JSON.stringify(plan,null,2),`Tanjai-Edit-Plan-${Date.now()}.json`);
  }

  function format() {
    const options=[
      {mime:'video/mp4;codecs=avc1.42E01E,mp4a.40.2',ext:'mp4'},
      {mime:'video/mp4',ext:'mp4'},
      {mime:'video/webm;codecs=vp9,opus',ext:'webm'},
      {mime:'video/webm;codecs=vp8,opus',ext:'webm'},
      {mime:'video/webm',ext:'webm'}
    ];
    return options.find(x=>MediaRecorder.isTypeSupported(x.mime))||{mime:'',ext:'webm'};
  }

  async function exportVideo() {
    if(!state.clips.length||state.exporting)return;
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){TANJAI.toast?.('เบราว์เซอร์นี้ยังไม่รองรับการส่งออกวิดีโอ');return;}
    state.exporting=true;render();setProgress(0,'กำลังเตรียม Timeline...');
    const dims=state.aspect==='9:16'?[720,1280]:state.aspect==='1:1'?[1080,1080]:[1280,720];
    const canvas=document.createElement('canvas');canvas.width=dims[0];canvas.height=dims[1];
    const ctx=canvas.getContext('2d');const stream=canvas.captureStream(30);
    const audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    const audioDest=audioCtx.createMediaStreamDestination();audioDest.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const chosen=format(),chunks=[],recorder=new MediaRecorder(stream,chosen.mime?{mimeType:chosen.mime,videoBitsPerSecond:8000000,audioBitsPerSecond:192000}:undefined);
    recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
    const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start(500);
    try{
      await audioCtx.resume();
      let elapsed=0;const total=Math.max(.1,totalDuration());
      for(let index=0;index<state.clips.length;index++){
        const clip=state.clips[index],video=document.createElement('video');video.src=clip.url;video.playsInline=true;video.preload='auto';
        await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(new Error(`เปิด ${clip.name} ไม่ได้`));video.load();});
        const source=audioCtx.createMediaElementSource(video);source.connect(audioDest);video.currentTime=clip.trimStart;
        await new Promise(resolve=>{if(video.readyState>=2)return resolve();video.onloadeddata=resolve;});
        let ended=false;
        const draw=()=>{
          if(ended)return;
          drawFrame(ctx,canvas,video,clip.look);
          const local=Math.max(0,video.currentTime-clip.trimStart),pct=((elapsed+local)/total)*100;
          setProgress(pct,`คลิป ${index+1}/${state.clips.length}: ${clip.name}`);
          requestAnimationFrame(draw);
        };
        draw();await video.play();
        await new Promise(resolve=>{const check=setInterval(()=>{if(video.currentTime>=clip.trimEnd||video.ended){clearInterval(check);resolve();}},50);});
        ended=true;video.pause();elapsed+=clip.trimEnd-clip.trimStart;source.disconnect();video.removeAttribute('src');video.load();
      }
      recorder.stop();await stopped;
      const actual=recorder.mimeType||chosen.mime||'video/webm',ext=/mp4/i.test(actual)?'mp4':'webm';
      const blob=new Blob(chunks,{type:actual}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`Tanjai-Video-${Date.now()}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);
      setProgress(100,`ส่งออก ${ext.toUpperCase()} เรียบร้อย`);TANJAI.toast?.(`ส่งออก ${ext.toUpperCase()} เรียบร้อย`);
    }catch(err){
      console.error(err);if(recorder.state!=='inactive')recorder.stop();TANJAI.toast?.(err.message||'ส่งออกวิดีโอไม่สำเร็จ');
    }finally{
      stream.getTracks().forEach(t=>t.stop());audioDest.stream.getTracks().forEach(t=>t.stop());await audioCtx.close().catch(()=>{});canvas.width=1;canvas.height=1;
      state.exporting=false;render();setTimeout(()=>{$('#teExportProgress').hidden=true;},1800);
    }
  }

  function drawFrame(ctx,canvas,video,look) {
    ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
    const scale=Math.min(canvas.width/video.videoWidth,canvas.height/video.videoHeight),w=video.videoWidth*scale,h=video.videoHeight*scale,x=(canvas.width-w)/2,y=(canvas.height-h)/2;
    if(look)ctx.filter=`brightness(${look.brightness||100}%) contrast(${look.contrast||100}%) saturate(${look.saturation||100}%) sepia(${Math.max(0,look.warmth||0)*.45}%)`;
    ctx.drawImage(video,x,y,w,h);ctx.filter='none';
    if(state.showTitle&&state.title.trim()){
      const font=Math.max(26,Math.round(canvas.width*.03));ctx.font=`700 ${font}px sans-serif`;ctx.textAlign='center';
      const width=Math.min(canvas.width*.86,ctx.measureText(state.title).width+54),left=(canvas.width-width)/2,top=canvas.height-font*2.25;
      ctx.fillStyle='rgba(8,10,20,.78)';roundRect(ctx,left,top,width,font*1.55,18);ctx.fill();
      ctx.fillStyle='#fff';ctx.fillText(state.title,canvas.width/2,top+font*1.08);
    }
  }

  function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}
  function setProgress(percent,text){$('#teExportProgress').hidden=false;$('#teExportBar').style.width=`${Math.max(0,Math.min(100,percent))}%`;$('#teExportPercent').textContent=`${Math.round(percent)}%`;$('#teExportText').textContent=text;}

  document.addEventListener('DOMContentLoaded',install);
  TANJAI.timelineEditorState=state;
})();

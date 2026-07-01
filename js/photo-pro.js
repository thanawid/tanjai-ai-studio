(function(){
  const T = window.TANJAI = window.TANJAI || {};
  const $ = T.$ || (s => document.querySelector(s));
  const $$ = T.$$ || (s => Array.from(document.querySelectorAll(s)));
  const state = {files:[], outputs:[], originals:[]};

  const presets = {
    auto:{name:'Auto Pro', brightness:10, contrast:12, saturation:8, warmth:2, shadows:10, highlights:-4, sharpness:18},
    meeting:{name:'ภาพประชุม / กิจกรรม', brightness:9, contrast:10, saturation:5, warmth:1, shadows:14, highlights:-6, sharpness:16},
    indoor:{name:'ภาพในห้องแสงน้อย', brightness:18, contrast:10, saturation:6, warmth:3, shadows:24, highlights:-8, sharpness:14},
    outdoor:{name:'กลางแจ้ง / แสงแรง', brightness:2, contrast:8, saturation:5, warmth:0, shadows:8, highlights:-18, sharpness:14},
    portrait:{name:'ภาพบุคคลธรรมชาติ', brightness:8, contrast:6, saturation:3, warmth:4, shadows:8, highlights:-5, sharpness:10},
    product:{name:'สินค้า / อาหาร', brightness:12, contrast:14, saturation:14, warmth:2, shadows:8, highlights:-3, sharpness:20},
    dark:{name:'แก้ภาพมืด', brightness:25, contrast:9, saturation:7, warmth:2, shadows:30, highlights:-10, sharpness:15},
    clean:{name:'สุภาพ / ราชการ', brightness:7, contrast:7, saturation:2, warmth:0, shadows:8, highlights:-4, sharpness:12},
    sharp:{name:'เพิ่มความคม', brightness:4, contrast:10, saturation:4, warmth:0, shadows:4, highlights:-3, sharpness:32}
  };

  function setResultIdle(){
    const host = $('#photoProResult');
    if(!host) return;
    host.innerHTML = `
      <div class="ready-card photo-ready-card">
        <div class="ready-head"><div><span>ผลลัพธ์พร้อมดาวน์โหลด</span><h3>AI Photo Pro</h3><p>อัปโหลดภาพ แล้วกดปรับภาพ ระบบจะทำงานในเครื่องนี้ ไม่สร้างภาพใหม่</p></div></div>
        <pre class="ready-output">ยังไม่มีภาพที่ปรับแล้ว</pre>
        <details class="advanced-output"><summary>หลักการปลอดภัย</summary><div>ปรับเฉพาะแสง สี เงา ความคมชัด และขนาดไฟล์ ไม่เปลี่ยนใบหน้า ไม่เพิ่มวัตถุ ไม่สร้างฉากใหม่</div></details>
      </div>`;
  }

  function renderForm(){
    const form = $('#photoProForm');
    if(!form) return;
    form.innerHTML = `
      <div class="form-note photo-pro-note"><b>โหมดแต่งภาพจริง</b><span>ปรับหลายภาพพร้อมกันในเว็บ — ไม่สร้างภาพใหม่ ไม่เปลี่ยนใบหน้า ไม่แต่งวัตถุปลอม</span></div>
      <div class="form-section photo-pro-section">
        <div class="section-title"><b>1</b><h4>อัปโหลดภาพจริง</h4></div>
        <div class="form-grid">
          <label class="full">เลือกรูปภาพหลายไฟล์
            <input id="photoPro-files" type="file" accept="image/*" multiple>
            <small>เหมาะกับภาพกิจกรรม ภาพประชุม ภาพลงพื้นที่ รูปมือถือ หรือรูปสำหรับลง Facebook / Line</small>
          </label>
          <div class="full photo-file-summary" id="photoPro-fileSummary">ยังไม่ได้เลือกรูป</div>
          <div class="full photo-preview-strip" id="photoPro-inputPreview"></div>
        </div>
      </div>
      <div class="form-section photo-pro-section">
        <div class="section-title"><b>2</b><h4>เลือกโหมดแต่งภาพ</h4></div>
        <div class="photo-preset-grid" id="photoPro-presets">
          ${Object.entries(presets).map(([key,p])=>`<button type="button" class="chip-btn${key==='auto'?' selected':''}" data-photo-preset="${key}">${p.name}</button>`).join('')}
        </div>
        <div class="form-grid photo-slider-grid">
          ${slider('brightness','ความสว่าง',-40,60,10)}
          ${slider('contrast','Contrast',-30,50,12)}
          ${slider('saturation','สีสด / ความอิ่มสี',-30,50,8)}
          ${slider('warmth','Warmth / อุ่นสี',-30,30,2)}
          ${slider('shadows','เปิดเงามืด',-20,50,10)}
          ${slider('highlights','ลดไฮไลต์',-40,20,-4)}
          ${slider('sharpness','ความคมชัด',0,60,18)}
          <label>ขนาดไฟล์ส่งออก<select id="photoPro-size"><option value="original">คงขนาดใกล้ต้นฉบับ</option><option value="2048" selected>จำกัดด้านยาว 2048px</option><option value="1600">จำกัดด้านยาว 1600px</option><option value="1080">จำกัดด้านยาว 1080px</option></select><small>2048px เหมาะกับ Facebook / Line และยังคมพอใช้งาน</small></label>
          <label>คุณภาพ JPG<select id="photoPro-quality"><option value="0.92" selected>สูง 92%</option><option value="0.86">กลาง 86% ไฟล์เล็ก</option><option value="0.98">สูงมาก 98%</option></select></label>
          <label class="check-card"><input id="photoPro-safe" type="checkbox" checked> Safe Mode: ไม่เปลี่ยนใบหน้า ไม่สร้างวัตถุใหม่</label>
        </div>
      </div>
      <div class="button-row photo-action-row"><button class="btn primary" id="photoPro-process" type="button">✨ ปรับภาพทั้งหมด</button><button class="btn secondary" id="photoPro-download" type="button">ดาวน์โหลด ZIP</button><button class="btn secondary" id="photoPro-clear" type="button">ล้างรูป</button></div>
    `;
  }

  function slider(id,label,min,max,val){
    return `<label class="photo-slider-label"><span>${label}</span><div class="photo-range-row"><input id="photoPro-${id}" data-photo-slider="${id}" type="range" min="${min}" max="${max}" value="${val}"><b id="photoPro-${id}-value">${val}</b></div></label>`;
  }

  function getSettings(){
    const num = id => Number($('#photoPro-'+id)?.value || 0);
    return {
      brightness:num('brightness'), contrast:num('contrast'), saturation:num('saturation'), warmth:num('warmth'), shadows:num('shadows'), highlights:num('highlights'), sharpness:num('sharpness'),
      size: $('#photoPro-size')?.value || '2048', quality: Number($('#photoPro-quality')?.value || 0.92), safe: $('#photoPro-safe')?.checked !== false
    };
  }

  function setPreset(key){
    const p = presets[key] || presets.auto;
    Object.entries(p).forEach(([k,v])=>{
      if(k==='name') return;
      const el = $('#photoPro-'+k); if(el){ el.value = v; const out = $('#photoPro-'+k+'-value'); if(out) out.textContent = v; }
    });
    $$('[data-photo-preset]').forEach(b=>b.classList.toggle('selected', b.dataset.photoPreset===key));
    T.toast?.(`เลือกโหมด ${p.name}`);
  }

  function bindForm(){
    const fileInput = $('#photoPro-files');
    fileInput?.addEventListener('change', ()=>{
      state.files = Array.from(fileInput.files || []).filter(f=>f.type.startsWith('image/'));
      state.outputs = [];
      renderInputPreview();
      renderResult();
    });
    $$('[data-photo-preset]').forEach(btn=>btn.addEventListener('click',()=>setPreset(btn.dataset.photoPreset)));
    $$('[data-photo-slider]').forEach(input=>input.addEventListener('input',()=>{
      const out = $('#photoPro-'+input.dataset.photoSlider+'-value'); if(out) out.textContent = input.value;
    }));
    $('#photoPro-process')?.addEventListener('click', processAll);
    $('#photoPro-download')?.addEventListener('click', downloadZip);
    $('#photoPro-clear')?.addEventListener('click', clearAll);
  }

  function renderInputPreview(){
    const summary = $('#photoPro-fileSummary');
    const preview = $('#photoPro-inputPreview');
    if(summary) summary.textContent = state.files.length ? `เลือกรูปแล้ว ${state.files.length} ภาพ` : 'ยังไม่ได้เลือกรูป';
    if(!preview) return;
    preview.innerHTML = '';
    state.files.slice(0,16).forEach((file,i)=>{
      const url = URL.createObjectURL(file);
      const card = document.createElement('div');
      card.className = 'photo-thumb-card';
      card.innerHTML = `<img src="${url}" alt=""><b>${i+1}</b><span>${escapeHtml(file.name)}</span>`;
      preview.appendChild(card);
      setTimeout(()=>URL.revokeObjectURL(url), 8000);
    });
    if(state.files.length > 16){
      const more=document.createElement('div'); more.className='photo-more-card'; more.textContent = `+${state.files.length-16} ภาพ`; preview.appendChild(more);
    }
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }

  function loadImage(file){
    return new Promise((res,rej)=>{
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = e => { URL.revokeObjectURL(url); rej(e); };
      img.src = url;
    });
  }

  function targetSize(img, maxSide){
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    if(maxSide === 'original') return {w,h};
    const max = Number(maxSide) || 2048;
    const scale = Math.min(1, max / Math.max(w,h));
    return {w:Math.round(w*scale), h:Math.round(h*scale)};
  }

  function clamp(v){ return v<0?0:v>255?255:v; }
  function applyAdjustments(imageData, s){
    const d = imageData.data;
    const b = s.brightness * 2.15;
    const c = (259 * (s.contrast + 255)) / (255 * (259 - s.contrast));
    const sat = 1 + s.saturation/100;
    const warmR = s.warmth * 0.9, warmB = -s.warmth * 0.7;
    const shadow = s.shadows * 1.2;
    const high = s.highlights * 1.1;
    for(let i=0;i<d.length;i+=4){
      let r=d[i], g=d[i+1], bl=d[i+2];
      let lum = 0.2126*r + 0.7152*g + 0.0722*bl;
      const shadowWeight = Math.max(0, (128-lum)/128);
      const highWeight = Math.max(0, (lum-145)/110);
      r += b + shadow*shadowWeight + high*highWeight + warmR;
      g += b + shadow*shadowWeight + high*highWeight + warmR*0.18;
      bl += b + shadow*shadowWeight + high*highWeight + warmB;
      r = c*(r-128)+128; g = c*(g-128)+128; bl = c*(bl-128)+128;
      lum = 0.2126*r + 0.7152*g + 0.0722*bl;
      r = lum + (r-lum)*sat; g = lum + (g-lum)*sat; bl = lum + (bl-lum)*sat;
      d[i]=clamp(r); d[i+1]=clamp(g); d[i+2]=clamp(bl);
    }
    return imageData;
  }

  function sharpen(ctx,w,h,amount){
    if(amount <= 0) return;
    const src = ctx.getImageData(0,0,w,h);
    const out = ctx.createImageData(w,h);
    const s = src.data, d = out.data;
    const a = Math.min(1, amount/60) * 0.72;
    for(let y=0;y<h;y++){
      for(let x=0;x<w;x++){
        const i=(y*w+x)*4;
        for(let ch=0;ch<3;ch++){
          const center=s[i+ch];
          const left=s[(y*w+Math.max(0,x-1))*4+ch];
          const right=s[(y*w+Math.min(w-1,x+1))*4+ch];
          const up=s[(Math.max(0,y-1)*w+x)*4+ch];
          const down=s[(Math.min(h-1,y+1)*w+x)*4+ch];
          const edge = center*5 - left - right - up - down;
          d[i+ch]=clamp(center*(1-a)+edge*a);
        }
        d[i+3]=s[i+3];
      }
    }
    ctx.putImageData(out,0,0);
  }

  async function enhanceFile(file, index, settings){
    const img = await loadImage(file);
    const sz = targetSize(img, settings.size);
    const canvas = document.createElement('canvas');
    canvas.width = sz.w; canvas.height = sz.h;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img,0,0,sz.w,sz.h);
    let data = ctx.getImageData(0,0,sz.w,sz.h);
    data = applyAdjustments(data, settings);
    ctx.putImageData(data,0,0);
    sharpen(ctx,sz.w,sz.h,settings.sharpness);
    const blob = await new Promise(res=>canvas.toBlob(res,'image/jpeg',settings.quality));
    const url = URL.createObjectURL(blob);
    const base = (file.name || `photo_${index+1}`).replace(/\.[^.]+$/,'').replace(/[^a-zA-Z0-9ก-๙_-]+/g,'_').slice(0,80);
    return {blob,url,filename:`enhanced_${String(index+1).padStart(3,'0')}_${base}.jpg`, originalName:file.name, w:sz.w, h:sz.h, size:blob.size};
  }

  async function processAll(){
    if(!state.files.length){ alert('กรุณาเลือกรูปภาพก่อน'); return; }
    const btn = $('#photoPro-process');
    const old = btn ? btn.textContent : '';
    if(btn){ btn.disabled = true; btn.textContent = 'กำลังปรับภาพ...'; }
    state.outputs.forEach(o=>{ try{ URL.revokeObjectURL(o.url); }catch(e){} });
    state.outputs = [];
    renderProcessing(0,state.files.length);
    try{
      const settings = getSettings();
      for(let i=0;i<state.files.length;i++){
        state.outputs.push(await enhanceFile(state.files[i], i, settings));
        renderProcessing(i+1,state.files.length);
        await new Promise(r=>setTimeout(r,0));
      }
      renderResult();
      T.toast?.(`ปรับภาพเสร็จแล้ว ${state.outputs.length} ภาพ`);
      window.TANJAI_AUTH?.trackUsage?.('photoPro');
    }catch(err){
      console.error(err);
      alert('ปรับภาพไม่สำเร็จ กรุณาลองลดจำนวนภาพหรือขนาดไฟล์');
    }finally{
      if(btn){ btn.disabled = false; btn.textContent = old || '✨ ปรับภาพทั้งหมด'; }
    }
  }

  function renderProcessing(done,total){
    const host = $('#photoProResult'); if(!host) return;
    host.innerHTML = `<div class="ready-card photo-ready-card"><div class="ready-head"><div><span>กำลังประมวลผล</span><h3>ปรับภาพ ${done}/${total}</h3><p>ประมวลผลในเครื่อง ไม่ส่งภาพออกไปภายนอก</p></div></div><div class="photo-progress"><i style="width:${total?Math.round(done/total*100):0}%"></i></div></div>`;
  }

  function renderResult(){
    const host = $('#photoProResult'); if(!host) return;
    if(!state.outputs.length){ setResultIdle(); return; }
    const cards = state.outputs.slice(0,18).map((o,i)=>`
      <div class="photo-result-card"><img src="${o.url}" alt=""><b>${i+1}. ${escapeHtml(o.originalName)}</b><span>${o.w}×${o.h} · ${(o.size/1024/1024).toFixed(2)} MB</span><button class="btn secondary" data-photo-download="${i}">ดาวน์โหลด</button></div>`).join('');
    host.innerHTML = `
      <div class="ready-card photo-ready-card">
        <div class="ready-head"><div><span>ผลลัพธ์พร้อมดาวน์โหลด</span><h3>แต่งภาพเสร็จแล้ว ${state.outputs.length} ภาพ</h3><p>ปรับแสง สี เงา ความคมชัด โดยไม่สร้างภาพใหม่</p></div><div class="result-actions"><button class="btn primary" id="photoPro-download-top">ดาวน์โหลด ZIP</button></div></div>
        <div class="photo-result-grid">${cards}</div>
        ${state.outputs.length>18?`<p class="photo-result-more">แสดงตัวอย่าง 18 ภาพแรก จากทั้งหมด ${state.outputs.length} ภาพ</p>`:''}
        <details class="advanced-output"><summary>รายละเอียดการปรับ</summary><div>${summaryText()}</div></details>
      </div>`;
  }

  function summaryText(){
    const s=getSettings();
    return `โหมดนี้ปรับเฉพาะคุณภาพภาพจริง: สว่าง ${s.brightness}, Contrast ${s.contrast}, สี ${s.saturation}, เงา ${s.shadows}, ไฮไลต์ ${s.highlights}, คมชัด ${s.sharpness}. ไม่เปลี่ยนบุคคล ไม่เพิ่มวัตถุ และไม่สร้างภาพใหม่`;
  }

  function downloadOne(i){
    const o = state.outputs[i]; if(!o) return;
    const a=document.createElement('a'); a.href=o.url; a.download=o.filename; a.click();
  }

  const te = new TextEncoder(); let crcTable=null;
  function crc32(buf){ if(!crcTable){ crcTable=Array.from({length:256},(_,n)=>{ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); return c>>>0; }); } let c=0xffffffff; for(const b of buf) c=crcTable[(c^b)&255]^(c>>>8); return (c^0xffffffff)>>>0; }
  function u16(n){ return [n&255,(n>>>8)&255]; } function u32(n){ return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]; }
  function dosDateTime(date=new Date()){ const time=(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2); const day=((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate(); return {time,day}; }
  async function makeZip(files){
    const chunks=[], central=[]; let offset=0; const dt=dosDateTime();
    for(const f of files){
      const data=new Uint8Array(await f.blob.arrayBuffer()); const name=te.encode(f.filename); const crc=crc32(data), size=data.length;
      const local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),...u32(crc),...u32(size),...u32(size),...u16(name.length),...u16(0),...name]);
      chunks.push(local,data); central.push({name,crc,size,offset}); offset += local.length + data.length;
    }
    const cdStart=offset; const cdChunks=[];
    for(const f of central){ const c=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),...u32(f.crc),...u32(f.size),...u32(f.size),...u16(f.name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(f.offset),...f.name]); cdChunks.push(c); offset += c.length; }
    const cdSize=offset-cdStart; const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(cdSize),...u32(cdStart),...u16(0)]);
    return new Blob([...chunks,...cdChunks,end],{type:'application/zip'});
  }

  async function downloadZip(){
    if(!state.outputs.length){ alert('กรุณาปรับภาพก่อนดาวน์โหลด ZIP'); return; }
    const blob = await makeZip(state.outputs);
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`tanjai_photo_pro_${Date.now()}.zip`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }

  function clearAll(){
    state.outputs.forEach(o=>{ try{ URL.revokeObjectURL(o.url); }catch(e){} });
    state.files=[]; state.outputs=[];
    const input=$('#photoPro-files'); if(input) input.value='';
    renderInputPreview(); setResultIdle();
    T.toast?.('ล้างรูปแล้ว');
  }

  document.addEventListener('click', e=>{
    const dl = e.target.closest('[data-photo-download]');
    if(dl){ e.preventDefault(); downloadOne(Number(dl.dataset.photoDownload||0)); }
    if(e.target.closest('#photoPro-download-top')){ e.preventDefault(); downloadZip(); }
  });

  document.addEventListener('DOMContentLoaded', ()=>{
    renderForm(); bindForm(); setPreset('auto'); setResultIdle();
  });
})();

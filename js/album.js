/* v8.6.9 — Cover Frame + Lite Album
   Safe photo processing for real uploaded images only.
   Focuses on Facebook album storytelling: 1 heavy cover + 2–4 lite images.
*/
(function(){
  function ensureAlbumMultiInput(){
    const inp = document.getElementById("album-files");
    if(inp){
      inp.setAttribute("multiple","multiple");
      inp.setAttribute("accept","image/*");
    }
  }

  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const state = { files: [], outputs: [], logo: null, caption: "" };

  function val(id, fallback=""){
    const el = document.getElementById(id);
    return (el && typeof el.value === "string" && el.value.trim()) ? el.value.trim() : fallback;
  }
  function clean(s){ return String(s||"").replace(/\s+/g," ").trim(); }
  function hasRealOrg(org){
    const s = clean(org);
    return !!s && !/ชื่อหน่วยงาน|แบรนด์|องค์กร|ร้านค้า|เพจ/.test(s);
  }
  function stripHashtags(s){ return clean(String(s||"").replace(/#[^\s#]+/g,"").replace(/\s{2,}/g,' ')); }
  function smartShort(s,n=56){
    s = clean(s);
    if(!s) return "";
    if(s.length<=n) return s;
    const cut = s.slice(0,n+1);
    const marks = [" เพื่อ"," โดย"," ณ "," วันที่"," ปี "," ประจำ"," เรื่อง"," ในการ"," และ"," พร้อม"];
    let pos = -1;
    marks.forEach(m => {
      const p = cut.lastIndexOf(m);
      if(p>Math.floor(n*.48)) pos = Math.max(pos,p);
    });
    if(pos>0) return cut.slice(0,pos).trim()+"…";
    const sp = cut.lastIndexOf(" ");
    if(sp>Math.floor(n*.55)) return cut.slice(0,sp).trim()+"…";
    return cut.slice(0,n).trim()+"…";
  }
  function data(){
    return {
      title: val("album-title","ชุดภาพพร้อมโพสต์"),
      org: val("album-orgName",""),
      categoryLabel: val("album-categoryLabel",""),
      dateTime: val("album-dateTime",""),
      place: val("album-place",""),
      detail: val("album-detail",""),
      footer: val("album-footer",""),
      frameStyle: val("album-frameStyle","ทั่วไป / หน่วยงาน / แบรนด์"),
      themePreset: val("album-themePreset","Modern Civic Cover"),
      ratio: val("album-ratio","16:9"),
      colorTone: val("album-colorTone","เขียว–เหลือง–ขาว"),
      mode: val("album-autoMode", val("album-mode","ปรับภาพ + ครอป + ใส่กรอบ")),
      layoutMode: val("album-layoutMode","Cover หนัก + Lite Album 2–4")
    };
  }
  function size(d=data()){
    const r = d.ratio || "";
    if(r.includes("1:1")) return {w:1080,h:1080};
    if(r.includes("9:16")) return {w:1080,h:1920};
    if(r.includes("4:5")) return {w:1080,h:1350};
    return {w:1920,h:1080};
  }
  function hexToRgb(hex){
    hex=String(hex||"").replace("#","");
    if(hex.length===3) hex=hex.split("").map(x=>x+x).join("");
    const n=parseInt(hex,16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function rgba(hex,a){
    const c=hexToRgb(hex); return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  function theme(d=data()){
    const raw=(d.colorTone||"").toLowerCase();
    let t;
    if(raw.includes("ม่วง") || raw.includes("ทอง")) t={a:"#8B5CF6",b:"#FBBF24",dark:"#160B2D",glass:"rgba(14,10,34,.72)"};
    else if(raw.includes("เขียว") || raw.includes("เหลือง")) t={a:"#16A34A",b:"#FACC15",dark:"#062F1A",glass:"rgba(6,31,20,.72)"};
    else if(raw.includes("น้ำเงิน")) t={a:"#2563EB",b:"#93C5FD",dark:"#071A3D",glass:"rgba(5,18,45,.74)"};
    else if(raw.includes("ดำ") || raw.includes("ทอง")) t={a:"#111827",b:"#F59E0B",dark:"#05060A",glass:"rgba(3,6,12,.76)"};
    else t={a:"#22D3EE",b:"#8B5CF6",dark:"#0F172A",glass:"rgba(9,15,30,.72)"};
    t.c="#FFFFFF";
    t.softA=rgba(t.a,.55); t.softB=rgba(t.b,.42); t.line=rgba(t.a,.72); t.glow=rgba(t.a,.34);
    t.border=rgba(t.b,.86); t.borderSoft=rgba(t.b,.36); t.shadow=rgba(0,0,0,.24);
    return t;
  }
  function coverDraw(img, ctx, w, h, enhance=true){
    const sw=img.naturalWidth||img.width, sh=img.naturalHeight||img.height;
    const scale=Math.max(w/sw,h/sh), nw=sw*scale, nh=sh*scale;
    const x=(w-nw)/2, y=(h-nh)/2;
    ctx.save();
    if(enhance) ctx.filter="brightness(1.055) contrast(1.045) saturate(1.07)";
    ctx.drawImage(img,x,y,nw,nh);
    ctx.restore();
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,"rgba(0,0,0,.14)");
    grad.addColorStop(.44,"rgba(0,0,0,.02)");
    grad.addColorStop(.74,"rgba(0,0,0,.14)");
    grad.addColorStop(1,"rgba(0,0,0,.52)");
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  }
  function roundRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function drawGlass(ctx,x,y,w,h,r,th,light=false){
    ctx.save();
    ctx.shadowColor=th.glow; ctx.shadowBlur=Math.max(8,Math.round(w*.02)); ctx.shadowOffsetY=Math.round(w*.005);
    ctx.fillStyle=light ? "rgba(255,255,255,.16)" : th.glass;
    roundRect(ctx,x,y,w,h,r); ctx.fill();
    ctx.shadowBlur=0;
    ctx.lineWidth=Math.max(1,Math.round(w*.0016));
    ctx.strokeStyle=light ? "rgba(255,255,255,.28)" : "rgba(255,255,255,.16)";
    ctx.stroke();
    const g=ctx.createLinearGradient(x,y,x+w,y);
    g.addColorStop(0,th.softA); g.addColorStop(.58,th.softB); g.addColorStop(1,"rgba(255,255,255,.10)");
    ctx.fillStyle=g;
    roundRect(ctx,x+Math.round(w*.018),y+Math.round(h*.06),w-Math.round(w*.036),Math.max(3,Math.round(h*.018)),Math.round(h*.012));
    ctx.fill();
    ctx.restore();
  }
  function segmentText(text){
    text = clean(text); if(!text) return [];
    try{ if(window.Intl && Intl.Segmenter){ const seg = new Intl.Segmenter("th", {granularity:"word"}); return Array.from(seg.segment(text)).map(s=>s.segment).filter(Boolean);} }catch(e){}
    return text.split(/(\s+|[\/|•,.:;()]+)/).filter(Boolean);
  }
  function lineWidth(ctx, arr){ return ctx.measureText(arr.join("").replace(/\s+/g," ")).width; }
  function balancedLines(ctx,text,maxW,maxLines){
    let tokens=segmentText(text);
    const lines=[]; let cur=[];
    const pushCur=()=>{ if(cur.length){ lines.push(cur); cur=[]; } };
    tokens.forEach(tok=>{ const test=cur.concat(tok); if(cur.length && lineWidth(ctx,test)>maxW){ pushCur(); cur=[tok]; } else cur=test; });
    pushCur();
    for(let pass=0; pass<4; pass++){
      for(let i=0;i<Math.min(lines.length-1,maxLines-1);i++){
        const a=lines[i], b=lines[i+1];
        if(a.length>1 && lineWidth(ctx,a)>lineWidth(ctx,b)*1.45){ const moved=a[a.length-1]; const next=[moved].concat(b); if(lineWidth(ctx,next)<=maxW){ b.unshift(a.pop()); } }
      }
    }
    let out=lines.slice(0,maxLines).map(a=>clean(a.join("").replace(/\s+/g," ")));
    if(lines.length>maxLines && out.length){ let last=out[out.length-1]; while(ctx.measureText(last+"…").width>maxW && last.length>1) last=last.slice(0,-1); out[out.length-1]=clean(last)+"…"; }
    return out.filter(Boolean);
  }
  function drawLines(ctx,lines,x,y,lineH){ lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineH)); }
  function loadPreset(d){
    const p = d.themePreset || "Modern Civic Cover";
    if(p.includes("Clean Banner")) return {band:0.18,titleScale:1.0,chip:true,footer:true,minimal:false};
    if(p.includes("Premium Glass")) return {band:0.20,titleScale:1.05,chip:true,footer:true,minimal:false};
    return {band:0.19,titleScale:1.02,chip:true,footer:true,minimal:false};
  }
  function drawLogo(ctx,w,h,x,y,s){
    if(!state.logo) return false;
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.25)"; ctx.shadowBlur=12;
    ctx.fillStyle="rgba(255,255,255,.94)"; ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2); ctx.fill();
    ctx.clip(); ctx.drawImage(state.logo,x,y,s,s); ctx.restore();
    return true;
  }
  function drawFrameCorners(ctx,w,h,th){
    const pad=Math.round(Math.min(w,h)*0.03), r=Math.round(Math.min(w,h)*0.03);
    ctx.save();
    ctx.lineWidth=Math.max(2,Math.round(Math.min(w,h)*0.004));
    ctx.strokeStyle=th.borderSoft; roundRect(ctx,pad,pad,w-pad*2,h-pad*2,r); ctx.stroke();
    ctx.lineWidth=Math.max(1,Math.round(Math.min(w,h)*0.002)); ctx.strokeStyle='rgba(255,255,255,.15)'; roundRect(ctx,pad+5,pad+5,w-pad*2-10,h-pad*2-10,r-2); ctx.stroke();
    ctx.restore();
  }
  function drawCoverFrame(ctx,w,h,d,th){
    const preset=loadPreset(d); const land=w>=h; const pad=Math.round(Math.min(w,h)*0.035);
    drawFrameCorners(ctx,w,h,th);
    const headerH=Math.round(h*(land?preset.band:0.16));
    drawGlass(ctx,pad,pad,w-pad*2,headerH,Math.round(headerH*.2),th,false);

    const logoS=Math.round(headerH*0.58); const logoX=pad+Math.round(headerH*0.18); const logoY=pad+Math.round((headerH-logoS)/2);
    const hasLogo=drawLogo(ctx,w,h,logoX,logoY,logoS);
    const leftX = hasLogo ? logoX+logoS+Math.round(w*.022) : pad+Math.round(w*.03);
    const titleMaxW = w - leftX - pad - Math.round(w*.04);

    ctx.save();
    ctx.textBaseline='top';
    const org = hasRealOrg(d.org) ? smartShort(d.org,40) : '';
    const category = clean(d.categoryLabel);
    const title=smartShort(d.title,82);
    if(org){
      ctx.fillStyle='rgba(255,255,255,.92)';
      ctx.font=`800 ${Math.round(Math.min(w,h)*0.03)}px "Prompt","Noto Sans Thai",sans-serif`;
      const orgLines=balancedLines(ctx,org,titleMaxW,1);
      drawLines(ctx,orgLines,leftX,pad+Math.round(headerH*.14),Math.round(headerH*.18));
    }
    ctx.fillStyle='#fff';
    ctx.font=`900 ${Math.round(Math.min(w,h)*(land?0.055:0.044)*preset.titleScale)}px "Prompt","Kanit","Noto Sans Thai",sans-serif`;
    const titleY = pad + (org ? Math.round(headerH*.42) : Math.round(headerH*.26));
    const titleLines=balancedLines(ctx,title,titleMaxW,land?2:3);
    drawLines(ctx,titleLines,leftX,titleY,Math.round(Math.min(w,h)*(land?0.063:0.05)));
    ctx.restore();

    const chipText = [category, d.dateTime].filter(Boolean).join(' • ') || category || d.dateTime || '';
    if(preset.chip && chipText){
      ctx.save();
      ctx.font=`800 ${Math.round(Math.min(w,h)*0.024)}px "Noto Sans Thai","Sarabun",sans-serif`;
      const chipW=Math.min(w-pad*2, ctx.measureText(smartShort(chipText,48)).width + Math.round(w*.07));
      const chipH=Math.round(h*(land?0.07:0.05));
      const chipY=pad+headerH+Math.round(h*.018);
      drawGlass(ctx,pad,chipY,chipW,chipH,Math.round(chipH/2),th,true);
      ctx.textBaseline='middle'; ctx.fillStyle='#fff';
      ctx.fillText(smartShort(chipText,48), pad+Math.round(w*.022), chipY+chipH/2+1);
      ctx.restore();
    }

    const footerText = stripHashtags(d.footer) || [d.place].filter(Boolean).join('');
    if(preset.footer && footerText){
      const barH=Math.round(h*(land?0.09:0.08));
      const y=h-pad-barH;
      drawGlass(ctx,pad,y,w-pad*2,barH,Math.round(barH*.36),th,false);
      ctx.save();
      ctx.textBaseline='middle';
      ctx.fillStyle='rgba(255,255,255,.96)';
      ctx.font=`800 ${Math.round(Math.min(w,h)*0.024)}px "Prompt","Noto Sans Thai",sans-serif`;
      const line=smartShort(footerText, land?72:50);
      ctx.fillText(line,pad+Math.round(w*.024),y+barH/2+1);
      ctx.restore();
    }
  }
  function liteText(d, idx){
    const safeDetail = stripHashtags(d.detail);
    const safeFooter = stripHashtags(d.footer);
    if(idx===1) return safeDetail ? smartShort(safeDetail, 64) : [d.dateTime,d.place].filter(Boolean).join(' • ');
    if(idx===2) return safeFooter || 'บรรยากาศการดำเนินงาน';
    if(idx===3) return d.place ? `บรรยากาศ ณ ${smartShort(d.place,36)}` : 'ร่วมติดตามและขับเคลื่อนงาน';
    return safeFooter || 'ภาพเพิ่มเติม';
  }
  function drawLiteFrame(ctx,w,h,d,idx,th){
    const pad=Math.round(Math.min(w,h)*0.03);
    const topLabel = clean(d.categoryLabel);
    if(topLabel){
      const topH=Math.round(h*0.06);
      ctx.save();
      ctx.font=`800 ${Math.round(Math.min(w,h)*0.022)}px "Prompt","Noto Sans Thai",sans-serif`;
      const tag=smartShort(topLabel,24);
      const tagW=Math.min(w*.52, ctx.measureText(tag).width + Math.round(w*.05));
      drawGlass(ctx,pad,pad,tagW,topH,Math.round(topH/2),th,true);
      ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(tag,pad+Math.round(w*.02),pad+topH/2+1);
      ctx.restore();
    }
    const cap=liteText(d,idx); if(!cap) return;
    const barH=Math.round(h*(w>=h?0.11:0.09));
    const y=h-pad-barH;
    drawGlass(ctx,pad,y,w-pad*2,barH,Math.round(barH*.34),th,false);
    ctx.save(); ctx.textBaseline='top';
    ctx.fillStyle='#fff';
    ctx.font=`800 ${Math.round(Math.min(w,h)*0.024)}px "Prompt","Noto Sans Thai",sans-serif`;
    const lines=balancedLines(ctx,cap,w-pad*2-Math.round(w*.05),2);
    drawLines(ctx,lines,pad+Math.round(w*.024),y+Math.round(barH*.24),Math.round(Math.min(w,h)*0.031));
    ctx.restore();
  }
  function makeImage(file){
    return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=rej; img.src=URL.createObjectURL(file); });
  }
  function canvasToBlob(canvas){ return new Promise(res=>canvas.toBlob(b=>res(b),"image/jpeg",.92)); }
  async function waitFonts(){ try{ if(document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){} }
  async function processImage(file,idx,total){
    const d=data(), th=theme(d), sz=size(d);
    const canvas=document.createElement('canvas'); canvas.width=sz.w; canvas.height=sz.h;
    const ctx=canvas.getContext('2d');
    const img=await makeImage(file);
    const enhance=!d.mode.includes('ครอป + ใส่กรอบเท่านั้น');
    coverDraw(img,ctx,sz.w,sz.h,enhance);
    if(!d.mode.includes('ปรับภาพเท่านั้น')){
      if(idx===0) drawCoverFrame(ctx,sz.w,sz.h,d,th);
      else drawLiteFrame(ctx,sz.w,sz.h,d,idx,th);
    }
    const blob=await canvasToBlob(canvas); const url=URL.createObjectURL(blob);
    return {blob,url,filename:`facebook_album_${String(idx+1).padStart(2,'0')}.jpg`};
  }
  function normalizeFiles(fileList, warn=true){
    let files=Array.from(fileList||[]).filter(f=>f.type.startsWith('image/'));
    if(files.length>5){ files=files.slice(0,5); if(warn) alert('ระบบนี้รองรับ 4–5 ภาพเท่านั้น จึงเลือกใช้ 5 ภาพแรกให้โดยอัตโนมัติ'); }
    return files;
  }
  function renderUploadPreview(){
    const host=$('#album-preview'); if(!host) return;
    if(!state.files.length){ host.innerHTML = `<p class="album-frame-note">ยังไม่มีรูปที่เลือก — เมนูนี้ออกแบบสำหรับอัปโหลด 4–5 ภาพ</p>`; return; }
    host.innerHTML = `
      <div class="album-order-note">ระบบจะสร้างภาพตามลำดับนี้: รูปที่ 1 = Cover Frame, รูปที่ 2–4 = Lite Album และรูปที่ 5 = ภาพเพิ่มเติม (ถ้ามี)</div>
      ${state.files.map((f,i)=>`
        <div class="album-file-chip" data-i="${i}">
          <span>${i+1}</span>
          <b title="${f.name.replace(/"/g,'&quot;')}">${f.name}</b>
          <small>${i===0?'Cover':i<4?'Lite':'Extra'}</small>
          <div class="album-order-actions">
            <button type="button" class="album-order-btn" data-album-move="up" data-i="${i}" ${i===0?'disabled':''}>↑</button>
            <button type="button" class="album-order-btn" data-album-move="down" data-i="${i}" ${i===state.files.length-1?'disabled':''}>↓</button>
          </div>
        </div>`).join('')}
    `;
  }
  function captionText(d){
    const org = hasRealOrg(d.org) ? d.org : 'ชื่อหน่วยงาน / แบรนด์ของคุณ';
    const title = d.title || 'กิจกรรม / ข่าวประชาสัมพันธ์';
    const parts=[];
    parts.push(`📌 ${title}`);
    parts.push(`${org} ขอประชาสัมพันธ์ข้อมูลให้ประชาชนและผู้ที่เกี่ยวข้องได้รับทราบ`);
    const meta=[d.dateTime && `📅 ${d.dateTime}`, d.place && `📍 ${d.place}`].filter(Boolean); if(meta.length) parts.push(meta.join('\n'));
    if(d.detail) parts.push(smartShort(d.detail,180));
    if(d.footer) parts.push(d.footer);
    const hashBase = hasRealOrg(d.org) ? d.org.replace(/\s+/g,'') : 'ประชาสัมพันธ์';
    parts.push(`#${hashBase} #กิจกรรม #ประชาสัมพันธ์`);
    return parts.filter(Boolean).join('\n\n');
  }
  function renderOutputs(){
    const host=$('#albumResult .ready-main') || $('#albumResult') || $('#albumOutput') || $('#albumPreview'); if(!host) return;
    const caption = state.caption || captionText(data());
    const cards=state.outputs.map((o,i)=>`
      <div class="album-output-card">
        <img src="${o.url}" alt="ภาพที่ ${i+1}">
        <b>${i===0?'รูปปก Cover':i<4?'รูป Lite':'รูปเพิ่มเติม'} ${i+1}</b>
        <div class="album-caption-actions"><button class="btn secondary album-one-download" data-i="${i}">ดาวน์โหลดภาพนี้</button></div>
      </div>`).join('');
    host.innerHTML = `
      <div class="album-pro-panel">
        <div class="album-caption-box">
          <h3>แคปชั่นพร้อมโพสต์</h3>
          <textarea id="albumCaptionText" rows="7">${caption.replace(/</g,'&lt;')}</textarea>
          <div class="album-caption-actions">
            <button class="btn primary" id="albumCopyCaption">คัดลอกแคปชั่น</button>
            <button class="btn secondary" id="albumRefreshPreview">อัปเดตพรีวิว</button>
          </div>
          <p class="album-pro-note">พรีวิวด้านล่างเป็น mockup เพื่อเช็กภาพรวมก่อนโพสต์ Facebook แบบ 4 รูปแรก</p>
        </div>
        <div id="albumFacebookPreview"></div>
        <div class="album-output-grid">${cards}</div>
      </div>`;
    renderFacebookPreview();
  }
  function renderFacebookPreview(){
    const host=$('#albumFacebookPreview'); if(!host) return;
    const imgs=state.outputs.slice(0,4); const total=state.outputs.length;
    const cls=imgs.length<=1?'one':imgs.length===2?'two':imgs.length===3?'three':'four';
    const captionEl=$('#albumCaptionText'); const caption=captionEl?captionEl.value:state.caption;
    const cells=imgs.map((o,i)=>`<div class="fb-preview-cell"><img src="${o.url}" alt="">${(total>4 && i===3)?`<span class="fb-preview-more">+${total-4}</span>`:''}</div>`).join('');
    host.innerHTML=`
      <div class="fb-preview-card">
        <div class="fb-preview-head">
          <div class="fb-preview-avatar">${state.logo?'<img style="width:100%;height:100%;object-fit:cover;border-radius:50%" src="'+state.logo.src+'">':'เพจ'}</div>
          <div><div class="fb-preview-name">ชื่อเพจของคุณ</div><div class="fb-preview-time">เมื่อสักครู่ · 🌐</div></div>
        </div>
        <div class="fb-preview-caption">${String(caption||'').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
        <div class="fb-preview-grid ${cls}">${cells}</div>
        <div class="fb-preview-foot">พรีวิวจำลองหน้าโพสต์ Facebook สำหรับตรวจภาพรวมของ 4 รูปแรก</div>
      </div>`;
  }
  const te=new TextEncoder(); let crcTable=null;
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
  async function downloadAll(){ if(!state.outputs.length) return alert('กรุณาสร้างชุดภาพก่อน'); const blob=await makeZip(state.outputs); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`facebook_album_pack_${Date.now()}.zip`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  function downloadOne(i){ const o=state.outputs[i]; if(!o) return; const a=document.createElement('a'); a.href=o.url; a.download=o.filename; a.click(); }
  async function loadLogo(file){ if(!file){ state.logo=null; return; } const img=new Image(); await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=URL.createObjectURL(file); }); state.logo=img; }
  function moveFile(i,dir){ const j=dir==='up'?i-1:i+1; if(j<0 || j>=state.files.length) return; const copy=state.files.slice(); [copy[i],copy[j]]=[copy[j],copy[i]]; state.files=copy; renderUploadPreview(); }
  async function generate(){
    if(window.TANJAI && TANJAI.proofread && typeof TANJAI.proofread.runActive === 'function') TANJAI.proofread.runActive(false);
    let files=state.files; const input=$('#album-files');
    if((!files || !files.length) && input && input.files) files=normalizeFiles(input.files,false);
    if(files.length < 4) return alert('กรุณาอัปโหลดอย่างน้อย 4 ภาพ');
    if(files.length > 5) files=files.slice(0,5);
    state.files=files;
    state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[];
    const btn=$('#makeAlbum'); const old=btn?btn.textContent:''; if(btn){ btn.disabled=true; btn.textContent='กำลังสร้างชุดภาพ...'; }
    try{
      await waitFonts(); const logoInput=$('#album-logoFile'); if(logoInput && logoInput.files && logoInput.files[0]) await loadLogo(logoInput.files[0]);
      for(let i=0;i<files.length;i++) state.outputs.push(await processImage(files[i],i,files.length));
      state.caption=captionText(data()); renderOutputs();
    } finally { if(btn){ btn.disabled=false; btn.textContent=old || 'สร้างชุดภาพ'; } }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    ensureAlbumMultiInput(); renderUploadPreview();
    document.addEventListener('click',(e)=>{
      const id=e.target && e.target.id;
      if(id==='makeAlbum'){ e.preventDefault(); generate(); }
      if(id==='albumDownloadAll' || id==='albumDownloadAllTop'){ e.preventDefault(); downloadAll(); }
      if(id==='albumClear' || id==='albumClearTop'){ e.preventDefault(); state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[]; state.files=[]; const inp=$('#album-files'); if(inp) inp.value=''; renderUploadPreview(); const host=$('#albumResult .ready-main') || $('#albumResult'); if(host) host.innerHTML=''; }
      if(id==='albumCopyCaption'){ e.preventDefault(); const t=$('#albumCaptionText'); if(t){ navigator.clipboard?.writeText(t.value); e.target.textContent='คัดลอกแล้ว'; setTimeout(()=>e.target.textContent='คัดลอกแคปชั่น',1200); } }
      if(id==='albumRefreshPreview'){ e.preventDefault(); renderFacebookPreview(); }
      if(e.target && e.target.classList.contains('album-one-download')) downloadOne(Number(e.target.dataset.i||0));
      const move=e.target && e.target.dataset && e.target.dataset.albumMove; if(move){ e.preventDefault(); moveFile(Number(e.target.dataset.i||0), move); }
    });
    document.addEventListener('change',(e)=>{
      if(e.target && e.target.id==='album-files'){ state.files=normalizeFiles(e.target.files,true); renderUploadPreview(); }
    });
  });
  window.TANJAI_ALBUM_PRO={generate,downloadAll,renderFacebookPreview,renderUploadPreview};
})();

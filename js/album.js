/* v8.6.2 — Facebook Album Pro & Sales Ready UX
   Safe photo processing: crop/enhance/frame real photos only. No generative image alteration.
*/
(function(){

  // v8.6.2 safety guard: keep album upload as multi-image input
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
  function short(s,n=44){
    s = clean(s);
    if(!s) return "";
    return s.length>n ? s.slice(0, Math.max(0,n-1)).trim()+"…" : s;
  }
  function hasRealOrg(org){
    const s = clean(org);
    return !!s && !/ชื่อหน่วยงาน|แบรนด์|องค์กร|ร้านค้า|เพจ/.test(s);
  }
  function data(){
    return {
      title: val("album-title","ชุดภาพพร้อมโพสต์"),
      org: val("album-orgName",""),
      dateTime: val("album-dateTime",""),
      place: val("album-place",""),
      detail: val("album-detail",""),
      footer: val("album-footer",""),
      frameStyle: val("album-frameStyle","ทั่วไป / หน่วยงาน / แบรนด์"),
      ratio: val("album-ratio","4:5 Facebook / Line"),
      colorTone: val("album-colorTone","ให้ AI เลือกให้เหมาะสม"),
      mode: val("album-mode","ปรับภาพ + ครอป + ใส่กรอบ"),
      layoutMode: val("album-layoutMode","สมดุลภาพและข้อความ")
    };
  }
  function size(d=data()){
    const r = d.ratio || "";
    if(r.includes("1:1")) return {w:1080,h:1080};
    if(r.includes("16:9")) return {w:1600,h:900};
    if(r.includes("9:16")) return {w:1080,h:1920};
    return {w:1080,h:1350};
  }
  function theme(d=data()){
    const raw=(d.colorTone||"").toLowerCase();
    if(raw.includes("ม่วง") || raw.includes("ทอง")) return {a:"#6D28D9",b:"#FBBF24",c:"#FFFFFF",dark:"#25104D",soft:"rgba(109,40,217,.72)"};
    if(raw.includes("เขียว") || raw.includes("เหลือง")) return {a:"#15803D",b:"#FACC15",c:"#FFFFFF",dark:"#063B22",soft:"rgba(21,128,61,.72)"};
    if(raw.includes("น้ำเงิน")) return {a:"#1D4ED8",b:"#FACC15",c:"#FFFFFF",dark:"#0B1B4D",soft:"rgba(29,78,216,.72)"};
    if(raw.includes("ชมพู")) return {a:"#BE185D",b:"#F9A8D4",c:"#FFFFFF",dark:"#4A102B",soft:"rgba(190,24,93,.72)"};
    return {a:"#2563EB",b:"#F59E0B",c:"#FFFFFF",dark:"#0F172A",soft:"rgba(15,23,42,.68)"};
  }
  function tpl(d=data()){
    const raw=d.frameStyle||"";
    if(raw.includes("ประชุม") || raw.includes("รับฟัง") || raw.includes("ประชาคม")) return {label:"ประชุม / รับฟัง", icon:"◉", chips:["รับฟัง","มีส่วนร่วม","สรุปชัด"]};
    if(raw.includes("ลงพื้นที่") || raw.includes("ภารกิจ") || raw.includes("ติดตาม")) return {label:"ภารกิจ / ติดตามงาน", icon:"◆", chips:["ติดตาม","ลงมือทำ","ผลลัพธ์"]};
    if(raw.includes("ข่าวด่วน") || raw.includes("ประกาศ")) return {label:"ประกาศสำคัญ", icon:"!", chips:["แจ้งข่าว","ตรวจสอบ","อัปเดต"]};
    if(raw.includes("โรงเรียน") || raw.includes("ศึกษา")) return {label:"การศึกษา", icon:"✦", chips:["เรียนรู้","กิจกรรม","พัฒนา"]};
    if(raw.includes("สุขภาพ") || raw.includes("รณรงค์")) return {label:"สุขภาพ / รณรงค์", icon:"＋", chips:["ดูแล","ปลอดภัย","ร่วมมือ"]};
    if(raw.includes("ธุรกิจ") || raw.includes("โปรโม")) return {label:"โปรโมชัน", icon:"★", chips:["สินค้า","บริการ","ข้อเสนอ"]};
    if(raw.includes("ครีเอเตอร์") || raw.includes("แบรนด์ส่วนตัว")) return {label:"คอนเทนต์", icon:"●", chips:["อัปเดต","น่าสนใจ","แชร์ได้"]};
    if(raw.includes("มินิมอล")) return {label:"อัปเดต", icon:"—", chips:["เรียบง่าย","อ่านง่าย","สะอาด"]};
    return {label:"ประชาสัมพันธ์", icon:"●", chips:["ชัดเจน","น่าเชื่อถือ","พร้อมใช้"]};
  }
  function coverDraw(img, ctx, w, h, enhance=true){
    const sw=img.naturalWidth||img.width, sh=img.naturalHeight||img.height;
    const scale=Math.max(w/sw,h/sh), nw=sw*scale, nh=sh*scale;
    const x=(w-nw)/2, y=(h-nh)/2;
    ctx.save();
    if(enhance) ctx.filter="brightness(1.05) contrast(1.04) saturate(1.08)";
    ctx.drawImage(img,x,y,nw,nh);
    ctx.restore();
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,"rgba(0,0,0,.10)");
    grad.addColorStop(.56,"rgba(0,0,0,.05)");
    grad.addColorStop(1,"rgba(0,0,0,.42)");
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  }
  function roundRect(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function wrap(ctx,text,x,y,maxW,lineH,maxLines){
    const words=String(text||"").split(/\s+/).filter(Boolean);
    const lines=[]; let line="";
    words.forEach(word=>{
      const t=line?line+" "+word:word;
      if(ctx.measureText(t).width>maxW && line){ lines.push(line); line=word; }
      else line=t;
    });
    if(line) lines.push(line);
    const out=lines.slice(0,maxLines);
    if(lines.length>maxLines && out.length){
      let last=out[out.length-1];
      while(ctx.measureText(last+"…").width>maxW && last.length>1) last=last.slice(0,-1);
      out[out.length-1]=last.trim()+"…";
    }
    out.forEach((l,i)=>ctx.fillText(l,x,y+i*lineH));
    return out.length;
  }
  function drawLogo(ctx,w,h,d,th){
    if(!state.logo) return;
    const pad=Math.round(w*.042), s=Math.round(w*.075);
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.22)"; ctx.shadowBlur=12;
    ctx.fillStyle="rgba(255,255,255,.9)";
    ctx.beginPath(); ctx.arc(w-pad-s/2,pad+s/2,s/2,0,Math.PI*2); ctx.fill();
    ctx.clip();
    ctx.drawImage(state.logo,w-pad-s,pad,s,s);
    ctx.restore();
  }
  function drawRibbon(ctx,w,h,d,th,t){
    const pad=Math.round(w*.04);
    ctx.save();
    ctx.fillStyle="rgba(255,255,255,.92)";
    roundRect(ctx,pad,pad,Math.min(w*.58, ctx.measureText(t.label).width+pad*2.8),Math.round(h*.046),Math.round(h*.023)); ctx.fill();
    ctx.fillStyle=th.dark;
    ctx.font=`800 ${Math.round(w*.018)}px sans-serif`;
    ctx.textBaseline="middle";
    ctx.fillText(`${t.icon} ${t.label}`,pad*1.55,pad+Math.round(h*.023));
    ctx.restore();
  }
  function chipsLine(ctx,w,h,d,th,t,x,y){
    const chips = t.chips.slice(0,3);
    let cx=x;
    ctx.font=`700 ${Math.round(w*.016)}px sans-serif`;
    chips.forEach(ch=>{
      const cw=ctx.measureText(ch).width+Math.round(w*.035);
      ctx.fillStyle="rgba(255,255,255,.18)";
      roundRect(ctx,cx,y,cw,Math.round(h*.035),Math.round(h*.018)); ctx.fill();
      ctx.fillStyle="#fff"; ctx.fillText(ch,cx+Math.round(w*.016),y+Math.round(h*.024));
      cx += cw + Math.round(w*.012);
    });
  }
  function autoCaption(d,idx){
    const date = d.dateTime ? short(d.dateTime,18) : "";
    const title = short(d.title,34);
    const place = d.place ? short(d.place,28) : "";
    if(idx===0) return title;
    if(idx===1) return "สรุปภาพรวมกิจกรรม";
    if(date && place) return `${title} | ${date}`;
    if(date) return `${title} | ${date}`;
    return title;
  }
  function captionText(d){
    const org = hasRealOrg(d.org) ? d.org : "ชื่อหน่วยงาน / แบรนด์ของคุณ";
    const title = d.title || "กิจกรรม / ข่าวประชาสัมพันธ์";
    const parts = [];
    parts.push(`📌 ${title}`);
    let line = `${org} ขอประชาสัมพันธ์ข้อมูลกิจกรรมให้ทุกท่านได้รับทราบ`;
    parts.push(line);
    const meta = [d.dateTime && `📅 ${d.dateTime}`, d.place && `📍 ${d.place}`].filter(Boolean);
    if(meta.length) parts.push(meta.join("\n"));
    if(d.detail) parts.push(short(d.detail,170));
    parts.push(d.footer ? d.footer : "ติดตามข่าวสารและกิจกรรมเพิ่มเติมได้ที่ช่องทางของเรา");
    const hashBase = hasRealOrg(d.org) ? d.org.replace(/\s+/g,"") : "ประชาสัมพันธ์";
    parts.push(`#${hashBase} #กิจกรรม #ประชาสัมพันธ์`);
    return parts.filter(Boolean).join("\n\n");
  }
  function drawCover(ctx,w,h,d,th,t){
    const minimal = (d.layoutMode||"").includes("เน้นภาพ");
    drawRibbon(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const pad=Math.round(w*.045);
    const boxH = minimal ? Math.round(h*.14) : Math.round(h*.22);
    const boxY = h - boxH - pad;
    ctx.save();
    ctx.fillStyle=minimal ? "rgba(15,23,42,.62)" : "rgba(15,23,42,.72)";
    roundRect(ctx,pad,boxY,w-pad*2,boxH,Math.round(w*.03)); ctx.fill();
    ctx.fillStyle="#fff";
    ctx.font=`900 ${Math.round(w*(minimal?.034:.044))}px sans-serif`;
    ctx.textBaseline="top";
    wrap(ctx,short(d.title,60),pad*1.55,boxY+Math.round(boxH*.22),w-pad*3.1,Math.round(w*.05),minimal?1:2);
    if(!minimal){
      ctx.font=`700 ${Math.round(w*.021)}px sans-serif`;
      ctx.fillStyle="rgba(255,255,255,.9)";
      const meta=[d.dateTime,d.place].filter(Boolean).join("  •  ");
      wrap(ctx,short(meta,82),pad*1.55,boxY+Math.round(boxH*.70),w-pad*3.1,Math.round(w*.03),1);
    }
    ctx.restore();
  }
  function drawSummary(ctx,w,h,d,th,t){
    drawRibbon(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const pad=Math.round(w*.045), boxH=Math.round(h*.28), boxY=h-boxH-pad;
    ctx.save();
    ctx.fillStyle="rgba(255,255,255,.90)";
    roundRect(ctx,pad,boxY,w-pad*2,boxH,Math.round(w*.03)); ctx.fill();
    ctx.fillStyle=th.dark;
    ctx.font=`900 ${Math.round(w*.035)}px sans-serif`;
    ctx.fillText("สรุปข้อมูลสำคัญ",pad*1.55,boxY+Math.round(boxH*.18));
    ctx.font=`700 ${Math.round(w*.024)}px sans-serif`;
    const bullets=[
      d.dateTime ? `วันที่: ${short(d.dateTime,38)}` : "",
      d.place ? `สถานที่: ${short(d.place,42)}` : "",
      d.detail ? `ประเด็น: ${short(d.detail,58)}` : short(d.title,58)
    ].filter(Boolean).slice(0,3);
    bullets.forEach((b,i)=>ctx.fillText("• "+b,pad*1.65,boxY+Math.round(boxH*(.42+i*.18))));
    ctx.restore();
  }
  function drawLower(ctx,w,h,d,idx,th,t){
    drawRibbon(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const cap=autoCaption(d,idx);
    if(!cap && !d.dateTime) return;
    const pad=Math.round(w*.045), barH=Math.round(h*.075), y=h-barH-pad;
    ctx.save();
    ctx.fillStyle="rgba(15,23,42,.66)";
    roundRect(ctx,pad,y,w-pad*2,barH,Math.round(w*.025)); ctx.fill();
    ctx.fillStyle="#fff";
    ctx.font=`800 ${Math.round(w*.022)}px sans-serif`;
    ctx.textBaseline="middle";
    wrap(ctx,cap,pad*1.45,y+barH*.53,w-pad*2.9,Math.round(w*.03),1);
    ctx.restore();
  }
  function makeImage(file){
    return new Promise((res,rej)=>{
      const img=new Image();
      img.onload=()=>res(img);
      img.onerror=rej;
      img.src=URL.createObjectURL(file);
    });
  }
  function canvasToBlob(canvas){
    return new Promise(res=>canvas.toBlob(b=>res(b),"image/jpeg",.92));
  }
  async function processImage(file,idx,total){
    const d=data(), th=theme(d), t=tpl(d), sz=size(d);
    const canvas=document.createElement("canvas"); canvas.width=sz.w; canvas.height=sz.h;
    const ctx=canvas.getContext("2d");
    const img=await makeImage(file);
    const enhance=!d.mode.includes("ครอป + ใส่กรอบเท่านั้น");
    coverDraw(img,ctx,sz.w,sz.h,enhance);
    if(!d.mode.includes("ปรับภาพเท่านั้น")){
      if(idx===0) drawCover(ctx,sz.w,sz.h,d,th,t);
      else if(idx===1 && !(d.layoutMode||"").includes("เน้นภาพ")) drawSummary(ctx,sz.w,sz.h,d,th,t);
      else drawLower(ctx,sz.w,sz.h,d,idx,th,t);
    }
    const blob=await canvasToBlob(canvas);
    const url=URL.createObjectURL(blob);
    return {blob,url,filename:`facebook_album_${String(idx+1).padStart(2,"0")}.jpg`};
  }
  function renderOutputs(){
    const host=$("#albumResult .ready-main") || $("#albumResult") || $("#albumOutput") || $("#albumPreview");
    if(!host) return;
    const caption = state.caption || captionText(data());
    const cards=state.outputs.map((o,i)=>`
      <div class="album-output-card">
        <img src="${o.url}" alt="ภาพที่ ${i+1}">
        <div class="album-caption-actions">
          <button class="btn secondary album-one-download" data-i="${i}">ดาวน์โหลดภาพนี้</button>
        </div>
      </div>`).join("");
    host.innerHTML = `
      <div class="album-pro-panel">
        <div class="album-caption-box">
          <h3>แคปชั่นพร้อมโพสต์</h3>
          <textarea id="albumCaptionText" rows="7">${caption.replace(/</g,"&lt;")}</textarea>
          <div class="album-caption-actions">
            <button class="btn primary" id="albumCopyCaption">คัดลอกแคปชั่น</button>
            <button class="btn secondary" id="albumRefreshPreview">อัปเดตพรีวิว</button>
          </div>
          <p class="album-pro-note">พรีวิวด้านล่างเป็น mockup เพื่อเช็กภาพรวมก่อนโพสต์ ไม่ได้เชื่อมต่อ Facebook จริง</p>
        </div>
        <div id="albumFacebookPreview"></div>
        <div class="album-output-grid">${cards}</div>
      </div>`;
    renderFacebookPreview();
  }
  function renderFacebookPreview(){
    const host=$("#albumFacebookPreview"); if(!host) return;
    const imgs=state.outputs.slice(0,4);
    const total=state.outputs.length;
    const cls=imgs.length<=1?"one":imgs.length===2?"two":imgs.length===3?"three":"four";
    const captionEl=$("#albumCaptionText");
    const caption=captionEl?captionEl.value:state.caption;
    const cells=imgs.map((o,i)=>`<div class="fb-preview-cell"><img src="${o.url}" alt=""><span>${(total>4 && i===3)?`<span class="fb-preview-more">+${total-4}</span>`:""}</span></div>`).join("");
    host.innerHTML=`
      <div class="fb-preview-card">
        <div class="fb-preview-head">
          <div class="fb-preview-avatar">${state.logo?'<img style="width:100%;height:100%;object-fit:cover;border-radius:50%" src="'+state.logo.src+'">':'เพจ'}</div>
          <div><div class="fb-preview-name">ชื่อเพจของคุณ</div><div class="fb-preview-time">เมื่อสักครู่ · 🌐</div></div>
        </div>
        <div class="fb-preview-caption">${String(caption||"").replace(/</g,"&lt;").replace(/\n/g,"<br>")}</div>
        <div class="fb-preview-grid ${cls}">${cells}</div>
        <div class="fb-preview-foot">พรีวิวจำลองหน้าโพสต์ Facebook สำหรับตรวจความอ่านง่ายก่อนดาวน์โหลด</div>
      </div>`;
  }

  // ZIP helpers
  const te=new TextEncoder();
  let crcTable=null;
  function crc32(buf){
    if(!crcTable){
      crcTable=Array.from({length:256},(_,n)=>{
        let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);
        return c>>>0;
      });
    }
    let c=0xffffffff;
    for(const b of buf) c=crcTable[(c^b)&255]^(c>>>8);
    return (c^0xffffffff)>>>0;
  }
  function u16(n){ return [n&255,(n>>>8)&255]; }
  function u32(n){ return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]; }
  function dosDateTime(date=new Date()){
    const time=(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2);
    const day=((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate();
    return {time,day};
  }
  async function makeZip(files){
    const chunks=[], central=[]; let offset=0; const dt=dosDateTime();
    for(const f of files){
      const data=new Uint8Array(await f.blob.arrayBuffer());
      const name=te.encode(f.filename);
      const crc=crc32(data), size=data.length;
      const local=new Uint8Array([
        ...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),
        ...u32(crc),...u32(size),...u32(size),...u16(name.length),...u16(0),...name
      ]);
      chunks.push(local,data);
      central.push({name,crc,size,offset});
      offset += local.length + data.length;
    }
    const cdStart=offset; const cdChunks=[];
    for(const f of central){
      const c=new Uint8Array([
        ...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),
        ...u32(f.crc),...u32(f.size),...u32(f.size),...u16(f.name.length),...u16(0),...u16(0),...u16(0),...u16(0),
        ...u32(0),...u32(f.offset),...f.name
      ]);
      cdChunks.push(c); offset += c.length;
    }
    const cdSize=offset-cdStart;
    const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(cdSize),...u32(cdStart),...u16(0)]);
    return new Blob([...chunks,...cdChunks,end],{type:"application/zip"});
  }
  async function downloadAll(){
    if(!state.outputs.length) return alert("กรุณาสร้างชุดภาพก่อน");
    const blob=await makeZip(state.outputs);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`facebook_album_pack_${Date.now()}.zip`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function downloadOne(i){
    const o=state.outputs[i]; if(!o) return;
    const a=document.createElement("a"); a.href=o.url; a.download=o.filename; a.click();
  }

  async function loadLogo(file){
    if(!file){ state.logo=null; return; }
    const img=new Image();
    await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=URL.createObjectURL(file); });
    state.logo=img;
  }

  async function generate(){
    const input=$("#album-files");
    const files=input && input.files ? Array.from(input.files).filter(f=>f.type.startsWith("image/")) : state.files;
    if(!files.length){ alert("กรุณาเลือกรูปภาพก่อน"); return; }
    state.files=files;
    state.outputs.forEach(o=>URL.revokeObjectURL(o.url));
    state.outputs=[];
    const btn=$("#makeAlbum"); const old=btn?btn.textContent:"";
    if(btn){ btn.disabled=true; btn.textContent="กำลังสร้างชุดภาพ..."; }
    try{
      const logoInput=$("#album-logoFile");
      if(logoInput && logoInput.files && logoInput.files[0]) await loadLogo(logoInput.files[0]);
      for(let i=0;i<files.length;i++) state.outputs.push(await processImage(files[i],i,files.length));
      state.caption=captionText(data());
      renderOutputs();
    }finally{
      if(btn){ btn.disabled=false; btn.textContent=old || "สร้างชุดภาพ"; }
    }
  }

  document.addEventListener("DOMContentLoaded",()=>{
    ensureAlbumMultiInput();
    document.addEventListener("click",(e)=>{
      const id=e.target && e.target.id;
      if(id==="makeAlbum"){ e.preventDefault(); generate(); }
      if(id==="albumDownloadAll" || id==="albumDownloadAllTop"){ e.preventDefault(); downloadAll(); }
      if(id==="albumClear" || id==="albumClearTop"){
        e.preventDefault();
        state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[]; state.files=[];
        const inp=$("#album-files"); if(inp) inp.value="";
        const host=$("#albumResult .ready-main") || $("#albumResult"); if(host) host.innerHTML="";
      }
      if(id==="albumCopyCaption"){
        e.preventDefault();
        const t=$("#albumCaptionText");
        if(t){ navigator.clipboard?.writeText(t.value); e.target.textContent="คัดลอกแล้ว"; setTimeout(()=>e.target.textContent="คัดลอกแคปชั่น",1200); }
      }
      if(id==="albumRefreshPreview"){ e.preventDefault(); renderFacebookPreview(); }
      if(e.target && e.target.classList.contains("album-one-download")) downloadOne(Number(e.target.dataset.i||0));
    });
    document.addEventListener("change",(e)=>{
      if(e.target && e.target.id==="album-files"){
        state.files=Array.from(e.target.files||[]).filter(f=>f.type.startsWith("image/"));
      }
    });
  });
  window.TANJAI_ALBUM_PRO={generate,downloadAll,renderFacebookPreview};
})();
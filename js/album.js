
(function(){
  window.TANJAI = window.TANJAI || {};
  const $ = s => document.querySelector(s);
  TANJAI.albumState = { files: [], outputs: [] };

  const size = () => {
    const r = $("#album-ratio")?.value || "4:5";
    if(r === "1:1") return {w:1080,h:1080};
    if(r === "16:9") return {w:1920,h:1080};
    if(r === "9:16") return {w:1080,h:1920};
    return {w:1080,h:1350};
  };

  const theme = () => {
    const t = $("#album-colorTone")?.value || "";
    if(t.includes("เขียว")) return {a:"#0f5a34", b:"#f1d15a", c:"#ffffff", dark:"rgba(8,54,33,.88)", glow:"rgba(241,209,90,.28)"};
    if(t.includes("น้ำเงิน")) return {a:"#102f66", b:"#8ecbff", c:"#ffffff", dark:"rgba(8,28,58,.88)", glow:"rgba(142,203,255,.26)"};
    if(t.includes("ดำ")) return {a:"#111111", b:"#d7b35b", c:"#ffffff", dark:"rgba(0,0,0,.82)", glow:"rgba(215,179,91,.26)"};
    return {a:"#4b1979", b:"#f0c45c", c:"#ffffff", dark:"rgba(48,20,78,.88)", glow:"rgba(240,196,92,.28)"};
  };

  const val = (id,f="") => ($("#album-"+id)?.value || f || "").trim();

  const template = () => {
    const raw = $("#album-frameStyle")?.value || "หน่วยงานท้องถิ่น / ราชการ";
    const common = {label:"ประชาสัมพันธ์", icon:"●", chips:["ใกล้ชิด","โปร่งใส","บริการด้วยใจ"], mood:"official"};
    if(raw.includes("ประชุม") || raw.includes("ประชาคม")) return {label:"ประชุม / ประชาคม", icon:"◉", chips:["รับฟัง","มีส่วนร่วม","พัฒนา"], mood:"meeting"};
    if(raw.includes("ลงพื้นที่") || raw.includes("ผู้บริหาร")) return {label:"ลงพื้นที่ติดตามงาน", icon:"◆", chips:["ติดตาม","รับฟัง","แก้ปัญหา"], mood:"field"};
    if(raw.includes("ข่าวด่วน") || raw.includes("ประกาศ")) return {label:"แจ้งข่าวสำคัญ", icon:"!", chips:["เร่งด่วน","ชัดเจน","ตรวจสอบได้"], mood:"urgent"};
    if(raw.includes("กิจกรรม") || raw.includes("อบรม") || raw.includes("อีเวนต์")) return {label:"กิจกรรม / อีเวนต์", icon:"✦", chips:["สร้างสรรค์","มีส่วนร่วม","บรรยากาศดี"], mood:"event"};
    if(raw.includes("โรงเรียน") || raw.includes("ศึกษา")) return {label:"การศึกษา", icon:"✎", chips:["เรียนรู้","สร้างสรรค์","พัฒนาเด็ก"], mood:"education"};
    if(raw.includes("สุขภาพ") || raw.includes("รณรงค์")) return {label:"รณรงค์ / สุขภาพ", icon:"♥", chips:["ห่วงใย","ปลอดภัย","ชุมชนเข้มแข็ง"], mood:"health"};
    if(raw.includes("ธุรกิจ") || raw.includes("สินค้า")) return {label:"โปรโมชัน / ธุรกิจ", icon:"★", chips:["โดดเด่น","น่าเชื่อถือ","พร้อมขาย"], mood:"business"};
    if(raw.includes("เพจ") || raw.includes("ครีเอเตอร์")) return {label:"คอนเทนต์ / แบรนด์", icon:"✦", chips:["จำง่าย","ทันสมัย","มีสไตล์"], mood:"creator"};
    if(raw.includes("มินิมอล")) return {label:"ภาพเล่าเรื่อง", icon:"—", chips:["เรียบง่าย","สะอาด","อ่านง่าย"], mood:"minimal"};
    return common;
  };

  const loadImage = file => new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=URL.createObjectURL(file); });

  const wrap = (ctx,text,x,y,maxWidth,lineHeight,maxLines=4) => {
    const input = String(text||"").replace(/\s+/g," ").trim();
    if(!input) return y;
    // Thai-friendly greedy wrapping by character group
    const tokens = input.includes(" ") ? input.split(" ") : input.match(/.{1,6}/g) || [];
    let line="", lines=[];
    tokens.forEach(w=>{
      const test=line ? line+" "+w : w;
      if(ctx.measureText(test).width > maxWidth && line){ lines.push(line); line=w; }
      else line=test;
    });
    if(line) lines.push(line);
    lines = lines.slice(0,maxLines);
    lines.forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
    return y + lines.length*lineHeight;
  };

  const shortText = (txt, max=72) => {
    const s = String(txt||"").replace(/\s+/g," ").trim();
    return s.length > max ? s.slice(0,max-1)+"…" : s;
  };

  const autoCaption = (d, idx) => {
    if(idx === 0) return d.title || "ชุดภาพประชาสัมพันธ์";
    if(idx === 1) return [d.dateTime, d.place].filter(Boolean).join(" | ") || shortText(d.detail, 60) || d.title;
    return shortText(d.detail || d.title, 62);
  };

  const data = () => ({
    title: val("title","ชุดภาพประชาสัมพันธ์"),
    org: val("orgName","ชื่อหน่วยงาน / แบรนด์"),
    dateTime: val("dateTime"),
    place: val("place"),
    detail: val("detail"),
    footer: val("footer","พร้อมสื่อสารอย่างมืออาชีพ")
  });

  const initials = (name) => {
    const s = String(name||"").trim();
    if(!s) return "AI";
    const en = s.match(/[A-Za-z]/g);
    if(en && en.length) return en.slice(0,2).join("").toUpperCase();
    return s.replace(/\s+/g,"").slice(0,2);
  };

  const drawBrandBadge = (ctx,w,h,d,th,tpl) => {
    const pad = Math.round(w*.045);
    ctx.save();
    ctx.shadowColor = th.glow; ctx.shadowBlur = 18;
    ctx.fillStyle = th.b;
    ctx.beginPath(); ctx.arc(w-pad*1.35,pad*1.35,Math.round(w*.046),0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = th.a;
    ctx.font = `900 ${Math.round(w*.027)}px sans-serif`;
    ctx.textAlign="center";
    ctx.fillText(initials(d.org), w-pad*1.35, pad*1.45);
    ctx.textAlign="left";
    ctx.restore();
  };

  const drawTopRibbon = (ctx,w,h,d,th,tpl) => {
    const pad = Math.round(w*.045);
    const rh = Math.round(h*.072);
    ctx.fillStyle = th.dark;
    ctx.roundRect(pad, pad*.75, w-pad*3.4, rh, Math.round(rh*.34));
    ctx.fill();
    ctx.fillStyle = th.b;
    ctx.font = `900 ${Math.round(w*.028)}px sans-serif`;
    ctx.fillText(tpl.icon+"  "+tpl.label, pad*1.35, pad*.75 + Math.round(rh*.60));
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(w*.023)}px sans-serif`;
    wrap(ctx,d.org,pad*1.35+Math.round(w*.25), pad*.75 + Math.round(rh*.60), w-pad*5.2, Math.round(w*.031), 1);
    drawBrandBadge(ctx,w,h,d,th,tpl);
  };

  const cover = (ctx,w,h,d,th,tpl) => {
    const pad=Math.round(w*.055);
    const grad=ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,"rgba(0,0,0,.02)");
    grad.addColorStop(.48,"rgba(0,0,0,.08)");
    grad.addColorStop(1,"rgba(0,0,0,.72)");
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
    drawTopRibbon(ctx,w,h,d,th,tpl);

    // Accent side stripes for more "frame" feel
    ctx.fillStyle = th.b; ctx.globalAlpha=.92;
    ctx.fillRect(0,0,Math.max(10,Math.round(w*.012)),h);
    ctx.globalAlpha=1;

    const boxY = Math.round(h*.56), boxH = Math.round(h*.34);
    ctx.fillStyle=th.dark; ctx.roundRect(pad,boxY,w-pad*2,boxH,34); ctx.fill();
    ctx.strokeStyle=th.b; ctx.lineWidth=Math.max(3,Math.round(w*.004)); ctx.stroke();

    ctx.fillStyle=th.b; ctx.font=`900 ${Math.round(w*.036)}px sans-serif`;
    ctx.fillText(d.org || "ชื่อหน่วยงาน / แบรนด์", pad*1.35, boxY + Math.round(boxH*.18));

    ctx.fillStyle="#fff"; ctx.font=`900 ${Math.round(w*.058)}px sans-serif`;
    wrap(ctx,d.title || "ชุดภาพประชาสัมพันธ์", pad*1.35, boxY + Math.round(boxH*.38), w-pad*2.7, Math.round(w*.068), 3);

    ctx.font=`700 ${Math.round(w*.028)}px sans-serif`;
    ctx.fillStyle="rgba(255,255,255,.90)";
    wrap(ctx,[d.dateTime,d.place].filter(Boolean).join("  |  ") || autoCaption(d,0), pad*1.35, boxY + Math.round(boxH*.82), w-pad*2.7, Math.round(w*.038), 2);
  };

  const summary = (ctx,w,h,d,th,tpl) => {
    const pad=Math.round(w*.055);
    ctx.fillStyle="rgba(0,0,0,.35)"; ctx.fillRect(0,0,w,h);
    drawTopRibbon(ctx,w,h,d,th,tpl);

    const boxY = Math.round(h*.50), boxH = Math.round(h*.405);
    ctx.fillStyle=th.dark; ctx.roundRect(pad,boxY,w-pad*2,boxH,30); ctx.fill();
    ctx.strokeStyle=th.b; ctx.lineWidth=Math.max(3,Math.round(w*.004)); ctx.stroke();

    ctx.fillStyle=th.b; ctx.font=`900 ${Math.round(w*.045)}px sans-serif`;
    ctx.fillText("สรุปข้อมูลสำคัญ",pad*1.35,boxY+Math.round(boxH*.15));
    ctx.fillStyle="#fff"; ctx.font=`800 ${Math.round(w*.031)}px sans-serif`;
    let y=boxY+Math.round(boxH*.31);
    [
      d.dateTime ? "วันที่: "+d.dateTime : "",
      d.place ? "สถานที่: "+d.place : "",
      d.detail ? "เรื่อง: "+shortText(d.detail,120) : ""
    ].filter(Boolean).forEach(line=>{
      y = wrap(ctx,line,pad*1.35,y,w-pad*2.7,Math.round(w*.043),2) + Math.round(w*.012);
    });

    ctx.fillStyle=th.b; ctx.font=`800 ${Math.round(w*.026)}px sans-serif`;
    wrap(ctx,d.footer || tpl.chips.join(" • "), pad*1.35, boxY+Math.round(boxH*.90), w-pad*2.7, Math.round(w*.033), 1);
  };

  const lower = (ctx,w,h,d,idx,total,th,tpl) => {
    drawTopRibbon(ctx,w,h,d,th,tpl);
    const pad=Math.round(w*.045), barH=Math.round(h*.145), y=h-barH-pad;
    ctx.fillStyle=th.dark; ctx.roundRect(pad,y,w-pad*2,barH,24); ctx.fill();
    ctx.strokeStyle=th.b; ctx.lineWidth=Math.max(2,Math.round(w*.003)); ctx.stroke();

    ctx.fillStyle=th.b; ctx.font=`900 ${Math.round(w*.026)}px sans-serif`;
    ctx.fillText(tpl.label, pad*1.35, y+Math.round(barH*.28));
    ctx.fillStyle="#fff"; ctx.font=`850 ${Math.round(w*.032)}px sans-serif`;
    wrap(ctx,autoCaption(d,idx), pad*1.35, y+Math.round(barH*.58), w-pad*4.2, Math.round(w*.04), 1);
    ctx.fillStyle="rgba(255,255,255,.78)"; ctx.font=`650 ${Math.round(w*.021)}px sans-serif`;
    ctx.fillText([d.dateTime,d.place].filter(Boolean).join(" | "), pad*1.35, y+Math.round(barH*.86));

    ctx.fillStyle=th.b; ctx.roundRect(w-pad*3,y+Math.round(barH*.25),pad*1.85,Math.round(barH*.48),16); ctx.fill();
    ctx.fillStyle=th.a; ctx.font=`900 ${Math.round(w*.026)}px sans-serif`; ctx.textAlign="center";
    ctx.fillText(`${idx+1}/${total}`,w-pad*2.08,y+Math.round(barH*.56)); ctx.textAlign="left";
  };

  const processImage = async (file,idx,total) => {
    const img=await loadImage(file), {w,h}=size(), th=theme(), tpl=template(), d=data();
    const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d");
    if(!ctx.roundRect){
      ctx.roundRect = function(x,y,w,h,r){ this.beginPath(); this.moveTo(x+r,y); this.lineTo(x+w-r,y); this.quadraticCurveTo(x+w,y,x+w,y+r); this.lineTo(x+w,y+h-r); this.quadraticCurveTo(x+w,y+h,x+w-r,y+h); this.lineTo(x+r,y+h); this.quadraticCurveTo(x,y+h,x,y+h-r); this.lineTo(x,y+r); this.quadraticCurveTo(x,y,x+r,y); this.closePath(); return this; };
    }
    const mode=$("#album-autoMode")?.value||"ปรับภาพ + ครอป + ใส่กรอบ";
    if(mode.includes("ปรับภาพ")) ctx.filter="brightness(1.08) contrast(1.08) saturate(1.07)";
    const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight), sw=w/scale, sh=h/scale, sx=(img.naturalWidth-sw)/2, sy=(img.naturalHeight-sh)/2;
    ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
    ctx.filter="none";

    if(mode!=="ปรับภาพเท่านั้น"){
      if($("#album-makeCover")?.checked!==false && idx===0) cover(ctx,w,h,d,th,tpl);
      else if($("#album-makeCover")?.checked!==false && idx===1) summary(ctx,w,h,d,th,tpl);
      else lower(ctx,w,h,d,idx,total,th,tpl);
    }
    const blob=await new Promise(res=>canvas.toBlob(res,"image/jpeg",.92));
    return {blob,url:URL.createObjectURL(blob),name:`facebook_album_${String(idx+1).padStart(2,"0")}.jpg`};
  };

  TANJAI.renderAlbumPreview = function(){
    const el=$("#album-preview"); if(!el) return;
    const files=TANJAI.albumState.files||[];
    el.innerHTML=files.map((f,i)=>`<div class="album-file-chip"><span>${i+1}</span><b>${f.name}</b><small>${Math.round(f.size/1024)} KB</small></div>`).join("") || `<div class="mini-note">ยังไม่มีภาพแนบ</div>`;
  };

  TANJAI.albumDownload = function(i){
    const item=TANJAI.albumState.outputs?.[i]; if(!item) return;
    const a=document.createElement("a"); a.href=item.url; a.download=item.name; a.click();
  };

  // ZIP writer in browser, no external library required.
  TANJAI.albumZipCrcTable = TANJAI.albumZipCrcTable || (() => {
    const table = new Uint32Array(256);
    for(let n=0; n<256; n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1); table[n]=c>>>0; }
    return table;
  })();
  TANJAI.albumCrc32 = function(bytes){ let crc=0xffffffff, table=TANJAI.albumZipCrcTable; for(let i=0;i<bytes.length;i++) crc=table[(crc^bytes[i])&255]^(crc>>>8); return (crc^0xffffffff)>>>0; };
  TANJAI.albumU16 = n => [n&255,(n>>>8)&255];
  TANJAI.albumU32 = n => [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  TANJAI.albumDosTimeDate = function(date=new Date()){
    return {time:((date.getHours()&31)<<11)|((date.getMinutes()&63)<<5)|((Math.floor(date.getSeconds()/2))&31), date:(((date.getFullYear()-1980)&127)<<9)|(((date.getMonth()+1)&15)<<5)|(date.getDate()&31)};
  };
  TANJAI.albumMakeZip = async function(files){
    const enc=new TextEncoder(), chunks=[], central=[], dt=TANJAI.albumDosTimeDate(); let offset=0;
    for(const file of files){
      const nameBytes=enc.encode(file.name), data=new Uint8Array(await file.blob.arrayBuffer()), crc=TANJAI.albumCrc32(data), size=data.length;
      const local=new Uint8Array([0x50,0x4b,0x03,0x04,...TANJAI.albumU16(20),...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU16(dt.time),...TANJAI.albumU16(dt.date),...TANJAI.albumU32(crc),...TANJAI.albumU32(size),...TANJAI.albumU32(size),...TANJAI.albumU16(nameBytes.length),...TANJAI.albumU16(0)]);
      chunks.push(local,nameBytes,data);
      const cent=new Uint8Array([0x50,0x4b,0x01,0x02,...TANJAI.albumU16(20),...TANJAI.albumU16(20),...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU16(dt.time),...TANJAI.albumU16(dt.date),...TANJAI.albumU32(crc),...TANJAI.albumU32(size),...TANJAI.albumU32(size),...TANJAI.albumU16(nameBytes.length),...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU32(0),...TANJAI.albumU32(offset)]);
      central.push(cent,nameBytes); offset+=local.length+nameBytes.length+data.length;
    }
    const centralSize=central.reduce((s,p)=>s+p.length,0), centralOffset=offset;
    const end=new Uint8Array([0x50,0x4b,0x05,0x06,...TANJAI.albumU16(0),...TANJAI.albumU16(0),...TANJAI.albumU16(files.length),...TANJAI.albumU16(files.length),...TANJAI.albumU32(centralSize),...TANJAI.albumU32(centralOffset),...TANJAI.albumU16(0)]);
    return new Blob([...chunks,...central,end],{type:"application/zip"});
  };
  TANJAI.albumDownloadAll = async function(){
    const outputs=TANJAI.albumState.outputs||[];
    if(!outputs.length){TANJAI.toast("ยังไม่มีภาพที่สร้างแล้ว"); return;}
    TANJAI.toast("กำลังรวมภาพเป็น ZIP...");
    const zipBlob=await TANJAI.albumMakeZip(outputs), a=document.createElement("a");
    a.href=URL.createObjectURL(zipBlob); a.download=`facebook_album_pack_${new Date().toISOString().slice(0,10)}.zip`; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2500); TANJAI.toast("ดาวน์โหลด ZIP แล้ว");
  };

  document.addEventListener("DOMContentLoaded",()=>{
    $("#album-files")?.addEventListener("change",()=>{ TANJAI.albumState.files=Array.from($("#album-files").files||[]); TANJAI.renderAlbumPreview(); });
    $("#makeAlbum")?.addEventListener("click",async()=>{
      const files=TANJAI.albumState.files||[];
      if(!files.length){ TANJAI.setReadyOutput("album",{title:"ยังไม่มีภาพ",desc:"กรุณาอัปโหลดภาพก่อนสร้างชุดภาพโพสต์",main:"ยังไม่มีภาพแนบ\n\nกรุณาเลือกภาพจริงหลายภาพ แล้วกด “สร้างชุดภาพโพสต์” อีกครั้ง"}); return; }
      TANJAI.toast("กำลังปรับภาพและใส่กรอบ...");
      TANJAI.albumState.outputs.forEach(o=>{try{URL.revokeObjectURL(o.url)}catch(e){}});
      const outputs=[]; for(let i=0;i<files.length;i++) outputs.push(await processImage(files[i],i,files.length)); TANJAI.albumState.outputs=outputs;
      const grid=outputs.map((o,i)=>`<article class="album-output-card"><img src="${o.url}" alt=""><b>${o.name}</b><button class="btn secondary" data-album-download="${i}">ดาวน์โหลด</button></article>`).join("");
      TANJAI.setReadyOutput("album",{title:"ชุดภาพพร้อมโพสต์",desc:`สร้างแล้ว ${outputs.length} ภาพ พร้อมดาวน์โหลดใช้งานจริง`,main:`สร้างชุดภาพโพสต์ Facebook เรียบร้อยแล้ว\n\n- จำนวนภาพ: ${outputs.length} ภาพ\n- ขนาด: ${$("#album-ratio")?.selectedOptions?.[0]?.textContent || "4:5"}\n- สไตล์กรอบ: ${$("#album-frameStyle")?.value || "Smart Frame"}\n- โหมด: ${$("#album-autoMode")?.value || "ปรับภาพ + ครอป + ใส่กรอบ"}\n- Safe Photo Mode: ไม่สร้างภาพใหม่ ไม่เปลี่ยนใบหน้า ไม่แก้องค์ประกอบหลัก\n\nกดปุ่ม “ดาวน์โหลดทั้งหมด” เพื่อโหลด ZIP หรือดาวน์โหลดแยกจากรายการด้านล่าง`,advancedTitle1:"พรีวิวชุดภาพ",advanced1:" "});
      const adv=$("#albumAdvanced1"); if(adv){adv.classList.remove("result-box","advanced-result-box","stable-empty"); adv.innerHTML=`<div class="album-output-grid">${grid}</div>`;}
      TANJAI.toast("สร้างชุดภาพโพสต์เรียบร้อย");
    });
    document.body.addEventListener("click",e=>{
      const dl=e.target.closest("[data-album-download]"); if(dl){TANJAI.albumDownload(Number(dl.dataset.albumDownload)); return;}
      if(e.target.closest("#albumDownloadAll,#albumDownloadAllTop")){TANJAI.albumDownloadAll(); return;}
      if(e.target.closest("#albumClear,#albumClearTop")){ TANJAI.albumState.files=[]; TANJAI.albumState.outputs.forEach(o=>{try{URL.revokeObjectURL(o.url)}catch(err){}}); TANJAI.albumState.outputs=[]; const input=$("#album-files"); if(input) input.value=""; TANJAI.renderAlbumPreview(); TANJAI.setReadyOutput("album",{title:"ชุดภาพพร้อมโพสต์",desc:"ปรับภาพจริง ใส่กรอบ และดาวน์โหลดเป็นภาพพร้อมลง Facebook",main:"กดปุ่มสร้าง แล้วผลลัพธ์พร้อมใช้จะแสดงตรงนี้"}); TANJAI.toast("ล้างรูปแล้ว"); }
    });
  });
})();


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
    if(t.includes("เขียว")) return {a:"#174e2f",b:"#f1d15a",dark:"rgba(10,45,28,.88)"};
    if(t.includes("น้ำเงิน")) return {a:"#102f66",b:"#8ecbff",dark:"rgba(8,28,58,.88)"};
    if(t.includes("ดำ")) return {a:"#111",b:"#d7b35b",dark:"rgba(0,0,0,.82)"};
    return {a:"#4b1979",b:"#f0c45c",dark:"rgba(48,20,78,.88)"};
  };
  const val = (id,f="") => ($("#album-"+id)?.value || f || "").trim();
  const loadImage = file => new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=URL.createObjectURL(file); });
  const wrap = (ctx,text,x,y,maxWidth,lineHeight,maxLines=4) => {
    const words = String(text||"").replace(/\s+/g," ").trim().split(" ");
    let line="", lines=[];
    words.forEach(w=>{ const test=line?line+" "+w:w; if(ctx.measureText(test).width>maxWidth && line){lines.push(line); line=w;} else line=test; });
    if(line) lines.push(line);
    lines.slice(0,maxLines).forEach((ln,i)=>ctx.fillText(ln,x,y+i*lineHeight));
  };
  const data = () => ({title:val("title","ชุดภาพประชาสัมพันธ์"), org:val("orgName","เทศบาลเมืองบางรักน้อย"), dateTime:val("dateTime"), place:val("place"), detail:val("detail"), footer:val("footer","สร้างสรรค์งานบริการ เพื่อประชาชนอย่างต่อเนื่อง")});
  const cover = (ctx,w,h,d,th) => {
    const pad=Math.round(w*.055), grad=ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,"rgba(0,0,0,.05)"); grad.addColorStop(.55,"rgba(0,0,0,.10)"); grad.addColorStop(1,"rgba(0,0,0,.62)");
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=th.dark; ctx.roundRect(pad,Math.round(h*.57),w-pad*2,Math.round(h*.34),34); ctx.fill();
    ctx.fillStyle=th.b; ctx.font=`800 ${Math.round(w*.036)}px sans-serif`; ctx.fillText(d.org,pad*1.35,Math.round(h*.61));
    ctx.fillStyle="#fff"; ctx.font=`900 ${Math.round(w*.060)}px sans-serif`; wrap(ctx,d.title,pad*1.35,Math.round(h*.68),w-pad*2.7,Math.round(w*.07),3);
    ctx.font=`600 ${Math.round(w*.030)}px sans-serif`; ctx.fillStyle="rgba(255,255,255,.92)";
    wrap(ctx,[d.dateTime,d.place].filter(Boolean).join("  |  ") || d.detail,pad*1.35,Math.round(h*.84),w-pad*2.7,Math.round(w*.042),2);
    ctx.fillStyle=th.b; ctx.beginPath(); ctx.arc(w-pad*1.25,pad*1.25,Math.round(w*.045),0,Math.PI*2); ctx.fill();
    ctx.fillStyle=th.a; ctx.font=`900 ${Math.round(w*.032)}px sans-serif`; ctx.textAlign="center"; ctx.fillText("TJ",w-pad*1.25,pad*1.37); ctx.textAlign="left";
  };
  const summary = (ctx,w,h,d,th) => {
    const pad=Math.round(w*.055); ctx.fillStyle="rgba(0,0,0,.38)"; ctx.fillRect(0,0,w,h);
    ctx.fillStyle=th.dark; ctx.roundRect(pad,Math.round(h*.52),w-pad*2,Math.round(h*.39),30); ctx.fill();
    ctx.fillStyle=th.b; ctx.font=`900 ${Math.round(w*.045)}px sans-serif`; ctx.fillText("สรุปข้อมูลสำคัญ",pad*1.35,Math.round(h*.57));
    ctx.fillStyle="#fff"; ctx.font=`700 ${Math.round(w*.032)}px sans-serif`; let y=Math.round(h*.63);
    [d.dateTime&&"วันที่: "+d.dateTime,d.place&&"สถานที่: "+d.place,d.detail&&"รายละเอียด: "+d.detail].filter(Boolean).forEach(line=>{ wrap(ctx,line,pad*1.35,y,w-pad*2.7,Math.round(w*.042),2); y += Math.round(w*.092); });
    ctx.fillStyle=th.b; ctx.font=`700 ${Math.round(w*.027)}px sans-serif`; ctx.fillText(d.footer,pad*1.35,Math.round(h*.88));
  };
  const lower = (ctx,w,h,d,idx,total,th) => {
    const pad=Math.round(w*.045), barH=Math.round(h*.135), y=h-barH-pad;
    ctx.fillStyle=th.dark; ctx.roundRect(pad,y,w-pad*2,barH,24); ctx.fill();
    ctx.fillStyle=th.b; ctx.font=`800 ${Math.round(w*.028)}px sans-serif`; ctx.fillText(d.org,pad*1.35,y+Math.round(barH*.32));
    ctx.fillStyle="#fff"; ctx.font=`800 ${Math.round(w*.034)}px sans-serif`; wrap(ctx,d.title,pad*1.35,y+Math.round(barH*.64),w-pad*4.2,Math.round(w*.042),1);
    ctx.fillStyle="rgba(255,255,255,.78)"; ctx.font=`600 ${Math.round(w*.022)}px sans-serif`; ctx.fillText([d.dateTime,d.place].filter(Boolean).join(" | "),pad*1.35,y+Math.round(barH*.88));
    ctx.fillStyle=th.b; ctx.roundRect(w-pad*3,y+Math.round(barH*.25),pad*1.85,Math.round(barH*.48),16); ctx.fill();
    ctx.fillStyle=th.a; ctx.font=`900 ${Math.round(w*.026)}px sans-serif`; ctx.textAlign="center"; ctx.fillText(`${idx+1}/${total}`,w-pad*2.08,y+Math.round(barH*.56)); ctx.textAlign="left";
  };
  const processImage = async (file,idx,total) => {
    const img=await loadImage(file), {w,h}=size(), th=theme(), d=data(), canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d"), mode=$("#album-autoMode")?.value||"ปรับภาพ + ครอป + ใส่กรอบ";
    if(mode.includes("ปรับภาพ")) ctx.filter="brightness(1.08) contrast(1.08) saturate(1.07)";
    const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight), sw=w/scale, sh=h/scale, sx=(img.naturalWidth-sw)/2, sy=(img.naturalHeight-sh)/2;
    ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h); ctx.filter="none";
    if(mode!=="ปรับภาพเท่านั้น"){ if($("#album-makeCover")?.checked!==false && idx===0) cover(ctx,w,h,d,th); else if($("#album-makeCover")?.checked!==false && idx===1) summary(ctx,w,h,d,th); else lower(ctx,w,h,d,idx,total,th); }
    const blob=await new Promise(res=>canvas.toBlob(res,"image/jpeg",.92));
    return {blob,url:URL.createObjectURL(blob),name:`facebook_album_${String(idx+1).padStart(2,"0")}.jpg`};
  };
  TANJAI.renderAlbumPreview = function(){
    const el=$("#album-preview"); if(!el) return;
    const files=TANJAI.albumState.files||[];
    el.innerHTML=files.map((f,i)=>`<div class="album-file-chip"><span>${i+1}</span><b>${f.name}</b><small>${Math.round(f.size/1024)} KB</small></div>`).join("") || `<div class="mini-note">ยังไม่มีภาพแนบ</div>`;
  };
  TANJAI.albumDownload = function(i){ const item=TANJAI.albumState.outputs?.[i]; if(!item) return; const a=document.createElement("a"); a.href=item.url; a.download=item.name; a.click(); };
  TANJAI.albumDownloadAll = function(){ const outputs=TANJAI.albumState.outputs||[]; if(!outputs.length){TANJAI.toast("ยังไม่มีภาพที่สร้างแล้ว"); return;} outputs.forEach((_,i)=>setTimeout(()=>TANJAI.albumDownload(i),i*180)); };
  document.addEventListener("DOMContentLoaded",()=>{
    $("#album-files")?.addEventListener("change",()=>{ TANJAI.albumState.files=Array.from($("#album-files").files||[]); TANJAI.renderAlbumPreview(); });
    $("#makeAlbum")?.addEventListener("click",async()=>{
      const files=TANJAI.albumState.files||[];
      if(!files.length){ TANJAI.setReadyOutput("album",{title:"ยังไม่มีภาพ",desc:"กรุณาอัปโหลดภาพก่อนสร้างชุดภาพโพสต์",main:"ยังไม่มีภาพแนบ\n\nกรุณาเลือกภาพจริงหลายภาพ แล้วกด “สร้างชุดภาพโพสต์” อีกครั้ง"}); return; }
      TANJAI.toast("กำลังปรับภาพและใส่กรอบ...");
      TANJAI.albumState.outputs.forEach(o=>{try{URL.revokeObjectURL(o.url)}catch(e){}});
      const outputs=[]; for(let i=0;i<files.length;i++) outputs.push(await processImage(files[i],i,files.length)); TANJAI.albumState.outputs=outputs;
      const grid=outputs.map((o,i)=>`<article class="album-output-card"><img src="${o.url}" alt=""><b>${o.name}</b><button class="btn secondary" data-album-download="${i}">ดาวน์โหลด</button></article>`).join("");
      TANJAI.setReadyOutput("album",{title:"ชุดภาพพร้อมโพสต์",desc:`สร้างแล้ว ${outputs.length} ภาพ พร้อมดาวน์โหลดใช้งานจริง`,main:`สร้างชุดภาพโพสต์ Facebook เรียบร้อยแล้ว\n\n- จำนวนภาพ: ${outputs.length} ภาพ\n- ขนาด: ${$("#album-ratio")?.selectedOptions?.[0]?.textContent || "4:5"}\n- โหมด: ${$("#album-autoMode")?.value || "ปรับภาพ + ครอป + ใส่กรอบ"}\n- Safe Photo Mode: ไม่สร้างภาพใหม่ ไม่เปลี่ยนใบหน้า ไม่แก้องค์ประกอบหลัก\n\nกดปุ่ม “ดาวน์โหลดทั้งหมด” หรือดาวน์โหลดแยกจากรายการด้านล่าง`,advancedTitle1:"พรีวิวชุดภาพ",advanced1:" "});
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

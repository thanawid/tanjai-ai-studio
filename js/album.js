/* v8.6.7 — Facebook Album Pro Design System
   Safe photo processing: crop/enhance/frame real photos only. No generative image alteration.
   Adds upload-order control, theme-aware glass overlays, balanced Thai wrapping, and customer-ready category label.
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
      ratio: val("album-ratio","4:5 Facebook / Line"),
      colorTone: val("album-colorTone","ให้ AI เลือกให้เหมาะสม"),
      mode: val("album-autoMode", val("album-mode","ปรับภาพ + ครอป + ใส่กรอบ")),
      layoutMode: val("album-layoutMode","สมดุลภาพและข้อความ")
    };
  }
  function size(d=data()){
    const r = d.ratio || "";
    if(r.includes("1:1")) return {w:1080,h:1080};
    if(r.includes("16:9")) return {w:1920,h:1080};
    if(r.includes("9:16")) return {w:1080,h:1920};
    return {w:1080,h:1350};
  }
  function hexToRgb(hex){
    hex=String(hex||"").replace("#","");
    if(hex.length===3) hex=hex.split("").map(x=>x+x).join("");
    const n=parseInt(hex,16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function rgba(hex,a){
    const c=hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${a})`;
  }
  function theme(d=data()){
    const raw=(d.colorTone||"").toLowerCase();
    let t;
    if(raw.includes("ม่วง") || raw.includes("ทอง")) t={a:"#8B5CF6",b:"#FBBF24",dark:"#160B2D",glass:"rgba(14,10,34,.72)"};
    else if(raw.includes("เขียว") || raw.includes("เหลือง")) t={a:"#16A34A",b:"#FACC15",dark:"#052E1A",glass:"rgba(4,28,20,.72)"};
    else if(raw.includes("น้ำเงิน")) t={a:"#2563EB",b:"#93C5FD",dark:"#071A3D",glass:"rgba(5,18,45,.74)"};
    else if(raw.includes("ดำ") || raw.includes("ทอง")) t={a:"#111827",b:"#F59E0B",dark:"#05060A",glass:"rgba(3,6,12,.76)"};
    else if(raw.includes("ชมพู")) t={a:"#EC4899",b:"#A78BFA",dark:"#3B0A28",glass:"rgba(34,10,31,.72)"};
    else t={a:"#22D3EE",b:"#8B5CF6",dark:"#0F172A",glass:"rgba(9,15,30,.72)"};
    t.c="#FFFFFF";
    t.softA=rgba(t.a,.55);
    t.softB=rgba(t.b,.42);
    t.line=rgba(t.a,.72);
    t.glow=rgba(t.a,.34);
    t.card="rgba(8,13,31,.70)";
    t.cardLite="rgba(255,255,255,.14)";
    return t;
  }
  function tpl(d=data()){
    const raw=d.frameStyle||"";
    if(raw.includes("ประชุม") || raw.includes("รับฟัง") || raw.includes("ประชาคม")) return {icon:"◉", chips:["รับฟัง","มีส่วนร่วม","สรุปชัด"]};
    if(raw.includes("ลงพื้นที่") || raw.includes("ภารกิจ") || raw.includes("ติดตาม")) return {icon:"◆", chips:["ติดตาม","ลงมือทำ","ผลลัพธ์"]};
    if(raw.includes("ข่าวด่วน") || raw.includes("ประกาศ")) return {icon:"!", chips:["แจ้งข่าว","ตรวจสอบ","อัปเดต"]};
    if(raw.includes("กิจกรรม") || raw.includes("อบรม")) return {icon:"✦", chips:["กิจกรรม","ร่วมมือ","พัฒนา"]};
    if(raw.includes("โรงเรียน") || raw.includes("ศึกษา")) return {icon:"✦", chips:["เรียนรู้","กิจกรรม","พัฒนา"]};
    if(raw.includes("สุขภาพ") || raw.includes("รณรงค์")) return {icon:"＋", chips:["ดูแล","ปลอดภัย","ร่วมมือ"]};
    if(raw.includes("ธุรกิจ") || raw.includes("โปรโม")) return {icon:"★", chips:["สินค้า","บริการ","ข้อเสนอ"]};
    if(raw.includes("ครีเอเตอร์") || raw.includes("แบรนด์ส่วนตัว")) return {icon:"●", chips:["อัปเดต","น่าสนใจ","แชร์ได้"]};
    if(raw.includes("มินิมอล")) return {icon:"—", chips:["เรียบง่าย","อ่านง่าย","สะอาด"]};
    return {icon:"●", chips:["ชัดเจน","น่าเชื่อถือ","พร้อมใช้"]};
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
    grad.addColorStop(0,"rgba(0,0,0,.10)");
    grad.addColorStop(.45,"rgba(0,0,0,.03)");
    grad.addColorStop(.78,"rgba(0,0,0,.14)");
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
    ctx.shadowColor=th.glow;
    ctx.shadowBlur=Math.max(12,Math.round(w*.035));
    ctx.shadowOffsetY=Math.round(w*.012);
    ctx.fillStyle=light ? "rgba(255,255,255,.18)" : th.glass;
    roundRect(ctx,x,y,w,h,r); ctx.fill();
    ctx.shadowBlur=0;
    ctx.lineWidth=Math.max(1,Math.round(w*.0025));
    ctx.strokeStyle=light ? "rgba(255,255,255,.32)" : "rgba(255,255,255,.18)";
    ctx.stroke();
    const g=ctx.createLinearGradient(x,y,x+w,y);
    g.addColorStop(0,th.softA); g.addColorStop(.55,th.softB); g.addColorStop(1,"rgba(255,255,255,.10)");
    ctx.fillStyle=g;
    roundRect(ctx,x+Math.round(w*.025),y+Math.round(h*.055),w-Math.round(w*.05),Math.max(3,Math.round(h*.014)),Math.round(h*.008));
    ctx.fill();
    ctx.restore();
  }
  function segmentText(text){
    text = clean(text);
    if(!text) return [];
    try{
      if(window.Intl && Intl.Segmenter){
        const seg = new Intl.Segmenter("th", {granularity:"word"});
        return Array.from(seg.segment(text)).map(s=>s.segment).filter(Boolean);
      }
    }catch(e){}
    return text.split(/(\s+|[\/|•,.:;()]+)/).filter(Boolean);
  }
  function lineWidth(ctx, arr){ return ctx.measureText(arr.join("").replace(/\s+/g," ")).width; }
  function balancedLines(ctx,text,maxW,maxLines){
    let tokens=segmentText(text);
    const lines=[]; let cur=[];
    const pushCur=()=>{ if(cur.length){ lines.push(cur); cur=[]; } };
    tokens.forEach(tok=>{
      const test=cur.concat(tok);
      if(cur.length && lineWidth(ctx,test)>maxW){ pushCur(); cur=[tok]; }
      else cur=test;
    });
    pushCur();

    // Balance two-line Thai headings so one line is not much longer than the other.
    for(let pass=0; pass<4; pass++){
      for(let i=0;i<Math.min(lines.length-1,maxLines-1);i++){
        const a=lines[i], b=lines[i+1];
        if(a.length>1 && lineWidth(ctx,a)>lineWidth(ctx,b)*1.45){
          const moved=a[a.length-1];
          const next=[moved].concat(b);
          if(lineWidth(ctx,next)<=maxW){
            b.unshift(a.pop());
          }
        }
      }
    }

    let out=lines.slice(0,maxLines).map(a=>clean(a.join("").replace(/\s+/g," ")));
    if(lines.length>maxLines && out.length){
      let last=out[out.length-1];
      while(ctx.measureText(last+"…").width>maxW && last.length>1) last=last.slice(0,-1);
      out[out.length-1]=clean(last)+"…";
    }
    return out.filter(Boolean);
  }
  function drawLines(ctx,lines,x,y,lineH){
    lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineH));
    return lines.length;
  }
  function drawLogo(ctx,w,h,d,th){
    if(!state.logo) return;
    const pad=Math.round(w*.047), s=Math.round(w*.072);
    const x=w-pad-s, y=pad;
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.25)"; ctx.shadowBlur=12;
    ctx.fillStyle="rgba(255,255,255,.90)";
    ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2); ctx.fill();
    ctx.clip();
    ctx.drawImage(state.logo,x,y,s,s);
    ctx.restore();
  }
  function drawTag(ctx,w,h,d,th,t){
    const label=clean(d.categoryLabel);
    if(!label) return;
    const pad=Math.round(w*.047);
    ctx.save();
    ctx.font=`800 ${Math.round(w*.018)}px "Prompt","Noto Sans Thai",sans-serif`;
    ctx.textBaseline="middle";
    const text=`${t.icon} ${smartShort(label,22)}`;
    const tw=ctx.measureText(text).width;
    const tagH=Math.round(h*.042);
    const tagW=Math.min(Math.round(w*.62), Math.round(tw + w*.07));
    drawGlass(ctx,pad,pad,tagW,tagH,Math.round(tagH/2),th,true);
    ctx.shadowBlur=0;
    ctx.fillStyle="#fff";
    ctx.fillText(text,pad+Math.round(w*.026),pad+tagH/2+1);
    ctx.restore();
  }
  function chipsLine(ctx,w,h,d,th,t,x,y){
    const chips = (t.chips||[]).slice(0,3);
    let cx=x;
    ctx.save();
    ctx.font=`700 ${Math.round(w*.0155)}px "Noto Sans Thai","Sarabun",sans-serif`;
    ctx.textBaseline="middle";
    chips.forEach(ch=>{
      const cw=Math.min(w*.25,ctx.measureText(ch).width+Math.round(w*.035));
      ctx.fillStyle="rgba(255,255,255,.14)";
      roundRect(ctx,cx,y,cw,Math.round(h*.033),Math.round(h*.017)); ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.14)"; ctx.stroke();
      ctx.fillStyle="rgba(255,255,255,.92)";
      ctx.fillText(ch,cx+Math.round(w*.014),y+Math.round(h*.0165)+1);
      cx += cw + Math.round(w*.010);
    });
    ctx.restore();
  }
  function autoCaption(d,idx){
    const date = d.dateTime ? smartShort(d.dateTime,20) : "";
    const title = smartShort(d.title,38);
    const place = d.place ? smartShort(d.place,28) : "";
    if(idx===0) return title;
    if(idx===1) return "สรุปข้อมูลสำคัญ";
    if(idx===2) return "บรรยากาศการดำเนินงาน";
    if(idx===3) return "ร่วมติดตามและขับเคลื่อนงาน";
    if(idx===4) return d.footer ? smartShort(d.footer,42) : "ติดตามข้อมูลเพิ่มเติมได้ที่ช่องทางของหน่วยงาน";
    if(date && place) return `${title} | ${date}`;
    if(date) return `${title} | ${date}`;
    return title;
  }
  function captionText(d){
    const org = hasRealOrg(d.org) ? d.org : "ชื่อหน่วยงาน / แบรนด์ของคุณ";
    const title = d.title || "กิจกรรม / ข่าวประชาสัมพันธ์";
    const parts = [];
    parts.push(`📌 ${title}`);
    parts.push(`${org} ขอประชาสัมพันธ์ข้อมูลให้ประชาชนและผู้ที่เกี่ยวข้องได้รับทราบ`);
    const meta = [d.dateTime && `📅 ${d.dateTime}`, d.place && `📍 ${d.place}`].filter(Boolean);
    if(meta.length) parts.push(meta.join("\n"));
    if(d.detail) parts.push(smartShort(d.detail,180));
    parts.push(d.footer ? d.footer : "ติดตามข่าวสารและกิจกรรมเพิ่มเติมได้ที่ช่องทางของเรา");
    const hashBase = hasRealOrg(d.org) ? d.org.replace(/\s+/g,"") : "ประชาสัมพันธ์";
    parts.push(`#${hashBase} #กิจกรรม #ประชาสัมพันธ์`);
    return parts.filter(Boolean).join("\n\n");
  }
  function splitDetailBullets(d){
    const src=clean(d.detail);
    const out=[];
    if(d.dateTime) out.push(`วันที่: ${smartShort(d.dateTime,38)}`);
    if(d.place) out.push(`สถานที่: ${smartShort(d.place,44)}`);
    if(src){
      const parts=src.split(/[\n•\-]+|(?<=\S)\s{2,}/).map(clean).filter(Boolean);
      out.push(`ประเด็น: ${smartShort(parts[0]||src,64)}`);
    }else{
      out.push(`เรื่อง: ${smartShort(d.title,64)}`);
    }
    return out.filter(Boolean).slice(0,3);
  }
  function drawCover(ctx,w,h,d,th,t){
    const minimal = (d.layoutMode||"").includes("เน้นภาพ");
    drawTag(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const pad=Math.round(w*.052);
    const titleSize=Math.round(w*(minimal?.034:.044));
    const titleLH=Math.round(titleSize*1.18);
    ctx.font=`900 ${titleSize}px "Prompt","Kanit","Noto Sans Thai",sans-serif`;
    const titleLines=balancedLines(ctx,smartShort(d.title,74),w-pad*3.0,minimal?1:2);
    const meta=[d.dateTime,d.place].filter(Boolean).join("  •  ");
    const hasMeta=!!meta && !minimal;
    const metaH=hasMeta?Math.round(w*.034):0;
    const boxH=Math.round(pad*.95 + titleLines.length*titleLH + (hasMeta?metaH+Math.round(w*.025):Math.round(w*.012)));
    const boxY=h-boxH-pad;
    drawGlass(ctx,pad,boxY,w-pad*2,boxH,Math.round(w*.034),th,false);
    ctx.save();
    ctx.textBaseline="top";
    ctx.fillStyle="#fff";
    ctx.font=`900 ${titleSize}px "Prompt","Kanit","Noto Sans Thai",sans-serif`;
    drawLines(ctx,titleLines,pad*1.45,boxY+Math.round(pad*.56),titleLH);
    if(hasMeta){
      ctx.font=`700 ${Math.round(w*.021)}px "Noto Sans Thai","Sarabun",sans-serif`;
      ctx.fillStyle="rgba(255,255,255,.88)";
      const metaLines=balancedLines(ctx,smartShort(meta,88),w-pad*3.1,1);
      drawLines(ctx,metaLines,pad*1.45,boxY+Math.round(pad*.62)+titleLines.length*titleLH+Math.round(w*.014),Math.round(w*.030));
    }
    ctx.restore();
  }
  function drawSummary(ctx,w,h,d,th,t){
    drawTag(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const pad=Math.round(w*.052);
    const bullets=splitDetailBullets(d);
    const headSize=Math.round(w*.032);
    const bulletSize=Math.round(w*.0225);
    const bulletLH=Math.round(bulletSize*1.55);
    const boxH=Math.round(pad*1.3 + headSize*1.25 + bullets.length*bulletLH + Math.round(w*.035));
    const boxY=h-boxH-pad;
    drawGlass(ctx,pad,boxY,w-pad*2,boxH,Math.round(w*.034),th,false);
    ctx.save();
    ctx.textBaseline="top";
    ctx.fillStyle="#fff";
    ctx.font=`900 ${headSize}px "Prompt","Noto Sans Thai",sans-serif`;
    ctx.fillText("สรุปข้อมูลสำคัญ",pad*1.45,boxY+Math.round(pad*.52));
    const lineY=boxY+Math.round(pad*.52)+Math.round(headSize*1.45);
    ctx.font=`700 ${bulletSize}px "Noto Sans Thai","Sarabun",sans-serif`;
    bullets.forEach((b,i)=>{
      const y=lineY+i*bulletLH;
      ctx.fillStyle= i===0 ? th.b : th.a;
      ctx.beginPath(); ctx.arc(pad*1.55,y+bulletSize*.45,Math.max(5,w*.006),0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,.92)";
      const lines=balancedLines(ctx,b,w-pad*3.4,1);
      drawLines(ctx,lines,pad*1.78,y,bulletLH);
    });
    ctx.restore();
  }
  function drawLower(ctx,w,h,d,idx,th,t){
    drawTag(ctx,w,h,d,th,t); drawLogo(ctx,w,h,d,th);
    const cap=autoCaption(d,idx);
    if(!cap && !d.dateTime) return;
    const pad=Math.round(w*.052);
    const fontSize=Math.round(w*.0225);
    const lineH=Math.round(fontSize*1.38);
    ctx.font=`800 ${fontSize}px "Prompt","Noto Sans Thai",sans-serif`;
    const lines=balancedLines(ctx,cap,w-pad*3.05,idx<=4?2:1);
    const barH=Math.round(pad*.85 + lines.length*lineH);
    const y=h-barH-pad;
    drawGlass(ctx,pad,y,w-pad*2,barH,Math.round(w*.028),th,false);
    ctx.save();
    ctx.fillStyle="#fff";
    ctx.textBaseline="top";
    ctx.font=`800 ${fontSize}px "Prompt","Noto Sans Thai",sans-serif`;
    drawLines(ctx,lines,pad*1.42,y+Math.round(pad*.42),lineH);
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
  async function waitFonts(){
    try{ if(document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){}
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
  function renderUploadPreview(){
    const host=$("#album-preview");
    if(!host) return;
    if(!state.files.length){
      host.innerHTML = `<p class="album-frame-note">ยังไม่มีรูปที่เลือก</p>`;
      return;
    }
    host.innerHTML = `
      <div class="album-order-note">ระบบจะสร้างภาพตามลำดับนี้ รูปที่ 1 เป็นปก รูปที่ 2 เป็นสรุป รูปที่ 3–5 เป็นภาพประกอบหลัก</div>
      ${state.files.map((f,i)=>`
        <div class="album-file-chip" data-i="${i}">
          <span>${i+1}</span>
          <b title="${f.name.replace(/"/g,"&quot;")}">${f.name}</b>
          <small>${i===0?"Cover":i===1?"Summary":i<5?"Main":"Extra"}</small>
          <div class="album-order-actions">
            <button type="button" class="album-order-btn" data-album-move="up" data-i="${i}" ${i===0?"disabled":""}>↑</button>
            <button type="button" class="album-order-btn" data-album-move="down" data-i="${i}" ${i===state.files.length-1?"disabled":""}>↓</button>
          </div>
        </div>`).join("")}
    `;
  }
  function renderOutputs(){
    const host=$("#albumResult .ready-main") || $("#albumResult") || $("#albumOutput") || $("#albumPreview");
    if(!host) return;
    const caption = state.caption || captionText(data());
    const cards=state.outputs.map((o,i)=>`
      <div class="album-output-card">
        <img src="${o.url}" alt="ภาพที่ ${i+1}">
        <b>${i===0?"รูปปก":i===1?"รูปสรุป":i<5?"รูปหลัก":"รูปเพิ่มเติม"} ${i+1}</b>
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
  function moveFile(i,dir){
    const j=dir==="up"?i-1:i+1;
    if(j<0 || j>=state.files.length) return;
    const copy=state.files.slice();
    [copy[i],copy[j]]=[copy[j],copy[i]];
    state.files=copy;
    renderUploadPreview();
  }

  async function generate(){
    if(window.TANJAI && TANJAI.proofread && typeof TANJAI.proofread.runActive === "function"){
      TANJAI.proofread.runActive(false);
    }
    let files=state.files;
    const input=$("#album-files");
    if((!files || !files.length) && input && input.files) files=Array.from(input.files).filter(f=>f.type.startsWith("image/"));
    if(!files.length){ alert("กรุณาเลือกรูปภาพก่อน"); return; }
    state.files=files;
    state.outputs.forEach(o=>URL.revokeObjectURL(o.url));
    state.outputs=[];
    const btn=$("#makeAlbum"); const old=btn?btn.textContent:"";
    if(btn){ btn.disabled=true; btn.textContent="กำลังสร้างชุดภาพ..."; }
    try{
      await waitFonts();
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
    renderUploadPreview();
    document.addEventListener("click",(e)=>{
      const id=e.target && e.target.id;
      if(id==="makeAlbum"){ e.preventDefault(); generate(); }
      if(id==="albumDownloadAll" || id==="albumDownloadAllTop"){ e.preventDefault(); downloadAll(); }
      if(id==="albumClear" || id==="albumClearTop"){
        e.preventDefault();
        state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[]; state.files=[];
        const inp=$("#album-files"); if(inp) inp.value="";
        renderUploadPreview();
        const host=$("#albumResult .ready-main") || $("#albumResult"); if(host) host.innerHTML="";
      }
      if(id==="albumCopyCaption"){
        e.preventDefault();
        const t=$("#albumCaptionText");
        if(t){ navigator.clipboard?.writeText(t.value); e.target.textContent="คัดลอกแล้ว"; setTimeout(()=>e.target.textContent="คัดลอกแคปชั่น",1200); }
      }
      if(id==="albumRefreshPreview"){ e.preventDefault(); renderFacebookPreview(); }
      if(e.target && e.target.classList.contains("album-one-download")) downloadOne(Number(e.target.dataset.i||0));
      const move=e.target && e.target.dataset && e.target.dataset.albumMove;
      if(move){ e.preventDefault(); moveFile(Number(e.target.dataset.i||0), move); }
    });
    document.addEventListener("change",(e)=>{
      if(e.target && e.target.id==="album-files"){
        state.files=Array.from(e.target.files||[]).filter(f=>f.type.startsWith("image/"));
        renderUploadPreview();
      }
    });
  });
  window.TANJAI_ALBUM_PRO={generate,downloadAll,renderFacebookPreview,renderUploadPreview};
})();

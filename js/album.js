/* v9.5 — Smart Album + Touch Ordering + Progressive Processing
   ✅ รองรับ 1–5 ภาพ (ไม่บังคับ 4 ภาพ)
   ✅ Touch drag ordering บนมือถือ
   ✅ Progress bar ขณะประมวลผล
   ✅ Caption AI รู้บริบทองค์กรดีขึ้น
   ✅ Responsive ทุกอุปกรณ์
*/
(function(){
  function ensureAlbumInputs(){
    const cover = document.getElementById("album-coverFile");
    const supports = document.getElementById("album-supportFiles");
    if(cover) cover.setAttribute("accept","image/*");
    if(supports){
      supports.setAttribute("multiple","multiple");
      supports.setAttribute("accept","image/*");
    }
  }

  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const state = {
    coverFile: null, supportFiles: [], files: [], outputs: [], logo: null, caption: "",
    resolvedRatio: "1080x800", resolvedPreviewLayout: "cover-top", resolvedFacebookPreset: "wide-top"
  };
  window.albumState = state; // expose สำหรับ adjust engine

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
    const marks = [" เพื่อ"," โดย"," ณ "," วันที่"," ปี "," ประจำ"," เรื่อง"," ในการ"," และ"," พร้อม"," ของ"];
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
      themePreset: val("album-themePreset","Ribbon Civic Cover"),
      lite2: val("album-lite2",""),
      lite3: val("album-lite3",""),
      lite4: val("album-lite4",""),
      ratio: val("album-ratio","auto"),
      previewLayout: val("album-previewLayout","auto"),
      facebookPreset: val("album-facebookPreset","auto"),
      captionStyle: val("album-captionStyle","pr-ready"),
      colorTone: val("album-colorTone","AI เลือกโทนสีให้เข้ากับงาน"),
      mode: val("album-autoMode", val("album-mode","ปรับภาพ + ครอป + ใส่กรอบ")),
      layoutMode: val("album-layoutMode","Facebook Cover + Lite + Additional Frame System"),
      useCoverOnly: !!document.getElementById("album-makeCover")?.checked
    };
  }

  function effectiveRatio(d=data()){
    const requested=d.ratio || "auto";
    return requested === "auto" ? (state.resolvedRatio || "16:9") : requested;
  }
  function resolveRatioFromDimensions(w,h){
    const aspect=(Number(w)||16)/(Number(h)||9);
    if(aspect>=1.30) return "16:9";
    if(aspect<=0.86) return "4:5";
    return "1:1";
  }
  function previewLayoutFor(requested="auto",count=4,ratio="16:9"){
    if(requested && requested!=="auto") return requested;
    if(count<=2) return "grid";
    if(ratio==="4:5" || ratio==="9:16") return "cover-left";
    if(count>=4) return "cover-top";
    return "cover-left";
  }
  function resolveFacebookPreset(requested="auto",w=1080,h=800){
    if(requested && requested!=="auto") return requested;
    const aspect=(Number(w)||1080)/(Number(h)||800);
    if(aspect<=0.86) return "portrait-left";
    if(aspect>=1.18) return "wide-top";
    return "square-grid";
  }
  function effectiveFacebookPreset(d=data()){
    return d.facebookPreset && d.facebookPreset!=="auto" ? d.facebookPreset : (state.resolvedFacebookPreset || "wide-top");
  }
  function presetLayout(preset){
    if(preset==="square-grid") return "grid";
    if(preset==="portrait-left") return "cover-left";
    return "cover-top";
  }
  function facebookPresetLabel(preset){
    if(preset==="square-grid") return "4 ภาพจัตุรัส 1080x1080";
    if(preset==="portrait-left") return "ปกตั้ง 1280x1920 + ภาพรองจัตุรัส";
    return "ปกกว้าง 1080x800 + ภาพรองจัตุรัส";
  }
  function previewLayoutLabel(layout){
    if(layout==="cover-left") return "ปกใหญ่ซ้าย + ภาพรองขวา";
    if(layout==="grid") return "ตารางภาพสมดุล";
    return "ปกใหญ่ด้านบน + ภาพรองด้านล่าง";
  }
  function size(d=data()){
    const r = effectiveRatio(d);
    if(r.includes("1:1")) return {w:1080,h:1080};
    if(r.includes("9:16")) return {w:1080,h:1920};
    if(r.includes("4:5")) return {w:1080,h:1350};
    return {w:1920,h:1080};
  }

  function slotRole(idx){
    if(idx===0) return "cover";
    if(idx<4) return "lite";
    return "additional";
  }
  function slotProfile(idx,d=data(),total=state.files.length||4){
    const role=slotRole(idx);
    const layout=presetLayout(effectiveFacebookPreset(d));
    if(role==="cover"){
      return {role, layout, label:"Cover Frame", frameWeight:"balanced-cover", textDensity:"full", logoScale:.84, targetY:layout==="cover-left"?.43:.41, bottomRatio:.17};
    }
    if(role==="lite"){
      return {role, layout, label:`Lite Frame ${idx+1}`, frameWeight:"balanced-lite", textDensity:"short", logoScale:.56, targetY:.49, bottomRatio: d.mode.includes("ภาพกิจกรรมเน้นภาพ")?.058:.072};
    }
    return {role, layout, label:`Additional Frame ${idx+1}`, frameWeight:"balanced-minimal", textDensity:"minimal", logoScale:.42, targetY:.50, bottomRatio:.048};
  }
  function slotSize(idx,d=data(),total=state.files.length||4){
    const preset=effectiveFacebookPreset(d);
    const role=slotRole(idx);
    if(preset==="square-grid") return {w:1080,h:1080};
    if(preset==="portrait-left") return role==="cover" ? {w:1280,h:1920} : {w:1080,h:1080};
    if(preset==="wide-top") return role==="cover" ? {w:1080,h:800} : {w:1080,h:1080};
    const requested=d.ratio || "auto";
    if(requested !== "auto") return size(d);
    const layout=previewLayoutFor(d.previewLayout,total,effectiveRatio(d));
    if(layout==="grid") return {w:1080,h:1080};
    if(layout==="cover-left"){
      if(role==="cover") return {w:1080,h:1350};
      if(role==="lite") return {w:1080,h:1080};
      return {w:1080,h:1080};
    }
    if(layout==="mobile-focus"){
      if(role==="cover") return {w:1080,h:1350};
      return {w:1080,h:1080};
    }
    // cover-top: first image is the wide story card, supporting images become clean square/lite cards for Facebook grid thumbnails.
    if(role==="cover") return {w:1920,h:1080};
    if(role==="lite") return {w:1080,h:1080};
    return {w:1080,h:1080};
  }
  function ratioValue(d=data()){
    const r = effectiveRatio(d);
    if(r.includes("1:1")) return "1 / 1";
    if(r.includes("9:16")) return "9 / 16";
    if(r.includes("4:5")) return "4 / 5";
    return "16 / 9";
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
    const proFrame = val("album-proFrame", "Balanced Ribbon");
    let raw=(d.colorTone||"").toLowerCase();
    if(!raw || raw.includes("ai เลือก")){
      const cue=[d.frameStyle,d.categoryLabel,d.title,d.detail].filter(Boolean).join(" ").toLowerCase();
      if(/ด่วน|เตือน|ฉุกเฉิน|สำคัญ/.test(cue)) raw="แดง ส้ม ทอง";
      else if(/สุขภาพ|ชุมชน|สิ่งแวดล้อม|ต้นไม้/.test(cue)) raw="เขียว เหลือง";
      else if(/โรงเรียน|การศึกษา|เด็ก|อบรม/.test(cue)) raw="น้ำเงิน เหลือง";
      else if(/สินค้า|โปรโม|ครีเอเตอร์|เพจ|เพลง/.test(cue)) raw="ม่วง ชมพู ทอง";
      else if(/พิธี|ทางการ|ประชุม|ราชการ|เทศบาล|อบต/.test(cue)) raw="น้ำเงิน ทอง";
      else raw="น้ำเงิน ขาว";
    }
    let t;
    if(raw.includes("แดง")){
      t={accent:"#DC2626",accent2:"#F59E0B",dark:"#450A0A",deep:"#1F0808"};
    } else if(raw.includes("ม่วง") || raw.includes("ชมพู")){
      t={accent:"#8B5CF6",accent2:"#FBBF24",dark:"#170C33",deep:"#0B0820"};
    } else if(raw.includes("เขียว") || raw.includes("เหลือง")){
      t={accent:"#16A34A",accent2:"#FACC15",dark:"#07351D",deep:"#041A0F"};
    } else if(raw.includes("น้ำเงิน") && raw.includes("ทอง")){
      t={accent:"#1D4ED8",accent2:"#FBBF24",dark:"#0A1F4E",deep:"#06132F"};
    } else if(raw.includes("น้ำเงิน")){
      t={accent:"#2563EB",accent2:raw.includes("เหลือง")?"#FACC15":"#93C5FD",dark:"#0A1F4E",deep:"#06132F"};
    } else if(raw.includes("ส้ม") || raw.includes("อำพัน") || raw.includes("amber")){
      t={accent:"#D97706",accent2:"#FCD34D",dark:"#3A1A05",deep:"#1F1004"};
    } else if(raw.includes("ดำ") || raw.includes("หรู")){
      t={accent:"#111827",accent2:"#F59E0B",dark:"#09090B",deep:"#050507"};
    } else {
      t={accent:"#2563EB",accent2:"#8B5CF6",dark:"#0F172A",deep:"#0A1020"};
    }
    t.text="#FFFFFF";
    t.muted="rgba(255,255,255,.88)";
    t.panel=rgba(t.deep,.82);
    t.panelSoft=rgba(t.dark,.68);
    t.panelLite=rgba(t.deep,.58);
    t.line=rgba(t.accent2,.78);
    t.border=rgba(t.accent2,.52);
    t.borderSoft="rgba(255,255,255,.14)";
    t.glow=rgba(t.accent,.36);
    t.glowSoft=rgba(t.accent2,.22);
    t.chip=rgba(t.accent,.92);
    t.chip2=rgba(t.accent2,.96);
    t.ribbonDark=rgba(t.deep,.96);
    t.shadow="rgba(0,0,0,.25)";
    t.proFrame = proFrame;
    return t;
  }

  function preset(d=data()){
    const p = d.themePreset || "Ribbon Civic Cover";
    if(p.includes("Minimal")) return {name:"minimal", titleScale:0.96, showFooterBar:false, showAccentSweep:true, liteCompact:true};
    if(p.includes("Glass")) return {name:"glass", titleScale:1.02, showFooterBar:true, showAccentSweep:true, liteCompact:false};
    return {name:"ribbon", titleScale:1.0, showFooterBar:true, showAccentSweep:true, liteCompact:false};
  }

  function cropPlacement(sw,sh,w,h,focal=null,targetYRatio=.46){
    const scale=Math.max(w/sw,h/sh), nw=sw*scale, nh=sh*scale;
    let x=(w-nw)/2, y=(h-nh)/2;
    if(focal && Number.isFinite(focal.x) && Number.isFinite(focal.y)){
      x=(w*.5)-(focal.x*scale);
      y=(h*targetYRatio)-(focal.y*scale);
      x=Math.min(0,Math.max(w-nw,x));
      y=Math.min(0,Math.max(h-nh,y));
    }
    return {scale,nw,nh,x,y};
  }

  async function detectFaceFocus(img){
    if(typeof window.FaceDetector !== "function") return null;
    try{
      const faces=await new window.FaceDetector({fastMode:true,maxDetectedFaces:16}).detect(img);
      const boxes=faces.map(f=>f.boundingBox).filter(Boolean);
      if(!boxes.length) return null;
      const left=Math.min(...boxes.map(b=>b.x));
      const top=Math.min(...boxes.map(b=>b.y));
      const right=Math.max(...boxes.map(b=>b.x+b.width));
      const bottom=Math.max(...boxes.map(b=>b.y+b.height));
      return {x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top,count:boxes.length};
    }catch(_error){ return null; }
  }

  function coverDraw(img, ctx, w, h, enhance=true, focal=null, targetYRatio=.46){
    const sw=img.naturalWidth||img.width, sh=img.naturalHeight||img.height;
    const {nw,nh,x,y}=cropPlacement(sw,sh,w,h,focal,targetYRatio);
    ctx.save();
    if(enhance) ctx.filter="brightness(1.06) contrast(1.045) saturate(1.08)";
    ctx.drawImage(img,x,y,nw,nh);
    ctx.restore();
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,"rgba(0,0,0,.08)");
    grad.addColorStop(.48,"rgba(0,0,0,.02)");
    grad.addColorStop(.78,"rgba(0,0,0,.16)");
    grad.addColorStop(1,"rgba(0,0,0,.30)");
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  }

  function roundRectPath(ctx,x,y,w,h,r){
    r=Math.min(r,w/2,h/2); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }
  function fillRoundRect(ctx,x,y,w,h,r,fill,stroke=null,line=1){
    ctx.save();
    roundRectPath(ctx,x,y,w,h,r);
    if(fill){ ctx.fillStyle=fill; ctx.fill(); }
    if(stroke){ ctx.lineWidth=line; ctx.strokeStyle=stroke; ctx.stroke(); }
    ctx.restore();
  }
  function drawGlassPanel(ctx,x,y,w,h,r,th,alpha=.76){
    ctx.save();
    ctx.shadowColor=th.glow; ctx.shadowBlur=Math.max(10,Math.round(Math.min(w,h)*.03)); ctx.shadowOffsetY=Math.max(4,Math.round(h*.03));
    fillRoundRect(ctx,x,y,w,h,r,rgba(th.deep,alpha),"rgba(255,255,255,.14)",Math.max(1,Math.round(Math.min(w,h)*.004)));
    ctx.shadowBlur=0;
    const g=ctx.createLinearGradient(x,y,x+w,y);
    g.addColorStop(0,rgba(th.accent,.26));
    g.addColorStop(.56,rgba(th.accent2,.18));
    g.addColorStop(1,"rgba(255,255,255,.06)");
    fillRoundRect(ctx,x+Math.round(w*.02),y+Math.round(h*.06),w-Math.round(w*.04),Math.max(3,Math.round(h*.08)),Math.round(h*.04),g,null,0);
    ctx.restore();
  }
  function drawAccentSweep(ctx,w,h,th,pst){
    if(!pst.showAccentSweep) return;
    ctx.save();
    const g1=ctx.createLinearGradient(w*.78,0,w,0);
    g1.addColorStop(0,rgba(th.accent,.12));
    g1.addColorStop(1,th.accent2);
    ctx.fillStyle=g1;
    ctx.beginPath();
    ctx.moveTo(w*.82,0);
    ctx.lineTo(w,0);
    ctx.lineTo(w,h*.16);
    ctx.lineTo(w*.94,h*.09);
    ctx.closePath();
    ctx.fill();

    const g2=ctx.createLinearGradient(0,h,w*.24,h*.84);
    g2.addColorStop(0,th.accent);
    g2.addColorStop(1,rgba(th.accent2,.10));
    ctx.fillStyle=g2;
    ctx.beginPath();
    ctx.moveTo(0,h*.88);
    ctx.lineTo(w*.12,h*.94);
    ctx.lineTo(w*.24,h);
    ctx.lineTo(0,h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawBorderFrame(ctx,w,h,th){
    const min=Math.min(w,h);
    const pad=Math.round(min*0.014);
    const radius=Math.round(min*0.020);
    const pro=th.proFrame && th.proFrame !== "None";
    const thickness=pro ? Math.max(6,Math.round(min*0.009)) : Math.max(3,Math.round(min*.0038));
    ctx.save();

    if(th.proFrame === "Balanced Ribbon"){
      ctx.shadowColor=rgba(th.deep,.28);
      ctx.shadowBlur=Math.round(min*.009);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,th.accent,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(7,radius-thickness*.40),null,"rgba(255,255,255,.34)",1);
    }
    else if(th.proFrame === "Gold Luxury"){
      const gold=ctx.createLinearGradient(0,0,w,h);
      gold.addColorStop(0, "#C99719");
      gold.addColorStop(.18, "#FFF0A8");
      gold.addColorStop(.38, "#E2B85D");
      gold.addColorStop(.58, "#A86E09");
      gold.addColorStop(.78, "#F8D66F");
      gold.addColorStop(1, "#B97908");
      ctx.shadowColor="rgba(212,175,55,.28)";
      ctx.shadowBlur=Math.round(min*.010);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,gold,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness*.90,pad+thickness*.90,w-pad*2-thickness*1.8,h-pad*2-thickness*1.8,Math.max(8,radius-thickness*.40),null,"rgba(255,255,255,.28)",1);
    }
    else if(th.proFrame === "Modern Neon"){
      ctx.shadowColor=rgba(th.accent,.38);
      ctx.shadowBlur=Math.round(min*.022);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,th.accent,Math.max(5,Math.round(thickness*.75)));
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(8,radius-thickness*.35),null,rgba(th.accent2,.72),Math.max(1,Math.round(thickness*.16)));
    }
    else if(th.proFrame === "Bold Corporate"){
      const corp=ctx.createLinearGradient(0,0,w,0);
      corp.addColorStop(0, th.accent);
      corp.addColorStop(1, th.accent2);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,corp,thickness);
      fillRoundRect(ctx,pad+thickness*.9,pad+thickness*.9,w-pad*2-thickness*1.8,h-pad*2-thickness*1.8,Math.max(8,radius-thickness*.35),null,"rgba(255,255,255,.24)",Math.max(1,Math.round(thickness*.13)));
    }
    else{
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,th.border,thickness);
      fillRoundRect(ctx,pad+7,pad+7,w-pad*2-14,h-pad*2-14,Math.max(8,radius-5),null,"rgba(255,255,255,.10)",1);
    }
    ctx.restore();
  }

  function drawSlotBorderFrame(ctx,w,h,th,weight="lite"){
    const min=Math.min(w,h);
    const pad=Math.round(min*(weight==="minimal"?0.015:0.014));
    const thickness = weight==="minimal" ? Math.max(2, Math.round(min*0.0028)) : Math.max(3, Math.round(min*0.0045));
    const radius=Math.round(min*0.019);
    ctx.save();
    if(th.proFrame === "Balanced Ribbon"){
      ctx.shadowColor=rgba(th.deep,.18);
      ctx.shadowBlur=weight==="minimal" ? 3 : 6;
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,th.accent,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(6,radius-thickness*.45),null,"rgba(255,255,255,.28)",1);
    }else if(th.proFrame === "Gold Luxury"){
      const gold=ctx.createLinearGradient(0,0,w,h);
      gold.addColorStop(0, "#C99719");
      gold.addColorStop(.22, "#FFF0A8");
      gold.addColorStop(.48, "#D6A73A");
      gold.addColorStop(.72, "#F6D36C");
      gold.addColorStop(1, "#A86E09");
      ctx.shadowColor = weight==="minimal" ? "rgba(212,175,55,.12)" : "rgba(212,175,55,.22)";
      ctx.shadowBlur = weight==="minimal" ? 6 : 10;
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,gold,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness*.85,pad+thickness*.85,w-pad*2-thickness*1.7,h-pad*2-thickness*1.7,Math.max(6,radius-thickness*.45),null,"rgba(255,255,255,.22)",1);
    }else if(th.proFrame === "Modern Neon"){
      ctx.shadowColor = rgba(th.accent,.28);
      ctx.shadowBlur = weight==="minimal" ? 7 : 11;
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,th.accent,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(6,radius-thickness*.45),null,rgba(th.accent2,.62),1);
    }else if(th.proFrame === "Bold Corporate"){
      const corp=ctx.createLinearGradient(0,0,w,0);
      corp.addColorStop(0, th.accent);
      corp.addColorStop(1, th.accent2);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,corp,thickness);
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(6,radius-thickness*.45),null,"rgba(255,255,255,.18)",1);
    }else{
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,radius,null,"rgba(255,255,255,.24)",thickness);
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.max(6,radius-thickness*.45),null,rgba(th.accent2,.25),1);
    }
    ctx.restore();
  }

  function drawLiteNumberBadge(ctx,idx,x,y,size,th){
    const g=ctx.createLinearGradient(x,y,x+size,y+size);
    g.addColorStop(0, th.accent);
    g.addColorStop(1, th.accent2);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,.24)";
    ctx.shadowBlur = Math.round(size*.18);
    fillRoundRect(ctx,x,y,size,size,Math.round(size*.34),g,"rgba(255,255,255,.28)",Math.max(1,Math.round(size*.05)));
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${Math.round(size*.44)}px "Prompt","Noto Sans Thai",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(idx+1), x+size/2, y+size/2+1);
    ctx.restore();
  }

  function drawLogo(ctx,x,y,s){
    if(!state.logo) return false;
    ctx.save();
    ctx.shadowColor="rgba(0,0,0,.28)"; ctx.shadowBlur=Math.max(8,Math.round(s*.18));
    ctx.fillStyle="rgba(255,255,255,.96)"; ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s/2,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+s/2,y+s/2,s*.46,0,Math.PI*2); ctx.clip();
    ctx.drawImage(state.logo,x+s*.04,y+s*.04,s*.92,s*.92);
    ctx.restore();
    return true;
  }
  function fontSizeOf(font){
    const m = String(font||'').match(/(\d+(?:\.\d+)?)px/);
    return m ? Number(m[1]) : 32;
  }
  function fontWithSize(font,size){
    return String(font||'').replace(/(\d+(?:\.\d+)?)px/, Math.round(size)+'px');
  }
  function containsEllipsis(lines){
    return (lines||[]).some(l=>String(l).includes('…'));
  }
  function drawText(ctx,text,x,y,maxW,maxLines,font,color,lineH){
    if(!clean(text)) return 0;
    const startSize=fontSizeOf(font);
    const minSize=Math.max(14, startSize*.68);
    let bestLines=[], bestFont=font, bestLineH=lineH;
    for(let size=startSize; size>=minSize; size-=2){
      const f=fontWithSize(font,size);
      const lh=Math.max(Math.round(lineH*(size/startSize)), Math.round(size*1.16));
      ctx.save();
      ctx.font=f;
      const lines=balancedLines(ctx,text,maxW,maxLines);
      ctx.restore();
      bestLines=lines; bestFont=f; bestLineH=lh;
      if(!containsEllipsis(lines)) break;
    }
    ctx.save();
    ctx.font=bestFont; ctx.fillStyle=color; ctx.textBaseline='top';
    bestLines.forEach((line,i)=>ctx.fillText(line,x,y+i*bestLineH));
    ctx.restore();
    return bestLines.length;
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
    for(let pass=0; pass<5; pass++){
      for(let i=0;i<Math.min(lines.length-1,maxLines-1);i++){
        const a=lines[i], b=lines[i+1];
        if(a.length>1 && lineWidth(ctx,a)>lineWidth(ctx,b)*1.36){ const moved=a[a.length-1]; const next=[moved].concat(b); if(lineWidth(ctx,next)<=maxW){ b.unshift(a.pop()); } }
      }
    }
    let out=lines.slice(0,maxLines).map(a=>clean(a.join("").replace(/\s+/g," ")));
    if(lines.length>maxLines && out.length){ let last=out[out.length-1]; while(ctx.measureText(last+"…").width>maxW && last.length>1) last=last.slice(0,-1); out[out.length-1]=clean(last)+"…"; }
    return out.filter(Boolean);
  }

  function ribbonPath(ctx,x,y,w,h,cut=0.12){
    const notch=Math.round(h*cut);
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+w-notch,y);
    ctx.lineTo(x+w,y+h/2);
    ctx.lineTo(x+w-notch,y+h);
    ctx.lineTo(x,y+h);
    ctx.closePath();
  }
  function drawRibbon(ctx,x,y,w,h,th,mode='accent'){
    ctx.save();
    const g=ctx.createLinearGradient(x,y,x+w,y+h);
    if(mode==='accent'){
      g.addColorStop(0,th.accent);
      g.addColorStop(.65,th.accent2);
      g.addColorStop(1,rgba(th.accent2,.92));
    }else{
      g.addColorStop(0,rgba(th.deep,.98));
      g.addColorStop(1,rgba(th.dark,.96));
    }
    ribbonPath(ctx,x,y,w,h,0.14);
    ctx.fillStyle=g; ctx.fill();
    ctx.lineWidth=Math.max(1,Math.round(h*.05)); ctx.strokeStyle='rgba(255,255,255,.16)'; ctx.stroke();
    ctx.restore();
  }
  function drawInfoPill(ctx,x,y,text,th,icon='•'){
    const label = clean(text);
    if(!label) return 0;
    ctx.save();
    const font=Math.max(26, Math.round((ctx.canvas.height>=1200?0.016:0.018)*ctx.canvas.width));
    ctx.font=`800 ${font}px "Prompt","Noto Sans Thai",sans-serif`;
    const shown=smartShort(label,28);
    const padX=Math.round(font*0.9), padY=Math.round(font*0.56), gap=Math.round(font*0.4);
    const iconW=ctx.measureText(icon).width;
    const textW=ctx.measureText(shown).width;
    const w=textW+iconW+gap+padX*2;
    const h=Math.round(font*2.05);
    const g=ctx.createLinearGradient(x,y,x+w,y);
    g.addColorStop(0,rgba(th.deep,.88));
    g.addColorStop(1,rgba(th.dark,.68));
    fillRoundRect(ctx,x,y,w,h,Math.round(h/2),g,'rgba(255,255,255,.16)',Math.max(1,Math.round(font*.06)));
    ctx.fillStyle='rgba(255,255,255,.96)';
    ctx.textBaseline='middle';
    ctx.fillText(icon, x+padX, y+h/2+1);
    ctx.fillText(shown, x+padX+iconW+gap, y+h/2+1);
    ctx.restore();
    return w;
  }

  function drawCoverFrame(ctx,w,h,d,th){
    const pst=preset(d);
    const land=w>=h;
    const pad=Math.round(Math.min(w,h)*0.03);
    drawAccentSweep(ctx,w,h,th,pst);

    // ─── Strong gradient overlay ที่ด้านล่าง (แบบตัวอย่าง) ───
    const gradH = Math.round(h * (land ? 0.62 : 0.55));
    const grad = ctx.createLinearGradient(0, h - gradH, 0, h);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.35, rgba(th.deep, 0.55));
    grad.addColorStop(0.72, rgba(th.deep, 0.88));
    grad.addColorStop(1, "rgba(0,0,0,0.96)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, h - gradH, w, gradH);

    drawBorderFrame(ctx,w,h,th);

    const brandW=Math.round(w*(land?0.46:0.74));
    const brandH=Math.round(h*(land?0.085:0.068));
    const brandX=pad+Math.round(w*.014);
    const brandY=pad+Math.round(h*.012);
    const brandLabel=hasRealOrg(d.org) ? d.org : '';
    if(brandLabel || state.logo){
      drawRibbon(ctx,brandX,brandY,brandW,brandH,th,'dark');
      const logoS=Math.round(brandH*.92);
      const logoX=brandX-Math.round(logoS*.18);
      const logoY=brandY-Math.round((logoS-brandH)/2);
      const hasLogo=drawLogo(ctx,logoX,logoY,logoS);
      const brandTextX=hasLogo ? logoX+logoS+Math.round(w*.012) : brandX+Math.round(w*.018);
      if(brandLabel) drawText(ctx,brandLabel,brandTextX,brandY+Math.round(brandH*.18),brandW-(brandTextX-brandX)-Math.round(w*.025),2,`900 ${Math.round(Math.min(w,h)*0.022)}px "Prompt","Noto Sans Thai",sans-serif`,'#fff',Math.round(Math.min(w,h)*0.029));
      const orgSub=hasRealOrg(d.org) && d.categoryLabel ? smartShort(d.categoryLabel,26) : (d.place ? smartShort(d.place,24) : '');
      if(orgSub) drawText(ctx,orgSub,brandTextX,brandY+Math.round(brandH*.61),brandW-(brandTextX-brandX)-Math.round(w*.025),1,`800 ${Math.round(Math.min(w,h)*0.015)}px "Noto Sans Thai","Prompt",sans-serif`,'rgba(255,255,255,.84)',Math.round(Math.min(w,h)*0.021));
    }

    const panelX=pad+Math.round(w*.015);
    const panelY=Math.round(h*(land?0.69:0.64));
    const panelW=w-panelX*2;
    const panelH=Math.round(h*(land?0.16:0.19));
    drawGlassPanel(ctx,panelX,panelY,panelW,panelH,Math.round(panelH*.12),th,pst.name==='minimal'?0.58:0.66);
    const panelAccent=ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY);
    panelAccent.addColorStop(0,th.accent2); panelAccent.addColorStop(.6,th.accent); panelAccent.addColorStop(1,'rgba(255,255,255,.12)');
    ctx.fillStyle=panelAccent;
    fillRoundRect(ctx,panelX+Math.round(w*.012),panelY+Math.round(h*.012),panelW-Math.round(w*.024),Math.max(4,Math.round(h*.007)),Math.round(h*.006),panelAccent);

    if(d.categoryLabel){
      const catY=panelY-Math.round(h*.040);
      const catW=Math.min(Math.round(w*.36), Math.round(w*.14)+Math.round(clean(d.categoryLabel).length*16));
      drawRibbon(ctx,panelX+Math.round(w*.006),catY,catW,Math.round(h*.035),th,'accent');
      drawText(ctx, smartShort(d.categoryLabel,32), panelX+Math.round(w*.024), catY+Math.round(h*.006), catW-Math.round(w*.040), 1, `900 ${Math.round(Math.min(w,h)*0.015)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.021));
    }

    const titleX=panelX+Math.round(w*.03);
    const titleW=panelW-Math.round(w*.06);
    const titleY=panelY+Math.round(panelH*.16);
    const titleFont=Math.round(Math.min(w,h)*(land?0.048:0.044)*pst.titleScale);
    const titleLineH=Math.round(titleFont*1.15);
    drawText(ctx, smartShort(d.title,110), titleX, titleY, titleW, land?2:3, `900 ${titleFont}px "Prompt","Kanit","Noto Sans Thai",sans-serif`, '#fff', titleLineH);

    const subText = stripHashtags(d.detail) || stripHashtags(d.footer) || d.place || '';
    const subY=titleY + titleLineH*(land?1.65:1.9);
    if(subText){
      fillRoundRect(ctx,titleX,subY,titleW,Math.round(panelH*.15),Math.round(panelH*.075),rgba(th.accent,.78),'rgba(255,255,255,.12)',1);
      drawText(ctx, smartShort(subText, land?72:52), titleX+Math.round(w*.018), subY+Math.round(panelH*.026), titleW-Math.round(w*.036), 1, `800 ${Math.round(Math.min(w,h)*0.017)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.022));
    }

    const metaY=panelY+panelH-Math.round(panelH*.18);
    let metaX=titleX;
    if(d.dateTime) metaX += drawInfoPill(ctx,metaX,metaY,d.dateTime,th,'🗓') + Math.round(w*.012);
    if(d.place) metaX += drawInfoPill(ctx,metaX,metaY,d.place,th,'📍') + Math.round(w*.012);

    if(pst.showFooterBar && stripHashtags(d.footer)){
      const barH=Math.round(h*(land?0.046:0.043));
      const barY=h-pad-barH;
      drawGlassPanel(ctx,pad+Math.round(w*.012),barY,w-pad*2-Math.round(w*.024),barH,Math.round(barH*.45),th,.72);
      drawText(ctx, smartShort(stripHashtags(d.footer), land?80:60), pad+Math.round(w*.035), barY+Math.round(barH*.22), w-pad*2-Math.round(w*.07), 1, `800 ${Math.round(Math.min(w,h)*0.017)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.022));
    }
  }

  function liteText(d, idx){
    const custom = idx===1 ? d.lite2 : idx===2 ? d.lite3 : idx===3 ? d.lite4 : '';
    if(clean(custom)) return smartShort(stripHashtags(custom), 86);

    const safeDetail = stripHashtags(d.detail);
    const safeFooter = stripHashtags(d.footer);
    const detailShort = smartShort(safeDetail, 86);
    const footerShort = smartShort(safeFooter, 72);

    const meta=[d.dateTime,d.place].filter(Boolean).join(' • ');
    if(idx===1) return detailShort || meta || smartShort(d.title,72);
    if(idx===2) return footerShort || meta || smartShort(d.categoryLabel,72) || smartShort(d.title,72);
    if(idx===3) return meta || detailShort || footerShort || smartShort(d.title,72);
    return footerShort || smartShort(d.categoryLabel,72) || smartShort(d.title,72);
  }
  function drawLiteFrame(ctx,w,h,d,idx,th,profile=slotProfile(idx,d)){
    const pad=Math.round(Math.min(w,h)*0.020);
    const min=Math.min(w,h);
    drawSlotBorderFrame(ctx,w,h,th,"lite");

    // Compact identity corner; one accent only to keep the photo clean.
    ctx.save();
    const corner=ctx.createLinearGradient(w*.82,0,w*.98,h*.12);
    corner.addColorStop(0,rgba(th.accent,.18));
    corner.addColorStop(1,th.accent2);
    ctx.fillStyle=corner;
    ctx.beginPath();
    ctx.moveTo(w*.86,pad);
    ctx.lineTo(w-pad,pad);
    ctx.lineTo(w-pad,h*.11);
    ctx.lineTo(w*.95,h*.06);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if(state.logo){
      const ls=Math.round(min*.09*profile.logoScale);
      drawLogo(ctx,w-pad-ls-Math.round(w*.006),pad+Math.round(h*.012),ls);
    }

    const bottomH=Math.round(h*profile.bottomRatio);
    const x=pad+Math.round(w*.012);
    const y=h-pad-bottomH-Math.round(h*.006);
    const boxW=w-pad*2-Math.round(w*.024);

    const g=ctx.createLinearGradient(x,y,x+boxW,y);
    g.addColorStop(0,rgba(th.deep,.70));
    g.addColorStop(.56,rgba(th.dark,.58));
    g.addColorStop(1,rgba(th.accent,.34));
    fillRoundRect(ctx,x,y,boxW,bottomH,Math.round(bottomH*.30),g,"rgba(255,255,255,.12)",1);

    const line=ctx.createLinearGradient(x,y,x+boxW,y);
    line.addColorStop(0,th.accent2);
    line.addColorStop(.58,rgba(th.accent,.76));
    line.addColorStop(1,"rgba(255,255,255,.10)");
    fillRoundRect(ctx,x+Math.round(w*.018),y+Math.round(bottomH*.10),boxW-Math.round(w*.036),Math.max(2,Math.round(bottomH*.045)),Math.round(bottomH*.025),line,null,0);

    const leftPad=x+Math.round(w*.026);
    const textY=y+Math.round(bottomH*.30);
    drawText(ctx, liteText(d, idx), leftPad, textY, boxW-Math.round(w*.052), 1, `900 ${Math.round(min*0.0175)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(min*0.022));
  }

  function drawAdditionalFrame(ctx,w,h,d,idx,th,profile=slotProfile(idx,d)){
    const pad=Math.round(Math.min(w,h)*0.020);
    const min=Math.min(w,h);
    drawSlotBorderFrame(ctx,w,h,th,"minimal");

    if(state.logo){
      const ls=Math.round(min*.095);
      drawLogo(ctx,w-pad-ls-Math.round(w*.006),pad+Math.round(h*.012),ls);
    }

    const label=liteText(d, idx);
    if(!label) return;
    const boxW=Math.round(w*0.52);
    const boxH=Math.max(Math.round(h*profile.bottomRatio), Math.round(min*0.082));
    const x=pad+Math.round(w*.012);
    const y=h-pad-boxH-Math.round(h*.006);
    const g=ctx.createLinearGradient(x,y,x+boxW,y);
    g.addColorStop(0,rgba(th.deep,.56));
    g.addColorStop(1,rgba(th.dark,.34));
    fillRoundRect(ctx,x,y,boxW,boxH,Math.round(boxH*.40),g,"rgba(255,255,255,.10)",1);

    const line=ctx.createLinearGradient(x,y,x+boxW,y);
    line.addColorStop(0,rgba(th.accent2,.88));
    line.addColorStop(1,rgba(th.accent,.42));
    fillRoundRect(ctx,x+Math.round(w*.018),y+Math.round(boxH*.12),boxW-Math.round(w*.036),Math.max(2,Math.round(boxH*.05)),Math.round(boxH*.025),line,null,0);

    drawText(ctx, smartShort(label,48), x+Math.round(w*.022), y+Math.round(boxH*.30), boxW-Math.round(w*.044), 1, `800 ${Math.round(min*0.016)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(min*0.020));
  }


  function makeImage(file){
    return new Promise((res,rej)=>{
      const img=new Image();
      const url=URL.createObjectURL(file);
      img.onload=()=>{ URL.revokeObjectURL(url); res(img); };
      img.onerror=(error)=>{ URL.revokeObjectURL(url); rej(error); };
      img.src=url;
    });
  }
  function renderSmartChoice(){
    const d=data();
    const note=$('#album-smartChoice');
    if(!note) return;
    if(d.facebookPreset==="auto" && !state.outputs.length){
      note.innerHTML='<b>รูปแบบอัลบั้มอัตโนมัติ</b><span>ระบบจะวิเคราะห์สัดส่วนภาพปกและเลือก Layout เมื่อกดสร้างชุดภาพ</span>';
      note.classList.remove('resolved');
      return;
    }
    const selected=effectiveFacebookPreset(d);
    const source=d.facebookPreset==="auto"?'ระบบวิเคราะห์จากภาพปก':'ผู้ใช้เลือก';
    note.innerHTML=`<b>รูปแบบอัลบั้มที่ใช้</b><span>${facebookPresetLabel(selected)} · ${previewLayoutLabel(presetLayout(selected))} (${source})</span>`;
    note.classList.add('resolved');
  }
  async function resolveSmartSettings(files){
    const d=data();
    if(files[0]){
      const coverImage=await makeImage(files[0]);
      state.resolvedFacebookPreset=resolveFacebookPreset(d.facebookPreset,coverImage.naturalWidth||coverImage.width,coverImage.naturalHeight||coverImage.height);
    }else{
      state.resolvedFacebookPreset=resolveFacebookPreset(d.facebookPreset);
    }
    state.resolvedPreviewLayout=presetLayout(state.resolvedFacebookPreset);
    const coverSize=slotSize(0,d,files.length);
    state.resolvedRatio=`${coverSize.w}x${coverSize.h}`;
    renderSmartChoice();
  }
  function canvasToBlob(canvas){ return new Promise(res=>canvas.toBlob(b=>res(b),"image/jpeg",.92)); }
  async function waitFonts(){ try{ if(document.fonts && document.fonts.ready) await document.fonts.ready; }catch(e){} }

  async function processImage(file,idx,total){
    const d=data(), th=theme(d), profile=slotProfile(idx,d,total), sz=slotSize(idx,d,total);
    const canvas=document.createElement('canvas'); canvas.width=sz.w; canvas.height=sz.h;
    const ctx=canvas.getContext('2d');
    const img=await makeImage(file);
    const enhance=!d.mode.includes('ครอป + ใส่กรอบเท่านั้น');
    const faceFocus=await detectFaceFocus(img);
    coverDraw(img,ctx,sz.w,sz.h,enhance,faceFocus,profile.targetY);
    if(!d.mode.includes('ปรับภาพเท่านั้น')){
      if(profile.role==="cover") drawCoverFrame(ctx,sz.w,sz.h,d,th,profile);
      else if(profile.role==="lite") drawLiteFrame(ctx,sz.w,sz.h,d,idx,th,profile);
      else drawAdditionalFrame(ctx,sz.w,sz.h,d,idx,th,profile);
    }
    const blob=await canvasToBlob(canvas); const url=URL.createObjectURL(blob);
    return {blob,url,role:profile.role,label:profile.label,w:sz.w,h:sz.h,filename:`facebook_album_${String(idx+1).padStart(2,'0')}_${profile.role}_${sz.w}x${sz.h}.jpg`};
  }

  function normalizeFiles(fileList, warn=true, max=4){
    let files=Array.from(fileList||[]).filter(f=>f.type.startsWith('image/'));
    if(files.length>max){ files=files.slice(0,max); if(warn) alert(`ระบบนี้รองรับภาพรองได้สูงสุด ${max} ภาพ จึงเลือกใช้ ${max} ภาพแรกให้โดยอัตโนมัติ`); }
    return files;
  }
  function syncStateFiles(){
    state.files=[state.coverFile, ...state.supportFiles].filter(Boolean);
    return state.files;
  }
  function collectFilesFromInputs(warn=true){
    const coverInput=$('#album-coverFile');
    const supportInput=$('#album-supportFiles');
    state.coverFile = coverInput && coverInput.files && coverInput.files[0] ? coverInput.files[0] : null;
    state.supportFiles = normalizeFiles(supportInput && supportInput.files ? supportInput.files : [], warn, 4);
    return syncStateFiles();
  }

  function renderUploadPreview(){
    const host=$('#album-preview'); if(!host) return;
    syncStateFiles();
    const hasCover=!!state.coverFile;
    const supports=state.supportFiles || [];
    const esc=s=>String(s||'').replace(/"/g,'&quot;').replace(/</g,'&lt;');

    if(!hasCover && !supports.length){
      host.replaceChildren();
      host.hidden=true;
      host.classList.remove('has-slot-strip');
      return;
    }
    host.hidden=false;
    host.classList.add('has-slot-strip');

    const coverCard = hasCover ? `
      <div class="album-slot-card is-cover">
        <span class="slot-badge">ปก</span>
        <div>
          <b title="${esc(state.coverFile.name)}">${esc(state.coverFile.name)}</b>
          <small>Cover</small>
        </div>
      </div>` : `
      <div class="album-slot-card is-empty">
        <span class="slot-badge">ปก</span>
        <div><b>ยังไม่ได้เลือกภาพปก</b><small>จำเป็น</small></div>
      </div>`;

    const supportCards = supports.length ? supports.map((f,i)=>`
      <div class="album-slot-card">
        <span class="slot-badge">${i+2}</span>
        <div>
          <b title="${esc(f.name)}">${esc(f.name)}</b>
          <small>${i<3?'Lite':'Additional'}</small>
        </div>
        <div class="album-order-actions">
          <button type="button" class="album-order-btn" data-album-support-move="up" data-i="${i}" ${i===0?'disabled':''} aria-label="เลื่อนไปก่อนหน้า">←</button>
          <button type="button" class="album-order-btn" data-album-support-move="down" data-i="${i}" ${i===supports.length-1?'disabled':''} aria-label="เลื่อนไปถัดไป">→</button>
        </div>
      </div>`).join('') : `
      <div class="album-slot-card is-empty">
        <span class="slot-badge">2–4</span>
        <div><b>ยังไม่ได้เลือกภาพรอง</b><small>แนะนำ 3–4 ภาพ</small></div>
      </div>`;

    host.innerHTML = `
      <div class="album-sequence-head"><b>ลำดับภาพก่อนสร้าง</b><small>ภาพปกอยู่ใบแรก · ใช้ลูกศรจัดลำดับภาพรอง</small></div>
      <div class="album-slot-strip">
        ${coverCard}
        ${supportCards}
      </div>
    `;
  }

  function captionFacts(d){
    return {
      title: clean(d.title),
      org: hasRealOrg(d.org) ? clean(d.org) : '',
      detail: clean(d.detail),
      dateTime: clean(d.dateTime),
      place: clean(d.place),
      footer: stripHashtags(d.footer),
      providedHashtags: (String(d.footer||'').match(/#[^\s#]+/g)||[]).join(' '),
      category: clean(d.categoryLabel)
    };
  }
  function safeCaptionTag(value){
    return clean(value).replace(/\s+/g,'').replace(/[^ก-๙a-zA-Z0-9_]/g,'').slice(0,42);
  }
  function factGuardCaption(text){
    return String(text||'')
      .split('\n')
      .map(line=>line.trimEnd())
      .filter(line=>line && !/undefined|null|placeholder|กรอกข้อมูล/i.test(line))
      .join('\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim();
  }
  function captionWriter(d,style=d.captionStyle||'pr-ready'){
    const f=captionFacts(d);
    const parts=[];
    const icon=style==='friendly'?'✨':style==='story'?'📷':style==='announcement'?'📣':style==='official'?'📢':'📌';
    if(f.title) parts.push(`${icon} ${f.title}`);

    // ตรวจบริบทองค์กรอัตโนมัติ
    const orgLower=(f.org||'').toLowerCase();
    const isMuni=/เทศบาล|อบต|องค์การบริหาร|อำเภอ|จังหวัด|ราชการ/.test(orgLower);
    const isHealth=/โรงพยาบาล|สาธารณสุข|อนามัย|คลินิก/.test(orgLower);
    const isSchool=/โรงเรียน|มหาวิทยาลัย|วิทยาลัย|ศึกษา/.test(orgLower);
    const isBrand=/ร้าน|บริษัท|ห้าง|เพจ|ครีเอเตอร์/.test(orgLower);

    if(style==='official' || isMuni){
      if(f.org) parts.push(f.org);
      if(f.detail) parts.push(smartShort(f.detail,260));
    }else if(style==='friendly' || isBrand){
      if(f.detail) parts.push(smartShort(f.detail,220));
      if(f.org) parts.push(`— ${f.org}`);
    }else if(style==='story'){
      if(f.detail) parts.push(smartShort(f.detail,280));
      if(f.org) parts.push(f.org);
    }else if(style==='announcement'){
      if(f.org) parts.push(`${f.org} ขอแจ้งข้อมูลให้ผู้ที่เกี่ยวข้องทราบ`);
      if(f.detail) parts.push(smartShort(f.detail,240));
    }else{
      // pr-ready default — ปรับตามบริบทองค์กร
      const prPhrase = isMuni ? 'ขอประชาสัมพันธ์ให้ประชาชนในพื้นที่ทราบ'
        : isHealth ? 'ขอประชาสัมพันธ์ข้อมูลสุขภาพให้ประชาชนทราบ'
        : isSchool ? 'ขอประชาสัมพันธ์ให้นักเรียนและผู้ปกครองทราบ'
        : 'ขอประชาสัมพันธ์ข้อมูลให้ประชาชนและผู้ที่เกี่ยวข้องได้รับทราบ';
      if(f.org) parts.push(`${f.org} ${prPhrase}`);
      if(f.detail) parts.push(smartShort(f.detail,220));
    }

    const meta=[f.dateTime && `📅 ${f.dateTime}`,f.place && `📍 ${f.place}`].filter(Boolean);
    if(meta.length) parts.push(meta.join('\n'));
    if(f.footer) parts.push(f.footer);

    const derivedTags=[safeCaptionTag(f.org),safeCaptionTag(f.category)].filter(Boolean).map(x=>`#${x}`);
    const tags=[f.providedHashtags,...derivedTags].filter(Boolean).join(' ');
    if(tags) parts.push(tags);
    return factGuardCaption(parts.filter(Boolean).join('\n\n'));
  }
  function captionText(d){ return captionWriter(d,d.captionStyle); }

  function renderOutputs(){
    const host=$('#albumResult .ready-main') || $('#albumResult') || $('#albumOutput') || $('#albumPreview'); if(!host) return;
    const caption = state.caption || captionText(data());
    const aspectOf=o=>o&&o.w&&o.h?`${o.w} / ${o.h}`:ratioValue(data());
    const cover = state.outputs[0];
    const lites = state.outputs.slice(1,4);
    const additional = state.outputs.slice(4,5);
    const resolvedPreset=effectiveFacebookPreset(data());
    const resolvedRatio=facebookPresetLabel(resolvedPreset);
    state.resolvedPreviewLayout=presetLayout(resolvedPreset);

    const coverPreview = cover ? `
      <section class="album-preview-section">
        <div class="album-preview-title">
          <b>ภาพปกหลัก</b>
          <span>Cover Frame — ภาพแรกที่ใช้เปิดเรื่อง · ${cover?.w || ''}x${cover?.h || ''}</span>
        </div>
        <div class="album-cover-preview-card">
          <img src="${cover.url}" alt="Cover Preview" style="aspect-ratio:${aspectOf(cover)}">
          <button class="btn secondary album-one-download" data-i="0">ดาวน์โหลดภาพปก</button>
        </div>
      </section>` : '';

    const litePreview = lites.length ? `
      <section class="album-preview-section">
        <div class="album-preview-title">
          <b>ภาพรอง 2–4</b>
          <span>Lite Frame — ขยายเรื่องโดยไม่แย่งภาพหลัก</span>
        </div>
        <div class="album-lite-preview-grid">
          ${lites.map((o,k)=>`
            <div class="album-lite-preview-card">
              <img src="${o.url}" alt="Lite ${k+2}" style="aspect-ratio:${aspectOf(o)}">
              <b>Lite ${k+2} · ${o.w || ''}x${o.h || ''}</b>
              <button class="btn secondary album-one-download" data-i="${k+1}">ดาวน์โหลด</button>
            </div>`).join('')}
        </div>
      </section>` : '';

    const addPreview = additional.length ? `
      <section class="album-preview-section">
        <div class="album-preview-title">
          <b>ภาพเพิ่มเติม</b>
          <span>ภาพเสริมลำดับสุดท้าย</span>
        </div>
        <div class="album-lite-preview-grid album-additional-preview-grid">
          ${additional.map((o,k)=>`
            <div class="album-lite-preview-card">
              <img src="${o.url}" alt="Additional" style="aspect-ratio:${aspectOf(o)}">
              <b>Additional ${k+5} · ${o.w || ''}x${o.h || ''}</b>
              <button class="btn secondary album-one-download" data-i="${k+4}">ดาวน์โหลด</button>
            </div>`).join('')}
        </div>
      </section>` : '';

    host.innerHTML = `
      <div class="album-pro-panel">
        <section class="album-preview-section album-post-first">
          <div class="album-preview-title">
            <div>
              <b>ตัวอย่างโพสต์ Facebook</b>
              <p>ดูภาพรวมเหมือนโพสต์จริงก่อนดาวน์โหลด</p>
            </div>
            <span class="album-ready-badge">${state.outputs.length} ภาพ · ${resolvedRatio}</span>
          </div>
          <div class="album-post-actions">
            <button class="btn primary" id="albumCopyCaptionQuick">คัดลอกแคปชั่น</button>
            <button class="btn secondary" id="albumDownloadAllResult">ดาวน์โหลด ZIP</button>
          </div>
          <div id="albumFacebookPreview"></div>

          <!-- ── IMAGE ADJUST PANEL v9.5 ── -->
          <details class="album-review-details" id="albumAdjustPanel">
            <summary>
              <span><b>🎨 ปรับแสง / สี / ความคมชัด</b><small>ปรับทุกภาพพร้อมกัน — ไม่เปลี่ยนหน้าตาหรือโครงสร้างภาพ</small></span>
            </summary>
            <div class="album-adjust-box">
              <div class="adjust-row"><label>ความสว่าง<span id="brightnessVal">0</span></label><input type="range" id="adj-brightness" min="-100" max="100" value="0" class="adjust-slider"></div>
              <div class="adjust-row"><label>คอนทราสต์<span id="contrastVal">0</span></label><input type="range" id="adj-contrast" min="-100" max="100" value="0" class="adjust-slider"></div>
              <div class="adjust-row"><label>ความอิ่มสี<span id="saturationVal">0</span></label><input type="range" id="adj-saturation" min="-100" max="100" value="0" class="adjust-slider"></div>
              <div class="adjust-row"><label>ความคมชัด<span id="sharpnessVal">0</span></label><input type="range" id="adj-sharpness" min="0" max="10" value="0" class="adjust-slider"></div>
              <div class="adjust-row"><label>อุณหภูมิสี<span id="warmthVal">0</span></label><input type="range" id="adj-warmth" min="-50" max="50" value="0" class="adjust-slider"></div>
              <div class="adjust-actions">
                <button class="btn primary" id="applyAdjust">✓ ใช้การปรับ + ดาวน์โหลดใหม่</button>
                <button class="btn secondary" id="resetAdjust">↺ รีเซ็ต</button>
              </div>
              <p class="adjust-note">การปรับนี้ไม่เปลี่ยนใบหน้า เนื้อหา หรือโครงสร้างภาพ — แค่ปรับค่าสีและแสงเท่านั้น</p>
            </div>
          </details>
        </section>

        <details class="album-review-details album-caption-edit-details">
          <summary>
            <span><b>แก้ไขแคปชั่นโพสต์</b><small>Caption Writer + Fact Guard · พิมพ์แล้วตัวอย่างด้านบนจะเปลี่ยนทันที</small></span>
          </summary>
          <div class="album-caption-box">
            <textarea id="albumCaptionText" rows="7">${caption.replace(/</g,'&lt;')}</textarea>
            <div class="album-caption-actions">
              <button class="btn primary" id="albumCopyCaption">คัดลอกแคปชั่น</button>
              <button class="btn secondary" id="albumRefreshPreview">อัปเดตตัวอย่าง</button>
            </div>
          </div>
        </details>

        <details class="album-review-details">
          <summary>
            <span><b>ตรวจภาพรายใบและดาวน์โหลดแยก</b><small>ภาพปก 1 ภาพ · ภาพรอง ${lites.length} ภาพ${additional.length ? ` · ภาพเพิ่มเติม ${additional.length} ภาพ` : ''}</small></span>
          </summary>
          <div class="album-individual-review">
            ${coverPreview}
            ${litePreview}
            ${addPreview}
          </div>
        </details>
      </div>`;
    renderFacebookPreview();
  }

  function renderFacebookPreview(){
    const host=$('#albumFacebookPreview'); if(!host) return;
    const imgs=state.outputs.slice(0,4); const total=state.outputs.length;
    const countClass=imgs.length<=1?'one':imgs.length===2?'two':imgs.length===3?'three':'four';
    const preset=effectiveFacebookPreset(data());
    const layout=presetLayout(preset);
    state.resolvedPreviewLayout=layout;
    const captionEl=$('#albumCaptionText'); const caption=captionEl?captionEl.value:state.caption;
    const pageName = hasRealOrg(data().org) ? data().org : 'ชื่อเพจของคุณ';
    const cells=imgs.map((o,i)=>`<div class="fb-preview-cell fb-slot-${o.role || slotRole(i)}"><img src="${o.url}" alt="">${(total>4 && i===3)?`<span class="fb-preview-more">+${total-4}</span>`:''}</div>`).join('');
    host.innerHTML=`
      <div class="fb-preview-card">
        <div class="fb-preview-head">
          <div class="fb-preview-avatar">${state.logo?'<img style="width:100%;height:100%;object-fit:cover;border-radius:50%" src="'+state.logo.src+'">':'เพจ'}</div>
          <div><div class="fb-preview-name">${pageName.replace(/</g,'&lt;')}</div><div class="fb-preview-time">เมื่อสักครู่ · 🌐</div></div>
        </div>
        <div class="fb-preview-caption">${String(caption||'').replace(/</g,'&lt;').replace(/\n/g,'<br>')}</div>
        <div class="fb-preview-grid ${countClass} ${layout}">${cells}</div>
        <div class="fb-preview-foot">จำลองจากขนาดไฟล์จริง · ${facebookPresetLabel(preset)} · ${previewLayoutLabel(layout)}</div>
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
  function moveSupport(i,dir){ const j=dir==='up'?i-1:i+1; if(j<0 || j>=state.supportFiles.length) return; const copy=state.supportFiles.slice(); [copy[i],copy[j]]=[copy[j],copy[i]]; state.supportFiles=copy; syncStateFiles(); renderUploadPreview(); }
  function syncPresetButtons(){
    const selected=val('album-facebookPreset','auto');
    $$('[data-album-preset]').forEach(btn=>btn.classList.toggle('selected',btn.dataset.albumPreset===selected));
  }

  async function generate(){
    if(window.TANJAI && TANJAI.proofread && typeof TANJAI.proofread.runActive === 'function') TANJAI.proofread.runActive(false);
    let files=syncStateFiles();
    if(!files.length) files=collectFilesFromInputs(false);
    if(!val('album-title','')) return alert('กรุณากรอกหัวข้องานสำหรับ Cover Frame');
    if(!state.coverFile) return alert('กรุณาเลือกภาพหน้าปกหลัก 1 ภาพ');
    if(files.length > 5) files=files.slice(0,5);
    state.files=files;
    state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[];
    const btn=$('#makeAlbum'); const old=btn?btn.textContent:''; if(btn){ btn.disabled=true; btn.textContent='กำลังสร้างชุดภาพ...'; }
    // แสดง progress bar
    let progressEl=$('#albumProgress');
    if(!progressEl){
      progressEl=document.createElement('div');
      progressEl.id='albumProgress';
      progressEl.className='album-progress-bar-wrap';
      progressEl.innerHTML='<div class="album-progress-bar" id="albumProgressInner"></div><small id="albumProgressLabel">เริ่มต้น...</small>';
      const resultHost=$('#albumResult');
      if(resultHost) resultHost.prepend(progressEl);
    }
    progressEl.style.display='block';
    const setProgress=(n,total,label)=>{
      const pct=Math.round((n/total)*100);
      const inner=$('#albumProgressInner');
      const lbl=$('#albumProgressLabel');
      if(inner) inner.style.width=pct+'%';
      if(lbl) lbl.textContent=label||`กำลังประมวลผลภาพที่ ${n}/${total}...`;
    };
    try{
      await waitFonts();
      await resolveSmartSettings(files);
      setProgress(0,files.length,'โหลดโลโก้และตั้งค่า...');
      const logoInput=$('#album-logoFile'); if(logoInput && logoInput.files && logoInput.files[0]) await loadLogo(logoInput.files[0]); else state.logo=null;
      for(let i=0;i<files.length;i++){
        setProgress(i,files.length,`ประมวลผลภาพที่ ${i+1}/${files.length}...`);
        state.outputs.push(await processImage(files[i],i,files.length));
      }
      setProgress(files.length,files.length,'สร้างแคปชั่น...');
      state.caption=captionText(data());
      renderOutputs();
      setProgress(files.length,files.length,'เสร็จแล้ว ✓');
      setTimeout(()=>{ if(progressEl) progressEl.style.display='none'; },1800);
    } finally { if(btn){ btn.disabled=false; btn.textContent=old || 'สร้างชุดภาพ'; } }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    ensureAlbumInputs();
    collectFilesFromInputs(false);
    renderUploadPreview();
    syncPresetButtons();
    document.addEventListener('click',(e)=>{
      const presetButton=e.target && e.target.closest ? e.target.closest('[data-album-preset]') : null;
      if(presetButton){
        e.preventDefault();
        const select=$('#album-facebookPreset');
        if(select){ select.value=presetButton.dataset.albumPreset || 'auto'; syncPresetButtons(); select.dispatchEvent(new Event('change',{bubbles:true})); }
        return;
      }
      // Frame picker cards
      const frameCard=e.target && e.target.closest ? e.target.closest('.frame-card') : null;
      if(frameCard){
        e.preventDefault();
        $$('.frame-card').forEach(b=>b.classList.remove('selected'));
        frameCard.classList.add('selected');
        const sel=$('#album-proFrame');
        if(sel) sel.value=frameCard.dataset.frame||'Balanced Ribbon';
        return;
      }
      const id=e.target && e.target.id;
      if(id==='makeAlbum'){ e.preventDefault(); generate(); }
      if(id==='albumDownloadAll' || id==='albumDownloadAllTop' || id==='albumDownloadAllResult'){ e.preventDefault(); downloadAll(); }
      if(id==='albumClear' || id==='albumClearTop'){
        e.preventDefault();
        state.outputs.forEach(o=>URL.revokeObjectURL(o.url));
        state.outputs=[]; state.files=[]; state.coverFile=null; state.supportFiles=[]; state.logo=null; state.resolvedRatio='1080x800'; state.resolvedPreviewLayout='cover-top'; state.resolvedFacebookPreset='wide-top';
        const coverInp=$('#album-coverFile'); if(coverInp) coverInp.value='';
        const supportInp=$('#album-supportFiles'); if(supportInp) supportInp.value='';
        const logoInp=$('#album-logoFile'); if(logoInp) logoInp.value='';
        renderUploadPreview();
        const smart=$('#album-smartChoice'); if(smart){ smart.textContent='ระบบจะสรุปขนาดและรูปแบบพรีวิวที่เลือกให้อีกครั้งหลังสร้างชุดภาพ'; smart.classList.remove('resolved'); }
        const host=$('#albumResult .ready-main') || $('#albumResult'); if(host) host.innerHTML='';
        const prog=$('#albumProgress'); if(prog) prog.style.display='none';
      }
      if(id==='albumCopyCaption' || id==='albumCopyCaptionQuick'){ e.preventDefault(); const t=$('#albumCaptionText'); const value=t?t.value:state.caption; if(value){ navigator.clipboard?.writeText(value); const old=e.target.textContent; e.target.textContent='คัดลอกแล้ว ✓'; setTimeout(()=>e.target.textContent=old || 'คัดลอกแคปชั่น',1400); } }
      if(id==='albumRefreshPreview'){ e.preventDefault(); renderFacebookPreview(); }
      if(e.target && e.target.classList.contains('album-one-download')) downloadOne(Number(e.target.dataset.i||0));
      const move=e.target && e.target.dataset && e.target.dataset.albumSupportMove; if(move){ e.preventDefault(); moveSupport(Number(e.target.dataset.i||0), move); }
    });
    // Touch swipe ordering บนมือถือ
    let touchStartX=0, touchEl=null;
    document.addEventListener('touchstart',(e)=>{
      const btn=e.target && e.target.closest ? e.target.closest('[data-album-support-move]') : null;
      if(btn){ touchStartX=e.touches[0].clientX; touchEl=btn; }
    },{passive:true});
    document.addEventListener('touchend',(e)=>{
      if(!touchEl) return;
      const dx=e.changedTouches[0].clientX - touchStartX;
      if(Math.abs(dx)>40){
        const dir=dx<0?'down':'up';
        const i=Number(touchEl.closest('[data-i]')?.dataset.i||touchEl.dataset.i||0);
        moveSupport(i,dir);
      }
      touchEl=null;
    },{passive:true});
    document.addEventListener('change',(e)=>{
      if(e.target && (e.target.id==='album-coverFile' || e.target.id==='album-supportFiles')){ collectFilesFromInputs(true); renderUploadPreview(); }
      if(e.target && e.target.id==='album-facebookPreset'){
        state.resolvedFacebookPreset=resolveFacebookPreset(e.target.value);
        state.resolvedPreviewLayout=presetLayout(state.resolvedFacebookPreset);
        syncPresetButtons();
        renderSmartChoice();
        if(state.outputs.length) generate();
      }
      if(e.target && e.target.id==='album-captionStyle' && state.outputs.length){ state.caption=captionText(data()); renderOutputs(); }
    });
    document.addEventListener('input',(e)=>{
      if(e.target && e.target.id==='albumCaptionText') renderFacebookPreview();
    });
  });
  window.TANJAI_ALBUM_PRO={
    generate,downloadAll,renderFacebookPreview,renderUploadPreview,collectFilesFromInputs,
    _test:{cropPlacement,liteText,theme,size,resolveRatioFromDimensions,previewLayoutFor,resolveFacebookPreset,presetLayout,facebookPresetLabel,slotSize,captionFacts,captionWriter,factGuardCaption}
  };
})();

/* ── IMAGE ADJUST ENGINE v9.5 ──
   ปรับแสง/สี/คมชัดด้วย Canvas — ไม่แตะโครงสร้างภาพเลย */
(function initAdjust(){
  let adjustHandlerReady=false;
  function setupAdjust(){
    if(adjustHandlerReady) return;
    const sliders=['brightness','contrast','saturation','sharpness','warmth'];
    sliders.forEach(s=>{
      const el=document.getElementById('adj-'+s);
      const val=document.getElementById(s+'Val');
      if(el&&val){ el.addEventListener('input',()=>{ val.textContent=el.value; }); }
    });
    document.getElementById('resetAdjust')?.addEventListener('click',()=>{
      sliders.forEach(s=>{ const el=document.getElementById('adj-'+s); if(el){ el.value=0; const v=document.getElementById(s+'Val'); if(v) v.textContent=0; } });
    });
    document.getElementById('applyAdjust')?.addEventListener('click',async()=>{
      if(!window.albumState||!window.albumState.outputs||!window.albumState.outputs.length){
        alert('กรุณาสร้างชุดภาพก่อนครับ'); return;
      }
      const btn=document.getElementById('applyAdjust');
      if(btn){ btn.disabled=true; btn.textContent='กำลังปรับ...'; }
      const brightness=Number(document.getElementById('adj-brightness')?.value||0);
      const contrast=Number(document.getElementById('adj-contrast')?.value||0);
      const saturation=Number(document.getElementById('adj-saturation')?.value||0);
      const sharpness=Number(document.getElementById('adj-sharpness')?.value||0);
      const warmth=Number(document.getElementById('adj-warmth')?.value||0);

      const JSZip=window.JSZip;
      const zip=JSZip?new JSZip():null;

      for(let i=0;i<window.albumState.outputs.length;i++){
        const out=window.albumState.outputs[i];
        const img=new Image();
        img.crossOrigin='anonymous';
        await new Promise(res=>{ img.onload=res; img.onerror=res; img.src=out.url; });
        const canvas=document.createElement('canvas');
        canvas.width=img.width||1080; canvas.height=img.height||1080;
        const ctx=canvas.getContext('2d');

        // วาดภาพต้นฉบับ
        ctx.drawImage(img,0,0);

        // ดึง pixel data มาปรับ
        const id=ctx.getImageData(0,0,canvas.width,canvas.height);
        const d=id.data;
        const bAdj=brightness/100; const cAdj=(contrast+100)/100;
        const sAdj=(saturation+100)/100; const wAdj=warmth/100;

        for(let p=0;p<d.length;p+=4){
          let r=d[p],g=d[p+1],b=d[p+2];
          // brightness
          r+=brightness*2.55; g+=brightness*2.55; b+=brightness*2.55;
          // warmth (เพิ่ม R ลด B)
          r+=warmth*1.5; b-=warmth*1.5;
          // contrast
          r=((r/255-0.5)*cAdj+0.5)*255;
          g=((g/255-0.5)*cAdj+0.5)*255;
          b=((b/255-0.5)*cAdj+0.5)*255;
          // saturation (HSL approximation)
          const gray=0.299*r+0.587*g+0.114*b;
          r=gray+(r-gray)*sAdj; g=gray+(g-gray)*sAdj; b=gray+(b-gray)*sAdj;
          // clamp
          d[p]=Math.min(255,Math.max(0,r));
          d[p+1]=Math.min(255,Math.max(0,g));
          d[p+2]=Math.min(255,Math.max(0,b));
        }
        ctx.putImageData(id,0,0);

        // sharpness (unsharp mask เบา ๆ)
        if(sharpness>0){
          const tmp=document.createElement('canvas');
          tmp.width=canvas.width; tmp.height=canvas.height;
          const tCtx=tmp.getContext('2d');
          tCtx.filter=`blur(${sharpness*0.3}px)`;
          tCtx.drawImage(canvas,0,0);
          const sharp=ctx.getImageData(0,0,canvas.width,canvas.height);
          const blurData=tCtx.getImageData(0,0,canvas.width,canvas.height).data;
          const sd=sharp.data; const amount=sharpness*0.15;
          for(let p=0;p<sd.length;p+=4){
            sd[p]=Math.min(255,Math.max(0,sd[p]+amount*(sd[p]-blurData[p])));
            sd[p+1]=Math.min(255,Math.max(0,sd[p+1]+amount*(sd[p+1]-blurData[p+1])));
            sd[p+2]=Math.min(255,Math.max(0,sd[p+2]+amount*(sd[p+2]-blurData[p+2])));
          }
          ctx.putImageData(sharp,0,0);
        }

        const blob=await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.92));
        const url=URL.createObjectURL(blob);
        // ดาวน์โหลดทีละไฟล์ถ้าไม่มี JSZip
        if(!zip){
          const a=document.createElement('a'); a.href=url;
          a.download=out.filename||`adjusted-${i+1}.jpg`; a.click();
          await new Promise(r=>setTimeout(r,300));
        } else {
          const ab=await blob.arrayBuffer();
          zip.file(out.filename||`adjusted-${i+1}.jpg`,ab);
        }
      }
      if(zip){
        const content=await zip.generateAsync({type:'blob'});
        const a=document.createElement('a'); a.href=URL.createObjectURL(content);
        a.download='adjusted-album.zip'; a.click();
      }
      if(btn){ btn.disabled=false; btn.textContent='✓ ใช้การปรับ + ดาวน์โหลดใหม่'; }
    });
    adjustHandlerReady=true;
  }
  // เรียกใช้เมื่อ album result แสดง
  const obs=new MutationObserver(()=>{ if(document.getElementById('albumAdjustPanel')) setupAdjust(); });
  obs.observe(document.body,{childList:true,subtree:true});
})();

/* ══════════════════════════════════════════════════════
   COLLAGE BUILDER v9.5 — รวมภาพเป็นไฟล์เดียว
   รองรับ: 2x2 | 1+3 | 1+2 | แถบยาว | 2 แนวนอน
══════════════════════════════════════════════════════ */
(function initCollage(){

  const LAYOUTS = [
    { id:"grid2x2",  label:"2×2",         icon:"▪▪\n▪▪", desc:"ตาราง 4 ช่อง เท่ากัน",   min:4, max:4, fn:buildGrid2x2  },
    { id:"big1+3",   label:"ใหญ่+3เล็ก",  icon:"█▪\n█▪\n█▪",desc:"ปกใหญ่ซ้าย เล็ก 3 ขวา", min:2, max:4, fn:buildBig1Plus3 },
    { id:"big1top3", label:"บน+3ล่าง",    icon:"████\n▪▪▪",  desc:"ปกบน เล็ก 3 ล่าง",      min:2, max:4, fn:buildTop1Bot3  },
    { id:"pair",     label:"คู่",          icon:"▪▪",         desc:"2 รูปเคียงกัน",          min:2, max:2, fn:buildPair      },
    { id:"strip",    label:"แถบยาว",       icon:"▪▪▪▪",       desc:"3–5 รูปแนวนอน",         min:2, max:5, fn:buildStrip     },
  ];

  function gap(){ return 8; }

  async function loadImg(url){
    return new Promise((res,rej)=>{
      const i=new Image(); i.crossOrigin="anonymous";
      i.onload=()=>res(i); i.onerror=rej; i.src=url;
    });
  }

  function cover(ctx, img, x, y, w, h){
    const ir=img.width/img.height, fr=w/h;
    let sw,sh,sx,sy;
    if(ir>fr){ sh=img.height; sw=sh*fr; sx=(img.width-sw)/2; sy=0; }
    else{ sw=img.width; sh=sw/fr; sx=0; sy=(img.height-sh)/2; }
    ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
  }

  function buildGrid2x2(imgs, size=1080){
    const c=document.createElement("canvas"); c.width=size; c.height=size;
    const ctx=c.getContext("2d"); const g=gap(), half=(size-g*3)/2;
    const pos=[[g,g],[g*2+half,g],[g,g*2+half],[g*2+half,g*2+half]];
    imgs.slice(0,4).forEach((img,i)=>{ cover(ctx,img,pos[i][0],pos[i][1],half,half); });
    return c;
  }

  function buildBig1Plus3(imgs, size=1080){
    const c=document.createElement("canvas"); c.width=size; c.height=size;
    const ctx=c.getContext("2d"); const g=gap();
    const bigW=Math.round(size*0.62), smallW=size-bigW-g*2;
    const smallH=Math.round((size-g*4)/3);
    cover(ctx,imgs[0],g,g,bigW-g,size-g*2);
    [1,2,3].forEach((n,i)=>{ if(imgs[n]) cover(ctx,imgs[n],bigW+g,g+i*(smallH+g),smallW,smallH); });
    return c;
  }

  function buildTop1Bot3(imgs, size=1080){
    const c=document.createElement("canvas"); c.width=size; c.height=size;
    const ctx=c.getContext("2d"); const g=gap();
    const topH=Math.round(size*0.58), botH=size-topH-g*2;
    const botW=Math.round((size-g*4)/3);
    cover(ctx,imgs[0],g,g,size-g*2,topH-g);
    [1,2,3].forEach((n,i)=>{ if(imgs[n]) cover(ctx,imgs[n],g+i*(botW+g),topH+g,botW,botH); });
    return c;
  }

  function buildPair(imgs, size=1080){
    const c=document.createElement("canvas"); c.width=size; c.height=Math.round(size*0.52);
    const ctx=c.getContext("2d"); const g=gap(), half=(size-g*3)/2;
    cover(ctx,imgs[0],g,g,half,c.height-g*2);
    if(imgs[1]) cover(ctx,imgs[1],g*2+half,g,half,c.height-g*2);
    return c;
  }

  function buildStrip(imgs, size=1080){
    const n=Math.min(imgs.length,5); const g=gap();
    const w=Math.round((size-g*(n+1))/n), h=Math.round(w*0.72);
    const c=document.createElement("canvas"); c.width=size; c.height=h+g*2;
    const ctx=c.getContext("2d");
    imgs.slice(0,n).forEach((img,i)=>cover(ctx,img,g+i*(w+g),g,w,h));
    return c;
  }

  function addLogoOverlay(canvas, logo, pos="br"){
    if(!logo) return;
    const ctx=canvas.getContext("2d");
    const s=Math.round(Math.min(canvas.width,canvas.height)*0.09);
    const pad=Math.round(s*0.3);
    let x,y;
    if(pos==="br"){ x=canvas.width-s-pad; y=canvas.height-s-pad; }
    else if(pos==="bl"){ x=pad; y=canvas.height-s-pad; }
    else if(pos==="tr"){ x=canvas.width-s-pad; y=pad; }
    else{ x=pad; y=pad; }
    ctx.save();
    ctx.globalAlpha=0.82;
    ctx.drawImage(logo,x,y,s,s);
    ctx.restore();
  }

  /* UI */
  function showCollageUI(){
    if(document.getElementById("collageSection")) return;
    const outputs=window.albumState?.outputs||[];
    if(!outputs.length){ alert("กรุณาสร้างชุดภาพก่อนครับ"); return; }

    const sec=document.createElement("div");
    sec.id="collageSection";
    sec.className="collage-section";
    sec.innerHTML=`
      <div class="collage-header">
        <span>🖼️</span>
        <div><b>สร้าง Collage — รวมภาพเป็น 1 ไฟล์</b><small>เลือก Layout แล้วกดสร้าง</small></div>
      </div>
      <div class="collage-layouts">
        ${LAYOUTS.map(l=>`
          <button class="collage-layout-btn" data-layout="${l.id}" title="${l.desc}">
            <span class="collage-icon">${l.icon}</span>
            <b>${l.label}</b>
            <small>${l.desc}</small>
          </button>`).join("")}
      </div>
      <div class="collage-options">
        <label><input type="checkbox" id="collage-logo" checked> ใส่โลโก้มุมภาพ</label>
        <select id="collage-logo-pos">
          <option value="br">มุมขวาล่าง</option>
          <option value="bl">มุมซ้ายล่าง</option>
          <option value="tr">มุมขวาบน</option>
          <option value="tl">มุมซ้ายบน</option>
        </select>
      </div>
      <div id="collagePreview" class="collage-preview" style="display:none">
        <img id="collagePreviewImg" style="width:100%;border-radius:10px" alt="Collage preview">
        <div class="collage-dl-row">
          <button class="btn primary" id="collageDownload">⬇ ดาวน์โหลด Collage</button>
          <button class="btn secondary" id="collageClear">✕ ปิด</button>
        </div>
      </div>`;

    const host=document.getElementById("albumResult")||document.body;
    host.appendChild(sec);

    let activeLayout=null, activeCanvas=null;

    sec.querySelectorAll(".collage-layout-btn").forEach(btn=>{
      btn.addEventListener("click", async()=>{
        sec.querySelectorAll(".collage-layout-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        activeLayout=btn.dataset.layout;
        await renderCollage();
      });
    });

    document.getElementById("collage-logo")?.addEventListener("change", async()=>{ if(activeLayout) await renderCollage(); });
    document.getElementById("collage-logo-pos")?.addEventListener("change", async()=>{ if(activeLayout) await renderCollage(); });

    async function renderCollage(){
      const layDef=LAYOUTS.find(l=>l.id===activeLayout);
      if(!layDef) return;
      const imgs=[];
      for(const o of outputs.slice(0,layDef.max)){
        try{ imgs.push(await loadImg(o.url)); }catch(_){}
      }
      if(imgs.length<layDef.min){
        alert(`Layout นี้ต้องการภาพอย่างน้อย ${layDef.min} รูปครับ`); return;
      }
      const canvas=layDef.fn(imgs);
      const useLogo=document.getElementById("collage-logo")?.checked;
      const logoPos=document.getElementById("collage-logo-pos")?.value||"br";
      if(useLogo && window.albumState?.logo) addLogoOverlay(canvas,window.albumState.logo,logoPos);
      activeCanvas=canvas;
      const preview=document.getElementById("collagePreview");
      const img=document.getElementById("collagePreviewImg");
      img.src=canvas.toDataURL("image/jpeg",0.92);
      preview.style.display="block";
      document.getElementById("collageDownload").onclick=()=>{
        canvas.toBlob(blob=>{ const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="collage.jpg"; a.click(); },"image/jpeg",0.92);
      };
      document.getElementById("collageClear").onclick=()=>{ sec.remove(); };
    }
  }

  // ปุ่มเรียก Collage — inject หลัง renderOutputs
  const origRender=window.TANJAI_ALBUM_RENDER;
  function injectCollageBtn(){
    if(document.getElementById("openCollageBtn")) return;
    const host=document.getElementById("albumResult");
    if(!host) return;
    const wrap=document.createElement("div");
    wrap.style.cssText="margin-top:12px;text-align:center";
    wrap.innerHTML=`<button class="btn secondary" id="openCollageBtn" style="width:100%">🖼️ สร้าง Collage — รวมภาพเป็น 1 ไฟล์</button>`;
    host.appendChild(wrap);
    document.getElementById("openCollageBtn")?.addEventListener("click",showCollageUI);
  }

  const obs=new MutationObserver(()=>{ 
    if(document.querySelector(".album-cover-preview-card,.album-lite-preview-grid")) injectCollageBtn(); 
  });
  obs.observe(document.body,{childList:true,subtree:true});

})();

/* ══════════════════════════════════════════════════════════
   PANORAMA SPLIT v9.5 — รูปเดียวตัดเป็น 4 ส่วน
   อัปขึ้น Facebook เรียงตามลำดับ → ต่อเป็นภาพเดียวไร้รอยต่อ
══════════════════════════════════════════════════════════ */
(function initPanorama(){

  function showPanoramaUI(){
    if(document.getElementById("panoramaSection")) return;

    const sec = document.createElement("div");
    sec.id = "panoramaSection";
    sec.className = "collage-section";
    sec.style.marginTop = "12px";
    sec.innerHTML = `
      <div class="collage-header">
        <span>🌅</span>
        <div>
          <b>Panorama Split — ตัดรูปเดียวเป็น 4 ส่วน</b>
          <small>อัปทั้ง 4 ส่วนขึ้น Facebook ตามลำดับ → ต่อกันเป็นภาพเดียวไร้รอยต่อ</small>
        </div>
      </div>

      <div class="pano-upload-wrap">
        <label class="pano-upload-label" for="panoInput">
          <span>📷 เลือกรูปภาพที่ต้องการตัด</span>
          <small>รองรับทุกขนาด — แนะนำรูปแนวนอน (wide) เพื่อผลลัพธ์สวยที่สุด</small>
          <input type="file" id="panoInput" accept="image/*" style="display:none">
        </label>
      </div>

      <div class="pano-mode-wrap">
        <p style="font-size:12px;color:var(--muted);margin-bottom:8px">เลือกแบบการตัด:</p>
        <div class="pano-modes">
          <button class="pano-mode-btn active" data-mode="h4" title="ตัดแนวนอน 4 ส่วน — เหมาะกับรูปกว้างมาก">
            <span class="pano-mode-icon">▪▪▪▪</span>
            <b>แนวนอน ×4</b><small>กว้างมาก → 4 ส่วนเรียงบน-ล่าง</small>
          </button>
          <button class="pano-mode-btn" data-mode="grid4" title="ตัด 2×2 — เหมาะกับรูปสี่เหลี่ยมจัตุรัส">
            <span class="pano-mode-icon">▪▪<br>▪▪</span>
            <b>ตาราง 2×2</b><small>ตัด 4 มุม → เรียง TL TR BL BR</small>
          </button>
          <button class="pano-mode-btn" data-mode="h2" title="ตัด 2 ส่วน — ซ้าย-ขวา">
            <span class="pano-mode-icon">▪▪</span>
            <b>แนวนอน ×2</b><small>ซ้าย-ขวา 2 ส่วน</small>
          </button>
        </div>
      </div>

      <div id="panoPreviewWrap" style="display:none">
        <p style="font-size:12px;color:var(--muted);margin:10px 0 6px">
          ตัวอย่าง — อัปไฟล์ขึ้น Facebook <b style="color:var(--accent)">ตามลำดับหมายเลข</b>:
        </p>
        <div id="panoPreviewGrid" class="pano-preview-grid"></div>
        <button class="btn primary" id="panoDownloadAll" style="width:100%;margin-top:12px">
          ⬇ ดาวน์โหลดทั้งหมด (ZIP พร้อมหมายเลข)
        </button>
        <div class="pano-tip">
          💡 <b>วิธีโพสต์ Facebook:</b> กด "อัปโหลดรูปภาพ" แล้วเลือกทั้ง 4 ไฟล์พร้อมกัน Facebook จะเรียงตาม<b>ชื่อไฟล์</b> (1→2→3→4) ภาพจะต่อกันสวยงาม
        </div>
      </div>

      <div id="panoStatus" style="font-size:12px;color:var(--muted);margin-top:8px"></div>
    `;

    const host = document.getElementById("albumResult") || document.body;
    host.appendChild(sec);

    let currentMode = "h4";
    let currentImg = null;

    // mode select
    sec.querySelectorAll(".pano-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sec.querySelectorAll(".pano-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentMode = btn.dataset.mode;
        if(currentImg) splitAndPreview(currentImg);
      });
    });

    // file input
    const label = sec.querySelector(".pano-upload-label");
    const inp = sec.querySelector("#panoInput");
    label.addEventListener("click", () => inp.click());
    inp.addEventListener("change", e => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => { currentImg = img; splitAndPreview(img); };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

    function splitAndPreview(img){
      const status = document.getElementById("panoStatus");
      status.textContent = "กำลังตัดภาพ...";
      const parts = splitImage(img, currentMode);
      const grid = document.getElementById("panoPreviewGrid");
      grid.innerHTML = "";
      grid.className = `pano-preview-grid pano-grid-${parts.length}`;
      parts.forEach((canvas, i) => {
        const wrap = document.createElement("div");
        wrap.className = "pano-part";
        const num = document.createElement("span");
        num.className = "pano-num";
        num.textContent = i + 1;
        const preview = document.createElement("img");
        preview.src = canvas.toDataURL("image/jpeg", 0.9);
        preview.style.cssText = "width:100%;border-radius:6px;display:block";
        wrap.appendChild(num);
        wrap.appendChild(preview);
        grid.appendChild(wrap);
      });
      document.getElementById("panoPreviewWrap").style.display = "block";
      status.textContent = `ตัดเสร็จ ${parts.length} ส่วน — พร้อมดาวน์โหลด`;

      // download handler
      document.getElementById("panoDownloadAll").onclick = async () => {
        const parts2 = splitImage(img, currentMode);
        if(window.JSZip){
          const zip = new window.JSZip();
          for(let i=0;i<parts2.length;i++){
            const blob = await new Promise(res => parts2[i].toBlob(res,"image/jpeg",0.92));
            zip.file(`panorama-${i+1}-of-${parts2.length}.jpg`, await blob.arrayBuffer());
          }
          const content = await zip.generateAsync({type:"blob"});
          const a = document.createElement("a"); a.href = URL.createObjectURL(content);
          a.download = "panorama-split.zip"; a.click();
        } else {
          // ดาวน์โหลดทีละไฟล์
          for(let i=0;i<parts2.length;i++){
            const a = document.createElement("a");
            a.href = parts2[i].toDataURL("image/jpeg",0.92);
            a.download = `panorama-${i+1}-of-${parts2.length}.jpg`;
            a.click();
            await new Promise(r=>setTimeout(r,300));
          }
        }
      };
    }

    function splitImage(img, mode){
      const parts = [];
      if(mode === "h4"){
        // ตัดแนวนอน 4 ส่วน (Facebook 4 photos → 1 wide top + 3 bottom)
        // ส่วนที่ 1: บน (แนวนอน 1080x608), ส่วน 2-4: ล่าง 3 ช่อง (1080x360 แต่ละช่อง)
        const W = 1080, H1 = 608, H2 = 360;
        const total = H1 + H2;
        // Scale img ให้กว้าง W
        const scale = W / img.width;
        const srcH = total / scale;
        const srcY = Math.max(0,(img.height - srcH)/2);

        // Part 1 — wide top
        const c1 = document.createElement("canvas"); c1.width=W; c1.height=H1;
        const ctx1 = c1.getContext("2d");
        ctx1.drawImage(img, 0, srcY, img.width, srcH*(H1/total), 0, 0, W, H1);
        parts.push(c1);

        // Parts 2-4 — bottom 3 equal
        const bW = Math.round((W-4)/3);
        for(let i=0;i<3;i++){
          const c = document.createElement("canvas"); c.width=bW; c.height=H2;
          const ctx = c.getContext("2d");
          const srcX = (img.width/3)*i;
          const srcBotH = srcH*(H2/total);
          const srcBotY = srcY + srcH*(H1/total);
          ctx.drawImage(img, srcX, srcBotY, img.width/3, srcBotH, 0, 0, bW, H2);
          parts.push(c);
        }
      } else if(mode === "grid4"){
        // 2×2 grid — TL TR BL BR
        const size = 1080;
        const hw = img.width/2, hh = img.height/2;
        [[0,0],[hw,0],[0,hh],[hw,hh]].forEach(([sx,sy])=>{
          const c = document.createElement("canvas"); c.width=size; c.height=size;
          const ctx = c.getContext("2d");
          // cover crop
          const ratio = size/Math.min(hw,hh);
          ctx.drawImage(img, sx, sy, hw, hh, 0, 0, hw*ratio, hh*ratio);
          parts.push(c);
        });
      } else {
        // h2 — ซ้าย ขวา
        const W=1080, H=Math.round(W*(img.height/img.width)*0.5);
        const hw = img.width/2;
        [0,hw].forEach(sx=>{
          const c=document.createElement("canvas"); c.width=W; c.height=H||600;
          const ctx=c.getContext("2d");
          ctx.drawImage(img,sx,0,hw,img.height,0,0,W,H||600);
          parts.push(c);
        });
      }
      return parts;
    }
  }

  // inject ปุ่ม Panorama หลัง Collage
  const obs2 = new MutationObserver(()=>{
    const collage = document.getElementById("openCollageBtn");
    if(collage && !document.getElementById("openPanoBtn")){
      const wrap = document.createElement("div");
      wrap.style.cssText = "margin-top:8px;text-align:center";
      wrap.innerHTML = `<button class="btn secondary" id="openPanoBtn" style="width:100%">🌅 Panorama Split — ตัดรูปเดียวเป็น 4 ส่วน</button>`;
      collage.closest("div").after(wrap);
      document.getElementById("openPanoBtn")?.addEventListener("click", showPanoramaUI);
    }
  });
  obs2.observe(document.body,{childList:true,subtree:true});

})();

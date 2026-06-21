/* v9.3.8 — Facebook Album Smart Slot Layout
   Safe photo processing for real uploaded images only.
   Cover Frame + Lite Frames + Additional Frame, face-aware crop when supported,
   smart theme selection, safe text, slot-based crop/frames, Facebook mock preview, and synced preview / download results.
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
    resolvedRatio: "16:9", resolvedPreviewLayout: "cover-top"
  };

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
    const layout=previewLayoutFor(d.previewLayout,total,effectiveRatio(d));
    if(role==="cover"){
      return {role, layout, label:"Cover Frame", frameWeight:"heavy", textDensity:"full", logoScale:1, targetY:layout==="cover-left"?.42:.40, bottomRatio:.24};
    }
    if(role==="lite"){
      return {role, layout, label:`Lite Frame ${idx+1}`, frameWeight:"light", textDensity:"short", logoScale:.72, targetY:.48, bottomRatio: d.mode.includes("ภาพกิจกรรมเน้นภาพ")?.082:.102};
    }
    return {role, layout, label:`Additional Frame ${idx+1}`, frameWeight:"minimal", textDensity:"minimal", logoScale:.56, targetY:.50, bottomRatio:.07};
  }
  function slotSize(idx,d=data(),total=state.files.length||4){
    const requested=d.ratio || "auto";
    if(requested !== "auto") return size(d);
    const role=slotRole(idx);
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
    const proFrame = val("album-proFrame", "None");
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
    const g1=ctx.createLinearGradient(w*.68,0,w,0);
    g1.addColorStop(0,"rgba(255,255,255,0)");
    g1.addColorStop(.55,rgba(th.accent,.42));
    g1.addColorStop(1,rgba(th.accent2,.42));
    ctx.fillStyle=g1;
    ctx.beginPath();
    ctx.moveTo(w*.78,0);
    ctx.lineTo(w,0);
    ctx.lineTo(w,h*.32);
    ctx.lineTo(w*.9,h*.22);
    ctx.closePath();
    ctx.fill();

    const g2=ctx.createLinearGradient(w*.72,h,w,h*.6);
    g2.addColorStop(0,rgba(th.accent2,.44));
    g2.addColorStop(.65,rgba(th.accent,.28));
    g2.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=g2;
    ctx.beginPath();
    ctx.moveTo(w*.82,h);
    ctx.lineTo(w,h);
    ctx.lineTo(w,h*.74);
    ctx.lineTo(w*.92,h*.82);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawBorderFrame(ctx,w,h,th){
    const pad=Math.round(Math.min(w,h)*0.018);
    ctx.save();
    
    // Pro Frame Logic
    if(th.proFrame && th.proFrame !== "None"){
      const frameThickness = Math.max(15, Math.round(Math.min(w,h)*0.04));
      
      if(th.proFrame === "Gold Luxury"){
        // Outer Glow
        ctx.shadowColor = "rgba(212, 175, 55, 0.6)";
        ctx.shadowBlur = 30;
        
        // Main Gold Frame
        const goldGrad = ctx.createLinearGradient(0,0,w,h);
        goldGrad.addColorStop(0, "#D4AF37");
        goldGrad.addColorStop(0.2, "#F9F295");
        goldGrad.addColorStop(0.4, "#E6BE8A");
        goldGrad.addColorStop(0.5, "#B8860B");
        goldGrad.addColorStop(0.6, "#E6BE8A");
        goldGrad.addColorStop(0.8, "#F9F295");
        goldGrad.addColorStop(1, "#D4AF37");
        
        fillRoundRect(ctx, pad, pad, w-pad*2, h-pad*2, Math.round(Math.min(w,h)*0.026), null, goldGrad, frameThickness);
        
        // Inner Shine
        fillRoundRect(ctx, pad+frameThickness/2, pad+frameThickness/2, w-pad*2-frameThickness, h-pad*2-frameThickness, Math.round(Math.min(w,h)*0.02), null, "rgba(255,255,255,0.3)", 2);
      } 
      else if(th.proFrame === "Modern Neon"){
        ctx.shadowColor = th.accent;
        ctx.shadowBlur = 40;
        fillRoundRect(ctx, pad, pad, w-pad*2, h-pad*2, Math.round(Math.min(w,h)*0.026), null, th.accent, frameThickness/2);
        
        ctx.shadowColor = th.accent2;
        ctx.shadowBlur = 20;
        fillRoundRect(ctx, pad+10, pad+10, w-pad*2-20, h-pad*2-20, Math.round(Math.min(w,h)*0.02), null, th.accent2, 4);
      }
      else if(th.proFrame === "Bold Corporate"){
        const corpGrad = ctx.createLinearGradient(0,0,0,h);
        corpGrad.addColorStop(0, th.accent);
        corpGrad.addColorStop(1, th.dark);
        
        fillRoundRect(ctx, pad, pad, w-pad*2, h-pad*2, 0, null, corpGrad, frameThickness*1.5);
        fillRoundRect(ctx, pad+frameThickness, pad+frameThickness, w-pad*2-frameThickness*2, h-pad*2-frameThickness*2, 0, null, "#FFFFFF", 2);
      }
    } else {
      // Default Frame
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.round(Math.min(w,h)*0.026),null,th.border,Math.max(2,Math.round(Math.min(w,h)*.0034)));
      fillRoundRect(ctx,pad+7,pad+7,w-pad*2-14,h-pad*2-14,Math.round(Math.min(w,h)*0.022),null,"rgba(255,255,255,.10)",1);
    }
    
    ctx.restore();
  }

  function drawSlotBorderFrame(ctx,w,h,th,weight="lite"){
    const min=Math.min(w,h);
    const pad=Math.round(min*(weight==="minimal"?0.020:0.018));
    const thickness = weight==="minimal" ? Math.max(2, Math.round(min*0.004)) : Math.max(4, Math.round(min*0.008));
    const inner = weight==="minimal" ? 1 : 2;
    ctx.save();
    if(th.proFrame === "Gold Luxury"){
      const gold=ctx.createLinearGradient(0,0,w,h);
      gold.addColorStop(0, "#D4AF37");
      gold.addColorStop(0.18, "#F9F295");
      gold.addColorStop(0.42, "#E6BE8A");
      gold.addColorStop(0.55, "#B8860B");
      gold.addColorStop(0.72, "#E6BE8A");
      gold.addColorStop(1, "#D4AF37");
      ctx.shadowColor = weight==="minimal" ? "rgba(212,175,55,.18)" : "rgba(212,175,55,.34)";
      ctx.shadowBlur = weight==="minimal" ? 10 : 18;
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.round(min*0.022),null,gold,thickness);
      ctx.shadowBlur=0;
      fillRoundRect(ctx,pad+thickness*.8,pad+thickness*.8,w-pad*2-thickness*1.6,h-pad*2-thickness*1.6,Math.round(min*0.018),null,"rgba(255,255,255,.34)",inner);
    }else if(th.proFrame === "Modern Neon"){
      ctx.shadowColor = rgba(th.accent,.45);
      ctx.shadowBlur = weight==="minimal" ? 10 : 18;
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.round(min*0.022),null,th.accent,thickness);
      ctx.shadowBlur = 0;
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.round(min*0.018),null,rgba(th.accent2,.76),inner);
    }else if(th.proFrame === "Bold Corporate"){
      const corp=ctx.createLinearGradient(0,0,w,0);
      corp.addColorStop(0, th.accent);
      corp.addColorStop(1, th.accent2);
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.round(min*0.022),null,corp,thickness);
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.round(min*0.018),null,"rgba(255,255,255,.24)",inner);
    }else{
      fillRoundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.round(min*0.022),null,"rgba(255,255,255,.28)",thickness);
      fillRoundRect(ctx,pad+thickness,pad+thickness,w-pad*2-thickness*2,h-pad*2-thickness*2,Math.round(min*0.018),null,rgba(th.accent2,.34),inner);
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
    drawBorderFrame(ctx,w,h,th);

    const brandW=Math.round(w*(land?0.48:0.82));
    const brandH=Math.round(h*(land?0.108:0.08));
    const brandX=pad+Math.round(w*.014);
    const brandY=pad+Math.round(h*.012);
    const brandLabel=hasRealOrg(d.org) ? d.org : '';
    if(brandLabel || state.logo){
      drawRibbon(ctx,brandX,brandY,brandW,brandH,th,'dark');
      const logoS=Math.round(brandH*1.05);
      const logoX=brandX-Math.round(logoS*.18);
      const logoY=brandY-Math.round((logoS-brandH)/2);
      const hasLogo=drawLogo(ctx,logoX,logoY,logoS);
      const brandTextX=hasLogo ? logoX+logoS+Math.round(w*.012) : brandX+Math.round(w*.018);
      if(brandLabel) drawText(ctx,brandLabel,brandTextX,brandY+Math.round(brandH*.18),brandW-(brandTextX-brandX)-Math.round(w*.025),2,`900 ${Math.round(Math.min(w,h)*0.028)}px "Prompt","Noto Sans Thai",sans-serif`,'#fff',Math.round(Math.min(w,h)*0.032));
      const orgSub=hasRealOrg(d.org) && d.categoryLabel ? smartShort(d.categoryLabel,26) : (d.place ? smartShort(d.place,24) : '');
      if(orgSub) drawText(ctx,orgSub,brandTextX,brandY+Math.round(brandH*.62),brandW-(brandTextX-brandX)-Math.round(w*.025),1,`800 ${Math.round(Math.min(w,h)*0.018)}px "Noto Sans Thai","Prompt",sans-serif`,'rgba(255,255,255,.84)',Math.round(Math.min(w,h)*0.024));
    }

    const panelX=pad+Math.round(w*.015);
    const panelY=Math.round(h*(land?0.61:0.53));
    const panelW=w-panelX*2;
    const panelH=Math.round(h*(land?0.24:0.30));
    drawGlassPanel(ctx,panelX,panelY,panelW,panelH,Math.round(panelH*.12),th,pst.name==='minimal'?0.62:0.72);
    const panelAccent=ctx.createLinearGradient(panelX,panelY,panelX+panelW,panelY);
    panelAccent.addColorStop(0,th.accent2); panelAccent.addColorStop(.6,th.accent); panelAccent.addColorStop(1,'rgba(255,255,255,.12)');
    ctx.fillStyle=panelAccent;
    fillRoundRect(ctx,panelX+Math.round(w*.012),panelY+Math.round(h*.014),panelW-Math.round(w*.024),Math.max(6,Math.round(h*.012)),Math.round(h*.008),panelAccent);

    if(d.categoryLabel){
      const catY=panelY-Math.round(h*.056);
      const catW=Math.min(Math.round(w*.42), Math.round(w*.16)+Math.round(clean(d.categoryLabel).length*18));
      drawRibbon(ctx,panelX+Math.round(w*.006),catY,catW,Math.round(h*.05),th,'accent');
      drawText(ctx, smartShort(d.categoryLabel,32), panelX+Math.round(w*.028), catY+Math.round(h*.009), catW-Math.round(w*.045), 1, `900 ${Math.round(Math.min(w,h)*0.019)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.024));
    }

    const titleX=panelX+Math.round(w*.03);
    const titleW=panelW-Math.round(w*.06);
    const titleY=panelY+Math.round(panelH*.18);
    const titleFont=Math.round(Math.min(w,h)*(land?0.047:0.042)*pst.titleScale);
    const titleLineH=Math.round(titleFont*1.11);
    drawText(ctx, smartShort(d.title,110), titleX, titleY, titleW, land?2:3, `900 ${titleFont}px "Prompt","Kanit","Noto Sans Thai",sans-serif`, '#fff', titleLineH);

    const subText = stripHashtags(d.detail) || stripHashtags(d.footer) || d.place || '';
    const subY=titleY + titleLineH*(land?2:2.4);
    if(subText){
      fillRoundRect(ctx,titleX,subY,titleW,Math.round(panelH*.22),Math.round(panelH*.11),rgba(th.accent,.88),'rgba(255,255,255,.14)',1);
      drawText(ctx, smartShort(subText, land?72:52), titleX+Math.round(w*.018), subY+Math.round(panelH*.045), titleW-Math.round(w*.036), 1, `800 ${Math.round(Math.min(w,h)*0.022)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.028));
    }

    const metaY=panelY+panelH-Math.round(panelH*.18);
    let metaX=titleX;
    if(d.dateTime) metaX += drawInfoPill(ctx,metaX,metaY,d.dateTime,th,'🗓') + Math.round(w*.012);
    if(d.place) metaX += drawInfoPill(ctx,metaX,metaY,d.place,th,'📍') + Math.round(w*.012);

    if(pst.showFooterBar && stripHashtags(d.footer)){
      const barH=Math.round(h*(land?0.074:0.062));
      const barY=h-pad-barH;
      drawGlassPanel(ctx,pad+Math.round(w*.012),barY,w-pad*2-Math.round(w*.024),barH,Math.round(barH*.45),th,.72);
      drawText(ctx, smartShort(stripHashtags(d.footer), land?80:60), pad+Math.round(w*.035), barY+Math.round(barH*.24), w-pad*2-Math.round(w*.07), 1, `800 ${Math.round(Math.min(w,h)*0.021)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(Math.min(w,h)*0.025));
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
    const pad=Math.round(Math.min(w,h)*0.022);
    const min=Math.min(w,h);
    drawSlotBorderFrame(ctx,w,h,th,"lite");

    // Accent corner to preserve the "album frame" feeling from the approved reference.
    ctx.save();
    const corner=ctx.createLinearGradient(w*.74,0,w*.98,h*.24);
    corner.addColorStop(0,rgba(th.accent,.26));
    corner.addColorStop(1,rgba(th.accent2,.18));
    ctx.fillStyle=corner;
    ctx.beginPath();
    ctx.moveTo(w*.80,pad);
    ctx.lineTo(w-pad,pad);
    ctx.lineTo(w-pad,h*.20);
    ctx.lineTo(w*.90,h*.12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Number badge + logo = clearer frame identity like the sample.
    const badgeSize=Math.round(min*.09);
    drawLiteNumberBadge(ctx, idx, pad+Math.round(w*.01), pad+Math.round(h*.012), badgeSize, th);

    if(state.logo){
      const ls=Math.round(min*.11*profile.logoScale);
      drawLogo(ctx,w-pad-ls-Math.round(w*.006),pad+Math.round(h*.012),ls);
    }

    const bottomH=Math.round(h*profile.bottomRatio);
    const x=pad+Math.round(w*.015);
    const y=h-pad-bottomH-Math.round(h*.006);
    const boxW=w-pad*2-Math.round(w*.03);

    const g=ctx.createLinearGradient(x,y,x+boxW,y);
    g.addColorStop(0,rgba(th.deep,.70));
    g.addColorStop(.56,rgba(th.dark,.58));
    g.addColorStop(1,rgba(th.accent,.34));
    fillRoundRect(ctx,x,y,boxW,bottomH,Math.round(bottomH*.34),g,"rgba(255,255,255,.14)",Math.max(1,Math.round(bottomH*.018)));

    const line=ctx.createLinearGradient(x,y,x+boxW,y);
    line.addColorStop(0,th.accent2);
    line.addColorStop(.58,rgba(th.accent,.76));
    line.addColorStop(1,"rgba(255,255,255,.10)");
    fillRoundRect(ctx,x+Math.round(w*.018),y+Math.round(bottomH*.12),boxW-Math.round(w*.036),Math.max(3,Math.round(bottomH*.07)),Math.round(bottomH*.03),line,null,0);

    const leftPad=x+Math.round(w*.026);
    const textY=y+Math.round(bottomH*.34);
    drawText(ctx, liteText(d, idx), leftPad, textY, boxW-Math.round(w*.052), 1, `900 ${Math.round(min*0.022)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(min*0.025));
  }

  function drawAdditionalFrame(ctx,w,h,d,idx,th,profile=slotProfile(idx,d)){
    const pad=Math.round(Math.min(w,h)*0.022);
    const min=Math.min(w,h);
    drawSlotBorderFrame(ctx,w,h,th,"minimal");

    ctx.save();
    const corner=ctx.createLinearGradient(w*.80,0,w*.98,h*.20);
    corner.addColorStop(0,rgba(th.accent,.18));
    corner.addColorStop(1,rgba(th.accent2,.14));
    ctx.fillStyle=corner;
    ctx.beginPath();
    ctx.moveTo(w*.86,pad);
    ctx.lineTo(w-pad,pad);
    ctx.lineTo(w-pad,h*.13);
    ctx.lineTo(w*.92,h*.08);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if(state.logo){
      const ls=Math.round(min*.095);
      drawLogo(ctx,w-pad-ls-Math.round(w*.006),pad+Math.round(h*.012),ls);
    }

    const label=liteText(d, idx);
    if(!label) return;
    const boxW=Math.round(w*0.58);
    const boxH=Math.max(Math.round(h*profile.bottomRatio), Math.round(min*0.11));
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

    drawText(ctx, smartShort(label,48), x+Math.round(w*.022), y+Math.round(boxH*.30), boxW-Math.round(w*.044), 1, `800 ${Math.round(min*0.018)}px "Prompt","Noto Sans Thai",sans-serif`, '#fff', Math.round(min*0.020));
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
    const ratioSource=d.ratio==="auto"?'ระบบเลือกอัตโนมัติ':'ผู้ใช้เลือก';
    const layoutSource=d.previewLayout==="auto"?'ระบบเลือกอัตโนมัติ':'ผู้ใช้เลือก';
    note.innerHTML=`<b>การแสดงผลชุดนี้</b><span>${d.ratio==='auto'?'ขนาดตาม Slot: Cover / Lite / Additional':'ขนาดเดียวทั้งชุด '+effectiveRatio(d)} (${ratioSource}) · ${previewLayoutLabel(state.resolvedPreviewLayout)} (${layoutSource})</span>`;
    note.classList.add('resolved');
  }
  async function resolveSmartSettings(files){
    const d=data();
    if(d.ratio==="auto" && files[0]){
      const coverImage=await makeImage(files[0]);
      state.resolvedRatio=resolveRatioFromDimensions(coverImage.naturalWidth||coverImage.width,coverImage.naturalHeight||coverImage.height);
    }else{
      state.resolvedRatio=effectiveRatio(d);
    }
    state.resolvedPreviewLayout=previewLayoutFor(d.previewLayout,files.length,state.resolvedRatio);
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
    if(!hasCover && !supports.length){
      host.innerHTML = `<p class="album-frame-note">เลือกภาพหน้าปก 1 ภาพ และภาพรอง 3–4 ภาพ แล้วระบบจะจัดทำ Cover + Lite Album ให้อัตโนมัติ</p>`;
      return;
    }
    host.innerHTML = `
      <div class="album-order-note">โหมดใหม่: แยกภาพปกออกจากภาพรองชัดเจน เพื่อให้ภาพที่ใช้เป็นหน้าปก ตรงกับภาพปกใน Preview และไฟล์ดาวน์โหลด</div>
      <div class="album-upload-group">
        <div class="album-upload-group-title">ภาพหน้าปกหลัก</div>
        ${hasCover ? `
          <div class="album-file-chip album-cover-chip">
            <span>ปก</span>
            <b title="${state.coverFile.name.replace(/"/g,'&quot;')}">${state.coverFile.name}</b>
            <small>Cover Frame</small>
          </div>` : `<div class="album-empty-chip">ยังไม่ได้เลือกภาพปก</div>`}
      </div>
      <div class="album-upload-group">
        <div class="album-upload-group-title">ภาพรอง</div>
        ${supports.length ? supports.map((f,i)=>`
          <div class="album-file-chip" data-support-i="${i}">
            <span>${i+2}</span>
            <b title="${f.name.replace(/"/g,'&quot;')}">${f.name}</b>
            <small>${i<3?'Lite Frame':'Additional'}</small>
            <div class="album-order-actions">
              <button type="button" class="album-order-btn" data-album-support-move="up" data-i="${i}" ${i===0?'disabled':''}>↑</button>
              <button type="button" class="album-order-btn" data-album-support-move="down" data-i="${i}" ${i===supports.length-1?'disabled':''}>↓</button>
            </div>
          </div>`).join('') : `<div class="album-empty-chip">ยังไม่ได้เลือกภาพรอง</div>`}
      </div>
    `;
  }

  function captionText(d){
    const org = hasRealOrg(d.org) ? d.org : '';
    const title = d.title || 'กิจกรรม / ข่าวประชาสัมพันธ์';
    const parts=[];
    parts.push(`📌 ${title}`);
    parts.push(org ? `${org} ขอประชาสัมพันธ์ข้อมูลให้ประชาชนและผู้ที่เกี่ยวข้องได้รับทราบ` : `ขอประชาสัมพันธ์ข้อมูลให้ผู้ที่เกี่ยวข้องได้รับทราบ`);
    const meta=[d.dateTime && `📅 ${d.dateTime}`, d.place && `📍 ${d.place}`].filter(Boolean); if(meta.length) parts.push(meta.join('\n'));
    if(d.detail) parts.push(smartShort(d.detail,220));
    if(d.footer) parts.push(stripHashtags(d.footer));
    const hashBase = org ? org.replace(/\s+/g,'') : 'ประชาสัมพันธ์';
    parts.push(`#${hashBase} #กิจกรรม #ประชาสัมพันธ์`);
    return parts.filter(Boolean).join('\n\n');
  }

  function renderOutputs(){
    const host=$('#albumResult .ready-main') || $('#albumResult') || $('#albumOutput') || $('#albumPreview'); if(!host) return;
    const caption = state.caption || captionText(data());
    const aspectOf=o=>o&&o.w&&o.h?`${o.w} / ${o.h}`:ratioValue(data());
    const cover = state.outputs[0];
    const lites = state.outputs.slice(1,4);
    const additional = state.outputs.slice(4,5);
    const resolvedRatio=effectiveRatio(data());
    state.resolvedPreviewLayout=previewLayoutFor(data().previewLayout,state.outputs.length,resolvedRatio);

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
        </section>

        <details class="album-review-details album-caption-edit-details">
          <summary>
            <span><b>แก้ไขแคปชั่นโพสต์</b><small>พิมพ์แล้วตัวอย่างด้านบนจะเปลี่ยนทันที</small></span>
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
    const layout=previewLayoutFor(data().previewLayout,total,effectiveRatio(data()));
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
        <div class="fb-preview-foot">จำลองจากภาพจริง · ${effectiveRatio(data())} · ${previewLayoutLabel(layout)}</div>
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

  async function generate(){
    if(window.TANJAI && TANJAI.proofread && typeof TANJAI.proofread.runActive === 'function') TANJAI.proofread.runActive(false);
    let files=syncStateFiles();
    if(!files.length) files=collectFilesFromInputs(false);
    if(!val('album-title','')) return alert('กรุณากรอกหัวข้องานสำหรับ Cover Frame');
    if(!state.coverFile) return alert('กรุณาเลือกภาพหน้าปกหลัก 1 ภาพ');
    if(files.length < 4) return alert('กรุณาอัปโหลดภาพหน้าปก 1 ภาพ และภาพรองอย่างน้อย 3 ภาพ');
    if(files.length > 5) files=files.slice(0,5);
    state.files=files;
    state.outputs.forEach(o=>URL.revokeObjectURL(o.url)); state.outputs=[];
    const btn=$('#makeAlbum'); const old=btn?btn.textContent:''; if(btn){ btn.disabled=true; btn.textContent='กำลังสร้างชุดภาพ...'; }
    try{
      await waitFonts();
      await resolveSmartSettings(files);
      const logoInput=$('#album-logoFile'); if(logoInput && logoInput.files && logoInput.files[0]) await loadLogo(logoInput.files[0]); else state.logo=null;
      for(let i=0;i<files.length;i++) state.outputs.push(await processImage(files[i],i,files.length));
      state.caption=captionText(data());
      renderOutputs();
    } finally { if(btn){ btn.disabled=false; btn.textContent=old || 'สร้างชุดภาพ'; } }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    ensureAlbumInputs();
    collectFilesFromInputs(false);
    renderUploadPreview();
    document.addEventListener('click',(e)=>{
      const id=e.target && e.target.id;
      if(id==='makeAlbum'){ e.preventDefault(); generate(); }
      if(id==='albumDownloadAll' || id==='albumDownloadAllTop' || id==='albumDownloadAllResult'){ e.preventDefault(); downloadAll(); }
      if(id==='albumClear' || id==='albumClearTop'){
        e.preventDefault();
        state.outputs.forEach(o=>URL.revokeObjectURL(o.url));
        state.outputs=[]; state.files=[]; state.coverFile=null; state.supportFiles=[]; state.logo=null; state.resolvedRatio='16:9'; state.resolvedPreviewLayout='cover-top';
        const coverInp=$('#album-coverFile'); if(coverInp) coverInp.value='';
        const supportInp=$('#album-supportFiles'); if(supportInp) supportInp.value='';
        const logoInp=$('#album-logoFile'); if(logoInp) logoInp.value='';
        renderUploadPreview();
        const smart=$('#album-smartChoice'); if(smart){ smart.textContent='ระบบจะสรุปขนาดและรูปแบบพรีวิวที่เลือกให้อีกครั้งหลังสร้างชุดภาพ'; smart.classList.remove('resolved'); }
        const host=$('#albumResult .ready-main') || $('#albumResult'); if(host) host.innerHTML='';
      }
      if(id==='albumCopyCaption' || id==='albumCopyCaptionQuick'){ e.preventDefault(); const t=$('#albumCaptionText'); const value=t?t.value:state.caption; if(value){ navigator.clipboard?.writeText(value); const old=e.target.textContent; e.target.textContent='คัดลอกแล้ว'; setTimeout(()=>e.target.textContent=old || 'คัดลอกแคปชั่น',1200); } }
      if(id==='albumRefreshPreview'){ e.preventDefault(); renderFacebookPreview(); }
      if(e.target && e.target.classList.contains('album-one-download')) downloadOne(Number(e.target.dataset.i||0));
      const move=e.target && e.target.dataset && e.target.dataset.albumSupportMove; if(move){ e.preventDefault(); moveSupport(Number(e.target.dataset.i||0), move); }
    });
    document.addEventListener('change',(e)=>{
      if(e.target && (e.target.id==='album-coverFile' || e.target.id==='album-supportFiles')){ collectFilesFromInputs(true); renderUploadPreview(); }
      if(e.target && e.target.id==='album-previewLayout' && state.outputs.length){ state.resolvedPreviewLayout=previewLayoutFor(e.target.value,state.outputs.length,effectiveRatio(data())); renderSmartChoice(); renderFacebookPreview(); }
      if(e.target && e.target.id==='album-ratio' && state.outputs.length) generate();
    });
    document.addEventListener('input',(e)=>{
      if(e.target && e.target.id==='albumCaptionText') renderFacebookPreview();
    });
  });
  window.TANJAI_ALBUM_PRO={
    generate,downloadAll,renderFacebookPreview,renderUploadPreview,collectFilesFromInputs,
    _test:{cropPlacement,liteText,theme,size,resolveRatioFromDimensions,previewLayoutFor}
  };
})();

/* V12.6.6 — Smart Facebook Post Studio
   แม่แบบปกประชาสัมพันธ์เต็มรูปแบบ + โปรไฟล์แบรนด์ใช้ซ้ำ
   ทำงานในเบราว์เซอร์ ไม่สร้างภาพใหม่ ไม่แก้ใบหน้า และไม่แต่งข้อมูลจริงเพิ่ม
*/
(function(){
  'use strict';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  const state={files:[],coverId:null,coverMode:'double',logo:null,logoUrl:'',outputs:[],caption:'',facts:{},headlineX:50,headlineY:57,logoX:4,logoY:5,brandY:74,drag:null,refreshTimer:null,refreshSeq:0};
  const BRAND_STORAGE_KEY='tanjai_album_brand_v1';

  function clean(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function cleanMultiline(value){return String(value||'').replace(/\r/g,'').split('\n').map(line=>line.replace(/[\t ]+/g,' ').trim()).filter(Boolean).join('\n').trim();}
  function esc(value){return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function val(id,fallback=''){const el=document.getElementById(id);return el&&typeof el.value==='string'&&el.value.trim()?el.value.trim():fallback;}
  function num(id,fallback){const n=Number(val(id,String(fallback)));return Number.isFinite(n)?n:fallback;}
  function checked(id){return !!document.getElementById(id)?.checked;}
  function selectedCover(){return state.files.find(item=>item.id===state.coverId)||state.files[0]||null;}
  function supportingFiles(){const cover=selectedCover();return state.files.filter(item=>!cover||item.id!==cover.id);}
  function notify(message){if(window.TANJAI?.toast)TANJAI.toast(message);else alert(message);}
  function normalizeFacts(input={}){return{
    title:cleanMultiline(input.title),org:clean(input.org),date:clean(input.date),time:clean(input.time),place:clean(input.place),detail:clean(input.detail),purpose:clean(input.purpose),footer:clean(input.footer),captionStyle:clean(input.captionStyle)||'official'
  };}
  function formData(){
    const facts=normalizeFacts({title:val('album-title',''),org:val('album-orgName',''),date:val('album-dateTime',''),time:val('album-time',''),place:val('album-place',''),detail:val('album-detail',''),purpose:val('album-purpose',''),footer:val('album-footer',''),captionStyle:val('album-captionStyle','official')});
    state.facts=facts;
    return{...facts,coverStyle:val('album-coverStyle','official'),font:val('album-headlineFont','Kanit'),fontSize:num('album-headlineSize',88),fontWeight:num('album-headlineWeight',900),italic:checked('album-headlineItalic'),color:val('album-headlineColor','#f5c84c'),outlineColor:val('album-outlineColor','#24104f'),outlineWidth:num('album-outlineWidth',4),align:val('album-headlineAlign','center'),logoPosition:val('album-logoPosition','left'),logoSize:num('album-logoSize',10),shadow:checked('album-headlineShadow'),brandEnabled:checked('album-brandEnabled'),brandSlogan:val('album-brandSlogan',''),brandWebsite:val('album-brandWebsite',''),brandSocial:val('album-brandSocial',''),brandPhone:val('album-brandPhone','')};
  }
  function short(value,max=150){const text=clean(value);if(text.length<=max)return text;const cut=text.slice(0,max+1),at=Math.max(cut.lastIndexOf(' '),cut.lastIndexOf(' และ'),cut.lastIndexOf(' เพื่อ'));return(at>max*.55?cut.slice(0,at):cut.slice(0,max)).trim()+'…';}
  function rgba(hex,alpha){const raw=String(hex||'#24104f').replace('#',''),full=raw.length===3?raw.split('').map(x=>x+x).join(''):raw.padEnd(6,'0').slice(0,6);return`rgba(${parseInt(full.slice(0,2),16)},${parseInt(full.slice(2,4),16)},${parseInt(full.slice(4,6),16)},${alpha})`;}
  function revokeFiles(){state.files.forEach(item=>item.url&&URL.revokeObjectURL(item.url));}
  function revokeOutputs(){state.outputs.forEach(item=>item.url&&URL.revokeObjectURL(item.url));state.outputs=[];}
  function makeFileItem(file,index){return{file,id:`${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,url:URL.createObjectURL(file),cropX:50,cropY:50,zoom:1};}

  function ingestFiles(fileList){
    const valid=Array.from(fileList||[]).filter(file=>file.type.startsWith('image/'));if(!valid.length)return;
    revokeFiles();revokeOutputs();const limited=valid.slice(0,60);if(valid.length>60)notify('รองรับสูงสุด 60 ภาพ และเลือกใช้ 60 ภาพแรก');
    state.files=limited.map(makeFileItem);state.coverId=state.files[0]?.id||null;state.headlineX=50;state.headlineY=57;state.brandY=74;
    renderPhotoPicker();renderCoverEditor();renderCropList();renderEmptyResult();
  }
  async function loadLogo(file){
    if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);state.logo=null;state.logoUrl='';
    if(!file){renderCoverEditor();scheduleGeneratedRefresh();return;}state.logoUrl=URL.createObjectURL(file);state.logo=await loadImage(state.logoUrl,false);renderCoverEditor();scheduleGeneratedRefresh();
  }
  function renderPhotoPicker(){
    const host=$('#album-photoPicker');if(!host)return;if(!state.files.length){host.hidden=true;host.innerHTML='';return;}host.hidden=false;
    host.innerHTML=`<div class="album-picker-head"><b>เลือกภาพที่จะใช้ทำปก</b><small>คลิกภาพหนึ่งใบ ภาพอื่นจะเป็นภาพกิจกรรมแบบไม่มีข้อความ</small></div><div class="album-picker-grid">${state.files.map((item,index)=>`<button type="button" class="album-picker-item${item.id===state.coverId?' selected':''}" data-cover-id="${item.id}"><img src="${item.url}" alt="ภาพที่ ${index+1}"><span>${item.id===state.coverId?'✓ ภาพปก':`ภาพที่ ${index+1}`}</span></button>`).join('')}</div>`;
  }
  function metaText(d){return[d.date,d.time,d.place].filter(Boolean).join(' · ');}
  function brandContacts(d){return[{icon:'◎',text:clean(d.brandWebsite)},{icon:'f',text:clean(d.brandSocial||d.org)},{icon:'☎',text:clean(d.brandPhone)}].filter(item=>item.text);}
  function hasBrandContent(d){return !!(clean(d.brandSlogan)||brandContacts(d).length);}
  function renderCoverEditor(){
    const host=$('#album-coverEditor');if(!host)return;const cover=selectedCover(),d=formData();
    if(!cover){host.className='album-cover-editor is-empty';host.innerHTML='<p>อัปโหลดภาพ แล้วเลือกภาพปกเพื่อเริ่มจัดวาง</p>';return;}
    host.className=`album-cover-editor mode-${state.coverMode}`;
    const isDouble=state.coverMode==='double',canvasW=isDouble?2160:1080,headlineSize=headlineFontSize(d.title,d.fontSize,isDouble),headlineSourceSize=headlineSize*(isDouble?1.28:1),previewHeadlineSize=headlineSourceSize/canvasW*100,previewOutlineSize=d.outlineWidth*(isDouble?1.35:1)/canvasW*100;
    const styleClass=`style-${d.coverStyle}`,showBrand=d.coverStyle==='official'&&d.brandEnabled&&hasBrandContent(d),contacts=brandContacts(d);
    const logoHtml=(state.logoUrl&&d.logoPosition!=='none')?`<img id="albumLogoDrag" class="album-editor-logo" src="${state.logoUrl}" alt="โลโก้จริง" style="left:${state.logoX}%;top:${state.logoY}%;width:${d.logoSize}%">`:'';
    const brandHtml=showBrand?`<div id="albumBrandDrag" class="album-brand-drag" style="top:${state.brandY}%"><i></i>${d.brandSlogan?`<b>${esc(d.brandSlogan)}</b>`:''}<div>${contacts.map(item=>`<span><em>${esc(item.icon)}</em>${esc(item.text)}</span>`).join('')}</div></div>`:'';
    host.innerHTML=`<div class="album-cover-stage ${styleClass}" id="albumCoverStage"><img class="album-editor-photo" src="${cover.url}" alt="ภาพปก" style="object-position:${cover.cropX}% ${cover.cropY}%"><div class="album-editor-shade"></div>${isDouble?'<i class="album-editor-seam" aria-hidden="true"></i>':''}${logoHtml}<div id="albumHeadlineDrag" class="album-headline-drag align-${d.align}${d.italic?' is-italic':''}" style="left:${state.headlineX}%;top:${state.headlineY}%;font-family:'${esc(d.font)}',sans-serif;font-size:${previewHeadlineSize}cqw;font-weight:${d.fontWeight};color:${d.color};-webkit-text-stroke:${previewOutlineSize}cqw ${d.outlineColor};text-shadow:${d.shadow?'0 3px 10px rgba(0,0,0,.72)':'none'}">${esc(d.title||'ข้อความพาดหัว').replace(/\n/g,'<br>')}</div>${brandHtml}</div>`;
    bindStageDrag();renderWarning();
  }
  function renderWarning(){
    const host=$('#album-coverWarning');if(!host)return;const d=formData(),warnings=[];
    if(d.title.length>90)warnings.push('พาดหัวยาว อาจอ่านไม่ทันบนมือถือ');
    if(state.coverMode==='double'&&state.headlineX>43&&state.headlineX<57&&d.title.length>34)warnings.push('พาดหัวอยู่ใกล้รอยต่อกลาง กรุณาตรวจว่าไม่มีตัวอักษรถูกแบ่งครึ่ง');
    if(!d.title)warnings.push('ยังไม่ได้ใส่ข้อความพาดหัว');host.hidden=!warnings.length;host.textContent=warnings.join(' · ');
  }
  function bindStageDrag(){
    const stage=$('#albumCoverStage');if(!stage)return;
    [['#albumHeadlineDrag','headline'],['#albumLogoDrag','logo'],['#albumBrandDrag','brand']].forEach(([selector,type])=>{const drag=$(selector);if(!drag)return;
      drag.addEventListener('pointerdown',event=>{event.preventDefault();drag.setPointerCapture?.(event.pointerId);state.drag={stage,type};drag.classList.add('dragging');});
      drag.addEventListener('pointermove',event=>{if(state.drag?.type!==type)return;const rect=stage.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width)*100,y=((event.clientY-rect.top)/rect.height)*100;if(type==='headline'){state.headlineX=Math.max(8,Math.min(92,x));state.headlineY=Math.max(12,Math.min(69,y));drag.style.left=state.headlineX+'%';drag.style.top=state.headlineY+'%';renderWarning();}else if(type==='brand'){state.brandY=Math.max(68,Math.min(84,y));drag.style.top=state.brandY+'%';}else{const size=formData().logoSize;state.logoX=Math.max(1,Math.min(99-size,x));state.logoY=Math.max(1,Math.min(82,y));drag.style.left=state.logoX+'%';drag.style.top=state.logoY+'%';}});
      const stop=()=>{if(state.drag?.type===type)scheduleGeneratedRefresh();state.drag=null;drag.classList.remove('dragging');};drag.addEventListener('pointerup',stop);drag.addEventListener('pointercancel',stop);
    });
  }
  function renderCropList(){
    const host=$('#album-cropList');if(!host)return;const supports=supportingFiles();
    if(!state.files.length){host.innerHTML='<div class="album-empty-note">อัปโหลดภาพกิจกรรมก่อน</div>';return;}
    if(!supports.length){host.innerHTML='<div class="album-empty-note">มีเพียงภาพปก ยังไม่มีภาพกิจกรรมเพิ่มเติม</div>';return;}
    host.innerHTML=supports.map((item,index)=>`<article class="album-crop-card" data-file-id="${item.id}"><div class="album-crop-thumb"><img src="${item.url}" alt="ภาพกิจกรรม ${index+1}" style="object-position:${item.cropX}% ${item.cropY}%;transform:scale(${item.zoom})"></div><div class="album-crop-controls"><div><b>ภาพกิจกรรม ${index+1}</b><small>${esc(item.file.name)}</small></div><label>ซ้าย–ขวา<input type="range" min="0" max="100" value="${item.cropX}" data-crop-axis="x"></label><label>บน–ล่าง<input type="range" min="0" max="100" value="${item.cropY}" data-crop-axis="y"></label><label>ขยาย<input type="range" min="100" max="180" value="${Math.round(item.zoom*100)}" data-crop-axis="zoom"></label><div class="album-order-actions"><button type="button" data-move="up" ${index===0?'disabled':''}>← ก่อนหน้า</button><button type="button" data-move="down" ${index===supports.length-1?'disabled':''}>ถัดไป →</button></div></div></article>`).join('');
  }
  function updateCrop(input){
    const card=input.closest('[data-file-id]'),item=state.files.find(file=>file.id===card?.dataset.fileId);if(!item)return;const axis=input.dataset.cropAxis,value=Number(input.value);
    if(axis==='x')item.cropX=value;else if(axis==='y')item.cropY=value;else item.zoom=value/100;const img=card.querySelector('img');if(img){img.style.objectPosition=`${item.cropX}% ${item.cropY}%`;img.style.transform=`scale(${item.zoom})`;}
  }
  function moveSupport(id,direction){
    const cover=selectedCover(),supports=supportingFiles(),at=supports.findIndex(item=>item.id===id),to=direction==='up'?at-1:at+1;if(at<0||to<0||to>=supports.length)return;
    [supports[at],supports[to]]=[supports[to],supports[at]];state.files=cover?[cover,...supports]:supports;renderPhotoPicker();renderCropList();
  }

  function loadImage(source,revoke=true){return new Promise((resolve,reject)=>{const img=new Image(),url=typeof source==='string'?source:URL.createObjectURL(source);img.onload=()=>{if(revoke&&typeof source!=='string')URL.revokeObjectURL(url);resolve(img);};img.onerror=error=>{if(revoke&&typeof source!=='string')URL.revokeObjectURL(url);reject(error);};img.src=url;});}
  function cropPlacement(sw,sh,w,h,xPct=50,yPct=50,zoom=1){const base=Math.max(w/sw,h/sh),scale=base*Math.max(1,zoom),nw=sw*scale,nh=sh*scale;return{scale,nw,nh,x:(w-nw)*(Math.max(0,Math.min(100,xPct))/100),y:(h-nh)*(Math.max(0,Math.min(100,yPct))/100)};}
  function drawCrop(ctx,img,w,h,item){const p=cropPlacement(img.naturalWidth||img.width,img.naturalHeight||img.height,w,h,item.cropX,item.cropY,item.zoom);ctx.drawImage(img,p.x,p.y,p.nw,p.nh);}
  function textTokens(text){try{return Array.from(new Intl.Segmenter('th',{granularity:'word'}).segment(text)).map(x=>x.segment).filter(Boolean);}catch(_){return String(text).split(/(\s+)/).filter(Boolean);}}
  function wrapAllLines(ctx,text,maxWidth){const tokens=textTokens(clean(text)),lines=[];let line='';tokens.forEach(token=>{const trial=line+token;if(line&&ctx.measureText(trial).width>maxWidth){lines.push(line.trim());line=token;}else line=trial;});if(line.trim())lines.push(line.trim());return lines;}
  function wrapHeadlineLines(ctx,text,maxWidth){const manual=cleanMultiline(text).split('\n').filter(Boolean),lines=[];(manual.length?manual:['']).forEach(line=>lines.push(...wrapAllLines(ctx,line,maxWidth)));return lines.length?lines:[''];}
  function wrapLines(ctx,text,maxWidth,maxLines){const lines=wrapAllLines(ctx,text,maxWidth);if(lines.length<=maxLines)return lines;const out=lines.slice(0,maxLines);let last=out[maxLines-1];while(last.length>1&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);out[maxLines-1]=last.trim()+'…';return out;}
  function fitDetailLines(ctx,text,maxWidth,maxLines,startSize,minSize=8){let size=startSize,lines=[];while(size>=minSize){ctx.font=`600 ${size}px "Sarabun","Noto Sans Thai",sans-serif`;lines=wrapAllLines(ctx,text,maxWidth);if(lines.length<=maxLines)return{size,lines};size--;}return{size:minSize,lines:wrapAllLines(ctx,text,maxWidth)};}
  function headlineFontSize(text,base,isDouble=true){const length=clean(text).length,ratio=isDouble?(length>110?.68:length>80?.78:length>55?.88:1):(length>110?.55:length>80?.67:length>55?.8:1);return Math.max(34,Math.round(base*ratio));}
  function drawHeadline(ctx,w,h,d){
    const text=d.title||'ข้อความพาดหัว',size=headlineFontSize(text,d.fontSize,w===2160)*(w===2160?1.28:1),italic=d.italic?'italic ':'';ctx.save();ctx.font=`${italic}${d.fontWeight} ${Math.round(size)}px "${d.font}","Noto Sans Thai",sans-serif`;ctx.textBaseline='middle';ctx.textAlign=d.align;
    const maxWidth=w*.82,lines=wrapHeadlineLines(ctx,text,maxWidth),lineH=size*1.13,x=w*(state.headlineX/100),centerY=h*(state.headlineY/100),startY=centerY-((lines.length-1)*lineH)/2;ctx.lineJoin='round';ctx.miterLimit=2;
    if(d.shadow){ctx.shadowColor='rgba(0,0,0,.72)';ctx.shadowBlur=Math.max(10,size*.18);ctx.shadowOffsetY=Math.max(3,size*.06);}
    lines.forEach((line,index)=>{let drawX=x;if(d.align==='left')drawX=Math.max(w*.06,x-maxWidth/2);if(d.align==='right')drawX=Math.min(w*.94,x+maxWidth/2);if(d.outlineWidth>0){ctx.lineWidth=d.outlineWidth*(w===2160?1.35:1);ctx.strokeStyle=d.outlineColor;ctx.strokeText(line,drawX,startY+index*lineH,maxWidth);}ctx.fillStyle=d.color;ctx.fillText(line,drawX,startY+index*lineH,maxWidth);});ctx.restore();
  }
  function drawContained(ctx,img,x,y,maxW,maxH){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,scale=Math.min(maxW/iw,maxH/ih),w=iw*scale,h=ih*scale;ctx.drawImage(img,x+(maxW-w)/2,y+(maxH-h)/2,w,h);}
  function drawBrandFooter(ctx,w,h,d){
    if(d.coverStyle!=='official'||!d.brandEnabled||!hasBrandContent(d))return;const contacts=brandContacts(d),isDouble=w===2160,y=h*(state.brandY/100);ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillRect(w*.11,y,w*.78,3);
    let cursor=y+64;if(d.brandSlogan){const sloganSize=isDouble?42:28;ctx.font=`800 ${sloganSize}px "Kanit","Noto Sans Thai",sans-serif`;ctx.fillStyle=d.color||'#f5c84c';ctx.shadowColor='rgba(0,0,0,.58)';ctx.shadowBlur=8;ctx.fillText(clean(d.brandSlogan),w/2,cursor,w*.82);cursor+=isDouble?78:66;}
    if(contacts.length){let size=isDouble?29:22,gap=isDouble?60:24;const labels=contacts.map(item=>`${item.icon}  ${item.text}`);while(size>14){ctx.font=`600 ${size}px "Sarabun","Noto Sans Thai",sans-serif`;const total=labels.reduce((sum,label)=>sum+ctx.measureText(label).width,0)+gap*(labels.length-1);if(total<=w*.84)break;size-=1;}ctx.font=`600 ${size}px "Sarabun","Noto Sans Thai",sans-serif`;ctx.fillStyle='#fff';const widths=labels.map(label=>ctx.measureText(label).width),total=widths.reduce((sum,value)=>sum+value,0)+gap*(labels.length-1);let x=(w-total)/2;labels.forEach((label,index)=>{ctx.textAlign='left';ctx.fillText(label,x,cursor);x+=widths[index]+gap;});}
    ctx.restore();
  }
  function drawCoverOverlays(ctx,w,h,d){
    const shade=ctx.createLinearGradient(0,0,0,h);if(d.coverStyle==='minimal'){shade.addColorStop(0,'rgba(0,0,0,.18)');shade.addColorStop(1,'rgba(0,0,0,.06)');}else if(d.coverStyle==='clean'){shade.addColorStop(0,'rgba(0,0,0,.2)');shade.addColorStop(.48,'rgba(0,0,0,.04)');shade.addColorStop(1,'rgba(0,0,0,.5)');}else{shade.addColorStop(0,'rgba(0,0,0,.12)');shade.addColorStop(.42,'rgba(36,16,79,.04)');shade.addColorStop(.6,'rgba(54,18,94,.58)');shade.addColorStop(1,'rgba(36,8,67,.94)');}ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    if(state.logo&&d.logoPosition!=='none'){const box=w*(d.logoSize/100),x=w*(state.logoX/100),y=h*(state.logoY/100);ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=18;drawContained(ctx,state.logo,x,y,box,box);ctx.restore();}drawHeadline(ctx,w,h,d);drawBrandFooter(ctx,w,h,d);
  }
  function canvasBlob(canvas,type='image/jpeg',quality=.93){return new Promise(resolve=>canvas.toBlob(resolve,type,quality));}
  async function buildCover(){
    const cover=selectedCover(),d=formData();if(!cover)return[];const W=state.coverMode==='double'?2160:1080,H=1080,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),img=await loadImage(cover.file);drawCrop(ctx,img,W,H,cover);drawCoverOverlays(ctx,W,H,d);
    if(state.coverMode==='single'){const blob=await canvasBlob(canvas);return[{blob,url:URL.createObjectURL(blob),role:'cover',filename:'01-cover.jpg',w:1080,h:1080}];}
    const outs=[];for(let i=0;i<2;i++){const half=document.createElement('canvas');half.width=1080;half.height=1080;half.getContext('2d').drawImage(canvas,i*1080,0,1080,1080,0,0,1080,1080);const blob=await canvasBlob(half);outs.push({blob,url:URL.createObjectURL(blob),role:'cover',filename:`0${i+1}-cover-${i?'right':'left'}.jpg`,w:1080,h:1080});}return outs;
  }
  async function buildSupport(item,index,offset){const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const ctx=canvas.getContext('2d'),img=await loadImage(item.file);drawCrop(ctx,img,1080,1080,item);const blob=await canvasBlob(canvas),number=String(index+offset).padStart(2,'0');return{blob,url:URL.createObjectURL(blob),role:'photo',filename:`${number}-photo.jpg`,w:1080,h:1080};}

  function scheduleGeneratedRefresh(){
    if(!state.outputs.length)return;clearTimeout(state.refreshTimer);const seq=++state.refreshSeq;
    state.refreshTimer=setTimeout(async()=>{try{const covers=await buildCover();if(seq!==state.refreshSeq){covers.forEach(item=>URL.revokeObjectURL(item.url));return;}const photos=state.outputs.filter(item=>item.role!=='cover'),oldCovers=state.outputs.filter(item=>item.role==='cover');oldCovers.forEach(item=>URL.revokeObjectURL(item.url));state.outputs=[...covers,...photos];renderOutputs();}catch(error){console.error(error);}},280);
  }

  function factGuardCaption(text){return String(text||'').split('\n').map(line=>line.trimEnd()).filter(line=>line&&!/undefined|null|placeholder|กรอกข้อมูล|กรุณาเติม|ไม่ระบุข้อมูล/i.test(line)).join('\n').replace(/\n{3,}/g,'\n\n').trim();}
  function captionWriter(d,style=d.captionStyle||'official'){
    const title=clean(d.title),org=clean(d.org),detail=clean(d.detail),purpose=clean(d.purpose),footer=clean(d.footer),blocks=[],icon=style==='friendly'?'✨':style==='story'?'📷':style==='announcement'?'📣':'🎯';if(title)blocks.push(`${icon} ${title}`);
    const meta=[d.date&&`📅 ${d.date}${d.time?' '+d.time:''}`,d.place&&`📍 ${d.place}`].filter(Boolean).join('\n');if(meta)blocks.push(meta);
    const body=org&&detail?`${org} ${detail}`:detail||org;if(body)blocks.push(body);if(purpose)blocks.push(purpose);if(footer)blocks.push(footer);return factGuardCaption(blocks.join('\n\n'));
  }
  async function generateSmartCaption(d,button=null){
    const fallback=()=>captionWriter(d,d.captionStyle),facts=[d.title,d.org,d.date,d.time,d.place,d.detail,d.purpose,d.footer].filter(Boolean).join('\n');
    if(!window.TANJAI?.generateWritingWithAI)return fallback();
    const result=await TANJAI.generateWritingWithAI({
      tool:'post',button,
      data:{title:clean(d.title),organization:d.org,date:d.date,time:d.time,place:d.place,detail:d.detail,purpose:d.purpose,footer:d.footer,lockedFacts:facts},
      options:{channel:'โพสต์ Facebook พร้อมเผยแพร่',platform:'Facebook',purpose:'สรุปกิจกรรมและประชาสัมพันธ์',delivery:'สุภาพ เป็นธรรมชาติ อ่านง่าย',creativity:'ช่วยคิดและแต่งให้สมบูรณ์',emoji:'ใช้เท่าที่จำเป็น',hashtags:'สร้าง 2–4 แฮชแท็กที่เกี่ยวข้อง',captionStyle:d.captionStyle,silentStatus:true,extra:'เรียบเรียงเป็นแคปชั่นพร้อมโพสต์: เปิดด้วยพาดหัว ตามด้วยวันเวลาและสถานที่ แล้วเขียนเนื้อหาใครทำอะไรให้ครบ วัตถุประสงค์หรือประโยชน์ และปิดท้ายอย่างเหมาะสม ส่งเฉพาะแคปชั่น ห้ามสร้างชื่อบุคคล ตำแหน่ง วัน เวลา สถานที่ ตัวเลข ผลลัพธ์ หรือข้อเท็จจริงที่ผู้ใช้ไม่ได้ให้'},
      fallback
    });
    window.TANJAI_AUTH?.trackUsage?.('album_caption');
    return factGuardCaption(result?.text)||fallback();
  }
  function progress(show,label='กำลังสร้างชุดภาพ...',percent=0){let box=$('#albumProgress');if(!box){box=document.createElement('div');box.id='albumProgress';box.className='album-progress-bar-wrap';box.innerHTML='<div class="album-progress-bar" id="albumProgressInner"></div><small id="albumProgressLabel"></small>';$('#albumResult')?.prepend(box);}box.style.display=show?'block':'none';const bar=$('#albumProgressInner'),text=$('#albumProgressLabel');if(bar)bar.style.width=percent+'%';if(text)text.textContent=label;}
  async function generate(){
    const d=formData(),cover=selectedCover();if(!cover)return notify('กรุณาอัปโหลดและเลือกภาพปก');if(!d.title)return notify('กรุณาใส่ข้อความพาดหัวบนภาพปก');revokeOutputs();const btn=$('#makeAlbum'),old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='กำลังสร้าง...';}
    try{if(document.fonts?.ready)await document.fonts.ready;progress(true,'กำลังสร้างภาพปก...',8);state.outputs.push(...await buildCover());const supports=supportingFiles(),offset=state.outputs.length+1;for(let i=0;i<supports.length;i++){progress(true,`กำลังครอปภาพกิจกรรม ${i+1}/${supports.length}...`,Math.round(10+((i+1)/Math.max(1,supports.length))*72));state.outputs.push(await buildSupport(supports[i],i,offset));}progress(true,'AI กำลังเรียบเรียงแคปชั่นจากข้อมูลจริง...',88);state.caption=await generateSmartCaption(d);progress(true,'กำลังจัดตัวอย่าง Facebook...',96);renderOutputs();progress(true,'เสร็จแล้ว ✓',100);setTimeout(()=>progress(false),1200);}catch(error){console.error(error);notify('สร้างชุดภาพไม่สำเร็จ กรุณาตรวจไฟล์ภาพแล้วลองใหม่');progress(false);}finally{if(btn){btn.disabled=false;btn.textContent=old||'สร้างชุดภาพและแคปชั่น';}}
  }

  function previewCells(){const visible=state.outputs.slice(0,5),total=state.outputs.length;return visible.map((item,index)=>`<div class="fb-five-cell cell-${index+1}"><img src="${item.url}" alt="ภาพที่ ${index+1}">${index===4&&total>5?`<span class="fb-preview-more">+${total-5}</span>`:''}</div>`).join('');}
  function renderFacebookPreview(){const host=$('#albumFacebookPreview');if(!host)return;const d=formData(),caption=$('#albumCaptionText')?.value||state.caption;host.innerHTML=`<div class="fb-preview-card"><div class="fb-preview-head"><div class="fb-preview-avatar">${state.logoUrl?`<img src="${state.logoUrl}" alt="">`:'เพจ'}</div><div><div class="fb-preview-name">${esc(d.org||'ชื่อเพจของคุณ')}</div><div class="fb-preview-time">เมื่อสักครู่ · 🌐</div></div></div><div class="fb-preview-caption">${esc(caption).replace(/\n/g,'<br>')}</div><div class="fb-five-grid count-${Math.min(5,state.outputs.length)}">${previewCells()}</div><div class="fb-preview-foot">ตัวอย่างลำดับภาพบน Facebook · 2 ภาพบน + 3 ภาพล่าง${state.outputs.length>5?` · ภาพที่ 5 แสดง +${state.outputs.length-5}`:''}</div></div>`;}
  function renderOutputs(){
    const host=$('#albumResult .ready-main')||$('#albumResult');if(!host)return;host.innerHTML=`<div class="album-pro-panel"><section class="album-preview-section album-post-first"><div class="album-preview-title"><div><b>ตัวอย่างโพสต์ Facebook</b><p>ตรวจลำดับ ภาพปก รอยต่อ และเครื่องหมาย +จำนวน ก่อนดาวน์โหลด</p></div><span class="album-ready-badge">${state.outputs.length} ภาพ · 1080 × 1080</span></div><div class="album-post-actions"><button class="btn primary" id="albumCopyCaptionQuick">คัดลอกแคปชั่น</button><button class="btn secondary" id="albumDownloadAllResult">ดาวน์โหลด ZIP</button></div><div id="albumFacebookPreview"></div></section><details class="album-review-details album-caption-edit-details" open><summary><span><b>แคปชั่นพร้อมโพสต์</b><small>AI เรียบเรียงจากข้อมูลจริง แก้ไขได้ก่อนคัดลอก</small></span></summary><div class="album-caption-box"><textarea id="albumCaptionText" rows="12">${esc(state.caption)}</textarea><div class="album-caption-actions"><button class="btn primary" id="albumCopyCaption">คัดลอกแคปชั่น</button><button class="btn secondary" id="albumRegenerateCaptionAI">✨ AI ช่วยเขียนใหม่</button><button class="btn secondary" id="albumRefreshPreview">อัปเดตตัวอย่าง</button><button class="btn secondary" id="albumSaveProject">💾 บันทึกงาน</button></div></div></details><details class="album-review-details"><summary><span><b>ตรวจและดาวน์โหลดภาพรายใบ</b><small>เฉพาะภาพปกมีโลโก้ พาดหัว และส่วนท้ายแบรนด์ตามตัวเลือก ภาพกิจกรรมเป็นภาพจริงครอปสะอาด</small></span></summary><div class="album-output-grid">${state.outputs.map((item,index)=>`<article><img src="${item.url}" alt="ภาพที่ ${index+1}"><b>${esc(item.filename)}</b><button class="btn secondary album-one-download" data-index="${index}">ดาวน์โหลด</button></article>`).join('')}</div></details></div>`;renderFacebookPreview();
  }
  function renderEmptyResult(){const host=$('#albumResult .ready-main')||$('#albumResult');if(host&&state.outputs.length===0)host.innerHTML='<div class="ready-empty"><b>ชุดภาพจะแสดงที่นี่</b><span>เลือกภาพปก จัดข้อความและจุดครอป แล้วกดสร้างชุดภาพ</span></div>';}

  const encoder=new TextEncoder();let crcTable=null;
  function crc32(buf){if(!crcTable)crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});let c=0xffffffff;for(const b of buf)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  function dosDateTime(date=new Date()){return{time:(date.getHours()<<11)|(date.getMinutes()<<5)|Math.floor(date.getSeconds()/2),day:((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate()};}
  async function makeZip(entries){const chunks=[],central=[];let offset=0;const dt=dosDateTime();for(const entry of entries){const bytes=new Uint8Array(await entry.blob.arrayBuffer()),name=encoder.encode(entry.filename),crc=crc32(bytes),size=bytes.length,local=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),...u32(crc),...u32(size),...u32(size),...u16(name.length),...u16(0),...name]);chunks.push(local,bytes);central.push({name,crc,size,offset});offset+=local.length+bytes.length;}const start=offset,parts=[];for(const item of central){const c=new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(dt.time),...u16(dt.day),...u32(item.crc),...u32(item.size),...u32(item.size),...u16(item.name.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(item.offset),...item.name]);parts.push(c);offset+=c.length;}const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(offset-start),...u32(start),...u16(0)]);return new Blob([...chunks,...parts,end],{type:'application/zip'});}
  async function downloadAll(){if(!state.outputs.length)return notify('กรุณาสร้างชุดภาพก่อนดาวน์โหลด');const order='วิธีใช้งาน\n1. อัปโหลดไฟล์ตามลำดับชื่อ 01, 02, 03...\n2. หากมีภาพมากกว่า 5 ภาพ Facebook จะแสดง +จำนวนบนภาพที่ 5\n3. ตรวจลำดับอีกครั้งก่อนกดเผยแพร่\n',extras=[{filename:'caption.txt',blob:new Blob([$('#albumCaptionText')?.value||state.caption],{type:'text/plain;charset=utf-8'})},{filename:'upload-order.txt',blob:new Blob([order],{type:'text/plain;charset=utf-8'})}],zip=await makeZip([...state.outputs,...extras]),link=document.createElement('a');link.href=URL.createObjectURL(zip);link.download=`tanjai-facebook-cover-pack-${Date.now()}.zip`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1200);}
  function downloadOne(index){const item=state.outputs[index];if(!item)return;const link=document.createElement('a');link.href=item.url;link.download=item.filename;link.click();}
  function copyCaption(button){const text=$('#albumCaptionText')?.value||state.caption;if(!text)return;navigator.clipboard?.writeText(text);const old=button.textContent;button.textContent='คัดลอกแล้ว ✓';setTimeout(()=>button.textContent=old,1300);}
  function saveProject(){const d=formData(),snapshot={...d,coverMode:state.coverMode,headlineX:state.headlineX,headlineY:state.headlineY,logoX:state.logoX,logoY:state.logoY,brandY:state.brandY},payload=`【ข้อมูลงาน】\nหัวข้อ: ${d.title}\nหน่วยงาน: ${d.org}\nวันที่: ${d.date} ${d.time}\nสถานที่: ${d.place}\nรายละเอียด: ${d.detail}\nวัตถุประสงค์: ${d.purpose}\n\n【แคปชั่น】\n${$('#albumCaptionText')?.value||state.caption}\n\n##TANJAI_ALBUM_V126##${JSON.stringify(snapshot)}`;window.TANJAI?.saveProject?.(d.title||'ชุดภาพโพสต์ Facebook',payload,'ชุดภาพโพสต์ Facebook');}
  function saveBrandProfile(){try{const d=formData();localStorage.setItem(BRAND_STORAGE_KEY,JSON.stringify({enabled:d.brandEnabled,slogan:d.brandSlogan,website:d.brandWebsite,social:d.brandSocial,phone:d.brandPhone}));notify('บันทึกข้อมูลแบรนด์ไว้ใช้ครั้งต่อไปแล้ว');}catch(_){notify('เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูลแบรนด์');}}
  function loadBrandProfile(){try{const saved=JSON.parse(localStorage.getItem(BRAND_STORAGE_KEY)||'null');if(!saved)return;const map={slogan:'album-brandSlogan',website:'album-brandWebsite',social:'album-brandSocial',phone:'album-brandPhone'};Object.entries(map).forEach(([key,id])=>{const el=document.getElementById(id);if(el&&!el.value&&saved[key])el.value=saved[key];});const enabled=$('#album-brandEnabled');if(enabled&&typeof saved.enabled==='boolean')enabled.checked=saved.enabled;}catch(_){} }
  function clearAll(){revokeFiles();revokeOutputs();if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);state.files=[];state.coverId=null;state.logo=null;state.logoUrl='';state.caption='';state.facts={};state.headlineX=50;state.headlineY=57;state.logoX=4;state.logoY=5;state.brandY=74;['album-allFiles','album-logoFile'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});renderPhotoPicker();renderCoverEditor();renderCropList();renderEmptyResult();progress(false);}
  function setCoverMode(mode){state.coverMode=mode==='single'?'single':'double';const input=$('#album-coverMode');if(input)input.value=state.coverMode;$$('[data-cover-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.coverMode===state.coverMode));renderCoverEditor();scheduleGeneratedRefresh();}
  function useCoverTool(tool){
    if(tool==='headline'){const field=$('#album-title');field?.scrollIntoView?.({behavior:'smooth',block:'center'});setTimeout(()=>field?.focus(),250);return;}
    if(tool==='design'){const panel=$('#albumAdvancedEditor');if(panel){panel.open=true;panel.scrollIntoView?.({behavior:'smooth',block:'nearest'});}return;}
    if(tool==='reset'){state.headlineX=50;state.headlineY=57;state.logoX=formData().logoPosition==='right'?86:4;state.logoY=5;state.brandY=74;renderCoverEditor();scheduleGeneratedRefresh();notify('จัดตำแหน่งปกกลับค่าแนะนำแล้ว');}
  }
  async function regenerateCaption(button){
    if(!state.outputs.length)return notify('กรุณาสร้างชุดภาพก่อน');
    state.caption=await generateSmartCaption(formData(),button);const area=$('#albumCaptionText');if(area)area.value=state.caption;renderFacebookPreview();notify('AI เรียบเรียงแคปชั่นใหม่แล้ว กรุณาตรวจข้อมูลก่อนโพสต์');
  }

  document.addEventListener('DOMContentLoaded',()=>{
    loadBrandProfile();renderCropList();renderEmptyResult();
    document.addEventListener('change',event=>{if(event.target.id==='album-allFiles')ingestFiles(event.target.files);if(event.target.id==='album-logoFile')loadLogo(event.target.files?.[0]||null);if(event.target.matches('[data-crop-axis]'))updateCrop(event.target);if(event.target.id==='album-logoPosition'){if(event.target.value==='right')state.logoX=86;if(event.target.value==='left')state.logoX=4;}if(['album-coverStyle','album-headlineFont','album-headlineWeight','album-headlineAlign','album-logoPosition','album-captionStyle','album-brandEnabled'].includes(event.target.id)){renderCoverEditor();scheduleGeneratedRefresh();}});
    document.addEventListener('input',event=>{if(event.target.matches('[data-crop-axis]'))updateCrop(event.target);if(event.target.id==='album-headlineSize')$('#album-fontSizeValue').textContent=event.target.value;if(event.target.id==='album-outlineWidth')$('#album-outlineValue').textContent=event.target.value;if(event.target.id==='album-logoSize')$('#album-logoSizeValue').textContent=event.target.value+'%';if(/^album-(title|orgName|headline|outline|logoSize|brand)/.test(event.target.id)||['album-headlineShadow','album-headlineItalic'].includes(event.target.id)){renderCoverEditor();scheduleGeneratedRefresh();}if(event.target.id==='albumCaptionText')renderFacebookPreview();});
    document.addEventListener('click',event=>{const tool=event.target.closest?.('[data-album-tool]');if(tool){event.preventDefault();useCoverTool(tool.dataset.albumTool);return;}const mode=event.target.closest?.('[data-cover-mode]');if(mode){event.preventDefault();setCoverMode(mode.dataset.coverMode);return;}const cover=event.target.closest?.('[data-cover-id]');if(cover){event.preventDefault();state.coverId=cover.dataset.coverId;renderPhotoPicker();renderCoverEditor();renderCropList();return;}const move=event.target.closest?.('[data-move]');if(move){event.preventDefault();const card=move.closest('[data-file-id]');moveSupport(card?.dataset.fileId,move.dataset.move);return;}const id=event.target.id;if(id==='makeAlbum'){event.preventDefault();generate();}if(id==='albumDownloadAll'||id==='albumDownloadAllResult'){event.preventDefault();downloadAll();}if(id==='albumClear'){event.preventDefault();clearAll();}if(id==='albumCopyCaption'||id==='albumCopyCaptionQuick'){event.preventDefault();copyCaption(event.target);}if(id==='albumRegenerateCaptionAI'){event.preventDefault();regenerateCaption(event.target);}if(id==='albumRefreshPreview'){event.preventDefault();renderFacebookPreview();}if(id==='albumSaveProject'){event.preventDefault();saveProject();}if(id==='albumSaveBrandProfile'){event.preventDefault();saveBrandProfile();}const one=event.target.closest?.('.album-one-download');if(one){event.preventDefault();downloadOne(Number(one.dataset.index));}});
  });
  window.TANJAI=window.TANJAI||{};
  window.TANJAI.applyAlbumTemplate=function(snapshot){Object.entries(snapshot||{}).forEach(([key,value])=>{const id=key.startsWith('album-')?key:`album-${key}`,el=document.getElementById(id);if(!el||typeof value==='object')return;if(el.type==='checkbox')el.checked=!!value;else el.value=value;});if(snapshot?.coverMode)setCoverMode(snapshot.coverMode);if(Number.isFinite(snapshot?.headlineX))state.headlineX=snapshot.headlineX;if(Number.isFinite(snapshot?.headlineY))state.headlineY=snapshot.headlineY;if(Number.isFinite(snapshot?.logoX))state.logoX=snapshot.logoX;if(Number.isFinite(snapshot?.logoY))state.logoY=snapshot.logoY;if(Number.isFinite(snapshot?.brandY))state.brandY=snapshot.brandY;renderCoverEditor();};
  window.TANJAI_ALBUM_PRO={generate,downloadAll,renderFacebookPreview,renderPhotoPicker,renderCropList,_test:{cropPlacement,captionWriter,factGuardCaption,short,metaText,headlineFontSize,normalizeFacts,cleanMultiline,wrapHeadlineLines,brandContacts,hasBrandContent}};
})();

/* V12.6.2 — Facebook Cover Studio
   ปกเดี่ยว/ปกคู่ปรับข้อความได้ + ภาพกิจกรรมครอปสะอาด + พรีวิว 2 บน 3 ล่าง
   ทำงานในเบราว์เซอร์ ไม่สร้างภาพใหม่ ไม่แก้ใบหน้า และไม่ใช้เครดิต AI
*/
(function(){
  'use strict';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  const state={files:[],coverId:null,coverMode:'double',logo:null,logoUrl:'',outputs:[],caption:'',headlineX:50,headlineY:30,drag:null,refreshTimer:null,refreshSeq:0};

  function clean(value){return String(value||'').replace(/\s+/g,' ').trim();}
  function esc(value){return String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function val(id,fallback=''){const el=document.getElementById(id);return el&&typeof el.value==='string'&&el.value.trim()?el.value.trim():fallback;}
  function num(id,fallback){const n=Number(val(id,String(fallback)));return Number.isFinite(n)?n:fallback;}
  function checked(id){return !!document.getElementById(id)?.checked;}
  function selectedCover(){return state.files.find(item=>item.id===state.coverId)||state.files[0]||null;}
  function supportingFiles(){const cover=selectedCover();return state.files.filter(item=>!cover||item.id!==cover.id);}
  function notify(message){if(window.TANJAI?.toast)TANJAI.toast(message);else alert(message);}
  function formData(){return{
    title:val('album-title',''),org:val('album-orgName',''),date:val('album-dateTime',''),time:val('album-time',''),place:val('album-place',''),detail:val('album-detail',''),coverDetail:val('album-coverDetail',''),purpose:val('album-purpose',''),footer:val('album-footer',''),captionStyle:val('album-captionStyle','official'),font:val('album-headlineFont','Prompt'),fontSize:num('album-headlineSize',68),color:val('album-headlineColor','#ffffff'),outlineColor:val('album-outlineColor','#24104f'),outlineWidth:num('album-outlineWidth',4),align:val('album-headlineAlign','center'),logoPosition:val('album-logoPosition','left'),bandColor:val('album-bandColor','#24104f'),bandOpacity:num('album-bandOpacity',82)/100,shadow:checked('album-headlineShadow')
  };}
  function short(value,max=150){const text=clean(value);if(text.length<=max)return text;const cut=text.slice(0,max+1),at=Math.max(cut.lastIndexOf(' '),cut.lastIndexOf(' และ'),cut.lastIndexOf(' เพื่อ'));return(at>max*.55?cut.slice(0,at):cut.slice(0,max)).trim()+'…';}
  function rgba(hex,alpha){const raw=String(hex||'#24104f').replace('#',''),full=raw.length===3?raw.split('').map(x=>x+x).join(''):raw.padEnd(6,'0').slice(0,6);return`rgba(${parseInt(full.slice(0,2),16)},${parseInt(full.slice(2,4),16)},${parseInt(full.slice(4,6),16)},${alpha})`;}
  function revokeFiles(){state.files.forEach(item=>item.url&&URL.revokeObjectURL(item.url));}
  function revokeOutputs(){state.outputs.forEach(item=>item.url&&URL.revokeObjectURL(item.url));state.outputs=[];}
  function makeFileItem(file,index){return{file,id:`${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,url:URL.createObjectURL(file),cropX:50,cropY:50,zoom:1};}

  function ingestFiles(fileList){
    const valid=Array.from(fileList||[]).filter(file=>file.type.startsWith('image/'));if(!valid.length)return;
    revokeFiles();revokeOutputs();const limited=valid.slice(0,60);if(valid.length>60)notify('รองรับสูงสุด 60 ภาพ และเลือกใช้ 60 ภาพแรก');
    state.files=limited.map(makeFileItem);state.coverId=state.files[0]?.id||null;state.headlineX=50;state.headlineY=30;
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
  function coverDetailText(d){return clean(d.coverDetail||d.detail||d.purpose);}
  function detailFontSize(text,isDouble=true){
    const length=clean(text).length;
    if(isDouble){if(length>320)return 14;if(length>240)return 16;if(length>170)return 18;if(length>115)return 20;if(length>70)return 23;return 27;}
    if(length>320)return 13;if(length>240)return 15;if(length>170)return 17;if(length>115)return 19;if(length>70)return 22;return 25;
  }
  function renderCoverEditor(){
    const host=$('#album-coverEditor');if(!host)return;const cover=selectedCover(),d=formData();
    if(!cover){host.className='album-cover-editor is-empty';host.innerHTML='<p>อัปโหลดภาพ แล้วเลือกภาพปกเพื่อเริ่มจัดวาง</p>';return;}
    host.className=`album-cover-editor mode-${state.coverMode}`;
    const logo=(state.logoUrl&&d.logoPosition!=='none')?`<img class="album-editor-logo ${d.logoPosition}" src="${state.logoUrl}" alt="โลโก้จริง">`:'';
    const isDouble=state.coverMode==='double',canvasW=isDouble?2160:1080,detail=coverDetailText(d)||'รายละเอียดสั้นว่าใครทำอะไร',headlineSourceSize=d.fontSize*(isDouble?1.28:1),previewHeadlineSize=headlineSourceSize/canvasW*100,previewOutlineSize=d.outlineWidth*(isDouble?1.35:1)/canvasW*100,previewMetaSize=(isDouble?34:28)/canvasW*100,previewDetailSize=detailFontSize(detail,isDouble)/canvasW*100;
    host.innerHTML=`<div class="album-cover-stage" id="albumCoverStage"><img class="album-editor-photo" src="${cover.url}" alt="ภาพปก" style="object-position:${cover.cropX}% ${cover.cropY}%"><div class="album-editor-shade"></div>${isDouble?'<i class="album-editor-seam" aria-hidden="true"></i>':''}${logo}<div id="albumHeadlineDrag" class="album-headline-drag align-${d.align}" style="left:${state.headlineX}%;top:${state.headlineY}%;font-family:'${esc(d.font)}',sans-serif;font-size:${previewHeadlineSize}cqw;color:${d.color};-webkit-text-stroke:${previewOutlineSize}cqw ${d.outlineColor};text-shadow:${d.shadow?'0 3px 10px rgba(0,0,0,.72)':'none'}">${esc(d.title||'ข้อความพาดหัว')}</div><div class="album-editor-band" style="background:${rgba(d.bandColor,d.bandOpacity)}"><div class="album-editor-meta" style="font-size:${previewMetaSize}cqw">${esc(metaText(d)||'วันที่ · เวลา · สถานที่')}</div><div class="album-editor-detail" style="font-size:${previewDetailSize}cqw">${esc(detail)}</div></div></div>`;
    bindHeadlineDrag();renderWarning();
  }
  function renderWarning(){
    const host=$('#album-coverWarning');if(!host)return;const d=formData(),warnings=[];
    if(d.title.length>90)warnings.push('พาดหัวยาว อาจอ่านไม่ทันบนมือถือ');
    if(coverDetailText(d).length>220)warnings.push('ข้อความใครทำอะไรยาวมาก ระบบจะลดขนาดตัวอักษรเพื่อแสดงให้ครบ');
    if(state.coverMode==='double'&&state.headlineX>43&&state.headlineX<57&&d.title.length>34)warnings.push('พาดหัวอยู่ใกล้รอยต่อกลาง กรุณาตรวจว่าไม่มีตัวอักษรถูกแบ่งครึ่ง');
    if(!d.title)warnings.push('ยังไม่ได้ใส่ข้อความพาดหัว');host.hidden=!warnings.length;host.textContent=warnings.join(' · ');
  }
  function bindHeadlineDrag(){
    const drag=$('#albumHeadlineDrag'),stage=$('#albumCoverStage');if(!drag||!stage)return;
    drag.addEventListener('pointerdown',event=>{event.preventDefault();drag.setPointerCapture?.(event.pointerId);state.drag={stage};drag.classList.add('dragging');});
    drag.addEventListener('pointermove',event=>{if(!state.drag)return;const rect=stage.getBoundingClientRect();state.headlineX=Math.max(8,Math.min(92,((event.clientX-rect.left)/rect.width)*100));state.headlineY=Math.max(10,Math.min(68,((event.clientY-rect.top)/rect.height)*100));drag.style.left=state.headlineX+'%';drag.style.top=state.headlineY+'%';renderWarning();});
    const stop=()=>{if(state.drag)scheduleGeneratedRefresh();state.drag=null;drag.classList.remove('dragging');};drag.addEventListener('pointerup',stop);drag.addEventListener('pointercancel',stop);
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
  function wrapLines(ctx,text,maxWidth,maxLines){const lines=wrapAllLines(ctx,text,maxWidth);if(lines.length<=maxLines)return lines;const out=lines.slice(0,maxLines);let last=out[maxLines-1];while(last.length>1&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);out[maxLines-1]=last.trim()+'…';return out;}
  function fitDetailLines(ctx,text,maxWidth,maxLines,startSize,minSize=8){let size=startSize,lines=[];while(size>=minSize){ctx.font=`600 ${size}px "Sarabun","Noto Sans Thai",sans-serif`;lines=wrapAllLines(ctx,text,maxWidth);if(lines.length<=maxLines)return{size,lines};size--;}return{size:minSize,lines:wrapAllLines(ctx,text,maxWidth)};}
  function drawHeadline(ctx,w,h,d){
    const text=d.title||'ข้อความพาดหัว',size=d.fontSize*(w===2160?1.28:1);ctx.save();ctx.font=`900 ${Math.round(size)}px "${d.font}","Noto Sans Thai",sans-serif`;ctx.textBaseline='middle';ctx.textAlign=d.align;
    const maxWidth=w*.82,lines=wrapLines(ctx,text,maxWidth,3),lineH=size*1.18,x=w*(state.headlineX/100),centerY=h*(state.headlineY/100),startY=centerY-((lines.length-1)*lineH)/2;ctx.lineJoin='round';ctx.miterLimit=2;
    if(d.shadow){ctx.shadowColor='rgba(0,0,0,.72)';ctx.shadowBlur=Math.max(10,size*.18);ctx.shadowOffsetY=Math.max(3,size*.06);}
    lines.forEach((line,index)=>{let drawX=x;if(d.align==='left')drawX=Math.max(w*.06,x-maxWidth/2);if(d.align==='right')drawX=Math.min(w*.94,x+maxWidth/2);if(d.outlineWidth>0){ctx.lineWidth=d.outlineWidth*(w===2160?1.35:1);ctx.strokeStyle=d.outlineColor;ctx.strokeText(line,drawX,startY+index*lineH,maxWidth);}ctx.fillStyle=d.color;ctx.fillText(line,drawX,startY+index*lineH,maxWidth);});ctx.restore();
  }
  function drawContained(ctx,img,x,y,maxW,maxH){const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,scale=Math.min(maxW/iw,maxH/ih),w=iw*scale,h=ih*scale;ctx.drawImage(img,x+(maxW-w)/2,y+(maxH-h)/2,w,h);}
  function drawBand(ctx,w,h,d){
    const bandH=190,y=h-bandH,meta=metaText(d),detail=coverDetailText(d);ctx.save();ctx.fillStyle=rgba(d.bandColor,d.bandOpacity);ctx.fillRect(0,y,w,bandH);const line=ctx.createLinearGradient(0,0,w,0);line.addColorStop(0,'#f5c84c');line.addColorStop(1,'rgba(255,255,255,.15)');ctx.fillStyle=line;ctx.fillRect(0,y,w,8);ctx.fillStyle='#fff';ctx.textBaseline='middle';
    if(w===2160){ctx.font='700 34px "Sarabun","Noto Sans Thai",sans-serif';ctx.textAlign='center';wrapLines(ctx,meta||'วันที่ · เวลา · สถานที่',850,2).forEach((txt,i)=>ctx.fillText(txt,540,y+72+i*46,850));const fitted=fitDetailLines(ctx,detail||'รายละเอียดว่าใครทำอะไร',900,5,detailFontSize(detail,true)),lineH=Math.round(fitted.size*1.28),start=y+98-((fitted.lines.length-1)*lineH)/2;fitted.lines.forEach((txt,i)=>ctx.fillText(txt,1620,start+i*lineH,900));ctx.fillStyle='rgba(255,255,255,.24)';ctx.fillRect(1079,y+24,2,bandH-48);}else{ctx.textAlign='left';ctx.font='700 28px "Sarabun","Noto Sans Thai",sans-serif';ctx.fillText(short(meta||'วันที่ · เวลา · สถานที่',70),54,y+48,972);const fitted=fitDetailLines(ctx,detail||'รายละเอียดว่าใครทำอะไร',972,5,detailFontSize(detail,false)),lineH=Math.round(fitted.size*1.28),start=y+120-((fitted.lines.length-1)*lineH)/2;fitted.lines.forEach((txt,i)=>ctx.fillText(txt,54,start+i*lineH,972));}ctx.restore();
  }
  function drawCoverOverlays(ctx,w,h,d){
    const top=ctx.createLinearGradient(0,0,0,h*.58);top.addColorStop(0,'rgba(0,0,0,.38)');top.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=top;ctx.fillRect(0,0,w,h*.62);
    if(state.logo&&d.logoPosition!=='none'){const box=150,x=d.logoPosition==='right'?w-box-58:58;ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=18;drawContained(ctx,state.logo,x,44,box,box);ctx.restore();}drawHeadline(ctx,w,h,d);drawBand(ctx,w,h,d);
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
    state.refreshTimer=setTimeout(async()=>{try{const covers=await buildCover();if(seq!==state.refreshSeq){covers.forEach(item=>URL.revokeObjectURL(item.url));return;}const photos=state.outputs.filter(item=>item.role!=='cover'),oldCovers=state.outputs.filter(item=>item.role==='cover');oldCovers.forEach(item=>URL.revokeObjectURL(item.url));state.outputs=[...covers,...photos];state.caption=captionWriter(formData());renderOutputs();}catch(error){console.error(error);}},280);
  }

  function factGuardCaption(text){return String(text||'').split('\n').map(line=>line.trimEnd()).filter(line=>line&&!/undefined|null|placeholder|กรอกข้อมูล/i.test(line)).join('\n').replace(/\n{3,}/g,'\n\n').trim();}
  function captionWriter(d,style=d.captionStyle||'official'){
    const title=clean(d.title),org=clean(d.org),detail=clean(d.detail),purpose=clean(d.purpose),footer=clean(d.footer),blocks=[],icon=style==='friendly'?'✨':style==='story'?'📷':style==='announcement'?'📣':'📌';if(title)blocks.push(`${icon} ${title}`);
    const body=org&&detail?`${org} ${detail}`:detail||org;if(body)blocks.push(body);const meta=[d.date&&`📅 ${d.date}${d.time?' '+d.time:''}`,d.place&&`📍 ${d.place}`].filter(Boolean).join('\n');if(meta)blocks.push(meta);if(purpose)blocks.push(purpose);if(footer)blocks.push(footer);return factGuardCaption(blocks.join('\n\n'));
  }
  function progress(show,label='กำลังสร้างชุดภาพ...',percent=0){let box=$('#albumProgress');if(!box){box=document.createElement('div');box.id='albumProgress';box.className='album-progress-bar-wrap';box.innerHTML='<div class="album-progress-bar" id="albumProgressInner"></div><small id="albumProgressLabel"></small>';$('#albumResult')?.prepend(box);}box.style.display=show?'block':'none';const bar=$('#albumProgressInner'),text=$('#albumProgressLabel');if(bar)bar.style.width=percent+'%';if(text)text.textContent=label;}
  async function generate(){
    const d=formData(),cover=selectedCover();if(!cover)return notify('กรุณาอัปโหลดและเลือกภาพปก');if(!d.title)return notify('กรุณาใส่ข้อความพาดหัวบนภาพปก');revokeOutputs();const btn=$('#makeAlbum'),old=btn?.textContent;if(btn){btn.disabled=true;btn.textContent='กำลังสร้าง...';}
    try{if(document.fonts?.ready)await document.fonts.ready;progress(true,'กำลังสร้างภาพปก...',8);state.outputs.push(...await buildCover());const supports=supportingFiles(),offset=state.outputs.length+1;for(let i=0;i<supports.length;i++){progress(true,`กำลังครอปภาพกิจกรรม ${i+1}/${supports.length}...`,Math.round(10+((i+1)/Math.max(1,supports.length))*78));state.outputs.push(await buildSupport(supports[i],i,offset));}state.caption=captionWriter(d,d.captionStyle);progress(true,'กำลังจัดตัวอย่าง Facebook...',95);renderOutputs();progress(true,'เสร็จแล้ว ✓',100);setTimeout(()=>progress(false),1200);}catch(error){console.error(error);notify('สร้างชุดภาพไม่สำเร็จ กรุณาตรวจไฟล์ภาพแล้วลองใหม่');progress(false);}finally{if(btn){btn.disabled=false;btn.textContent=old||'สร้างชุดภาพและแคปชั่น';}}
  }

  function previewCells(){const visible=state.outputs.slice(0,5),total=state.outputs.length;return visible.map((item,index)=>`<div class="fb-five-cell cell-${index+1}"><img src="${item.url}" alt="ภาพที่ ${index+1}">${index===4&&total>5?`<span class="fb-preview-more">+${total-5}</span>`:''}</div>`).join('');}
  function renderFacebookPreview(){const host=$('#albumFacebookPreview');if(!host)return;const d=formData(),caption=$('#albumCaptionText')?.value||state.caption;host.innerHTML=`<div class="fb-preview-card"><div class="fb-preview-head"><div class="fb-preview-avatar">${state.logoUrl?`<img src="${state.logoUrl}" alt="">`:'เพจ'}</div><div><div class="fb-preview-name">${esc(d.org||'ชื่อเพจของคุณ')}</div><div class="fb-preview-time">เมื่อสักครู่ · 🌐</div></div></div><div class="fb-preview-caption">${esc(caption).replace(/\n/g,'<br>')}</div><div class="fb-five-grid count-${Math.min(5,state.outputs.length)}">${previewCells()}</div><div class="fb-preview-foot">ตัวอย่างลำดับภาพบน Facebook · 2 ภาพบน + 3 ภาพล่าง${state.outputs.length>5?` · ภาพที่ 5 แสดง +${state.outputs.length-5}`:''}</div></div>`;}
  function renderOutputs(){
    const host=$('#albumResult .ready-main')||$('#albumResult');if(!host)return;host.innerHTML=`<div class="album-pro-panel"><section class="album-preview-section album-post-first"><div class="album-preview-title"><div><b>ตัวอย่างโพสต์ Facebook</b><p>ตรวจลำดับ ภาพปก รอยต่อ และเครื่องหมาย +จำนวน ก่อนดาวน์โหลด</p></div><span class="album-ready-badge">${state.outputs.length} ภาพ · 1080 × 1080</span></div><div class="album-post-actions"><button class="btn primary" id="albumCopyCaptionQuick">คัดลอกแคปชั่น</button><button class="btn secondary" id="albumDownloadAllResult">ดาวน์โหลด ZIP</button></div><div id="albumFacebookPreview"></div></section><details class="album-review-details album-caption-edit-details" open><summary><span><b>แคปชั่นพร้อมโพสต์</b><small>สร้างจากข้อมูลจริงที่กรอก แก้ไขได้ก่อนคัดลอก</small></span></summary><div class="album-caption-box"><textarea id="albumCaptionText" rows="9">${esc(state.caption)}</textarea><div class="album-caption-actions"><button class="btn primary" id="albumCopyCaption">คัดลอกแคปชั่น</button><button class="btn secondary" id="albumRefreshPreview">อัปเดตตัวอย่าง</button><button class="btn secondary" id="albumSaveProject">💾 บันทึกงาน</button></div></div></details><details class="album-review-details"><summary><span><b>ตรวจและดาวน์โหลดภาพรายใบ</b><small>เฉพาะภาพปกมีข้อความ ภาพกิจกรรมเป็นภาพจริงครอปสะอาด</small></span></summary><div class="album-output-grid">${state.outputs.map((item,index)=>`<article><img src="${item.url}" alt="ภาพที่ ${index+1}"><b>${esc(item.filename)}</b><button class="btn secondary album-one-download" data-index="${index}">ดาวน์โหลด</button></article>`).join('')}</div></details></div>`;renderFacebookPreview();
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
  function saveProject(){const d=formData(),snapshot={...d,coverMode:state.coverMode,headlineX:state.headlineX,headlineY:state.headlineY},payload=`【ข้อมูลงาน】\nหัวข้อ: ${d.title}\nหน่วยงาน: ${d.org}\nวันที่: ${d.date} ${d.time}\nสถานที่: ${d.place}\nรายละเอียด: ${d.detail}\nวัตถุประสงค์: ${d.purpose}\n\n【แคปชั่น】\n${$('#albumCaptionText')?.value||state.caption}\n\n##TANJAI_ALBUM_V126##${JSON.stringify(snapshot)}`;window.TANJAI?.saveProject?.(d.title||'ชุดภาพโพสต์ Facebook',payload,'ชุดภาพโพสต์ Facebook');}
  function clearAll(){revokeFiles();revokeOutputs();if(state.logoUrl)URL.revokeObjectURL(state.logoUrl);state.files=[];state.coverId=null;state.logo=null;state.logoUrl='';state.caption='';state.headlineX=50;state.headlineY=30;['album-allFiles','album-logoFile'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});renderPhotoPicker();renderCoverEditor();renderCropList();renderEmptyResult();progress(false);}
  function setCoverMode(mode){state.coverMode=mode==='single'?'single':'double';const input=$('#album-coverMode');if(input)input.value=state.coverMode;$$('[data-cover-mode]').forEach(button=>button.classList.toggle('selected',button.dataset.coverMode===state.coverMode));renderCoverEditor();scheduleGeneratedRefresh();}

  document.addEventListener('DOMContentLoaded',()=>{
    renderCropList();renderEmptyResult();
    document.addEventListener('change',event=>{if(event.target.id==='album-allFiles')ingestFiles(event.target.files);if(event.target.id==='album-logoFile')loadLogo(event.target.files?.[0]||null);if(event.target.matches('[data-crop-axis]'))updateCrop(event.target);if(['album-headlineFont','album-headlineAlign','album-logoPosition','album-captionStyle'].includes(event.target.id)){renderCoverEditor();scheduleGeneratedRefresh();}});
    document.addEventListener('input',event=>{if(event.target.matches('[data-crop-axis]'))updateCrop(event.target);if(event.target.id==='album-headlineSize')$('#album-fontSizeValue').textContent=event.target.value;if(event.target.id==='album-outlineWidth')$('#album-outlineValue').textContent=event.target.value;if(event.target.id==='album-bandOpacity')$('#album-bandOpacityValue').textContent=event.target.value+'%';if(/^album-(title|orgName|dateTime|time|place|detail|coverDetail|headline|outline|band)/.test(event.target.id)||event.target.id==='album-headlineShadow'){renderCoverEditor();scheduleGeneratedRefresh();}if(event.target.id==='albumCaptionText')renderFacebookPreview();});
    document.addEventListener('click',event=>{const mode=event.target.closest?.('[data-cover-mode]');if(mode){event.preventDefault();setCoverMode(mode.dataset.coverMode);return;}const cover=event.target.closest?.('[data-cover-id]');if(cover){event.preventDefault();state.coverId=cover.dataset.coverId;renderPhotoPicker();renderCoverEditor();renderCropList();return;}const move=event.target.closest?.('[data-move]');if(move){event.preventDefault();const card=move.closest('[data-file-id]');moveSupport(card?.dataset.fileId,move.dataset.move);return;}const id=event.target.id;if(id==='makeAlbum'){event.preventDefault();generate();}if(id==='albumDownloadAll'||id==='albumDownloadAllResult'){event.preventDefault();downloadAll();}if(id==='albumClear'){event.preventDefault();clearAll();}if(id==='albumCopyCaption'||id==='albumCopyCaptionQuick'){event.preventDefault();copyCaption(event.target);}if(id==='albumRefreshPreview'){event.preventDefault();renderFacebookPreview();}if(id==='albumSaveProject'){event.preventDefault();saveProject();}const one=event.target.closest?.('.album-one-download');if(one){event.preventDefault();downloadOne(Number(one.dataset.index));}});
  });
  window.TANJAI=window.TANJAI||{};
  window.TANJAI.applyAlbumTemplate=function(snapshot){Object.entries(snapshot||{}).forEach(([key,value])=>{const id=key.startsWith('album-')?key:`album-${key}`,el=document.getElementById(id);if(el&&typeof value!=='object')el.value=value;});if(snapshot?.coverMode)setCoverMode(snapshot.coverMode);if(Number.isFinite(snapshot?.headlineX))state.headlineX=snapshot.headlineX;if(Number.isFinite(snapshot?.headlineY))state.headlineY=snapshot.headlineY;renderCoverEditor();};
  window.TANJAI_ALBUM_PRO={generate,downloadAll,renderFacebookPreview,renderPhotoPicker,renderCropList,_test:{cropPlacement,captionWriter,factGuardCaption,short,metaText,coverDetailText,detailFontSize}};
})();

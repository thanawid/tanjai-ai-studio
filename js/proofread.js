/* v8.6.7 — Smart Thai Proofread
   Customer-ready proofreading: confident corrections + protected words per customer/org.
*/
(function(){
  window.TANJAI = window.TANJAI || {};
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const STORE_KEY = "tanjai_protected_words_v1";

  const CONFIDENT = [
    ["เทสบาล","เทศบาล"],
    ["ประกดิษฐ์","ประดิษฐ์"],
    ["แนนว","แนว"],
    ["แนวตั้งง","แนวตั้ง"],
    ["แนวนอนน","แนวนอน"],
    ["สคลิปต์","สคริปต์"],
    ["สคลิป","สคริปต์"],
    ["สคริปเสียง","สคริปต์เสียง"],
    ["ข้องความ","ข้อความ"],
    ["ข้อ้งความ","ข้อความ"],
    ["ใ้ห","ให้"],
    ["ใ้ห้","ให้"],
    ["ไห้","ให้"],
    ["ใสเอง","ใส่เอง"],
    ["ใสโลโก้","ใส่โลโก้"],
    ["ใสข้อความ","ใส่ข้อความ"],
    ["อเนกประสง","อเนกประสงค์"],
    ["เอนกประสงค์","อเนกประสงค์"],
    ["ประชาสัมพันธ์์","ประชาสัมพันธ์"],
    ["ประชาสัมพันธื","ประชาสัมพันธ์"],
    ["ประชาสัมพันธ์ุ","ประชาสัมพันธ์"],
    ["เฟสบุ๊ค","Facebook"],
    ["เฟสบุ๊ค","Facebook"],
    ["เฟส","Facebook"],
    ["ไลน์","Line"],
    ["ซิบ","ZIP"],
    ["ซิป","ZIP"],
    ["โหลดไม่ได้ซักที","โหลดไม่ได้สักที"],
    ["โชวื","โชว์"],
    ["เว็ป","เว็บ"],
    ["เวป","เว็บ"],
    ["ทันสัมย","ทันสมัย"],
    ["สมส่วนกับข้อความ","สมส่วนกับข้อความ"]
  ];

  const SUGGEST_ONLY = [
    ["ฟ้อน","ฟอนต์"],
    ["ฟ้อนต์","ฟอนต์"],
    ["คอนเทน","คอนเทนต์"],
    ["อัลบั้ม","อัลบัม"],
    ["ก๊อป","คัดลอก"],
    ["ก๊อปปี้","คัดลอก"]
  ];

  const DEFAULT_PROTECTED = [
    "ทันใจ AI Studio",
    "Tanjai AI Studio",
    "Thanawid Sangsakol",
    "AI Router",
    "Facebook",
    "Line",
    "Canva",
    "CapCut",
    "ChatGPT",
    "ZIP"
  ];

  function esc(s){ return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
  function escapeRegExp(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function clean(s){ return String(s||"").replace(/\s+/g," ").trim(); }
  function unique(arr){ return Array.from(new Set(arr.map(clean).filter(Boolean))); }

  function getProtected(){
    try{
      const raw=localStorage.getItem(STORE_KEY);
      const custom=raw ? JSON.parse(raw) : [];
      return unique(DEFAULT_PROTECTED.concat(Array.isArray(custom)?custom:[]));
    }catch(e){
      return DEFAULT_PROTECTED.slice();
    }
  }
  function getCustomProtected(){
    try{
      const raw=localStorage.getItem(STORE_KEY);
      const arr=raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(e){ return []; }
  }
  function saveCustomProtected(lines){
    const arr=unique(String(lines||"").split(/\n+/));
    localStorage.setItem(STORE_KEY, JSON.stringify(arr));
    return arr;
  }
  function protectText(text, protectedWords){
    let out=String(text||"");
    const map=[];
    protectedWords
      .filter(w=>w && w.length>=2)
      .sort((a,b)=>b.length-a.length)
      .forEach((w,i)=>{
        const token=`⟦TANJAI_PROTECTED_${i}⟧`;
        const re=new RegExp(escapeRegExp(w),"g");
        if(re.test(out)){
          out=out.replace(re, token);
          map.push([token,w]);
        }
      });
    return {text:out,map};
  }
  function restoreText(text,map){
    let out=String(text||"");
    map.forEach(([token,w])=>{ out=out.split(token).join(w); });
    return out;
  }
  function applyRules(text){
    const protectedWords=getProtected();
    const p=protectText(text,protectedWords);
    let out=p.text;
    const changes=[];
    CONFIDENT.forEach(([bad,good])=>{
      if(!bad || bad===good) return;
      const re=new RegExp(escapeRegExp(bad),"g");
      if(re.test(out)){
        out=out.replace(re,good);
        changes.push({bad,good,type:"auto"});
      }
    });
    const buddhistYearBefore = out;
    out=out.replace(/พ\.ศ\.\s*(\d{4})/g,"พ.ศ. $1");
    if(out!==buddhistYearBefore) changes.push({bad:"พ.ศ.ปี",good:"พ.ศ. ปี",type:"auto"});
    const suggestions=[];
    SUGGEST_ONLY.forEach(([bad,good])=>{
      const re=new RegExp(escapeRegExp(bad),"g");
      if(re.test(out)) suggestions.push({bad,good,type:"suggest"});
    });
    out=restoreText(out,p.map);
    return {text:out, changed: out!==String(text||""), changes, suggestions};
  }
  function fieldsInActiveView(){
    const view=$(".view.active") || document;
    return $$('textarea,input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="password"]):not([type="button"]):not([type="submit"])', view)
      .filter(el => !el.disabled && !el.readOnly && !el.closest(".proofread-modal") && !el.dataset.proofreadSkip);
  }
  function runActive(showReport=true){
    const fields=fieldsInActiveView();
    let changed=0;
    const found=[], suggestions=[];
    fields.forEach(el=>{
      const before=el.value || "";
      if(!before.trim()) return;
      const r=applyRules(before);
      if(r.changed){
        el.value=r.text;
        changed++;
        found.push(...r.changes.map(c=>`${c.bad} → ${c.good}`));
        el.dispatchEvent(new Event("input",{bubbles:true}));
        el.dispatchEvent(new Event("change",{bubbles:true}));
      }
      suggestions.push(...r.suggestions.map(s=>`${s.bad} → ${s.good}`));
    });
    if(showReport) showReportBox(changed, unique(found), unique(suggestions));
    else if(changed && window.TANJAI.toast) TANJAI.toast(`ตรวจคำผิดแล้ว แก้คำที่มั่นใจ ${changed} ช่อง`);
    return {changed, found:unique(found), suggestions:unique(suggestions)};
  }
  function showReportBox(changed, found, suggestions){
    const modal=ensureModal();
    $(".proofread-report",modal).innerHTML = `
      <div class="proofread-result-card">
        <b>ผลการตรวจคำผิด</b>
        <p>แก้อัตโนมัติ ${changed} ช่อง เฉพาะคำที่ระบบมั่นใจ</p>
        ${found.length?`<div class="proofread-list"><strong>คำที่แก้แล้ว</strong>${found.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:`<small>ไม่พบคำผิดที่ระบบมั่นใจว่าควรแก้</small>`}
        ${suggestions.length?`<div class="proofread-list warn"><strong>คำที่ควรพิจารณาเอง</strong>${suggestions.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:""}
      </div>`;
    openModal();
  }
  function ensureModal(){
    let modal=$("#proofreadModal");
    if(modal) return modal;
    modal=document.createElement("div");
    modal.id="proofreadModal";
    modal.className="proofread-modal";
    modal.innerHTML=`
      <div class="proofread-backdrop" data-proofread-close></div>
      <section class="proofread-card" role="dialog" aria-label="Smart Thai Proofread">
        <div class="proofread-head">
          <div>
            <small>SMART THAI PROOFREAD</small>
            <h3>ตรวจคำผิด + คำสำคัญของลูกค้า</h3>
          </div>
          <button type="button" class="proofread-close" data-proofread-close>×</button>
        </div>
        <p class="proofread-help">ระบบจะแก้เฉพาะคำที่มั่นใจ ส่วนชื่อหน่วยงาน ชื่อคน ชื่อสถานที่ หรือชื่อโครงการ ให้เพิ่มไว้ใน “คำสำคัญของลูกค้า” เพื่อไม่ให้ระบบแก้อัตโนมัติ</p>
        <label class="proofread-label">คำสำคัญของลูกค้า / องค์กร <span>ใส่คำละ 1 บรรทัด</span>
          <textarea id="protectedWordsInput" data-proofread-skip="1" rows="7" placeholder="เช่น&#10;ชื่อหน่วยงาน&#10;ชื่อผู้บริหาร&#10;ชื่อโครงการ&#10;ชื่อสถานที่"></textarea>
        </label>
        <div class="proofread-actions">
          <button type="button" class="btn primary" id="proofreadRun">ตรวจคำผิดหน้านี้</button>
          <button type="button" class="btn secondary" id="proofreadSaveWords">บันทึกคำสำคัญ</button>
        </div>
        <div class="proofread-report"></div>
      </section>
    `;
    document.body.appendChild(modal);
    return modal;
  }
  function openModal(){
    const modal=ensureModal();
    const input=$("#protectedWordsInput",modal);
    if(input) input.value=getCustomProtected().join("\n");
    modal.classList.add("open");
  }
  function closeModal(){
    $("#proofreadModal")?.classList.remove("open");
  }
  function injectButton(){
    const actions=$(".top-actions");
    if(!actions || $("#openProofreadTop")) return;
    const btn=document.createElement("button");
    btn.className="btn secondary proofread-top-btn";
    btn.id="openProofreadTop";
    btn.type="button";
    btn.textContent="ตรวจคำผิด";
    try{
      const logout=$("#logoutBtn",actions);
      // ป้องกันกรณี header ถูก re-render แบบ async ระหว่างที่เรา query กับตอน insert
      // ทำให้ logout ที่หาไว้ไม่ใช่ลูกของ actions อีกต่อไป (สาเหตุของ NotFoundError เดิม)
      if(logout && logout.parentNode===actions){
        actions.insertBefore(btn, logout);
      }else{
        actions.appendChild(btn);
      }
    }catch(_){
      actions.appendChild(btn);
    }
  }

  document.addEventListener("DOMContentLoaded",()=>{
    injectButton();
    ensureModal();

    document.addEventListener("click",(e)=>{
      if(e.target.closest("#openProofreadTop") || e.target.closest("#openProofreadNav")){
        e.preventDefault(); openModal();
      }
      if(e.target.closest("[data-proofread-close]")){
        e.preventDefault(); closeModal();
      }
      if(e.target.closest("#proofreadSaveWords")){
        e.preventDefault();
        const input=$("#protectedWordsInput");
        const arr=saveCustomProtected(input?input.value:"");
        if(window.TANJAI.toast) TANJAI.toast(`บันทึกคำสำคัญ ${arr.length} คำแล้ว`);
      }
      if(e.target.closest("#proofreadRun")){
        e.preventDefault();
        saveCustomProtected($("#protectedWordsInput")?.value || "");
        runActive(true);
      }
    }, true);

    // Run safe corrections before every main generate action without changing UI flow.
    document.addEventListener("click",(e)=>{
      const btn=e.target.closest("button");
      if(!btn || !btn.id) return;
      if(/^make[A-Z]/.test(btn.id)){
        runActive(false);
      }
    }, true);

    document.addEventListener("keydown",(e)=>{
      if(e.key==="Escape") closeModal();
    });
  });

  window.TANJAI.proofread = { runActive, applyRules, getProtected, saveCustomProtected, openModal };
})();

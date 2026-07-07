/* V8.6 — Dashboard Sales Ready UX + Album Pro Fix
   Non-destructive patch: keeps sidebar/tools, only reorganizes dashboard cards and neutral copy.
*/
(function(){
  const $=(q,r=document)=>r.querySelector(q);
  const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));

  const routes = {
    router:"#router",
    kit:"#kit",
    image:"#image",
    post:"#post",
    video:"#video",
    voice:"#voice",
    deck:"#deck",
    album:"#album",
    projects:"#projects",
    prompt:"#prompt",
    destination:"#destination",
    examples:"#examples",
    guide:"#guide"
  };

  function go(hash){
    if(hash) location.hash = hash;
    setTimeout(()=>window.dispatchEvent(new HashChangeEvent("hashchange")), 10);
  }

  function neutralizeCopy(root=document){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const changes=[
      ["งาน"+"ประชาสัมพันธ์"+"ไทย","งานสื่อสารองค์กร / โซเชียล / แบรนด์"],
      ["ประชาชนทั่วไป","กลุ่มเป้าหมายหลัก"],
      ["เทศบาลเมืองบางรักน้อย","ชื่อหน่วยงาน / แบรนด์"],
      ["นายสุชาติ แก้วประดิษฐ์","ชื่อผู้เกี่ยวข้อง"],
      ["นายกเทศมนตรีเมืองบางรักน้อย","ตำแหน่ง / บทบาท"]
    ];
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n=>{
      let val=n.nodeValue || "";
      let next=val;
      changes.forEach(([a,b])=>{ next = next.split(a).join(b); });
      if(next!==val) n.nodeValue=next;
    });
    $$("input,textarea").forEach(el=>{
      if(el.placeholder){
        el.placeholder=el.placeholder
          .split("เช่น เทศบาลเมืองบางรักน้อย").join("เช่น ชื่อหน่วยงาน / องค์กร / ร้านค้า / เพจ / แบรนด์")
          .split("เทศบาลเมืองบางรักน้อย").join("ชื่อหน่วยงาน / แบรนด์")
          .split("นายสุชาติ แก้วประดิษฐ์").join("ชื่อผู้เกี่ยวข้อง")
          .split("ประชาชนทั่วไป").join("ลูกค้า / แฟนเพจ / ผู้เข้าร่วมกิจกรรม");
      }
    });
  }

  function card(icon,title,desc,hash,tag,primary){
    return `<button class="v86-card ${primary?'primary':''}" data-go="${hash}">
      <div class="v86-card-icon">${icon}</div>
      <div class="v86-card-body">
        <strong>${title}</strong>
        <span>${desc}</span>
        <em>${tag}</em>
      </div>
    </button>`;
  }

  function renderDashboard(){
    const dash = $("#dashboard");
    if(!dash || dash.dataset.v86Ready==="1") return false;

    const oldChildren = Array.from(dash.children);
    oldChildren.forEach(ch=>{ ch.classList.add("v86-original-dashboard-hidden"); });

    const panel=document.createElement("section");
    panel.className="v86-dashboard";
    panel.innerHTML=`
      <div class="v86-hero">
        <div>
          <p class="eyebrow">Sales Ready Dashboard</p>
          <h1>เริ่มสร้างสื่อให้พร้อมโพสต์</h1>
          <p>รวมเครื่องมือหลักให้อยู่เป็นกลุ่ม ใช้งานง่ายขึ้น ไม่ใช่เมนูรวมทุกอย่าง</p>
        </div>
        <div class="v86-hero-badge">V8.6</div>
      </div>

      <div class="v86-main-grid">
        ${card("✨","เริ่มต้นด้วย AI Router","ไม่รู้จะเริ่มตรงไหน ให้ระบบช่วยพาไปเครื่องมือที่เหมาะ","router","เริ่มต้น",true)}
        ${card("🎨","สร้างสื่อครบชุด","รวมภาพ โพสต์ วิดีโอ เสียงพากย์ และสไลด์ไว้ในกลุ่มเดียว","media","เครื่องมือหลัก",true)}
        ${card("🖼️","ชุดภาพโพสต์ Facebook Pro","อัปโหลดหลายภาพ ใส่กรอบ สร้างแคปชั่น พรีวิวก่อนโพสต์ และโหลด ZIP","album","ฟีเจอร์เด่น",true)}
        ${card("📁","โปรเจกต์ / งานที่บันทึกไว้","กลับมาดูงานเดิม เก็บไอเดีย และต่อยอดคอนเทนต์","projects","จัดการงาน",false)}
        ${card("🧰","เครื่องมือเสริม","Prompt Hub เครื่องมือปลายทาง ตัวอย่างงาน และคู่มือระบบ","extras","เสริมการทำงาน",false)}
      </div>

      <div class="v86-subpanel" id="v86MediaPanel" hidden>
        <div class="v86-subhead">
          <strong>สร้างสื่อครบชุด</strong>
          <span>เลือกเครื่องมือย่อยที่ต้องการใช้งาน</span>
        </div>
        <div class="v86-mini-grid">
          ${card("🖌️","สร้างภาพ","สร้าง prompt และบรีฟสำหรับภาพประชาสัมพันธ์","image","ภาพ",false)}
          ${card("✍️","โพสต์ / สรุปงาน","สรุปงาน เขียนโพสต์ แคปชั่น และข้อความเผยแพร่","post","ข้อความ",false)}
          ${card("🎬","ทำวิดีโอ","คิดโครงคลิป สคริปต์ และช็อตวิดีโอ","video","วิดีโอ",false)}
          ${card("🎙️","เสียงพากย์","เขียนสคริปต์เสียงอ่านธรรมชาติ","voice","เสียง",false)}
          ${card("📊","ทำสไลด์","วางโครงสไลด์และเนื้อหานำเสนอ","deck","สไลด์",false)}
        </div>
      </div>

      <div class="v86-subpanel" id="v86ExtrasPanel" hidden>
        <div class="v86-subhead">
          <strong>เครื่องมือเสริม</strong>
          <span>ใช้เมื่ออยากต่อยอด ปรับ prompt หรือดูตัวอย่าง</span>
        </div>
        <div class="v86-mini-grid">
          ${card("🧠","Prompt Hub","รวม prompt และแนวทางคิดงาน","prompt","ไอเดีย",false)}
          ${card("🛠️","เครื่องมือปลายทาง","รวมเครื่องมือช่วยส่งต่อชิ้นงาน","destination","ต่อยอด",false)}
          ${card("🖼️","ตัวอย่างงาน","ดูตัวอย่างภาพ/งานเพื่อเลือกแนวทาง","examples","ตัวอย่าง",false)}
          ${card("📘","คู่มือระบบ","วิธีใช้งานและแนวทางอัปเดตเว็บ","guide","คู่มือ",false)}
        </div>
      </div>

      <p class="v86-note">เมนูด้านข้างยังอยู่ครบทั้งหมด เพียงจัดหน้าแรกให้เลือกง่ายและพร้อมขายมากขึ้น</p>
    `;
    dash.prepend(panel);
    dash.dataset.v86Ready="1";

    panel.addEventListener("click",(e)=>{
      const btn=e.target.closest("[data-go]");
      if(!btn) return;
      const key=btn.dataset.go;
      if(key==="media"){
        const p=$("#v86MediaPanel"); if(p) p.hidden=!p.hidden;
        const ex=$("#v86ExtrasPanel"); if(ex) ex.hidden=true;
        return;
      }
      if(key==="extras"){
        const p=$("#v86ExtrasPanel"); if(p) p.hidden=!p.hidden;
        const mp=$("#v86MediaPanel"); if(mp) mp.hidden=true;
        return;
      }
      if(routes[key]) go(routes[key]);
    });
    return true;
  }

  function ensureAlbumMultiple(){
    const inp=$("#album-files");
    if(inp){
      inp.setAttribute("multiple","multiple");
      inp.setAttribute("accept","image/*");
      const field=inp.closest(".field") || inp.parentElement;
      if(field && !field.querySelector(".v86-upload-note")){
        const small=document.createElement("small");
        small.className="v86-upload-note";
        small.textContent="เลือกได้หลายภาพพร้อมกัน เช่น 5–20 ภาพ";
        field.insertBefore(small, inp);
      }
    }
  }

  function broadenTargets(){
    $$("select").forEach(sel=>{
      const txt=sel.innerText||"";
      const near=(sel.id||"")+" "+(sel.name||"")+" "+txt;
      if(/target|กลุ่มเป้าหมาย|ประชาชนทั่วไป/i.test(near) && !txt.includes("ลูกค้า / ผู้ซื้อสินค้า")){
        sel.innerHTML=`
          <option>ให้ AI เลือกให้เหมาะสม</option>
          <option>ลูกค้า / ผู้ซื้อสินค้า</option>
          <option>แฟนเพจ / ผู้ติดตาม</option>
          <option>ผู้เข้าร่วมกิจกรรม</option>
          <option>ผู้ปกครอง / นักเรียน</option>
          <option>พนักงาน / บุคลากรภายใน</option>
          <option>ผู้บริหาร / คณะกรรมการ</option>
          <option>สมาชิกชุมชน</option>
          <option>ประชาชนทั่วไป</option>
          <option>กลุ่มเป้าหมายเฉพาะ</option>`;
      }
    });
  }

  function apply(){
    neutralizeCopy();
    renderDashboard();
    ensureAlbumMultiple();
    broadenTargets();
  }

  document.addEventListener("DOMContentLoaded",()=>{
    apply();
    setTimeout(apply,250);
    setTimeout(apply,900);
  });
  window.addEventListener("hashchange",()=>setTimeout(apply,80));
  window.TANJAI_V86_PATCH={apply,renderDashboard,ensureAlbumMultiple};
})();
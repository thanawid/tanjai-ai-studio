window.TANJAI = window.TANJAI || {};

document.addEventListener("DOMContentLoaded", () => {
  const $ = TANJAI.$, $$ = TANJAI.$$;
  const TANJAI_CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio";
  TANJAI.normalizeGPTUrl = function(url){
    if(!url) return url;
    if(String(url).includes("g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio")) return TANJAI_CUSTOM_GPT_URL;
    return url;
  };

  
  const opts = arr => arr.map(x => `<option>${x}</option>`).join("");
  const toolOptions = {
    orgTypes: ["เทศบาล / อบต. / หน่วยงานราชการ","โรงเรียน / ศูนย์พัฒนาเด็กเล็ก","โรงพยาบาล / สาธารณสุข","ร้านค้า / ธุรกิจ / สินค้า","เพจ / ครีเอเตอร์ / ยูทูบเบอร์","ศิลปิน / เพลง / โปรโมทผลงาน","อื่น ๆ"],
    mainCategories: ["แจ้งข่าว / ประกาศ","กิจกรรม / โครงการ / อบรม","รณรงค์ / ให้ความรู้","คอนเทนต์โซเชียล / คำคม","โปรโมชัน / โฆษณา","สรุปผลงาน / รายงานผล","อื่น ๆ"],
    subCategories: ["แจ้งข่าวสำคัญ","ข่าวด่วน","เชิญร่วมกิจกรรม","โครงการปลูกต้นไม้","อบรมให้ความรู้","ลงพื้นที่","รณรงค์ป้องกันโรค","คำคม","โปรโมทสินค้า","ปกคลิป / ปกเพลง","ทำคลิปสั้น","กำหนดเอง"],
    channels: ["Facebook","Line OA","TikTok / Reels","Instagram","YouTube Community","ประกาศภายใน","หลายช่องทาง"],
    postLengths: ["สั้น กระชับ","มาตรฐาน อ่านง่าย","ละเอียดครบถ้วน","แคปชั่นสั้นมาก"],
    layouts: ["Hero Center Layout","Split Layout ซ้ายข้อความ ขวาภาพ","Infographic Layout","Poster Layout","Clean Social Card","ภาพเต็ม + กล่องข้อความ"],
    densities: ["สมดุล อ่านง่าย","โล่งมาก ดูแพง","ข้อมูลเยอะ แต่อ่านง่าย","แน่นแบบ Infographic"],
    focuses: ["เน้นหัวข้อหลัก","เน้นภาพบุคคล","เน้นภาพกิจกรรม","เน้นสินค้า / โปรโมชัน","เน้นบรรยากาศ","เน้นโลโก้หน่วยงาน"],
    colorTones: ["เขียว เหลือง ขาว แบบหน่วยงานท้องถิ่น","ม่วง ทอง เทคโนโลยี","น้ำเงิน ขาว ทางการ","ชมพู ม่วง สดใส","ดำ ทอง พรีเมียม","ให้ AI เลือกให้เหมาะสม"],
    videoFormats: ["คลิปประชาสัมพันธ์","คลิปข่าวด่วน","คลิปกิจกรรม / โครงการ","คลิปรีวิว","คลิปโซเชียลไวรัล","คลิปแนวสารคดีสั้น"],
    slideStyles: ["ทางการสำหรับผู้บริหาร","สรุปประชุม","นำเสนอโครงการ","รายงานผล","Pitch Deck","สไลด์อบรม"],
    workTypes: ["นายกลงพื้นที่","ติดตามปัญหาประชาชน","ตรวจงานโครงการ","กิจกรรมเทศบาล","อบรม / ประชุม","ลงพื้นที่ช่วยเหลือ","รณรงค์ / ประชาสัมพันธ์","อื่น ๆ"]
  };

// Render forms
  $("#routerForm").innerHTML = `<div class="form-section"><div class="section-title"><b>?</b><h4>อยากทำอะไรครับ?</h4></div><label class="full">พิมพ์โจทย์ของพี่<textarea id="router-query" placeholder="เช่น อยากทำโพสต์ประชาสัมพันธ์โครงการปลูกต้นไม้ / อยากทำเสียงพากย์คลิปแจ้งข่าว / อยากทำสไลด์นำเสนอ"></textarea></label></div><div class="button-row"><button class="btn primary" id="askRouter">ให้ Router แนะนำ</button><button class="btn secondary" id="goRecommended">ไปที่เมนูที่แนะนำ</button></div>`;
  $("#routerResult").innerHTML = TANJAI.resultShell("router", "คำแนะนำจาก AI Router", "ระบบจะแนะนำเมนูและปลายทางที่เหมาะกับโจทย์", "routerOut", `<button class="btn primary" data-copybox="routerOut">คัดลอกคำแนะนำ</button>`);

  $("#imageForm").innerHTML = TANJAI.field("image") + `
    <div class="form-note">หน้านี้ใช้สำหรับสร้างภาพโดยเฉพาะ คืน dropdown รายละเอียดแบบเต็ม เพื่อให้ Prompt ภาพแม่นขึ้น และเพิ่มโหมดภาพจริงเพื่อกันหน้าเพี้ยน</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ภาพอ้างอิง / ภาพจริง</h4></div>
      <div class="form-grid">
        <label class="full">แนบภาพจริง / ภาพอ้างอิง
          <input id="image-photos" type="file" accept="image/*" multiple>
          <small>ถ้าเป็นภาพบุคคลจริง ภาพกิจกรรม หรือภาพผู้บริหาร แนะนำใช้โหมดภาพจริงเพื่อคงหน้าคนและฉากเดิม</small>
          <div id="image-photoPreview" class="upload-preview-grid"></div>
        </label>
      </div>
    </div>
    <div class="form-section"><div class="section-title"><b>3</b><h4>โหมดการใช้ภาพ</h4></div>
      <div class="form-grid">
        <label class="full">โหมดการใช้ภาพ<select id="image-useMode">
          <option>สร้างภาพใหม่ด้วย AI</option>
          <option>ใช้ภาพจริงเป็นต้นฉบับ</option>
          <option>ปรับภาพจริง + ใส่กราฟิก</option>
          <option>รีทัชภาพจริง</option>
        </select><small>เลือกให้ตรงกับลักษณะงาน เพื่อลดโอกาสหน้าเพี้ยนและช่วยให้ Prompt แม่นขึ้น</small></label>
        <label id="image-originalityWrap">ระดับการคงต้นฉบับ<select id="image-originalityLevel">
          <option>สูงสุด — คงคน คงฉาก คงองค์ประกอบเดิมมากที่สุด</option>
          <option>สมดุล — ปรับภาพได้มากขึ้น แต่ยังไม่เปลี่ยนบุคคล</option>
          <option>ยืดหยุ่น — ใช้เมื่อยอมให้มีการตกแต่งภาพมากขึ้น</option>
        </select></label>
        <div class="full preset-wrap">
          <small class="preset-label">Preset ใช้งานเร็ว</small>
          <div class="preset-row">
            <button type="button" class="chip-btn" data-image-preset="real-post">โพสต์จากภาพจริง</button>
            <button type="button" class="chip-btn" data-image-preset="real-poster">โปสเตอร์จากภาพจริง</button>
            <button type="button" class="chip-btn" data-image-preset="beautify">ปรับภาพให้สวย</button>
            <button type="button" class="chip-btn" data-image-preset="retouch">รีทัชแบบไม่เปลี่ยนคน</button>
          </div>
        </div>
        <div id="image-photoHint" class="full soft-alert" hidden>พบภาพแนบจริง แนะนำใช้โหมด “ใช้ภาพจริงเป็นต้นฉบับ” เพื่อป้องกันหน้าเพี้ยน</div>
        <div id="image-generateWarn" class="full warning-alert" hidden>
          <div>คำเตือน: การเลือกโหมดสร้างภาพใหม่ อาจทำให้บุคคลในภาพเปลี่ยนไปจากต้นฉบับ</div>
          <div class="inline-actions">
            <button type="button" class="btn secondary" id="image-useSafeMode">ใช้โหมดภาพจริงแทน</button>
            <button type="button" class="btn ghost" id="image-continueGenerate">สร้างใหม่ต่อ</button>
          </div>
        </div>
      </div>
    </div>
    <div class="form-section" id="image-safetyWrap"><div class="section-title"><b>4</b><h4>การปกป้องภาพจริง</h4></div>
      <p class="mini-note">เหมาะสำหรับภาพกิจกรรม ภาพผู้บริหาร ภาพประชาสัมพันธ์ และภาพถ่ายจริงที่ต้องการคงบุคคลเดิม</p>
      <div class="safe-check-grid">
        <label class="checkline"><input id="image-safeUseMain" type="checkbox" checked> ใช้ภาพจริงเป็นภาพหลัก</label>
        <label class="checkline"><input id="image-safeFace" type="checkbox" checked> ห้ามเปลี่ยนใบหน้า</label>
        <label class="checkline"><input id="image-safeNewPerson" type="checkbox" checked> ห้ามสร้างบุคคลใหม่</label>
        <label class="checkline"><input id="image-safeLook" type="checkbox" checked> ห้ามเปลี่ยนทรงผม / ชุด / รูปร่าง</label>
        <label class="checkline"><input id="image-safeScene" type="checkbox" checked> ห้ามเปลี่ยนฉากหลัก</label>
        <label class="checkline"><input id="image-safeAdjustOnly" type="checkbox" checked> อนุญาตเฉพาะการปรับแสง สี ความคมชัด</label>
        <label class="checkline"><input id="image-safeOverlay" type="checkbox" checked> อนุญาตให้ใส่ข้อความ / กรอบ / กล่องข้อความ / กราฟิกเสริม</label>
        <label class="checkline"><input id="image-safeNoCover" type="checkbox" checked> ห้ามบังใบหน้าหรือรายละเอียดสำคัญ</label>
      </div>
    </div>
    <div class="form-section"><div class="section-title"><b>5</b><h4>ประเภทงานและช่องทาง</h4></div>
      <div class="form-grid">
        <label>ประเภทองค์กร<select id="image-orgType">${opts(toolOptions.orgTypes)}</select></label>
        <label>หมวดงานหลัก<select id="image-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
        <label>หัวข้องานย่อย<select id="image-subCategory">${opts(toolOptions.subCategories)}</select></label>
        <label>ช่องทาง / ขนาดภาพ<select id="image-size">${opts(TANJAI.categories.sizes)}</select></label>
      </div>
    </div>
    <div class="form-section"><div class="section-title"><b>6</b><h4>แนวภาพและความสวย</h4></div>
      <div class="form-grid">
        <label>สไตล์ภาพ<select id="image-style">${opts(TANJAI.categories.imageStyles)}</select></label>
        <label>Layout<select id="image-layout">${opts(toolOptions.layouts)}</select></label>
        <label>โทนสี<select id="image-colorTone">${opts(toolOptions.colorTones)}</select></label>
        <label>ความหนาแน่น<select id="image-density">${opts(toolOptions.densities)}</select></label>
        <label>จุดเด่นของภาพ<select id="image-focus">${opts(toolOptions.focuses)}</select></label>
        <label>โทนภาษา<select id="image-tone">${opts(TANJAI.categories.tones)}</select></label>
        <label class="full">ข้อห้าม / หมายเหตุ<textarea id="image-avoid" placeholder="เช่น ห้ามสร้าง QR ปลอม ห้ามวาดโลโก้ใหม่ เว้นพื้นที่ด้านบน ใช้รูปจริงตามแนบ"></textarea></label>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeImage">สร้าง Prompt ภาพ</button><button class="btn secondary" id="saveImage">บันทึก</button></div>
  `;
  $("#postForm").innerHTML = TANJAI.field("post") + `
    <div class="form-note">เมนูนี้ใช้สรุปงานจากข้อมูลและรูปภาพ เช่น นายกลงพื้นที่ ตรวจงาน ช่วยเหลือประชาชน แล้วนำไปต่อได้ทั้งนำเสนอ ทำคลิป และโพสต์โซเชียล</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าสคริปต์สรุปงาน</h4></div>
      <div class="form-grid">
        <label>ประเภทงาน<select id="post-workType">${opts(toolOptions.workTypes || ["นายกลงพื้นที่","กิจกรรมเทศบาล","อื่น ๆ"])}</select></label>
        <label>ใช้ต่อเป็นหลัก<select id="post-channel"><option>ครบชุด: นำเสนอ + ทำคลิป + โพสต์โซเชียล</option><option>สรุปสำหรับผู้บริหาร</option><option>สคริปต์ทำคลิป</option><option>โพสต์ Facebook / Line</option><option>Bullet สำหรับสไลด์</option></select></label>
        <label>ความยาว<select id="post-length">${opts(toolOptions.postLengths)}</select></label>
        <label>หมวดงาน<select id="post-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
        <label class="full">แนบรูปประกอบ / รูปลงพื้นที่
          <input id="post-photos" type="file" accept="image/*" multiple>
          <small>หมายเหตุ: เว็บนี้จะช่วยจัด Prompt และแสดงตัวอย่างรูป จากนั้นนำ Prompt พร้อมรูปไปใช้กับ AI ที่วิเคราะห์ภาพได้ เช่น ChatGPT</small>
          <div id="post-photoPreview" class="upload-preview-grid"></div>
        </label>
        <label class="full">สิ่งที่อยากให้เน้นเพิ่มเติม<textarea id="post-extra" placeholder="เช่น เน้นการรับฟังปัญหา การตรวจสอบพื้นที่ การประสานหน่วยงาน หรือผลลัพธ์ที่ประชาชนได้รับ"></textarea></label>
      </div>
      <div class="summary-output-tabs">
        <span class="summary-chip">สรุปผู้บริหาร</span>
        <span class="summary-chip">สคริปต์คลิป</span>
        <span class="summary-chip">โพสต์โซเชียล</span>
        <span class="summary-chip">Bullet สไลด์</span>
        <span class="summary-chip">ข้อความบนภาพ</span>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makePost">สร้างสคริปต์สรุปงาน</button><button class="btn secondary" id="savePost">บันทึก</button></div>`;
  $("#videoForm").innerHTML = TANJAI.field("video") + `
    <div class="form-note">เมนูนี้ใช้ทำวิดีโอหรือทำคลิปได้โดยตรง สร้าง Hook, Storyboard, Voice Over และข้อความบนจอ</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าวิดีโอ / คลิป</h4></div>
      <div class="form-grid">
        <label>ความยาว<select id="video-length">${opts(TANJAI.categories.videoLengths)}</select></label>
        <label>รูปแบบคลิป<select id="video-format">${opts(toolOptions.videoFormats)}</select></label>
        <label>ช่องทาง<select id="video-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="video-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVideo">สร้าง Storyboard / คลิป</button><button class="btn secondary" id="saveVideo">บันทึก</button></div>`;
  $("#voiceForm").innerHTML = TANJAI.field("voice") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าเสียง</h4></div>
      <div class="form-grid">
        <label>ความยาวเสียง<select id="voice-length">${opts(TANJAI.categories.voiceLengths)}</select></label>
        <label>สไตล์เสียง<select id="voice-style">${opts(TANJAI.categories.voiceStyles)}</select></label>
        <label>ช่องทางใช้งาน<select id="voice-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="voice-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVoice">สร้างสคริปต์เสียง</button><button class="btn secondary" id="saveVoice">บันทึก</button></div>`;
  $("#deckForm").innerHTML = TANJAI.field("deck") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าสไลด์</h4></div>
      <div class="form-grid">
        <label>จำนวนสไลด์<select id="deck-count"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></label>
        <label>รูปแบบสไลด์<select id="deck-format">${opts(toolOptions.slideStyles)}</select></label>
        <label>หมวดงาน<select id="deck-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeDeck">สร้าง Outline</button><button class="btn secondary" id="saveDeck">บันทึก</button></div>`;
  $("#kitForm").innerHTML = TANJAI.field("kit") + `<div class="button-row"><button class="btn primary" id="makeKit">สร้างชุดสื่อ</button><button class="btn secondary" id="saveKit">บันทึก</button></div>`;

  // Results
  $("#imageResult").innerHTML = TANJAI.resultShell("image", "Prompt ภาพ", "คัดลอกไปใช้กับ ChatGPT / Canva / AI สร้างภาพ", "imageOut", `<button class="btn primary" data-copybox="imageOut">คัดลอก Prompt ภาพ</button>`);
  $("#postResult").innerHTML = TANJAI.resultShell("post", "สคริปต์สรุปงาน", "ใช้ต่อได้ทั้งนำเสนอ ทำคลิป และโพสต์โซเชียล", "postOut", `<button class="btn primary" data-copybox="postOut">คัดลอกโพสต์</button>`);
  $("#videoResult").innerHTML = TANJAI.resultShell("video", "Storyboard", "คัดลอกไปใช้กับ CapCut / ทีมถ่าย / คลิปสั้น", "videoOut", `<button class="btn primary" data-copybox="videoOut">คัดลอก Storyboard</button>`);
  $("#voiceResult").innerHTML = TANJAI.resultShell("voice", "สคริปต์เสียงพากย์", "คัดลอกไปใช้กับ CapCut หรือ Voice Tool", "voiceOut", `<button class="btn primary" data-copybox="voiceOut">คัดลอกสคริปต์เสียง</button>`);
  $("#deckResult").innerHTML = TANJAI.resultShell("deck", "Outline สไลด์", "คัดลอกไปทำ Canva, Slide Tool หรือ Notebook Tool", "deckOut", `<button class="btn primary" data-copybox="deckOut">คัดลอก Outline</button>`);
  $("#kitResult").innerHTML = TANJAI.resultShell("kit", "ชุดสื่อครบแพ็ก", "ได้ภาพ โพสต์ วิดีโอ เสียง และสไลด์จากข้อมูลเดียว", "kitOut", `<button class="btn primary" data-copybox="kitOut">คัดลอกชุดสื่อ</button>`);

  TANJAI.renderLibrary();
  TANJAI.renderPromptHub();
  TANJAI.renderDestinations();
  TANJAI.renderProjects();



  // v6.2.7 Login Gate Semi-Pro
  (function(){
    const PASSCODE = "tanjai2569"; // เปลี่ยนรหัสได้ที่บรรทัดนี้
    const AUTH_KEY = "tanjai_ai_auth_until";
    const SESSION_KEY = "tanjai_ai_session";
    const REMEMBER_MS = 3 * 24 * 60 * 60 * 1000;

    const loginGate = document.getElementById("loginGate");
    const loginForm = document.getElementById("loginForm");
    const loginPassword = document.getElementById("loginPassword");
    const rememberLogin = document.getElementById("rememberLogin");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");

    const now = () => Date.now();
    const storedUntil = Number(localStorage.getItem(AUTH_KEY) || 0);
    const hasSession = sessionStorage.getItem(SESSION_KEY) === "1";

    function unlock(){
      document.body.classList.remove("auth-locked");
      if(loginError) loginError.textContent = "";
    }

    function lock(){
      document.body.classList.add("auth-locked");
      if(loginPassword) setTimeout(()=>loginPassword.focus(), 80);
    }

    if(storedUntil > now() || hasSession){
      unlock();
    }else{
      lock();
    }

    if(loginForm){
      loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const value = (loginPassword?.value || "").trim();
        if(value === PASSCODE){
          if(rememberLogin?.checked){
            localStorage.setItem(AUTH_KEY, String(now() + REMEMBER_MS));
            sessionStorage.removeItem(SESSION_KEY);
          }else{
            sessionStorage.setItem(SESSION_KEY, "1");
            localStorage.removeItem(AUTH_KEY);
          }
          if(loginPassword) loginPassword.value = "";
          unlock();
          TANJAI.toast?.("เข้าสู่ระบบแล้ว");
        }else{
          if(loginError) loginError.textContent = "รหัสไม่ถูกต้อง กรุณาลองอีกครั้ง";
          if(loginPassword){
            loginPassword.select();
            loginPassword.focus();
          }
        }
      });
    }

    if(logoutBtn){
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        lock();
        TANJAI.toast?.("ออกจากระบบแล้ว");
      });
    }
  })();


  // v6.1.4 mobile drawer menu
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const closeSidebar = () => document.body.classList.remove("sidebar-open");
  if(mobileMenuBtn){
    mobileMenuBtn.addEventListener("click", e => {
      e.preventDefault();
      document.body.classList.toggle("sidebar-open");
    });
  }
  if(sidebarOverlay){ sidebarOverlay.addEventListener("click", closeSidebar); }
  window.addEventListener("keydown", e => { if(e.key === "Escape") closeSidebar(); });
  document.addEventListener("click", e => {
    const item = e.target.closest(".nav-link,[data-view]");
    if(item && window.matchMedia("(max-width:1180px)").matches) closeSidebar();
  });



  // v6.2 Random Preview Cards
  (function(){
    const imgs = Array.from(document.querySelectorAll("[data-random-previews]"));
    imgs.forEach(img => {
      const list = (img.dataset.randomPreviews || "").split("|").map(x=>x.trim()).filter(Boolean);
      if(list.length){
        img.src = list[Math.floor(Math.random() * list.length)];
      }
    });
  })();
  const renderUploadPreview = (inputId, previewId) => {
    const input = $(inputId), preview = $(previewId);
    if(!input || !preview) return;
    const files = Array.from(input.files || []);
    preview.innerHTML = files.map(file => {
      const src = URL.createObjectURL(file);
      return `<figure><img src="${src}" alt="${file.name}"><figcaption>${file.name}</figcaption></figure>`;
    }).join("");
  };

  const setImageSafeChecks = (checked=true) => {
    ["safeUseMain","safeFace","safeNewPerson","safeLook","safeScene","safeAdjustOnly","safeOverlay","safeNoCover"].forEach(key=>{
      const el = $(`#image-${key}`); if(el) el.checked = checked;
    });
  };

  const setImageOriginalityByMode = mode => {
    const level = $("#image-originalityLevel");
    if(!level) return;
    if(mode === "ใช้ภาพจริงเป็นต้นฉบับ" || mode === "รีทัชภาพจริง") level.value = "สูงสุด — คงคน คงฉาก คงองค์ประกอบเดิมมากที่สุด";
    else if(mode === "ปรับภาพจริง + ใส่กราฟิก") level.value = "สมดุล — ปรับภาพได้มากขึ้น แต่ยังไม่เปลี่ยนบุคคล";
  };

  const refreshImageModeUI = () => {
    const mode = $("#image-useMode")?.value || "สร้างภาพใหม่ด้วย AI";
    const photoCount = $("#image-photos")?.files?.length || 0;
    const safetyWrap = $("#image-safetyWrap");
    const originalityWrap = $("#image-originalityWrap");
    const hint = $("#image-photoHint");
    const warn = $("#image-generateWarn");
    if(safetyWrap) safetyWrap.style.display = mode === "สร้างภาพใหม่ด้วย AI" ? "none" : "block";
    if(originalityWrap) originalityWrap.style.display = mode === "สร้างภาพใหม่ด้วย AI" ? "none" : "block";
    if(hint) hint.hidden = !(photoCount > 0);
    if(warn) warn.hidden = !(photoCount > 0 && mode === "สร้างภาพใหม่ด้วย AI");
  };

  const recommendRealPhotoMode = (force=false) => {
    const input = $("#image-photos"), mode = $("#image-useMode");
    if(!input || !mode) return;
    const hasFiles = (input.files?.length || 0) > 0;
    if(hasFiles && (force || !mode.dataset.userChanged)){
      mode.value = "ใช้ภาพจริงเป็นต้นฉบับ";
      setImageSafeChecks(true);
      setImageOriginalityByMode(mode.value);
    }
    if(!hasFiles && !mode.dataset.userChanged){
      mode.value = "สร้างภาพใหม่ด้วย AI";
    }
    refreshImageModeUI();
  };

  const applyImagePreset = preset => {
    const mode = $("#image-useMode");
    if(!mode) return;
    if(preset === "real-post" || preset === "real-poster"){
      mode.value = "ปรับภาพจริง + ใส่กราฟิก";
      setImageSafeChecks(true);
      $("#image-originalityLevel").value = "สมดุล — ปรับภาพได้มากขึ้น แต่ยังไม่เปลี่ยนบุคคล";
    }else if(preset === "beautify" || preset === "retouch"){
      mode.value = "รีทัชภาพจริง";
      setImageSafeChecks(true);
      $("#image-originalityLevel").value = "สูงสุด — คงคน คงฉาก คงองค์ประกอบเดิมมากที่สุด";
    }
    mode.dataset.userChanged = "1";
    refreshImageModeUI();
    TANJAI.toast("ตั้งค่าโหมดภาพจริงให้แล้ว");
  };

  const setupImageSafeMode = () => {
    const imageInput = $("#image-photos");
    const mode = $("#image-useMode");
    imageInput?.addEventListener("change", ()=>{
      renderUploadPreview("#image-photos", "#image-photoPreview");
      recommendRealPhotoMode(true);
    });
    mode?.addEventListener("change", ()=>{
      mode.dataset.userChanged = "1";
      if(mode.value !== "สร้างภาพใหม่ด้วย AI"){
        setImageOriginalityByMode(mode.value);
        setImageSafeChecks(true);
      }
      refreshImageModeUI();
    });
    $("#image-useSafeMode")?.addEventListener("click", ()=>{
      if(mode){
        mode.value = "ใช้ภาพจริงเป็นต้นฉบับ";
        mode.dataset.userChanged = "1";
        setImageSafeChecks(true);
        setImageOriginalityByMode(mode.value);
        refreshImageModeUI();
      }
    });
    $("#image-continueGenerate")?.addEventListener("click", ()=>{
      $("#image-generateWarn").hidden = true;
    });
    $$("[data-image-preset]").forEach(btn => btn.addEventListener("click", ()=>applyImagePreset(btn.dataset.imagePreset)));
    recommendRealPhotoMode(false);
    refreshImageModeUI();
  };

  setupImageSafeMode();


  // Navigation

  // v6.1.2 fallback: กันเมนูซ้าย/การ์ดหน้าแรกคลิกไม่ได้
  document.addEventListener("click", e => {
    const viewBtn = e.target.closest("[data-view]");
    if(viewBtn && viewBtn.dataset.view){
      e.preventDefault();
      TANJAI.switchView(viewBtn.dataset.view);
    }
  }, true);

  $$("[data-view]").forEach(btn => btn.addEventListener("click", () => TANJAI.switchView(btn.dataset.view)));
  document.body.addEventListener("click", e => {
    const t = e.target.closest("[data-template]"); if(t){TANJAI.applyTemplate(t.dataset.template); return;}
    const o = e.target.closest("[data-open]"); if(o){window.open(TANJAI.normalizeGPTUrl(o.dataset.open), "_blank", "noopener,noreferrer"); return;}
    const c = e.target.closest("[data-copybox]"); if(c){TANJAI.copyText($("#"+c.dataset.copybox)?.textContent || ""); return;}
  });

  let recommendedView="image";
  $("#askRouter").onclick = () => {
    const q=$("#router-query").value || "อยากทำภาพประชาสัมพันธ์";
    const rec=TANJAI.routerSuggest(q);
    $("#routerOut").textContent=rec.text;
    recommendedView=rec.view;
    TANJAI.toast("Router แนะนำเมนูให้แล้ว");
  };
  $("#goRecommended").onclick = () => TANJAI.switchView(recommendedView);


  // v6.2.8 setup navigation history
  TANJAI.setupNavigationHistory?.();

  // Generators
  $("#makeImage").onclick = () => {
    const d=TANJAI.commonData("image");
    const imageFiles = Array.from($("#image-photos")?.files || []);
    d.photoCount = imageFiles.length;
    d.photoNames = imageFiles.map(f=>f.name).join(", ");
    const out=TANJAI.imagePrompt(d);
    $("#imageOut").textContent=out;
    TANJAI.state.lastImage=out;
    TANJAI.toast("สร้าง Prompt ภาพแล้ว");
  };
  $("#makePost").onclick = () => { const d=TANJAI.commonData("post"); const out=TANJAI.postText(d); $("#postOut").textContent=out; TANJAI.state.lastPost=out; TANJAI.toast("สร้างโพสต์แล้ว"); };
  $("#makeVideo").onclick = () => { const d=TANJAI.commonData("video"); const out=TANJAI.videoStoryboard(d, $("#video-length").value); $("#videoOut").textContent=out; TANJAI.state.lastVideo=out; TANJAI.toast("สร้าง Storyboard แล้ว"); };
  $("#makeVoice").onclick = () => { const d=TANJAI.commonData("voice"); const out=TANJAI.voiceScript(d, $("#voice-length").value, $("#voice-style").value); $("#voiceOut").textContent=out; TANJAI.state.lastVoice=out; TANJAI.toast("สร้างสคริปต์เสียงแล้ว"); };
  $("#makeDeck").onclick = () => { const d=TANJAI.commonData("deck"); const out=TANJAI.deckOutline(d, Number($("#deck-count").value)); $("#deckOut").textContent=out; TANJAI.state.lastDeck=out; TANJAI.toast("สร้าง Outline สไลด์แล้ว"); };
  $("#makeKit").onclick = () => {
    const d=TANJAI.commonData("kit");
    const out = `ชุดสื่อ: ${d.title}

=== 1) Prompt ภาพ ===
${TANJAI.imagePrompt({...d, size:"4:5 Facebook / Line 1080x1350", style:"Modern Premium Clean"})}

=== 2) โพสต์ ===
${TANJAI.postText(d)}

=== 3) Storyboard วิดีโอ ===
${TANJAI.videoStoryboard(d, "60 วินาที")}

=== 4) สคริปต์เสียงพากย์ ===
${TANJAI.voiceScript(d, "60 วินาที", "ทางการ สุภาพ")}

=== 5) Outline สไลด์ ===
${TANJAI.deckOutline(d, 8)}`;
    $("#kitOut").textContent=out; TANJAI.state.lastKit=out; TANJAI.toast("สร้างชุดสื่อแล้ว");
  };


  // Save
  $("#saveImage").onclick = () => TANJAI.saveProject($("#image-title").value || "สร้างภาพ", $("#imageOut").textContent, "สร้างภาพ");
  $("#savePost").onclick = () => TANJAI.saveProject($("#post-title").value || "เขียนโพสต์", $("#postOut").textContent, "เขียนโพสต์");
  $("#saveVideo").onclick = () => TANJAI.saveProject($("#video-title").value || "ทำวิดีโอ", $("#videoOut").textContent, "ทำวิดีโอ");
  $("#saveVoice").onclick = () => TANJAI.saveProject($("#voice-title").value || "เสียงพากย์", $("#voiceOut").textContent, "เสียงพากย์");
  $("#saveDeck").onclick = () => TANJAI.saveProject($("#deck-title").value || "ทำสไลด์", $("#deckOut").textContent, "ทำสไลด์");
  $("#saveKit").onclick = () => TANJAI.saveProject($("#kit-title").value || "สร้างชุดสื่อ", $("#kitOut").textContent, "สร้างชุดสื่อ");

  $("#clearProjects").onclick = () => { localStorage.removeItem("tanjaiV5Projects"); TANJAI.renderProjects(); TANJAI.toast("ล้างโปรเจกต์แล้ว"); };
});

window.TANJAI = window.TANJAI || {};

document.addEventListener("DOMContentLoaded", () => {
  const $ = TANJAI.$, $$ = TANJAI.$$;
  const TANJAI_CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio";
  TANJAI.customGptUrl = TANJAI_CUSTOM_GPT_URL;
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
    colorTones: ["ม่วง–ทอง พรีเมียม","ม่วง–ทอง เทคโนโลยี","น้ำเงิน–ขาว ทางการ","ชมพู–ม่วง สดใส","ดำ–ทอง หรูหรา","ให้ AI เลือกให้เหมาะสม"],
    videoFormats: ["คลิปประชาสัมพันธ์","คลิปข่าวด่วน","คลิปกิจกรรม / โครงการ","คลิปรีวิว","คลิปโซเชียลไวรัล","คลิปแนวสารคดีสั้น"],
    slideStyles: ["ทางการสำหรับผู้บริหาร","สรุปประชุม","นำเสนอโครงการ","รายงานผล","Pitch Deck","สไลด์อบรม"],
    workTypes: ["นายกลงพื้นที่","ติดตามปัญหากลุ่มเป้าหมาย","ตรวจงานโครงการ","กิจกรรมเทศบาล","อบรม / ประชุม","ลงพื้นที่ช่วยเหลือ","รณรงค์ / ประชาสัมพันธ์","อื่น ๆ"]
  };

// Render forms
  $("#routerForm").innerHTML = `<div class="form-section"><div class="section-title"><b>?</b><h4>อยากทำอะไรครับ?</h4></div><label class="full">พิมพ์โจทย์ของพี่<textarea id="router-query" placeholder="เช่น อยากทำโพสต์ประชาสัมพันธ์โครงการปลูกต้นไม้ / อยากทำเสียงพากย์คลิปแจ้งข่าว / อยากทำสไลด์นำเสนอ"></textarea></label></div><div class="button-row"><button class="btn primary" id="askRouter">ให้ Router แนะนำ</button><button class="btn secondary" id="goRecommended">ไปที่เมนูที่แนะนำ</button></div>`;
  $("#routerResult").innerHTML = TANJAI.resultShell("router", "คำแนะนำจาก AI Router", "ระบบจะแนะนำเมนูและปลายทางที่เหมาะกับโจทย์", "routerOut", `<button class="btn primary" data-copybox="routerOut">คัดลอกคำแนะนำ</button>`);

  $("#imageForm").innerHTML = TANJAI.field("image") + `
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
    <input id="image-smartCoach" type="hidden" value="on">
    <input id="image-smartThinking" type="hidden" value="ให้ AI ช่วยคิดต่ออัตโนมัติ">
    <input id="image-smartOutput" type="hidden" value="สรุปคำสั่ง + Prompt พร้อมส่งเข้า GPT">
    <input id="image-smartBackup" type="hidden" value="on">
    <input id="image-smartConfirm" type="hidden" value="on">
    <input id="image-smartMunicipal" type="hidden" value="on">
    <div class="form-section" id="image-safetyWrap">
<div class="section-title"><b>4</b><h4>การปกป้องภาพจริง</h4></div>
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
    <div class="button-row"><button class="btn primary" id="makeImage">สร้างคำสั่งภาพ</button><button class="btn secondary" id="saveImage">บันทึก</button></div>
  `;

  $("#albumForm").innerHTML = `
    <div class="form-section"><div class="section-title"><b>1</b><h4>อัปโหลดภาพจริง</h4></div>
      <label class="full">เลือกภาพหลายภาพ
        <div class="field">
          <label>โลโก้จริง / โปรไฟล์เพจ (ไม่บังคับ)</label>
          <input id="album-logoFile" type="file" accept="image/*">
          <small>ถ้าไม่ใส่ ระบบจะไม่สร้าง badge หลอกบนภาพ</small>
        </div>
        <div class="field">
          <label>โหมดการจัดวางภาพ</label>
          <select id="album-layoutMode">
            <option>สมดุลภาพและข้อความ</option>
            <option>ภาพกิจกรรมเน้นภาพ / แถบเล็ก</option>
            <option>ปก + สรุป + ภาพกิจกรรม</option>
          </select>
        </div>
        <small>เลือกได้หลายภาพพร้อมกัน เช่น 5–20 ภาพ</small>
        <input id="album-files" type="file" accept="image/*" multiple><small>โหมดนี้ปรับภาพจริงเท่านั้น ไม่สร้างภาพใหม่ ไม่เปลี่ยนหน้า ไม่แก้องค์ประกอบหลัก</small></label>
      <div id="album-preview" class="album-upload-preview"></div>
    </div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ข้อมูลบนกรอบภาพ</h4></div>
      <div class="form-grid">
        <label>หัวข้องาน<input id="album-title" placeholder="เช่น ชื่องาน / กิจกรรม / ประกาศ / แคมเปญ"></label>
        <label>หน่วยงาน<input id="album-orgName" placeholder="เช่น ชื่อหน่วยงาน / องค์กร / ร้านค้า / เพจ / แบรนด์"></label>
        <label>วันที่<input id="album-dateTime" placeholder="เช่น วันที่จัดกิจกรรม / วันที่เผยแพร่"></label>
        <label>สถานที่<input id="album-place" placeholder="เช่น สถานที่จัดงาน / พื้นที่ / ช่องทาง / สาขา"></label>
        <label class="full">ใคร / ทำอะไร<textarea id="album-detail" placeholder="เช่น ใคร / ทำอะไร / เพื่ออะไร / มีประเด็นสำคัญอะไร"></textarea></label>
        <label class="full">ข้อความปิดท้าย<input id="album-footer" placeholder="เช่น สโลแกน / ข้อความปิดท้าย / แฮชแท็ก / คำเชิญชวน"></label>
      </div>
    </div>
    <div class="form-section"><div class="section-title"><b>3</b><h4>ตั้งค่าชุดภาพ</h4></div>
      <div class="form-grid">
        <label>ขนาดภาพ<select id="album-ratio"><option value="4:5" selected>4:5 Facebook / Line 1080x1350</option><option value="1:1">1:1 Square 1080x1080</option><option value="16:9">16:9 1920x1080</option><option value="9:16">9:16 Story / Reels 1080x1920</option></select></label>
        <label>สไตล์กรอบ<select id="album-frameStyle"><option>ทั่วไป / หน่วยงาน / แบรนด์</option><option>ประชุม / เวทีรับฟัง / ประชาคม</option><option>ลงพื้นที่ / ภารกิจ / ติดตามงาน</option><option>ข่าวด่วน / ประกาศสำคัญ</option><option>กิจกรรม / อบรม / อีเวนต์</option><option>โรงเรียน / การศึกษา</option><option>สุขภาพ / รณรงค์ / ชุมชน</option><option>ธุรกิจ / สินค้า / โปรโมชัน</option><option>เพจ / ครีเอเตอร์ / แบรนด์ส่วนตัว</option><option>มินิมอล ขอบบาง</option></select></label>
        <label>โทนสี<select id="album-colorTone"><option>ม่วง–ทอง พรีเมียม</option><option>เขียว–เหลือง–ขาว</option><option>น้ำเงิน–ขาว ทางการ</option><option>ดำ–ทอง หรูหรา</option></select></label>
        <label>โหมดอัตโนมัติ<select id="album-autoMode"><option>ปรับภาพ + ครอป + ใส่กรอบ</option><option>ภาพกิจกรรมเน้นภาพ / แถบเล็ก</option><option>ครอป + ใส่กรอบเท่านั้น</option><option>ปรับภาพเท่านั้น</option></select></label>
        <label class="checkline full"><input id="album-safeMode" type="checkbox" checked> Safe Photo Mode — ไม่สร้างภาพใหม่ ไม่เปลี่ยนใบหน้า ไม่แก้องค์ประกอบหลัก</label>
        <label class="checkline full"><input id="album-makeCover" type="checkbox" checked> ทำ 2 รูปแรกให้เด่นเป็นปกหลัก / ปกรอง</label>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeAlbum">สร้างชุดภาพโพสต์</button><button class="btn secondary" id="albumDownloadAll">ดาวน์โหลดทั้งหมด</button><button class="btn secondary" id="albumClear">ล้างรูป</button></div>
  `;

  $("#postForm").innerHTML = TANJAI.field("post") + `
    <div class="form-note">เมนูนี้ใช้สรุปงานจากข้อมูลและรูปภาพ เช่น นายกลงพื้นที่ ตรวจงาน ช่วยเหลือกลุ่มเป้าหมาย แล้วนำไปต่อได้ทั้งนำเสนอ ทำคลิป และโพสต์โซเชียล</div>
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
        <label class="full">สิ่งที่อยากให้เน้นเพิ่มเติม<textarea id="post-extra" placeholder="เช่น เน้นการรับฟังปัญหา การตรวจสอบพื้นที่ การประสานหน่วยงาน หรือผลลัพธ์ที่กลุ่มเป้าหมายได้รับ"></textarea></label>
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
  $("#imageResult").innerHTML = TANJAI.readyOutputShell("image", "Prompt พร้อมใช้", "คัดลอกแล้วส่งต่อ AI สร้างภาพหรือทันใจ GPT ได้ทันที", "imageOut");
$("#albumResult").innerHTML = TANJAI.readyOutputShell("album", "ชุดภาพพร้อมโพสต์", "ปรับภาพจริง ใส่กรอบ และดาวน์โหลดเป็นภาพพร้อมลง Facebook", "albumOut");
$("#postResult").innerHTML = TANJAI.readyOutputShell("post", "ข้อความพร้อมใช้", "คัดลอกไปใช้ต่อเป็นโพสต์ แคปชั่น หรือข้อความประชาสัมพันธ์ได้ทันที", "postOut");
  $("#videoResult").innerHTML = TANJAI.readyOutputShell("video", "Storyboard พร้อมใช้", "คัดลอกแล้วนำไปทำคลิปต่อได้ทันที", "videoOut");
  $("#voiceResult").innerHTML = TANJAI.readyOutputShell("voice", "สคริปต์เสียงพร้อมใช้", "คัดลอกแล้วนำไปใช้ต่อกับ Voice Tool หรือ CapCut ได้ทันที", "voiceOut");
  $("#deckResult").innerHTML = TANJAI.readyOutputShell("deck", "Outline พร้อมใช้", "คัดลอกแล้วนำไปทำสไลด์ต่อได้ทันที", "deckOut");
  $("#kitResult").innerHTML = TANJAI.readyOutputShell("kit", "ชุดสื่อพร้อมใช้", "คัดลอกแล้วต่อยอดงานทั้งแพ็กได้ทันที", "kitOut");

  TANJAI.renderLibrary();
  TANJAI.renderPromptHub();
  TANJAI.renderDestinations();
  TANJAI.renderProjects();

  TANJAI.updateImageResultMode = function(mode){
    const promptText = TANJAI.state.lastImagePrompt || "";
    const gptText = TANJAI.state.lastImageGPT || "";
    const criticText = TANJAI.state.lastImageCritic || "";
    if(mode === "gpt"){
      TANJAI.setReadyOutput("image", {
        title:"คำสั่งพร้อมใช้สำหรับทันใจ GPT",
        desc:"คัดลอกแล้วเปิดทันใจ GPT ต่อได้ทันที",
        main:gptText,
        advancedTitle1:"Prompt พร้อมใช้สำหรับ AI สร้างภาพ",
        advanced1:promptText,
        advancedTitle2:"ตัวช่วยตรวจความพร้อม",
        advanced2:criticText
      });
      TANJAI.state.lastImageMode = "gpt";
      return;
    }
    TANJAI.setReadyOutput("image", {
      title:"Prompt พร้อมใช้",
      desc:"คัดลอกแล้วส่งต่อ AI สร้างภาพหรือทันใจ GPT ได้ทันที",
      main:promptText,
      advancedTitle1:"คำสั่งพร้อมใช้สำหรับทันใจ GPT",
      advanced1:gptText,
      advancedTitle2:"ตัวช่วยตรวจความพร้อม",
      advanced2:criticText
    });
    TANJAI.state.lastImageMode = "prompt";
  };


  // v8.6.2 Command Palette + FAB Quick Menu
  TANJAI.quickActions = [
    {label:"หน้าหลัก", icon:"🏠", view:"dashboard", hint:"กลับหน้าแรก"},
    {label:"สร้างภาพ", icon:"🖼️", view:"image", hint:"สร้าง Prompt / คำสั่งพร้อมใช้"},
    {label:"เขียนโพสต์", icon:"✍️", view:"post", hint:"สรุปงาน / โพสต์ Facebook Line"},
    {label:"ทำวิดีโอ", icon:"🎬", view:"video", hint:"Storyboard / Hook / Voice Over"},
    {label:"เสียงพากย์", icon:"🎙️", view:"voice", hint:"สคริปต์เสียงอ่าน"},
    {label:"ทำสไลด์", icon:"📊", view:"deck", hint:"Outline สไลด์"},
    {label:"ชุดสื่อ", icon:"🧩", view:"kit", hint:"ภาพ โพสต์ วิดีโอ เสียง สไลด์"},
    {label:"Prompt Hub", icon:"⭐", view:"prompts", hint:"คลัง Prompt"},
    {label:"เครื่องมือปลายทาง", icon:"🚀", view:"destinations", hint:"เปิด GPT Canva CapCut"},
    {label:"โปรเจกต์", icon:"📁", view:"projects", hint:"ดูงานที่บันทึกไว้"},
    {label:"เปิดทันใจ GPT", icon:"🤖", url:TANJAI_CUSTOM_GPT_URL, hint:"เปิด Custom GPT"}
  ];

  TANJAI.mountV82Navigation = function(){
    if(document.getElementById("commandPalette")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="commandPalette" class="command-palette" hidden>
        <div class="command-backdrop" data-close-command></div>
        <section class="command-dialog" role="dialog" aria-modal="true" aria-label="ค้นหาคำสั่ง">
          <div class="command-search-row">
            <span>⌘</span>
            <input id="commandSearch" type="text" placeholder="ค้นหาคำสั่ง เช่น สร้างภาพ โพสต์ เสียงพากย์">
            <button class="btn ghost" data-close-command>ปิด</button>
          </div>
          <div id="commandList" class="command-list"></div>
          <div class="command-foot">กด Ctrl + K เพื่อเปิดเมนูนี้ • Enter เพื่อเลือกคำสั่งแรก</div>
        </section>
      </div>
      <button id="fabMain" class="fab-main" type="button" title="เมนูลัด">＋</button>
      <div id="fabMenu" class="fab-menu" hidden>
        <button data-fab-view="image" title="สร้างภาพ">🖼️<span>ภาพ</span></button>
        <button data-fab-view="post" title="โพสต์">✍️<span>โพสต์</span></button>
        <button data-fab-view="video" title="วิดีโอ">🎬<span>วิดีโอ</span></button>
        <button data-fab-open="gpt" title="เปิด GPT">🤖<span>GPT</span></button>
      </div>
      <nav class="mobile-tabbar" aria-label="เมนูลัดมือถือ">
        <button data-view="dashboard">🏠<span>หน้าแรก</span></button>
        <button data-view="image">🖼️<span>ภาพ</span></button>
        <button data-view="post">✍️<span>โพสต์</span></button>
        <button data-view="destinations">🚀<span>เครื่องมือ</span></button>
        <button data-view="projects">📁<span>งาน</span></button>
      </nav>
    `;
    document.body.appendChild(wrap);

    const palette = document.getElementById("commandPalette");
    const search = document.getElementById("commandSearch");
    const list = document.getElementById("commandList");
    const fab = document.getElementById("fabMain");
    const fabMenu = document.getElementById("fabMenu");

    const runAction = (item) => {
      if(!item) return;
      if(item.url){ window.open(TANJAI.normalizeGPTUrl(item.url), "_blank", "noopener,noreferrer"); }
      else if(item.view){ TANJAI.switchView(item.view); }
      closePalette();
      fabMenu.hidden = true;
    };

    const render = () => {
      const q = (search.value || "").trim().toLowerCase();
      const items = TANJAI.quickActions.filter(a =>
        !q || (a.label + " " + a.hint).toLowerCase().includes(q)
      );
      list.innerHTML = items.map((a,i)=>`
        <button class="command-item" data-command-index="${TANJAI.quickActions.indexOf(a)}">
          <span class="command-icon">${a.icon}</span>
          <b>${a.label}</b>
          <small>${a.hint}</small>
          ${i === 0 ? "<em>Enter</em>" : ""}
        </button>
      `).join("") || `<div class="command-empty">ไม่พบคำสั่งที่ค้นหา</div>`;
    };

    function openPalette(){
      palette.hidden = false;
      search.value = "";
      render();
      setTimeout(()=>search.focus(), 30);
    }
    function closePalette(){
      palette.hidden = true;
    }
    TANJAI.openCommandPalette = openPalette;

    document.addEventListener("keydown", (e)=>{
      if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){
        e.preventDefault();
        openPalette();
      }
      if(!palette.hidden && e.key === "Escape") closePalette();
      if(!palette.hidden && e.key === "Enter"){
        const first = list.querySelector("[data-command-index]");
        if(first){
          e.preventDefault();
          runAction(TANJAI.quickActions[Number(first.dataset.commandIndex)]);
        }
      }
    });
    search.addEventListener("input", render);
    document.body.addEventListener("click", (e)=>{
      const close = e.target.closest("[data-close-command]");
      if(close){ closePalette(); return; }
      const command = e.target.closest("[data-command-index]");
      if(command){ runAction(TANJAI.quickActions[Number(command.dataset.commandIndex)]); return; }
      const fabView = e.target.closest("[data-fab-view]");
      if(fabView){ TANJAI.switchView(fabView.dataset.fabView); fabMenu.hidden = true; return; }
      const fabOpen = e.target.closest("[data-fab-open]");
      if(fabOpen){ window.open(TANJAI.normalizeGPTUrl(TANJAI_CUSTOM_GPT_URL), "_blank", "noopener,noreferrer"); fabMenu.hidden = true; fab.classList.remove("is-open"); return; }
      if(!fabMenu.hidden && !e.target.closest("#fabMenu") && !e.target.closest("#fabMain")){
        fabMenu.hidden = true;
        fab.classList.remove("is-open");
      }
    });
    fab.addEventListener("click", (e)=>{ e.stopPropagation();
      fabMenu.hidden = !fabMenu.hidden;
      fab.classList.toggle("is-open", !fabMenu.hidden);
    });
  };

  TANJAI.mountV82Navigation();



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

  const renumberImageSections = () => {
    const form = $("#imageForm");
    if(!form) return;
    const sections = Array.from(form.querySelectorAll(":scope > .form-section"));
    let n = 1;
    sections.forEach(section => {
      const badge = section.querySelector(".section-title b");
      if(!badge) return;
      const style = window.getComputedStyle(section);
      const invisible = section.hidden || style.display === "none" || style.visibility === "hidden";
      if(invisible) return;
      badge.textContent = String(n++);
    });
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
    renumberImageSections();
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
    renumberImageSections();
    setTimeout(renumberImageSections, 80);
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
    const miniDest = e.target.closest("[data-destination-open]");
    if(miniDest){
      const key = miniDest.dataset.destinationOpen;
      const item = (TANJAI.destinations || []).find(d => {
        const name = (d.name || "").toLowerCase();
        return (key === "gpt" && name.includes("gpt")) ||
               (key === "canva" && name.includes("canva")) ||
               (key === "capcut" && name.includes("capcut")) ||
               (key === "voice" && name.includes("voice"));
      });
      if(item?.url) window.open(TANJAI.normalizeGPTUrl(item.url), "_blank", "noopener,noreferrer");
      return;
    }
    const viewModeBtn = e.target.closest("[data-image-viewmode]");
    if(viewModeBtn){
      TANJAI.updateImageResultMode?.(viewModeBtn.dataset.imageViewmode);
      return;
    }
    const copyImageBtn = e.target.closest("[data-copy-image]");
    if(copyImageBtn){
      const mode = copyImageBtn.dataset.copyImage;
      const text = mode === "prompt" ? (TANJAI.state.lastImagePrompt || "") : (TANJAI.state.lastImageGPT || "");
      TANJAI.copyText(text);
      return;
    }
    const co = e.target.closest("[data-copyopen]");
    if(co){
      const text = TANJAI.state.lastImageGPT && co.dataset.copyopen === "imageOut" ? TANJAI.state.lastImageGPT : ($("#"+co.dataset.copyopen)?.textContent || "");
      TANJAI.copyText(text);
      window.open(TANJAI.normalizeGPTUrl(TANJAI_CUSTOM_GPT_URL), "_blank", "noopener,noreferrer");
      return;
    }
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
  const getImageDataForPrompt = () => {
    const d=TANJAI.commonData("image");
    const imageFiles = Array.from($("#image-photos")?.files || []);
    d.photoCount = imageFiles.length;
    d.photoNames = imageFiles.map(f=>f.name).join(", ");
    return d;
  };

  const toolUsageTips = {
    post:`นำข้อความนี้ไปใช้ต่อได้ 3 แบบ
- วางเป็นโพสต์ Facebook / Line ได้ทันที
- ตัดบางส่วนไปทำข้อความบนภาพได้
- ใช้เป็นฐานสำหรับแคปชั่นหรือสคริปต์คลิปสั้น`,
    video:`แนวทางใช้ต่อ
- ใช้เป็นโครงถ่ายทำหรือส่งให้ทีมตัดต่อ
- นำแต่ละ Scene ไปแยกทำข้อความบนจอใน CapCut ได้
- ปรับความยาวแต่ละ Scene ให้พอดีกับคลิปจริง`,
    voice:`แนวทางใช้ต่อ
- คัดลอกไปใช้กับ Voice Tool หรือ CapCut ได้ทันที
- เว้นจังหวะหายใจช่วงขึ้นย่อหน้าใหม่
- หากต้องการโทนเร่งด่วน ให้เพิ่มน้ำหนักคำสำคัญ`,
    deck:`แนวทางใช้ต่อ
- ใช้เป็นโครงตั้งต้นก่อนทำสไลด์จริง
- แปลงแต่ละ Slide เป็นหัวข้อใน Canva หรือ Slide Tool
- Speaker notes ใช้เป็นคำพูดประกอบการนำเสนอ`,
    kit:`แนวทางใช้ต่อ
- ใช้หัวข้อภาพ โพสต์ คลิป เสียง และสไลด์จากชุดเดียวกัน
- สามารถแยกคัดลอกเฉพาะส่วนที่ต้องการไปใช้ต่อได้
- เหมาะกับงานที่ต้องปล่อยหลายสื่อพร้อมกัน`
  };

  $("#makeImage").onclick = () => {
    const d = getImageDataForPrompt();
    const critic = TANJAI.promptCritic(d);
    d.criticSummary = critic;
    const promptOut = TANJAI.imagePrompt(d, "prompt");
    const gptOut = TANJAI.imagePrompt(d, "gpt");
    TANJAI.state.lastImagePrompt = promptOut;
    TANJAI.state.lastImageGPT = gptOut;
    TANJAI.state.lastImage = promptOut;
    TANJAI.state.lastImageCritic = critic;
    TANJAI.updateImageResultMode?.("prompt");
    TANJAI.toast("สร้าง Prompt ภาพแล้ว");
  };
  $("#makePost").onclick = () => {
    const d=TANJAI.commonData("post");
    const out=TANJAI.postText(d);
    TANJAI.setReadyOutput("post", {
      title:"ข้อความพร้อมใช้",
      desc:"คัดลอกไปใช้ต่อเป็นโพสต์ แคปชั่น หรือข้อความประชาสัมพันธ์ได้ทันที",
      main:out,
      advancedTitle1:"แนวทางใช้ต่อ",
      advanced1:toolUsageTips.post
    });
    TANJAI.state.lastPost=out;
    TANJAI.toast("สร้างข้อความพร้อมใช้แล้ว");
  };
  $("#makeVideo").onclick = () => {
    const d=TANJAI.commonData("video");
    const out=TANJAI.videoStoryboard(d, $("#video-length").value);
    TANJAI.setReadyOutput("video", {
      title:"Storyboard พร้อมใช้",
      desc:"คัดลอกแล้วนำไปทำคลิปต่อได้ทันที",
      main:out,
      advancedTitle1:"แนวทางใช้ต่อ",
      advanced1:toolUsageTips.video
    });
    TANJAI.state.lastVideo=out;
    TANJAI.toast("สร้าง Storyboard แล้ว");
  };
  $("#makeVoice").onclick = () => {
    const d=TANJAI.commonData("voice");
    const out=TANJAI.voiceScript(d, $("#voice-length").value, $("#voice-style").value);
    TANJAI.setReadyOutput("voice", {
      title:"สคริปต์เสียงพร้อมใช้",
      desc:"คัดลอกแล้วนำไปใช้ต่อกับ Voice Tool หรือ CapCut ได้ทันที",
      main:out,
      advancedTitle1:"แนวทางใช้ต่อ",
      advanced1:toolUsageTips.voice
    });
    TANJAI.state.lastVoice=out;
    TANJAI.toast("สร้างสคริปต์เสียงแล้ว");
  };
  $("#makeDeck").onclick = () => {
    const d=TANJAI.commonData("deck");
    const out=TANJAI.deckOutline(d, Number($("#deck-count").value));
    TANJAI.setReadyOutput("deck", {
      title:"Outline พร้อมใช้",
      desc:"คัดลอกแล้วนำไปทำสไลด์ต่อได้ทันที",
      main:out,
      advancedTitle1:"แนวทางใช้ต่อ",
      advanced1:toolUsageTips.deck
    });
    TANJAI.state.lastDeck=out;
    TANJAI.toast("สร้าง Outline สไลด์แล้ว");
  };
  $("#makeKit").onclick = () => {
    const d=TANJAI.commonData("kit");
    const out = `ชุดสื่อ: ${d.title}

=== 1) Prompt ภาพ ===
${TANJAI.imagePrompt({...d, size:"4:5 Facebook / Line 1080x1350", style:"Modern Premium Clean"}, "prompt")}

=== 2) โพสต์ ===
${TANJAI.postText(d)}

=== 3) Storyboard วิดีโอ ===
${TANJAI.videoStoryboard(d, "60 วินาที")}

=== 4) สคริปต์เสียงพากย์ ===
${TANJAI.voiceScript(d, "60 วินาที", "ทางการ สุภาพ")}

=== 5) Outline สไลด์ ===
${TANJAI.deckOutline(d, 8)}`;
    const advancedOut = `หมายเหตุการส่งมอบ
${TANJAI.outputDeliveryGuard("ชุดไฟล์สื่อ")}`;
    TANJAI.setReadyOutput("kit", {
      title:"ชุดสื่อพร้อมใช้",
      desc:"คัดลอกแล้วต่อยอดงานทั้งแพ็กได้ทันที",
      main:out,
      advancedTitle1:"แนวทางใช้ต่อ",
      advanced1:toolUsageTips.kit,
      advancedTitle2:"ข้อกำชับการส่งมอบไฟล์",
      advanced2:advancedOut
    });
    TANJAI.state.lastKit=out;
    TANJAI.toast("สร้างชุดสื่อแล้ว");
  };


  // Save
  $("#saveImage").onclick = () => TANJAI.saveProject($("#image-title").value || "สร้างภาพ", ($("#imageOut").textContent || "") + "\n\n=== Auto Prompt Critic ===\n" + (TANJAI.state.lastImageCritic || ""), "สร้างภาพ");
  $("#savePost").onclick = () => TANJAI.saveProject($("#post-title").value || "เขียนโพสต์", $("#postOut").textContent, "เขียนโพสต์");
  $("#saveVideo").onclick = () => TANJAI.saveProject($("#video-title").value || "ทำวิดีโอ", $("#videoOut").textContent, "ทำวิดีโอ");
  $("#saveVoice").onclick = () => TANJAI.saveProject($("#voice-title").value || "เสียงพากย์", $("#voiceOut").textContent, "เสียงพากย์");
  $("#saveDeck").onclick = () => TANJAI.saveProject($("#deck-title").value || "ทำสไลด์", $("#deckOut").textContent, "ทำสไลด์");
  $("#saveKit").onclick = () => TANJAI.saveProject($("#kit-title").value || "สร้างชุดสื่อ", $("#kitOut").textContent, "สร้างชุดสื่อ");

  $("#clearProjects").onclick = () => { localStorage.removeItem("tanjaiV5Projects"); TANJAI.renderProjects(); TANJAI.toast("ล้างโปรเจกต์แล้ว"); };
});

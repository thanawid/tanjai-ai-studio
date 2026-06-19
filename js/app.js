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
    workTypes: ["นายกลงพื้นที่","ติดตามปัญหากลุ่มเป้าหมาย","ตรวจงานโครงการ","กิจกรรมเทศบาล","อบรม / ประชุม","งานพิธีกร / ผู้ดำเนินรายการ","พิธีเปิด / พิธีปิด","ลงพื้นที่ช่วยเหลือ","รณรงค์ / ประชาสัมพันธ์","อื่น ๆ"]
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
    <div class="button-row"><button class="btn primary" id="makeImage">สร้าง Prompt ภาพทันที</button><button class="btn secondary" id="saveImage">บันทึก</button></div>
  `;

  $("#albumForm").innerHTML = `
    <div class="form-section"><div class="section-title"><b>1</b><h4>อัปโหลดภาพจริง</h4></div>
      <div class="form-grid">
        <label>โลโก้จริง / โปรไฟล์เพจ (ไม่บังคับ)
          <input id="album-logoFile" type="file" accept="image/*">
          <small>ถ้าไม่ใส่ ระบบจะไม่ใส่โลโก้บนภาพ</small>
        </label>
        <input id="album-layoutMode" type="hidden" value="Clean Frame Output + Smart Text Fit">
        <label>ภาพหน้าปกหลัก (จำเป็น)
          <input id="album-coverFile" type="file" accept="image/*">
          <small>ภาพนี้จะใช้เป็น Cover Frame แบบเต็ม</small>
        </label>
        <label class="full">ภาพรอง 3–4 ภาพ
          <input id="album-supportFiles" type="file" accept="image/*" multiple>
          <small>ภาพรองจะใช้กรอบแบบ Lite Frame และภาพที่ 5 จะเป็น Additional Frame</small>
        </label>
      </div>
      <div id="album-preview" class="album-upload-preview"></div>
    </div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ข้อมูลบนกรอบภาพ</h4></div>
      <div class="form-grid">
        <label>หัวข้องาน<input id="album-title" placeholder="เช่น ชื่องาน / กิจกรรม / ประกาศ / แคมเปญ"></label>
        <label>หน่วยงาน<input id="album-orgName" placeholder="เช่น ชื่อหน่วยงาน / องค์กร / ร้านค้า / เพจ / แบรนด์"></label>
        <label>ป้ายหมวดด้านบน<input id="album-categoryLabel" placeholder="เช่น ประชาสัมพันธ์ / แจ้งข่าว / กิจกรรม / ลงพื้นที่ — ไม่ใส่ก็ไม่แสดง"></label>
        <label>วันที่<input id="album-dateTime" placeholder="เช่น วันที่จัดกิจกรรม / วันที่เผยแพร่"></label>
        <label>สถานที่<input id="album-place" placeholder="เช่น สถานที่จัดงาน / พื้นที่ / ช่องทาง / สาขา"></label>
        <label class="full">ใคร / ทำอะไร<textarea id="album-detail" placeholder="เช่น ใคร / ทำอะไร / เพื่ออะไร / มีประเด็นสำคัญอะไร"></textarea></label>
        <label class="full">ข้อความปิดท้าย<input id="album-footer" placeholder="เช่น สโลแกน / ข้อความปิดท้าย / แฮชแท็ก / คำเชิญชวน"></label>
        <label class="full">ข้อความภาพ 2 (ไม่บังคับ)<input id="album-lite2" placeholder="ถ้าไม่กรอก ระบบจะสรุปจากข้อมูลหลักให้"></label>
        <label class="full">ข้อความภาพ 3 (ไม่บังคับ)<input id="album-lite3" placeholder="เช่น บรรยากาศการประชุม / รับฟังความคิดเห็น / ผู้เข้าร่วม"></label>
        <label class="full">ข้อความภาพ 4 (ไม่บังคับ)<input id="album-lite4" placeholder="เช่น ร่วมติดตามและขับเคลื่อนงาน / สรุปผล / เชิญติดตาม"></label>
      </div>
    </div>
    <div class="form-section"><div class="section-title"><b>3</b><h4>ตั้งค่าชุดภาพ</h4></div>
      <div class="form-grid">
        <label>ขนาดภาพ<select id="album-ratio"><option value="16:9" selected>16:9 Facebook แนวนอน 1920x1080</option><option value="4:5">4:5 Facebook / Line 1080x1350</option><option value="1:1">1:1 Square 1080x1080</option><option value="9:16">9:16 Story / Reels 1080x1920</option></select></label>
        <label>สไตล์กรอบ<select id="album-frameStyle"><option>ทั่วไป / หน่วยงาน / แบรนด์</option><option>ประชุม / เวทีรับฟัง / ประชาคม</option><option>ลงพื้นที่ / ภารกิจ / ติดตามงาน</option><option>ข่าวด่วน / ประกาศสำคัญ</option><option>กิจกรรม / อบรม / อีเวนต์</option><option>โรงเรียน / การศึกษา</option><option>สุขภาพ / รณรงค์ / ชุมชน</option><option>ธุรกิจ / สินค้า / โปรโมชัน</option><option>เพจ / ครีเอเตอร์ / แบรนด์ส่วนตัว</option><option>มินิมอล ขอบบาง</option></select></label>
        <label>Theme Cover Frame Preset<select id="album-themePreset"><option>Ribbon Civic Cover</option><option>Modern Glass Cover</option><option>Clean Civic Cover</option><option>Minimal Story Cover</option></select></label>
        <label>โทนสี<select id="album-colorTone"><option>ม่วง–ทอง พรีเมียม</option><option selected>เขียว–เหลือง–ขาว</option><option>น้ำเงิน–ขาว ทางการ</option><option>ส้ม–ทอง สดเด่น</option><option>ดำ–ทอง หรูหรา</option></select></label>
        <label>โหมดอัตโนมัติ<select id="album-autoMode"><option>ปรับภาพ + ครอป + ใส่กรอบ</option><option>ภาพกิจกรรมเน้นภาพ / แถบเล็ก</option><option>ครอป + ใส่กรอบเท่านั้น</option><option>ปรับภาพเท่านั้น</option></select></label>
        <input id="album-safeMode" type="checkbox" checked hidden>
        <input id="album-makeCover" type="checkbox" checked hidden>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeAlbum">สร้างชุดภาพโพสต์</button><button class="btn secondary" id="albumDownloadAll">ดาวน์โหลดทั้งหมด</button><button class="btn secondary" id="albumClear">ล้างรูป</button></div>
  `;

  $("#postForm").innerHTML = TANJAI.field("post") + `
    <div class="form-note">ใช้สำหรับสรุปงาน เรียบเรียงข้อมูล เขียนโพสต์ แคปชั่น สคริปต์เสียง สคริปต์คลิป และข้อความสำหรับทำสื่อ</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าการเรียบเรียงเนื้อหา</h4></div>
      <div class="form-grid">
        <label>ประเภทงาน<select id="post-workType">${opts((toolOptions.workTypes || ["นายกลงพื้นที่","กิจกรรมเทศบาล","อื่น ๆ"]).filter(x => !/พิธีกร|พิธีเปิด|พิธีปิด/.test(x)))}</select></label>
        <label>ต้องการเรียบเรียงเป็น<select id="post-channel"><option>สรุปงาน</option><option>เรียบเรียงข้อมูล</option><option>โพสต์ Facebook / Line</option><option>แคปชั่น</option><option>สคริปต์เสียง</option><option>สคริปต์คลิป</option><option>ข้อความสำหรับทำสื่อ</option><option>ครบชุด: สรุป + โพสต์ + สคริปต์เสียง + สคริปต์คลิป</option></select></label>
        <label>ความยาว<select id="post-length">${opts(toolOptions.postLengths)}</select></label>
        <label>หมวดงาน<select id="post-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
        <label class="full">แนบรูปประกอบ / รูปเอกสาร / รูปลงพื้นที่
          <input id="post-photos" type="file" accept="image/*" multiple>
          <small>ถ้าเป็นภาพเอกสาร ให้นำ Prompt พร้อมรูปไปใช้กับ AI ที่วิเคราะห์ภาพได้ เช่น ChatGPT / Gemini แล้วให้ AI อ่านเอกสารก่อนสรุป</small>
          <div id="post-photoPreview" class="upload-preview-grid"></div>
        </label>
        <label class="full">สิ่งที่อยากให้เน้นเพิ่มเติม<textarea id="post-extra" placeholder="เช่น เน้นสรุปให้กระชับ / ภาษาเป็นทางการ / โพสต์อ่านง่าย / สคริปต์เสียง 1 นาที"></textarea></label>
      </div>
      <div class="summary-output-tabs">
        <span class="summary-chip">สรุปงาน</span>
        <span class="summary-chip">โพสต์</span>
        <span class="summary-chip">แคปชั่น</span>
        <span class="summary-chip">สคริปต์เสียง</span>
        <span class="summary-chip">สคริปต์คลิป</span>
        <span class="summary-chip">ข้อความทำสื่อ</span>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makePost">เรียบเรียงเนื้อหา</button><button class="btn secondary" id="savePost">บันทึก</button></div>`;

  $("#mcForm").innerHTML = TANJAI.field("mc") + `
    <div class="form-note mc-note-v895">ใช้สำหรับสคริปต์พิธีกร คำเชิญประธาน คำเชิญผู้กล่าวรายงาน คำกล่าวรายงาน คำกล่าวประธาน คำเชื่อมช่วง สคริปต์เปิด / ปิดงาน และเวอร์ชันย่อถืออ่าน</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่างานพิธีกร</h4></div>
      <div class="form-grid">
        <label>ประเภทงาน<select id="mc-workType"><option>งานพิธีกร / ผู้ดำเนินรายการ</option><option>พิธีเปิด / พิธีปิด</option><option>งานประชุม / อบรม</option><option>งานมอบเกียรติบัตร / มอบรางวัล</option><option>งานชุมชน / งานเทศบาล</option><option>งานทางการ</option><option>อื่น ๆ</option></select></label>
        <label>ต้องการสร้าง<select id="mc-channel"><option>สคริปต์พิธีกรเต็ม</option><option>คำเชิญประธาน</option><option>คำเชิญผู้กล่าวรายงาน</option><option>คำกล่าวรายงาน</option><option>คำกล่าวประธาน</option><option>คำเชื่อมช่วง</option><option>สคริปต์เปิด / ปิดงาน</option><option>เวอร์ชันย่อถืออ่าน</option><option>ครบชุดพิธีกร</option></select></label>
        <label>ความยาว<select id="mc-length"><option>สั้น กระชับ</option><option selected>มาตรฐาน ใช้บนเวที</option><option>ละเอียด ครบทุกช่วง</option><option>เวอร์ชันถืออ่าน 1 หน้า</option></select></label>
        <label>สไตล์พิธีกร<select id="mc-style"><option selected>ทางการ สุภาพ อ่านง่าย</option><option>กึ่งทางการ อบอุ่น</option><option>กระชับ เป็นพิธีการ</option><option>อบอุ่น เป็นกันเอง</option></select></label>
        <label class="full">แนบกำหนดการ / ภาพเอกสาร / รูปหน้างาน
          <input id="mc-photos" type="file" accept="image/*" multiple>
          <small>แนบภาพกำหนดการหรือเอกสาร แล้วนำ Prompt พร้อมรูปไปใช้กับ AI ที่วิเคราะห์ภาพได้</small>
          <div id="mc-photoPreview" class="upload-preview-grid"></div>
        </label>
        <label class="full">ข้อมูลพิธี / สิ่งที่อยากให้เน้น<textarea id="mc-extra" placeholder="เช่น ประธานในพิธี / ผู้กล่าวรายงาน / ลำดับพิธี / ช่วงมอบรางวัล / ถ่ายภาพร่วมกัน / คำเรียกแขกผู้มีเกียรติ"></textarea></label>
      </div>
      <div class="summary-output-tabs">
        <span class="summary-chip">สคริปต์พิธีกร</span>
        <span class="summary-chip">คำเชิญประธาน</span>
        <span class="summary-chip">คำเชิญผู้กล่าวรายงาน</span>
        <span class="summary-chip">คำกล่าวรายงาน</span>
        <span class="summary-chip">คำกล่าวประธาน</span>
        <span class="summary-chip">คำเชื่อมช่วง</span>
        <span class="summary-chip">เปิด / ปิดงาน</span>
        <span class="summary-chip">ถืออ่าน</span>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeMC">สร้างสคริปต์พิธีกร</button><button class="btn secondary" id="saveMC">บันทึก</button></div>`;
  $("#videoForm").innerHTML = TANJAI.field("video") + `
    <div class="form-note">เมนูนี้ใช้ทำวิดีโอหรือทำคลิปได้โดยตรง สร้าง Hook, Storyboard, Voice Over และข้อความบนจอ</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าวิดีโอ / คลิป</h4></div>
      <div class="form-grid">
        <label>ความยาว<select id="video-length">${opts(TANJAI.categories.videoLengths)}</select></label>
        <label>รูปแบบคลิป<select id="video-format">${opts(toolOptions.videoFormats)}</select></label>
        <label>ช่องทาง<select id="video-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="video-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVideo">สร้าง Prompt วิดีโอทันที</button><button class="btn secondary" id="saveVideo">บันทึก</button></div>`;
  $("#voiceForm").innerHTML = TANJAI.field("voice") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าเสียง</h4></div>
      <div class="form-grid">
        <label>ความยาวเสียง<select id="voice-length">${opts(TANJAI.categories.voiceLengths)}</select></label>
        <label>สไตล์เสียง<select id="voice-style">${opts(TANJAI.categories.voiceStyles)}</select></label>
        <label>ช่องทางใช้งาน<select id="voice-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="voice-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVoice">สร้าง Prompt เสียงทันที</button><button class="btn secondary" id="saveVoice">บันทึก</button></div>`;
  $("#deckForm").innerHTML = TANJAI.field("deck") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าสไลด์</h4></div>
      <div class="form-grid">
        <label>จำนวนสไลด์<select id="deck-count"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></label>
        <label>รูปแบบสไลด์<select id="deck-format">${opts(toolOptions.slideStyles)}</select></label>
        <label>หมวดงาน<select id="deck-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeDeck">สร้าง Prompt สไลด์ทันที</button><button class="btn secondary" id="saveDeck">บันทึก</button></div>`;
  $("#kitForm").innerHTML = TANJAI.field("kit") + `
    <div class="form-section">
      <div class="section-title"><b>2</b><h4>Universal Prompt Pack</h4></div>
      <div class="prompt-workspace-note">
        ระบบจะจัดชุดคำสั่งให้ครบโดยอัตโนมัติ ไม่ต้องเลือก AI ปลายทางก่อน — ได้ทั้ง Prompt สำหรับแก้/คุยต่อ และ Prompt สำหรับสั่ง AI ลงมือทำทันที
      </div>
      <input id="kit-packMode" type="hidden" value="Universal Prompt Pack">
    </div>
    <div class="button-row"><button class="btn primary" id="makeKit">สร้าง Prompt สั่งทำทันที</button><button class="btn secondary" id="saveKit">บันทึก</button></div>`;

  // Results
  $("#imageResult").innerHTML = TANJAI.readyOutputShell("image", "Prompt ภาพ — สั่งทำทันที", "คัดลอกแล้วให้ AI สร้างภาพทันที พร้อม Prompt สำหรับแก้/คุยต่อในรายละเอียด", "imageOut");
$("#albumResult").innerHTML = TANJAI.readyOutputShell("album", "ชุดภาพพร้อมโพสต์", "ปรับภาพจริง ใส่กรอบ และดาวน์โหลดเป็นภาพพร้อมลง Facebook", "albumOut");
$("#postResult").innerHTML = TANJAI.readyOutputShell("post", "Prompt สรุปงาน — สั่งทำทันที", "คัดลอกแล้วให้ AI สรุปและเรียบเรียงเนื้อหาทันที", "postOut");
$("#mcResult").innerHTML = TANJAI.readyOutputShell("mc", "Prompt สคริปต์พิธีกร — สั่งทำทันที", "คัดลอกแล้วให้ AI เขียนสคริปต์พิธีกรพร้อมใช้บนเวที", "mcOut");
  $("#videoResult").innerHTML = TANJAI.readyOutputShell("video", "Prompt วิดีโอ — สั่งทำทันที", "คัดลอกแล้วให้ AI สร้าง Storyboard / Prompt วิดีโอทันที", "videoOut");
  $("#voiceResult").innerHTML = TANJAI.readyOutputShell("voice", "Prompt เสียง — สั่งทำทันที", "คัดลอกแล้วให้ AI เขียนสคริปต์เสียงทันที", "voiceOut");
  $("#deckResult").innerHTML = TANJAI.readyOutputShell("deck", "Prompt สไลด์ — สั่งทำทันที", "คัดลอกแล้วให้ AI สร้าง Outline สไลด์ทันที", "deckOut");
  $("#kitResult").innerHTML = TANJAI.readyOutputShell("kit", "Universal Execution Prompt Pack", "กรอกครั้งเดียว ได้ทั้ง Prompt สำหรับแก้/คุยต่อ และ Prompt สำหรับสั่ง AI ทำงานทันที", "kitOut");

  TANJAI.renderLibrary();
  TANJAI.renderPromptHub();
  TANJAI.renderDestinations();
  TANJAI.renderProjects();

  TANJAI.updateImageResultMode = function(mode){
    const discussText = TANJAI.state.lastImagePrompt || "";
    const executeText = TANJAI.state.lastImageGPT || "";
    const criticText = TANJAI.state.lastImageCritic || "";
    if(mode === "prompt"){
      TANJAI.setReadyOutput("image", {
        title:"Prompt สำหรับแก้ / คุยต่อ",
        desc:"ใช้เมื่อต้องการให้ AI ช่วยปรับบรีฟ ตรวจคำผิด หรือเกลาคำสั่งก่อนสั่งสร้างจริง",
        main:discussText,
        advancedTitle1:"Prompt สำหรับสั่ง AI ทำงานทันที",
        advanced1:executeText,
        advancedTitle2:"ตัวช่วยตรวจความพร้อม",
        advanced2:criticText
      });
      TANJAI.state.lastImageMode = "prompt";
      return;
    }
    TANJAI.setReadyOutput("image", {
      title:"Prompt สำหรับสั่ง AI ทำงานทันที",
      desc:"คัดลอกไปวางแล้วให้ AI สร้างภาพทันที ไม่ใช่แค่สรุปบรีฟ",
      main:executeText,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussText,
      advancedTitle2:"ตัวช่วยตรวจความพร้อม",
      advanced2:criticText
    });
    TANJAI.state.lastImageMode = "gpt";
  };

  TANJAI.postModeDefaults = {
    mcTitle:"ชื่องาน / พิธีการ",
    mcDetail:"กรอกกำหนดการหรือลำดับพิธี เช่น กล่าวต้อนรับ เชิญประธาน กล่าวรายงาน เปิดงาน มอบรางวัล ถ่ายภาพร่วมกัน และปิดงาน",
    mcExtra:"เน้นภาษาไทยสุภาพ อ่านออกเสียงง่าย มีคำเชิญประธาน คำเชื่อมช่วง และเวอร์ชันย่อสำหรับพิธีกรถืออ่าน"
  };

  TANJAI.setPostModeUI = function(mode="content"){
    const contentBtn = document.getElementById("postModeContent");
    const mcBtn = document.getElementById("postModeMC");
    const form = document.getElementById("postForm");
    if(contentBtn) contentBtn.classList.toggle("active", mode === "content");
    if(mcBtn) mcBtn.classList.toggle("active", mode === "mc");
    if(form) form.dataset.postMode = mode;
  };

  TANJAI.activateContentMode = function(){
    TANJAI.switchView("post");
    setTimeout(() => {
      const workType = document.getElementById("post-workType");
      const channel = document.getElementById("post-channel");
      const title = document.getElementById("post-title");
      const detail = document.getElementById("post-detail");
      const extra = document.getElementById("post-extra");
      const d = TANJAI.postModeDefaults || {};

      const wasAutoMC =
        (title && title.value.trim() === d.mcTitle) ||
        (detail && detail.value.trim() === d.mcDetail) ||
        (extra && extra.value.trim() === d.mcExtra);

      if(workType && /พิธีกร|พิธีเปิด|พิธีปิด/.test(workType.value)) workType.value = "กิจกรรมเทศบาล";
      if(channel && /พิธีกร|คำกล่าว/.test(channel.value)) channel.value = "ครบชุด: สรุป + โพสต์ + สคริปต์เสียง + สคริปต์คลิป";

      if(wasAutoMC){
        if(title && title.value.trim() === d.mcTitle) title.value = "";
        if(detail && detail.value.trim() === d.mcDetail) detail.value = "";
        if(extra && extra.value.trim() === d.mcExtra) extra.value = "";
      }

      TANJAI.setPostModeUI("content");
      TANJAI.toast?.("เปิดโหมดเรียบเรียงทั่วไปแล้ว");
    }, 80);
  };

  TANJAI.activateMCMode = function(){
    TANJAI.switchView("post");
    setTimeout(() => {
      const workType = document.getElementById("post-workType");
      const channel = document.getElementById("post-channel");
      const title = document.getElementById("post-title");
      const detail = document.getElementById("post-detail");
      const extra = document.getElementById("post-extra");
      const d = TANJAI.postModeDefaults || {};
      if(workType) workType.value = "งานพิธีกร / ผู้ดำเนินรายการ";
      if(channel) channel.value = "สคริปต์พิธีกร / ผู้ดำเนินรายการ";
      if(title && !title.value.trim()) title.value = d.mcTitle;
      if(detail && !detail.value.trim()) detail.value = d.mcDetail;
      if(extra && !extra.value.trim()) extra.value = d.mcExtra;
      TANJAI.setPostModeUI("mc");
      TANJAI.toast?.("เปิดโหมดงานพิธีกรแล้ว — ตรวจชื่อประธานและลำดับพิธีก่อนใช้งาน");
    }, 80);
  };


  // v8.9.6 Clean Helper Notes + Fixed Menu Visuals + Mobile UX Fix
  TANJAI.quickActions = [
    {label:"หน้าหลัก", icon:"🏠", view:"dashboard", hint:"กลับหน้าแรก"},
    {label:"สร้างชุดสื่อ", icon:"🧩", view:"kit", hint:"Prompt ครบชุดจากข้อมูลเดียว"},
    {label:"สร้างภาพ", icon:"🖼️", view:"image", hint:"Prompt ภาพพร้อมใช้"},
    {label:"ชุดภาพโพสต์ Facebook", icon:"🧷", view:"album", hint:"อัปโหลดรูป ใส่กรอบ แคปชั่น ZIP"},
    {label:"เรียบเรียงเนื้อหา", icon:"✍️", view:"post", hint:"สรุปงาน โพสต์ สคริปต์เสียง สคริปต์คลิป"},
    {label:"งานพิธีกร", icon:"🎤", view:"mc", hint:"สคริปต์พิธีกร คำเชิญประธาน คำกล่าว คำเชื่อมช่วง"},
    {label:"ทำวิดีโอ", icon:"🎬", view:"video", hint:"Storyboard / Hook / Voice Over"},
    {label:"เสียงพากย์", icon:"🎙️", view:"voice", hint:"สคริปต์เสียงอ่าน"},
    {label:"ทำสไลด์", icon:"📊", view:"deck", hint:"Outline สไลด์"},
    {label:"Prompt Hub", icon:"⭐", view:"promptHub", hint:"คลัง Prompt"},
    {label:"เครื่องมือปลายทาง", icon:"🚀", view:"destinationHub", hint:"เปิด GPT Canva CapCut"},
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
            <input id="commandSearch" type="text" placeholder="ค้นหาคำสั่ง เช่น สร้างชุดสื่อ เรียบเรียง สร้างภาพ เสียงพากย์">
            <button class="btn ghost" data-close-command>ปิด</button>
          </div>
          <div id="commandList" class="command-list"></div>
          <div class="command-foot">กด Ctrl + K เพื่อเปิดเมนูนี้ • Enter เพื่อเลือกคำสั่งแรก</div>
        </section>
      </div>
      <button id="fabMain" class="fab-main" type="button" title="เมนูลัด" aria-expanded="false" aria-controls="fabMenu">＋</button>
      <div id="fabMenu" class="fab-menu" hidden aria-hidden="true">
        <button data-fab-view="kit" title="สร้างชุดสื่อ">🧩<span>ชุดสื่อ</span></button>
        <button data-fab-view="post" title="เรียบเรียงเนื้อหา">✍️<span>เนื้อหา</span></button>
        <button data-fab-view="mc" title="งานพิธีกร">🎤<span>พิธีกร</span></button>
        <button data-fab-view="image" title="สร้างภาพ">🖼️<span>ภาพ</span></button>
        <button data-fab-view="video" title="วิดีโอ">🎬<span>วิดีโอ</span></button>
        <button data-fab-open="gpt" title="เปิด GPT">🤖<span>GPT</span></button>
      </div>
      <nav class="mobile-tabbar" aria-label="เมนูลัดมือถือ">
        <button data-view="dashboard">🏠<span>หน้าแรก</span></button>
        <button data-view="kit">🧩<span>ชุดสื่อ</span></button>
        <button data-view="post">✍️<span>เนื้อหา</span></button>
        <button data-view="mc">🎤<span>พิธีกร</span></button>
        <button data-view="destinationHub">🚀<span>เครื่องมือ</span></button>
      </nav>
    `;
    document.body.appendChild(wrap);

    const palette = document.getElementById("commandPalette");
    const search = document.getElementById("commandSearch");
    const list = document.getElementById("commandList");
    const fab = document.getElementById("fabMain");
    const fabMenu = document.getElementById("fabMenu");

    function closeFab(){
      if(!fabMenu) return;
      fabMenu.hidden = true;
      fabMenu.setAttribute("aria-hidden","true");
      fab?.classList.remove("is-open");
      fab?.setAttribute("aria-expanded","false");
    }
    function toggleFab(){
      if(!fabMenu) return;
      const nextOpen = fabMenu.hidden;
      fabMenu.hidden = !nextOpen;
      fabMenu.setAttribute("aria-hidden", nextOpen ? "false" : "true");
      fab?.classList.toggle("is-open", nextOpen);
      fab?.setAttribute("aria-expanded", nextOpen ? "true" : "false");
    }
    const runAction = (item) => {
      if(!item) return;
      if(item.url){ window.open(TANJAI.normalizeGPTUrl(item.url), "_blank", "noopener,noreferrer"); }
      else if(item.mc){ TANJAI.activateMCMode?.(); }
      else if(item.content){ TANJAI.activateContentMode?.(); }
      else if(item.view){ TANJAI.switchView(item.view); }
      closePalette();
      closeFab();
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
      if(e.key === "Escape") closeFab();
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
      const fabContent = e.target.closest("[data-fab-content]");
      if(fabContent){ TANJAI.activateContentMode?.(); closeFab(); return; }
      const fabMC = e.target.closest("[data-fab-mc]");
      if(fabMC){ TANJAI.activateMCMode?.(); closeFab(); return; }
      const fabView = e.target.closest("[data-fab-view]");
      if(fabView){ TANJAI.switchView(fabView.dataset.fabView); closeFab(); return; }
      const fabOpen = e.target.closest("[data-fab-open]");
      if(fabOpen){ window.open(TANJAI.normalizeGPTUrl(TANJAI_CUSTOM_GPT_URL), "_blank", "noopener,noreferrer"); closeFab(); return; }
      if(!fabMenu.hidden && !e.target.closest("#fabMenu") && !e.target.closest("#fabMain")){
        closeFab();
      }
    });
    fab.addEventListener("click", (e)=>{ e.stopPropagation(); toggleFab(); });
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
  $("#post-photos")?.addEventListener("change", ()=>renderUploadPreview("#post-photos", "#post-photoPreview"));
  $("#mc-photos")?.addEventListener("change", ()=>renderUploadPreview("#mc-photos", "#mc-photoPreview"));

  document.getElementById("postModeContent")?.addEventListener("click", () => TANJAI.activateContentMode?.());
  document.getElementById("postModeMC")?.addEventListener("click", () => TANJAI.activateMCMode?.());



  // Navigation

  // v6.1.2 fallback: กันเมนูซ้าย/การ์ดหน้าแรกคลิกไม่ได้
  document.addEventListener("click", e => {
    const viewBtn = e.target.closest("[data-view]");
    if(viewBtn && viewBtn.dataset.view){
      e.preventDefault();
      if(viewBtn.dataset.mcShortcut === "true"){
        TANJAI.activateMCMode?.();
      }else if(viewBtn.dataset.contentShortcut === "true"){
        TANJAI.activateContentMode?.();
      }else{
        TANJAI.switchView(viewBtn.dataset.view);
      }
    }
  }, true);

  $$("[data-view]").forEach(btn => btn.addEventListener("click", () => {
    if(btn.dataset.mcShortcut === "true") TANJAI.activateMCMode?.();
    else if(btn.dataset.contentShortcut === "true") TANJAI.activateContentMode?.();
    else TANJAI.switchView(btn.dataset.view);
  }));
  document.body.addEventListener("click", e => {
    const t = e.target.closest("[data-template]"); if(t){TANJAI.applyTemplate(t.dataset.template, t.dataset.templateView); return;}
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
    const discussOut = TANJAI.discussPrompt("image", d);
    const executeOut = TANJAI.executionPrompt("image", d);
    TANJAI.state.lastImagePrompt = discussOut;
    TANJAI.state.lastImageGPT = executeOut;
    TANJAI.state.lastImage = executeOut;
    TANJAI.state.lastImageCritic = critic;
    TANJAI.updateImageResultMode?.("gpt");
    TANJAI.toast("สร้าง Prompt ภาพแบบสั่งทำทันทีแล้ว");
  };
  $("#makePost").onclick = () => {
    const d=TANJAI.commonData("post");
    const executeOut=TANJAI.executionPrompt("post", d);
    const discussOut=TANJAI.discussPrompt("post", d);
    TANJAI.setReadyOutput("post", {
      title:"Prompt สรุปงาน / เรียบเรียง — สั่งทำทันที",
      desc:"คัดลอกไปวางแล้วให้ AI สรุปและเรียบเรียงเนื้อหาทันที",
      main:executeOut,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"ตัวอย่างสรุป / โพสต์จากระบบ",
      advanced2:TANJAI.postText(d)
    });
    TANJAI.state.lastPost=executeOut;
    TANJAI.toast("สร้าง Prompt เรียบเรียงเนื้อหาแล้ว");
  };
  $("#makeMC").onclick = () => {
    const d=TANJAI.commonData("mc");
    const executeOut=TANJAI.executionPrompt("mc", d);
    const discussOut=TANJAI.discussPrompt("mc", d);
    TANJAI.setReadyOutput("mc", {
      title:"Prompt สคริปต์พิธีกร — สั่งทำทันที",
      desc:"คัดลอกไปวางแล้วให้ AI เขียนสคริปต์พิธีกรพร้อมใช้บนเวที",
      main:executeOut,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"ตัวอย่างสคริปต์พิธีกรจากระบบ",
      advanced2:TANJAI.mcScriptSample ? TANJAI.mcScriptSample(d) : executeOut
    });
    TANJAI.state.lastMC=executeOut;
    TANJAI.toast("สร้าง Prompt สคริปต์พิธีกรแล้ว");
  };
  $("#makeVideo").onclick = () => {
    const d=TANJAI.commonData("video");
    const length=$("#video-length").value;
    const executeOut=TANJAI.executionPrompt("video", d, {length});
    const discussOut=TANJAI.discussPrompt("video", d);
    TANJAI.setReadyOutput("video", {
      title:"Prompt วิดีโอ — สั่งทำทันที",
      desc:"คัดลอกไปวางแล้วให้ AI สร้าง Storyboard / Prompt วิดีโอทันที",
      main:executeOut,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"Storyboard ตัวอย่างจากระบบ",
      advanced2:TANJAI.videoStoryboard(d, length)
    });
    TANJAI.state.lastVideo=executeOut;
    TANJAI.toast("สร้าง Prompt วิดีโอแบบสั่งทำทันทีแล้ว");
  };
  $("#makeVoice").onclick = () => {
    const d=TANJAI.commonData("voice");
    const length=$("#voice-length").value;
    const style=$("#voice-style").value;
    const executeOut=TANJAI.executionPrompt("voice", d, {length, style});
    const discussOut=TANJAI.discussPrompt("voice", d);
    TANJAI.setReadyOutput("voice", {
      title:"Prompt เสียง — สั่งทำทันที",
      desc:"คัดลอกไปวางแล้วให้ AI เขียนสคริปต์เสียงทันที",
      main:executeOut,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"สคริปต์ตัวอย่างจากระบบ",
      advanced2:TANJAI.voiceScript(d, length, style)
    });
    TANJAI.state.lastVoice=executeOut;
    TANJAI.toast("สร้าง Prompt เสียงแบบสั่งทำทันทีแล้ว");
  };
  $("#makeDeck").onclick = () => {
    const d=TANJAI.commonData("deck");
    const count=Number($("#deck-count").value);
    const executeOut=TANJAI.executionPrompt("deck", d, {count});
    const discussOut=TANJAI.discussPrompt("deck", d);
    TANJAI.setReadyOutput("deck", {
      title:"Prompt สไลด์ — สั่งทำทันที",
      desc:"คัดลอกไปวางแล้วให้ AI สร้าง Outline สไลด์ทันที",
      main:executeOut,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"Outline ตัวอย่างจากระบบ",
      advanced2:TANJAI.deckOutline(d, count)
    });
    TANJAI.state.lastDeck=executeOut;
    TANJAI.toast("สร้าง Prompt สไลด์แบบสั่งทำทันทีแล้ว");
  };
  $("#makeKit").onclick = () => {
    const d=TANJAI.commonData("kit");
    const out = TANJAI.promptPack(d);
    const discussOut = TANJAI.discussPrompt("kit", d);
    const advancedOut = `AI Handoff Note

Universal Execution Prompt Pack นี้ออกแบบให้ใช้ต่อได้หลาย AI โดยไม่ต้องเลือกปลายทางก่อน
- ส่วนหลักคือ Prompt สำหรับสั่ง AI ทำงานทันที
- ส่วน Prompt สำหรับแก้ / คุยต่อ ใช้ตอนอยากปรับโทนหรือเกลาคำสั่ง
- หาก AI ปลายทางทำงานจริงไม่ได้ ต้องให้บอกเหตุผลตรง ๆ และส่ง Prompt พร้อมใช้แทน
- แนบรูปจริงเพิ่มใน AI ปลายทางเมื่อจำเป็น
- ตรวจชื่อบุคคล หน่วยงาน สถานที่ และวันที่ก่อนเผยแพร่

${TANJAI.outputDeliveryGuard("ชุดไฟล์สื่อ")}`;
    TANJAI.setReadyOutput("kit", {
      title:"Universal Execution Prompt Pack",
      desc:"มีทั้ง Prompt สำหรับแก้/คุยต่อ และ Prompt สำหรับสั่ง AI ทำงานทันที",
      main:out,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"AI Handoff Note",
      advanced2:advancedOut
    });
    TANJAI.state.lastKit=out;
    TANJAI.toast("สร้าง Universal Execution Prompt Pack แล้ว");
  };


  // Save
  $("#saveImage").onclick = () => TANJAI.saveProject($("#image-title").value || "สร้างภาพ", ($("#imageOut").textContent || "") + "\n\n=== Auto Prompt Critic ===\n" + (TANJAI.state.lastImageCritic || ""), "สร้างภาพ");
  $("#savePost").onclick = () => TANJAI.saveProject($("#post-title").value || "เรียบเรียงเนื้อหา", $("#postOut").textContent, "เรียบเรียงเนื้อหา");
  $("#saveMC").onclick = () => TANJAI.saveProject($("#mc-title").value || "งานพิธีกร", $("#mcOut").textContent, "งานพิธีกร");
  $("#saveVideo").onclick = () => TANJAI.saveProject($("#video-title").value || "ทำวิดีโอ", $("#videoOut").textContent, "ทำวิดีโอ");
  $("#saveVoice").onclick = () => TANJAI.saveProject($("#voice-title").value || "เสียงพากย์", $("#voiceOut").textContent, "เสียงพากย์");
  $("#saveDeck").onclick = () => TANJAI.saveProject($("#deck-title").value || "ทำสไลด์", $("#deckOut").textContent, "ทำสไลด์");
  $("#saveKit").onclick = () => TANJAI.saveProject($("#kit-title").value || "สร้างชุดสื่อ", $("#kitOut").textContent, "สร้างชุดสื่อ");

  $("#clearProjects").onclick = () => { localStorage.removeItem("tanjaiV5Projects"); TANJAI.renderProjects(); TANJAI.toast("ล้างโปรเจกต์แล้ว"); };
});

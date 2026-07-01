window.TANJAI = window.TANJAI || {};

document.addEventListener("DOMContentLoaded", () => {
  const $ = TANJAI.$, $$ = TANJAI.$$;
  const TANJAI_CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio";
  TANJAI.customGptUrl = TANJAI_CUSTOM_GPT_URL;
  TANJAI.normalizeGPTUrl = function(url){
    if(!url) return url;
    if(String(url).includes("g-6a30a740e7f88191b30aa43923fbb072-thanaicch-ai-studio")) return TANJAI_CUSTOM_GPT_URL;
    try{
      const parsed = new URL(String(url), window.location.href);
      return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : "";
    }catch(_error){
      return "";
    }
  };

  
  const opts = arr => arr.map(x => `<option>${x}</option>`).join("");
  const toolOptions = {
    orgTypes: ["ให้ AI วิเคราะห์จากรายละเอียด","เทศบาล / อบต. / หน่วยงานราชการ","โรงเรียน / ศูนย์พัฒนาเด็กเล็ก","โรงพยาบาล / สาธารณสุข","วัด / ศาสนา / วัฒนธรรม","โรงงาน / อุตสาหกรรม / ความปลอดภัย","ธนาคาร / การเงิน / สหกรณ์","ร้านค้า / ธุรกิจ / สินค้า","งานบริการ / สมาชิก / ประชาชน","ชุมชน / มูลนิธิ / กลุ่มอาสา","เพจ / ครีเอเตอร์ / ยูทูบเบอร์","ศิลปิน / เพลง / โปรโมทผลงาน","อื่น ๆ"],
    mainCategories: ["ให้ AI วิเคราะห์จากรายละเอียด","แจ้งข่าว / ประกาศ","รับสมัคร / เปิดลงทะเบียน / เชิญชวน","กิจกรรม / โครงการ / อบรม","รณรงค์ / ให้ความรู้","ขั้นตอนบริการ / วิธีใช้งาน / FAQ","คอนเทนต์โซเชียล / คำคม","โปรโมชัน / โฆษณา","พิธีการ / วันสำคัญ / ต้อนรับ","สรุปผลงาน / รายงานผล / ขอบคุณ","อื่น ๆ"],
    subCategories: ["ให้ AI วิเคราะห์จากรายละเอียด","แจ้งข่าวสำคัญ","ข่าวด่วน / แจ้งเตือน","เชิญร่วมกิจกรรม","รับสมัคร / เปิดลงทะเบียน","อบรมให้ความรู้","ลงพื้นที่ / ภาพกิจกรรม","ขั้นตอนบริการ / วิธีใช้งาน","FAQ / ข้อมูลควรรู้","รณรงค์ป้องกันโรค","รณรงค์ความปลอดภัย","วันสำคัญ / งานพิธี","ต้อนรับ / แสดงความยินดี","ขอบคุณ / สรุปผล","คำคม","โปรโมทสินค้า / บริการ","ปกคลิป / ปกเพลง","ทำคลิปสั้น","กำหนดเอง"],
    contentTypes: ["ให้ AI วิเคราะห์เอง","ประกาศ / แจ้งข่าว","เชิญร่วมกิจกรรม","งานประชุม / งานพิธี","โครงการ / อบรม","โปรโมทเพลง / ศิลปิน","สินค้า / บริการ","คำคม / แคปชั่น","ภาพคอนเซ็ปต์ / ภาพศิลป์","มาสคอต / คาแรกเตอร์","โลโก้ / แบรนด์"],
    visualPresets: ["ให้ AI เลือกตามงาน","โปสเตอร์ประชาสัมพันธ์ราชการ","Social Media Modern","Thai PR Premium","ภาพจริงแนวข่าวประชาสัมพันธ์","Infographic Clean","Minimal Clean","Luxury / Premium","3D Premium","ภาพการ์ตูน 2D","มาสคอต 3D","ภาพแฟนตาซี","โปสเตอร์หนัง / Cinematic Poster","ภาพสินค้า / Commercial Product","เพลง / ศิลปิน / Cover Art","ภาพคอนเซ็ปต์ / Mood Visual"],
    styleModifiers: ["อ่านง่ายบนมือถือ","ตัวหนังสือใหญ่","เว้นพื้นที่ข้อความ","โทนอบอุ่น","โทนสดใส","โทนเข้มจริงจัง","แสงภาพยนตร์","มีมิติ 3D เบา ๆ","เน้นภาพจริง","เน้นข้อมูล / ตัวเลข","เหมาะกับหน่วยงานราชการ","เหมาะกับโซเชียลไวรัล"],
    channels: ["Facebook","Line OA","TikTok / Reels","Instagram","YouTube Community","ประกาศภายใน","หลายช่องทาง"],
    postLengths: ["สั้น กระชับ","มาตรฐาน อ่านง่าย","ละเอียดครบถ้วน","แคปชั่นสั้นมาก"],
    layouts: ["AI PR Creative Director — เลือก Layout อัตโนมัติ","High-Impact Thai PR Poster","Hero Center Layout","Split Layout ซ้ายข้อความ ขวาภาพ","Infographic Layout","Poster Layout","Clean Social Card","ภาพเต็ม + กล่องข้อความ"],
    densities: ["สมดุล อ่านง่าย","โล่งมาก ดูแพง","ข้อมูลเยอะ แต่อ่านง่าย","แน่นแบบ Infographic"],
    focuses: ["เน้นหัวข้อหลัก","เน้นภาพบุคคล","เน้นภาพกิจกรรม","เน้นสินค้า / โปรโมชัน","เน้นบรรยากาศ","เน้นโลโก้หน่วยงาน"],
    colorTones: ["ให้ AI เลือกตามอารมณ์และบริบท","ม่วง–ทอง–ขาว สีสดแบบงานประชาสัมพันธ์","ม่วง–ทอง พรีเมียม","ม่วง–ทอง เทคโนโลยี","น้ำเงิน–ขาว ทางการ","ชมพู–ม่วง สดใส","ดำ–ทอง หรูหรา"],
    videoFormats: ["คลิปประชาสัมพันธ์","คลิปข่าวด่วน","คลิปกิจกรรม / โครงการ","คลิปรีวิว","คลิปโซเชียลไวรัล","คลิปแนวสารคดีสั้น"],
    slideStyles: ["ทางการสำหรับผู้บริหาร","สรุปประชุม","นำเสนอโครงการ","รายงานผล","Pitch Deck","สไลด์อบรม"],
    workTypes: ["นายกลงพื้นที่","ติดตามปัญหากลุ่มเป้าหมาย","ตรวจงานโครงการ","กิจกรรมเทศบาล","อบรม / ประชุม","งานพิธีกร / ผู้ดำเนินรายการ","พิธีเปิด / พิธีปิด","ลงพื้นที่ช่วยเหลือ","รณรงค์ / ประชาสัมพันธ์","อื่น ๆ"],
    workContexts: ["ให้ AI ช่วยเลือกจากรายละเอียด","Thai PR Premium","โปสเตอร์ประชาสัมพันธ์ไทยสีสด","แจ้งข่าว / ประกาศ","เชิญชวน / ประชาสัมพันธ์","โปรโมท / แคมเปญ / ขายผลงาน","โปรโมทเพลง / ผลงานสร้างสรรค์","ให้ความรู้ / Infographic","ขั้นตอนบริการ / วิธีใช้งาน","สรุปกิจกรรม / รายงานผล","งานพิธี / งานบุญ / งานชุมชน","อบรม / ประชุม / สัมมนา","ขอบคุณ / แสดงความยินดี / อวยพร","รณรงค์ / สร้างความตระหนัก","ไว้อาลัย / สุภาพ / ลดสี","อื่น ๆ"],
    imageTypes: ["ให้ AI ช่วยเลือกตามบริบท","โพสต์โซเชียล","โปสเตอร์ประชาสัมพันธ์","อินโฟกราฟิก","ภาพแน่นข้อมูล","ภาพอ่านง่าย","ปก / Cover","ปกเพลง / โปรโมทเพลง","ภาพเชิญชวนกิจกรรม","ภาพแจ้งข่าว","ภาพสรุปกิจกรรม","ชุดภาพโพสต์ Facebook","ภาพแนวนอน / แบนเนอร์","ภาพไว้อาลัย / สุภาพ","อื่น ๆ"],
    qualityLevels: ["Creative Quality สมดุล — มืออาชีพ มีไอเดีย พร้อมใช้ (แนะนำ)","Thai PR Premium — กราฟิกหลายชั้น ข้อมูลเด่น","คุมข้อมูลเข้ม — เน้นความถูกต้องและอ่านง่าย","สวยพรีเมียม — ยกระดับงานให้ดูแพงแต่ไม่มั่ว","สดใสโซเชียล — ดึงดูดแต่ยังอ่านชัด","ทางการสะอาด — เหมาะกับหน่วยงานและประกาศ"],
    creativityLevels: ["คิดสร้างสรรค์ระดับกลาง — มี Big Idea แต่ไม่เว่อร์ (แนะนำ)","ครีเอทีฟเต็มที่ในองค์ประกอบภาพ แต่ห้ามแต่งข้อมูลจริง","คิดต่อพอดีตามข้อมูลผู้ใช้","ตามผู้ใช้สั่งมากที่สุด ไม่ตีความเกิน","ลดความเว่อร์ เน้นงานใช้งานจริง"]
  };

// Render forms
  $("#routerForm").innerHTML = `<div class="form-section"><div class="section-title"><b>?</b><h4>อยากทำอะไรครับ?</h4></div><label class="full">พิมพ์โจทย์ของพี่<textarea id="router-query" placeholder="เช่น อยากทำโพสต์ประชาสัมพันธ์โครงการปลูกต้นไม้ / อยากทำเสียงพากย์คลิปแจ้งข่าว / อยากทำสไลด์นำเสนอ"></textarea></label></div><div class="button-row"><button class="btn primary" id="askRouter">ให้ Router แนะนำ</button><button class="btn secondary" id="goRecommended">ไปที่เมนูที่แนะนำ</button></div>`;
  $("#routerResult").innerHTML = TANJAI.resultShell("router", "คำแนะนำจาก AI Router", "ระบบจะแนะนำเมนูและปลายทางที่เหมาะกับโจทย์", "routerOut", `<button class="btn primary" data-copybox="routerOut">คัดลอกคำแนะนำ</button>`);

  $("#imageForm").innerHTML = TANJAI.field("image") + `
    <div class="form-section simple-smart-section-v98 creative-quality-wrap-v91">
      <div class="section-title"><b>2</b><h4>เลือกแนวภาพ</h4></div>
      <p class="mini-note">เลือกแนวหลักแค่ 1 อย่างก็พอ ระบบจะจัดประเภทเนื้อหาและรายละเอียด Prompt ให้เอง หากไม่แน่ใจให้ปล่อยเป็น “ให้ AI เลือกตามงาน”</p>
      <div class="form-grid">
        <label class="full">แนวภาพหลัก / Visual Preset<select id="image-visualPreset">${opts(toolOptions.visualPresets)}</select><small>นี่คือสไตล์ภาพ ไม่ใช่ข้อความที่จะพิมพ์บนภาพ</small></label>
        <div class="full preset-wrap compact-preset-wrap-v98">
          <small class="preset-label">แนวยอดนิยม</small>
          <div class="preset-row creative-preset-row-v91 market-preset-row-v98">
            <button type="button" class="chip-btn" data-v98-visual="โปสเตอร์ประชาสัมพันธ์ราชการ" data-v91-context="แจ้งข่าว / ประกาศ" data-v91-type="โปสเตอร์ประชาสัมพันธ์">ราชการ / PR</button>
            <button type="button" class="chip-btn" data-v98-visual="Social Media Modern" data-v91-context="เชิญชวน / ประชาสัมพันธ์" data-v91-type="โพสต์โซเชียล">Social Modern</button>
            <button type="button" class="chip-btn" data-v98-visual="Thai PR Premium" data-v91-context="Thai PR Premium" data-v91-type="โปสเตอร์ประชาสัมพันธ์">Thai PR Premium</button>
            <button type="button" class="chip-btn" data-v98-visual="ภาพการ์ตูน 2D" data-v91-context="เชิญชวน / ประชาสัมพันธ์" data-v91-type="โพสต์โซเชียล">การ์ตูน 2D</button>
            <button type="button" class="chip-btn" data-v98-visual="มาสคอต 3D" data-v91-context="เชิญชวน / ประชาสัมพันธ์" data-v91-type="โพสต์โซเชียล">มาสคอต 3D</button>
            <button type="button" class="chip-btn" data-v98-visual="โปสเตอร์หนัง / Cinematic Poster" data-v91-context="โปรโมทเพลง / ผลงานสร้างสรรค์" data-v91-type="ปก / Cover">โปสเตอร์หนัง</button>
            <button type="button" class="chip-btn" data-v98-visual="เพลง / ศิลปิน / Cover Art" data-v91-context="โปรโมทเพลง / ผลงานสร้างสรรค์" data-v91-type="ปกเพลง / โปรโมทเพลง">เพลง / Cover</button>
            <button type="button" class="chip-btn" data-v98-visual="Infographic Clean" data-v91-context="ให้ความรู้ / Infographic" data-v91-type="อินโฟกราฟิก">Infographic</button>
          </div>
        </div>
      </div>

      <details class="quick-advanced v98-advanced-control">
        <summary><span>ปรับละเอียด</span><small>สำหรับคนที่อยากคุมแนวภาพเพิ่ม</small></summary>
        <div class="quick-advanced-body">
          <div class="form-grid quick-advanced-grid">
            <label>ประเภทเนื้อหา<select id="image-contentType">${opts(toolOptions.contentTypes)}</select><small>ช่วยให้ระบบรู้ว่างานนี้ต้องใช้วัน เวลา สถานที่ หรือไม่</small></label>
            <label>ประเภทภาพ<select id="image-imageType">${opts(toolOptions.imageTypes)}</select></label>
            <label class="full">ตัวเสริมภาพ / Style Modifier<select id="image-styleModifiers" class="style-modifier-select-v974" multiple size="5">${opts(toolOptions.styleModifiers)}</select><small>เลือกได้ไม่เกิน 3 ข้อ เช่น อ่านง่ายบนมือถือ / เว้นพื้นที่ข้อความ / แสงภาพยนตร์</small></label>
            <label>บริบทงาน<select id="image-workContext">${opts(toolOptions.workContexts)}</select></label>
            <label>ระดับคุณภาพงาน<select id="image-qualityLevel">${opts(toolOptions.qualityLevels)}</select></label>
            <label>ระดับการคิดต่อ<select id="image-creativityLevel">${opts(toolOptions.creativityLevels)}</select></label>
            <label>ประเภทองค์กร<select id="image-orgType">${opts(toolOptions.orgTypes)}</select></label>
            <label>ช่องทาง / ขนาดภาพ<select id="image-size">${opts(TANJAI.categories.sizes)}</select></label>
            <label>หมวดงานหลัก<select id="image-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
            <label>หัวข้องานย่อย<select id="image-subCategory">${opts(toolOptions.subCategories)}</select></label>
            <label>สไตล์ภาพสำรอง<select id="image-style">${opts(TANJAI.categories.imageStyles)}</select><small>ใช้เมื่ออยากล็อกสไตล์เพิ่มจาก Visual Preset</small></label>
            <label>Layout<select id="image-layout">${opts(toolOptions.layouts)}</select></label>
            <label>โทนสี<select id="image-colorTone">${opts(toolOptions.colorTones)}</select></label>
            <label>ความหนาแน่น<select id="image-density">${opts(toolOptions.densities)}</select></label>
            <label>จุดเด่นของภาพ<select id="image-focus">${opts(toolOptions.focuses)}</select></label>
            <label>โทนภาษา<select id="image-tone">${opts(TANJAI.categories.tones)}</select></label>
            <label class="full">ข้อห้าม / หมายเหตุ<textarea id="image-avoid" placeholder="เช่น ห้ามสร้าง QR ปลอม ห้ามวาดโลโก้ใหม่ เว้นพื้นที่ด้านบน ใช้รูปจริงตามแนบ"></textarea></label>
          </div>
        </div>
      </details>
    </div>

    <details class="quick-advanced v98-advanced-control image-reference-v98">
      <summary><span>ภาพอ้างอิง / ภาพจริง</span><small>ไม่บังคับ</small></summary>
      <div class="quick-advanced-body">
        <div class="form-grid">
          <label class="full">แนบภาพจริง / ภาพอ้างอิง
            <input id="image-photos" type="file" accept="image/*" multiple>
            <small>หากแนบ ระบบจะให้ AI วิเคราะห์เองว่าไฟล์ใดเป็นโลโก้ ภาพบุคคล หรือภาพอ้างอิง</small>
            <div id="image-photoPreview" class="upload-preview-grid"></div>
          </label>
        </div>
      </div>
    </details>

    <details class="quick-advanced v98-advanced-control" id="image-safetyWrap">
      <summary><span>โหมดภาพจริงและความปลอดภัย</span><small>เปิดเมื่อใช้รูปจริง</small></summary>
      <div class="quick-advanced-body">
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
    </details>

    <input id="image-smartCoach" type="hidden" value="on">
    <input id="image-smartThinking" type="hidden" value="ให้ AI ช่วยคิดต่ออัตโนมัติ">
    <input id="image-smartOutput" type="hidden" value="สรุปคำสั่ง + Prompt พร้อมส่งเข้า GPT">
    <input id="image-smartBackup" type="hidden" value="on">
    <input id="image-smartConfirm" type="hidden" value="on">
    <input id="image-smartMunicipal" type="hidden" value="on">

    <div class="button-row"><button class="btn primary" id="makeImage">สร้างภาพพร้อมใช้</button><button class="btn secondary" id="saveImage">บันทึก</button></div>
  `;

$("#albumForm").innerHTML = `
    <div class="form-section"><div class="section-title"><b>1</b><h4>อัปโหลดภาพจริง</h4></div>
      <div class="form-grid">
        <label>โลโก้จริง / โปรไฟล์เพจ (ไม่บังคับ)
          <input id="album-logoFile" type="file" accept="image/*">
          <small>ถ้าไม่ใส่ ระบบจะไม่ใส่โลโก้บนภาพ</small>
        </label>
        <input id="album-layoutMode" type="hidden" value="Facebook Cover + Lite + Additional Frame System">
        <label>ภาพหน้าปกหลัก (จำเป็น)
          <input id="album-coverFile" type="file" accept="image/*">
          <small>ภาพที่ 1 จะเป็น Cover Frame แบบเต็ม ใช้ขายหัวข้อและข้อมูลสำคัญ</small>
        </label>
        <label class="full">ภาพรอง 3–4 ภาพ
          <input id="album-supportFiles" type="file" accept="image/*" multiple>
          <small>ภาพรองใช้กรอบบาง เน้นภาพจริง และไม่ใส่หมายเลขลำดับบนภาพ</small>
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
        <div class="full album-preset-picker">
          <label>รูปแบบการโพสต์ Facebook</label>
          <select id="album-facebookPreset" hidden><option value="auto" selected>อัตโนมัติ</option><option value="square-grid">4 ภาพจัตุรัส</option><option value="wide-top">ปกกว้างด้านบน</option><option value="portrait-left">ปกตั้งด้านซ้าย</option></select>
          <div class="album-preset-cards" role="group" aria-label="เลือกรูปแบบการโพสต์ Facebook">
            <button type="button" class="album-preset-card selected" data-album-preset="auto"><span class="preset-auto-mark">AI</span><b>อัตโนมัติ</b><small>วิเคราะห์ภาพปกให้</small></button>
            <button type="button" class="album-preset-card" data-album-preset="square-grid"><span class="preset-diagram preset-square"><i></i><i></i><i></i><i></i></span><b>4 ภาพจัตุรัส</b><small>1080x1080 ทุกภาพ</small></button>
            <button type="button" class="album-preset-card" data-album-preset="wide-top"><span class="preset-diagram preset-wide"><i></i><i></i><i></i><i></i></span><b>ปกกว้างด้านบน</b><small>1080x800 + ภาพรอง</small></button>
            <button type="button" class="album-preset-card" data-album-preset="portrait-left"><span class="preset-diagram preset-portrait"><i></i><i></i><i></i><i></i></span><b>ปกตั้งด้านซ้าย</b><small>1280x1920 + ภาพรอง</small></button>
          </div>
          <small>ขนาดไฟล์และตัวอย่างโพสต์จะเปลี่ยนตามแบบที่เลือกอัตโนมัติ</small>
        </div>
        <label class="full">สไตล์แคปชั่น Facebook<select id="album-captionStyle"><option value="pr-ready" selected>พร้อมโพสต์ — กระชับและครบประเด็น</option><option value="official">ทางการสำหรับหน่วยงาน</option><option value="friendly">อบอุ่น เข้าถึงง่าย</option><option value="story">เล่าเรื่องกิจกรรม</option><option value="announcement">ประกาศ / แจ้งข่าว</option></select><small>Caption Writer จะใช้เฉพาะข้อมูลจริงที่กรอก และไม่แต่งชื่อ วันที่ สถานที่ หรือตัวเลขเพิ่ม</small></label>
        <input id="album-ratio" type="hidden" value="auto">
        <input id="album-previewLayout" type="hidden" value="auto">
        <label>สไตล์กรอบ<select id="album-frameStyle"><option>ทั่วไป / หน่วยงาน / แบรนด์</option><option>ประชุม / เวทีรับฟัง / ประชาคม</option><option>ลงพื้นที่ / ภารกิจ / ติดตามงาน</option><option>ข่าวด่วน / ประกาศสำคัญ</option><option>กิจกรรม / อบรม / อีเวนต์</option><option>โรงเรียน / การศึกษา</option><option>สุขภาพ / รณรงค์ / ชุมชน</option><option>ธุรกิจ / สินค้า / โปรโมชัน</option><option>เพจ / ครีเอเตอร์ / แบรนด์ส่วนตัว</option><option>มินิมอล ขอบบาง</option></select></label>
        <label>Theme Cover Frame Preset<select id="album-themePreset"><option>Ribbon Civic Cover</option><option>Modern Glass Cover</option><option>Clean Civic Cover</option><option>Minimal Story Cover</option></select></label>
        <label>โทนสี<select id="album-colorTone"><option selected>AI เลือกโทนสีให้เข้ากับงาน</option><option>ม่วง–ทอง พรีเมียม</option><option>เขียว–เหลือง–ขาว</option><option>น้ำเงิน–ขาว ทางการ</option><option>ส้ม–ทอง สดเด่น</option><option>ดำ–ทอง หรูหรา</option></select></label>
        <label>โหมดอัตโนมัติ<select id="album-autoMode"><option>ปรับภาพ + ครอป + ใส่กรอบ</option><option>ภาพกิจกรรมเน้นภาพ / แถบเล็ก</option><option>ครอป + ใส่กรอบเท่านั้น</option><option>ปรับภาพเท่านั้น</option></select></label>
        <label>Pro Frame (กรอบตามตัวอย่าง)<select id="album-proFrame"><option value="Balanced Ribbon" selected>Clean Civic Frame (กรอบเรียบสำหรับงานประชาสัมพันธ์)</option><option value="Gold Luxury">Gold Luxury (ขอบทองหรูหรา)</option><option value="None">ไม่มีกรอบพิเศษ</option><option value="Modern Neon">Modern Neon (ขอบนีออนเรืองแสง)</option><option value="Bold Corporate">Bold Corporate (ขอบสีแบรนด์)</option></select><small>ภาพปกใช้กรอบหัวเรื่องแบบสะอาด ภาพรองใช้เพียงขอบบางและแถบคำอธิบาย</small></label>
        <div class="full album-smart-choice" id="album-smartChoice">ระบบจะสรุปขนาดและรูปแบบพรีวิวที่เลือกให้อีกครั้งหลังสร้างชุดภาพ</div>
        <input id="album-safeMode" type="checkbox" checked hidden>
        <input id="album-makeCover" type="checkbox" checked hidden>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeAlbum">สร้าง Cover + Lite Album</button><button class="btn secondary" id="albumDownloadAll">ดาวน์โหลด ZIP</button><button class="btn secondary" id="albumClear">ล้างรูป</button></div>
  `;

  $("#postForm").innerHTML = TANJAI.field("post") + `
    <div class="form-note">ผู้เชี่ยวชาญงานเขียนสำหรับสรุปงาน ข่าวประชาสัมพันธ์ โพสต์ Facebook ข้อความ Line และแคปชั่นโดยเฉพาะ</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าการเรียบเรียงเนื้อหา</h4></div>
      <div class="form-grid">
        <label>ประเภทงาน<select id="post-workType">${opts((toolOptions.workTypes || ["นายกลงพื้นที่","กิจกรรมเทศบาล","อื่น ๆ"]).filter(x => !/พิธีกร|พิธีเปิด|พิธีปิด/.test(x)))}</select></label>
        <label>ต้องการเรียบเรียงเป็น<select id="post-channel"><option>สรุปงาน</option><option>เรียบเรียงข้อมูล</option><option>บทความ</option><option>ข่าวประชาสัมพันธ์</option><option>โพสต์ Facebook</option><option>ข้อความ Line</option><option>แคปชั่น</option></select></label>
        <label>ความยาว<select id="post-length">${opts(toolOptions.postLengths)}</select></label>
        <label>หมวดงาน<select id="post-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
        <label class="full">แนบรูปประกอบ / รูปเอกสาร / รูปลงพื้นที่
          <input id="post-photos" type="file" accept="image/*" multiple>
          <small>ระบบเขียนฟรีจะไม่เดาข้อมูลจากภาพ กรุณากรอกสาระสำคัญจากเอกสารในช่องรายละเอียด เพื่อป้องกันข้อมูลผิด</small>
          <div id="post-photoPreview" class="upload-preview-grid"></div>
        </label>
        <label class="full">สิ่งที่อยากให้เน้นเพิ่มเติม<textarea id="post-extra" placeholder="เช่น เน้นผลต่อประชาชน / เปิดเรื่องให้ตรงประเด็น / ลดภาษาราชการ / CTA ชัด"></textarea></label>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makePost">✨ ให้ AI วิเคราะห์และเขียน</button><button class="btn secondary" id="savePost">บันทึก</button></div>`;

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
          <small>ระบบจะไม่อ่านข้อความในภาพอัตโนมัติ กรุณากรอกลำดับพิธีจริงเพื่อป้องกันชื่อและกำหนดการผิด</small>
          <div id="mc-photoPreview" class="upload-preview-grid"></div>
        </label>
        <label class="full">ข้อมูลพิธี / สิ่งที่อยากให้เน้น<textarea id="mc-extra" placeholder="เช่น ประธานในพิธี / ผู้กล่าวรายงาน / ลำดับพิธี / ช่วงมอบรางวัล / ถ่ายภาพร่วมกัน / คำเรียกแขกผู้มีเกียรติ"></textarea></label>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeMC">✨ ให้ AI วิเคราะห์และสร้างสคริปต์</button><button class="btn secondary" id="saveMC">บันทึก</button></div>`;
  $("#videoForm").innerHTML = TANJAI.field("video") + `
    <div class="form-note">เมนูนี้ใช้วางแผนวิดีโอหรือคลิป สร้างประโยคเปิด ลำดับภาพ บทพากย์ และข้อความบนจอ</div>
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าวิดีโอ / คลิป</h4></div>
      <div class="form-grid">
        <label>ความยาว<select id="video-length">${opts(TANJAI.categories.videoLengths)}</select></label>
        <label>รูปแบบคลิป<select id="video-format">${opts(toolOptions.videoFormats)}</select></label>
        <label>ช่องทาง<select id="video-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="video-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVideo">✨ ให้ AI วิเคราะห์และสร้างบทวิดีโอ</button><button class="btn secondary" id="saveVideo">บันทึก</button></div>`;
  $("#voiceForm").innerHTML = TANJAI.field("voice") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าเสียง</h4></div>
      <div class="form-grid">
        <label>ความยาวเสียง<select id="voice-length">${opts(TANJAI.categories.voiceLengths)}</select></label>
        <label>สไตล์เสียง<select id="voice-style">${opts(TANJAI.categories.voiceStyles)}</select></label>
        <label>ช่องทางใช้งาน<select id="voice-channel">${opts(toolOptions.channels)}</select></label>
        <label>หมวดงาน<select id="voice-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeVoice">✨ ให้ AI วิเคราะห์และสร้างเสียงพากย์</button><button class="btn secondary" id="saveVoice">บันทึก</button></div>`;
  $("#deckForm").innerHTML = TANJAI.field("deck") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าสไลด์</h4></div>
      <div class="form-grid">
        <label>จำนวนสไลด์<select id="deck-count"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></label>
        <label>รูปแบบสไลด์<select id="deck-format">${opts(toolOptions.slideStyles)}</select></label>
        <label>หมวดงาน<select id="deck-mainCategory">${opts(toolOptions.mainCategories)}</select></label>
      </div>
    </div><div class="button-row"><button class="btn primary" id="makeDeck">✨ ให้ AI วิเคราะห์และสร้างสไลด์</button><button class="btn secondary" id="saveDeck">บันทึก</button></div>`;
  $("#kitForm").innerHTML = TANJAI.field("kit") + `
    <div class="form-section">
      <div class="section-title"><b>2</b><h4>ผู้กำกับชุดสื่อ</h4></div>
      <div class="prompt-workspace-note">
        ระบบจะสร้างแกนเนื้อหากลาง แล้วแยกบทบาทของภาพ โพสต์ วิดีโอ เสียง และสไลด์ให้สอดคล้องกันโดยไม่ใช้ข้อความซ้ำทั้งชุด
      </div>
      <input id="kit-packMode" type="hidden" value="Integrated Campaign Expert Prompt">
    </div>
    <div class="button-row"><button class="btn primary" id="makeKit">สร้าง Prompt สั่งทำทันที</button><button class="btn secondary" id="saveKit">บันทึก</button></div>`;

  TANJAI.simplifyExpertForms?.();

  // Results
  $("#imageResult").innerHTML = TANJAI.readyOutputShell("image", "ภาพพร้อมสร้าง — Creative Director", "ขั้นตอน: คัดลอก Prompt → เปิด ทันใจ GPT → แนบไฟล์จริง (ถ้ามี) → วาง Prompt", "imageOut");
$("#albumResult").innerHTML = TANJAI.readyOutputShell("album", "ชุดภาพพร้อมโพสต์", "ปรับภาพจริง ใส่กรอบ และดาวน์โหลดเป็นภาพพร้อมลง Facebook", "albumOut");
$("#postResult").innerHTML = TANJAI.readyOutputShell("post", "งานเขียนพร้อมใช้ — Caption & Article Writer", "สร้างแคปชั่น บทความ ข่าว โพสต์ และข้อความ LINE จบในเว็บ", "postOut");
$("#mcResult").innerHTML = TANJAI.readyOutputShell("mc", "สคริปต์พิธีกรพร้อมใช้ — MC Writer", "คุมลำดับพิธี ชื่อ ตำแหน่ง คำเชื่อม และบัตรเตือนพิธีกร", "mcOut");
  $("#videoResult").innerHTML = TANJAI.readyOutputShell("video", "บทวิดีโอพร้อมผลิต — Video Script Writer", "ได้ Hook, Storyboard, บทพากย์ และข้อความบนจอทันที", "videoOut");
  $("#voiceResult").innerHTML = TANJAI.readyOutputShell("voice", "สคริปต์เสียงพร้อมอ่าน — Voice Script Writer", "คุมเวลาพูด จังหวะ คำเน้น และคำอ่าน", "voiceOut");
  $("#deckResult").innerHTML = TANJAI.readyOutputShell("deck", "เนื้อหาสไลด์พร้อมใช้ — Slide Writer", "ได้โครงเรื่อง เนื้อหาบนสไลด์ และ Speaker Notes", "deckOut");
  $("#kitResult").innerHTML = TANJAI.readyOutputShell("kit", "Prompt ชุดสื่อพร้อมใช้ — ผู้กำกับชุดสื่อ", "สร้างแกนเนื้อหาเดียว แล้วแยกบทบาทของแต่ละสื่อโดยไม่ใช้ข้อความซ้ำกัน", "kitOut");

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
        title:"Prompt มืออาชีพ — สำหรับตรวจและปรับต่อ",
        desc:"ใช้เมื่อต้องการดู Creative Direction, TEXT LOCK, Negative Prompt และรายละเอียดการผลิตก่อนสั่งสร้าง",
        main:discussText,
        advancedTitle1:"คำสั่งสร้างภาพจริงทันที",
        advanced1:executeText,
        advancedTitle2:"ตัวช่วยตรวจความพร้อม",
        advanced2:criticText
      });
      TANJAI.state.lastImageMode = "prompt";
      return;
    }
    TANJAI.setReadyOutput("image", {
      title:"ภาพพร้อมสร้าง — Creative Director",
      desc:"คัดลอก Prompt แล้วเปิด ทันใจ GPT หากเลือกไฟล์ในเว็บ ต้องแนบไฟล์จริงซ้ำในแชทก่อนวาง Prompt",
      main:executeText,
      advancedTitle1:"Prompt มืออาชีพสำหรับตรวจและปรับต่อ",
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
    TANJAI.toast?.("เปิดผู้เชี่ยวชาญงานเขียนแล้ว");
  };

  TANJAI.activateMCMode = function(){
    TANJAI.switchView("mc");
    TANJAI.toast?.("เปิดผู้เชี่ยวชาญงานพิธีกรแล้ว — ตรวจชื่อประธานและลำดับพิธีก่อนใช้งาน");
  };


  // v9.1 Context & Creative Quality System
  TANJAI.quickActions = [
    {label:"หน้าหลัก", icon:"🏠", view:"dashboard", hint:"กลับหน้าแรก"},
    {label:"สร้างชุดสื่อ", icon:"🧩", view:"kit", hint:"Prompt ครบชุดจากข้อมูลเดียว"},
    {label:"สร้างภาพ", icon:"🖼️", view:"image", hint:"Prompt ภาพพร้อมใช้"},
    {label:"แต่งภาพ AI", icon:"✨", view:"photoPro", hint:"ปรับแสง สี เงา ความคมชัดหลายภาพ"},
    {label:"ชุดภาพโพสต์ Facebook", icon:"🧷", view:"album", hint:"อัปโหลดรูป ใส่กรอบ แคปชั่น ZIP"},
    {label:"เรียบเรียงเนื้อหา", icon:"✍️", view:"post", hint:"สรุปงาน ข่าว โพสต์ Line และแคปชั่น"},
    {label:"งานพิธีกร", icon:"🎤", view:"mc", hint:"สคริปต์พิธีกร คำเชิญประธาน คำกล่าว คำเชื่อมช่วง"},
    {label:"ทำวิดีโอ", icon:"🎬", view:"video", hint:"Storyboard / Hook / Voice Over"},
    {label:"เสียงพากย์", icon:"🎙️", view:"voice", hint:"สคริปต์เสียงอ่าน"},
    {label:"ทำสไลด์", icon:"📊", view:"deck", hint:"Outline สไลด์"},
    {label:"คลัง Prompt", icon:"⭐", view:"promptHub", hint:"คำสั่งพร้อมใช้"},
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
        <button data-fab-view="photoPro" title="แต่งภาพ AI">✨<span>แต่งรูป</span></button>
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
  document.getElementById("openCommandTop")?.addEventListener("click", () => TANJAI.openCommandPalette?.());



  // Firebase Auth Integration v9.1
  (function(){
    const loginForm = document.getElementById("loginForm");
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    const loginError = document.getElementById("loginError");
    const signUpBtn = document.getElementById("signUpBtn");
    const signInBtn = document.getElementById("signInBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");
    const togglePassword = document.getElementById("togglePassword");
    const allowRegistration = window.TANJAI_ALLOW_PUBLIC_REGISTRATION === true;

    if(signUpBtn){
      signUpBtn.hidden = !allowRegistration;
      signUpBtn.parentElement?.classList.toggle("single-action", !allowRegistration);
    }

    const setAuthBusy = (busy, mode="login") => {
      [signInBtn, signUpBtn].forEach(btn => {
        if(btn) btn.disabled = busy;
      });
      if(signInBtn){
        signInBtn.setAttribute("aria-busy", busy ? "true" : "false");
        signInBtn.textContent = busy && mode === "login" ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ";
      }
      if(signUpBtn){
        signUpBtn.setAttribute("aria-busy", busy ? "true" : "false");
        signUpBtn.textContent = busy && mode === "register" ? "กำลังสมัคร…" : "สมัครสมาชิก";
      }
    };

    togglePassword?.addEventListener("click", () => {
      const show = loginPassword.type === "password";
      loginPassword.type = show ? "text" : "password";
      togglePassword.textContent = show ? "ซ่อน" : "แสดง";
      togglePassword.setAttribute("aria-pressed", show ? "true" : "false");
    });

    if(loginForm){
      loginForm.addEventListener("submit", async e => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        if(loginError) loginError.textContent = "";
        if(!window.TANJAI_AUTH){
          if(loginError) loginError.textContent = "ระบบสมาชิกยังไม่พร้อม กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
          return;
        }
        setAuthBusy(true, "login");
        try {
          await window.TANJAI_AUTH.login(email, password);
          if(loginPassword) loginPassword.value = "";
        } catch (error) {
          if(loginError) loginError.textContent = error.message;
        } finally {
          setAuthBusy(false);
        }
      });
    }

    if(signUpBtn && allowRegistration){
      signUpBtn.addEventListener("click", async () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        if(loginError) loginError.textContent = "";
        if (!email || !password) {
          if(loginError) loginError.textContent = "กรุณากรอกอีเมลและรหัสผ่านเพื่อสมัครสมาชิก";
          return;
        }

        if (confirm("คุณต้องการสมัครสมาชิกด้วยอีเมลนี้ใช่หรือไม่?")) {
          if(!window.TANJAI_AUTH){
            if(loginError) loginError.textContent = "ระบบสมาชิกยังไม่พร้อม กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
            return;
          }
          setAuthBusy(true, "register");
          try {
            await window.TANJAI_AUTH.register(email, password);
          } catch (error) {
            if(loginError) loginError.textContent = error.message;
          } finally {
            setAuthBusy(false);
          }
        }
      });
    }

    if(logoutBtn){
      logoutBtn.addEventListener("click", async () => {
        if (window.TANJAI_AUTH) await window.TANJAI_AUTH.logout();
      });
    }
    // ปุ่มออกจากระบบในหน้าคู่มือ
    const guideLogoutBtn = document.getElementById("guideLogoutBtn");
    if(guideLogoutBtn){
      guideLogoutBtn.addEventListener("click", async () => {
        if(!window.TANJAI_AUTH) return;
        if(confirm("ต้องการออกจากระบบหรือไม่?")) await window.TANJAI_AUTH.logout();
      });
    }
    if(sidebarLogoutBtn){
      sidebarLogoutBtn.addEventListener("click", async () => {
        if(!window.TANJAI_AUTH) return;
        if(confirm("ต้องการออกจากระบบหรือไม่?")) await window.TANJAI_AUTH.logout();
      });
    }
  })();


  // v6.1.4 mobile drawer menu
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const mainSidebar = document.getElementById("mainSidebar");
  const setSidebarOpen = (open, restoreFocus=false) => {
    document.body.classList.toggle("sidebar-open", open);
    mobileMenuBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    mobileMenuBtn?.setAttribute("aria-label", open ? "ปิดเมนูหลัก" : "เปิดเมนูหลัก");
    sidebarOverlay?.setAttribute("aria-hidden", open ? "false" : "true");
    if(open) setTimeout(() => mainSidebar?.querySelector(".nav-link")?.focus(), 30);
    else if(restoreFocus) mobileMenuBtn?.focus();
  };
  const closeSidebar = (restoreFocus=false) => setSidebarOpen(false, restoreFocus);
  if(mobileMenuBtn){
    mobileMenuBtn.addEventListener("click", e => {
      e.preventDefault();
      setSidebarOpen(!document.body.classList.contains("sidebar-open"));
    });
  }
  if(sidebarOverlay){ sidebarOverlay.addEventListener("click", () => closeSidebar(true)); }
  window.addEventListener("keydown", e => {
    if(e.key === "Escape" && document.body.classList.contains("sidebar-open")) closeSidebar(true);
  });
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
    (preview._objectUrls || []).forEach(url => URL.revokeObjectURL(url));
    preview._objectUrls = [];
    preview.replaceChildren();
    files.forEach(file => {
      const src = URL.createObjectURL(file);
      preview._objectUrls.push(src);
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      const caption = document.createElement("figcaption");
      image.src = src;
      image.alt = file.name;
      caption.textContent = file.name;
      figure.append(image, caption);
      preview.appendChild(figure);
    });
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


  const setSelectOptionValue = (selector, value) => {
    const el = $(selector);
    if(!el || !value) return;
    const exact = Array.from(el.options || []).find(o => o.value === value || o.textContent === value);
    if(exact){ el.value = exact.value; return; }
    const opt = document.createElement("option");
    opt.textContent = value;
    opt.value = value;
    el.appendChild(opt);
    el.value = value;
  };

  const v91CreativePresets = {
    "Thai PR Premium": {
      contentType:"เชิญร่วมกิจกรรม",
      visualPreset:"Thai PR Premium",
      style:"Thai PR Premium — 3D text / burst / mascot / layered zones",
      layout:"High-Impact Thai PR Poster",
      density:"ข้อมูลเยอะ แต่อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ม่วง–ทอง–ขาว สีสดแบบงานประชาสัมพันธ์",
      tone:"น่าเชื่อถือแบบหน่วยงาน",
      mainCategory:"รับสมัคร / เปิดลงทะเบียน / เชิญชวน",
      subCategory:"เชิญร่วมกิจกรรม",
      preview:"งาน Thai PR Premium เน้นหัวข้อ 3D เด่น มี burst background แบบคุมจังหวะ ใช้มาสคอตการ์ตูนเมื่อเหมาะ และจัดข้อมูลเป็น layered zones ที่อ่านง่ายบนมือถือ"
    },
    "โปสเตอร์ประชาสัมพันธ์ไทยสีสด": {
      contentType:"ประกาศ / แจ้งข่าว",
      visualPreset:"โปสเตอร์ประชาสัมพันธ์ราชการ",
      style:"Thai PR Poster Premium — สีสด ตัวอักษรเด่น",
      layout:"High-Impact Thai PR Poster",
      density:"ข้อมูลเยอะ แต่อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ม่วง–ทอง–ขาว สีสดแบบงานประชาสัมพันธ์",
      tone:"น่าเชื่อถือแบบหน่วยงาน",
      mainCategory:"แจ้งข่าว / ประกาศ",
      subCategory:"แจ้งข่าวสำคัญ",
      preview:"โปสเตอร์ประชาสัมพันธ์ไทยสีสด หัวข้อ 3D เด่น ลำดับข้อมูลเป็นชั้น ใช้การ์ดข้อมูลและภาพประกอบเฉพาะเรื่อง โดยใช้เฉพาะโลโก้ QR และข้อมูลจริงที่แนบมา"
    },
    "โปรโมทเพลง / ผลงานสร้างสรรค์": {
      contentType:"โปรโมทเพลง / ศิลปิน",
      visualPreset:"เพลง / ศิลปิน / Cover Art",
      style:"Modern Premium Clean",
      layout:"Poster Layout",
      density:"สมดุล อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"โปรโมทแบบทันสมัย",
      mainCategory:"โปรโมชัน / โฆษณา",
      subCategory:"ปกคลิป / ปกเพลง",
      preview:"งานเพลงควรเน้นอารมณ์ ชื่อเพลงใหญ่ ภาพบุคคลหรือ mood เด่น ไม่ยัดข้อมูลแน่น และไม่เติม QR/โลโก้ถ้าไม่มีไฟล์จริง"
    },
    "แจ้งข่าว / ประกาศ": {
      contentType:"ประกาศ / แจ้งข่าว",
      visualPreset:"โปสเตอร์ประชาสัมพันธ์ราชการ",
      style:"Modern Premium Clean",
      layout:"Clean Social Card",
      density:"สมดุล อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"น้ำเงิน–ขาว ทางการ",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"แจ้งข่าว / ประกาศ",
      subCategory:"แจ้งข่าวสำคัญ",
      preview:"งานแจ้งข่าวต้องอ่านเร็ว หัวข้อใหญ่ ข้อมูลสำคัญชัด ไม่ตกแต่งเยอะเกิน และห้ามเดาวันเวลา/สถานที่"
    },
    "เชิญชวน / ประชาสัมพันธ์": {
      contentType:"เชิญร่วมกิจกรรม",
      visualPreset:"Social Media Modern",
      style:"สดใสโซเชียล",
      layout:"Hero Center Layout",
      density:"สมดุล อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"เป็นกันเอง สดใส ใช้กับโซเชียล",
      mainCategory:"กิจกรรม / โครงการ / อบรม",
      subCategory:"เชิญร่วมกิจกรรม",
      preview:"งานเชิญชวนควรเห็นชื่องานชัด มีบรรยากาศน่าเข้าร่วม และจัดวันเวลา/สถานที่เป็นกล่องข้อมูลถ้ามีจริง"
    },
    "ให้ความรู้ / Infographic": {
      contentType:"โครงการ / อบรม",
      visualPreset:"Infographic Clean",
      style:"Modern Premium Clean",
      layout:"Infographic Layout",
      density:"ข้อมูลเยอะ แต่อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"รณรงค์ / ให้ความรู้",
      subCategory:"อบรมให้ความรู้",
      preview:"งานให้ความรู้ควรเป็นลำดับ เข้าใจง่าย ใช้กล่องข้อมูล/ไอคอนช่วย แต่ต้องไม่แน่นจนอ่านยาก"
    },
    "ขั้นตอนบริการ / วิธีใช้งาน": {
      style:"Modern Premium Clean",
      layout:"Infographic Layout",
      density:"ข้อมูลเยอะ แต่อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"น้ำเงิน–ขาว ทางการ",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"รณรงค์ / ให้ความรู้",
      subCategory:"กำหนดเอง",
      preview:"งานขั้นตอนบริการควรแยกเป็น Step 1-2-3 ชัดเจน อ่านง่าย และใช้ข้อมูลที่ผู้ใช้ให้เท่านั้น"
    },
    "สรุปกิจกรรม / รายงานผล": {
      style:"Modern Premium Clean",
      layout:"ภาพเต็ม + กล่องข้อความ",
      density:"สมดุล อ่านง่าย",
      focus:"เน้นภาพกิจกรรม",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"สรุปผลงาน / รายงานผล",
      subCategory:"ลงพื้นที่",
      preview:"งานสรุปกิจกรรมควรใช้ภาพจริงหรือบรรยากาศเด่น พร้อมข้อความว่าใคร ทำอะไร ที่ไหน และเกิดประโยชน์อะไร"
    },
    "งานพิธี / งานบุญ / งานชุมชน": {
      style:"Modern Premium Clean",
      layout:"Poster Layout",
      density:"สมดุล อ่านง่าย",
      focus:"เน้นบรรยากาศ",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"กิจกรรม / โครงการ / อบรม",
      subCategory:"เชิญร่วมกิจกรรม",
      preview:"งานพิธีควรสุภาพ เป็นระเบียบ ไม่ใช้เอฟเฟกต์เว่อร์ และให้ความสำคัญกับชื่อพิธี/หน่วยงาน"
    },
    "รณรงค์ / สร้างความตระหนัก": {
      style:"Modern Premium Clean",
      layout:"Infographic Layout",
      density:"ข้อมูลเยอะ แต่อ่านง่าย",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ให้ AI เลือกให้เหมาะสม",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"รณรงค์ / ให้ความรู้",
      subCategory:"รณรงค์ป้องกันโรค",
      preview:"งานรณรงค์ควรมี message ชัด กระตุ้นให้เข้าใจ/ร่วมมือ โดยไม่ทำภาพน่ากลัวหรือเว่อร์เกิน"
    },
    "ไว้อาลัย / สุภาพ / ลดสี": {
      style:"Modern Premium Clean",
      layout:"Hero Center Layout",
      density:"โล่งมาก ดูแพง",
      focus:"เน้นหัวข้อหลัก",
      colorTone:"ดำ–ทอง หรูหรา",
      tone:"ทางการ สุภาพ อ่านง่าย",
      mainCategory:"อื่น ๆ",
      subCategory:"กำหนดเอง",
      preview:"งานไว้อาลัย/ลดสีควรเรียบ สุภาพ ลดสี ไม่ใช้เอฟเฟกต์ฉูดฉาด และข้อความต้องน้อย อ่านง่าย"
    }
  };

  const refreshV91QualityPreview = () => {
    // V9.1.1: คง logic หลังบ้านไว้ แต่ไม่โชว์กล่องอธิบายยาวในฟอร์ม
    return;
  };

  const applyV91CreativePreset = (ctx, imageType, toast=true) => {
    if(ctx) setSelectOptionValue("#image-workContext", ctx);
    if(imageType) setSelectOptionValue("#image-imageType", imageType);
    const selectedCtx = $("#image-workContext")?.value || ctx;
    const preset = v91CreativePresets[selectedCtx];
    if(preset){
      const isThaiPrPremium = /Thai PR Premium|โปสเตอร์ประชาสัมพันธ์ไทยสีสด/.test(selectedCtx || "");
      setSelectOptionValue("#image-qualityLevel", isThaiPrPremium ? toolOptions.qualityLevels[1] : toolOptions.qualityLevels[0]);
      setSelectOptionValue("#image-style", preset.style);
      setSelectOptionValue("#image-layout", preset.layout);
      setSelectOptionValue("#image-density", preset.density);
      setSelectOptionValue("#image-focus", preset.focus);
      setSelectOptionValue("#image-colorTone", preset.colorTone);
      setSelectOptionValue("#image-tone", preset.tone);
      setSelectOptionValue("#image-mainCategory", preset.mainCategory);
      setSelectOptionValue("#image-subCategory", preset.subCategory);
      if(preset.contentType) setSelectOptionValue("#image-contentType", preset.contentType);
      if(preset.visualPreset) setSelectOptionValue("#image-visualPreset", preset.visualPreset);
    }
    refreshV91QualityPreview();
    if(toast) TANJAI.toast("ตั้งค่า Creative Quality ตามบริบทงานให้แล้ว");
  };

  const setupV91CreativeQuality = () => {
    // Start every fresh form in balanced mode. Premium is emitted only after
    // an explicit Premium context/preset selection.
    setSelectOptionValue("#image-qualityLevel", toolOptions.qualityLevels[0]);
    setSelectOptionValue("#image-density", toolOptions.densities[0]);
    $("#image-workContext")?.addEventListener("change", () => applyV91CreativePreset($("#image-workContext").value, null, false));
    $("#image-imageType")?.addEventListener("change", refreshV91QualityPreview);
    $("#image-qualityLevel")?.addEventListener("change", refreshV91QualityPreview);
    $("#image-creativityLevel")?.addEventListener("change", refreshV91QualityPreview);
    $("#image-visualPreset")?.addEventListener("change", () => {
      const preset = $("#image-visualPreset")?.value || "";
      if(preset && !/^ให้ AI/.test(preset)) setSelectOptionValue("#image-style", preset);
      refreshV91QualityPreview();
    });
    $("#image-styleModifiers")?.addEventListener("change", (event) => {
      const selected = Array.from(event.currentTarget.selectedOptions || []);
      if(selected.length > 3){
        selected.slice(0, selected.length - 3).forEach(option => option.selected = false);
        TANJAI.toast("เลือกตัวเสริมภาพได้ไม่เกิน 3 ข้อ");
      }
    });
    $$("[data-v91-context]").forEach(btn => btn.addEventListener("click", () => {
      applyV91CreativePreset(btn.dataset.v91Context, btn.dataset.v91Type, true);
      if(btn.dataset.v98Visual) setSelectOptionValue("#image-visualPreset", btn.dataset.v98Visual);
      $$("[data-v91-context]").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    }));
    refreshV91QualityPreview();
  };

  const setupImageSafeMode = () => {
    const imageInput = $("#image-photos");
    const mode = $("#image-useMode");
    imageInput?.addEventListener("change", ()=>{
      renderUploadPreview("#image-photos", "#image-photoPreview");
      recommendRealPhotoMode(true);
      TANJAI.renderAttachmentHandoff?.("image", Array.from(imageInput.files || []));
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
  setupV91CreativeQuality();
  const escapeHandoffText = value => String(value || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  TANJAI.renderAttachmentHandoff = function(tool, files=[]){
    const host = $(`#${tool}Result`);
    if(!host) return;
    let notice = host.querySelector(".attachment-handoff-notice");
    if(!files.length){ notice?.remove(); return; }
    if(!notice){
      notice = document.createElement("div");
      notice.className = "attachment-handoff-notice";
      host.querySelector(".result-action")?.insertAdjacentElement("afterend", notice);
    }
    const names = files.map(file => escapeHandoffText(file.name)).join("<br>");
    notice.innerHTML = `
      <strong>⚠️ ไฟล์ยังไม่ได้ถูกส่งไป ทันใจ GPT</strong>
      <span>เบราว์เซอร์ไม่สามารถแนบไฟล์ข้ามเว็บไซต์อัตโนมัติได้ เมื่อเปิด GPT ให้กด <b>+</b> และแนบไฟล์เหล่านี้อีกครั้ง:</span>
      <div class="attachment-handoff-files">${names}</div>
      <small>ลำดับที่ถูกต้อง: คัดลอก Prompt → เปิด GPT → แนบไฟล์ → วาง Prompt</small>`;
  };

  const handlePromptAttachmentChange = (tool, inputSelector, previewSelector) => {
    const input = $(inputSelector);
    input?.addEventListener("change", ()=>{
      renderUploadPreview(inputSelector, previewSelector);
      TANJAI.renderAttachmentHandoff(tool, Array.from(input.files || []));
    });
  };

  handlePromptAttachmentChange("post", "#post-photos", "#post-photoPreview");
  handlePromptAttachmentChange("mc", "#mc-photos", "#mc-photoPreview");

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

  $$("[data-view]").forEach(control => {
    if(control.matches("button, a, input, select, textarea")) return;
    control.setAttribute("role", "button");
    control.setAttribute("tabindex", "0");
    control.addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        control.click();
      }
    });
  });
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
    const professionalOut = TANJAI.buildImageExpertPrompt(d);
    const executeOut = TANJAI.executionPrompt("image", d);
    TANJAI.state.lastImagePrompt = professionalOut;
    TANJAI.state.lastImageGPT = executeOut;
    TANJAI.state.lastImage = executeOut;
    TANJAI.state.lastImageCritic = critic;
    TANJAI.updateImageResultMode?.("gpt");
    TANJAI.toast("สร้าง Prompt แบบกระชับสำหรับสร้างภาพทันทีแล้ว");
    window.TANJAI_AUTH?.trackUsage("image");
  };
  $("#makePost").onclick = async () => {
    const d=TANJAI.commonData("post");
    const team=TANJAI.freeWritingTeam;
    const aiResult=await TANJAI.generateWritingWithAI({
      tool:"post", data:d,
      options:{channel:$("#post-channel")?.value, length:$("#post-length")?.value, extra:$("#post-extra")?.value},
      fallback:()=>team.captionWriter(d), button:$("#makePost")
    });
    const executeOut=aiResult.text;
    TANJAI.setReadyOutput("post", {
      title:"งานเขียนพร้อมใช้ — Caption & Article Writer",
      desc:aiResult.source === "ai" ? "AI วิเคราะห์ เรียบเรียง และปรับโทนจากข้อมูลที่กรอกแล้ว" : "สร้างด้วยระบบสำรอง พร้อมตรวจข้อเท็จจริงก่อนเผยแพร่",
      main:executeOut,
      advancedTitle1:"ตรวจข้อเท็จจริงก่อนเผยแพร่",
      advanced1:team.factGuard(d),
      advancedTitle2:"เวอร์ชันบทความ / ข่าว",
      advanced2:team.articleWriter(d)
    });
    TANJAI.state.lastPost=executeOut;
    TANJAI.toast("สร้างงานเขียนพร้อมใช้แล้ว");
    window.TANJAI_AUTH?.trackUsage("post");
  };
  $("#makeMC").onclick = async () => {
    const d=TANJAI.commonData("mc");
    const team=TANJAI.freeWritingTeam;
    const aiResult=await TANJAI.generateWritingWithAI({
      tool:"mc", data:d,
      options:{channel:$("#mc-channel")?.value, length:$("#mc-length")?.value, style:$("#mc-style")?.value, extra:$("#mc-extra")?.value},
      fallback:()=>team.mcWriter(d), button:$("#makeMC")
    });
    const executeOut=aiResult.text;
    TANJAI.setReadyOutput("mc", {
      title:"สคริปต์พิธีกรพร้อมใช้ — MC Writer",
      desc:aiResult.source === "ai" ? "AI จัดลำดับ จังหวะ คำเชื่อม และภาษาพูดพร้อมอ่านแล้ว" : "ภาษาพูดพร้อมอ่านจากระบบสำรอง โดยไม่แต่งชื่อหรือตำแหน่ง",
      main:executeOut,
      advancedTitle1:"ตรวจชื่อ ลำดับพิธี และข้อเท็จจริง",
      advanced1:team.factGuard(d),
      advancedTitle2:"บัตรย่อสำหรับตรวจหน้างาน",
      advanced2:`หัวข้องาน: ${d.title || "[เติมหัวข้องาน]"}\nลำดับพิธีจริง: ${d.expertAgenda || "[เติมลำดับพิธีจริง]"}\nชื่อและตำแหน่ง: ${d.people || "[เติมชื่อและตำแหน่ง]"}\nคำอ่านชื่อเฉพาะ: ${d.expertPronunciation || "[เติมคำอ่านชื่อเฉพาะ]"}`
    });
    TANJAI.state.lastMC=executeOut;
    TANJAI.toast("สร้างสคริปต์พิธีกรพร้อมใช้แล้ว");
    window.TANJAI_AUTH?.trackUsage("mc");
  };
  $("#makeVideo").onclick = async () => {
    const d=TANJAI.commonData("video");
    const length=$("#video-length").value;
    const team=TANJAI.freeWritingTeam;
    const aiResult=await TANJAI.generateWritingWithAI({
      tool:"video", data:d,
      options:{length, format:$("#video-format")?.value, channel:$("#video-channel")?.value},
      fallback:()=>team.videoWriter(d, length), button:$("#makeVideo")
    });
    const executeOut=aiResult.text;
    TANJAI.setReadyOutput("video", {
      title:"บทวิดีโอพร้อมผลิต — Video Script Writer",
      desc:aiResult.source === "ai" ? "AI สร้าง Hook, Storyboard, บทพากย์ และจังหวะตัดต่อจากบรีฟแล้ว" : "บทวิดีโอจากระบบสำรอง พร้อมส่งต่อกองถ่ายหรือตัดต่อ",
      main:executeOut,
      advancedTitle1:"ตรวจข้อเท็จจริงก่อนผลิต",
      advanced1:team.factGuard(d),
      advancedTitle2:"Prompt ผู้กำกับวิดีโอขั้นสูง (ทางเลือก)",
      advanced2:TANJAI.executionPrompt("video", d, {length})
    });
    TANJAI.state.lastVideo=executeOut;
    TANJAI.toast("สร้างบทวิดีโอพร้อมผลิตแล้ว");
    window.TANJAI_AUTH?.trackUsage("video");
  };
  $("#makeVoice").onclick = async () => {
    const d=TANJAI.commonData("voice");
    const length=$("#voice-length").value;
    const style=$("#voice-style").value;
    const team=TANJAI.freeWritingTeam;
    const aiResult=await TANJAI.generateWritingWithAI({
      tool:"voice", data:d,
      options:{length, style, channel:$("#voice-channel")?.value},
      fallback:()=>team.voiceWriter(d, length, style), button:$("#makeVoice")
    });
    const executeOut=aiResult.text;
    TANJAI.setReadyOutput("voice", {
      title:"สคริปต์เสียงพร้อมอ่าน — Voice Script Writer",
      desc:aiResult.source === "ai" ? "AI จัดภาษา จังหวะ เว้นวรรค คำเน้น และความยาวให้พร้อมอ่านแล้ว" : "สคริปต์จากระบบสำรอง พร้อมจังหวะและตำแหน่งตรวจคำอ่าน",
      main:executeOut,
      advancedTitle1:"ตรวจข้อเท็จจริงและคำอ่าน",
      advanced1:team.factGuard(d),
      advancedTitle2:"Prompt ผู้กำกับเสียงขั้นสูง (ทางเลือก)",
      advanced2:TANJAI.executionPrompt("voice", d, {length, style})
    });
    TANJAI.state.lastVoice=executeOut;
    TANJAI.toast("สร้างสคริปต์เสียงพร้อมอ่านแล้ว");
    window.TANJAI_AUTH?.trackUsage("voice");
  };
  $("#makeDeck").onclick = async () => {
    const d=TANJAI.commonData("deck");
    const count=Number($("#deck-count").value);
    const team=TANJAI.freeWritingTeam;
    const aiResult=await TANJAI.generateWritingWithAI({
      tool:"deck", data:d,
      options:{count, format:$("#deck-format")?.value},
      fallback:()=>team.slideWriter(d, count), button:$("#makeDeck")
    });
    const executeOut=aiResult.text;
    TANJAI.setReadyOutput("deck", {
      title:"เนื้อหาสไลด์พร้อมใช้ — Slide Writer",
      desc:aiResult.source === "ai" ? "AI วิเคราะห์และจัดโครงเรื่อง เนื้อหาสไลด์ และ Speaker Notes แล้ว" : "เนื้อหาจากระบบสำรองตามจำนวนหน้าที่เลือก",
      main:executeOut,
      advancedTitle1:"ตรวจข้อเท็จจริงก่อนนำเสนอ",
      advanced1:team.factGuard(d),
      advancedTitle2:"Prompt ออกแบบสไลด์ขั้นสูง (ทางเลือก)",
      advanced2:TANJAI.executionPrompt("deck", d, {count})
    });
    TANJAI.state.lastDeck=executeOut;
    TANJAI.toast("สร้างเนื้อหาสไลด์พร้อมใช้แล้ว");
    window.TANJAI_AUTH?.trackUsage("deck");
  };
  $("#makeKit").onclick = () => {
    const d=TANJAI.commonData("kit");
    const out = TANJAI.promptPack(d);
    const discussOut = TANJAI.discussPrompt("kit", d);
    const advancedOut = `Campaign Director Handoff Note

Expert Prompt นี้สร้าง Campaign Spine ก่อนแตกงานเป็นแต่ละสื่อ
- ทุกสื่อต้องใช้ Core Message, ชื่อเฉพาะ, วันที่ และ CTA ตรงกัน
- แต่ละช่องทางมีบทบาทของตัวเอง ไม่คัดลอกข้อความเดียวกันทั้งชุด
- ใช้ Missing Data Register ชุดเดียวเพื่อลดข้อมูลขัดกัน
- แนบรูปจริงและไฟล์อ้างอิงใน AI ปลายทางเมื่อจำเป็น
- ตรวจชื่อบุคคล หน่วยงาน สถานที่ วันที่ และตัวเลขก่อนเผยแพร่

${TANJAI.outputDeliveryGuard("ชุดไฟล์สื่อ")}`;
    TANJAI.setReadyOutput("kit", {
      title:"Prompt ชุดสื่อพร้อมใช้ — ผู้กำกับชุดสื่อ",
      desc:"สร้างแกนแคมเปญเดียว แล้วแตกบทบาท ภาพ โพสต์ วิดีโอ เสียง และสไลด์อย่างสอดคล้อง",
      main:out,
      advancedTitle1:"Prompt สำหรับแก้ / คุยต่อ",
      advanced1:discussOut,
      advancedTitle2:"Brief Analysis + Campaign Handoff",
      advanced2:`${TANJAI.promptBrainReport ? TANJAI.promptBrainReport(d, "kit") : ""}\n\n---\n${advancedOut}`
    });
    TANJAI.state.lastKit=out;
    TANJAI.toast("สร้าง Prompt ชุดสื่อแล้ว");
    window.TANJAI_AUTH?.trackUsage("kit");
  };


  // Save
  $("#saveImage").onclick = () => {
    const output = $("#imageOut").textContent || "";
    if(!output.trim()){
      TANJAI.toast("ยังไม่มีผลลัพธ์ให้บันทึก — กรุณากดสร้างก่อน");
      return;
    }
    TANJAI.saveProject(
      $("#image-title").value || "สร้างภาพ",
      output + "\n\n=== Auto Prompt Critic ===\n" + (TANJAI.state.lastImageCritic || ""),
      "สร้างภาพ"
    );
  };
  $("#savePost").onclick = () => TANJAI.saveProject($("#post-title").value || "เรียบเรียงเนื้อหา", $("#postOut").textContent, "เรียบเรียงเนื้อหา");
  $("#saveMC").onclick = () => TANJAI.saveProject($("#mc-title").value || "งานพิธีกร", $("#mcOut").textContent, "งานพิธีกร");
  $("#saveVideo").onclick = () => TANJAI.saveProject($("#video-title").value || "ทำวิดีโอ", $("#videoOut").textContent, "ทำวิดีโอ");
  $("#saveVoice").onclick = () => TANJAI.saveProject($("#voice-title").value || "เสียงพากย์", $("#voiceOut").textContent, "เสียงพากย์");
  $("#saveDeck").onclick = () => TANJAI.saveProject($("#deck-title").value || "ทำสไลด์", $("#deckOut").textContent, "ทำสไลด์");
  $("#saveKit").onclick = () => TANJAI.saveProject($("#kit-title").value || "สร้างชุดสื่อ", $("#kitOut").textContent, "สร้างชุดสื่อ");

  $("#clearProjects").onclick = () => {
    if(!confirm("ต้องการล้างโปรเจกต์ที่บันทึกไว้ในเครื่องทั้งหมดใช่หรือไม่?")) return;
    localStorage.removeItem("tanjaiV5Projects");
    TANJAI.renderProjects();
    TANJAI.toast("ล้างโปรเจกต์ในเครื่องแล้ว");
  };
});

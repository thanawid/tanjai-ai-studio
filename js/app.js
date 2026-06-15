window.TANJAI = window.TANJAI || {};

document.addEventListener("DOMContentLoaded", () => {
  const $ = TANJAI.$, $$ = TANJAI.$$;

  // Render forms
  $("#routerForm").innerHTML = `<div class="form-section"><div class="section-title"><b>?</b><h4>อยากทำอะไรครับ?</h4></div><label class="full">พิมพ์โจทย์ของพี่<textarea id="router-query" placeholder="เช่น อยากทำโพสต์ประชาสัมพันธ์โครงการปลูกต้นไม้ / อยากทำเสียงพากย์คลิปแจ้งข่าว / อยากทำสไลด์นำเสนอ"></textarea></label></div><div class="button-row"><button class="btn primary" id="askRouter">ให้ Router แนะนำ</button><button class="btn secondary" id="goRecommended">ไปที่เมนูที่แนะนำ</button></div>`;
  $("#routerResult").innerHTML = TANJAI.resultShell("คำแนะนำจาก AI Router","ระบบจะแนะนำเมนูและปลายทางที่เหมาะกับโจทย์", "routerOut", `<button class="btn primary" data-copybox="routerOut">คัดลอกคำแนะนำ</button>`);

  $("#imageForm").innerHTML = TANJAI.field("image") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าภาพ</h4></div>
      <div class="form-grid">
        <label>สไตล์ภาพ<select id="image-style">${TANJAI.categories.imageStyles.map(x=>`<option>${x}</option>`).join("")}</select></label>
        <label>ขนาดภาพ<select id="image-size">${TANJAI.categories.sizes.map(x=>`<option>${x}</option>`).join("")}</select></label>
        <label class="full">ข้อห้าม / หมายเหตุ<textarea id="image-avoid" placeholder="เช่น ห้ามสร้าง QR ปลอม ห้ามวาดโลโก้ใหม่ เว้นพื้นที่ด้านบน"></textarea></label>
      </div>
    </div>
    <div class="button-row"><button class="btn primary" id="makeImage">สร้าง Prompt ภาพ</button><button class="btn secondary" id="saveImage">บันทึก</button></div>
  `;
  $("#postForm").innerHTML = TANJAI.field("post") + `<div class="button-row"><button class="btn primary" id="makePost">สร้างโพสต์</button><button class="btn secondary" id="savePost">บันทึก</button></div>`;
  $("#videoForm").innerHTML = TANJAI.field("video") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าวิดีโอ</h4></div>
      <div class="form-grid"><label>ความยาว<select id="video-length">${TANJAI.categories.videoLengths.map(x=>`<option>${x}</option>`).join("")}</select></label><label>รูปแบบ<select id="video-format"><option>คลิปประชาสัมพันธ์</option><option>คลิปรีวิว</option><option>คลิปโซเชียล</option><option>คลิปข่าวด่วน</option></select></label></div>
    </div><div class="button-row"><button class="btn primary" id="makeVideo">สร้าง Storyboard</button><button class="btn secondary" id="saveVideo">บันทึก</button></div>`;
  $("#voiceForm").innerHTML = TANJAI.field("voice") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าเสียง</h4></div>
      <div class="form-grid"><label>ความยาวเสียง<select id="voice-length">${TANJAI.categories.voiceLengths.map(x=>`<option>${x}</option>`).join("")}</select></label><label>สไตล์เสียง<select id="voice-style">${TANJAI.categories.voiceStyles.map(x=>`<option>${x}</option>`).join("")}</select></label></div>
    </div><div class="button-row"><button class="btn primary" id="makeVoice">สร้างสคริปต์เสียง</button><button class="btn secondary" id="speakVoice">ทดลองอ่านเสียง</button><button class="btn secondary" id="stopVoice">หยุดอ่าน</button><button class="btn secondary" id="saveVoice">บันทึก</button></div>`;
  $("#deckForm").innerHTML = TANJAI.field("deck") + `
    <div class="form-section"><div class="section-title"><b>2</b><h4>ตั้งค่าสไลด์</h4></div>
      <div class="form-grid"><label>จำนวนสไลด์<select id="deck-count"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></label></div>
    </div><div class="button-row"><button class="btn primary" id="makeDeck">สร้าง Outline</button><button class="btn secondary" id="saveDeck">บันทึก</button></div>`;
  $("#kitForm").innerHTML = TANJAI.field("kit") + `<div class="button-row"><button class="btn primary" id="makeKit">สร้างชุดสื่อ</button><button class="btn secondary" id="saveKit">บันทึก</button></div>`;

  // Results
  $("#imageResult").innerHTML = TANJAI.resultShell("image", "Prompt ภาพ", "คัดลอกไปใช้กับ ChatGPT / Canva / AI สร้างภาพ", "imageOut", `<button class="btn primary" data-copybox="imageOut">คัดลอก Prompt ภาพ</button>`);
  $("#postResult").innerHTML = TANJAI.resultShell("post", "โพสต์พร้อมใช้", "คัดลอกไปวางใน Facebook / Line / Caption", "postOut", `<button class="btn primary" data-copybox="postOut">คัดลอกโพสต์</button>`);
  $("#videoResult").innerHTML = TANJAI.resultShell("video", "Storyboard", "คัดลอกไปใช้กับ CapCut / ทีมถ่าย / คลิปสั้น", "videoOut", `<button class="btn primary" data-copybox="videoOut">คัดลอก Storyboard</button>`);
  $("#voiceResult").innerHTML = TANJAI.resultShell("voice", "สคริปต์เสียงพากย์", "คัดลอกไปใช้กับ TTS / CapCut หรือกดทดลองอ่านเสียง", "voiceOut", `<button class="btn primary" data-copybox="voiceOut">คัดลอกสคริปต์เสียง</button>`);
  $("#deckResult").innerHTML = TANJAI.resultShell("deck", "Outline สไลด์", "คัดลอกไปทำ PowerPoint / Canva Presentation", "deckOut", `<button class="btn primary" data-copybox="deckOut">คัดลอก Outline</button>`);
  $("#kitResult").innerHTML = TANJAI.resultShell("kit", "ชุดสื่อครบแพ็ก", "ได้ภาพ โพสต์ วิดีโอ เสียง และสไลด์จากข้อมูลเดียว", "kitOut", `<button class="btn primary" data-copybox="kitOut">คัดลอกชุดสื่อ</button>`);

  TANJAI.renderLibrary();
  TANJAI.renderPromptHub();
  TANJAI.renderDestinations();
  TANJAI.renderProjects();

  // Navigation
  $$("[data-view]").forEach(btn => btn.addEventListener("click", () => TANJAI.switchView(btn.dataset.view)));
  document.body.addEventListener("click", e => {
    const t = e.target.closest("[data-template]"); if(t){TANJAI.applyTemplate(t.dataset.template); return;}
    const o = e.target.closest("[data-open]"); if(o){window.open(o.dataset.open, "_blank", "noopener"); return;}
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

  // Generators
  $("#makeImage").onclick = () => { const d=TANJAI.commonData("image"); const out=TANJAI.imagePrompt(d); $("#imageOut").textContent=out; TANJAI.state.lastImage=out; TANJAI.toast("สร้าง Prompt ภาพแล้ว"); };
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

  // Voice playback
  $("#speakVoice").onclick = () => { if(!$("#voiceOut").textContent.trim() || $("#voiceOut").textContent.includes("กดปุ่ม")) $("#makeVoice").click(); TANJAI.speak($("#voiceOut").textContent); };
  $("#stopVoice").onclick = TANJAI.stopSpeak;

  // Save
  $("#saveImage").onclick = () => TANJAI.saveProject($("#image-title").value || "สร้างภาพ", $("#imageOut").textContent, "สร้างภาพ");
  $("#savePost").onclick = () => TANJAI.saveProject($("#post-title").value || "เขียนโพสต์", $("#postOut").textContent, "เขียนโพสต์");
  $("#saveVideo").onclick = () => TANJAI.saveProject($("#video-title").value || "ทำวิดีโอ", $("#videoOut").textContent, "ทำวิดีโอ");
  $("#saveVoice").onclick = () => TANJAI.saveProject($("#voice-title").value || "เสียงพากย์", $("#voiceOut").textContent, "เสียงพากย์");
  $("#saveDeck").onclick = () => TANJAI.saveProject($("#deck-title").value || "ทำสไลด์", $("#deckOut").textContent, "ทำสไลด์");
  $("#saveKit").onclick = () => TANJAI.saveProject($("#kit-title").value || "สร้างชุดสื่อ", $("#kitOut").textContent, "สร้างชุดสื่อ");

  $("#clearProjects").onclick = () => { localStorage.removeItem("tanjaiV5Projects"); TANJAI.renderProjects(); TANJAI.toast("ล้างโปรเจกต์แล้ว"); };
});

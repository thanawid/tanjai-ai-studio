(function(global){
  "use strict";
  const T = global.TANJAI = global.TANJAI || {};

  function endpoint(){
    return String(global.TANJAI_AI_CONFIG?.endpoint || "").trim().replace(/\/$/, "");
  }

  T.aiIsConfigured = function(){
    return /^https:\/\//i.test(endpoint());
  };

  T.generateWritingWithAI = async function({tool, data, options={}, fallback, button}){
    const fallbackText = typeof fallback === "function" ? fallback() : String(fallback || "");
    if(!T.aiIsConfigured()){
      if(!options.silentStatus) T.toast?.("ยังไม่ได้เชื่อม AI API — ใช้ Specialist Output Engine ในเว็บให้ก่อน");
      return {text:fallbackText, source:"fallback"};
    }

    const originalLabel = button?.textContent || "";
    if(button){
      button.disabled = true;
      button.classList.add("is-ai-loading");
      button.textContent = "AI กำลังวิเคราะห์และเรียบเรียง…";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(global.TANJAI_AI_CONFIG?.timeoutMs) || 60000);
    try{
      const response = await fetch(`${endpoint()}/generate`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tool, data, options}),
        signal:controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if(!response.ok) throw new Error(payload.error || `AI ตอบกลับด้วยสถานะ ${response.status}`);
      const text = String(payload.text || "").trim();
      if(!text) throw new Error("AI ไม่ได้ส่งข้อความกลับมา");
      if(!options.silentStatus) T.toast?.("AI API วิเคราะห์และสร้างผลงานให้แล้ว");
      return {text, source:"ai"};
    }catch(error){
      const message = error?.name === "AbortError" ? "AI ใช้เวลานานเกินไป" : (error?.message || "เชื่อม AI ไม่สำเร็จ");
      console.warn("TANJAI AI fallback:", message);
      if(!options.silentStatus) T.toast?.(`${message} — ใช้ Specialist Output Engine ในเว็บให้ก่อน`);
      return {text:fallbackText, source:"fallback", error:message};
    }finally{
      clearTimeout(timer);
      if(button){
        button.disabled = false;
        button.classList.remove("is-ai-loading");
        button.textContent = originalLabel;
      }
    }
  };

  const POST_ATTACHMENT_TYPES = new Set([
    "image/jpeg", "image/png", "image/webp", "application/pdf",
    "text/plain", "text/csv",
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/aac", "audio/ogg", "audio/flac", "audio/x-flac"
  ]);

  function readAsBase64(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
      reader.onerror = () => reject(new Error(`อ่านไฟล์ ${file.name} ไม่สำเร็จ`));
      reader.readAsDataURL(file);
    });
  }

  T.validatePostAttachments = function(files=[]){
    const list = Array.from(files || []);
    if(!list.length) return {ok:false, error:"กรุณาเลือกไฟล์ก่อน"};
    if(list.length > 5) return {ok:false, error:"แนบได้ไม่เกิน 5 ไฟล์ต่อครั้ง"};
    const unsupported = list.find(file => !POST_ATTACHMENT_TYPES.has(String(file.type || "").toLowerCase()));
    if(unsupported) return {ok:false, error:`ยังอ่านไฟล์ ${unsupported.name} ไม่ได้ กรุณาใช้ JPG, PNG, WEBP, PDF, TXT, CSV, MP3 หรือ WAV`};
    const tooLarge = list.find(file => file.size > 6 * 1024 * 1024);
    if(tooLarge) return {ok:false, error:`ไฟล์ ${tooLarge.name} ใหญ่เกิน 6 MB`};
    const total = list.reduce((sum, file) => sum + Number(file.size || 0), 0);
    if(total > 8 * 1024 * 1024) return {ok:false, error:"ไฟล์รวมกันใหญ่เกิน 8 MB กรุณาแบ่งอ่านทีละชุด"};
    return {ok:true, files:list, total};
  };

  T.analyzePostAttachments = async function({files, button}={}){
    const checked = T.validatePostAttachments(files);
    if(!checked.ok) throw new Error(checked.error);
    if(!T.aiIsConfigured()) throw new Error("ยังไม่ได้เชื่อม AI สำหรับอ่านไฟล์");

    const originalLabel = button?.textContent || "";
    if(button){
      button.disabled = true;
      button.classList.add("is-ai-loading");
      button.textContent = "กำลังอ่านและแยกข้อมูล…";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try{
      const attachments = [];
      for(const file of checked.files){
        const mimeType = String(file.type || "text/plain").toLowerCase();
        if(mimeType === "text/plain" || mimeType === "text/csv"){
          attachments.push({name:file.name, mimeType, text:await file.text()});
        }else{
          attachments.push({name:file.name, mimeType, data:await readAsBase64(file)});
        }
      }
      const response = await fetch(`${endpoint()}/analyze-post-attachments`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({attachments}),
        signal:controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if(!response.ok) throw new Error(payload.error || `อ่านไฟล์ไม่สำเร็จ (${response.status})`);
      if(!payload.analysis || typeof payload.analysis !== "object") throw new Error("AI ไม่ได้ส่งข้อมูลที่อ่านกลับมา");
      return {analysis:payload.analysis, source:payload.source || "gemini-file-analysis"};
    }catch(error){
      if(error?.name === "AbortError") throw new Error("อ่านไฟล์ใช้เวลานานเกินไป กรุณาลองใหม่");
      throw error;
    }finally{
      clearTimeout(timer);
      if(button){
        button.disabled = false;
        button.classList.remove("is-ai-loading");
        button.textContent = originalLabel;
      }
    }
  };

  T.generateImageWithAI = async function({prompt, data={}, options={}, fallback, button}){
    const fallbackText = typeof fallback === "function" ? fallback() : String(fallback || prompt || "");
    if(!T.aiIsConfigured()){
      T.toast?.("ยังไม่ได้เชื่อม AI Image API — ใช้ Prompt ภาพพร้อมสร้างแทนก่อน");
      return {prompt:fallbackText, source:"fallback"};
    }

    const originalLabel = button?.textContent || "";
    if(button){
      button.disabled = true;
      button.classList.add("is-ai-loading");
      button.textContent = "AI กำลังสร้างภาพ…";
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Number(global.TANJAI_AI_CONFIG?.imageTimeoutMs) || 120000);
    try{
      const response = await fetch(`${endpoint()}/generate-image`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt, data, options}),
        signal:controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if(!response.ok) throw new Error(payload.error || `AI ภาพตอบกลับด้วยสถานะ ${response.status}`);
      const imageBase64 = String(payload.imageBase64 || "").trim();
      if(!imageBase64) throw new Error("AI ไม่ได้ส่งไฟล์ภาพกลับมา");
      const mimeType = String(payload.mimeType || "image/jpeg");
      T.toast?.("AI สร้างภาพในเว็บให้แล้ว");
      return {
        imageUrl:`data:${mimeType};base64,${imageBase64}`,
        imageBase64,
        mimeType,
        source:payload.source || "ai-image",
        model:payload.model || ""
      };
    }catch(error){
      const message = error?.name === "AbortError" ? "AI สร้างภาพใช้เวลานานเกินไป" : (error?.message || "เชื่อม AI ภาพไม่สำเร็จ");
      console.warn("TANJAI AI image fallback:", message);
      T.toast?.(`${message} — ใช้ Prompt ภาพพร้อมสร้างแทนก่อน`);
      return {prompt:fallbackText, source:"fallback", error:message};
    }finally{
      clearTimeout(timer);
      if(button){
        button.disabled = false;
        button.classList.remove("is-ai-loading");
        button.textContent = originalLabel;
      }
    }
  };
})(window);

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
      T.toast?.("ยังไม่ได้เชื่อม AI API — ใช้ Specialist Output Engine ในเว็บให้ก่อน");
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
      T.toast?.("AI API วิเคราะห์และสร้างผลงานให้แล้ว");
      return {text, source:"ai"};
    }catch(error){
      const message = error?.name === "AbortError" ? "AI ใช้เวลานานเกินไป" : (error?.message || "เชื่อม AI ไม่สำเร็จ");
      console.warn("TANJAI AI fallback:", message);
      T.toast?.(`${message} — ใช้ Specialist Output Engine ในเว็บให้ก่อน`);
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
})(window);


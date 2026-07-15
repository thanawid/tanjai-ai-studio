/*
  ตั้งค่า URL ของ AI Worker หลัง Deploy แล้ว เช่น
  endpoint: "https://tanjai-ai.your-name.workers.dev"

  ห้ามใส่ Gemini API Key ในไฟล์นี้หรือไฟล์ใด ๆ บน GitHub Pages
*/
window.TANJAI_AI_CONFIG = Object.assign({
  endpoint: "https://tanjai-ai.thanawid.workers.dev",
  timeoutMs: 60000,
  imageTimeoutMs: 120000,
  imageGenerationEnabled: false
}, window.TANJAI_AI_CONFIG || {});

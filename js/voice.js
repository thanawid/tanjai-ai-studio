window.TANJAI = window.TANJAI || {};

/**
 * Speak text using Web Speech API
 * Supports Thai language with automatic Thai voice detection
 * @param {string} text - Text to speak
 */
TANJAI.speak = function(text) {
  if (!("speechSynthesis" in window)) {
    TANJAI.toast("เครื่องนี้ยังไม่รองรับการอ่านเสียงพูด (Speech Synthesis API)");
    return;
  }
  
  if (!text || String(text).trim().length === 0) {
    TANJAI.toast("ไม่มีข้อความที่จะอ่าน");
    return;
  }
  
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text).trim());
  u.lang = "th-TH";
  u.rate = 0.92;
  u.pitch = 1;
  u.volume = 1;
  
  const voices = window.speechSynthesis.getVoices();
  const thaiVoice = voices.find(v => (v.lang || "").toLowerCase().includes("th"));
  
  if (thaiVoice) {
    u.voice = thaiVoice;
  }
  
  window.speechSynthesis.speak(u);
  TANJAI.toast("กำลังอ่านเสียงพูด...");
};

/**
 * Stop speaking
 */
TANJAI.stopSpeak = function() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  TANJAI.toast("หยุดอ่านเสียงแล้ว");
};

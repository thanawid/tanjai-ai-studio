window.TANJAI = window.TANJAI || {};

TANJAI.speak = function(text){
  if(!("speechSynthesis" in window)){
    TANJAI.toast("เครื่องนี้ยังไม่รองรับการทดลองอ่านเสียง");
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "th-TH";
  u.rate = 0.92;
  u.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const th = voices.find(v => (v.lang || "").toLowerCase().includes("th"));
  if(th) u.voice = th;
  window.speechSynthesis.speak(u);
  TANJAI.toast("กำลังทดลองอ่านเสียง");
};

TANJAI.stopSpeak = function(){
  if("speechSynthesis" in window) window.speechSynthesis.cancel();
  TANJAI.toast("หยุดอ่านเสียงแล้ว");
};

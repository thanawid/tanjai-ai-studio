window.TANJAI = window.TANJAI || {};

/**
 * Tanjai Auth Fallback v9.1.3
 * ใช้เมื่อ Firebase CDN/Config ไม่พร้อม เพื่อไม่ให้เว็บค้างอยู่หน้า Login ตลอดกาล
 * โหมดนี้เก็บสถานะเฉพาะในเครื่องผู้ใช้ ไม่ใช้ Cloud Firestore
 */
(function(){
  const KEY = "tanjaiLocalAuthV913";
  const allowLocalFallback = true;

  function showApp(userName){
    document.body.classList.remove("auth-locked");
    const loginGate = document.getElementById("loginGate");
    if(loginGate) loginGate.style.display = "none";
    const userDisplay = document.getElementById("userDisplayName");
    if(userDisplay) userDisplay.textContent = userName || "Local User";
  }

  function showLogin(){
    document.body.classList.add("auth-locked");
    const loginGate = document.getElementById("loginGate");
    if(loginGate) loginGate.style.display = "flex";
  }

  function readLocalUser(){
    try{ return JSON.parse(localStorage.getItem(KEY) || "null"); }catch(e){ return null; }
  }

  function writeLocalUser(email){
    const user = { email: email || "local@tanjai", uid: "local", mode: "local-fallback", savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  }

  function installFallback(){
    if(window.TANJAI_AUTH || !allowLocalFallback) return;
    console.warn("TANJAI: Firebase Auth unavailable, local fallback enabled.");
    window.TANJAI_AUTH = {
      login: async (email, password) => {
        if(!password || String(password).trim().length < 4) throw new Error("กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร");
        const user = writeLocalUser(email || "local@tanjai");
        showApp((user.email || "local").split("@")[0]);
        TANJAI.toast?.("เข้าสู่ระบบโหมด Local แล้ว");
      },
      register: async (email, password) => {
        if(!password || String(password).trim().length < 4) throw new Error("กรุณากรอกรหัสผ่านอย่างน้อย 4 ตัวอักษร");
        const user = writeLocalUser(email || "local@tanjai");
        showApp((user.email || "local").split("@")[0]);
        TANJAI.toast?.("สร้างผู้ใช้โหมด Local แล้ว");
      },
      logout: async () => {
        localStorage.removeItem(KEY);
        showLogin();
        TANJAI.toast?.("ออกจากระบบแล้ว");
      },
      saveProjectToCloud: async (title, text, tool) => {
        if(typeof TANJAI.saveProjectLocal === "function") TANJAI.saveProjectLocal(title, text, tool);
      },
      getProjectsFromCloud: async () => [],
      deleteProjectFromCloud: async () => {},
      getCurrentUser: () => readLocalUser()
    };

    const existing = readLocalUser();
    if(existing) showApp((existing.email || "local").split("@")[0]);
  }

  window.addEventListener("error", (event) => {
    const src = event?.filename || "";
    if(src.includes("firebase") || String(event?.message || "").toLowerCase().includes("firebase")){
      installFallback();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    const msg = String(event?.reason?.message || event?.reason || "").toLowerCase();
    if(msg.includes("firebase") || msg.includes("failed to fetch dynamically imported module")) installFallback();
  });

  setTimeout(installFallback, 1800);
})();

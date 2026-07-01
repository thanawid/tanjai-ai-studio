window.TANJAI = window.TANJAI || {};

/**
 * Tanjai Auth Fallback v9.1.3
 * โหมด Local เป็นทางเลือกสำหรับการพัฒนาเท่านั้น และปิดไว้โดยค่าเริ่มต้น
 * ห้ามใช้โหมดนี้แทนระบบยืนยันตัวตนบนเว็บจริง
 */
(function(){
  const KEY = "tanjaiLocalAuthV913";
  const allowLocalFallback = window.TANJAI_ENABLE_LOCAL_FALLBACK === true;
  const normalizeLoginName = (name) => String(name || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

  function showUnavailable(){
    const error = document.getElementById("loginError");
    if(error && !window.TANJAI_AUTH){
      error.textContent = "เชื่อมต่อระบบสมาชิกไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วรีเฟรชหน้าเว็บ";
    }
  }

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

  function writeLocalUser(email, name){
    const user = { email: email || "local@tanjai", uid: name ? `named_${name}` : "local", username: name || "local", displayName: name || String(email || "local").split("@")[0], mode: "local-fallback", savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  }

  function installFallback(){
    if(window.TANJAI_AUTH) return;
    if(!allowLocalFallback){
      showUnavailable();
      return;
    }
    console.warn("TANJAI: Firebase Auth unavailable, local fallback enabled.");
    window.TANJAI_AUTH = {
      loginName: async (name, password) => {
        if(!password || String(password).trim().length < 6) throw new Error("กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร");
        const key = normalizeLoginName(name);
        const profile = (window.TANJAI_USERNAME_USERS || {})[key];
        if(!profile) throw new Error("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
        const user = writeLocalUser(profile.email, key);
        showApp(user.displayName || key);
        TANJAI.toast?.("เข้าสู่ระบบแล้ว");
      },
      loginWithUsername: async (name, password) => window.TANJAI_AUTH.loginName(name, password),
      login: async (email, password) => {
        if(!password || String(password).trim().length < 6) throw new Error("กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร");
        const user = writeLocalUser(email || "local@tanjai");
        showApp((user.email || "local").split("@")[0]);
        TANJAI.toast?.("เข้าสู่ระบบโหมด Local แล้ว");
      },
      register: async (email, password) => {
        if(!password || String(password).trim().length < 6) throw new Error("กรุณากรอกรหัสผ่านอย่างน้อย 6 ตัวอักษร");
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

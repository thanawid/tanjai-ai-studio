// Firebase Auth & Firestore — Tanjai AI Studio v9.3
// เพิ่ม: Invite whitelist, email verify, usage counter
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, getDoc, setDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

if(!window.firebaseConfig) throw new Error("Missing Firebase config");
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

const NAME_SESSION_KEY = "tanjaiNameAccessV943";
const normalizeLoginName = (name) => String(name || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
const namedUsers = () => window.TANJAI_USERNAME_USERS || {};
const namedUid = (name) => `named_${normalizeLoginName(name)}`;
function readNamedSession(){
  try { return JSON.parse(localStorage.getItem(NAME_SESSION_KEY) || "null"); } catch(_) { return null; }
}
function writeNamedSession(profile){
  localStorage.setItem(NAME_SESSION_KEY, JSON.stringify({ ...profile, savedAt: Date.now() }));
}
function clearNamedSession(){ localStorage.removeItem(NAME_SESSION_KEY); }
function showAuthenticatedProfile(profile){
  currentUser = profile;
  document.body.classList.remove("auth-locked");
  const loginGate = document.getElementById("loginGate");
  if(loginGate) loginGate.style.display = "none";
  const nameEl = document.getElementById("userDisplayName");
  if(nameEl) nameEl.textContent = profile.displayName || profile.username || String(profile.email || "user").split("@")[0];
}
function showLoginGate(){
  currentUser = null;
  document.body.classList.add("auth-locked");
  const loginGate = document.getElementById("loginGate");
  if(loginGate) loginGate.style.display = "flex";
}

/* ─── AUTH STATE ─── */
onAuthStateChanged(auth, async (user) => {
  const loginError = document.getElementById("loginError");
  if(loginError) loginError.textContent = "";

  const named = readNamedSession();
  if(user) {
    clearNamedSession();
    const profile = { ...user, email: user.email, uid: user.uid, displayName: user.email.split("@")[0], mode: "firebase" };
    showAuthenticatedProfile(profile);

    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: serverTimestamp(),
        uid: user.uid,
        mode: "firebase"
      }, { merge: true });
    } catch(_) {}

    if(window.TANJAI?.renderProjects) TANJAI.renderProjects();
    console.log("Logged in:", user.email);
  } else if(named && named.username) {
    showAuthenticatedProfile(named);
    if(window.TANJAI?.renderProjects) TANJAI.renderProjects();
  } else {
    showLoginGate();
  }
});

/* ─── WHITELIST CHECK ─── */
// ตรวจว่า email นี้ได้รับ invite หรือไม่
// เพิ่ม email ใน Firestore collection "allowed_emails" → document id = email, field active: true
const checkWhitelist = async (email) => {
  try {
    const ref = doc(db, "allowed_emails", email.toLowerCase().trim());
    const snap = await getDoc(ref);
    return snap.exists() && snap.data().active !== false;
  } catch(_) {
    return false; // ถ้า Firestore rules บล็อก ก็ไม่อนุญาต
  }
};

/* ─── USERNAME LOGIN WITH FIREBASE PASSWORD ─── */
const resolveUsernameEmail = (name) => {
  const raw = String(name || "").trim();
  if(!raw) throw new Error("กรุณากรอกชื่อผู้ใช้งาน");
  if(raw.includes("@")) return raw.toLowerCase();
  const key = normalizeLoginName(raw);
  const profileBase = namedUsers()[key];
  if(!profileBase || !profileBase.email) throw new Error("ไม่พบชื่อผู้ใช้งานนี้ในระบบ");
  return String(profileBase.email).toLowerCase().trim();
};

const loginWithUsername = async (name, password) => {
  const key = normalizeLoginName(name);
  const email = resolveUsernameEmail(name);
  if(!password) throw new Error("กรุณากรอกรหัสผ่าน");
  await login(email, password);
  try {
    const profileBase = namedUsers()[key] || {};
    await setDoc(doc(db, "users", key || email), {
      email,
      username: key || email.split("@")[0],
      displayName: profileBase.displayName || key || email.split("@")[0],
      lastLogin: serverTimestamp(),
      mode: "firebase-username-map"
    }, { merge: true });
  } catch(_) {}
};

// Backward-compatible alias: now requires password. Do not use for passwordless access.
const loginName = async (name, password) => loginWithUsername(name, password);

/* ─── LOGIN ─── */
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    TANJAI.toast?.("เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!");
  } catch(error) {
    let msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if(error.code === "auth/user-not-found") msg = "ไม่พบบัญชีนี้ในระบบ";
    if(error.code === "auth/wrong-password") msg = "รหัสผ่านไม่ถูกต้อง";
    if(error.code === "auth/too-many-requests") msg = "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่";
    if(error.code === "auth/invalid-credential") msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    throw new Error(msg);
  }
};

/* ─── REGISTER (with whitelist) ─── */
const register = async (email, password) => {
  // ตรวจ whitelist ก่อน
  const allowed = await checkWhitelist(email);
  if(!allowed) {
    throw new Error("อีเมลนี้ยังไม่ได้รับสิทธิ์เข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอ invite");
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // ส่ง email verification
    try { await sendEmailVerification(cred.user); } catch(_) {}
    TANJAI.toast?.("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน");
  } catch(error) {
    if(error.message.includes("invite")) throw error; // re-throw whitelist error
    let msg = "ไม่สามารถสมัครสมาชิกได้";
    if(error.code === "auth/email-already-in-use") msg = "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบแทน";
    if(error.code === "auth/weak-password") msg = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    throw new Error(msg);
  }
};

/* ─── LOGOUT ─── */
const logout = async () => {
  try {
    clearNamedSession();
    await signOut(auth);
    showLoginGate();
    TANJAI.toast?.("ออกจากระบบแล้ว");
  } catch(_) {}
};

/* ─── USAGE COUNTER ─── */
// เรียกทุกครั้งที่สร้าง Prompt
const trackUsage = async (tool = "unknown") => {
  if(!currentUser) return;
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const ref = doc(db, "users", currentUser.uid, "usage", today);
    await setDoc(ref, {
      [tool]: increment(1),
      total: increment(1),
      date: today,
      lastUsed: serverTimestamp()
    }, { merge: true });
  } catch(_) {}
};

// ดึงสถิติการใช้งาน
const getUsageStats = async () => {
  if(!currentUser) return { today: 0, total: 0 };
  try {
    const today = new Date().toISOString().slice(0, 10);
    const snap = await getDoc(doc(db, "users", currentUser.uid, "usage", today));
    return snap.exists() ? { today: snap.data().total || 0 } : { today: 0 };
  } catch(_) {
    return { today: 0 };
  }
};

/* ─── PROJECTS (Cloud) ─── */
const saveProjectToCloud = async (title, text, tool) => {
  if(!currentUser) { TANJAI.toast?.("กรุณาเข้าสู่ระบบเพื่อบันทึกงาน"); return; }
  try {
    await addDoc(collection(db, "projects"), {
      uid: currentUser.uid,
      title: String(title || "").trim(),
      text: String(text || "").trim(),
      tool: String(tool || "").trim(),
      date: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    TANJAI.toast?.("บันทึกงานลง Cloud แล้ว");
    TANJAI.renderProjects?.();
  } catch(error) {
    console.error("Save error:", error);
    TANJAI.toast?.("เกิดข้อผิดพลาดในการบันทึก");
  }
};

const getProjectsFromCloud = async () => {
  if(!currentUser) return [];
  try {
    const q = query(collection(db, "projects"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(_) { return []; }
};

const deleteProjectFromCloud = async (projectId) => {
  try {
    await deleteDoc(doc(db, "projects", projectId));
    TANJAI.toast?.("ลบโปรเจกต์แล้ว");
    TANJAI.renderProjects?.();
  } catch(_) { TANJAI.toast?.("ไม่สามารถลบได้"); }
};

/* ─── ADMIN: เพิ่ม email เข้า whitelist ─── */
// เรียกจาก console: TANJAI_AUTH.addToWhitelist("user@email.com")
const addToWhitelist = async (email) => {
  if(!currentUser) return console.error("Not logged in");
  try {
    await setDoc(doc(db, "allowed_emails", email.toLowerCase().trim()), {
      email: email.toLowerCase().trim(),
      active: true,
      addedBy: currentUser.email,
      addedAt: serverTimestamp()
    });
    console.log("✅ Added to whitelist:", email);
  } catch(e) { console.error("Error:", e); }
};

window.TANJAI_AUTH = {
  login, loginName, loginWithUsername, resolveUsernameEmail, register, logout,
  saveProjectToCloud, getProjectsFromCloud, deleteProjectFromCloud,
  getCurrentUser: () => currentUser,
  trackUsage, getUsageStats,
  addToWhitelist,
  checkWhitelist,
  db, auth
};

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

/* ─── USERNAME → EMAIL ───
   ผู้ใช้พิมพ์แค่ "ชื่อผู้ใช้" ระบบเติมส่วนอีเมลให้เองเบื้องหลัง
   - ชื่อในตาราง ALIASES ชี้ไปอีเมลจริงที่กำหนดไว้ (เช่น admin)
   - ชื่ออื่นทั้งหมดเติม @tanjai.local อัตโนมัติ
   - ถ้าพิมพ์อีเมลเต็มมาเอง (มี @) ใช้ตามนั้นเลย ไม่แปลง
*/
const ALIASES = {
  "thanawid": "thanawid@gmail.com"
};
const toAuthEmail = (raw) => {
  const v = String(raw || "").trim().toLowerCase();
  if(!v || v.includes("@")) return v;
  return ALIASES[v] || `${v}@tanjai.local`;
};

/* ─── AUTH STATE ─── */
onAuthStateChanged(auth, async (user) => {
  const loginGate = document.getElementById("loginGate");
  const loginError = document.getElementById("loginError");
  if(loginError) loginError.textContent = "";

  if(user) {
    currentUser = user;
    document.body.classList.remove("auth-locked");
    if(loginGate) loginGate.style.display = "none";

    const nameEl = document.getElementById("userDisplayName");
    if(nameEl) nameEl.textContent = user.email.split("@")[0];

    // บันทึก last login
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        lastLogin: serverTimestamp(),
        uid: user.uid
      }, { merge: true });
    } catch(_) {}

    if(window.TANJAI?.renderProjects) TANJAI.renderProjects();
  } else {
    currentUser = null;
    document.body.classList.add("auth-locked");
    if(loginGate) loginGate.style.display = "flex";
  }
});

/* ─── WHITELIST CHECK ─── */
// ตรวจว่า email นี้ได้รับ invite หรือไม่
// เพิ่ม email ใน Firestore collection "allowed_emails" → document id = email, field active: true
const checkWhitelist = async (identity) => {
  try {
    const ref = doc(db, "allowed_emails", toAuthEmail(identity));
    const snap = await getDoc(ref);
    return snap.exists() && snap.data().active !== false;
  } catch(_) {
    return false; // ถ้า Firestore rules บล็อก ก็ไม่อนุญาต
  }
};

/* ─── LOGIN ─── */
const login = async (identity, password) => {
  try {
    await signInWithEmailAndPassword(auth, toAuthEmail(identity), password);
    TANJAI.toast?.("เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ!");
  } catch(error) {
    let msg = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    if(error.code === "auth/user-not-found") msg = "ไม่พบบัญชีนี้ในระบบ";
    if(error.code === "auth/wrong-password") msg = "รหัสผ่านไม่ถูกต้อง";
    if(error.code === "auth/too-many-requests") msg = "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่";
    if(error.code === "auth/invalid-credential") msg = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    throw new Error(msg);
  }
};

/* ─── REGISTER (with whitelist) ─── */
const register = async (identity, password) => {
  const authEmail = toAuthEmail(identity);
  // ตรวจ whitelist ก่อน
  const allowed = await checkWhitelist(authEmail);
  if(!allowed) {
    throw new Error("ชื่อผู้ใช้นี้ยังไม่ได้รับสิทธิ์เข้าใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอ invite");
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
    // ส่ง email verification เฉพาะอีเมลจริง (โดเมนปลอม @tanjai.local ส่งไม่ได้)
    if(!authEmail.endsWith("@tanjai.local")){
      try { await sendEmailVerification(cred.user); } catch(_) {}
    }
    TANJAI.toast?.("สมัครสมาชิกสำเร็จ!");
  } catch(error) {
    if(error.message.includes("invite")) throw error; // re-throw whitelist error
    let msg = "ไม่สามารถสมัครสมาชิกได้";
    if(error.code === "auth/email-already-in-use") msg = "ชื่อผู้ใช้นี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบแทน";
    if(error.code === "auth/weak-password") msg = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    throw new Error(msg);
  }
};

/* ─── LOGOUT ─── */
const logout = async () => {
  try {
    await signOut(auth);
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
// สำคัญ: การเช็คสิทธิ์ตรงนี้เป็นแค่ชั้นป้องกันฝั่ง UI เท่านั้น
// การบังคับใช้จริงต้องมาจาก Firestore Security Rules (ดู firestore.rules)
// ที่จำกัดว่า collection "admins" และ "allowed_emails" เขียนได้เฉพาะ uid ที่อยู่ใน admins เท่านั้น
const isAdmin = async () => {
  if(!currentUser) return false;
  try {
    const snap = await getDoc(doc(db, "admins", currentUser.uid));
    return snap.exists() && snap.data()?.active !== false;
  } catch(_) { return false; }
};

const addToWhitelist = async (identity) => {
  if(!currentUser){ TANJAI.toast?.("กรุณาเข้าสู่ระบบก่อน"); return; }
  if(!(await isAdmin())){ TANJAI.toast?.("เฉพาะผู้ดูแลระบบเท่านั้นที่เพิ่มสิทธิ์ได้"); return; }
  const authEmail = toAuthEmail(identity);
  try {
    await setDoc(doc(db, "allowed_emails", authEmail), {
      email: authEmail,
      active: true,
      addedBy: currentUser.email,
      addedAt: serverTimestamp()
    });
    TANJAI.toast?.(`เพิ่ม ${authEmail} เข้า whitelist แล้ว`);
  } catch(e) { TANJAI.toast?.("เพิ่ม whitelist ไม่สำเร็จ (ตรวจสอบสิทธิ์ admin)"); }
};

window.TANJAI_AUTH = {
  login, register, logout,
  saveProjectToCloud, getProjectsFromCloud, deleteProjectFromCloud,
  getCurrentUser: () => currentUser,
  trackUsage, getUsageStats,
  addToWhitelist,
  checkWhitelist,
  isAdmin,
  db, auth
};

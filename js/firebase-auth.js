// Firebase Auth & Firestore Integration for Tanjai AI Studio
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firebase
if(!window.firebaseConfig){
    throw new Error("Missing Firebase config");
}
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global State
let currentUser = null;

/**
 * Handle Auth State Changes
 */
onAuthStateChanged(auth, (user) => {
    const loginGate = document.getElementById("loginGate");
    const appShell = document.querySelector(".app-shell");
    const loginError = document.getElementById("loginError");
    if (loginError) loginError.textContent = "";
    
    if (user) {
        // User is signed in
        currentUser = user;
        document.body.classList.remove("auth-locked");
        if (loginGate) loginGate.style.display = "none";
        
        // Update UI with user info if needed
        const userDisplay = document.getElementById("userDisplayName");
        if (userDisplay) userDisplay.textContent = user.email.split('@')[0];
        
        // Refresh projects from Cloud
        if (window.TANJAI && TANJAI.renderProjects) {
            TANJAI.renderProjects();
        }
        
        console.log("User logged in:", user.email);
    } else {
        // User is signed out
        currentUser = null;
        document.body.classList.add("auth-locked");
        if (loginGate) loginGate.style.display = "flex";
        console.log("User logged out");
    }
});

/**
 * Authentication Functions
 */
const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        TANJAI.toast("เข้าสู่ระบบสำเร็จ");
    } catch (error) {
        console.error("Login error:", error);
        let msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        if (error.code === 'auth/user-not-found') msg = "ไม่พบผู้ใช้งานนี้";
        if (error.code === 'auth/wrong-password') msg = "รหัสผ่านไม่ถูกต้อง";
        throw new Error(msg);
    }
};

const register = async (email, password) => {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        TANJAI.toast("สมัครสมาชิกสำเร็จ");
    } catch (error) {
        console.error("Register error:", error);
        let msg = "ไม่สามารถสมัครสมาชิกได้";
        if (error.code === 'auth/email-already-in-use') msg = "อีเมลนี้ถูกใช้งานแล้ว";
        if (error.code === 'auth/weak-password') msg = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
        throw new Error(msg);
    }
};

const logout = async () => {
    try {
        await signOut(auth);
        TANJAI.toast("ออกจากระบบแล้ว");
    } catch (error) {
        console.error("Logout error:", error);
    }
};

/**
 * Firestore Database Functions (Replacing LocalStorage)
 */
const saveProjectToCloud = async (title, text, tool) => {
    if (!currentUser) {
        TANJAI.toast("กรุณาเข้าสู่ระบบเพื่อบันทึกงาน");
        return;
    }
    
    try {
        await addDoc(collection(db, "projects"), {
            uid: currentUser.uid,
            title: String(title || "").trim(),
            text: String(text || "").trim(),
            tool: String(tool || "").trim(),
            date: new Date().toISOString(),
            createdAt: new Date()
        });
        TANJAI.toast("บันทึกงานลง Cloud แล้ว");
        TANJAI.renderProjects();
    } catch (error) {
        console.error("Save error:", error);
        TANJAI.toast("เกิดข้อผิดพลาดในการบันทึก");
    }
};

const getProjectsFromCloud = async () => {
    if (!currentUser) return [];
    
    try {
        const q = query(
            collection(db, "projects"), 
            where("uid", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const projects = [];
        querySnapshot.forEach((doc) => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        return projects;
    } catch (error) {
        console.error("Load error:", error);
        return [];
    }
};

const deleteProjectFromCloud = async (projectId) => {
    try {
        await deleteDoc(doc(db, "projects", projectId));
        TANJAI.toast("ลบโปรเจกต์แล้ว");
        TANJAI.renderProjects();
    } catch (error) {
        console.error("Delete error:", error);
        TANJAI.toast("ไม่สามารถลบได้");
    }
};

// Export to window for global access
window.TANJAI_AUTH = {
    login,
    register,
    logout,
    saveProjectToCloud,
    getProjectsFromCloud,
    deleteProjectFromCloud,
    getCurrentUser: () => currentUser
};

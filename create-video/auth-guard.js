import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const release = () => {
  document.body.classList.remove("auth-checking");
  document.getElementById("authScreen")?.remove();
};

try {
  if (!window.firebaseConfig) throw new Error("missing-config");
  const app = getApps()[0] || initializeApp(window.firebaseConfig);
  onAuthStateChanged(getAuth(app), (user) => {
    if (user) release();
    else location.replace("../");
  });
  setTimeout(() => location.replace("../"), 8000);
} catch {
  location.replace("../");
}

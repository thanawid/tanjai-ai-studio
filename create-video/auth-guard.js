import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const reveal = () => document.documentElement.classList.remove("auth-checking");

if (!window.firebaseConfig) {
  location.replace("../");
} else {
  const app = getApps()[0] || initializeApp(window.firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => user ? reveal() : location.replace("../"));
  setTimeout(() => {
    if (document.documentElement.classList.contains("auth-checking")) location.replace("../");
  }, 8000);
}

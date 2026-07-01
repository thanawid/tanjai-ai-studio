// Firebase Configuration for Tanjai AI Studio
// Security: keep this false on production. Local fallback does not verify identity.
window.TANJAI_ENABLE_LOCAL_FALLBACK = false;
// Private Access: accounts should be created by the owner in Firebase Console.
window.TANJAI_ALLOW_PUBLIC_REGISTRATION = false;

// Username-only access used by the simplified login screen.
// The owner should keep the matching account/permission in Firebase.
window.TANJAI_USERNAME_USERS = {
  thanawid: { email: "thanawid@gmail.com", displayName: "thanawid" },
  teamtanjai: { email: "teamtanjai@tanjai.local", displayName: "teamtanjai" }
};

const firebaseConfig = {
  apiKey: "AIzaSyCuuJLUXNaEQTolNwZk5JXl5DpQIEDo6io",
  authDomain: "tanjai-ai-studio.firebaseapp.com",
  projectId: "tanjai-ai-studio",
  storageBucket: "tanjai-ai-studio.firebasestorage.app",
  messagingSenderId: "946625223154",
  appId: "1:946625223154:web:48030f1112ea478d0e736b",
  measurementId: "G-R4LFDNJF92"
};

// Export config if using modules, or keep as global if using traditional scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseConfig;
} else {
    window.firebaseConfig = firebaseConfig;
}

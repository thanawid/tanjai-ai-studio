// Firebase Configuration for Tanjai AI Studio
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

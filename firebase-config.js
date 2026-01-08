// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Your Firebase configuration from Firebase Console
// Project: clinic-fd91f
const firebaseConfig = {
    apiKey: "AIzaSyDrKyLC5sXoefaSyGNmjiscApLbUS3nup0",
    authDomain: "clinic-fd91f.firebaseapp.com",
    projectId: "clinic-fd91f",
    storageBucket: "clinic-fd91f.firebasestorage.app",
    messagingSenderId: "569870191288",
    appId: "1:569870191288:web:a64c5155931b662dd5824d"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project:', firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Initialize Firestore (Global Access)
window.db = firebase.firestore();

// Enable offline persistence (optional but recommended)
window.db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.log('Persistence not supported');
        }
    });

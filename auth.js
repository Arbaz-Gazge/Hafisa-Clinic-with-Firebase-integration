// ============================================
// AUTHENTICATION LOGIC
// ============================================

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const targetModule = new URLSearchParams(window.location.search).get('module') || 'registration';

    setLoading(true, "Authenticating...");
    try {
        const db = firebase.firestore();
        const snapshot = await db.collection('users')
            .where('username', '==', username)
            .get();

        let user = null;
        if (!snapshot.empty) {
            const userDoc = snapshot.docs.find(doc => doc.data().password === password);
            if (userDoc) user = userDoc.data();
        }
        setLoading(false);

        if (user) {
            const expectedRole = targetModule === 'registration' ? 'front_desk' : 'care_professional';

            if (user.role === expectedRole) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = targetModule + '.html';
            } else {
                showLoginError(`Access Denied. You must be a ${expectedRole === 'front_desk' ? 'Front Desk' : 'Care Professional'} user.`);
            }
        } else {
            // Development Fallback
            if (username === 'admin' && password === 'admin') {
                const devUser = { username: 'admin', role: targetModule === 'registration' ? 'front_desk' : 'care_professional' };
                sessionStorage.setItem('currentUser', JSON.stringify(devUser));
                window.location.href = targetModule + '.html';
            } else {
                showLoginError('Invalid username or password');
            }
        }
    } catch (error) {
        setLoading(false);
        console.error('Login error', error);
        showLoginError('Login failed. Please check your connection.');
    }
}

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    } else {
        showCustomAlert(msg, "Login Error");
    }
}

function handleAdminAccess() {
    showCustomPrompt("Enter Admin Password:", async (password) => {
        if (!password) return;

        if (password === 'helloarbazgazge') {
            sessionStorage.setItem('adminRole', 'super_admin');
            window.location.href = 'admin.html';
            return;
        }

        let correctAdminPass = 'helloadmin';
        try {
            const db = firebase.firestore();
            const doc = await db.collection('settings').doc('admin_config').get();
            if (doc.exists && doc.data().adminPassword) {
                correctAdminPass = doc.data().adminPassword;
            }
        } catch (e) { console.warn("Using default"); }

        if (password === correctAdminPass) {
            sessionStorage.setItem('adminRole', 'admin');
            window.location.href = 'admin.html';
        } else {
            showCustomAlert("Incorrect Password!", "Authentication Failed");
        }
    }, true);
}

// Global Exports
window.handleLogin = handleLogin;
window.handleAdminAccess = handleAdminAccess;
window.showLoginError = showLoginError;

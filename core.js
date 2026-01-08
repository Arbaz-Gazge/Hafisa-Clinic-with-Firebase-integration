// ============================================
// CORE UTILITIES & SHARED STATE
// ============================================

let currentUser = null;

// Loading Handler
function setLoading(active, text = "Loading...") {
    const loader = document.getElementById('globalLoader');
    const loaderText = document.getElementById('loaderText');
    if (!loader) return;

    if (active) {
        loaderText.textContent = text;
        loader.classList.add('active');
    } else {
        loader.classList.remove('active');
    }
}

// ============================================
// CUSTOM UI (Popups)
// ============================================

function showCustomConfirm(message, onYes) {
    const overlay = document.getElementById('customConfirmOverlay');
    if (!overlay) return;
    document.getElementById('confirmMessage').innerHTML = message;
    document.getElementById('confirmTitle').textContent = 'Clinic System';

    const inputEl = document.getElementById('confirmInput');
    if (inputEl) inputEl.style.display = 'none';

    const cancelBtn = document.getElementById('confirmCancelBtn');
    const okBtn = document.getElementById('confirmOkBtn');

    cancelBtn.style.display = 'inline-block';
    okBtn.textContent = 'OK';

    overlay.classList.add('active');

    const close = () => { overlay.classList.remove('active'); };

    cancelBtn.onclick = close;
    okBtn.onclick = () => {
        close();
        if (onYes) onYes();
    };
}

function showCustomAlert(message, title = 'Alert') {
    const overlay = document.getElementById('customConfirmOverlay');
    if (!overlay) return;
    document.getElementById('confirmMessage').innerHTML = message;
    document.getElementById('confirmTitle').textContent = title;

    const inputEl = document.getElementById('confirmInput');
    if (inputEl) inputEl.style.display = 'none';

    const cancelBtn = document.getElementById('confirmCancelBtn');
    const okBtn = document.getElementById('confirmOkBtn');

    cancelBtn.style.display = 'none';
    okBtn.textContent = 'OK';

    overlay.classList.add('active');

    okBtn.onclick = () => { overlay.classList.remove('active'); };
}

function showCustomPrompt(message, onResult, isPassword = false, defaultValue = '') {
    const overlay = document.getElementById('customConfirmOverlay');
    if (!overlay) return;
    const msgEl = document.getElementById('confirmMessage');
    const titleEl = document.getElementById('confirmTitle');
    const inputEl = document.getElementById('confirmInput');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const okBtn = document.getElementById('confirmOkBtn');

    msgEl.textContent = message;
    titleEl.textContent = 'Input Required';

    if (inputEl) {
        inputEl.style.display = 'block';
        inputEl.type = isPassword ? 'password' : 'text';
        inputEl.value = defaultValue;
        inputEl.placeholder = '';
        setTimeout(() => inputEl.focus(), 100);
    }

    cancelBtn.style.display = 'inline-block';
    okBtn.textContent = 'OK';

    overlay.classList.add('active');

    const close = () => {
        overlay.classList.remove('active');
        if (inputEl) inputEl.style.display = 'none';
    };

    const submit = () => {
        const val = inputEl ? inputEl.value : '';
        close();
        if (onResult) onResult(val);
    };

    cancelBtn.onclick = () => {
        close();
        if (onResult) onResult(null);
    };

    okBtn.onclick = submit;

    if (inputEl) {
        inputEl.onkeydown = (e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') cancelBtn.click();
        };
    }
}

function showSuccessMessage(eid) {
    const m = document.getElementById(eid);
    if (m) {
        m.classList.add('show');
        setTimeout(() => m.classList.remove('show'), 3000);
    }
}

// ============================================
// DATA PERSISTENCE HELPERS
// ============================================

function getPatients() {
    return JSON.parse(localStorage.getItem('patients') || '[]');
}

function savePatient(p) {
    let l = getPatients();
    const i = l.findIndex(x => x.id === p.id);
    if (i >= 0) l[i] = p;
    else l.push(p);
    localStorage.setItem('patients', JSON.stringify(l));
}

function getConsultations() {
    return JSON.parse(localStorage.getItem('consultations') || '[]');
}

function saveConsultation(c) {
    let l = getConsultations();
    l.push(c);
    localStorage.setItem('consultations', JSON.stringify(l));
}

function calculateAge(d) {
    if (!d) return "";
    const t = new Date();
    const b = new Date(d);
    let a = t.getFullYear() - b.getFullYear();
    return a;
}

function checkSession() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentView');
    window.location.href = 'index.html';
}

// Global Exports
window.setLoading = setLoading;
window.showCustomConfirm = showCustomConfirm;
window.showCustomAlert = showCustomAlert;
window.showCustomPrompt = showCustomPrompt;
window.showSuccessMessage = showSuccessMessage;
window.getPatients = getPatients;
window.savePatient = savePatient;
window.getConsultations = getConsultations;
window.saveConsultation = saveConsultation;
window.calculateAge = calculateAge;
window.checkSession = checkSession;
window.logout = logout;

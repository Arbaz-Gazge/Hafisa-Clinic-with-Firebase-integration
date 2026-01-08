// ============================================
// HOSPITAL MANAGEMENT SYSTEM - APPLICATION LOGIC
// ============================================

// State Management
let currentUser = null;
let currentTab = 'open'; // 'open' or 'closed'
let selectedPatientId = null;
let dateFilterInstance = null; // Flatpickr instance
let currentMedications = []; // Structured Medication List

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

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

function initializeApp() {
    setupEventListeners();
    setupKeyboardShortcuts();
    setupDatePickers();

    // Restore Session
    const savedUser = sessionStorage.getItem('currentUser');
    const savedView = sessionStorage.getItem('currentView');

    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (savedView === 'registration') {
            openFullScreenRegistration();
        } else if (savedView === 'consultation') {
            openFullScreenConsultation();
        }
    }

    console.log('Hospital Management System initialized successfully');
}

function setupEventListeners() {
    document.getElementById('registrationModal').addEventListener('click', function (e) {
        if (e.target === this) closeRegistrationModal();
    });

    document.getElementById('loginModal').addEventListener('click', function (e) {
        if (e.target === this) closeLoginModal();
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeRegistrationModal();
            closeLoginModal();
        }
    });
}

function setupDatePickers() {
    const filterInput = document.getElementById('filterDate');
    if (filterInput) {
        dateFilterInstance = flatpickr(filterInput, {
            mode: "range",
            dateFormat: "Y-m-d",
            placeholder: "Select Date Range...",
            onChange: function (selectedDates, dateStr, instance) {
                filterPatients();
            }
        });
    }
}

// ============================================
// CUSTOM UI (Popups) - "Popper Design"
// ============================================

function showCustomConfirm(message, onYes) {
    const overlay = document.getElementById('customConfirmOverlay');
    document.getElementById('confirmMessage').innerHTML = message;
    document.getElementById('confirmTitle').textContent = 'HealthCare Plus';

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


// ============================================
// AUTHENTICATION MODULE
// ============================================

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

function openLoginModal(targetModule) {
    document.getElementById('targetModule').value = targetModule;
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginTitle').textContent =
        targetModule === 'registration' ? 'Front Desk Login' : 'Doctor Login';
    document.getElementById('loginUsername').focus();
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const targetModule = document.getElementById('targetModule').value;

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
                currentUser = user;
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser)); // Persist User
                closeLoginModal();
                if (targetModule === 'registration') {
                    openFullScreenRegistration();
                } else {
                    openFullScreenConsultation();
                }
            } else {
                showLoginError(`Access Denied. You must be a ${expectedRole === 'front_desk' ? 'Front Desk' : 'Care Professional'} user.`);
            }
        } else {
            if (username === 'admin' && password === 'admin') {
                currentUser = { username: 'admin', role: targetModule === 'registration' ? 'front_desk' : 'care_professional' };
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser)); // Persist Admin
                closeLoginModal();
                targetModule === 'registration' ? openFullScreenRegistration() : openFullScreenConsultation();
            } else {
                showLoginError('Invalid username or password');
            }
        }
    } catch (error) {
        console.error('Login error', error);
        showLoginError('Login failed. Check console.');
    }
}

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
}

// ============================================
// REGISTRATION MODULE
// ============================================

// ============================================
// REGISTRATION MODULE (Full Screen)
// ============================================

function openFullScreenRegistration() {
    sessionStorage.setItem('currentView', 'registration');
    // Hide modal if open (compatibility)
    const oldModal = document.getElementById('registrationModal');
    if (oldModal) oldModal.classList.remove('active');

    const fsReg = document.getElementById('fullScreenRegistration');
    if (fsReg) {
        fsReg.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const input = document.getElementById('regSearchPhone');
            if (input) input.focus();
        }, 300);
    } else {
        showCustomAlert("Error: Registration view not found. Please refresh.");
    }
}

function closeFullScreenRegistration() {
    showCustomConfirm('Exit Registration?', () => {
        setLoading(true, "Exiting...");
        setTimeout(() => {
            sessionStorage.removeItem('currentView');
            sessionStorage.removeItem('currentUser');
            document.getElementById('fullScreenRegistration').style.display = 'none';
            document.body.style.overflow = '';
            document.getElementById('registrationForm').reset();
            document.getElementById('regSearchResult').innerHTML = '<p style="color: #666; font-size: 0.9em; text-align: center;">Enter phone number to check if patient is already registered.</p>';
            currentUser = null;
            setLoading(false);
        }, 500);
    });
}

function openRegistrationModal() {
    // Redirect to Full Screen
    openFullScreenRegistration();
}

function closeRegistrationModal() {
    // Backward compatibility
    closeFullScreenRegistration();
}

async function handlePhoneSearch() {
    const phone = document.getElementById('regSearchPhone').value.trim();
    if (phone.length !== 10) { showCustomAlert("Enter valid 10-digit number"); return; }

    const resultDiv = document.getElementById('regSearchResult');
    resultDiv.innerHTML = 'Searching...';

    let patients = [];
    if (typeof getPatientsFromFirebase === 'function') {
        try { patients = await getPatientsFromFirebase(); } catch (e) { }
    }
    if (patients.length === 0) patients = getPatients();

    const found = patients.find(p => p.phone === phone);

    if (found) {
        resultDiv.innerHTML = `
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px;">
                <h4 style="margin:0 0 5px 0;">Patient Found</h4>
                <p style="margin:0;"><strong>${found.name}</strong></p>
                <p style="margin:0; font-size:0.9em; color:#666;">${found.gender}, ${found.age} yrs</p>
                <p style="margin:5px 0 10px 0; font-size:0.9em;">Status: <strong>${found.status}</strong></p>
                <button class="btn btn-primary" style="width:100%;" onclick="openNewEncounter('${found.id}')">Open New Encounter</button>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; color: #166534;">
                <p style="margin:0;">No record found.</p>
                <p style="margin:5px 0 0 0; font-size:0.9em;">Please fill the New Patient form.</p>
            </div>
        `;
        document.getElementById('phoneNumber').value = phone;
    }
}

async function openNewEncounter(id) {
    showCustomConfirm("Open a new encounter for this patient?", async () => {
        // Set status to open
        await updatePatientStatus(id, 'open');

        showCustomAlert("Encounter Opened! Patient is now visible in Doctor's 'Open' list.");
        document.getElementById('fullScreenRegistration').style.display = 'none';
        document.body.style.overflow = '';
        currentUser = null;
    });
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    const form = event.target;
    // Basic FormData logic
    const formData = new FormData(form);
    const patient = {
        id: 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: formData.get('patientName'),
        gender: formData.get('gender'),
        phone: formData.get('phoneNumber'),
        dateOfBirth: formData.get('dateOfBirth'),
        age: formData.get('age'),
        address: formData.get('address'),
        registrationDate: new Date().toISOString(),
        status: 'open',
        registeredBy: currentUser ? currentUser.username : 'unknown'
    };

    setLoading(true, "Registering Patient...");
    try {
        savePatient(patient); // Local
        if (typeof savePatientToFirebase === 'function') await savePatientToFirebase(patient);
        setLoading(false);

        showSuccessMessage('registrationSuccess');
        form.reset();
        // Clear search result too
        const resCont = document.getElementById('regSearchResult');
        if (resCont) resCont.innerHTML = '<p style="color: #666; font-size: 0.9em; text-align: center;">Enter phone number to check if patient is already registered.</p>';

        setTimeout(() => closeRegistrationModal(), 1500);
    } catch (e) {
        setLoading(false);
        showCustomAlert("Error saving patient: " + e.message);
    }
}

function calculateAgeFromDOB() {
    const dobInput = document.getElementById('dateOfBirth');
    const ageInput = document.getElementById('age');
    if (dobInput.value) ageInput.value = calculateAge(dobInput.value);
}

function calculateDOBFromAge() {
    const ageInput = document.getElementById('age');
    const dobInput = document.getElementById('dateOfBirth');
    const age = parseInt(ageInput.value);
    if (!isNaN(age) && age >= 0) {
        const today = new Date();
        const birthYear = today.getFullYear() - age;
        dobInput.value = `${birthYear}-01-01`;
    }
}

// ============================================
// FULL SCREEN CONSULTATION MODULE
// ============================================

function openFullScreenConsultation() {
    sessionStorage.setItem('currentView', 'consultation'); // Persist View
    document.getElementById('fullScreenConsultation').style.display = 'block';
    document.body.style.overflow = 'hidden';
    switchTab('open');
}

function closeFullScreenConsultation() {
    showCustomConfirm('Are you sure you want to exit?', () => {
        setLoading(true, "Exiting...");
        setTimeout(() => {
            sessionStorage.removeItem('currentView');
            sessionStorage.removeItem('currentUser');
            document.getElementById('fullScreenConsultation').style.display = 'none';
            document.body.style.overflow = '';
            currentUser = null;
            setLoading(false);
        }, 500);
    });
}

function switchTab(tab) {
    currentTab = tab;
    // Styling tabs
    const btnOpen = document.getElementById('tabOpen');
    const btnClosed = document.getElementById('tabClosed');
    btnOpen.className = tab === 'open' ? 'tab-btn active' : 'tab-btn';
    btnClosed.className = tab === 'closed' ? 'tab-btn active' : 'tab-btn';
    btnOpen.style.borderBottom = tab === 'open' ? '3px solid var(--primary-500)' : '3px solid transparent';
    btnClosed.style.borderBottom = tab === 'closed' ? '3px solid var(--primary-500)' : '3px solid transparent';

    filterPatients();
}

async function filterPatients() {
    const container = document.getElementById('patientListContainer');
    container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading...</div>';

    let firebasePatients = [];
    if (typeof getPatientsFromFirebase === 'function') {
        try { firebasePatients = await getPatientsFromFirebase(); } catch (e) { console.warn("Firebase load failed", e); }
    }
    const localPatients = getPatients();

    // Merge Data: Priority to Local (to reflect immediate status changes)
    const merged = {};
    // 1. Load Firebase data first
    firebasePatients.forEach(p => merged[p.id] = p);
    // 2. Overwrite with Local data (matches offline-first behavior)
    localPatients.forEach(p => merged[p.id] = p);

    const patients = Object.values(merged).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));

    // SEARCH QUERY
    const searchQuery = (document.getElementById('searchPatientInput')?.value || '').toLowerCase();

    const filtered = patients.filter(p => {
        const statusMatch = currentTab === 'open' ? (p.status !== 'closed') : (p.status === 'closed');

        // Date Logic
        let dateMatch = true;
        if (dateFilterInstance && dateFilterInstance.selectedDates.length > 0) {
            const pDate = new Date(p.registrationDate).setHours(0, 0, 0, 0);
            if (dateFilterInstance.selectedDates.length === 2) {
                const start = dateFilterInstance.selectedDates[0].setHours(0, 0, 0, 0);
                const end = dateFilterInstance.selectedDates[1].setHours(0, 0, 0, 0);
                dateMatch = pDate >= start && pDate <= end;
            } else if (dateFilterInstance.selectedDates.length === 1) {
                dateMatch = pDate === dateFilterInstance.selectedDates[0].setHours(0, 0, 0, 0);
            }
        }

        // SEARCH Logic
        let searchMatch = true;
        if (searchQuery) {
            searchMatch = (p.name.toLowerCase().includes(searchQuery) || p.phone.includes(searchQuery));
        }

        return statusMatch && dateMatch && searchMatch;
    });

    renderPatientList(filtered);
}

function renderPatientList(patients) {
    const container = document.getElementById('patientListContainer');
    container.innerHTML = '';
    if (patients.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--gray-500);">No patients found.</div>';
        return;
    }
    patients.forEach(p => {
        const div = document.createElement('div');
        div.className = 'patient-list-item';
        div.style.padding = '15px';
        div.style.borderBottom = '1px solid #eee';
        div.style.cursor = 'pointer';

        if (selectedPatientId === p.id) {
            div.style.background = '#eff6ff';
            div.style.borderLeft = '4px solid var(--primary-500)';
        } else {
            div.style.background = 'white';
            div.style.borderLeft = '4px solid transparent';
        }

        div.onclick = () => selectPatient(p.id);
        div.innerHTML = `
            <div style="font-weight: 600;">${p.name}</div>
            <div style="font-size: 0.9em; color: gray;">${p.gender}, ${p.age} yrs | ${p.phone}</div>
        `;
        container.appendChild(div);
    });
}

async function selectPatient(id) {
    setLoading(true, "Opening Patient Record...");
    selectedPatientId = id;
    // filterPatients(); // Don't re-render list, keeps selection stable

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('consultationContent').style.display = 'block';

    let patients = getPatients();
    let patient = patients.find(p => p.id === id);

    // Fallback: If not in local, try Firebase
    if (!patient && typeof getPatientsFromFirebase === 'function') {
        try {
            const allFb = await getPatientsFromFirebase();
            patient = allFb.find(p => p.id === id);
        } catch (e) { console.error("Patient fetch err", e); }
    }

    if (patient) {
        document.getElementById('activePatientName').textContent = patient.name;
        document.getElementById('activePatientAge').textContent = `${patient.age} years`;
        document.getElementById('activePatientGender').textContent = patient.gender;
        document.getElementById('activePatientPhone').textContent = patient.phone;
        document.getElementById('currentPatientId').value = patient.id;

        // Reset medication fields for new patient
        currentMedications = [];
        renderMedicationList();
        resetMedicationFields();

        try {
            await loadPatientHistory(id);
        } catch (e) {
            console.error("History load error", e);
        }
        setLoading(false);

        // UI for CLOSED patients: Hide the "New Consultation" form
        const form = document.getElementById('fullConsultationForm');
        if (patient.status === 'closed') {
            form.style.display = 'none';
            // Optionally show a message
            let msg = document.getElementById('closedPatientMsg');
            if (!msg) {
                msg = document.createElement('div');
                msg.id = 'closedPatientMsg';
                msg.style.padding = '20px';
                msg.style.textAlign = 'center';
                msg.style.background = '#f3f4f6';
                msg.style.color = '#6b7280';
                msg.style.borderRadius = '8px';
                msg.innerHTML = '<strong>Case Closed</strong><br>View history above.';
                form.parentNode.appendChild(msg);
            }
            msg.style.display = 'block';
        } else {
            form.style.display = 'block';
            const msg = document.getElementById('closedPatientMsg');
            if (msg) msg.style.display = 'none';
        }
    } else {
        setLoading(false);
        showCustomAlert("Patient details not found locally or online.");
    }
}

async function loadPatientHistory(patientId) {
    const historySection = document.getElementById('previousHistorySection');
    const historyContent = document.getElementById('historyContent');

    // FETCH BOTH AND MERGE
    let firebaseData = [];
    if (typeof getPatientConsultations === 'function') {
        try { firebaseData = await getPatientConsultations(patientId); }
        catch (e) { console.warn("Firebase Fetch Error", e); }
    }

    const localData = getConsultations().filter(c => c.patientId === patientId);

    const merged = {};
    // Prioritize Firebase but if empty, Local might have it (or vice-versa)
    // Actually, ID should be unique.
    [...localData, ...firebaseData].forEach(c => { merged[c.id] = c; });

    const consultations = Object.values(merged).sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate));

    if (consultations.length > 0) {
        historySection.style.display = 'block';
        historyContent.innerHTML = consultations.map(c => `
            <div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #e2e8f0; position: relative;">
                <div style="font-size: 0.85em; color: var(--gray-500); margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <span>${new Date(c.consultationDate).toLocaleString()} - Dr. ${c.doctorName || 'Unknown'}</span>
                    <button onclick="printConsultation('${c.id}')" style="background:none; border:none; cursor:pointer; font-size: 1.2em;" title="Reprint">🖨️</button>
                </div>
                <div><strong>Dx:</strong> ${c.diagnosis}</div>
            </div>
        `).join('');
    } else {
        historySection.style.display = 'none';
    }
}

async function handleFullConsultationSubmit(event) {
    event.preventDefault();
    const patientId = document.getElementById('currentPatientId').value;
    if (!patientId) { showCustomAlert('No patient selected'); return; }

    setLoading(true, "Saving Consultation & Closing Case...");
    const consultation = {
        id: 'c_' + Date.now(),
        patientId: patientId,
        patientName: document.getElementById('activePatientName').textContent,
        chiefComplaints: document.getElementById('fullChiefComplaints').value,
        investigation: document.getElementById('fullInvestigation').value,
        history: document.getElementById('fullHistory').value,
        diagnosis: document.getElementById('fullDiagnosis').value,
        medication: JSON.stringify(currentMedications), // Store as JSON for structured data
        consultationDate: new Date().toISOString(),
        doctorName: currentUser ? currentUser.username : 'Unknown'
    };

    try {
        saveConsultation(consultation);
        if (typeof saveConsultationToFirebase === 'function') await saveConsultationToFirebase(consultation);
        await updatePatientStatus(patientId, 'closed');

        document.getElementById('fullConsultationForm').reset();
        currentMedications = [];
        renderMedicationList();
        filterPatients();
        selectedPatientId = null;
        document.getElementById('consultationContent').style.display = 'none';
        document.getElementById('emptyState').style.display = 'flex';
        setLoading(false);

        showCustomConfirm('Consultation saved! Generate PDF?', () => {
            const patient = getPatients().find(p => p.id === patientId);
            generateConsultationPDF(consultation, patient, 'save');
        });
    } catch (e) {
        setLoading(false);
        showCustomAlert("Error saving consultation: " + e.message);
    }
}

async function updatePatientStatus(id, status) {
    const patients = getPatients();
    const idx = patients.findIndex(p => p.id === id);
    if (idx !== -1) {
        patients[idx].status = status;
        localStorage.setItem('patients', JSON.stringify(patients));
    }

    if (typeof updatePatientInFirebase === 'function') {
        try { await updatePatientInFirebase(id, { status: status }); } catch (e) { }
    }
}

// Medication Management Functions
function addMedicationRow() {
    const name = document.getElementById('medName').value.trim();
    const unit = document.getElementById('medUnit').value;
    const m = document.getElementById('medDosageM').value || '0';
    const a = document.getElementById('medDosageA').value || '0';
    const n = document.getElementById('medDosageN').value || '0';
    const days = document.getElementById('medDays').value.trim();
    const qty = document.getElementById('medQty').value.trim();
    const info = document.getElementById('medInfo').value;
    const remarks = document.getElementById('medRemarks').value.trim();

    if (!name || !days || !qty || !info) {
        showCustomAlert("Please fill all required Medication fields (*)");
        return;
    }

    // Dosage string as requested: 1 - 0 - 1 (ml)
    const dosage = `${m} - ${a} - ${n} ${unit ? `(${unit})` : ''}`;

    const med = {
        id: Date.now(),
        name, unit, dosage, days, qty, info, remarks
    };

    currentMedications.push(med);
    renderMedicationList();
    resetMedicationFields();
}

function removeMedicationRow(id) {
    currentMedications = currentMedications.filter(m => m.id !== id);
    renderMedicationList();
}

function resetMedicationFields() {
    // document.getElementById('medCode').value = ''; // field removed
    document.getElementById('medName').value = '';
    document.getElementById('medUnit').value = '';
    document.getElementById('medDosageM').value = '';
    document.getElementById('medDosageA').value = '';
    document.getElementById('medDosageN').value = '';
    document.getElementById('medDays').value = '';
    document.getElementById('medQty').value = '';
    document.getElementById('medInfo').value = '';
    document.getElementById('medRemarks').value = '';
}

function calculateMedQty() {
    const m = parseFloat(document.getElementById('medDosageM').value) || 0;
    const a = parseFloat(document.getElementById('medDosageA').value) || 0;
    const n = parseFloat(document.getElementById('medDosageN').value) || 0;
    const totalDaily = m + a + n;

    const days = parseFloat(document.getElementById('medDays').value) || 0;
    const qtyInput = document.getElementById('medQty');

    if (totalDaily > 0 && days > 0) {
        qtyInput.value = Math.round(totalDaily * days);
    } else {
        qtyInput.value = '';
    }
}

function renderMedicationList() {
    const tbody = document.getElementById('medicationListBody');
    const hiddenInput = document.getElementById('fullMedication');
    if (!tbody || !hiddenInput) return;

    tbody.innerHTML = '';

    currentMedications.forEach(med => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${med.name}</strong></td>
            <td style="white-space: nowrap;">${med.dosage}</td>
            <td>${med.days}</td>
            <td>${med.qty}</td>
            <td>${med.info}</td>
            <td>${med.remarks || '-'}</td>
            <td>
                <button type="button" class="btn-remove" onclick="removeMedicationRow(${med.id})">×</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    hiddenInput.value = currentMedications.length > 0 ? JSON.stringify(currentMedications) : "";
}

async function printConsultation(cid) {
    const consultations = getConsultations();
    let c = consultations.find(x => x.id === cid);

    // Fallback: If not found and we have an active patient, try fetching fresh data from Firebase
    if (!c && selectedPatientId && typeof getPatientConsultations === 'function') {
        try {
            const firebaseCons = await getPatientConsultations(selectedPatientId);
            c = firebaseCons.find(x => x.id === cid);
        } catch (e) { console.error("Print fetch failed", e); }
    }

    if (c) {
        // Try to find patient locally
        let patient = getPatients().find(p => p.id === c.patientId);

        // If patient not in local (e.g. fresh load), we try to assume minimal details or just proceed
        // Ideally we should fetch patient too, but 'getPatientConsultations' doesn't return patient info.
        // The PDF generation handles missing patient gracefully (checks if patient exists).

        generateConsultationPDF(c, patient, 'print');
    } else {
        showCustomAlert("Consultation data not found. Please sync/refresh.");
    }
}

// PDF GENERATION WITH BORDER
function generateConsultationPDF(consultation, patient, action = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // LOGO BASE64
    const logoBase64 = "logo.png";

    // === 1. LOGO WATERMARK ===
    if (window.jspdf.GState) {
        doc.saveGraphicsState();
        doc.setGState(new window.jspdf.GState({ opacity: 0.1 }));
        doc.addImage(logoBase64, 'PNG', 45, 100, 120, 120);
        doc.restoreGraphicsState();
    }

    // === 2. BORDER REMOVED ===


    // === HEADER ===
    doc.addImage(logoBase64, 'PNG', 15, 15, 28, 28);

    // Left side: Title
    doc.setFontSize(28);
    doc.setTextColor(0, 51, 102); // Dark Blue
    doc.setFont(undefined, 'bold');
    doc.text("HAFISA", 45, 25);

    doc.setFontSize(18);
    doc.setTextColor(50, 50, 50);
    doc.text("TELECONSULTATION", 45, 33);

    doc.setFontSize(10);
    doc.setTextColor(34, 139, 34); // Forest Green
    doc.setFont(undefined, 'italic');
    doc.text("- Trusted Care at your Fingertips", 45, 39);

    // Right side: Contact Details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 150); // Muted Blue
    doc.setFont(undefined, 'normal');

    const contactX = 135;
    doc.text("Contact details:", contactX, 20);
    doc.setLineWidth(0.2);
    doc.line(contactX, 21, 160, 21); // Underline "Contact details"

    doc.setTextColor(80, 80, 80);
    doc.text("hafisateleconsultation@gmail.com", contactX, 26);
    doc.text("9324391085", contactX, 31);
    doc.text("Mumbai 400015", contactX, 36);

    // Decorative Curve/Line
    doc.setDrawColor(0, 87, 146);
    doc.setLineWidth(0.1);
    doc.line(20, 45, 190, 45);

    // === PATIENT DETAILS ===
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Left Column
    doc.text(`Patient Name:`, 20, 55);
    doc.setFont(undefined, 'bold');
    doc.text(consultation.patientName, 50, 55);

    doc.setFont(undefined, 'normal');
    doc.text(`Age/Gender:`, 20, 63);
    doc.setFont(undefined, 'bold');
    if (patient) doc.text(`${patient.age} Y / ${patient.gender}`, 50, 63);

    // Right Column
    doc.setFont(undefined, 'normal');
    doc.text(`Date:`, 140, 55);
    doc.setFont(undefined, 'bold');
    doc.text(new Date(consultation.consultationDate).toLocaleDateString(), 155, 55);

    doc.setFont(undefined, 'normal');
    doc.text(`Phone:`, 140, 63);
    doc.setFont(undefined, 'bold');
    if (patient) doc.text(patient.phone, 155, 63);

    doc.setLineWidth(0.1);
    doc.line(20, 65, 190, 65);

    let y = 80;
    const addSection = (title, content) => {
        doc.setFontSize(14);
        doc.setTextColor(0, 87, 146);
        doc.setFont(undefined, 'bold');
        doc.text(title, 20, y);
        y += 7;
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const splitText = doc.splitTextToSize(content || "N/A", 170);
        doc.text(splitText, 20, y);
        y += (splitText.length * 7) + 10;
    };

    addSection("Chief Complaints:", consultation.chiefComplaints);
    if (consultation.history) addSection("History:", consultation.history);
    addSection("Investigation:", consultation.investigation);
    addSection("Diagnosis:", consultation.diagnosis);

    y += 15; // Increased spacing to move medication box further down


    // Handle Medication (JSON or string)
    let medsData = [];
    try {
        medsData = JSON.parse(consultation.medication);
    } catch (e) { /* Not JSON */ }

    const medsLines = Array.isArray(medsData)
        ? medsData.map(m => `• ${m.name} [${m.dosage}] - for ${m.days} days | ${m.info}${m.remarks ? ` (${m.remarks})` : ''}`)
        : [consultation.medication || ""];

    const medsText = medsLines.join('\n');
    const medsSplit = doc.splitTextToSize(medsText, 170);
    const boxHeight = Math.max(40, (medsSplit.length * 7) + 20);

    if (y + boxHeight > 280) { doc.addPage(); y = 20; }

    doc.setFillColor(240, 248, 255);
    doc.setDrawColor(0, 87, 146);
    doc.roundedRect(15, y, 180, boxHeight, 3, 3, 'F'); // Border removed (using 'F' instead of 'FD')

    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont(undefined, 'bold');
    doc.text("Rx (Medication)", 20, y + 10);
    doc.setFontSize(13); // Increased font size
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(medsSplit, 20, y + 20);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Dr. " + (consultation.doctorName || "Unknown"), 150, 280);
    doc.text("Signature", 150, 290);

    if (action === 'print') {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    } else {
        doc.save(`Prescription_${consultation.patientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    }
}

// Helpers
function generateId() { return 'id_' + Date.now(); }
function showSuccessMessage(eid) { const m = document.getElementById(eid); if (m) { m.classList.add('show'); setTimeout(() => m.classList.remove('show'), 3000); } }
function savePatient(p) { let l = getPatients(); const i = l.findIndex(x => x.id === p.id); if (i >= 0) l[i] = p; else l.push(p); localStorage.setItem('patients', JSON.stringify(l)); }
function getPatients() { return JSON.parse(localStorage.getItem('patients') || '[]'); }
function saveConsultation(c) { let l = getConsultations(); l.push(c); localStorage.setItem('consultations', JSON.stringify(l)); }
function getConsultations() { return JSON.parse(localStorage.getItem('consultations') || '[]'); }
function calculateAge(d) { const t = new Date(); const b = new Date(d); let a = t.getFullYear() - b.getFullYear(); return a; }

window.hospitalApp = { getPatients, getConsultations, printConsultation };
window.showCustomConfirm = showCustomConfirm;
window.showCustomAlert = showCustomAlert;
window.showCustomPrompt = showCustomPrompt;

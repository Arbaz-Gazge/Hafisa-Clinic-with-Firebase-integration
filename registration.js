// ============================================
// PATIENT REGISTRATION LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    if (!checkSession()) {
        window.location.href = 'login.html?module=registration';
        return;
    }
    const input = document.getElementById('regSearchPhone');
    if (input) input.focus();
});

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
        setLoading(true, "Updating Status...");
        await updatePatientStatus(id, 'open');
        setLoading(false);
        showCustomAlert("Encounter Opened! Patient is now visible in Doctor's 'Open' list.");
        // Clear search
        document.getElementById('regSearchPhone').value = '';
        document.getElementById('regSearchResult').innerHTML = '<p style="color: #666; font-size: 0.9em; text-align: center;">Enter phone number to check if patient is already registered.</p>';
    });
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

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    const form = event.target;
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
        savePatient(patient);
        if (typeof savePatientToFirebase === 'function') await savePatientToFirebase(patient);
        setLoading(false);

        showSuccessMessage('registrationSuccess');
        form.reset();
        const resCont = document.getElementById('regSearchResult');
        if (resCont) resCont.innerHTML = '<p style="color: #666; font-size: 0.9em; text-align: center;">Enter phone number to check if patient is already registered.</p>';
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

window.handlePhoneSearch = handlePhoneSearch;
window.openNewEncounter = openNewEncounter;
window.handleRegistrationSubmit = handleRegistrationSubmit;
window.calculateAgeFromDOB = calculateAgeFromDOB;
window.calculateDOBFromAge = calculateDOBFromAge;

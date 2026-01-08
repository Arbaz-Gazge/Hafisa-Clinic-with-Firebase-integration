// ============================================
// DOCTOR CONSULTATION LOGIC
// ============================================

let currentTab = 'open';
let selectedPatientId = null;
let dateFilterInstance = null;
let currentMedications = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!checkSession()) {
        window.location.href = 'login.html?module=consultation';
        return;
    }
    setupDatePickers();
    filterPatients();
});

function setupDatePickers() {
    const filterInput = document.getElementById('filterDate');
    if (filterInput && typeof flatpickr === 'function') {
        dateFilterInstance = flatpickr(filterInput, {
            mode: "range",
            dateFormat: "Y-m-d",
            placeholder: "Select Date Range...",
            onChange: function () {
                filterPatients();
            }
        });
    }
}

async function filterPatients() {
    const container = document.getElementById('patientListContainer');
    if (container) container.innerHTML = '<div style="padding: 20px; text-align: center;">Loading...</div>';

    let firebasePatients = [];
    if (typeof getPatientsFromFirebase === 'function') {
        try { firebasePatients = await getPatientsFromFirebase(); } catch (e) { console.warn("Firebase load failed", e); }
    }
    const localPatients = getPatients();

    const merged = {};
    firebasePatients.forEach(p => merged[p.id] = p);
    localPatients.forEach(p => merged[p.id] = p);

    const patients = Object.values(merged).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    const searchQuery = (document.getElementById('searchPatientInput')?.value || '').toLowerCase();

    const filtered = patients.filter(p => {
        const statusMatch = currentTab === 'open' ? (p.status !== 'closed') : (p.status === 'closed');
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
    if (!container) return;
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

function switchTab(tab) {
    currentTab = tab;
    const btnOpen = document.getElementById('tabOpen');
    const btnClosed = document.getElementById('tabClosed');
    if (btnOpen) {
        btnOpen.className = tab === 'open' ? 'tab-btn active' : 'tab-btn';
        btnOpen.style.borderBottom = tab === 'open' ? '3px solid var(--primary-500)' : '3px solid transparent';
    }
    if (btnClosed) {
        btnClosed.className = tab === 'closed' ? 'tab-btn active' : 'tab-btn';
        btnClosed.style.borderBottom = tab === 'closed' ? '3px solid var(--primary-500)' : '3px solid transparent';
    }
    filterPatients();
}

async function selectPatient(id) {
    setLoading(true, "Opening Patient Record...");
    selectedPatientId = id;

    const emptyState = document.getElementById('emptyState');
    const consultationContent = document.getElementById('consultationContent');
    if (emptyState) emptyState.style.display = 'none';
    if (consultationContent) consultationContent.style.display = 'block';

    let patients = getPatients();
    let patient = patients.find(p => p.id === id);

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

        currentMedications = [];
        renderMedicationList();
        resetMedicationFields();

        try {
            await loadPatientHistory(id);
        } catch (e) { console.error("History load error", e); }
        setLoading(false);

        const form = document.getElementById('fullConsultationForm');
        let msg = document.getElementById('closedPatientMsg');
        if (patient.status === 'closed') {
            if (form) form.style.display = 'none';
            if (!msg && form) {
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
            if (msg) msg.style.display = 'block';
        } else {
            if (form) form.style.display = 'block';
            if (msg) msg.style.display = 'none';
        }

        // Refresh list to show selection color
        renderPatientList(getPatients().filter(p => {
            const statusMatch = currentTab === 'open' ? (p.status !== 'closed') : (p.status === 'closed');
            return statusMatch;
        }));

    } else {
        setLoading(false);
        showCustomAlert("Patient details not found.");
    }
}

async function loadPatientHistory(patientId) {
    const historySection = document.getElementById('previousHistorySection');
    const historyContent = document.getElementById('historyContent');
    if (!historySection || !historyContent) return;

    let firebaseData = [];
    if (typeof getPatientConsultations === 'function') {
        try { firebaseData = await getPatientConsultations(patientId); }
        catch (e) { console.warn("Firebase Fetch Error", e); }
    }

    const localData = getConsultations().filter(c => c.patientId === patientId);
    const merged = {};
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
        medication: JSON.stringify(currentMedications),
        consultationDate: new Date().toISOString(),
        doctorName: currentUser ? currentUser.username : 'Unknown'
    };

    try {
        saveConsultation(consultation);
        if (typeof saveConsultationToFirebase === 'function') await saveConsultationToFirebase(consultation);

        // Update status locally and firebase
        const patients = getPatients();
        const idx = patients.findIndex(p => p.id === patientId);
        if (idx !== -1) {
            patients[idx].status = 'closed';
            localStorage.setItem('patients', JSON.stringify(patients));
        }
        if (typeof updatePatientInFirebase === 'function') await updatePatientInFirebase(patientId, { status: 'closed' });

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

// Medication
function calculateMedQty() {
    const m = parseFloat(document.getElementById('medDosageM').value) || 0;
    const a = parseFloat(document.getElementById('medDosageA').value) || 0;
    const n = parseFloat(document.getElementById('medDosageN').value) || 0;
    const totalDaily = m + a + n;
    const days = parseFloat(document.getElementById('medDays').value) || 0;
    const qtyInput = document.getElementById('medQty');
    if (totalDaily > 0 && days > 0) qtyInput.value = Math.round(totalDaily * days);
    else qtyInput.value = '';
}

function resetMedicationFields() {
    ['medName', 'medUnit', 'medDosageM', 'medDosageA', 'medDosageN', 'medDays', 'medQty', 'medInfo', 'medRemarks'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

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

    const dosage = `${m} - ${a} - ${n} ${unit ? `(${unit})` : ''}`;
    const med = { id: Date.now(), name, unit, dosage, days, qty, info, remarks };
    currentMedications.push(med);
    renderMedicationList();
    resetMedicationFields();
}

function removeMedicationRow(id) {
    currentMedications = currentMedications.filter(m => m.id !== id);
    renderMedicationList();
}

function renderMedicationList() {
    const tbody = document.getElementById('medicationListBody');
    if (!tbody) return;
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
            <td><button type="button" class="btn-remove" onclick="removeMedicationRow(${med.id})">×</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function printConsultation(cid) {
    const consultations = getConsultations();
    let c = consultations.find(x => x.id === cid);
    if (!c && selectedPatientId && typeof getPatientConsultations === 'function') {
        try {
            const firebaseCons = await getPatientConsultations(selectedPatientId);
            c = firebaseCons.find(x => x.id === cid);
        } catch (e) { }
    }
    if (c) {
        let patient = getPatients().find(p => p.id === c.patientId);
        generateConsultationPDF(c, patient, 'print');
    } else {
        showCustomAlert("Consultation data not found.");
    }
}

function generateConsultationPDF(consultation, patient, action = 'save') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const logoBase64 = "logo.png";

    if (window.jspdf.GState) {
        doc.saveGraphicsState();
        doc.setGState(new window.jspdf.GState({ opacity: 0.1 }));
        doc.addImage(logoBase64, 'PNG', 45, 100, 120, 120);
        doc.restoreGraphicsState();
    }

    doc.addImage(logoBase64, 'PNG', 15, 15, 28, 28);
    doc.setFontSize(28);
    doc.setTextColor(0, 51, 102);
    doc.setFont(undefined, 'bold');
    doc.text("HAFISA", 45, 25);
    doc.setFontSize(18);
    doc.setTextColor(50, 50, 50);
    doc.text("TELECONSULTATION", 45, 33);
    doc.setFontSize(10);
    doc.setTextColor(34, 139, 34);
    doc.setFont(undefined, 'italic');
    doc.text("- Trusted Care at your Fingertips", 45, 39);

    const contactX = 135;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 150);
    doc.setFont(undefined, 'normal');
    doc.text("Contact details:", contactX, 20);
    doc.setLineWidth(0.2);
    doc.line(contactX, 21, 160, 21);
    doc.setTextColor(80, 80, 80);
    doc.text("hafisateleconsultation@gmail.com", contactX, 26);
    doc.text("9324391085", contactX, 31);
    doc.text("Mumbai 400015", contactX, 36);

    doc.setDrawColor(0, 87, 146);
    doc.setLineWidth(0.1);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient Name:`, 20, 55);
    doc.setFont(undefined, 'bold');
    doc.text(consultation.patientName, 50, 55);
    doc.setFont(undefined, 'normal');
    doc.text(`Age/Gender:`, 20, 63);
    doc.setFont(undefined, 'bold');
    if (patient) doc.text(`${patient.age} Y / ${patient.gender}`, 50, 63);
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

    y += 15;
    let medsData = [];
    try { medsData = JSON.parse(consultation.medication); } catch (e) { }
    const medsLines = Array.isArray(medsData)
        ? medsData.map(m => `• ${m.name} [${m.dosage}] - for ${m.days} days | ${m.info}${m.remarks ? ` (${m.remarks})` : ''}`)
        : [consultation.medication || ""];
    const medsText = medsLines.join('\n');
    const medsSplit = doc.splitTextToSize(medsText, 170);
    const boxHeight = Math.max(40, (medsSplit.length * 7) + 20);

    if (y + boxHeight > 280) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 248, 255);
    doc.setDrawColor(0, 87, 146);
    doc.roundedRect(15, y, 180, boxHeight, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.setFont(undefined, 'bold');
    doc.text("Rx (Medication)", 20, y + 10);
    doc.setFontSize(13);
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

window.filterPatients = filterPatients;
window.switchTab = switchTab;
window.selectPatient = selectPatient;
window.handleFullConsultationSubmit = handleFullConsultationSubmit;
window.calculateMedQty = calculateMedQty;
window.resetMedicationFields = resetMedicationFields;
window.addMedicationRow = addMedicationRow;
window.removeMedicationRow = removeMedicationRow;
window.printConsultation = printConsultation;

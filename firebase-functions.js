// ============================================
// FIREBASE DATABASE FUNCTIONS
// ============================================

// Database reference inherited from firebase-config.js
const db = window.db || firebase.firestore();

/**
 * Save patient to Firebase Firestore
 */
async function savePatientToFirebase(patient) {
    try {
        await db.collection('patients').doc(patient.id).set(patient);
        console.log('✅ Patient saved to Firebase:', patient.name);
        return true;
    } catch (error) {
        console.error('❌ Error saving patient to Firebase:', error);
        alert('Error saving to cloud database. Data saved locally only.');
        return false;
    }
}

/**
 * Get all patients from Firebase
 */
async function getPatientsFromFirebase() {
    try {
        // Removed .orderBy to avoid index requirements
        const snapshot = await db.collection('patients').get();

        const patients = [];
        snapshot.forEach(doc => {
            patients.push(doc.data());
        });

        // Sort in memory
        patients.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));

        console.log(`✅ Loaded ${patients.length} patients from Firebase`);
        return patients;
    } catch (error) {
        console.error('❌ Error getting patients from Firebase:', error);
        return [];
    }
}

/**
 * Save consultation to Firebase
 */
async function saveConsultationToFirebase(consultation) {
    try {
        await db.collection('consultations').doc(consultation.id).set(consultation);
        console.log('✅ Consultation saved to Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error saving consultation to Firebase:', error);
        alert('Error saving to cloud database. Data saved locally only.');
        return false;
    }
}

/**
 * Get all consultations from Firebase
 */
async function getConsultationsFromFirebase() {
    try {
        // Removed .orderBy to avoid index requirements
        const snapshot = await db.collection('consultations').get();

        const consultations = [];
        snapshot.forEach(doc => {
            consultations.push(doc.data());
        });

        // Sort in memory
        consultations.sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate));

        console.log(`✅ Loaded ${consultations.length} consultations from Firebase`);
        return consultations;
    } catch (error) {
        console.error('❌ Error getting consultations from Firebase:', error);
        return [];
    }
}

/**
 * Get consultations for a specific patient
 */
async function getPatientConsultations(patientId) {
    try {
        const snapshot = await db.collection('consultations')
            .where('patientId', '==', patientId)
            .get();

        const consultations = [];
        snapshot.forEach(doc => {
            consultations.push(doc.data());
        });

        // Sort in memory
        consultations.sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate));

        return consultations;
    } catch (error) {
        console.error('❌ Error getting patient consultations:', error);
        return [];
    }
}

/**
 * Delete patient from Firebase
 */
async function deletePatientFromFirebase(patientId) {
    try {
        await db.collection('patients').doc(patientId).delete();
        console.log('✅ Patient deleted from Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error deleting patient:', error);
        return false;
    }
}

/**
 * Update patient in Firebase
 */
async function updatePatientInFirebase(patientId, updates) {
    try {
        await db.collection('patients').doc(patientId).update(updates);
        console.log('✅ Patient updated in Firebase');
        return true;
    } catch (error) {
        console.error('❌ Error updating patient:', error);
        return false;
    }
}

/**
 * Real-time listener for patients (optional)
 * Keeping orderBy here implies it might fail without index, but listeners are advanced.
 * We'll remove orderBy here too to be safe.
 */
function listenToPatients(callback) {
    return db.collection('patients')
        .onSnapshot(snapshot => {
            const patients = [];
            snapshot.forEach(doc => {
                patients.push(doc.data());
            });
            // Sort
            patients.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
            callback(patients);
        }, error => {
            console.error('❌ Error listening to patients:', error);
        });
}

/**
 * Real-time listener for consultations
 */
function listenToConsultations(callback) {
    return db.collection('consultations')
        .onSnapshot(snapshot => {
            const consultations = [];
            snapshot.forEach(doc => {
                consultations.push(doc.data());
            });
            // Sort
            consultations.sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate));
            callback(consultations);
        }, error => {
            console.error('❌ Error listening to consultations:', error);
        });
}

/**
 * Sync local storage to Firebase (useful for migration)
 */
async function syncLocalToFirebase() {
    console.log('🔄 Starting sync from local storage to Firebase...');

    // Sync patients
    const localPatients = getPatients();
    for (const patient of localPatients) {
        await savePatientToFirebase(patient);
    }

    // Sync consultations
    const localConsultations = getConsultations();
    for (const consultation of localConsultations) {
        await saveConsultationToFirebase(consultation);
    }

    console.log('✅ Sync completed!');
    alert(`Synced ${localPatients.length} patients and ${localConsultations.length} consultations to Firebase`);
}

/**
 * Load data from Firebase to local storage (useful for offline mode)
 */
async function loadFirebaseToLocal() {
    console.log('🔄 Loading data from Firebase to local storage...');

    // Load patients
    const firebasePatients = await getPatientsFromFirebase();
    if (firebasePatients.length > 0) {
        localStorage.setItem('patients', JSON.stringify(firebasePatients));
    }

    // Load consultations
    const firebaseConsultations = await getConsultationsFromFirebase();
    if (firebaseConsultations.length > 0) {
        localStorage.setItem('consultations', JSON.stringify(firebaseConsultations));
    }

    console.log('✅ Data loaded from Firebase!');
}

// Make Firebase functions available globally
window.firebaseDB = {
    savePatient: savePatientToFirebase,
    getPatients: getPatientsFromFirebase,
    saveConsultation: saveConsultationToFirebase,
    getConsultations: getConsultationsFromFirebase,
    getPatientConsultations: getPatientConsultations,
    deletePatient: deletePatientFromFirebase,
    updatePatient: updatePatientInFirebase,
    syncLocalToFirebase: syncLocalToFirebase,
    loadFirebaseToLocal: loadFirebaseToLocal
};

console.log('🔥 Firebase functions ready. Access via window.firebaseDB');

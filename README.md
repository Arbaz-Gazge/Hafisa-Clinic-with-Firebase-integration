# 🏥 Hospital Management System

A modern, cloud-enabled hospital management application for patient registration and doctor consultations.

## ✨ Features

### 📋 Patient Registration
- Complete patient demographic information
- Age calculation from date of birth OR direct age entry
- Phone number validation
- Address management

### 🩺 Doctor Consultation
- Patient selection from registered patients
- Chief complaints recording
- Investigation and test results
- Medical history tracking
- Diagnosis documentation
- Medication prescription

### ☁️ Cloud Integration
- Firebase Firestore database
- Real-time data synchronization
- Offline support with local storage
- Automatic cloud backup

## 📁 Project Structure

```
clinic/
├── index.html                      # Main application page
├── styles.css                      # Complete design system
├── app.js                          # Application logic
├── firebase-config.js              # Firebase configuration (UPDATE THIS!)
├── firebase-functions.js           # Database operations
├── FIREBASE_SETUP.md              # Quick setup guide
└── FIREBASE_INTEGRATION_GUIDE.md  # Detailed Firebase guide
```



### Step 5: Test
Open `index.html` and check the browser console for:
```
✅ Firebase initialized successfully
✅ Offline persistence enabled
🔥 Firebase functions ready
```

**That's it!** Your app is now cloud-enabled! 🎉

## How to Use

### Register a Patient
1. Click **"Register Patient"** button
2. Fill in patient details:
   - Name (required)
   - Gender (required)
   - Phone number (10 digits)
   - Date of Birth OR Age (required)
   - Address (required)
3. Click **"Register Patient"**
4. Patient is saved to both local storage and Firebase

### Create a Consultation
1. Click **"New Consultation"** button
2. Select a patient from the dropdown
3. Patient information will display automatically
4. Fill in consultation details:
   - Chief Complaints (required)
   - Investigation/Tests (optional)
   - Medical History (optional)
   - Diagnosis (required)
   - Medication (required)
5. Click **"Save Consultation"**
6. Consultation is linked to the patient and saved

## Design Features

- **Modern UI**: Clean, professional medical aesthetic
- **Responsive**: Works on desktop, tablet, and mobile
- **Animations**: Smooth transitions and micro-interactions
- **Color Palette**: Medical-themed blue and teal gradients
- **Typography**: Inter and Outfit fonts for readability
- **Accessibility**: Semantic HTML and ARIA labels

## 🔧 Browser Console Commands

Open browser console (F12) and try these:

```javascript
// View all patients
window.hospitalApp.getPatients()

// View all consultations
window.hospitalApp.getConsultations()

// Export all data to JSON file
window.hospitalApp.exportData()

// Get patient statistics
window.hospitalApp.getPatientStats()

// Sync local data to Firebase
window.firebaseDB.syncLocalToFirebase()

// Load Firebase data to local storage
window.firebaseDB.loadFirebaseToLocal()
```

## 📊 Data Storage

### Local Storage (Browser)
- Patients: `localStorage.getItem('patients')`
- Consultations: `localStorage.getItem('consultations')`

### Firebase Firestore
- Collection: `patients`
- Collection: `consultations`

### Data Structure

**Patient Object:**
```javascript
{
  id: "unique_id",
  name: "Hell",
  gender: "Male",
  phone: "1234567890",
  dateOfBirth: "1990-01-01",
  age: "35",
  address: "Parel, Mumbai",
  registrationDate: "2025-12-30T10:00:00.000Z"
}
```

**Consultation Object:**
```javascript
{
  id: "unique_id",
  patientId: "patient_id",
  patientName: "John Doe",
  chiefComplaints: "Fever and headache",
  investigation: "Blood test ordered",
  history: "No previous conditions",
  diagnosis: "Viral infection",
  medication: "Paracetamol 500mg",
  consultationDate: "2025-12-30T10:30:00.000Z"
}
```


### For Production
Update Firestore rules to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /patients/{patientId} {
      allow read, write: if request.auth != null;
    }
    match /consultations/{consultationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then add Firebase Authentication.

## 🌐 Deployment Options

### Option 1: Firebase Hosting (Free)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```




## 📱 Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🐛 Troubleshooting

### Firebase not working?
1. Check internet connection
2. Verify `firebase-config.js` has correct credentials
3. Check browser console for errors
4. Ensure Firestore is enabled in Firebase Console

### Data not saving?
1. Check browser console for errors
2. Verify form fields are filled correctly
3. Check local storage: `localStorage.getItem('patients')`

### Patient not appearing in dropdown?
1. Make sure patient is registered first
2. Check console for loading errors
3. Try refreshing the page

## 📚 Documentation

- **Quick Setup**: See `FIREBASE_SETUP.md`
- **Detailed Guide**: See `FIREBASE_INTEGRATION_GUIDE.md`
- **Firebase Docs**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com/

## 🎯 Future Enhancements

Potential features to add:
- [ ] User authentication (doctor login)
- [ ] Patient search functionality
- [ ] Consultation history view per patient
- [ ] Print prescription feature
- [ ] Appointment scheduling
- [ ] Patient dashboard
- [ ] Analytics and reports
- [ ] Multi-language support
- [ ] PDF export for consultations
- [ ] Email notifications



2 types of users login 
1. Doctor
2. Patient


Last Updated: December 30, 2025

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

## 🚀 Quick Start

### Option 1: Local Only (No Firebase)
1. Open `index.html` in your web browser
2. Start using the application
3. Data will be saved in browser's local storage

### Option 2: With Firebase (Recommended)
1. Follow the steps in `FIREBASE_SETUP.md`
2. Update `firebase-config.js` with your credentials
3. Open `index.html` in your browser
4. Data will sync to cloud automatically!

## 🔥 Firebase Setup (5 Minutes)

### Step 1: Create Firebase Project
```
1. Go to: https://console.firebase.google.com/
2. Click "Add project"
3. Name: "Hospital Management System"
4. Create project
```

### Step 2: Enable Firestore
```
1. Go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Enable
```

### Step 3: Get Configuration
```
1. Click Web icon (</>)
2. Register app
3. Copy the firebaseConfig object
```

### Step 4: Update Config File
Open `firebase-config.js` and replace:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← Your actual API key
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 5: Test
Open `index.html` and check the browser console for:
```
✅ Firebase initialized successfully
✅ Offline persistence enabled
🔥 Firebase functions ready
```

**That's it!** Your app is now cloud-enabled! 🎉

## 💡 How to Use

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

## 🎨 Design Features

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
  name: "John Doe",
  gender: "Male",
  phone: "1234567890",
  dateOfBirth: "1990-01-01",
  age: "35",
  address: "123 Main St",
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

## 🔒 Security Notes

### For Development (Current Setup)
- Firestore is in "test mode"
- Anyone can read/write data
- **DO NOT use in production!**

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

### Option 2: Any Web Server
Simply upload all files to your web server.

### Option 3: GitHub Pages
1. Create a GitHub repository
2. Push your code
3. Enable GitHub Pages in settings

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

## 📄 License

This project is open source and available for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check the documentation files
2. Review browser console errors
3. Consult Firebase documentation
4. Check Stack Overflow

---

**Built with ❤️ for better healthcare management**

2 types of users login 
1. Doctor
2. Patient


Last Updated: December 30, 2025

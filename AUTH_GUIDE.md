# 🔐 Authentication & Admin Setup Guide

## 1. Accessing the Admin Panel
To manage users (create usernames/passwords for your staff), you need to access the Admin Panel.
1. Open `admin.html` in your browser.
   - URL: `file:///home/arbaz/Desktop/Dropbox/my web/clinic/admin.html`

## 2. Creating Users
1. **Front Desk User**:
   - Username: `frontdesk` (example)
   - Password: `password123`
   - Role: Select **Front Desk (Registration)**
   - Click "Create User"

2. **Doctor User**:
   - Username: `doctor` (example)
   - Password: `securepass`
   - Role: Select **Care Professional (Consultation)**
   - Click "Create User"

## 3. Using the App
### Registration Module
1. Click "Register Patient".
2. Login with a **Front Desk** account.
3. You will see the Registration Form.
4. Enter patient details (Phone number now shows 🇮🇳 +91).
5. Submit. Patient is saved as 'Open'.

### Doctor Consultation Module
1. Click "New Consultation".
2. Login with a **Care Professional** account.
3. You will see the **Full Screen Consultation Dashboard**.
4. **Left Sidebar**:
   - **Open Patients**: Lists patients waiting for consultation.
   - **Closed**: Lists patients who have been consulted.
   - **Date Filter**: Filter list by registration date.
5. **Right Side**:
   - Select a patient to view details.
   - See **Previous Consultation History** (if any).
   - Fill new consultation details.
   - Click "Save & Close".
   - Patient status moves to 'Closed'.

## 4. Updates Made
- **Phone Number**: Added +91 prefix and Indian flag.
- **Security**: Added Login system for both modules.
- **Workflow**: Added 'Open' vs 'Closed' patient tracking.
- **UI**: Created a professional full-screen dashboard for doctors.

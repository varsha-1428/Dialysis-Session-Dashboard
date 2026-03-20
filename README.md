# Dialysis-Session-Dashboard

A clinical workflow application aimed at improving the reliability and efficiency of dialysis session tracking, helping healthcare staff identify potential patient risks early and make more informed decisions during treatment.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

### Setup Instructions

### 1. Clone the Repository

```bash
git clone <https://github.com/varsha-1428/Dialysis-Session-Dashboard.git>
cd Dialysis-Session-Dashboard
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dialysis-dashboard
EOF

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend API will run on `http://localhost:5000`

### 3. Frontend Setup (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

### 4. Verify Everything is Running

- Backend Health Check: Visit `http://localhost:5000/api/health`
- Frontend: Visit `http://localhost:5173`
- Expected Response: `{ status: 'OK', message: 'Dialysis Dashboard API is running' }`

### 5. Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

## 🏗️ System Architecture
### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│  - Dashboard for session tracking                             │
│  - Patient management UI                                      │
│  - Anomaly visualization & alerts                             │
│  - Real-time data binding with Axios                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Express + TypeScript)                  │
│  - REST API endpoints (/api/patients/*)                     │
│  - Business logic & anomaly detection                        │
│  - Data validation & transformation                          │
│  - CORS enabled for frontend communication                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       │
┌──────────────────────▼──────────────────────────────────────┐
│            MongoDB Database                                  │
│  - Patient documents (name, MRN, dryWeight, DOB)             │
│  - Session records (vitals, timestamps, anomalies)           │
│  - Historical data for IDWG calculations                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🦉 Assumptions & Decisions

| # | Area                | Ambiguity                                                   | Decision                                             |
| - | ------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| 1 | Today’s Schedule    | Whether schedule is pre-existing or created on the same day | Treated as sessions created for the current date     |
| 2 | Session Status      | Whether status is stored or derived                         | Derived from timestamps (startTime, endTime)         |
| 3 | IDWG Calculation    | What if previous session data is missing                    | Not evaluated if previous post-weight is unavailable |
| 4 | End-of-Day Handling | Whether incomplete sessions carry forward to the next day   | Each day is independent; no automatic carry-over     |

---

## 🔔 Anomaly Detection Criteria

### Excess Interdialytic Weight Gain (IDWG)

**Threshold:**
IDWG ≥ 5% of dry body weight

**Justification:**
Clinical guidelines recommend maintaining IDWG below 4–4.5%. Observational evidence indicates an increased risk of cardiovascular complications and mortality beyond approximately 5%, making this a practical threshold to flag excessive fluid gain.

---

### High Post-Dialysis Systolic Blood Pressure (SBP)

**Threshold:**
Post-dialysis SBP ≥ 150 mmHg

**Justification:**
Clinical guidelines suggest optimal outcomes within the 120–139 mmHg range. Observational evidence shows increased cardiovascular risk above this range, making 150 mmHg a practical cutoff to identify patients outside the optimal range.

---

### Abnormal Dialysis Session Duration

**Threshold:**
Session duration deviating significantly (e.g., ≥ 30 minutes) from the prescribed target duration

**Justification:**
Clinical practice typically targets dialysis sessions of approximately 3.5–4 hours. Observational evidence indicates that shorter-than-target sessions (especially < 240 minutes) are associated with increased mortality and inadequate toxin clearance. While longer sessions may improve clearance, optimal durations beyond standard targets are not well established. A deviation threshold serves as a practical criterion to flag sessions that may indicate suboptimal dialysis delivery.

---

## 📊 Dataset / Seeding

```bash
cd backend
npm run seed
```

* Generates sample patients and sessions
* Helps test anomaly detection quickly

---

## ⚠️ Limitations & Future Improvements

### Current Limitations

| Limitation | Impact | Workaround |
| --- | --- | --- |
| **No Authentication** | Anyone can access all patient data | Implement JWT-based auth; add access controls |
| **No Authorization** | No role-based access (staff vs. admin) | Add RBAC middleware |
| **Single timezone support** | Times may display incorrectly in other regions | Add user timezone preferences in UI |
| **Manual session creation** | No automated IoT/device integration | Plan machine data integration roadmap |
| **Static thresholds** | Anomaly criteria cannot be customized per patient | Implement per-patient threshold database |
---

## 🎬 Demo

https://drive.google.com/file/d/1anpDGA1lmRYMTAhzQi57k3Ar2kFguPoW/view?usp=drive_link


## 🤖 AI Usage

### Where AI Was Used

* Helped refine and structure the README so it’s clearer and easier to read
* Assisted in improving wording for some explanations and justifications
* Suggested basic patterns for error handling (like try-catch usage and response structure)
* Provided guidance while setting up initial project structure and organizing folders


### What Was Done Manually

* Designed and implemented the anomaly detection logic and thresholds
* Defined the data models (Patient, Session) and their structure
* Designed API endpoints and request/response flow
* Wrote the core business logic connecting all parts of the system


### Where I Disagreed with AI

* **IDWG Threshold**  
  AI suggested ~4%, but I kept it at **5%** to reduce unnecessary alerts and make it more practical

* **Session Carry-Over**  
  AI suggested automatic carry-over, but I kept it manual to avoid unintended changes to patient data

* **Authentication in MVP**  
  AI suggested adding full auth upfront, but I focused on core functionality first and left it for later

* **Database Indexing**  
  AI suggested adding multiple indexes, but I kept it minimal since this is an MVP with small data

* **Error Handling Format**  
  AI suggested a detailed standard format, but I kept responses simple for easier frontend handling


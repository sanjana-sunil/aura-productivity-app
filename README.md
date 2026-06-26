# Aura — AI-Powered Productivity Dashboard

## 📌 Overview

**Aura** is an AI-powered productivity dashboard designed to help users efficiently manage their tasks, deadlines, and productivity. It combines intelligent scheduling, real-time synchronization and analytics into a clean and interactive interface.

The application leverages Firebase for authentication and cloud storage while providing users with actionable productivity insights through charts and automated scheduling.

---

# ✨ Features

## 🔐 User Authentication

* Secure Google Sign-In using Firebase Authentication
* Personalized dashboard for every user
* User profile information displayed after login
* Secure sign out functionality

---

## ✅ Task Management

Users can:

* Add new tasks
* Edit existing tasks
* Delete tasks
* Mark tasks as completed
* Assign priorities
* Set deadlines
* Automatically sync tasks across sessions

---

## ☁️ Cloud Synchronization

Tasks are stored securely in Firebase Firestore.

Features include:

* Real-time synchronization
* Automatic cloud backup
* LocalStorage fallback if Firestore is unavailable
* Persistent task history

---

## 📊 Analytics Dashboard

Aura provides real-time productivity analytics.

### KPI Cards

* Total Tasks
* Completed Tasks
* Pending Tasks
* Completion Rate

### Charts

#### 🥧 Task Status

Displays:

* Completed Tasks
* Pending Tasks

using a Doughnut Chart.

#### 📈 Priority Distribution

Visualizes:

* High Priority Tasks
* Medium Priority Tasks
* Low Priority Tasks

using a Bar Chart.

### 📋 Productivity Insights

Automatically generated insights include:

* Completion percentage
* Pending workload
* High priority remaining tasks
* Productivity recommendations

---

## 🎯 Focus Recommendation

Aura recommends focus sessions based on the user's remaining high-priority workload, encouraging productive work sessions.

---

## 📱 Responsive Design

The application is fully responsive and adapts to:

* Desktop
* Laptop
* Tablet
* Mobile devices

---

# 🛠️ Technologies Used

## Frontend

* HTML5
* CSS3
* JavaScript (ES6)

---

## Backend & Database

* Firebase Authentication
* Firebase Firestore
* Firebase Cloud Messaging

---

## Libraries

* Chart.js
* Font Awesome

---

## Development Tools

* Antigravity IDE
* Git
* GitHub
* Gemini AI

---

# 📁 Project Structure

```
Aura/
│
├── index.html                 # Main application UI
│
├── css/
│   ├── style.css              # Main styling
│
├── js/
│   ├── app.js                 # Main application logic
│   ├── firebase-config.js     # Firebase authentication and configuration
│   ├── analytics.js           # KPI cards, charts & insights
│   ├── firestore.js           # Firestore operations
│
├── firebase-messaging-sw.js   # Firebase messaging service worker
│
├── README.md
│
└── LICENSE
```

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to the project

```bash
cd Aura
```

---

## 3. Configure Firebase

Create your Firebase project and enable:

* Authentication (Google Sign-In)
* Firestore Database
* Cloud Messaging

Update the Firebase configuration inside your project with your own credentials.

---

## 4. Run the project

Use any local server.

Examples:

* VS Code Live Server
* Python HTTP Server

```
http://localhost:8000
```

---

# 📈 Future Enhancements

* Calendar integration
* AI-powered daily planning
* Productivity streak tracking
* Weekly and monthly reports
* Team collaboration
* Recurring tasks
* Dark mode
* Voice-based task input
* AI chatbot assistant

---

# 🎯 Motivation

Aura was built to simplify personal productivity by combining intelligent task management, cloud synchronization, and data-driven insights into a single modern dashboard. The goal is to help users stay organized, prioritize effectively, and develop consistent productivity habits.

---

# 👨‍💻 Authors

Developed as a hackathon project by:

**Sanjana S**

---

# 📄 License

This project is intended for educational and hackathon purposes.

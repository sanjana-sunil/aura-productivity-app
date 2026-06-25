# Aura — Premium Productivity Dashboard

Aura is a stunning, cloud-synchronized personal workspace combining a real-time **Task Board**, a **Pomodoro Focus Timer** (Focus Engine), and a custom **Google Sign-In** security gate.

This application is built with modern ES Modules, Vanilla HTML5, CSS3 Glassmorphism, and the Firebase Web SDK (v10).

---

## Features

1. **Obsidian Glassmorphism Theme**: Fully customized styling featuring animated background blobs, hover gradients, micro-animations, and custom checkboxes.
2. **Google Sign-In**: Secure user accounts powered by Firebase Authentication.
3. **Real-time Task Board**: Create, toggle, and delete daily tasks. Syncs in real-time with Cloud Firestore.
4. **Offline LocalStorage Fallback**: If Cloud Firestore permissions are not configured, the app gracefully falls back to browser storage, guaranteeing 100% functionality.
5. **Focus Pomodoro Engine**: Clean SVG circular progress ticker supporting adjustable Work (25-min) and Break (5-min) modes. Pulsating visual warnings alert you when intervals complete.
6. **Time-Based Greetings**: Greeting banners and dynamic background gradient themes update depending on the time of day.
7. **Firebase Setup Wizard**: Paste your config object directly in the UI during the first run. The configuration will save locally in your browser.

---

## Quick Start (How to Run)

Because this app utilizes standard ES Modules, it must be run from a local web server (to prevent CORS restrictions with file system paths). Since Python is available on this system, you can start the application using the built-in HTTP server:

1. Open a terminal/command prompt in this project folder.
2. Run the following command to start the server:
   ```bash
   python -m http.server 8000
   ```
3. Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

---

## Configuring Firebase

To connect the application to your own Firebase project:

### Step 1: Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and follow the prompt.

### Step 2: Configure Authentication (Google Sign-In)
1. In the left navigation, go to **Authentication**.
2. Click **Get Started**, select the **Sign-in method** tab, and click **Google**.
3. Toggle to **Enable**, choose a project support email, and click **Save**.
4. Go to **Settings** (Authentication) -> **Authorized domains**. Verify that `localhost` is listed.

### Step 3: Create Firestore Database
1. In the left navigation, click **Firestore Database** and then click **Create Database**.
2. Select a location and start in **Test mode** (which allows reads/writes for testing). Click **Create**.
3. *(Optional)* Secure rules can be set once ready:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/tasks/{taskId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

### Step 4: Add Web App Configuration
1. Go to **Project Settings** (gear icon next to Project Overview).
2. Scroll down to the *Your apps* section and click the **Web icon (</>)**.
3. Register your app (e.g. "Aura Dashboard").
4. Copy the `firebaseConfig` object properties. You can either:
   - **Method A:** Paste the configuration details directly into the **Firebase Setup Wizard** UI when you launch Aura in your browser.
   - **Method B:** Modify the properties directly in your local [firebase-config.js](file:///c:/Users/sanja/Downloads/ProductivityApp/firebase-config.js):
     ```javascript
     const defaultFirebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

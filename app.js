// app.js
console.log("Main script has started loading...");
import {
  isInitialized,
  loginWithGoogle,
  logoutUser,
  auth,
  db,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  saveConfig,
  clearConfig
} from "./firebase-config.js";
console.log(isInitialized);
// 2. MOVE THIS VARIABLE HERE (Top of the file)
let userStorageKey = "aura_tasks_fallback"; // Or whatever its initial value is!

// 3. The rest of your global variables
let tasks = [];
let currentUser = null;

// DOM Elements
const loadingScreen = document.getElementById("loading-screen");
const setupWizard = document.getElementById("setup-wizard");

// Wizard Elements
const configForm = document.getElementById("config-form");
const configPaste = document.getElementById("config-paste");
const apiKeyInput = document.getElementById("api-key-input");
const authDomainInput = document.getElementById("auth-domain-input");
const projectIdInput = document.getElementById("project-id-input");
const appIdInput = document.getElementById("app-id-input");

// Nav & Dashboard Header Elements
const userAvatar = document.getElementById("user-avatar");
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const btnGoogleLogin = document.getElementById("btn-google-login");
const btnLogout = document.getElementById("btn-logout");
const navClock = document.getElementById("nav-clock");
const syncStatus = document.getElementById("sync-status");
const dashboardGreeting = document.getElementById("dashboard-greeting");
const dashboardDate = document.getElementById("dashboard-date");

// Stats Elements
const statPending = document.getElementById("stat-pending");
const statCompleted = document.getElementById("stat-completed");

// Task Board Elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskPrioritySelect = document.getElementById("task-priority");
const taskDeadlineInput = document.getElementById("task-deadline");
const taskDurationInput = document.getElementById("task-duration");
const taskList = document.getElementById("task-list");
const filterTabs = document.querySelectorAll(".filter-tab");
const cloudSyncTag = document.getElementById("cloud-sync-tag");

// Timer Elements
const timerPanel = document.getElementById("timer-panel");
const timerClock = document.getElementById("timer-clock");
const timerStatusLabel = document.getElementById("timer-status-label");
const timerStart = document.getElementById("timer-start");
const timerPause = document.getElementById("timer-pause");
const timerReset = document.getElementById("timer-reset");
const timerModeTabs = document.querySelectorAll(".mode-tab");
const progressCircle = document.querySelector(".progress-ring-circle");
const focusQuote = document.getElementById("focus-quote");

// State Variables
let activeFilter = "all";
let useLocalStorageFallback = false;

// Pomodoro Timer State
let timerInterval = null;
let timerMode = "focus"; // focus or break
let timerDuration = 25 * 60; // default 25 mins
let timerTimeLeft = timerDuration;
let isTimerRunning = false;

const FOCUS_QUOTES = [
  "Focus is a muscle, and you are building it right now.",
  "Your mind is for having ideas, not holding them. Capture everything.",
  "Flow state is not forced; it is allowed when distractions are cleared.",
  "Deep work produces high-value results. Stay committed.",
  "One task at a time. The rest is noise.",
  "Do not stop when you are tired. Stop when you are done."
];

const BREAK_QUOTES = [
  "Rest is productive too. Take a breath.",
  "Disconnect for a moment to reconnect stronger.",
  "Stand up, stretch, and let your eyes rest.",
  "A quiet mind heals the body. Take this time for yourself.",
  "Hydrate. Refresh. Reset."
];

// --- 1. FIREBASE CONFIG WIZARD LOGIC ---

// Check if Firebase failed to initialize (e.g., if you ever clear the config)
//clearConfig(); // Uncomment this line to reset the config for testing purposes
if (!isInitialized) {
  loadingScreen.classList.remove("active");
  setupWizard.classList.add("active");

  configForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let configObject = null;

    const pasteVal = configPaste.value.trim();
    if (pasteVal) {
      try {
        const cleanJSON = pasteVal
          .replace(/^(const|let|var)\s+\w+\s*=\s*/, "")
          .replace(/;$/, "")
          .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
          .replace(/'/g, '"');

        configObject = JSON.parse(cleanJSON);
      } catch (err) {
        alert("Failed to parse the pasted config. Please ensure it's a valid JSON or configuration block.");
        console.error("JSON parse error:", err);
        return;
      }
    } else {
      const apiKey = apiKeyInput.value.trim();
      const authDomain = authDomainInput.value.trim();
      const projectId = projectIdInput.value.trim();
      const appId = appIdInput.value.trim();

      if (!apiKey || !authDomain || !projectId || !appId) {
        alert("Please fill in all the required configuration parameters.");
        return;
      }

      configObject = {
        apiKey,
        authDomain,
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId: "123456789",
        appId
      };
    }

    if (configObject && configObject.apiKey) {
      if (saveConfig(configObject)) {
        alert("Firebase credentials saved! The page will now reload to apply changes.");
        window.location.reload();
      } else {
        alert("The configuration appears to be invalid.");
      }
    }
  });
} else {
  console.log("--- DEBUGGING WORKSPACE ---");
  console.log("Firebase initialized successfully. Forcing login screen...");

  // 1. Force hide the loader and wizard by rewriting their CSS directly
  if (typeof loadingScreen !== 'undefined' && loadingScreen) {
    loadingScreen.style.setProperty("display", "none", "important");
    console.log("Forced loading screen to hide.");
  }
  if (typeof setupWizard !== 'undefined' && setupWizard) {
    setupWizard.style.setProperty("display", "none", "important");
    console.log("Forced setup wizard to hide.");
  }

  // 2. Find your login container instead of the dashboard
  // TODO: Verify in your index.html if your login section ID is "login-screen" or "auth-container"
  const loginContainer = document.getElementById("login-screen") || document.getElementById("auth-container");

  if (loginContainer) {
    // Force the login layout to be visible on the screen
    //loginContainer.style.setProperty("display", "block", "important");
    //loginContainer.style.setProperty("visibility", "visible", "important");
    //loginContainer.style.setProperty("opacity", "1", "important");
    console.log("Login container found and forced visible!");
  } else {
    console.error("CRITICAL: Could not find your login screen element in the HTML. Check your ID selection!");
  }

  // 3. Removed syncTasks() from here!
  // We do not want to sync tasks yet because the user hasn't logged in. 
  // Your onAuthStateChanged listener will trigger syncTasks() automatically after a successful Google login.
}

// --- 2. AUTHENTICATION & ROUTING LIFE CYCLE ---

if (isInitialized) {
  // Bind Login
  btnGoogleLogin.addEventListener("click", async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  });

  // Bind Logout
  btnLogout.addEventListener("click", async () => {
    if (confirm("Are you sure you want to sign out?")) {
      try {
        await logoutUser();
        // Clear locally loaded tasks
        tasks = [];
        renderTasks();
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  });

  // Listen for Auth State
  // At the very top of your execution code or right inside onAuthStateChanged:
  onAuthStateChanged(auth, async (user) => {

    if (user) {
      //===LOGGED IN===
      currentUser = user;
      const userNameElement = document.getElementById("user-name");
      const userEmailElement = document.getElementById("user-email");
      const avatar = document.getElementById("user-avatar");
      avatar.src = user.photoURL || "default-avatar.png";
      if (userNameElement) {
        userNameElement.textContent = user.displayName || "User";
      }

      if (userEmailElement) {
        userEmailElement.textContent = user.email || "";
      }
      const dashboardScreen = document.getElementById("dashboard-screen");
      const loginScreen =
        document.getElementById("login-screen") ||
        document.getElementById("auth-container");

      if (dashboardScreen) {
        dashboardScreen.style.removeProperty("display");
        dashboardScreen.classList.add("active");
      }
      console.log("style:", loginScreen.style.cssText);
      if (loginScreen) {
        loginScreen.style.removeProperty("display");
        loginScreen.style.removeProperty("visibility");
        loginScreen.style.removeProperty("opacity");

        loginScreen.classList.remove("active");
      }

      await syncTasks();
    } else {
      currentUser = null;

      const dashboardScreen = document.getElementById("dashboard-screen");
      const loginScreen =
        document.getElementById("login-screen") ||
        document.getElementById("auth-container");

      if (dashboardScreen) {
        dashboardScreen.classList.remove("active");
      }
      if (loginScreen) {
        loginScreen.style.removeProperty("display");
        loginScreen.style.removeProperty("visibility");
        loginScreen.style.removeProperty("opacity");

        loginScreen.classList.add("active");
      }
    }
  });

  function showLogin() {
    dashboardGreeting.classList.remove("active");
    setupWizard.classList.remove("active");
    loadingScreen.classList.add("active");
  }

  function showDashboard(user) {
    loadingScreen.classList.remove("active");
    setupWizard.classList.remove("active");
    dashboardGreeting.classList.add("active");

    // Load profile details
    userAvatar.src = user.photoURL || "https://lh3.googleusercontent.com/a/default-user=s120-c";
    userName.textContent = user.displayName || "Aura User";
    userEmail.textContent = user.email || "";

    updateDateAndGreeting();
  }

  // Setup fallback local storage based on UID
  function setupLocalStorageFallback(uid) {
    userStorageKey = `aura_tasks_${uid}`;
  }

  // --- 3. DIGITAL CLOCK & DYNAMIC GREETING ---

  function updateClock() {
    const now = new Date();
    let hrs = now.getHours();
    let mins = now.getMinutes();
    let secs = now.getSeconds();

    hrs = hrs < 10 ? "0" + hrs : hrs;
    mins = mins < 10 ? "0" + mins : mins;
    secs = secs < 10 ? "0" + secs : secs;

    navClock.textContent = `${hrs}:${mins}:${secs}`;
  }

  function updateDateAndGreeting() {
    if (!currentUser) return;

    const now = new Date();

    // Format Date: Wednesday, June 24, 2026
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dashboardDate.textContent = now.toLocaleDateString('en-US', options);

    // Greeting
    const hour = now.getHours();
    const firstName = currentUser.displayName ? currentUser.displayName.split(" ")[0] : "Focuser";
    let greeting = "Welcome";

    if (hour >= 5 && hour < 12) {
      greeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon";
    } else if (hour >= 17 && hour < 22) {
      greeting = "Good evening";
    } else {
      greeting = "Late night focus";
    }

    dashboardGreeting.textContent = `${greeting}, ${firstName}`;
  }

  // Update clock every second
  setInterval(updateClock, 1000);
  updateClock();

  // Update greeting/date every minute
  setInterval(updateDateAndGreeting, 60000);

  // --- 4. CLOUD SYNC & TASK BOARD LOGIC ---

  function setSyncState(state) {
    syncStatus.className = "sync-indicator tool-tip";

    if (state === "synced") {
      syncStatus.classList.add("synced");
      syncStatus.setAttribute("data-tooltip", "Cloud Synced");
      cloudSyncTag.textContent = useLocalStorageFallback ? "Local Fallback" : "Cloud Synced";
      if (useLocalStorageFallback) {
        cloudSyncTag.style.background = "rgba(255, 107, 74, 0.1)";
        cloudSyncTag.style.color = "var(--accent-orange)";
        cloudSyncTag.style.borderColor = "rgba(255, 107, 74, 0.2)";
      } else {
        cloudSyncTag.style.background = "rgba(16, 185, 129, 0.1)";
        cloudSyncTag.style.color = "var(--accent-teal)";
        cloudSyncTag.style.borderColor = "rgba(16, 185, 129, 0.2)";
      }
    } else if (state === "syncing") {
      syncStatus.classList.add("syncing");
      syncStatus.setAttribute("data-tooltip", "Syncing workspace...");
      cloudSyncTag.textContent = "Syncing...";
    } else if (state === "error") {
      syncStatus.setAttribute("data-tooltip", "Sync Error (Offline)");
      cloudSyncTag.textContent = "Sync Failed";
      cloudSyncTag.style.background = "rgba(255, 107, 74, 0.1)";
      cloudSyncTag.style.color = "var(--accent-orange)";
      cloudSyncTag.style.borderColor = "rgba(255, 107, 74, 0.2)";
    }
  }

  // Load tasks from database (Firestore or LocalStorage)
  // Add the async function declaration at the top
  async function syncTasks() {
    // Ensure we actually have a logged-in user before querying Firestore
    if (!currentUser) {
      console.warn("No user logged in. Defaulting to LocalStorage.");
      useLocalStorageFallback = true;
      loadLocalTasks();
      setSyncState("synced");
      return;
    }

    try {
      // 1. Target the specific user's tasks subcollection
      const q = query(
        collection(db, "users", currentUser.uid, "tasks"),
        orderBy("createdAt", "desc")
      );

      // 2. Fetch documents from Firestore
      const querySnapshot = await getDocs(q);
      tasks = [];

      // 3. Parse and populate the local array
      querySnapshot.forEach((docSnap) => {
        tasks.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 4. Update UI states
      useLocalStorageFallback = false; // Reset fallback if Firestore succeeds
      renderTasks();
      setSyncState("synced");
      console.log("Successfully synced tasks with Firestore!");

    } catch (err) {
      // 5. Catch permission/network errors here and use LocalStorage safely
      console.warn("Firestore sync failed, falling back to LocalStorage:", err);
      useLocalStorageFallback = true;
      loadLocalTasks();
      setSyncState("synced");
    }
  }

  function loadLocalTasks() {
    const localData = localStorage.getItem(userStorageKey);
    if (localData) {
      try {
        tasks = JSON.parse(localData);
      } catch (e) {
        console.error("Local data parse error:", e);
        tasks = [];
      }
    } else {
      tasks = [];
    }
    renderTasks();
  }

  function saveLocalTasks() {
    localStorage.setItem(userStorageKey, JSON.stringify(tasks));
  }

  // Render task list in UI
  function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
      if (activeFilter === "active") return !task.completed;
      if (activeFilter === "completed") return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "task-item-empty";

      let emoji = "📝";
      let text = "Your workspace is clear. Add a task to start!";
      if (activeFilter === "active") {
        emoji = "✓";
        text = "All clear! No pending tasks.";
      } else if (activeFilter === "completed") {
        emoji = "⏳";
        text = "No completed tasks yet. Keep moving!";
      }

      emptyLi.innerHTML = `
      <span class="empty-emoji">${emoji}</span>
      <p>${text}</p>
    `;
      taskList.appendChild(emptyLi);
    } else {
      filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.setAttribute("data-id", task.id);

        li.innerHTML = `
        <div class="task-item-content">
          <div class="checkbox-custom"></div>
          <div class="task-details-wrapper">
            <span class="task-text">${escapeHtml(task.title)}</span>
            <div class="task-meta-tags">
                <span class="meta-tag priority-${task.priority || 'medium'}">
                  ${capitalize(task.priority || 'medium')}
                </span>

                ${task.deadline ? `
                  <span class="meta-tag tag-deadline ${isOverdue(task.deadline) ? 'overdue' : ''}">
                    📅 ${formatDate(task.deadline)}
                  </span>` : ''}

                ${task.duration ? `
                  <span class="meta-tag tag-duration">
                    ⏱️ ${formatDuration(task.duration)}
                  </span>` : ''}

                <!-- NEW: Google Calendar Button -->
                <button class="calendar-btn" title="Add to Google Calendar">
                  🗓 Add
                </button>
            </div>
          </div>
        </div>
        <button class="btn-delete" title="Delete Task">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;

        // Bind dynamic events to the rendered elements
        li.querySelector(".checkbox-custom").addEventListener("click", () => toggleTask(task.id));
        li.querySelector(".btn-delete").addEventListener("click", () => deleteTask(task.id));
        li.querySelector(".calendar-btn").addEventListener("click", () => {
          addToGoogleCalendar(task);
        });
        taskList.appendChild(li);
      });
    }

    updateStats();
  }

  function updateStats() {
    const pendingCount = tasks.filter(t => !t.completed).length;
    const completedCount = tasks.filter(t => t.completed).length;

    statPending.textContent = pendingCount;
    statCompleted.textContent = completedCount;
  }

  // Add task submit
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const priority = taskPrioritySelect.value || "medium";
    const deadline = taskDeadlineInput.value || null;
    const duration = taskDurationInput.value ? parseInt(taskDurationInput.value, 10) : null;

    // Clear inputs
    taskInput.value = "";
    taskPrioritySelect.value = "medium";
    taskDeadlineInput.value = "";
    taskDurationInput.value = "";

    setSyncState("syncing");

    const taskId = "task_" + Date.now();
    const newTask = {
      title: text,
      completed: false,
      priority: priority,
      deadline: deadline,
      duration: duration,
      createdAt: Date.now()
    };

    // Optimistic UI updates
    tasks.unshift({ id: taskId, ...newTask });
    renderTasks();

    if (useLocalStorageFallback) {
      saveLocalTasks();
      setSyncState("synced");
    } else {
      try {
        await setDoc(doc(db, "users", currentUser.uid, "tasks", taskId), newTask);
        setSyncState("synced");
      } catch (err) {
        console.error("Firestore add failed, falling back to local:", err);
        // Even if Firestore fails, local sync is preserved
        saveLocalTasks();
        setSyncState("synced");
      }
    }
  });

  // Toggle complete task state
  async function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const newStatus = !tasks[taskIndex].completed;
    tasks[taskIndex].completed = newStatus;
    renderTasks(); // update UI immediately

    setSyncState("syncing");

    if (useLocalStorageFallback) {
      saveLocalTasks();
      setSyncState("synced");
    } else {
      try {
        await updateDoc(doc(db, "users", currentUser.uid, "tasks", taskId), {
          completed: newStatus
        });
        setSyncState("synced");
      } catch (err) {
        console.error("Firestore toggle failed:", err);
        saveLocalTasks();
        setSyncState("synced");
      }
    }
  }

  // Delete task
  async function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();

    setSyncState("syncing");

    if (useLocalStorageFallback) {
      saveLocalTasks();
      setSyncState("synced");
    } else {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid, "tasks", taskId));
        setSyncState("synced");
      } catch (err) {
        console.error("Firestore delete failed:", err);
        saveLocalTasks();
        setSyncState("synced");
      }
    }
  }

  // Filter Navigation triggers
  filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      filterTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeFilter = tab.getAttribute("data-filter");
      renderTasks();
    });
  });

  // Utility: HTML Escaper
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  function addToGoogleCalendar(task) {
    const formatDate = (date) =>
      new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const start = task.deadline ? new Date(task.deadline) : new Date();
    const end = new Date(start.getTime() + (task.duration || 60) * 60000);

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(task.title)}` +
      `&details=${encodeURIComponent("From your Productivity App")}` +
      `&dates=${formatDate(start)}/${formatDate(end)}`;

    window.open(url, "_blank");
  }

  // --- 5. FOCUS POMODORO TIMER ENGINE ---

  // Progress Ring Configuration
  // Circumference calculation: 2 * Math.PI * radius (116) = ~728.8
  const circleCircumference = 728.84;
  progressCircle.style.strokeDasharray = `${circleCircumference} ${circleCircumference}`;
  progressCircle.style.strokeDashoffset = 0;

  function setProgress(percent) {
    const offset = circleCircumference - (percent / 100) * circleCircumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerTimeLeft / 60);
    const secs = timerTimeLeft % 60;

    timerClock.textContent = `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;

    // Update progress ring offset
    const percent = (timerTimeLeft / timerDuration) * 100;
    setProgress(percent);
  }

  function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    timerStart.classList.add("hidden");
    timerPause.classList.remove("hidden");
    timerPanel.classList.remove("pulsing-alert");

    timerInterval = setInterval(() => {
      timerTimeLeft--;
      updateTimerDisplay();

      if (timerTimeLeft <= 0) {
        clearInterval(timerInterval);
        handleTimerCompletion();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;

    isTimerRunning = false;
    clearInterval(timerInterval);
    timerPause.classList.add("hidden");
    timerStart.classList.remove("hidden");
  }

  function resetTimer() {
    pauseTimer();
    timerTimeLeft = timerDuration;
    timerPanel.classList.remove("pulsing-alert");
    updateTimerDisplay();
  }

  function handleTimerCompletion() {
    isTimerRunning = false;
    timerPause.classList.add("hidden");
    timerStart.classList.remove("hidden");
    timerPanel.classList.add("pulsing-alert");

    timerStatusLabel.textContent = timerMode === "focus" ? "FOCUS BLOCK OVER" : "BREAK COMPLETED";
    focusQuote.textContent = timerMode === "focus" ?
      "Incredible job! Take a well-earned break." :
      "Break is over. Ready to step back in?";
  }

  // Modes switching listener
  timerModeTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      if (isTimerRunning) {
        if (!confirm("Your timer is active. Changing modes will reset it. Proceed?")) {
          return;
        }
      }

      timerModeTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      timerMode = tab.getAttribute("data-mode");

      if (timerMode === "focus") {
        timerDuration = 25 * 60;
        timerStatusLabel.textContent = "STAY FOCUSED";
        // Pick random quote
        focusQuote.textContent = `"${FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]}"`;
        document.documentElement.style.setProperty("--accent-gradient-start", "var(--accent-purple)");
        document.documentElement.style.setProperty("--accent-gradient-end", "var(--accent-orange)");
      } else {
        timerDuration = 5 * 60;
        timerStatusLabel.textContent = "REST & RECHARGE";
        focusQuote.textContent = `"${BREAK_QUOTES[Math.floor(Math.random() * BREAK_QUOTES.length)]}"`;
        document.documentElement.style.setProperty("--accent-gradient-start", "var(--accent-teal)");
        document.documentElement.style.setProperty("--accent-gradient-end", "var(--accent-purple)");
      }

      resetTimer();
    });
  });

  timerStart.addEventListener("click", startTimer);
  timerPause.addEventListener("click", pauseTimer);
  timerReset.addEventListener("click", resetTimer);

  // Initial Timer Trigger
  resetTimer();

  // Helper formatting functions for tasks
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  function formatDuration(minutes) {
    if (!minutes) return "";
    const mins = parseInt(minutes, 10);
    if (isNaN(mins)) return minutes;

    if (mins < 60) {
      return `${mins}m`;
    }

    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  }

  function isOverdue(dateStr) {
    if (!dateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);

    return deadline < today;
  }
}

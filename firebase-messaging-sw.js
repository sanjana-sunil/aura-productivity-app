importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCi79aoLrNP9lhGbxfIi_ktXFyBvJ9GI0E",
    authDomain: "aura-4dc17.firebaseapp.com",
    projectId: "aura-4dc17",
    storageBucket: "aura-4dc17.firebasestorage.app",
    messagingSenderId: "1040677060422",
    appId: "1:1040677060422:web:6dafd19492f56e0b9b2f47",
    measurementId: "G-8N20E2ZRY3"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
    });
});
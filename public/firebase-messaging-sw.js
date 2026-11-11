importScripts(
  "https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js"
);

// Must be initializeApp, not a bare config object: firebase.messaging() below
// reads the default app, and without this call it throws during script
// evaluation — which fails the whole service worker registration.
firebase.initializeApp({
  apiKey: "AIzaSyC4X81-HpgrbDOBq9Mn7CcHctxK8d5AoH0",
  authDomain: "makkalstarmart.firebaseapp.com",
  projectId: "makkalstarmart",
  storageBucket: "makkalstarmart.firebasestorage.app",
  messagingSenderId: "947085968127",
  appId: "1:947085968127:web:4b630776b031f8003f02ca",
  measurementId: "G-DKCP5RJB2B",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

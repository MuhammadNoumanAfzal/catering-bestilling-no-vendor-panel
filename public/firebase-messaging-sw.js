/* Replace every REPLACE_WITH_* value with the matching Firebase Web App value. */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyC0nSefWk104Heye0QG8ZPD8JBXuo4U-Qs",
  authDomain: "gocatering-15975.firebaseapp.com",
  projectId: "gocatering-15975",
  storageBucket: "gocatering-15975.firebasestorage.app",
  messagingSenderId: "50523593556",
  appId: "1:50523593556:web:9c1092f74a8654edce46c1",
};

if (!Object.values(firebaseConfig).some((value) => value.startsWith("REPLACE_WITH_"))) {
  firebase.initializeApp(firebaseConfig);
}

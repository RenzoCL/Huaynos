// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBu1KKK7YJsXoHbNNUXLBhV54b1UIS8OEw",
  authDomain: "huaynos-6e527.firebaseapp.com",
  projectId: "huaynos-6e527",
  storageBucket: "huaynos-6e527.firebasestorage.app",
  messagingSenderId: "374495999469",
  appId: "1:374495999469:web:54dc33730a53f33e2a63e4"
};

const app = initializeApp(firebaseConfig);

// ✅ EXPORTS CORRECTOS
export const auth = getAuth(app);
export const db = getFirestore(app);

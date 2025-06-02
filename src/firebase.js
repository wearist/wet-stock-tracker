// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCbYlWmYHkXaFPMfzKQI2dOjs_8LQdQBeU",
  authDomain: "food-stock-tracker.firebaseapp.com",
  databaseURL: "https://food-stock-tracker-default-rtdb.firebaseio.com",
  projectId: "food-stock-tracker",
  storageBucket: "food-stock-tracker.firebasestorage.app",
  messagingSenderId: "205398790318",
  appId: "1:205398790318:web:17d591f42bb7be734add3f"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

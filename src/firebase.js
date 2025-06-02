// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore import

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVxhfD4gJ1Km6a1F7i-fcD1oZ3ll9gCXw",
  authDomain: "wet-stock-take.firebaseapp.com",
  projectId: "wet-stock-take",
  storageBucket: "wet-stock-take.firebasestorage.app",
  messagingSenderId: "690885848482",
  appId: "1:690885848482:web:13df310452558f7e8696fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
export const db = getFirestore(app);

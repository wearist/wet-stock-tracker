// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVxhfD4gJ1Km6a1F7i-fcD1oZ3ll9gCXw",
  authDomain: "wet-stock-take.firebaseapp.com",
  projectId: "wet-stock-take",
  storageBucket: "wet-stock-take.appspot.com",
  messagingSenderId: "690885848482",
  appId: "1:690885848482:web:13df310452558f7e8696fb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

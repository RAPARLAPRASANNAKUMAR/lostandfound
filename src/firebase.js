// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbl1OoPAi0eQRCdIZfoR5BpN8mXdPAwrY",
  authDomain: "lostandfound-7f15c.firebaseapp.com",
  projectId: "lostandfound-7f15c",
  storageBucket: "lostandfound-7f15c.appspot.com",
  messagingSenderId: "74193955533",
  appId: "1:74193955533:web:d4ffc32d96c02cabb2d784",
  measurementId: "G-6WKWZ8XL9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get references to the services we need
export const auth = getAuth(app); // Ensure this is included
export const db = getFirestore(app);
const storage = getStorage(app);

// Export the services so other files in your app can use them
export { storage }; // Remove db from here if it's already exported
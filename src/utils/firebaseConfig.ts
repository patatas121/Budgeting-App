import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXU1mYDusQ-0ukGZjzwNgw9newhMLxUyE",
  authDomain: "budget-6b353.firebaseapp.com",
  projectId: "budget-6b353",
  storageBucket: "budget-6b353.firebasestorage.app",
  messagingSenderId: "862913696653",
  appId: "1:862913696653:web:6fd5ea779f6026c58063c4",
  measurementId: "G-8GXH6R3BVY"
};

// Initialize Firebase only if it hasn't been initialized
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();

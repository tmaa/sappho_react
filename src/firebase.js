import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDe8Wxx-CukPkzRgKRuhBuX57FVxfYXRKY",
  authDomain: "sappho-b8699.firebaseapp.com",
  projectId: "sappho-b8699",
  storageBucket: "sappho-b8699.appspot.com",
  messagingSenderId: "342299752210",
  appId: "1:342299752210:web:48bba7a1567e0ee5b865cb",
  measurementId: "G-NX3VJ0CF7E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

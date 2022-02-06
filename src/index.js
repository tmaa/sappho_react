import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDe8Wxx-CukPkzRgKRuhBuX57FVxfYXRKY",
  authDomain: "sappho-b8699.firebaseapp.com",
  projectId: "sappho-b8699",
  storageBucket: "sappho-b8699.appspot.com",
  messagingSenderId: "342299752210",
  appId: "1:342299752210:web:48bba7a1567e0ee5b865cb",
  measurementId: "G-NX3VJ0CF7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

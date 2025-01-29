import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyAW3nT7ZehlOQur7CG5v1OCVXY3ZaOYY64",
//     authDomain: "ace-hackathon-24596.firebaseapp.com",
//     projectId: "ace-hackathon-24596",
//     storageBucket: "ace-hackathon-24596.firebasestorage.app",
//     messagingSenderId: "1074669375910",
//     appId: "1:1074669375910:web:813a9cf6b92b621c4a3f67"
// };

const firebaseConfig = {
    apiKey: "AIzaSyCTmHOBPzUtZwfhRRT5MAv89CSl30XpTaw",
    authDomain: "lmt-hackathon.firebaseapp.com",
    projectId: "lmt-hackathon",
    storageBucket: "lmt-hackathon.firebasestorage.app",
    messagingSenderId: "78310189891",
    appId: "1:78310189891:web:bfbca618ecf5d0f0841df6"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize and export Auth and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
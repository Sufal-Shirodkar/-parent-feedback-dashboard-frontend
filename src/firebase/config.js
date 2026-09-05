import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBRH3_nKV9fIr4yPfe3qVI2AuNOb2SIrg",
  authDomain: "parent-feedback-dashboard.firebaseapp.com",
  projectId: "parent-feedback-dashboard",
  storageBucket: "parent-feedback-dashboard.firebasestorage.app",
  messagingSenderId: "481861542403",
  appId: "1:481861542403:web:cc97cb7dff7d7b0a6d6436",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});
export const db = getFirestore(app);

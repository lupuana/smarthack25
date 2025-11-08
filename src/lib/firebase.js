import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSp3ffDijy6QhJTMgtUFXWS2k9LmVxTds",
  authDomain: "myapplication-ca891f4e.firebaseapp.com",
  projectId: "myapplication-ca891f4e",
  storageBucket: "myapplication-ca891f4e.firebasestorage.app",
  messagingSenderId: "920389699122",
  appId: "1:920389699122:web:cb68ddbf142cf7766d5e2b"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

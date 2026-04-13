import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVYO5_wLVgyx9piAUi4ObTiyASUXbSj4E",
  authDomain: "imposter-d9819.firebaseapp.com",
  databaseURL: "https://imposter-d9819-default-rtdb.firebaseio.com",
  projectId: "imposter-d9819",
  storageBucket: "imposter-d9819.firebasestorage.app",
  messagingSenderId: "94755133055",
  appId: "1:94755133055:web:a3fd1e18bf93bde1cc114a"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
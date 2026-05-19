import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdSOmpA8MQjvhFAyUQDVBsK9cp8m_sJ0M",
  authDomain: "card-game-84175.firebaseapp.com",
  projectId: "card-game-84175",
  storageBucket: "card-game-84175.appspot.com",
  messagingSenderId: "890186103813",
  appId: "1:890186103813:web:3fa1b9e95c657a7ef4306c"
};

// ✅ Prevent multiple Firebase instances (safe singleton)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ⚡ Lazy initialization wrapper (slightly improves initial load)
export const auth = getAuth(app);
export const db = getFirestore(app);

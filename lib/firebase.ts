import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBdSOmpA8MQjvhFAyUQDVBsK9cp8m_sJ0M",
  authDomain: "card-game-84175.firebaseapp.com",
  projectId: "card-game-84175",
  storageBucket: "card-game-84175.firebasestorage.app",
  messagingSenderId: "890186103813",
  appId: "1:890186103813:web:3fa1b9e95c657a7ef4306c"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// 直接存取 import.meta.env.VARIABLE 以確保 Vite 能進行靜態替換 (Static Replacement)。
// 使用 @ts-ignore 忽略 TypeScript 可能報出的型別錯誤，確保建置順利。

const firebaseConfig = {
  // @ts-ignore
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // @ts-ignore
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // @ts-ignore
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // @ts-ignore
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  // @ts-ignore
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  // @ts-ignore
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase (Compat/v8)
// Check if already initialized to prevent errors in hot-reload environments
const app = !firebase.apps.length 
  ? firebase.initializeApp(firebaseConfig) 
  : firebase.app();

export const auth = app.auth();
export const db = app.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
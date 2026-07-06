import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA4IiSUt-Ztjtl_m163LpJLVijwJcv2ZJ4',
  authDomain: 'expense-tracker-3d565.firebaseapp.com',
  projectId: 'expense-tracker-3d565',
  storageBucket: 'expense-tracker-3d565.firebasestorage.app',
  messagingSenderId: '786275919461',
  appId: '1:786275919461:web:3d764c92ae5f0c1f0c088c',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

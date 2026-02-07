import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD7z0AWyy2fHkxvGclYlqgxmIgV4d3gUBA",
  authDomain: "hobbyit-7e303.firebaseapp.com",
  databaseURL: "https://hobbyit-7e303-default-rtdb.firebaseio.com",
  projectId: "hobbyit-7e303",
  storageBucket: "hobbyit-7e303.firebasestorage.app",
  messagingSenderId: "280761823615",
  appId: "1:280761823615:web:2a4aa127ddc5f8cdf42a4a",
  measurementId: "G-8NEE9BE20Y"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);

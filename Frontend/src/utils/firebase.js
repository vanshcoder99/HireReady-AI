import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "hireready-ai-bce32.firebaseapp.com",
  projectId: "hireready-ai-bce32",
  storageBucket: "hireready-ai-bce32.firebasestorage.app",
  messagingSenderId: "75501020197",
  appId: "1:75501020197:web:92e520501bc34a02394bcc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth, provider}
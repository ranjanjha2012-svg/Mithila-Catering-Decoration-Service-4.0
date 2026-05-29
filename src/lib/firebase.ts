import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCGiYhVhkfLu7_YAqy02K5P9O1vvriLUfA",
  authDomain: "mithila-catering.firebaseapp.com",
  projectId: "mithila-catering",
  storageBucket: "mithila-catering.firebasestorage.app",
  messagingSenderId: "124823748394",
  appId: "1:124823748394:web:1fb7674865c60726f76853",
  measurementId: "G-G61G1L629Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

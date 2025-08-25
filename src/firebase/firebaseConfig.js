// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOoYFdpIXO3xTSEgBOFWQdnaHsHBnJ6-s",
  authDomain: "restauron-dc2b8.firebaseapp.com",
  projectId: "restauron-dc2b8",
  storageBucket: "restauron-dc2b8.firebasestorage.app",
  messagingSenderId: "972089682288",
  appId: "1:972089682288:web:5785308a2551fbde4b87b5",
  measurementId: "G-CHW8EF4Q9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const imageStorage = getStorage(app);
export default imageStorage;
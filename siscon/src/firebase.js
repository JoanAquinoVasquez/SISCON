// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBsbiWpwdJpBjILlhmlOJr-N76iGaC_Xqg",
    authDomain: "siscon-7053e.firebaseapp.com",
    projectId: "siscon-7053e",
    storageBucket: "siscon-7053e.firebasestorage.app",
    messagingSenderId: "166292370750",
    appId: "1:166292370750:web:06e8c704cbf3697ab0686f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Exportar la autenticación y el proveedor de Google
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
import { initializeApp } from "firebase/app";
// 👉 لاحظ أننا أضفنا FacebookAuthProvider هنا
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCz5csiRhw8tzDSBQPYOzL81WevmiVJjyw",
    authDomain: "booking-project-112e2.firebaseapp.com",
    projectId: "booking-project-112e2",
    storageBucket: "booking-project-112e2.firebasestorage.app",
    messagingSenderId: "441098551260",
    appId: "1:441098551260:web:099e61fa2aad10ea771919"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider(); // 👉 مزود فيسبوك الجديد

// دالة الدخول عبر جوجل
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user };
    } catch (error) {
        console.error("Erreur Google :", error);
        throw error;
    }
}

// 👉 دالة الدخول عبر فيسبوك (الجديدة)
export async function signInWithFacebook() {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        return { user: result.user };
    } catch (error) {
        console.error("Erreur Facebook :", error);
        throw error;
    }
}

export async function firebaseSignOut() {
    await signOut(auth);
}
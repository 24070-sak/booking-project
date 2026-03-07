import { apiFetch } from "./apiClient";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    return {
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
        avatar: user.photoURL || null,
        access_dashboard: false
      },
      access_token: token
    };
  } catch (error) {
    console.error("Erreur de connexion Firebase :", error);
    throw new Error("Identifiants incorrects");
  }
}

export async function register(userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
    const user = userCredential.user;
    const token = await user.getIdToken();

    return {
      user: {
        id: user.uid,
        email: user.email,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || email.split("@")[0],
        avatar: null,
        access_dashboard: false
      },
      access_token: token
    };
  } catch (error) {
    console.error("Erreur d'inscription Firebase :", error);
    throw new Error("Erreur lors de l'inscription");
  }
}

export async function updateProfile(userData) {
  const isFormData = userData instanceof FormData;

  const response = await apiFetch("/auth/profile", {
    method: "PUT",
    body: isFormData ? userData : JSON.stringify(userData)
  });

  if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
  return response.json();
}

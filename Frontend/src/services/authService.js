import { apiFetch } from "./apiClient";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset
} from "firebase/auth";

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Call backend to get JWT and user Profile
    const response = await apiFetch("/auth/firebase-login", {
      method: "POST",
      body: JSON.stringify({ email: user.email, firebase_uid: user.uid })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Identifiants incorrects sur le serveur");
    }

    return await response.json();
  } catch (error) {
    if (error.code) { // Firebase errors
      console.error("Erreur de connexion Firebase :", error);
      throw new Error("Identifiants incorrects");
    }
    console.error("Erreur de connexion :", error);
    throw error;
  }
}

export async function register(userData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
    const user = userCredential.user;

    const response = await apiFetch("/auth/firebase-register", {
      method: "POST",
      body: JSON.stringify({
        email: user.email,
        firebase_uid: user.uid,
        first_name: userData.firstName || userData.first_name,
        last_name: userData.lastName || userData.last_name,
        phone: userData.phone
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur lors de l'inscription sur le serveur");
    }

    return await response.json();
  } catch (error) {
    if (error.code) {
      console.error("Erreur d'inscription Firebase :", error);
      throw new Error("Erreur lors de l'inscription sur Firebase");
    }
    console.error("Erreur d'inscription :", error);
    throw error;
  }
}

export async function socialLoginSync(firebaseUser) {
  try {
    const response = await apiFetch("/auth/firebase-login", {
      method: "POST",
      body: JSON.stringify({
        email: firebaseUser.email,
        firebase_uid: firebaseUser.uid,
        name: firebaseUser.displayName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur de synchronisation backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur de synchronisation :", error);
    throw error;
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

export async function resetPassword(email) {
  try {
    const actionCodeSettings = {
      // Firebase redirects the user HERE after they click the link in the email.
      // handleCodeInApp: true means our app handles the code directly.
      url: 'http://localhost:5173/reset-password',
      handleCodeInApp: true,
    };
    await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
    return { success: true };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new Error("L'utilisateur n'existe pas");
    }
    console.error("Erreur de réinitialisation Firebase :", error);
    throw new Error("Erreur lors de l'envoi du lien de réinitialisation");
  }
}

export async function confirmNewPassword(oobCode, newPassword) {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return { success: true };
  } catch (error) {
    console.error("Erreur de modification du mot de passe :", error);
    throw new Error("Le lien est invalide ou a expiré.");
  }
}

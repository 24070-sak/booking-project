import { apiFetch } from "./apiClient";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
// Login — Firebase Auth + Backend JWT
// ─────────────────────────────────────────────────────────────────────────────
export async function login(email, password) {
  try {
    // 1. Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = userCredential.user;

    // 2. Sync with backend to get JWT token
    const response = await apiFetch("/auth/firebase-login", {
      method: "POST",
      body: JSON.stringify({ email: firebaseUser.email, firebase_uid: firebaseUser.uid }),
      skipRedirect: true
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Identifiants incorrects");
    }

    return await response.json();
  } catch (error) {
    if (error.code) {
      // Firebase-specific errors
      const firebaseErrors = {
        'auth/user-not-found': "Email inconnu",
        'auth/wrong-password': "Mot de passe incorrect",
        'auth/invalid-credential': "Identifiants incorrects",
        'auth/too-many-requests': "Trop de tentatives. Réessayez plus tard.",
        'auth/user-disabled': "Compte désactivé"
      };
      throw new Error(firebaseErrors[error.code] || "Erreur de connexion");
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Register — Firebase Auth + Backend Save
// ─────────────────────────────────────────────────────────────────────────────
export async function register(userData) {
  try {
    // 1. Create account in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email.trim(), userData.password);
    const firebaseUser = userCredential.user;

    // 2. Save to backend database
    const response = await apiFetch("/auth/firebase-register", {
      method: "POST",
      body: JSON.stringify({
        email: firebaseUser.email,
        firebase_uid: firebaseUser.uid,
        first_name: userData.firstName || userData.first_name,
        last_name: userData.lastName || userData.last_name,
        phone: userData.phone
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erreur lors de l'inscription");
    }

    return await response.json();
  } catch (error) {
    if (error.code) {
      const firebaseErrors = {
        'auth/email-already-in-use': "Cet email est déjà utilisé",
        'auth/invalid-email': "Email invalide",
        'auth/weak-password': "Mot de passe trop faible (min. 6 caractères)"
      };
      throw new Error(firebaseErrors[error.code] || "Erreur lors de l'inscription");
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Social Login (Google / Facebook) — Firebase + Backend Sync
// ─────────────────────────────────────────────────────────────────────────────
export async function socialLoginSync(firebaseUser) {
  try {
    // Parse display name
    const nameParts = (firebaseUser.displayName || "").split(" ");
    const first_name = nameParts[0] || firebaseUser.email.split("@")[0];
    const last_name = nameParts.slice(1).join(" ") || "";

    const response = await apiFetch("/auth/firebase-login", {
      method: "POST",
      body: JSON.stringify({
        email: firebaseUser.email,
        firebase_uid: firebaseUser.uid,
        first_name,
        last_name,
        profile_picture: firebaseUser.photoURL || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erreur de synchronisation backend");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur de synchronisation :", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Google Login — Dedicated endpoint (Firebase Google → Backend /api/auth/google)
// ─────────────────────────────────────────────────────────────────────────────
export async function googleLogin(firebaseUser) {
  try {
    const nameParts = (firebaseUser.displayName || "").split(" ");
    const response = await apiFetch("/auth/google", {
      method: "POST",
      body: JSON.stringify({
        google_id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        first_name: nameParts[0] || firebaseUser.email.split("@")[0],
        last_name: nameParts.slice(1).join(" ") || "",
        profile_picture: firebaseUser.photoURL || null
      }),
      skipRedirect: true
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erreur lors de la connexion Google");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur Google Login:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Update
// ─────────────────────────────────────────────────────────────────────────────
export async function updateProfile(userData) {
  const isFormData = userData instanceof FormData;
  const response = await apiFetch("/auth/profile", {
    method: "PUT",
    body: isFormData ? userData : JSON.stringify(userData)
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Email Verification (OTP)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendVerificationOtp(email) {
  const response = await apiFetch("/auth/send-verification", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de l'envoi du code");
  }
  return response.json();
}

export async function verifyEmail(email, token) {
  const response = await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), token: token }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Code de vérification incorrect ou expiré");
  }
  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Reset (via Backend OTP — not Firebase link)
// ─────────────────────────────────────────────────────────────────────────────
export async function forgotPassword(email) {
  const response = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim() }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur");
  }
  return response.json();
}

export async function resetPassword(email, token, newPassword) {
  const response = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), token: token, new_password: newPassword }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la réinitialisation du mot de passe");
  }
  return response.json();
}

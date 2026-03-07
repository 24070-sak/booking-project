import { apiFetch } from "./apiClient";

export async function login(email, password) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Identifiants incorrects");
  }
  return response.json();
}

export async function register(userData) {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ ...userData, email: userData.email.trim() }),
    skipRedirect: true
  });
  if (!response.ok) throw new Error("Erreur lors de l'inscription");
  return response.json();
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

export async function verifyEmail(email, otp) {
  const response = await apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Code de vérification incorrect ou expiré");
  }
  return response.json();
}

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

export async function resetPassword(email, otp, newPassword) {
  const response = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), otp: otp.trim(), new_password: newPassword }),
    skipRedirect: true
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Erreur lors de la réinitialisation du mot de passe");
  }
  return response.json();
}

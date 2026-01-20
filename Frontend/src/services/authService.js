import { apiFetch } from "./apiClient";

export async function login(email, password) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
    skipRedirect: true
  });
  if (!response.ok) throw new Error("Identifiants incorrects");
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
    // apiClient detects FormData and removes Content-Type, 
    // or defaults to application/json for JSON body
    body: isFormData ? userData : JSON.stringify(userData)
  });

  if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
  return response.json();
}

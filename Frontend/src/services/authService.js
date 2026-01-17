const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password })
  });
  if (!response.ok) throw new Error("Identifiants incorrects");
  return response.json();
}

export async function register(userData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...userData, email: userData.email.trim() })
  });
  if (!response.ok) throw new Error("Erreur lors de l'inscription");
  return response.json();
}

export async function updateProfile(userData) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");
  return response.json();
}

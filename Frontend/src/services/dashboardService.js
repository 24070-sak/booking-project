import { apiFetch } from "./apiClient";

export async function getDashboardStats() {
    const response = await apiFetch("/dashboard/stats");
    if (!response.ok) throw new Error("Erreur stats");
    return response.json();
}

export async function getPayments() {
    const response = await apiFetch("/payments");
    if (!response.ok) throw new Error("Erreur paiements");
    return response.json();
}

export async function getReviews() {
    const response = await apiFetch("/reviews");
    if (!response.ok) throw new Error("Erreur reviews");
    return response.json();
}

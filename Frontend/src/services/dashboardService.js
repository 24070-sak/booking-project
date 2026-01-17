const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getDashboardStats() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Erreur stats");
    return response.json();
}

export async function getPayments() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/payments`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Erreur paiements");
    return response.json();
}

export async function getReviews() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/reviews`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Erreur reviews");
    return response.json();
}

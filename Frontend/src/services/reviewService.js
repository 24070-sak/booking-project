const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getReviews() {
    const response = await fetch(`${API_URL}/reviews`);
    if (!response.ok) throw new Error("Erreur récupération avis");
    return response.json();
}

export async function getHotelReviews(hotelId) {
    const response = await fetch(`${API_URL}/reviews/hotel/${hotelId}`);
    if (!response.ok) throw new Error("Erreur récupération avis hôtel");
    return response.json();
}

export async function createReview(reviewData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur création avis");
    }
    return response.json();
}

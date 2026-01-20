import { apiFetch } from "./apiClient";

export async function getReviews() {
    const response = await apiFetch("/reviews");
    if (!response.ok) throw new Error("Erreur récupération avis");
    return response.json();
}

export async function getHotelReviews(hotelId) {
    const response = await apiFetch(`/reviews/hotel/${hotelId}`);
    if (!response.ok) throw new Error("Erreur récupération avis hôtel");
    return response.json();
}

export async function createReview(reviewData) {
    const response = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur création avis");
    }
    return response.json();
}

export async function replyToReview(reviewId, reply) {
    const response = await apiFetch(`/reviews/${reviewId}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la réponse");
    }
    return response.json();
}

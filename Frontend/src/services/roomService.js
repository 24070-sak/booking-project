import API_URL from "../api";

export async function getAllRooms(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_URL}/rooms?${queryParams}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les chambres");
    }

    return response.json();
}

export async function getRoomById(id) {
    const response = await fetch(`${API_URL}/rooms/${id}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de la chambre");
    }

    return response.json();
}

export async function getRoomReviews(id) {
    const response = await fetch(`${API_URL}/rooms/${id}/reviews`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les avis");
    }

    return response.json();
}

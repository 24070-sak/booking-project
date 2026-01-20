import { apiFetch } from "./apiClient";

export async function getAllRooms(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await apiFetch(`/rooms?${queryParams}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les chambres");
    }

    return response.json();
}

export async function getRoomById(id) {
    const response = await apiFetch(`/rooms/${id}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de la chambre");
    }

    return response.json();
}

export async function getRoomReviews(id) {
    const response = await apiFetch(`/rooms/${id}/reviews`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les avis");
    }

    return response.json();
}

export async function createRoom(roomData) {
    const response = await apiFetch("/rooms", {
        method: "POST",
        body: JSON.stringify(roomData)
    });

    if (!response.ok) {
        throw new Error("Impossible de créer la chambre");
    }

    return response.json();
}

export async function updateRoom(id, roomData) {
    const response = await apiFetch(`/rooms/${id}`, {
        method: "PUT",
        body: JSON.stringify(roomData)
    });

    if (!response.ok) {
        throw new Error("Impossible de mettre à jour la chambre");
    }

    return response.json();
}

export async function deleteRoom(id) {
    const response = await apiFetch(`/rooms/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Impossible de supprimer la chambre");
    }

    return response.json();
}

export async function getRoomTypes() {
    const response = await apiFetch("/rooms/types");
    if (!response.ok) throw new Error("Impossible de récupérer les types de chambres");
    return response.json();
}

export async function getAmenities() {
    const response = await apiFetch("/rooms/amenities");
    if (!response.ok) throw new Error("Impossible de récupérer les équipements");
    return response.json();
}

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

export async function createRoom(roomData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
    });

    if (!response.ok) {
        throw new Error("Impossible de créer la chambre");
    }

    return response.json();
}

export async function updateRoom(id, roomData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/rooms/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
    });

    if (!response.ok) {
        throw new Error("Impossible de mettre à jour la chambre");
    }

    return response.json();
}

export async function deleteRoom(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/rooms/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Impossible de supprimer la chambre");
    }

    return response.json();
}

export async function getRoomTypes() {
    const response = await fetch(`${API_URL}/rooms/types`);
    if (!response.ok) throw new Error("Impossible de récupérer les types de chambres");
    return response.json();
}

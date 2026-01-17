import API_URL from "../api";

export async function getAllHotels() {
    const response = await fetch(`${API_URL}/hotels`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les hôtels");
    }

    return response.json();
}

export async function getHotelById(id) {
    const response = await fetch(`${API_URL}/hotels/${id}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de l'hôtel");
    }

    return response.json();
}

export async function createHotel(hotelData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/hotels`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
        throw new Error("Impossible de créer l'hôtel");
    }

    return response.json();
}

export async function updateHotel(id, hotelData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/hotels/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
        throw new Error("Impossible de mettre à jour l'hôtel");
    }

    return response.json();
}

export async function deleteHotel(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/hotels/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Impossible de supprimer l'hôtel");
    }

    return response.json();
}

export async function getHotelRooms(id) {
    const response = await fetch(`${API_URL}/hotels/${id}/rooms`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les chambres de l'hôtel");
    }

    return response.json();
}

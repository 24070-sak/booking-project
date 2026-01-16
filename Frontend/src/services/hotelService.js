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

export async function getHotelRooms(id) {
    const response = await fetch(`${API_URL}/hotels/${id}/rooms`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les chambres de l'hôtel");
    }

    return response.json();
}

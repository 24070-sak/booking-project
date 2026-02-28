import { apiFetch } from "./apiClient";

export async function getAllHotels(limit = 100, offset = 0, search = '', guests = 0, check_in = '', check_out = '', min_price = null, max_price = null, location = '', min_rating = null) {
    const params = new URLSearchParams({
        limit,
        offset,
        search,
        guests
    });
    if (check_in) params.append('check_in', check_in);
    if (check_out) params.append('check_out', check_out);
    if (min_price !== null && min_price !== '') params.append('min_price', min_price);
    if (max_price !== null && max_price !== '') params.append('max_price', max_price);
    if (location) params.append('location', location);
    if (min_rating !== null && min_rating !== '') params.append('min_rating', min_rating);

    const response = await apiFetch(`/hotels?${params.toString()}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les hôtels");
    }

    return response.json();
}

export async function getMyHotels() {
    const response = await apiFetch("/hotels/my");

    if (!response.ok) {
        throw new Error("Impossible de récupérer vos hôtels");
    }

    return response.json();
}

export async function getHotelById(id, isUnique = false) {
    const url = `/hotels/${id}${isUnique ? '?unique=true' : ''}`;
    const response = await apiFetch(url);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les détails de l'hôtel");
    }

    return response.json();
}

export async function createHotel(hotelData) {
    const response = await apiFetch("/hotels", {
        method: "POST",
        body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
        throw new Error("Impossible de créer l'hôtel");
    }

    return response.json();
}

export async function updateHotel(id, hotelData) {
    const response = await apiFetch(`/hotels/${id}`, {
        method: "PUT",
        body: JSON.stringify(hotelData)
    });

    if (!response.ok) {
        throw new Error("Impossible de mettre à jour l'hôtel");
    }

    return response.json();
}

export async function deleteHotel(id) {
    const response = await apiFetch(`/hotels/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Impossible de supprimer l'hôtel");
    }

    return response.json();
}

export async function getHotelRooms(id) {
    const response = await apiFetch(`/hotels/${id}/rooms`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les chambres de l'hôtel");
    }

    return response.json();
}

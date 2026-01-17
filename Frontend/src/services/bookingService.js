import API_URL from "../api";

export async function createBooking(bookingData) {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Vous devez être connecté pour réserver.");
    }

    const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la réservation");
    }

    return data;
}

export async function getUserBookings() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Non connecté");
    }

    const response = await fetch(`${API_URL}/bookings`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Impossible de récupérer vos réservations");
    }

    return response.json();
}

export async function getAllBookings() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Non connecté");
    }

    const response = await fetch(`${API_URL}/bookings/admin/all`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Impossible de récupérer toutes les réservations");
    }

    return response.json();
}

import { apiFetch } from "./apiClient";

export async function createBooking(bookingData) {
    const response = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la réservation");
    }

    return data;
}

export async function getUserBookings() {
    const response = await apiFetch("/bookings");

    if (!response.ok) {
        throw new Error("Impossible de récupérer vos réservations");
    }

    return response.json();
}

export async function getOwnerBookings() {
    const response = await apiFetch("/bookings/owner/all");

    if (!response.ok) {
        throw new Error("Impossible de récupérer les réservations des propriétés");
    }

    return response.json();
}

export async function getAllBookings() {
    const response = await apiFetch("/bookings/admin/all");

    if (!response.ok) {
        throw new Error("Impossible de récupérer toutes les réservations");
    }

    return response.json();
}

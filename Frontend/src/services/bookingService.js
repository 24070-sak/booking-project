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

export async function getBooking(bookingId) {
    const response = await apiFetch(`/bookings/${bookingId}`);
    if (!response.ok) throw new Error("Réservation introuvable");
    return response.json();
}

export async function processPayment(bookingId, paymentData) {
    const response = await apiFetch(`/bookings/${bookingId}/payment`, {
        method: "POST",
        body: JSON.stringify(paymentData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Échec du paiement");
    return data;
}

export async function submitLocalPayment(formData) {
    const response = await apiFetch("/payments/submit-local", {
        method: "POST",
        body: formData // multipart/form-data
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Échec de la soumission");
    return data;
}

export async function getPendingPayments() {
    const response = await apiFetch("/payments/pending");
    if (!response.ok) throw new Error("Impossible de récupérer les paiements en attente");
    return response.json();
}

export async function verifyPayment(paymentId, action) {
    const response = await apiFetch(`/payments/${paymentId}/verify`, {
        method: "POST",
        body: JSON.stringify({ action })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Échec de la vérification");
    return data;
}

export async function confirmBooking(bookingId) {
    const response = await apiFetch(`/bookings/${bookingId}/confirm`, {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Impossible d'accepter");
    return data;
}

export async function rejectBooking(bookingId) {
    const response = await apiFetch(`/bookings/${bookingId}/reject`, {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Impossible de refuser");
    return data;
}

export async function cancelBooking(bookingId) {
    const response = await apiFetch(`/bookings/${bookingId}/cancel`, {
        method: "POST"
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Impossible d'annuler");
    return data;
}

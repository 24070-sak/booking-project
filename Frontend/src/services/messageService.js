import { apiFetch } from "./apiClient";

export async function getMessages() {
    const response = await apiFetch("/messages");
    if (!response.ok) throw new Error("Erreur lors de la récupération des messages");
    return response.json();
}

export async function sendMessage(messageData) {
    const response = await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error("Erreur lors de l'envoi du message");
    return response.json();
}

export async function markAsRead(messageId) {
    const response = await apiFetch(`/messages/${messageId}/read`, {
        method: "PUT"
    });
    if (!response.ok) throw new Error("Erreur lors du marquage comme lu");
    return response.json();
}

export async function searchUsers(query) {
    const response = await apiFetch(`/messages/search-users?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Erreur lors de la recherche d'utilisateurs");
    return response.json();
}

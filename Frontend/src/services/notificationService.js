import { apiFetch } from "./apiClient";

export async function getNotifications() {
    const response = await apiFetch("/notifications");
    if (!response.ok) throw new Error("Impossible de récupérer les notifications");
    return response.json();
}

export async function markAsRead(notificationId) {
    const response = await apiFetch(`/notifications/${notificationId}/read`, {
        method: "POST"
    });
    if (!response.ok) throw new Error("Impossible de marquer comme lu");
    return response.json();
}

export async function markAllAsRead() {
    const response = await apiFetch("/notifications/read-all", {
        method: "POST"
    });
    if (!response.ok) throw new Error("Impossible de marquer tout comme lu");
    return response.json();
}

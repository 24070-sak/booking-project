const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getMessages() {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/messages`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Erreur lors de la récupération des messages");
    return response.json();
}

export async function sendMessage(messageData) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error("Erreur lors de l'envoi du message");
    return response.json();
}

export async function markAsRead(messageId) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error("Erreur lors du marquage comme lu");
    return response.json();
}

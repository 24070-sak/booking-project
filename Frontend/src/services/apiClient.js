const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Enhanced fetch wrapper that handles auth headers and 401 redirects
 */
export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    // Default headers
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    // Remove Content-Type if body is FormData (let browser set it with boundary)
    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    // Add Authorization header if token exists and is valid
    if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Default configuration
    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 401 Unauthorized (Session Expired / Invalid Token)
        if (response.status === 401 && !options.skipRedirect) {
            console.warn("Session expired (401). Redirecting to login...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/connexion";
            return Promise.reject(new Error("Session expired"));
        }

        return response;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

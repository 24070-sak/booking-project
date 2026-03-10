/**
 * Resolves a URL to be used as an image source.
 * If the URL is relative (starts with /static), it prefixes it with the backend base URL.
 * Otherwise, it returns the URL as is.
 */
export const resolveImageUrl = (url) => {
    if (!url) return null;
    
    // If it's already an absolute URL (http/https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // Get backend base URL from environment variables
    // VITE_API_URL is usually something like http://localhost:5000/api
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
    
    // Ensure the relative path starts with /
    const relativePath = url.startsWith('/') ? url : `/${url}`;
    
    return `${BASE_URL}${relativePath}`;
};

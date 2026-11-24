const API_URL = '/api';
const TOKEN_KEY = 'dos-bros-token';

export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
    const headers = { ...options.headers };
    if (options.body) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch {
        throw new Error('No se pudo conectar con la API. Revisá que el backend esté iniciado.');
    }

    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success === false) {
        throw new Error(result?.message || 'No se pudo completar la operación.');
    }

    return result?.data;
}

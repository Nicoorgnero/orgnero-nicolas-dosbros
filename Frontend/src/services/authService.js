import { request, clearAuthToken, getAuthToken, setAuthToken } from './api.js';

function saveSession(session) {
    setAuthToken(session.token);
    return session.usuario;
}

export async function getSetupStatus() {
    return request('/setup/estado');
}

export async function setupAdministrator(data) {
    const session = await request('/setup/administrador', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return saveSession(session);
}

export async function registerCustomer(data) {
    const session = await request('/auth/registro', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return saveSession(session);
}

export async function login(data) {
    const session = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return saveSession(session);
}

export async function getCurrentUser() {
    if (!getAuthToken()) {
        return null;
    }

    try {
        return await request('/auth/yo');
    } catch {
        clearAuthToken();
        return null;
    }
}

export async function logout() {
    try {
        await request('/auth/logout', { method: 'POST' });
    } finally {
        clearAuthToken();
    }
}

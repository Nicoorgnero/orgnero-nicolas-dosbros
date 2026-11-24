import { request } from './api.js';

export function getBusinessInfo() {
    return request('/negocio');
}

export function getServices() {
    return request('/servicios');
}

export function getAdminServices() {
    return request('/servicios/administracion');
}

export function createService(service) {
    return request('/servicios', {
        method: 'POST',
        body: JSON.stringify(service)
    });
}

export function updateService(id, service) {
    return request(`/servicios/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(service)
    });
}

export function deactivateService(id) {
    return request(`/servicios/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getBarbers() {
    return request('/barberos');
}

export function getAdminBarbers() {
    return request('/barberos/administracion');
}

export function createBarber(barber) {
    return request('/barberos', {
        method: 'POST',
        body: JSON.stringify(barber)
    });
}

export function updateBarber(id, barber) {
    return request(`/barberos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(barber)
    });
}

export function deactivateBarber(id) {
    return request(`/barberos/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

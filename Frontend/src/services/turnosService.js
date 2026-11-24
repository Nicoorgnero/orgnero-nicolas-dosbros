import { request } from './api.js';

export function getTurnos() {
    return request('/turnos');
}

export function getTurno(id) {
    return request(`/turnos/${encodeURIComponent(id)}`);
}

export function getDisponibilidad({ fecha, servicioId, barberoId, turnoId }) {
    const params = new URLSearchParams({ fecha, servicioId, barberoId });
    if (turnoId) {
        params.set('turnoId', turnoId);
    }
    return request(`/turnos/disponibilidad?${params.toString()}`);
}

export function createTurno(turno) {
    return request('/turnos', {
        method: 'POST',
        body: JSON.stringify(turno)
    });
}

export function updateTurno(id, turno) {
    return request(`/turnos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(turno)
    });
}

export function cancelTurno(id) {
    return request(`/turnos/${encodeURIComponent(id)}/cancelar`, {
        method: 'PATCH'
    });
}

export function changeTurnoStatus(id, estado) {
    return request(`/turnos/${encodeURIComponent(id)}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
    });
}

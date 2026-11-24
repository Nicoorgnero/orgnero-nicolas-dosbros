export const initialServices = [
    {
        id: 'servicio-low-fade',
        nombre: 'Low fade',
        descripcion: '',
        duracionMinutos: null,
        precio: null,
        activo: false
    },
    {
        id: 'servicio-taper-fade',
        nombre: 'Taper fade',
        descripcion: '',
        duracionMinutos: null,
        precio: null,
        activo: false
    },
    {
        id: 'servicio-tintura',
        nombre: 'Tintura',
        descripcion: '',
        duracionMinutos: null,
        precio: null,
        activo: false
    }
];

export function createInitialData() {
    return {
        usuarios: [],
        clientes: [],
        barberos: [],
        turnos: [],
        servicios: structuredClone(initialServices)
    };
}

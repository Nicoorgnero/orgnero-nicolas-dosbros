const editableStates = ['Pendiente', 'Confirmado'];

export function canChangeTurno(turno) {
    const fecha = new Date(turno.fechaHoraInicio);

    return editableStates.includes(turno.estado)
        && !Number.isNaN(fecha.getTime())
        && fecha > new Date();
}

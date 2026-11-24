class Turno {
    constructor(
        id,
        fechaHoraInicio,
        estado,
        clienteId,
        barberoId,
        servicioId,
        observaciones,
        duracionMinutos,
        servicioNombre
    ) {
        this.id = id;
        this.fechaHoraInicio = fechaHoraInicio;
        this.estado = estado;
        this.clienteId = clienteId;
        this.barberoId = barberoId;
        this.servicioId = servicioId;
        this.observaciones = observaciones;
        this.duracionMinutos = duracionMinutos;
        this.servicioNombre = servicioNombre;
    }
}

export default Turno;
